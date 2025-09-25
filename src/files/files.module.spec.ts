import { Test, TestingModule } from '@nestjs/testing';
import { FilesModule } from './files.module';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';

describe('Files Module', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [FilesModule],
    }).compile();
  });

  it('should be defined', async () => {
    expect(module).toBeDefined();
  });

  it('should contain file controller and file service', () => {
    const fileService = module.get<FilesService>(FilesService);
    const fileController = module.get<FilesController>(FilesController);

    expect(fileService).toBeDefined();
    expect(fileController).toBeDefined();
  });
});
