import { BadRequestException, Type } from '@nestjs/common';
import { requestValidationPipe } from '../../common/request-validation.pipe';
import { LoginDto } from './login.dto';
import { RegistroAdoptanteDto } from './registro-adoptante.dto';
import { RegistroFundacionDto } from './registro-fundacion.dto';

// Ejecuta el pipe real igual que lo hace Nest con @Body(requestValidationPipe).
function validarBody(body: object, dto: Type<unknown>): Promise<unknown> {
  return requestValidationPipe.transform(body, {
    type: 'body',
    metatype: dto,
  });
}

describe('LoginDto', () => {
  const loginValido = { email: 'kami@mail.com', password: 'clave123' };

  it('accepts a valid login', async () => {
    const result = await validarBody(loginValido, LoginDto);

    expect(result).toBeInstanceOf(LoginDto);
  });

  it('rejects an invalid email', async () => {
    const body = { ...loginValido, email: 'kami.com' };

    await expect(validarBody(body, LoginDto)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('rejects an empty password', async () => {
    const body = { ...loginValido, password: '' };

    await expect(validarBody(body, LoginDto)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('rejects a property that is not in the DTO', async () => {
    const body = { ...loginValido, rol: 'fundacion' };

    await expect(validarBody(body, LoginDto)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('does not apply the 8-14 registration rule (15 characters pass to the service)', async () => {
    const body = { ...loginValido, password: '123456789012345' };

    await expect(validarBody(body, LoginDto)).resolves.toBeInstanceOf(LoginDto);
  });

  it('rejects a password longer than 128 characters', async () => {
    const body = { ...loginValido, password: 'a'.repeat(129) };

    await expect(validarBody(body, LoginDto)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});

describe('RegistroAdoptanteDto', () => {
  const adoptanteValido = {
    nombre: 'Kami',
    email: 'kami@mail.com',
    password: 'clave123',
    telefono: '3001234567',
    direccion: 'Calle 1 # 2-3',
  };

  it('accepts a valid adopter without experienciaPrevia', async () => {
    const result = await validarBody(adoptanteValido, RegistroAdoptanteDto);

    expect(result).toBeInstanceOf(RegistroAdoptanteDto);
  });

  it('accepts passwords of exactly 8 and 14 characters', async () => {
    const con8 = { ...adoptanteValido, password: '12345678' };
    const con14 = { ...adoptanteValido, password: '12345678901234' };

    await expect(
      validarBody(con8, RegistroAdoptanteDto),
    ).resolves.toBeInstanceOf(RegistroAdoptanteDto);
    await expect(
      validarBody(con14, RegistroAdoptanteDto),
    ).resolves.toBeInstanceOf(RegistroAdoptanteDto);
  });

  it('rejects a password shorter than 8 characters', async () => {
    const body = { ...adoptanteValido, password: '1234567' };

    await expect(
      validarBody(body, RegistroAdoptanteDto),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects a password longer than 14 characters', async () => {
    const body = { ...adoptanteValido, password: '123456789012345' };

    await expect(
      validarBody(body, RegistroAdoptanteDto),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects a rol sent in the body', async () => {
    const body = { ...adoptanteValido, rol: 'fundacion' };

    await expect(
      validarBody(body, RegistroAdoptanteDto),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects experienciaPrevia when it is not text', async () => {
    const body = { ...adoptanteValido, experienciaPrevia: 5 };

    await expect(
      validarBody(body, RegistroAdoptanteDto),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});

describe('RegistroFundacionDto', () => {
  const fundacionValida = {
    nombre: 'Ana',
    email: 'ana@huellitas.org',
    password: 'clave123',
    nombrePublico: 'Huellitas',
    descripcion: 'Rescatamos perros y gatos.',
    ciudad: 'Cali',
    telefonoContacto: '3007654321',
  };

  it('accepts a valid foundation', async () => {
    const result = await validarBody(fundacionValida, RegistroFundacionDto);

    expect(result).toBeInstanceOf(RegistroFundacionDto);
  });

  it('rejects a missing required field (ciudad)', async () => {
    const body = { ...fundacionValida, ciudad: undefined };

    await expect(
      validarBody(body, RegistroFundacionDto),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects telefonoContacto when it is a number', async () => {
    const body = { ...fundacionValida, telefonoContacto: 3007654321 };

    await expect(
      validarBody(body, RegistroFundacionDto),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
