import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product, ProductImage } from './entities';
import { DataSource, Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { User } from '../auth/entities/user.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { UpdateProductDto } from './dto/update-product.dto';

describe('ProductService', () => {
  let service: ProductsService;
  let productRepository: Repository<Product>;
  let productImageRepository: Repository<ProductImage>;

  let mockQueryRuner: {
    connect: jest.Mock;
    startTransaction: jest.Mock;
    manager: {
      delete: jest.Mock;
      save: jest.Mock;
    };
    commitTransaction: jest.Mock;
    release: jest.Mock;
    rollbackTransaction: jest.Mock;
  };

  beforeEach(async () => {
    mockQueryRuner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      manager: {
        delete: jest.fn(),
        save: jest.fn(),
      },
      commitTransaction: jest.fn(),
      release: jest.fn(),
      rollbackTransaction: jest.fn(),
    };

    const mockQueryBuilder = {
      where: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue({
        id: 'UUID_VALID',
        title: 'Test Product',
        slug: 'test-product',
        images: [
          {
            id: '1',
            url: 'image1.jpg',
          },
        ],
      }),
    };

    const mockProductRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      count: jest.fn(),
      findOneBy: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
      findOne: jest.fn(),
      preload: jest.fn(),
      remove: jest.fn(),
    };

    const mockProductImageRepository = {
      save: jest.fn(),
      create: jest.fn(),
    };

    const mockDataSource = {
      createQueryRunner: jest.fn().mockReturnValue(mockQueryRuner),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductRepository,
        },
        {
          provide: getRepositoryToken(ProductImage),
          useValue: mockProductImageRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    productRepository = module.get<Repository<Product>>(
      getRepositoryToken(Product),
    );
    productImageRepository = module.get<Repository<ProductImage>>(
      getRepositoryToken(ProductImage),
    );
  });

  it('should be defined', async () => {
    expect(service).toBeDefined();
  });

  it('should create a product', async () => {
    const dto = {
      title: 'Test Product',
      price: 100,
      images: ['image1.jpg', 'image2.jpg'],
    } as CreateProductDto;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { images: dtoWithNoImages, ...createdto } = dto;

    const user = {
      id: '1',
      email: 'test@google.com',
    } as User;

    const product = {
      id: '1',
      ...createdto,
      user,
    } as unknown as Product;

    jest.spyOn(productRepository, 'create').mockReturnValue(product);
    jest.spyOn(productRepository, 'save').mockResolvedValue(product);
    jest
      .spyOn(productImageRepository, 'create')
      .mockImplementation((imageData) => imageData as unknown as ProductImage);

    const result = await service.create(dto, user);

    expect(result).toEqual({
      id: '1',
      title: 'Test Product',
      price: 100,
      user: { id: '1', email: 'test@google.com' },
      images: ['image1.jpg', 'image2.jpg'],
    });
  });

  it('should throw a BadRequestException if create product fails', async () => {
    const dto = {} as CreateProductDto;

    const user = {} as User;

    const error = {
      code: '23505',
      detail: 'Product already exists',
    };

    jest.spyOn(productRepository, 'save').mockRejectedValue(error);

    await expect(service.create(dto, user)).rejects.toThrow(
      BadRequestException,
    );

    await expect(service.create(dto, user)).rejects.toThrow(error.detail);
  });

  it('should find all products', async () => {
    const productsImages = [
      { id: 1, url: 'image1.jpg' },
      { id: 2, url: 'image2.jpg' },
    ] as ProductImage[];
    const products = [
      { id: '1', title: 'Product 1', images: productsImages },
      { id: '2', title: 'Product 2', images: productsImages },
    ] as Product[];

    const paginationDto = { limit: 10, offset: 0 } as unknown as PaginationDto;

    jest.spyOn(productRepository, 'find').mockResolvedValue(products);
    jest.spyOn(productRepository, 'count').mockResolvedValue(products.length);

    const result = await service.findAll(paginationDto);

    expect(result).toEqual({
      count: 2,
      pages: 1,
      products: products.map((product) => ({
        ...product,
        images: product.images.map((img) => img.url),
      })),
    });
  });

  it('should find a product by valid ID', async () => {
    const productId = 'cd533345-f1f3-48c9-a62e-7dc2da50c8f8';
    const product = {
      id: productId,
      title: 'Test Product',
    } as Product;

    jest.spyOn(productRepository, 'findOneBy').mockResolvedValue(product);

    const result = await service.findOne(productId);

    expect(result).toEqual(product);
  });

  it('should throw an error if id was not found', async () => {
    const productId = 'cd533345-f1f3-48c9-a62e-7dc2da50c8f8';

    jest.spyOn(productRepository, 'findOneBy').mockResolvedValue(null);

    await expect(service.findOne(productId)).rejects.toThrow(NotFoundException);
    await expect(service.findOne(productId)).rejects.toThrow(
      `Product with ${productId} not found`,
    );
  });

  it('should return product by term of slug', async () => {
    const restult = await service.findOne('t_shirt_teslo');
    expect(restult).toEqual({
      id: 'UUID_VALID',
      title: 'Test Product',
      slug: 'test-product',
      images: [{ id: '1', url: 'image1.jpg' }],
    });
  });

  it('should throw NotFoundException if product not found', async () => {
    const id = 'non-existing-id';
    const productDto = {} as UpdateProductDto;
    const user = {} as User;
    jest.spyOn(productRepository, 'preload').mockResolvedValue(null);
    await expect(service.update(id, productDto, user)).rejects.toThrow(
      new NotFoundException(`Product with id: ${id} not found`),
    );
  });

  it('should update product successfully', async () => {
    const id = 'ABC';
    const productDto = {
      title: 'Updated Product',
      slug: 'updated-product',
    } as UpdateProductDto;
    const user = {
      id: '1',
      fullName: 'Test User',
    } as User;

    const product = {
      ...productDto,
      price: 100,
      description: 'Updated description',
    } as unknown as Product;

    jest.spyOn(productRepository, 'preload').mockResolvedValue(product);

    const updatedProduct = await service.update(id, productDto, user);

    expect(updatedProduct).toEqual({
      id: 'UUID_VALID',
      title: 'Test Product',
      slug: 'test-product',
      images: ['image1.jpg'],
    });
  });

  it('should update and commit transaction', async () => {
    const id = 'ABC';
    const productDto = {
      title: 'Updated Product',
      slug: 'updated-product',
      images: [{ id: 1, url: 'image1.jpg' }],
    } as unknown as UpdateProductDto;
    const user = {
      id: '1',
      fullName: 'Test User',
    } as User;

    const product = {
      ...productDto,
      price: 100,
      description: 'Updated description',
    } as unknown as Product;

    jest.spyOn(productRepository, 'preload').mockResolvedValue(product);

    await service.update(id, productDto, user);

    expect(mockQueryRuner.connect).toHaveBeenCalled();
    expect(mockQueryRuner.startTransaction).toHaveBeenCalled();
    expect(mockQueryRuner.manager.delete).toHaveBeenCalled();
    expect(mockQueryRuner.commitTransaction).toHaveBeenCalled();
    expect(mockQueryRuner.release).toHaveBeenCalled();
  });

  it('should throw error if transaction fails and call handleDBExceptions', async () => {
    const id = 'ABC';
    const productDto = {
      title: 'Updated Product',
      slug: 'updated-product',
      images: ['image1.jpg'],
    } as UpdateProductDto;
    const user = {
      id: '1',
      fullName: 'Test User',
    } as User;

    const product = {
      ...productDto,
      price: 100,
      description: 'Updated description',
    } as unknown as Product;

    const error = new Error('Transaction failed');

    jest.spyOn(productRepository, 'preload').mockResolvedValue(product);
    mockQueryRuner.manager.save.mockRejectedValue(error);

    const handleDBExceptionsSpy = jest
      .spyOn(service as any, 'handleDBExceptions')
      .mockImplementation(() => {
        throw error;
      });

    await expect(service.update(id, productDto, user)).rejects.toThrow(error);

    expect(mockQueryRuner.connect).toHaveBeenCalled();
    expect(mockQueryRuner.startTransaction).toHaveBeenCalled();
    expect(mockQueryRuner.rollbackTransaction).toHaveBeenCalled();
    expect(mockQueryRuner.release).toHaveBeenCalled();
    expect(handleDBExceptionsSpy).toHaveBeenCalledWith(error);
  });

  it('should remove a product', async () => {
    const productId = 'some-uuid';
    const product = { id: productId, title: 'Test Product' } as Product;

    jest.spyOn(service, 'findOne').mockResolvedValue(product);
    jest.spyOn(productRepository, 'remove').mockResolvedValue(product);

    await service.remove(productId);

    expect(service.findOne).toHaveBeenCalledWith(productId);
    expect(productRepository.remove).toHaveBeenCalledWith(product);
  });

  it('should handle exception when removing a product that does not exist', async () => {
    const productId = 'non-existent-uuid';
    const notFoundError = new NotFoundException(
      `Product with ${productId} not found`,
    );

    jest.spyOn(service, 'findOne').mockRejectedValue(notFoundError);

    await expect(service.remove(productId)).rejects.toThrow(NotFoundException);
  });
});
