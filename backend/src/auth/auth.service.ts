import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(private users: UsersService, private jwt: JwtService) {}

  async login(email: string, password: string) {
    try {
      // First try super_admin (SaaS level)
      const superAdmin = await this.users.findSuperAdminByEmail(email);
      if (superAdmin) {
        const valid = await bcrypt.compare(password, superAdmin.password);
        if (!valid) throw new UnauthorizedException('Identifiants invalides');
        if (!superAdmin.actif) throw new UnauthorizedException('Compte desactive');

        const payload = { sub: superAdmin.id, email: superAdmin.email, role: 'super_admin', tenantId: null };
        const accessToken = this.jwt.sign(payload, { expiresIn: '8h' });
        const refreshToken = this.jwt.sign(payload, { expiresIn: '7d' });

        // Update last login
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
            tenantId: null,
          },
          tenant: null,
        };
      }

      // Then try tenant users
      const user = await this.users.findByEmail(email);
      if (!user) throw new UnauthorizedException('Identifiants invalides');
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) throw new UnauthorizedException('Identifiants invalides');
      if (!user.actif) throw new UnauthorizedException('Compte desactive');

      const tenantId = user.tenantId;
      const payload = { sub: user.id, email: user.email, role: user.role, tenantId };
      const accessToken = this.jwt.sign(payload, { expiresIn: '8h' });
      const refreshToken = this.jwt.sign(payload, { expiresIn: '7d' });

      // Get tenant info if available
      let tenantInfo = null;
      if (tenantId) {
        const tenant = await this.users.getTenantInfo(tenantId);
        if (tenant) {
          tenantInfo = {
            id: tenant.id,
            name: tenant.nom,
            slug: tenant.slug,
            schema: tenant.schemaName,
          };
        }
      }

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
          tenantId,
        },
        tenant: tenantInfo,
      };
    } catch (error) {
      console.error('[AuthService.login] Error:', error);
      throw error;
    }
  }

  async refresh(userId: string, token: string) {
    const user = await this.users.findOne(userId);
    if (!user || user.tokenReset !== token) throw new UnauthorizedException('Token invalide');
    if (user.tokenResetExpiry && user.tokenResetExpiry < new Date()) throw new UnauthorizedException('Token expire');
    const tenantId = user.tenantId;
    const payload = { sub: user.id, email: user.email, role: user.role, tenantId };
    return { accessToken: this.jwt.sign(payload, { expiresIn: '8h' }) };
  }

  async logout(userId: string) {
    // Note: token_reset columns don't exist in current schema
    return { message: 'Deconnecte avec succes' };
  }
}