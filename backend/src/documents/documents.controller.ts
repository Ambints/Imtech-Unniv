import { Controller, Get, Post, Body, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Documents - Relevés, Attestations, Diplômes')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('documents')
export class DocumentsController {
  constructor(private readonly svc: DocumentsService) {}

  // ========== RELEVÉS ==========
  @Post('releves')
  @Roles('secretaire', 'admin', 'scolarite')
  @ApiOperation({ summary: 'Générer un relevé de notes' })
  createReleve(@Body() dto: any) {
    return this.svc.genererReleve(dto);
  }

  @Get('etudiants/:etudiantId/releves')
  @Roles('secretaire', 'admin', 'scolarite', 'etudiant', 'parent')
  @ApiOperation({ summary: 'Relevés d\'un étudiant' })
  findReleves(@Param('etudiantId') etudiantId: string) {
    return this.svc.findRelevesByEtudiant(etudiantId);
  }

  @Patch('releves/:id/valider')
  @Roles('secretaire', 'admin', 'responsable_pedagogique')
  @ApiOperation({ summary: 'Valider un relevé' })
  validerReleve(@Param('id') id: string, @Body('validePar') validePar: string) {
    return this.svc.validerReleve(id, validePar);
  }

  @Patch('releves/:id/signer')
  @Roles('admin', 'president')
  @ApiOperation({ summary: 'Signer un relevé' })
  signerReleve(@Param('id') id: string, @Body('signePar') signePar: string) {
    return this.svc.signerReleve(id, signePar);
  }

  // ========== ATTESTATIONS ==========
  @Post('attestations')
  @Roles('etudiant', 'secretaire', 'admin')
  @ApiOperation({ summary: 'Demander une attestation' })
  demanderAttestation(@Body() dto: any) {
    return this.svc.demanderAttestation(dto);
  }

  @Get('etudiants/:etudiantId/attestations')
  @Roles('etudiant', 'parent', 'secretaire', 'admin')
  @ApiOperation({ summary: 'Attestations d\'un étudiant' })
  findAttestations(@Param('etudiantId') etudiantId: string) {
    return this.svc.findAttestationsByEtudiant(etudiantId);
  }

  @Patch('attestations/:id/valider')
  @Roles('secretaire', 'admin')
  @ApiOperation({ summary: 'Valider une attestation' })
  validerAttestation(@Param('id') id: string, @Body('validePar') validePar: string) {
    return this.svc.validerAttestation(id, validePar);
  }

  @Patch('attestations/:id/signer')
  @Roles('admin', 'president')
  @ApiOperation({ summary: 'Signer une attestation' })
  signerAttestation(@Param('id') id: string, @Body('signePar') signePar: string) {
    return this.svc.signerAttestation(id, signePar);
  }

  @Patch('attestations/:id/delivrer')
  @Roles('secretaire', 'admin')
  @ApiOperation({ summary: 'Marquer comme délivrée' })
  delivrerAttestation(@Param('id') id: string) {
    return this.svc.delivrerAttestation(id);
  }

  // ========== DIPLÔMES ==========
  @Post('diplomes')
  @Roles('admin', 'secretaire', 'scolarite')
  @ApiOperation({ summary: 'Générer un diplôme' })
  createDiplome(@Body() dto: any) {
    return this.svc.genererDiplome(dto);
  }

  @Get('etudiants/:etudiantId/diplomes')
  @Roles('etudiant', 'parent', 'admin', 'secretaire')
  @ApiOperation({ summary: 'Diplômes d\'un étudiant' })
  findDiplomes(@Param('etudiantId') etudiantId: string) {
    return this.svc.findDiplomesByEtudiant(etudiantId);
  }

  @Patch('diplomes/:id/signer-numerique')
  @Roles('admin', 'president')
  @ApiOperation({ summary: 'Signer numériquement le diplôme' })
  signerDiplomeNumerique(@Param('id') id: string, @Body('signatureUrl') signatureUrl: string) {
    return this.svc.signerDiplomeNumeriquement(id, signatureUrl);
  }

  @Patch('diplomes/:id/delivrer')
  @Roles('admin', 'secretaire')
  @ApiOperation({ summary: 'Délivrer le diplôme' })
  delivrerDiplome(@Param('id') id: string) {
    return this.svc.delivrerDiplome(id);
  }

  // ========== STATISTIQUES ==========
  @Get('stats')
  @Roles('admin', 'president', 'secretaire')
  @ApiOperation({ summary: 'Statistiques documents' })
  getStats() {
    return this.svc.getStatsDocuments();
  }
}
