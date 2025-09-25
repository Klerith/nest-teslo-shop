import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto';
import { User } from './entities/user.entity';
import { Request } from 'express';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const mockAuthService = {
      create: jest.fn(),
      login: jest.fn(),
      checkAuthStatus: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', async () => {
    expect(authController).toBeDefined();
  });

  it('should create user with the proper dto', async () => {
    const createUserDto: CreateUserDto = {
      email: 'test@email.com',
      password: 'test',
      fullName: 'Test User',
    };

    jest.spyOn(authService, 'create');
    await authController.createUser(createUserDto);

    expect(authService.create).toHaveBeenCalledWith(createUserDto);
  });

  it('should login with the correct dto', async () => {
    const loginUserDto: LoginUserDto = {
      email: 'test',
      password: 'test',
    };

    jest.spyOn(authService, 'login');
    await authController.loginUser(loginUserDto);
    expect(authService.login).toHaveBeenCalledWith(loginUserDto);
  });

  it('should check status with the correct data', async () => {
    const user = {
      id: '1',
      email: 'test@t.com',
      fullName: 'Test User',
      password: 'test',
    } as User;
    jest.spyOn(authService, 'checkAuthStatus');
    await authController.checkAuthStatus(user);

    expect(authService.checkAuthStatus).toHaveBeenCalledWith(user);
  });

  it('should return private route data', async () => {
    const user = {
      id: '1',
      email: 'test@t.com',
      fullName: 'Test User',
      password: 'test',
    } as User;

    const request = {} as Request;

    const rawHeaders = ['header1', 'header2'];

    const headers = {
      'content-type': 'application/json',
      authorization: 'Bearer token',
    };

    const result = authController.testingPrivateRoute(
      request,
      user,
      user.email,
      rawHeaders,
      headers,
    );

    expect(result).toEqual({
      ok: true,
      message: 'Hola Mundo Private',
      user,
      userEmail: user.email,
      rawHeaders,
      headers,
    });
  });
});
