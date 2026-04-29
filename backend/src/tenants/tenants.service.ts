import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from './tenant.entity';
import { TenantCreationService } from './tenant-creation.service';
import { CreateTenantDto, UpdateTenantDto } from './dto';

// Helper pour extraire le message d'erreur
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Tenant) private repo: Repository<Tenant>,
    private tenantCreationService: TenantCreationService,
  ) {}

  async create(dto: CreateTenantDto): Promise<Tenant> {
    // Vérifier si le slug existe déjà
    const existing = await this.repo.findOne({ where: { slug: dto.slug } });
    if (existing) {
      throw new BadRequestException('Une université avec ce slug existe déjà');
    }

    // Générer le nom du schéma PostgreSQL
    const schemaName = 'tenant_' + dto.slug.replace(/-/g, '_');

    // Vérifier si le nom du schéma est valide (max 63 caractères pour PostgreSQL)
    if (schemaName.length > 63) {
      throw new BadRequestException('Le slug est trop long (max 63 caractères pour le schéma)');
    }

    try {
      // 1. Créer le schéma PostgreSQL et les tables
      await this.tenantCreationService.createTenantSchema(schemaName);

      // 2. Créer le tenant dans la table public.tenant
      const tenant = this.repo.create({
        ...dto,
        schemaName,
        actif: true,
      });
      const savedTenant = await this.repo.save(tenant);

      // 3. Insérer les données de seed initiales
      const adminEmail = `admin@${dto.slug}.edu`;
      await this.tenantCreationService.seedTenantData(schemaName, adminEmail, 'Admin@1234');

      return savedTenant;
    } catch (error) {
      // En cas d'erreur, essayer de nettoyer le schéma créé
      try {
        await this.tenantCreationService.dropTenantSchema(schemaName);
      } catch (cleanupError) {
        // Ignorer l'erreur de cleanup
      }
      throw error;
    }
  }

  async findAll(): Promise<Tenant[]> {
    return this.repo.find({ 
      order: { createdAt: 'DESC' },
      select: ['id', 'nom', 'slug', 'slogan', 'logoUrl', 'couleurPrincipale', 
               'couleurSecondaire', 'actif', 'createdAt', 'pays', 'typeEtablissement']
    });
  }

  async findOne(id: string): Promise<Tenant> {
    const t = await this.repo.findOne({ where: { id } });
    if (!t) throw new NotFoundException('Université introuvable');
    return t;
  }

  async findBySlug(slug: string): Promise<Tenant> {
    const t = await this.repo.findOne({ where: { slug } });
    if (!t) throw new NotFoundException('Université introuvable');
    return t;
  }

  async update(id: string, dto: UpdateTenantDto): Promise<Tenant> {
    const t = await this.findOne(id);
    
    // Empêcher la modification du slug (car lié au nom du schéma)
    if (dto.slug && dto.slug !== t.slug) {
      throw new BadRequestException('Le slug ne peut pas être modifié (lié au schéma de base de données)');
    }
    
    return this.repo.save({ ...t, ...dto });
  }

  async remove(id: string): Promise<void> {
    const tenant = await this.findOne(id);
    
    // Supprimer le schéma PostgreSQL associé
    try {
      await this.tenantCreationService.dropTenantSchema(tenant.schemaName);
    } catch (error) {
      // Log l'erreur mais continuer pour supprimer l'entrée dans la table tenant
      console.warn(`Impossible de supprimer le schéma ${tenant.schemaName}: ${getErrorMessage(error)}`);
    }
    
    await this.repo.delete(id);
  }

  async getDashboard(id: string): Promise<any> {
    const tenant = await this.findOne(id);
    
    // TODO: Implémenter la récupération réelle des statistiques depuis le schéma du tenant
    return {
      tenantId: id,
      tenant: {
        nom: tenant.nom,
        slug: tenant.slug,
        schemaName: tenant.schemaName,
        couleurPrincipale: tenant.couleurPrincipale,
        couleurSecondaire: tenant.couleurSecondaire,
        couleurAccent: tenant.couleurAccent,
        couleurTexte: tenant.couleurTexte,
      },
      kpis: {
        totalStudents: 0,      // À récupérer depuis le schéma tenant
        activeStudents: 0,
        totalRevenue: 0,
        pendingPayments: 0,
        successRate: 0,
        attendanceRate: 0,
        totalCourses: 0,
        totalTeachers: 0,
      },
      recentActivities: [],
      whiteLabel: {
        logoUrl: tenant.logoUrl,
        slogan: tenant.slogan,
        enteteDocument: tenant.enteteDocument,
      }
    };
  }

  /**
   * Récupère la configuration complète d'une université (pour le super admin)
   */
  async getFullConfig(id: string): Promise<Tenant> {
    return this.findOne(id);
  }

  /**
   * Récupère les abonnements avec statistiques
   */
  async getSubscriptions(): Promise<{ subscriptions: any[], stats: any }> {
    const tenants = await this.repo.find({
      order: { createdAt: 'DESC' },
      select: ['id', 'nom', 'slug', 'actif', 'createdAt', 'planAbonnement', 
               'statutAbonnement', 'dateDebutAbonnement', 'dateFinAbonnement',
               'prixMensuel', 'maxUtilisateurs']
    });

    // Helper pour convertir une date en string ISO
    const toISODate = (date: any): string => {
      if (!date) return new Date().toISOString();
      if (date instanceof Date) return date.toISOString();
      if (typeof date === 'string') return new Date(date).toISOString();
      return new Date().toISOString();
    };

    // Mapper vers le format attendu par le frontend
    const subscriptions = tenants.map(tenant => ({
      id: tenant.id,
      tenantId: tenant.slug,
      tenantName: tenant.nom,
      plan: tenant.planAbonnement || 'basic',
      status: tenant.statutAbonnement || 'active',
      startDate: toISODate(tenant.dateDebutAbonnement),
      endDate: toISODate(tenant.dateFinAbonnement) || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      monthlyPrice: Number(tenant.prixMensuel) || 50000,
      maxUsers: tenant.maxUtilisateurs || 100,
      currentUsers: 0, // À récupérer depuis le schéma tenant
      features: this.getPlanFeatures(tenant.planAbonnement || 'basic'),
    }));

    // Calculer les statistiques
    const now = new Date();
    const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length;
    const expiringSoon = subscriptions.filter(s => {
      const endDate = new Date(s.endDate);
      const daysUntilExpiry = Math.floor((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
    }).length;
    const suspended = subscriptions.filter(s => s.status === 'suspended').length;
    const totalRevenue = subscriptions
      .filter(s => s.status === 'active')
      .reduce((sum, s) => sum + s.monthlyPrice, 0);

    const stats = {
      totalRevenue,
      activeSubscriptions,
      expiringSoon,
      suspended,
    };

    return { subscriptions, stats };
  }

  private getPlanFeatures(plan: string): string[] {
    const features: Record<string, string[]> = {
      basic: ['LMS', 'Support Email'],
      standard: ['LMS', 'Finance', 'Support Email'],
      premium: ['LMS', 'Finance', 'RH', 'Logistique', 'Support 24/7'],
      enterprise: ['Toutes fonctionnalités', 'Support dédié', 'API personnalisée'],
    };
    return features[plan] || features.basic;
  }

  /**
   * Créer ou modifier l'abonnement d'une université
   */
  async updateSubscription(
    id: string,
    dto: { plan: string; status: string; startDate?: string; endDate?: string; monthlyPrice?: number; maxUsers?: number }
  ): Promise<Tenant> {
    const tenant = await this.findOne(id);

    // Mettre à jour les champs d'abonnement
    tenant.planAbonnement = dto.plan;
    tenant.statutAbonnement = dto.status;
    tenant.prixMensuel = dto.monthlyPrice ?? 50000;
    tenant.maxUtilisateurs = dto.maxUsers ?? 100;

    // Convertir les dates string en objets Date si fournies
    if (dto.startDate) {
      tenant.dateDebutAbonnement = new Date(dto.startDate);
    }
    if (dto.endDate) {
      tenant.dateFinAbonnement = new Date(dto.endDate);
    } else if (!tenant.dateFinAbonnement) {
      // Si pas de date de fin, mettre 1 an par défaut
      const endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() + 1);
      tenant.dateFinAbonnement = endDate;
    }

    return this.repo.save(tenant);
  }

  /**
   * Supprimer/Résilier l'abonnement d'une université
   * (met le statut à 'expired' et garde l'historique)
   */
  async removeSubscription(id: string): Promise<{ message: string }> {
    const tenant = await this.findOne(id);

    // Au lieu de supprimer, on marque comme expiré
    tenant.statutAbonnement = 'expired';
    tenant.dateFinAbonnement = new Date(); // Date actuelle

    await this.repo.save(tenant);

    return { message: `Abonnement de l'université ${tenant.nom} résilié avec succès` };
  }
}