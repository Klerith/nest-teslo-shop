import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { ValidRoles } from '../auth/interfaces';
import { Auth } from '../auth/decorators';

import { SeedService } from './seed.service';

@ApiTags('Seed')
@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Get()
  // @Auth( ValidRoles.admin )
  @ApiOperation({
    summary: 'Destruye y crea una nueva base de datos',
    description:
      'Destruye y crea la base de datos de productos y usuarios, esto invalida también tokens existentes y usuarios creados.',
  })
  @ApiResponse({ status: 200, description: 'Seed ejecutado con éxito' })
  executeSeed() {
    return this.seedService.runSeed();
  }
}
