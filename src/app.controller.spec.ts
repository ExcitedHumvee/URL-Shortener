import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './controllers/app.controller';
import { AppService } from './services/app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('getHello', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });

  describe('getAllURLs', () => {
    it('should retrieve all URLs', async () => {
      const response = await appController.getAllURLs();
      expect(response).toBeDefined();
      expect(response.length).toBeGreaterThanOrEqual(0);
    });
  });
});

