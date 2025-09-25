import { NestFactory } from '@nestjs/core';
import { bootstrap } from './main';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';

jest.mock('@nestjs/common', () => ({
  Logger: jest.fn().mockReturnValue({
    log: jest.fn(),
  }),
  ValidationPipe: jest.requireActual('@nestjs/common').ValidationPipe,
}));

jest.mock('@nestjs/core', () => ({
  NestFactory: {
    create: jest.fn().mockReturnValue({
      setGlobalPrefix: jest.fn(),
      enableCors: jest.fn(),
      useGlobalPipes: jest.fn(),
      listen: jest.fn(),
    }),
  },
}));

jest.mock('@nestjs/swagger', () => ({
  DocumentBuilder: jest.fn().mockReturnValue({
    setTitle: jest.fn().mockReturnThis(),
    setDescription: jest.fn().mockReturnThis(),
    setVersion: jest.fn().mockReturnThis(),
    build: jest.fn(),
  }),
  SwaggerModule: {
    createDocument: jest.fn().mockReturnValue('document'),
    setup: jest.fn(),
  },
}));

jest.mock('./app.module', () => ({
  AppModule: jest.fn().mockReturnValue('AppModule'),
}));

describe('main.ts', () => {
  let mockApp: {
    setGlobalPrefix: jest.Mock;
    enableCors: jest.Mock;
    useGlobalPipes: jest.Mock;
    listen: jest.Mock;
  };

  let mockLogger: { log: jest.Mock };

  beforeEach(() => {
    mockApp = {
      setGlobalPrefix: jest.fn(),
      enableCors: jest.fn(),
      useGlobalPipes: jest.fn(),
      listen: jest.fn(),
    };
    mockLogger = {
      log: jest.fn(),
    };

    (NestFactory.create as jest.Mock).mockResolvedValue(mockApp);
    (Logger as unknown as jest.Mock).mockReturnValue(mockLogger);
  });
  it('should create application with Appmodule', async () => {
    await bootstrap();

    expect(NestFactory.create).toHaveBeenCalledWith(AppModule);
    expect(mockLogger.log).toHaveBeenCalledWith('App running on port 3000');
  });

  it('should create the application runing on env.PORT', async () => {
    process.env.PORT = '4000';
    await bootstrap();

    expect(mockApp.listen).toHaveBeenCalledWith('4000');
    expect(mockLogger.log).toHaveBeenCalledWith('App running on port 4000');
  });

  it('should set global prfeix', async () => {
    await bootstrap();

    expect(mockApp.setGlobalPrefix).toHaveBeenCalledWith('api');
  });

  it('should use global pipes', async () => {
    await bootstrap();

    expect(mockApp.useGlobalPipes).toHaveBeenCalledWith(
      expect.objectContaining({
        errorHttpStatusCode: 400,
        validatorOptions: expect.objectContaining({
          forbidNonWhitelisted: true,
          forbidUnknownValues: false,
          whitelist: true,
        }),
      }),
    );
  });

  it('should call DocumentBuilder', async () => {
    await bootstrap();

    expect(DocumentBuilder).toHaveBeenCalled();
    expect(DocumentBuilder).toHaveBeenCalledWith();
  });

  it('should create swagger documents', async () => {
    await bootstrap();

    expect(SwaggerModule.createDocument).toHaveBeenCalled();
    expect(SwaggerModule.setup).toHaveBeenCalledWith(
      'api',
      expect.anything(),
      'document',
    );
  });
});
