import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let short='';

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

  it('/urlMaps/deleteAll (DELETE)', async () => {
    await request(app.getHttpServer())
      .delete('/urlMaps/deleteAll')
      .expect(200);
  });

  it('/urlMaps (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get('/urlMaps')
      .expect(200);

    expect(response.body).toEqual(expect.any(Array));
  });

  it('/shortenUrl (POST)', async () => {
    const dto = { longUrl: 'https://example.com', aliasURL: '', requestLimit: 10 };
    const response = await request(app.getHttpServer())
      .post('/shortenUrl')
      .send(dto)
      .expect(201);
    short=response.body.shortUrl;
    expect(response.body).toHaveProperty('shortUrl');
  });

  it('/:shortUrl (GET)', async () => {
    // Assuming you have a short URL in your database for testing
    const shortUrl = short;
    await request(app.getHttpServer())
      .get(`/${shortUrl}`)
      .expect(302); // Expecting a redirect
  });

  it('/:shortUrl/statistics (GET)', async () => {
    // Assuming you have a short URL in your database for testing
    const shortUrl = short;
    const response = await request(app.getHttpServer())
      .get(`/${shortUrl}/statistics`)
      .expect(200);

    expect(response.body).toHaveProperty('visitorCount');
    expect(response.body).toHaveProperty('isActive');
    // Add more assertions as needed
  });

  it('/urlMap (PUT)', async () => {
    // Assuming you have an existing short URL in your database for testing
    const updateDto = { shortURL: short, requestLimit: 20 };
    const response = await request(app.getHttpServer())
      .put('/urlMap')
      .send(updateDto)
      .expect(200);

    expect(response.body);
  });

  it('/urlMap (DELETE)', async () => {
    // Assuming you have an existing short URL in your database for testing
    const deleteDto = { shortURL: short };
    const response = await request(app.getHttpServer())
      .delete('/urlMap')
      .send(deleteDto)
      .expect(200);

    expect(response.body);
  });

  afterAll(async () => {
    await app.close();
  });
});
