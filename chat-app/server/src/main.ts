import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for the frontend
  app.enableCors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  });
  
  // Set up global validation pipe
  app.useGlobalPipes(new ValidationPipe());
  
  // Set up global prefix for API
  app.setGlobalPrefix('api');
  
  await app.listen(process.env.PORT ?? 3002);
}
bootstrap();
