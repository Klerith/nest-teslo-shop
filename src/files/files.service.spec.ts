import { Test, TestingModule } from '@nestjs/testing';
import { FilesService } from './files.service';
import { join } from 'path';
import { existsSync } from 'fs';
import { BadRequestException } from '@nestjs/common';

jest.mock('fs', () => ({
  existsSync: jest.fn(),
}));

describe('FilesService', () => {
  let service: FilesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FilesService],
    }).compile();

    service = module.get<FilesService>(FilesService);
  });

  it('should be defined', async () => {
    expect(service).toBeDefined();
  });

  it('should return the correct path if image exists', async () => {
    const image = 'example.jpg';
    const path = join(__dirname, '../../static/products', image);

    (existsSync as jest.Mock).mockReturnValue(true);

    const result = service.getStaticProductImage(image);

    expect(result).toBe(path);
  });

  it('should throw BadRequestException if the image is not found', async () => {
    const image = 'nonexistent.jpg';

    (existsSync as jest.Mock).mockReturnValue(false);

    expect(() => service.getStaticProductImage(image)).toThrow(
      new BadRequestException(`No product found with image ${image}`),
    );
  });
});
