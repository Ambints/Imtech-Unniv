import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class PasswordResetMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Vérifier si l'utilisateur est authentifié
    if (!req.user) {
      return next();
    }

    // Vérifier si l'utilisateur doit changer son mot de passe
    const user = req.user as any;
    
    // Routes autorisées même si le mot de passe doit être changé
    const allowedRoutes = [
      '/auth/change-password',
      '/auth/logout',
      '/auth/refresh',
      '/auth/me'
    ];

    const isAllowedRoute = allowedRoutes.some(route => 
      req.path.startsWith(route)
    );

    // Si l'utilisateur doit changer son mot de passe et n'est pas sur une route autorisée
    if (user.passwordResetRequired && !isAllowedRoute) {
      throw new ForbiddenException(
        'Vous devez changer votre mot de passe avant de continuer. Veuillez utiliser le endpoint /auth/change-password.'
      );
    }

    next();
  }
}
