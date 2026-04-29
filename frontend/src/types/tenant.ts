export interface Tenant {
  id: string;
  nom: string;
  slug: string;
  schemaName: string;
  slogan?: string;
  logoUrl?: string;
  couleurPrincipale?: string;
  couleurSecondaire?: string;
  couleurAccent?: string;
  couleurTexte?: string;
  enteteDocument?: string;
  adresse?: string;
  pays: string;
  telephone?: string;
  emailContact?: string;
  siteWeb?: string;
  typeEtablissement: string;
  actif: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTenantRequest {
  nom: string;
  slug: string;
  slogan?: string;
  logoUrl?: string;
  couleurPrincipale?: string;
  couleurSecondaire?: string;
  couleurAccent?: string;
  couleurTexte?: string;
  enteteDocument?: string;
  adresse?: string;
  pays?: string;
  telephone?: string;
  emailContact?: string;
  siteWeb?: string;
  typeEtablissement?: string;
  // Subscription fields
  planAbonnement?: string;
  statutAbonnement?: string;
  dateDebutAbonnement?: string;
  dateFinAbonnement?: string;
  prixMensuel?: number;
  maxUtilisateurs?: number;
}

export interface UpdateTenantRequest extends Partial<CreateTenantRequest> {}

export interface TenantDashboard {
  tenantId: string;
  tenant: {
    nom: string;
    slug: string;
    schemaName: string;
    couleurPrincipale: string;
    couleurSecondaire: string;
    couleurAccent: string;
    couleurTexte: string;
  };
  kpis: {
    totalStudents: number;
    activeStudents: number;
    totalRevenue: number;
    pendingPayments: number;
    successRate: number;
    attendanceRate: number;
    totalCourses: number;
    totalTeachers: number;
  };
  recentActivities: any[];
  whiteLabel: {
    logoUrl?: string;
    slogan?: string;
    enteteDocument?: string;
  };
}

export interface UniversityFormData {
  nom: string;
  slug: string;
  slogan: string;
  logoUrl: string;
  adresse: string;
  pays: string;
  telephone: string;
  emailContact: string;
  siteWeb: string;
  typeEtablissement: string;
  couleurPrincipale: string;
  couleurSecondaire: string;
  couleurAccent: string;
  couleurTexte: string;
  enteteDocument: string;
}

export const defaultFormData: UniversityFormData = {
  nom: '',
  slug: '',
  slogan: '',
  logoUrl: '',
  adresse: '',
  pays: 'Madagascar',
  telephone: '',
  emailContact: '',
  siteWeb: '',
  typeEtablissement: 'catholique',
  couleurPrincipale: '#1a7a4a',
  couleurSecondaire: '#1565c0',
  couleurAccent: '#e65100',
  couleurTexte: '#ffffff',
  enteteDocument: '',
};
