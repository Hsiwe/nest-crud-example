import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('TagController (e2e)', () => {
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
      .send({
        email: 'tag user email',
        password: 'pass123qweS',
        nickname: 'nick',
      });
    authHeader = { Authorization: `Bearer ${response.body.token}` };
  });
  const createTag = (name: string) =>
    request
      .default(app.getHttpServer())
      .post('/tag/')
      .set(authHeader)
      .send({ name });
  it('/ (POST) creates new tag', () => {
    return createTag('name')
      .expect(201)
      .expect((req) => {
        expect(req.body.name).toBe('name');
        expect(req.body.id).toBeDefined();
        expect(req.body.sortOrder).toBe(0);
      });
  });
  it('/ (POST) returns 400 if name is not unique', async () => {
    await createTag('name3');
    return createTag('name3').expect(400);
  });
  it('/:id (GET) returns 404 if tag is not found', async () => {
    return request
      .default(app.getHttpServer())
      .get('/tag/123123')
      .set(authHeader)
      .expect(404);
  });
  it('/ (PUT) updates tag', async () => {
    const tagRes = await createTag('name2');
    expect(tagRes.status).toBe(201);
    expect(tagRes.body.id);
    const id = tagRes.body.id;
    return request
      .default(app.getHttpServer())
      .put(`/tag/${id}`)
      .send({ name: 'new name', sortOrder: 3 })
      .set(authHeader)
      .expect((req) => {
        expect(req.status).toBe(200);
        expect(req.body.name).toBe('new name');
        expect(req.body.sortOrder).toBe(3);
      });
  });
  it('/ (DELETE) deletes tag', async () => {
    const createdTag = await createTag('name10');
    expect(createdTag.status).toBe(201);
    await request
      .default(app.getHttpServer())
      .delete(`/tag/${createdTag.body.id}`)
      .set(authHeader)
      .send()
      .expect(200);
    return request
      .default(app.getHttpServer())
      .get(`/tag/${createdTag.body.id}`)
      .set(authHeader)
      .send()
      .expect(404);
  });
});
