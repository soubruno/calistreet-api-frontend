import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // CRÍTICO: Habilitar CORS para permitir que o frontend se conecte (Login, Fetch, etc.)
  app.enableCors({
    origin: '*', // Permite qualquer origem (Para desenvolvimento. Mais seguro seria especificar o domínio)
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useLogger(['error', 'warn', 'debug', 'verbose', 'log']);

  const config = new DocumentBuilder()
    .setTitle('Calistreet API')
    .setDescription('API de Calistenia')
    .setVersion('1.0')
    .addBearerAuth() 
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document); 

  await app.listen(3000);
  console.log("API Calistreet rodando na porta 3000. Docs em: http://localhost:3000/api/docs");
}
bootstrap();