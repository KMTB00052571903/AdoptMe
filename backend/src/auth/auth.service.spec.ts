import { ConflictException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as argon2 from 'argon2';
import { DataSource, QueryFailedError } from 'typeorm';
import { RolUsuario } from '../common/enums/rol-usuario.enum';
import { Adoptante } from '../usuarios/entities/adoptante.entity';
import { Fundacion } from '../usuarios/entities/fundacion.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { AuthRulesService } from './auth-rules.service';
import { AuthService } from './auth.service';

describe('AuthService (registro)', () => {
  let service: AuthService;
  let usuarioRepositoryMock: { findOne: jest.Mock };
  let managerMock: { create: jest.Mock; save: jest.Mock };
  let dataSourceMock: { transaction: jest.Mock };
  let authRulesServiceMock: { ensureEmailDisponible: jest.Mock };

  const adoptanteDto = {
    nombre: 'Kami',
    email: '  Kami@Mail.com ',
    password: 'clave123',
    telefono: '3001234567',
    direccion: 'Calle 1 # 2-3',
  };

  beforeEach(async () => {
    usuarioRepositoryMock = { findOne: jest.fn() };
    // create() devuelve los mismos datos que recibe; save() se configura en cada prueba.
    managerMock = {
      create: jest.fn((_entidad: unknown, datos: object) => datos),
      save: jest.fn(),
    };
    // transaction() ejecuta el callback con el manager simulado, como haría TypeORM.
    dataSourceMock = {
      transaction: jest.fn(
        (callback: (manager: typeof managerMock) => Promise<unknown>) =>
          callback(managerMock),
      ),
    };
    authRulesServiceMock = { ensureEmailDisponible: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(Usuario),
          useValue: usuarioRepositoryMock,
        },
        { provide: DataSource, useValue: dataSourceMock },
        { provide: AuthRulesService, useValue: authRulesServiceMock },
      ],
    }).compile();
    service = moduleRef.get(AuthService);
  });

  it('registers an adopter with a normalized email and a hashed password', async () => {
    // Arrange
    usuarioRepositoryMock.findOne.mockResolvedValue(null);
    managerMock.save
      .mockResolvedValueOnce({
        id: 'u-1',
        nombre: 'Kami',
        email: 'kami@mail.com',
        passwordHash: 'hash-guardado',
        rol: RolUsuario.ADOPTANTE,
      })
      .mockResolvedValueOnce({ id: 'a-1' });

    // Act
    const result = await service.registrarAdoptante(adoptanteDto);

    // Assert
    expect(usuarioRepositoryMock.findOne).toHaveBeenCalledWith({
      where: { email: 'kami@mail.com' },
    });
    expect(authRulesServiceMock.ensureEmailDisponible).toHaveBeenCalledWith(
      null,
    );
    expect(managerMock.create).toHaveBeenCalledWith(
      Usuario,
      expect.objectContaining({
        nombre: 'Kami',
        email: 'kami@mail.com',
        rol: RolUsuario.ADOPTANTE,
      }),
    );
    const [, datosUsuario] = managerMock.create.mock.calls[0] as [
      unknown,
      { passwordHash: string },
    ];
    expect(datosUsuario.passwordHash).not.toBe('clave123');
    await expect(
      argon2.verify(datosUsuario.passwordHash, 'clave123'),
    ).resolves.toBe(true);
    expect(managerMock.create).toHaveBeenCalledWith(Adoptante, {
      usuarioId: 'u-1',
      telefono: '3001234567',
      direccion: 'Calle 1 # 2-3',
      experienciaPrevia: null,
    });
    expect(result).toEqual({
      id: 'u-1',
      nombre: 'Kami',
      email: 'kami@mail.com',
      rol: RolUsuario.ADOPTANTE,
    });
    expect(result).not.toHaveProperty('passwordHash');
  });

  it('does not start the transaction when the email is already registered', async () => {
    // Arrange
    usuarioRepositoryMock.findOne.mockResolvedValue({ id: 'u-9' });
    authRulesServiceMock.ensureEmailDisponible.mockImplementation(() => {
      throw new ConflictException('El email ya está registrado');
    });

    // Act and Assert
    await expect(
      service.registrarAdoptante(adoptanteDto),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(dataSourceMock.transaction).not.toHaveBeenCalled();
    expect(managerMock.save).not.toHaveBeenCalled();
  });

  it('registers a foundation with rol fundacion and its profile', async () => {
    // Arrange
    usuarioRepositoryMock.findOne.mockResolvedValue(null);
    managerMock.save
      .mockResolvedValueOnce({
        id: 'u-2',
        nombre: 'Ana',
        email: 'ana@huellitas.org',
        passwordHash: 'hash-guardado',
        rol: RolUsuario.FUNDACION,
      })
      .mockResolvedValueOnce({ id: 'f-1' });

    // Act
    const result = await service.registrarFundacion({
      nombre: 'Ana',
      email: 'ana@huellitas.org',
      password: 'clave123',
      nombrePublico: 'Huellitas',
      descripcion: 'Rescatamos perros y gatos.',
      ciudad: 'Cali',
      telefonoContacto: '3007654321',
    });

    // Assert
    expect(managerMock.create).toHaveBeenCalledWith(
      Usuario,
      expect.objectContaining({ rol: RolUsuario.FUNDACION }),
    );
    expect(managerMock.create).toHaveBeenCalledWith(Fundacion, {
      usuarioId: 'u-2',
      nombrePublico: 'Huellitas',
      descripcion: 'Rescatamos perros y gatos.',
      ciudad: 'Cali',
      telefonoContacto: '3007654321',
    });
    expect(result).toEqual({
      id: 'u-2',
      nombre: 'Ana',
      email: 'ana@huellitas.org',
      rol: RolUsuario.FUNDACION,
    });
  });

  it('turns a UNIQUE violation into 409 (two registrations at the same time)', async () => {
    // Arrange
    usuarioRepositoryMock.findOne.mockResolvedValue(null);
    const duplicado = Object.assign(new Error('duplicate key'), {
      code: '23505',
    });
    managerMock.save.mockRejectedValue(
      new QueryFailedError('INSERT', [], duplicado),
    );

    // Act and Assert
    await expect(
      service.registrarAdoptante(adoptanteDto),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('rethrows other database errors without turning them into 409', async () => {
    // Arrange
    usuarioRepositoryMock.findOne.mockResolvedValue(null);
    const caida = Object.assign(new Error('connection lost'), {
      code: '08006',
    });
    managerMock.save.mockRejectedValue(
      new QueryFailedError('INSERT', [], caida),
    );

    // Act and Assert
    await expect(
      service.registrarAdoptante(adoptanteDto),
    ).rejects.toBeInstanceOf(QueryFailedError);
  });
});
