import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../src/app.module';
import { Repository } from 'typeorm';
import { User } from '../../../src/auth/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

const testingUser = {
  email: 'test@google.com',
  password: 'Abc123',
  fullName: 'Testing User',
};

const testingAdminUser = {
  email: 'testing.admin@google.com',
  password: 'Abc123',
  fullName: 'Testing Admin',
};

describe('Auth Feature - login (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;

  beforeAll(async () => {
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

    userRepository = app.get<Repository<User>>(getRepositoryToken(User));

    userRepository.delete({
      email: testingUser.email,
    });
    userRepository.delete({
      email: testingAdminUser.email,
    });

    await request(app.getHttpServer()).post('/auth/register').send(testingUser);

    await request(app.getHttpServer())
      .post('/auth/register')
      .send(testingAdminUser);

    await userRepository.update(
      { email: testingAdminUser.email },
      { roles: ['admin'] },
    );
  });

  it('/auth/login (POST) - should throw 400 if not body', async () => {
    const response = await request(app.getHttpServer()).post('/auth/login');
    const errorMessages = [
      'email must be an email',
      'email must be a string',
      'The password must have a Uppercase, lowercase letter and a number',
      'password must be shorter than or equal to 50 characters',
      'password must be longer than or equal to 6 characters',
      'password must be a string',
    ];

    expect(response.status).toBe(400);
    errorMessages.forEach((message) => {
      expect(response.body.message).toContain(message);
    });
  });

  it('/auth/login (POST) - wrong credentials - email', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'notexisting@e.com',
        password: 'Abcd123456',
      });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Credentials are not valid (email)');
  });

  it('/auth/login (POST) - wrong credentials - password', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: testingUser.email,
        password: 'Abcd123456',
      });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Credentials are not valid (password)');
  });

  it('/auth/login (POST) - valid credenditals', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: testingUser.email,
        password: testingUser.password,
      });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      user: {
        id: expect.any(String),
        email: testingUser.email,
        fullName: testingUser.fullName,
        isActive: true,
        roles: ['user'],
      },
      token: expect.stringMatching(/^eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.*$/),
    });
  });

  afterAll(async () => {
    await userRepository.delete({ email: testingAdminUser.email });
    await userRepository.delete({ email: testingUser.email });
    await app.close();
  });
});
