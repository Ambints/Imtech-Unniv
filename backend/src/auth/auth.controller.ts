import { Controller, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly svc: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Connexion utilisateur - Retourne JWT' })
  login(@Body() body: { email: string; password: string }) {
    return this.svc.login(body.email, body.password);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Rafraichir le token JWT' })
  refresh(@Body() body: { userId: string; refreshToken: string }) {
    return this.svc.refresh(body.userId, body.refreshToken);
  }

  @Post('logout/:userId')
  @ApiOperation({ summary: 'Deconnexion' })
  logout(@Param('userId') userId: string) {
    return this.svc.logout(userId);
  }
}