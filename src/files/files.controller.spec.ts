import { Test, TestingModule } from '@nestjs/testing';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { BadRequestException } from '@nestjs/common';

describe('Files controller', () => {
  let controller: FilesController;
  let service: FilesService;

  beforeEach(async () => {
    const mockFilesService = {
      getStaticProductImage: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn().mockReturnValue('http://localhost:3000'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: FilesService,
          useValue: mockFilesService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
      controllers: [FilesController],
    }).compile();

    controller = module.get<FilesController>(FilesController);
    service = module.get<FilesService>(FilesService);
  });

  it('should be defined', async () => {
    expect(controller).toBeDefined();
  });

  it('should return file path when its called', async () => {
    const mockResponse = { sendFile: jest.fn() } as unknown as Response;
    const fileName = 'test-image.jpg';
    const filePath = `/static/products/${fileName}`;

    jest.spyOn(service, 'getStaticProductImage').mockReturnValue(filePath);

    controller.findProductImage(mockResponse, fileName);

    expect(mockResponse.sendFile).toHaveBeenCalled();
    expect(mockResponse.sendFile).toHaveBeenCalledWith(filePath);
  });

  it('should return a secure url when uploadProduct image is called with a file', async () => {
    const file = {
      file: 'test-image.jpg',
      filename: 'testImageName.jpg',
    } as unknown as Express.Multer.File;

    const result = controller.uploadProductImage(file);

    expect(result).toEqual({
      secureUrl: 'http://localhost:3000/files/product/testImageName.jpg',
      fileName: 'testImageName.jpg',
    });
  });

  it('should throw BadRequestException if no file was provided', async () => {
    expect(() => controller.uploadProductImage(undefined)).toThrow(
      new BadRequestException('Make sure that the file is an image'),
    );
  });
});
