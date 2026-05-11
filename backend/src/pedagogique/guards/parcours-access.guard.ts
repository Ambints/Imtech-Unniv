import { Injectable, CanActivate, ExecutionContext, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SecretaireParcours } from '../secretaire-parcours.entity';
import { TenantConnectionService } from '../../tenants/tenant-connection.service';

/**
 * Guard qui vérifie si l'utilisateur connecté (secrétaire) a accès au parcours spécifié dans la requête
 * Vérifie l'existence d'une entrée dans la table secretaire_parcours
 */
@Injectable()
export class ParcoursAccessGuard implements CanActivate {
  constructor(
    @InjectRepository(SecretaireParcours, 'tenant')
    private secretaireParcoursRepo: Repository<SecretaireParcours>,
    private readonly tenantConnection: TenantConnectionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const tid = request.params.tid;
    
    // Les admins ont toujours accès
    if (this.isAdmin(user.role)) {
      return true;
    }

    // Récupérer le parcoursId depuis les params ou le query
    const parcoursId = request.params.parcoursId || request.query.parcoursId;
    
    if (!parcoursId) {
      // Si pas de parcoursId spécifié, on laisse passer (le service filtrera les résultats)
      return true;
    }

    // Vérifier l'accès au parcours
    await this.tenantConnection.setTenantSchema(tid);
    
    const hasAccess = await this.secretaireParcoursRepo.findOne({
      where: {
        secretaireId: user.userId,
        parcoursId: parcoursId,
        actif: true,
      },
    });

    if (!hasAccess) {
      throw new ForbiddenException(`Vous n'avez pas accès au parcours ${parcoursId}. Contactez un administrateur pour demander l'affectation.`);
    }

    return true;
  }

  private isAdmin(role: string): boolean {
    return ['admin', 'resp_pedagogique', 'president'].includes(role);
  }
}
