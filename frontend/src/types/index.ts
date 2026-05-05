export type UserRole =
  | 'super_admin' | 'president' | 'responsable_pedagogique'
  | 'secretaire_parcours' | 'surveillant_general' | 'scolarite'
  | 'rh' | 'economat' | 'caissier' | 'communication'
  | 'admin' | 'responsable_logistique' | 'service_entretien'
  | 'etudiant' | 'parent' | 'professeur';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  tenantId?: string;
  avatar?: string;
  matricule?: string;
  parcours?: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  slogan?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  subscriptionStatus: string;
  subscriptionPlan?: string;
  email?: string;
  isActive: boolean;
  createdAt: string;
}

export interface KPIs {
  totalStudents: number;
  activeStudents: number;
  totalRevenue: number;
  pendingPayments: number;
  successRate: number;
  attendanceRate: number;
  totalCourses: number;
  totalTeachers: number;
}

export interface Note {
  id: string;
  etudiantId: string;
  ueId: string;
  noteCC?: number;
  noteExam?: number;
  noteFinal?: number;
  mention?: string;
  isLocked: boolean;
  anneeAcademique: string;
}

export interface Paiement {
  id: string;
  etudiantId: string;
  montant: number;
  mode: string;
  status: string;
  reference: string;
  motif: string;
  createdAt: string;
}

export interface Parcours {
  id: string;
  name: string;
  level: string;
  totalSemesters: number;
  totalEcts: number;
  email?: string;
  isActive: boolean;
}

export interface Ticket {
  id: string;
  titre: string;
  description: string;
  localisation: string;
  status: string;
  priorite: string;
  createdAt: string;
}

export interface StockConsommable {
  id: string;
  nom: string;
  categorie: string;
  quantite: number;
  seuilAlerte: number;
  unite?: string;
}
