import { BadRequestException } from '@nestjs/common';
import { requestValidationPipe } from '../../common/request-validation.pipe';
import { ResponderCheckpointDto } from './responder-checkpoint.dto';

// Ejecuta el pipe real igual que lo hace Nest con @Body(requestValidationPipe).
function validarBody(body: object): Promise<unknown> {
  return requestValidationPipe.transform(body, {
    type: 'body',
    metatype: ResponderCheckpointDto,
  });
}

describe('ResponderCheckpointDto', () => {
  const respuestaValida = {
    comentario: 'Luna está feliz y come bien.',
    fotoUrl: 'https://ejemplo.com/luna.jpg',
  };

  it('accepts a comment with a photo URL', async () => {
    await expect(validarBody(respuestaValida)).resolves.toBeInstanceOf(
      ResponderCheckpointDto,
    );
  });

  it('accepts a comment without a photo', async () => {
    await expect(
      validarBody({ comentario: respuestaValida.comentario }),
    ).resolves.toBeInstanceOf(ResponderCheckpointDto);
  });

  it('rejects a missing comment', async () => {
    await expect(
      validarBody({ fotoUrl: respuestaValida.fotoUrl }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects an empty comment', async () => {
    await expect(
      validarBody({ ...respuestaValida, comentario: '' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects fotoUrl when it is not text', async () => {
    await expect(
      validarBody({ ...respuestaValida, fotoUrl: 123 }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects fields the client must not control (estado)', async () => {
    await expect(
      validarBody({ ...respuestaValida, estado: 'respondido' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
