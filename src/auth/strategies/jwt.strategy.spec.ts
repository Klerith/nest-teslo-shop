import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';
import { User } from '../entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { UnauthorizedException } from '@nestjs/common';

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const mockUserRepository = {
      findOneBy: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn().mockReturnValue('secretKey'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', async () => {
    expect(jwtStrategy).toBeDefined();
  });

  it('should validate and return user if user exists and is active', async () => {
    const payload = { id: '123' };
    const mockUser = { id: '123', isActive: true } as User;

    jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(mockUser);

    const user = await jwtStrategy.validate(payload);

    expect(user).toEqual(mockUser);
    expect(userRepository.findOneBy).toHaveBeenCalledWith({ id: payload.id });
  });

  it('should throw UnauthorizedException if user does not exist', async () => {
    const payload = { id: '123' };

    jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(null);
    expect(jwtStrategy.validate(payload)).rejects.toThrow(
      UnauthorizedException,
    );
    expect(jwtStrategy.validate(payload)).rejects.toThrow('Token not valid');
  });

  it('should throw exception if user is not vlaid', async () => {
    const payload = { id: '123' };
    const mockUser = { id: '123', isActive: false } as User;

    jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(mockUser);

    expect(jwtStrategy.validate(payload)).rejects.toThrow(
      UnauthorizedException,
    );
    expect(jwtStrategy.validate(payload)).rejects.toThrow(
      'User is inactive, talk with an admin',
    );
  });
});
