import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(private users: UsersService, private jwt: JwtService) {}

  async login(email: string, password: string) {
    // 1. Essayer de trouver un Super Admin (table public.super_admin)
    const superAdmin = await this.users.findSuperAdminByEmail(email);
    if (superAdmin) {
      const valid = await bcrypt.compare(password, superAdmin.password);
      if (!valid) throw new UnauthorizedException('Identifiants invalides');
      if (!superAdmin.actif) throw new UnauthorizedException('Compte desactive');

      const payload = { sub: superAdmin.id, email: superAdmin.email, role: 'super_admin' };
      const accessToken = this.jwt.sign(payload, { expiresIn: '8h' });
      const refreshToken = this.jwt.sign(payload, { expiresIn: '7d' });
      await this.users.updateSuperAdminLastLogin(superAdmin.id);

      return {
        accessToken,
        refreshToken,
        user: {
          id: superAdmin.id,
          email: superAdmin.email,
          firstName: superAdmin.prenom,
          lastName: superAdmin.nom,
          role: 'super_admin',
          photoUrl: null,
        },
      };
    }

    // 2. Sinon chercher dans les utilisateurs tenant (table utilisateur)
    const user = await this.users.findByEmail(email);
    if (!user) throw new UnauthorizedException('Identifiants invalides');
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Identifiants invalides');
    if (!user.actif) throw new UnauthorizedException('Compte desactive');

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwt.sign(payload, { expiresIn: '8h' });
    const refreshToken = this.jwt.sign(payload, { expiresIn: '7d' });
    await this.users.updateRefreshToken(user.id, refreshToken);
    await this.users.update(user.id, { derniereConnexion: new Date() });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.prenom,
        lastName: user.nom,
        role: user.role,
        photoUrl: user.photoUrl,
      },
    };
  }

  async refresh(userId: string, token: string) {
    const user = await this.users.findOne(userId);
    if (!user || user.tokenReset !== token) throw new UnauthorizedException('Token invalide');
    if (user.tokenResetExpiry && user.tokenResetExpiry < new Date()) throw new UnauthorizedException('Token expire');
    const payload = { sub: user.id, email: user.email, role: user.role };
    return { accessToken: this.jwt.sign(payload, { expiresIn: '8h' }) };
  }

  async logout(userId: string) {
    await this.users.updateRefreshToken(userId, null);
    return { message: 'Deconnecte avec succes' };
  }
}