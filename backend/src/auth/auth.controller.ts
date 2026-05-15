import { Controller, Post, Get, Body, Param, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

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

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Changer le mot de passe utilisateur' })
  @ApiResponse({ status: 200, description: 'Mot de passe changé avec succès' })
  @ApiResponse({ status: 400, description: 'Mot de passe invalide' })
  async changePassword(
    @Request() req,
    @Body() body: { currentPassword: string; newPassword: string }
  ) {
    const userId = req.user.sub;
    
    if (!body.currentPassword || !body.newPassword) {
      throw new BadRequestException('Le mot de passe actuel et le nouveau mot de passe sont requis');
    }

    if (body.newPassword.length < 8) {
      throw new BadRequestException('Le nouveau mot de passe doit contenir au moins 8 caractères');
    }

    return this.svc.changePassword(userId, body.currentPassword, body.newPassword);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Récupérer les informations de l\'utilisateur connecté' })
  async getMe(@Request() req) {
    const userId = req.user.sub;
    return this.svc.getUserInfo(userId);
  }
}