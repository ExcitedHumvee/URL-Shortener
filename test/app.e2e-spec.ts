import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('/urlMaps (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get('/urlMaps')
      .expect(200);

    expect(response.body).toEqual(expect.any(Array));
  });

  it('/:shortUrl/statistics (GET)', async () => {
    // Assuming you have a short URL in your database for testing
    const shortUrl = 'example';
    const response = await request(app.getHttpServer())
      .get(`/${shortUrl}/statistics`)
      .expect(200);

    expect(response.body).toHaveProperty('visitorCount');
    expect(response.body).toHaveProperty('isActive');
    // Add more assertions as needed
  });

  it('/:shortUrl (GET)', async () => {
    // Assuming you have a short URL in your database for testing
    const shortUrl = 'example';
    await request(app.getHttpServer())
      .get(`/${shortUrl}`)
      .expect(302); // Expecting a redirect
  });

  afterAll(async () => {
    await app.close();
  });
});
