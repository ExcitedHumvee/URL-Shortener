import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let short='';
  let newAlias = 'fb';

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET) Hello World!', async () => {
    const response = await request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');

    console.log('/ (GET) Response:', response.text);
  });

  it('/urlMaps/deleteAll (DELETE) Delete Data from DB', async () => {
    const response = await request(app.getHttpServer())
      .delete('/urlMaps/deleteAll')
      .expect(200);

    console.log('/urlMaps/deleteAll (DELETE) Response:', response.text);
  });

  it('/shortenUrl (POST) Shorten URL', async () => {
    const dto = { longUrl: 'https://facebook.com', aliasURL: 'face', requestLimit: 10 };
    const response = await request(app.getHttpServer())
      .post('/shortenUrl')
      .send(dto)
      .expect(201);

    short=response.body.shortUrl;
    console.log('/shortenUrl (POST) Response:', response.body);
    expect(response.body).toHaveProperty('shortUrl');
  });

  it('/shortenUrl (POST) Shorten URL', async () => {
    const dto = { longUrl: 'https://theverge.com', aliasURL: 'v', requestLimit: 10 };
    const response = await request(app.getHttpServer())
      .post('/shortenUrl')
      .send(dto)
      .expect(201);

    console.log('/shortenUrl (POST) Response:', response.body);
    expect(response.body).toHaveProperty('shortUrl');
  });

  it('/urlMaps (GET) Gell all URLMaps', async () => {
    const response = await request(app.getHttpServer())
      .get('/urlMaps')
      .expect(200);
  
    console.log('/urlMaps (GET) Response:', response.body);
    
    // Assert that the response is an array with at least one item
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBeGreaterThanOrEqual(1);
  
    // Loop through each item in the array and check its properties
    for (const item of response.body) {
      expect(item.id).toBeDefined();
      expect(item.id).not.toBeNull();
  
      expect(item.shortURL).toBeDefined();
      expect(item.shortURL).not.toBeNull();
      expect(item.shortURL).not.toBe('');
  
      expect(item.longURL).toBeDefined();
      expect(item.longURL).not.toBeNull();
      expect(item.longURL).not.toBe('');
  
      expect(item.visitorCount).toBeDefined();
      expect(item.visitorCount).not.toBeNull();
  
      expect(item.aliasURL).toBeDefined();
      // Alias URL can be null, so no need to check for not toBeNull() and not toBe('')
      
      expect(item.isActive).toBeDefined();
      expect(item.isActive).not.toBeNull();
  
      expect(item.requestLimit).toBeDefined();
      expect(item.requestLimit).not.toBeNull();
    }
  });

  it('/:shortUrl/statistics (GET) Get URL Statistics', async () => {
    const shortUrl = short;
    const response = await request(app.getHttpServer())
      .get(`/${shortUrl}/statistics`)
      .expect(200);

    console.log(`/${shortUrl}/statistics (GET) Response:`, response.body);
  expect(response.body).toBeInstanceOf(Object);

  const firstItem = response.body;
  expect(firstItem.id).toBeDefined();
  expect(firstItem.id).not.toBeNull();

  expect(firstItem.shortURL).toBeDefined();
  expect(firstItem.shortURL).not.toBeNull();
  expect(firstItem.shortURL).not.toBe('');

  expect(firstItem.longURL).toBeDefined();
  expect(firstItem.longURL).not.toBeNull();
  expect(firstItem.longURL).not.toBe('');

  expect(firstItem.visitorCount).toBeDefined();
  expect(firstItem.visitorCount).not.toBeNull();

  expect(firstItem.aliasURL).toBeDefined();
  // Alias URL can be null, so no need to check for not toBeNull() and not toBe('')
  
  expect(firstItem.isActive).toBeDefined();
  expect(firstItem.isActive).not.toBeNull();

  expect(firstItem.requestLimit).toBeDefined();
  expect(firstItem.requestLimit).not.toBeNull();
  });

  it('/urlMap (PUT) Update URLMap', async () => {
    const updateDto = { shortURL: short, requestLimit: 2, alias: newAlias };
    const response = await request(app.getHttpServer())
      .put('/urlMap')
      .send(updateDto)
      .expect(200);

    console.log('/urlMap (PUT) Response:', response.text);
    expect(response.body);
  });

  it('/:shortUrl/statistics (GET) after PUT Check updated values of URLMap', async () => {
    const shortUrl = short;
    const response = await request(app.getHttpServer())
      .get(`/${shortUrl}/statistics`)
      .expect(200);
  
    console.log(`/${shortUrl}/statistics (GET) Response:`, response.body);
    expect(response.body).toBeInstanceOf(Object);
  
    const firstItem = response.body;
    expect(firstItem.id).toBeDefined();
    expect(firstItem.id).not.toBeNull();
  
    expect(firstItem.shortURL).toBeDefined();
    expect(firstItem.shortURL).not.toBeNull();
    expect(firstItem.shortURL).not.toBe('');
  
    expect(firstItem.longURL).toBeDefined();
    expect(firstItem.longURL).not.toBeNull();
    expect(firstItem.longURL).not.toBe('');
  
    expect(firstItem.visitorCount).toBeDefined();
    expect(firstItem.visitorCount).not.toBeNull();
  
    expect(firstItem.aliasURL).toBeDefined();
    // Alias URL can be null, so no need to check for not toBeNull() and not toBe('')
    
    expect(firstItem.isActive).toBeDefined();
    expect(firstItem.isActive).not.toBeNull();
  
    // Verify that the requestLimit is updated to 2
    expect(firstItem.requestLimit).toBeDefined();
    expect(firstItem.requestLimit).toEqual(2);
  
    // Verify that the alias is updated to 'fb'
    expect(firstItem.aliasURL).toEqual('fb');
  });

  it('/:shortUrl (GET) first call', async () => {
    const shortUrl = short;
    const response = await request(app.getHttpServer())
      .get(`/${shortUrl}`)
      .expect(302); // Expecting a redirect
  
    console.log(`/${shortUrl} (GET) Response:`, response.body);
  });
  
  it('/:shortUrl (GET) second call', async () => {
    const shortUrl = newAlias;
    const response = await request(app.getHttpServer())
      .get(`/${shortUrl}`)
      .expect(302); // Expecting a redirect
  
    console.log(`/${shortUrl} (GET) Response:`, response.body);
  });

  it('/:shortUrl (GET) third call, after request limit has been reached', async () => {
    const shortUrl = newAlias;
    const response = await request(app.getHttpServer())
      .get(`/${shortUrl}`)
      .expect(400); // Expecting a 400 status code for request limit reached
  
    console.log(`/${shortUrl} (GET) Response:`, response.body.message.text);
    const responseBody = JSON.parse(response.text);
    expect(responseBody.message).toBe('Request limit reached for this URL');
  });

  it('/urlMap (DELETE)', async () => {
    const deleteDto = { shortURL: short };
    const response = await request(app.getHttpServer())
      .delete('/urlMap')
      .send(deleteDto)
      .expect(200);

    console.log('/urlMap (DELETE) Response:', response.text);
    expect(response.body);
  });

  it('/:shortUrl (GET) after deletion', async () => {
    const shortUrl = newAlias;
    const response = await request(app.getHttpServer())
      .get(`/${shortUrl}`)
      .expect(400); // Expecting a 400 status code for request limit reached
  
    console.log(`/${shortUrl} (GET) Response:`, response.body);
    const responseBody = JSON.parse(response.text);
    expect(responseBody.message).toBe('This link has been deleted');
  });

  it('/shortenUrl (POST) with invalid URL', async () => {
    const dto = { longUrl: 'invalidurl', aliasURL: 'invalid', requestLimit: 10 };
    const response = await request(app.getHttpServer())
      .post('/shortenUrl')
      .send(dto)
      .expect(400);

    console.log('/shortenUrl (POST) Invalid URL Response:', response.body);
    expect(response.body.message).toStrictEqual(["Invalid URL format"]);
  });

  it('/shortenUrl (POST) with negative request limit', async () => {
    const dto = { longUrl: 'https://validurl.com', aliasURL: 'invalid', requestLimit: -1 };
    const response = await request(app.getHttpServer())
      .post('/shortenUrl')
      .send(dto)
      .expect(400);

    console.log('/shortenUrl (POST) Negative Request Limit Response:', response.body);
    expect(response.body.message).toStrictEqual(["Request limit must be greater than or equal to 0"]);
  });

  it('/shortenUrl (POST) with conflicting alias URL', async () => {
    // First, create a mapping with an alias
    await request(app.getHttpServer())
      .post('/shortenUrl')
      .send({ longUrl: 'https://existing.com', aliasURL: 'conflict', requestLimit: 4 })
      .expect(201);

    // Then, attempt to create another mapping with the same alias
    const dto = { longUrl: 'https://newurl.com', aliasURL: 'conflict', requestLimit: 4 };
    const response = await request(app.getHttpServer())
      .post('/shortenUrl')
      .send(dto)
      .expect(400);

    console.log('/shortenUrl (POST) Alias Conflict Response:', response.body);
    expect(response.body.message).toBe('aliasURL must be unique');
  });

  it('/shortenUrl (POST) Add Dummy Data', async () => {
    await request(app.getHttpServer())
      .post('/shortenUrl')
      .send({ longUrl: 'https://google.com', aliasURL: 'goog', requestLimit: 4 })
      .expect(201);
    await request(app.getHttpServer())
      .post('/shortenUrl')
      .send({ longUrl: 'https://youtube.com', aliasURL: 'yoo', requestLimit: 4 })
      .expect(201);  
    await request(app.getHttpServer())
      .post('/shortenUrl')
      .send({ longUrl: 'https://amazon.com', aliasURL: 'ama', requestLimit: 4 })
      .expect(201);  
  });



  afterAll(async () => {
    await app.close();
  });
});
