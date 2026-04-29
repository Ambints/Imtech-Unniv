import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');

  // Configuration CORS pour le développement - très permissif
  const isDev = process.env.NODE_ENV !== 'production';
  
  app.enableCors({
    origin: isDev ? true : (process.env.FRONTEND_URL || 'http://localhost:3000'),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const config = new DocumentBuilder()
    .setTitle('IMTECH UNIVERSITY API')
    .setDescription([
      '## Plateforme SaaS Multi-Tenant pour universites catholiques',
      '',
      '### Modules disponibles:',
      '- **Auth** - Authentification JWT',
      '- **Tenants** - Gestion des universites (Super-Admin)',
      '- **Users** - Utilisateurs et roles (16 roles)',
      '- **Academic** - Parcours, UE/ECTS, Notes, Inscriptions, EDT',
      '- **Finance** - Paiements, Caisse, Budget, Depenses, RH',
      '- **Logistics** - Maintenance, Stocks, Nettoyage, Salles',
    ].join('\n'))
    .setVersion('1.0.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'JWT-auth')
    .addTag('Auth', 'Connexion / Deconnexion / Refresh Token')
    .addTag('Tenants', 'Super-Administration - Gestion des universites')
    .addTag('Users', 'Gestion des comptes et roles')
    .addTag('Academic', 'Pole Academique et Pedagogique')
    .addTag('Finance', 'Pole Financier - Caisse, Budget, RH')
    .addTag('Logistics', 'Logistique, Maintenance, Entretien')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true, tagsSorter: 'alpha' },
    customSiteTitle: 'IMTECH UNIVERSITY - API Docs',
  });

  const port = parseInt(process.env.PORT || '4000');
  await app.listen(port);

  console.log('');
  console.log('  ===================================================');
  console.log('  🎓  IMTECH UNIVERSITY - Plateforme SaaS');
  console.log('  ===================================================');
  console.log('  🚀  API:     http://localhost:' + port + '/api/v1');
  console.log('  📚  Swagger: http://localhost:' + port + '/api/docs');
  console.log('  ===================================================');
  console.log('');
}
bootstrap().catch(console.error);