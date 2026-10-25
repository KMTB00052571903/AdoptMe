import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as argon2 from 'argon2';
import { DataSource, QueryFailedError, Repository } from 'typeorm';
import { RolUsuario } from '../common/enums/rol-usuario.enum';
import { Adoptante } from '../usuarios/entities/adoptante.entity';
import { Fundacion } from '../usuarios/entities/fundacion.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { AuthRulesService } from './auth-rules.service';
import { LoginDto } from './dto/login.dto';
import { RegistroAdoptanteDto } from './dto/registro-adoptante.dto';
import { RegistroFundacionDto } from './dto/registro-fundacion.dto';
import { JwtPayload } from './jwt-payload.interface';
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
    private readonly jwtService: JwtService,
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

  async login(dto: LoginDto): Promise<{ accessToken: string }> {
    const usuario = await this.usuarioRepository.findOne({
      where: { email: this.normalizarEmail(dto.email) },
      // passwordHash tiene select: false, así que hay que pedirlo explícitamente.
      select: { id: true, email: true, rol: true, passwordHash: true },
    });
    const passwordValida =
      usuario !== null &&
      (await argon2.verify(usuario.passwordHash, dto.password));

    // Mismo 401 y mismo mensaje en los dos casos: no se revela qué falló.
    if (!usuario || !passwordValida) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload: JwtPayload = {
      sub: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
    };
    return { accessToken: await this.jwtService.signAsync(payload) };
  }

  // Misma regla en registro y login: 'Kami@Mail.com' = 'kami@mail.com'.
  private normalizarEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  // Normaliza el email, comprueba que esté libre (409) y calcula el hash.
  private async prepararRegistro(emailRecibido: string, password: string) {
    const email = this.normalizarEmail(emailRecibido);
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
