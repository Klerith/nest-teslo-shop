import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as request from 'supertest';
import { Repository } from 'typeorm';

import { AppModule } from '../../../src/app.module';
import { User } from '../../../src/auth/entities/user.entity';

import { validate } from 'uuid';

const testingUser = {
  email: 'testing.user@google.com',
  password: 'Abc12345',
  fullName: 'Testing user',
};

const testingAdminUser = {
  email: 'testing.admin@google.com',
  password: 'Abc12345',
  fullName: 'Testing admin',
};

describe('AuthModule Private (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;

  let token: string;
  let adminToken: string;
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
    await userRepository.delete({ email: testingUser.email });
    await userRepository.delete({ email: testingAdminUser.email });

    const responseUser = await request(app.getHttpServer())
      .post('/auth/register')
      .send(testingUser);

    const responseAdminUser = await request(app.getHttpServer())
      .post('/auth/register')
      .send(testingAdminUser);

    await userRepository.update(
      { email: testingAdminUser.email },
      { roles: ['admin'] },
    );

    token = responseUser.body.token;
    adminToken = responseAdminUser.body.token;
  });

  afterAll(async () => {
    await userRepository.delete({ email: testingAdminUser.email });
    await userRepository.delete({ email: testingUser.email });
    await app.close();
  });

  it('should return 401 if no token is provided', async () => {
    const response = await request(app.getHttpServer())
      .get('/auth/private')
      .send();

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Unauthorized');
  });

  it('should return new token and user if token is provided', async () => {
    // Validar que el id es un uuid válido
    await new Promise((r) => setTimeout(r, 800));

    const response = await request(app.getHttpServer())
      .get('/auth/check-status')
      .set('Authorization', `Bearer ${token}`)
      .send();

    const responseToken = response.body.token;

    expect(response.status).toBe(200);
    expect(responseToken).not.toBe(token);
  });

  it('should return custom object if token is valid', async () => {
    // Validar la respuesta
    const response = await request(app.getHttpServer())
      .get('/auth/private')
      .set('Authorization', `Bearer ${token}`)
      .send();

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      ok: true,
      message: 'Hola Mundo Private',
      user: {
        id: expect.any(String),
        email: 'testing.user@google.com',
        fullName: 'Testing user',
        isActive: true,
        roles: ['user'],
      },
      userEmail: 'testing.user@google.com',
      rawHeaders: [
        'Host',
        expect.stringMatching(/^127\.0\.0\.1:\d+$/),
        'Accept-Encoding',
        'gzip, deflate',
        'Authorization',
        expect.stringMatching(
          /^Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.*$/,
        ),
        'Connection',
        'close',
      ],
      headers: {
        host: expect.stringMatching(/^127\.0\.0\.1:\d+$/),
        'accept-encoding': 'gzip, deflate',
        authorization: expect.stringMatching(
          /^Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.*$/,
        ),
        connection: 'close',
      },
    });
  });

  it('should return 401 if admin token is provided', async () => {
    const response = await request(app.getHttpServer())
      .get('/auth/private3')
      .set('Authorization', `Bearer ${token}`)
      .send();

    expect(response.status).toBe(403);
  });

  it('should return user if admin token is provided', async () => {
    const response = await request(app.getHttpServer())
      .get('/auth/private3')
      .set('Authorization', `Bearer ${adminToken}`)
      .send();

    const userId = response.body.user.id;
    expect(validate(userId)).toBe(true);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      ok: true,
      user: {
        id: expect.any(String),
        email: 'testing.admin@google.com',
        fullName: 'Testing admin',
        isActive: true,
        roles: ['admin'],
      },
    });
  });
});
