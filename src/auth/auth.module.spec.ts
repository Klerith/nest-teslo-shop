import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../app.module';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';

describe('AuthModule', () => {
  let module: TestingModule;
  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({
          secret: 'Test Secret',
          signOptions: { expiresIn: '60s' },
        }),
        AppModule,
      ],
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {},
        },
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: ConfigService,
          useValue: {},
        },
        {
          provide: JwtStrategy,
          useValue: {
            validate: jest.fn(),
          },
        },
      ],
    }).compile();
  });

  beforeEach(() => {
    module.close();
  });

  it('should be defined', async () => {
    expect(module).toBeDefined();
  });

  it('should have AuthService as provider', async () => {
    const authService = module.get<AuthService>(AuthService);
    expect(authService).toBeDefined();
  });

  it('should have JwtStrategy as provider', async () => {
    const jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
    expect(jwtStrategy).toBeDefined();
  });

  it('should have AuthController as controller', async () => {
    const authController = module.get<AuthController>(AuthController);
    expect(authController).toBeDefined();
  });

  it('should have PassportModule as module', async () => {
    const passportModule = module.get<PassportModule>(PassportModule);
    expect(passportModule).toBeDefined();
  });

  it('should have JwtModule as module', async () => {
    const jwtModule = module.get<JwtModule>(JwtModule);
    expect(jwtModule).toBeDefined();
  });
});
