import { Module } from '@nestjs/common';

import { ProductsModule } from './../products/products.module';

import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';

@Module({
  controllers: [SeedController],
  providers: [SeedService],
  imports: [
    ProductsModule
  ]
})
export class SeedModule {}
