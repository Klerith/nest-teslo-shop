import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AppModule } from '../../../src/app.module';
import { User } from '../../../src/auth/entities/user.entity';

const testingUser = {
  email: 'testing.user@google.com',
  password: 'Abc12345',
  fullName: 'Testing user',
};

describe('AuthModule Register (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();

    // TODO: obtener el userRepository del módulo - (getRepositoryToken?)
    userRepository = app.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(async () => {
    await userRepository.delete({ email: testingUser.email });
    await app.close();
  });

  it('/auth/register (POST) - no body', async () => {
    const response = await request(app.getHttpServer()).post('/auth/register');
    const errorMessages = [
      'email must be an email',
      'email must be a string',
      'The password must have a Uppercase, lowercase letter and a number',
      'password must be shorter than or equal to 50 characters',
      'password must be longer than or equal to 6 characters',
      'password must be a string',
      'fullName must be longer than or equal to 1 characters',
      'fullName must be a string',
    ];

    expect(response.status).toBe(400);
    expect(response.body.message).toEqual(
      expect.arrayContaining(errorMessages),
    );
  });

  it('/auth/register (POST) - same email', async () => {
    await request(app.getHttpServer()).post('/auth/register').send(testingUser);

    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(testingUser);

    expect(response.status).toBe(400);
    expect(response.body.message).toEqual(
      `Key (email)=(${testingUser.email}) already exists.`,
    );
  });

  it('/auth/register (POST) - unsafe password', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test@e.com',
        password: '123456',
        fullName: 'Testing user',
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toEqual(
      expect.arrayContaining([
        'The password must have a Uppercase, lowercase letter and a number',
      ]),
    );
  });

  it('/auth/register (POST) - valid credentials', async () => {
    await userRepository.delete({ email: testingUser.email });

    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(testingUser);

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      user: {
        email: testingUser.email,
        fullName: testingUser.fullName,
        id: expect.any(String),
        isActive: true,
        roles: ['user'],
      },
      token: expect.stringMatching(/^eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.*$/),
    });
  });
});
