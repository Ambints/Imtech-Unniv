import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { GlobalExceptionFilter } from './debug/global-exception.filter';
import helmet from 'helmet';
import compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: true,
  });

  // Augmenter la limite de taille des requêtes pour les uploads d'images
  app.use(require('express').json({ limit: '10mb' }));
  app.use(require('express').urlencoded({ limit: '10mb', extended: true }));

  app.setGlobalPrefix('api/v1');

  // Configuration CORS pour le développement - très permissif
  const isDev = process.env.NODE_ENV !== 'production';
  
  // Middleware CORS personnalisé pour gérer les requêtes OPTIONS
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    const allowedOrigins = isDev ? ['http://localhost:3000', 'http://localhost:5173'] : [process.env.FRONTEND_URL || 'http://localhost:3000'];
    
    // Gérer les requêtes OPTIONS (preflight)
    if (req.method === 'OPTIONS') {
      res.header('Access-Control-Allow-Origin', origin || '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With, X-Tenant-Id');
      res.header('Access-Control-Allow-Credentials', 'true');
      res.header('Access-Control-Max-Age', '3600');
      return res.status(204).end();
    }
    
    // Pour les autres requêtes, configurer CORS
    if (allowedOrigins.includes(origin) || isDev) {
      res.header('Access-Control-Allow-Origin', origin);
      res.header('Access-Control-Allow-Credentials', 'true');
    }
    
    next();
  });

  app.enableCors({
    origin: isDev ? ['http://localhost:3000', 'http://localhost:5173'] : (process.env.FRONTEND_URL || 'http://localhost:3000'),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With', 'X-Tenant-Id'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    preflightContinue: true,
    optionsSuccessStatus: 204
  });

  app.use(helmet());
  app.use(compression());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalFilters(new GlobalExceptionFilter());

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