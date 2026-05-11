"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const global_exception_filter_1 = require("./debug/global-exception.filter");
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        bodyParser: true,
    });
    app.use(require('express').json({ limit: '10mb' }));
    app.use(require('express').urlencoded({ limit: '10mb', extended: true }));
    app.setGlobalPrefix('api/v1');
    const isDev = process.env.NODE_ENV !== 'production';
    app.enableCors({
        origin: isDev ? true : (process.env.FRONTEND_URL || 'http://localhost:3000'),
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With', 'X-Tenant-Id'],
        exposedHeaders: ['Content-Range', 'X-Content-Range'],
    });
    app.use((0, helmet_1.default)());
    app.use((0, compression_1.default)());
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    app.useGlobalFilters(new global_exception_filter_1.GlobalExceptionFilter());
    const config = new swagger_1.DocumentBuilder()
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
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document, {
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
//# sourceMappingURL=main.js.map