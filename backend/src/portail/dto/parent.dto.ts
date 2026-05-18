import { IsString, IsUUID, IsOptional, IsDateString, IsBoolean, IsEnum, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AutorisationSortieDto {
  @ApiProperty({ description: 'ID de l\'étudiant' })
  @IsUUID()
  etudiantId: string;

  @ApiProperty({ description: 'Type d\'autorisation', enum: ['sortie_anticipee', 'absence_prevue', 'sortie_exceptionnelle', 'dispense_cours'] })
  @IsEnum(['sortie_anticipee', 'absence_prevue', 'sortie_exceptionnelle', 'dispense_cours'])
  type: string;

  @ApiProperty({ description: 'Date de début' })
  @IsDateString()
  dateDebut: string;

  @ApiProperty({ description: 'Date de fin' })
  @IsDateString()
  dateFin: string;

  @ApiPropertyOptional({ description: 'Heure de début' })
  @IsOptional()
  @IsString()
  heureDebut?: string;

  @ApiPropertyOptional({ description: 'Heure de fin' })
  @IsOptional()
  @IsString()
  heureFin?: string;

  @ApiProperty({ description: 'Motif de l\'autorisation' })
  @IsString()
  motif: string;

  @ApiPropertyOptional({ description: 'URL du justificatif' })
  @IsOptional()
  @IsString()
  justificatifUrl?: string;

  @ApiPropertyOptional({ description: 'Commentaire additionnel' })
  @IsOptional()
  @IsString()
  commentaire?: string;
}

export class JustifierAbsenceDto {
  @ApiProperty({ description: 'ID de l\'étudiant' })
  @IsUUID()
  etudiantId: string;

  @ApiProperty({ description: 'ID de la présence à justifier' })
  @IsUUID()
  presenceId: string;

  @ApiProperty({ description: 'Motif de l\'absence' })
  @IsString()
  motif: string;

  @ApiPropertyOptional({ description: 'URL du justificatif médical ou autre' })
  @IsOptional()
  @IsString()
  justificatifUrl?: string;
}

export class EnvoyerMessageDto {
  @ApiProperty({ description: 'ID de l\'étudiant concerné' })
  @IsUUID()
  etudiantId: string;

  @ApiProperty({ description: 'Type de destinataire', enum: ['surveillant_general', 'secretariat', 'scolarite', 'direction', 'enseignant', 'caissier'] })
  @IsEnum(['surveillant_general', 'secretariat', 'scolarite', 'direction', 'enseignant', 'caissier'])
  destinataireType: string;

  @ApiPropertyOptional({ description: 'ID du destinataire spécifique' })
  @IsOptional()
  @IsUUID()
  destinataireId?: string;

  @ApiProperty({ description: 'Sujet du message' })
  @IsString()
  sujet: string;

  @ApiProperty({ description: 'Contenu du message' })
  @IsString()
  message: string;

  @ApiPropertyOptional({ description: 'URL de la pièce jointe' })
  @IsOptional()
  @IsString()
  pieceJointeUrl?: string;
}

export class RepondreMessageDto {
  @ApiProperty({ description: 'ID du message parent' })
  @IsUUID()
  messageId: string;

  @ApiProperty({ description: 'Contenu de la réponse' })
  @IsString()
  contenu: string;

  @ApiPropertyOptional({ description: 'URL de la pièce jointe' })
  @IsOptional()
  @IsString()
  pieceJointeUrl?: string;
}

export class SoumettrePreuvePaiementDto {
  @ApiProperty({ description: 'ID de l\'étudiant' })
  @IsUUID()
  etudiantId: string;

  @ApiProperty({ description: 'ID de l\'inscription' })
  @IsUUID()
  inscriptionId: string;

  @ApiProperty({ description: 'Montant payé' })
  @IsNumber()
  montant: number;

  @ApiProperty({ description: 'Méthode de paiement', enum: ['virement', 'mobile_money', 'especes', 'cheque', 'carte_bancaire'] })
  @IsEnum(['virement', 'mobile_money', 'especes', 'cheque', 'carte_bancaire'])
  methodePaiement: string;

  @ApiProperty({ description: 'Référence du paiement' })
  @IsString()
  referencePaiement: string;

  @ApiProperty({ description: 'Date du paiement' })
  @IsDateString()
  datePaiement: string;

  @ApiProperty({ description: 'URL de la preuve de paiement' })
  @IsString()
  preuveUrl: string;

  @ApiPropertyOptional({ description: 'Commentaire' })
  @IsOptional()
  @IsString()
  commentaire?: string;
}

export class MarquerNotificationLueDto {
  @ApiProperty({ description: 'ID de la notification' })
  @IsUUID()
  notificationId: string;
}

export class UpdatePreferencesNotificationDto {
  @ApiProperty({ description: 'Type de notification' })
  @IsString()
  typeNotification: string;

  @ApiProperty({ description: 'Activer/désactiver' })
  @IsBoolean()
  actif: boolean;

  @ApiPropertyOptional({ description: 'Recevoir par email' })
  @IsOptional()
  @IsBoolean()
  email?: boolean;

  @ApiPropertyOptional({ description: 'Recevoir par SMS' })
  @IsOptional()
  @IsBoolean()
  sms?: boolean;
}

export class GetBulletinQueryDto {
  @ApiPropertyOptional({ description: 'ID de la session d\'examen' })
  @IsOptional()
  @IsUUID()
  sessionId?: string;

  @ApiPropertyOptional({ description: 'Année académique' })
  @IsOptional()
  @IsUUID()
  anneeAcademiqueId?: string;

  @ApiPropertyOptional({ description: 'Semestre (1 ou 2)' })
  @IsOptional()
  @IsNumber()
  semestre?: number;
}

export class GetAbsencesQueryDto {
  @ApiPropertyOptional({ description: 'Date de début' })
  @IsOptional()
  @IsDateString()
  dateDebut?: string;

  @ApiPropertyOptional({ description: 'Date de fin' })
  @IsOptional()
  @IsDateString()
  dateFin?: string;

  @ApiPropertyOptional({ description: 'Statut', enum: ['absent', 'retard', 'tous'] })
  @IsOptional()
  @IsEnum(['absent', 'retard', 'tous'])
  statut?: string;
}

export class GetEmploiDuTempsQueryDto {
  @ApiPropertyOptional({ description: 'Date de début' })
  @IsOptional()
  @IsDateString()
  dateDebut?: string;

  @ApiPropertyOptional({ description: 'Date de fin' })
  @IsOptional()
  @IsDateString()
  dateFin?: string;
}

export class GetMessagesQueryDto {
  @ApiPropertyOptional({ description: 'Filtrer par étudiant' })
  @IsOptional()
  @IsUUID()
  etudiantId?: string;

  @ApiPropertyOptional({ description: 'Filtrer par statut de lecture' })
  @IsOptional()
  @IsBoolean()
  nonLus?: boolean;

  @ApiPropertyOptional({ description: 'Limite de résultats' })
  @IsOptional()
  @IsNumber()
  limit?: number;
}

// Made with Bob
