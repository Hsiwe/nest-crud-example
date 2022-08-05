import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });
  it('/ (GET)', () => {
    return request
      .default(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
  it('/signin returns 400 if password is not strong enough', async () => {
    const response = await request
      .default(app.getHttpServer())
      .post('/signin')
      .send({ email: 'email', password: 'pass', nickname: 'nick' });
    expect(response.status).toBe(400);
    expect(response.body.message).toContain('Password is too weak');
  });
  it('/signin returns 400 if email is too long', async () => {
    const response = await request
      .default(app.getHttpServer())
      .post('/signin')
      .send({
        email: Array(101).fill('a').join(''),
        password: 'pass',
        nickname: 'nick',
      });
    expect(response.status).toBe(400);
    expect(response.body.message).toContain(
      'email must be shorter than or equal to 100 characters',
    );
  });
  it('/signin returns 400 if nickname is too long', async () => {
    const response = await request
      .default(app.getHttpServer())
      .post('/signin')
      .send({
        email: 'email',
        password: 'pass',
        nickname: Array(101).fill('a').join(''),
      });
    expect(response.status).toBe(400);
    expect(response.body.message).toContain(
      'nickname must be shorter than or equal to 30 characters',
    );
  });
  const validBody = {
    email: 'email',
    password: '123456Ss',
    nickname: 'nickname',
  };
  it('/signin returns 201 code and tokens if schema is validated', async () => {
    const response = await request
      .default(app.getHttpServer())
      .post('/signin')
      .send(validBody);
    expect(response.status).toBe(201);
    expect(response.body.token).toBeDefined();
    expect(response.body.expire).toBeDefined();
    expect(response.body.refresh_token).toBeDefined();
    expect(response.body.refresh_token.token).toBeDefined();
    expect(response.body.refresh_token.expire).toBeDefined();
  });
  it('/signin returns 400 code if email is already in use', async () => {
    const res = await request
      .default(app.getHttpServer())
      .post('/signin')
      .send(validBody);
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Email already in use');
  });
  it('/refresh returns new token if provided with refresh token in headers', async () => {
    const req = request.default(app.getHttpServer());
    const res1 = await req.post('/signin').send({
      email: 'email2',
      password: '123456Ss',
      nickname: 'nickname',
    });
    const res2 = await req
      .get('/refresh')
      .set({ Refresh: res1.body.refresh_token.token })
      .send();
    expect(res2.status).toBe(200);
    expect(res2.body.token).toBeDefined();
  });
  it('/logout makes refresh token invalid', async () => {
    const req = request.default(app.getHttpServer());
    const res1 = await req.post('/signin').send({
      email: 'email3',
      password: '123456Ss',
      nickname: 'nickname',
    });
    await req
      .post('/logout')
      .set({ Authorization: `Bearer ${res1.body.token}` });
    const res2 = await req
      .get('/refresh')
      .set({ Refresh: res1.body.refresh_token.token })
      .send();
    expect(res2.status).toBe(401);
  });
});
