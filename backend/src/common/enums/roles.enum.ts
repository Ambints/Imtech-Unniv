export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  PRESIDENT = 'president',
  RESP_PEDAGOGIQUE = 'resp_pedagogique',
  SECRETAIRE_PARCOURS = 'secretaire_parcours',
  SURVEILLANT_GENERAL = 'surveillant_general',
  SCOLARITE = 'scolarite',
  RH = 'rh',
  ECONOMAT = 'economat',
  CAISSIER = 'caissier',
  COMMUNICATION = 'communication',
  ADMIN = 'admin',
  LOGISTIQUE = 'logistique',
  ENTRETIEN = 'entretien',
  ETUDIANT = 'etudiant',
  PARENT = 'parent',
  PROFESSEUR = 'professeur',
}

export enum AcademicLevel { LICENCE = 'licence', MASTER = 'master', DOCTORAT = 'doctorat' }
export enum PaymentMethod { CASH = 'cash', TRANSFER = 'virement', CARD = 'carte', MOBILE = 'mobile_money' }
export enum PaymentStatus { PENDING = 'pending', PAID = 'paid', PARTIAL = 'partial', OVERDUE = 'overdue' }
export enum MaintenanceStatus { OPEN = 'open', IN_PROGRESS = 'in_progress', RESOLVED = 'resolved' }
