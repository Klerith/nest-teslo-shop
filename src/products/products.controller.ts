import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from './../common/dtos/pagination.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  findAll( @Query() paginationDto:PaginationDto ) {
    // console.log(paginationDto)
    return this.productsService.findAll( paginationDto );
  }

  @Get(':term')
  findOne(@Param( 'term' ) term: string) {
    return this.productsService.findOnePlain( term );
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe ) id: string, 
    @Body() updateProductDto: UpdateProductDto
  ) {
    return this.productsService.update( id, updateProductDto );
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe ) id: string) {
    return this.productsService.remove( id );
  }
}
