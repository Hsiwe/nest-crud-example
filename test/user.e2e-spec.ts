import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let authHeader;
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    // Creating a user that will be used in test cases
    const response = await request
      .default(app.getHttpServer())
      .post('/signin')
      .send({ email: 'user email', password: 'pass123qweS', nickname: 'nick' });
    authHeader = { Authorization: `Bearer ${response.body.token}` };
  });
  it('/ (GET) returns authed user', () => {
    return request
      .default(app.getHttpServer())
      .get('/user/')
      .set(authHeader)
      .expect(200)
      .expect((req) => {
        expect(req.body.email).toBe('user email');
        expect(req.body.nickname).toBe('nick');
        expect(req.body.tags).toBeDefined();
      });
  });
  it('/ (PUT) updates authed user', () => {
    return request
      .default(app.getHttpServer())
      .put('/user/')
      .set(authHeader)
      .send({ nickname: 'new nick' })
      .expect(200)
      .expect((req) => {
        expect(req.body.email).toBe('user email');
        expect(req.body.nickname).toBe('new nick');
        expect(req.body.tags).toBeUndefined();
      });
  });
  it('/ (DELETE) deletes authed user', async () => {
    const res1 = await request
      .default(app.getHttpServer())
      .delete('/user/')
      .set(authHeader)
      .send();
    expect(res1.status).toBe(200);
    const res2 = await request
      .default(app.getHttpServer())
      .get('/user/')
      .set(authHeader)
      .send();
    expect(res2.status).toBe(401);
  });
});
