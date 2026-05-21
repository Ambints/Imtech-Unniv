import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    console.log('[JwtAuthGuard] Checking auth for:', request.method, request.url);
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    console.log('[JwtAuthGuard] handleRequest - err:', err?.message, 'user:', user?.id, 'info:', info?.message);
    if (err || !user) {
      console.error('[JwtAuthGuard] Authentication failed:', err?.message || info?.message);
      throw err || new UnauthorizedException('Token invalide ou expiré');
    }
    console.log('[JwtAuthGuard] Authentication successful for user:', user.id, 'role:', user.role);
    return user;
  }
}
