import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as argon2 from 'argon2';
import { DataSource, QueryFailedError, Repository } from 'typeorm';
import { RolUsuario } from '../common/enums/rol-usuario.enum';
import { Adoptante } from '../usuarios/entities/adoptante.entity';
import { Fundacion } from '../usuarios/entities/fundacion.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { AuthRulesService } from './auth-rules.service';
import { RegistroAdoptanteDto } from './dto/registro-adoptante.dto';
import { RegistroFundacionDto } from './dto/registro-fundacion.dto';
import { UsuarioPublico } from './usuario-publico.interface';

// Código de PostgreSQL para "violación de una restricción UNIQUE".
const UNIQUE_VIOLATION = '23505';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    private readonly dataSource: DataSource,
    private readonly authRulesService: AuthRulesService,
  ) {}

  async registrarAdoptante(dto: RegistroAdoptanteDto): Promise<UsuarioPublico> {
    const { email, passwordHash } = await this.prepararRegistro(
      dto.email,
      dto.password,
    );

    try {
      // Usuario y Adoptante se guardan juntos: si falla uno, no queda ninguno.
      return await this.dataSource.transaction(async (manager) => {
        const usuario = await manager.save(
          manager.create(Usuario, {
            nombre: dto.nombre,
            email,
            passwordHash,
            rol: RolUsuario.ADOPTANTE,
          }),
        );
        await manager.save(
          manager.create(Adoptante, {
            usuarioId: usuario.id,
            telefono: dto.telefono,
            direccion: dto.direccion,
            experienciaPrevia: dto.experienciaPrevia ?? null,
          }),
        );
        return this.aUsuarioPublico(usuario);
      });
    } catch (error) {
      if (this.esEmailDuplicado(error)) {
        throw new ConflictException('El email ya está registrado');
      }
      throw error;
    }
  }

  async registrarFundacion(dto: RegistroFundacionDto): Promise<UsuarioPublico> {
    const { email, passwordHash } = await this.prepararRegistro(
      dto.email,
      dto.password,
    );

    try {
      // Usuario y Fundacion se guardan juntos: si falla uno, no queda ninguno.
      return await this.dataSource.transaction(async (manager) => {
        const usuario = await manager.save(
          manager.create(Usuario, {
            nombre: dto.nombre,
            email,
            passwordHash,
            rol: RolUsuario.FUNDACION,
          }),
        );
        await manager.save(
          manager.create(Fundacion, {
            usuarioId: usuario.id,
            nombrePublico: dto.nombrePublico,
            descripcion: dto.descripcion,
            ciudad: dto.ciudad,
            telefonoContacto: dto.telefonoContacto,
          }),
        );
        return this.aUsuarioPublico(usuario);
      });
    } catch (error) {
      if (this.esEmailDuplicado(error)) {
        throw new ConflictException('El email ya está registrado');
      }
      throw error;
    }
  }

  // Normaliza el email, comprueba que esté libre (409) y calcula el hash.
  private async prepararRegistro(emailRecibido: string, password: string) {
    const email = emailRecibido.trim().toLowerCase();
    const existente = await this.usuarioRepository.findOne({
      where: { email },
    });
    this.authRulesService.ensureEmailDisponible(existente);
    const passwordHash = await argon2.hash(password);
    return { email, passwordHash };
  }

  // Solo devuelve los datos públicos: nunca passwordHash.
  private aUsuarioPublico(usuario: Usuario): UsuarioPublico {
    return {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
    };
  }

  // Dos registros simultáneos con el mismo email: los dos pasan la regla,
  // pero el UNIQUE de PostgreSQL rechaza el segundo. Solo ese caso es 409.
  private esEmailDuplicado(error: unknown): boolean {
    return (
      error instanceof QueryFailedError &&
      (error.driverError as { code?: string }).code === UNIQUE_VIOLATION
    );
  }
}
