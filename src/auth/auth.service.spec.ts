import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { CreateUserDto, LoginUserDto } from './dto';

import * as bcrypt from 'bcrypt';
import {
  BadRequestException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';

describe('AuthService', () => {
  let authService: AuthService;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const mockUserRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
    };

    const mockJwtService = {
      sign: jest.fn().mockReturnValue('mocked.jwt.token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', async () => {
    expect(authService).toBeDefined();
  });

  it('should create user and return user with token', async () => {
    const createUserDto: CreateUserDto = {
      email: 'test@gmail.com',
      password: 'Test1234',
      fullName: 'Test User',
    };

    const user = {
      email: createUserDto.email,
      fullName: createUserDto.fullName,
      id: 'some-uuid',
      isActive: true,
      roles: ['user'],
    } as User;

    jest.spyOn(userRepository, 'create').mockReturnValue(user);
    jest.spyOn(bcrypt, 'hashSync').mockReturnValue('hashed-password');

    const result = await authService.create(createUserDto);

    expect(bcrypt.hashSync).toHaveBeenCalledWith(createUserDto.password, 10);

    expect(result).toEqual({
      user: { ...user },
      token: 'mocked.jwt.token',
    });
  });

  it('should thrown an error if email alredy exist', async () => {
    const createUserDto: CreateUserDto = {
      email: 'test@gmail.com',
      password: 'Test1234',
      fullName: 'Test User',
    };

    jest.spyOn(userRepository, 'save').mockRejectedValue({
      code: '23505', // Unique constraint violation
      detail: 'Email already exists',
    });

    await expect(authService.create(createUserDto)).rejects.toThrow(
      BadRequestException,
    );
    await expect(authService.create(createUserDto)).rejects.toThrow(
      'Email already exists',
    );
  });

  it('should throw an internal server error', async () => {
    const createUserDto: CreateUserDto = {
      email: 'test@gmail.com',
      password: 'Test1234',
      fullName: 'Test User',
    };
    const error = new Error('Some other error');

    jest.spyOn(userRepository, 'save').mockRejectedValue(error);

    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    await expect(authService.create(createUserDto)).rejects.toThrow(
      InternalServerErrorException,
    );
    await expect(authService.create(createUserDto)).rejects.toThrow(
      'Please check server logs',
    );
    expect(console.log).toHaveBeenCalledWith(error);

    logSpy.mockRestore();
  });

  it('should login and return token', async () => {
    const dto: LoginUserDto = {
      email: 'test@gmail.com',
      password: 'Test1234',
    };

    const user = {
      ...dto,
      isActive: true,
      roles: ['user'],
      fullName: 'Test User',
    } as User;

    jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
    jest.spyOn(bcrypt, 'compareSync').mockReturnValue(true);

    const result = await authService.login(dto);

    expect(result).toEqual({
      user: { ...user, password: undefined },
      token: 'mocked.jwt.token',
    });
    expect(result.user.password).toBeUndefined();
  });

  it('should throw UnauthorizedException if the user does not exists', async () => {
    const dto: LoginUserDto = {
      email: 'test@gmail.com',
      password: 'Test1234',
    };

    jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

    await expect(authService.login(dto)).rejects.toThrow(
      'Credentials are not valid (email)',
    );
    await expect(authService.login(dto)).rejects.toThrow(UnauthorizedException);
  });

  it('should UnauthorizedException if the password does not match', async () => {
    const dto: LoginUserDto = {
      email: 'test@gmail.com',
      password: 'Test1234',
    };

    const user = {
      ...dto,
      isActive: true,
      roles: ['user'],
      fullName: 'Test User',
    } as User;

    jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
    jest.spyOn(bcrypt, 'compareSync').mockReturnValue(false);

    await expect(authService.login(dto)).rejects.toThrow(
      'Credentials are not valid (password)',
    );
    await expect(authService.login(dto)).rejects.toThrow(UnauthorizedException);
  });

  it('should check status and return user with new token', async () => {
    const user = {
      id: 'some-uuid',
      email: 'test@gmail.com',
      fullName: 'Test User',
      isActive: true,
      roles: ['user'],
    } as User;

    const result = await authService.checkAuthStatus(user);
    expect(result).toEqual({
      user: { ...user, password: undefined },
      token: 'mocked.jwt.token',
    });
  });
});
