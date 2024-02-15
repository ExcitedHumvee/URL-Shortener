import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('URL Shortening API')
    .setDescription('The URL Shortening API is a versatile service designed to simplify URL management tasks. It allows users to shorten long URLs into compact forms, facilitating easy sharing and tracking. With support for custom alias links, users can create personalized shortcuts for their URLs. The API also offers comprehensive statistics on URL usage, including visitor counts. Additionally, users can manage their shortened URLs by updating, deleting, and setting request limits, ensuring control and flexibility in URL management.')
    .setVersion('1.0')
    .setContact('Stany Desa','https://github.com/ExcitedHumvee','35200248+ExcitedHumvee@users.noreply.github.com')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  const options = {
    swaggerOptions: {
      baseUrl: 'http://localhost:3000/', //base URL here
    },
  };
  SwaggerModule.setup('api', app, document, options);
  
  await app.listen(3000);
}
bootstrap();
