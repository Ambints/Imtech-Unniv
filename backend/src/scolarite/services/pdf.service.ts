import { Injectable, BadRequestException } from '@nestjs/common';
import { Diplome } from '../entities/diplome.entity';
import { SuplementDiplome } from '../entities/suplement-diplome.entity';
import { ResultatSemestre } from '../entities/resultat-semestre.entity';
import { Etudiant } from '../entities/etudiant.entity';
import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PdfService {
  private readonly templatesPath = path.join(__dirname, '../templates');

  /**
   * Génère un relevé de notes PDF
   */
  async genererReleveNotes(
    etudiantId: string,
    inscriptionId: string,
    semestre?: number,
  ): Promise<Buffer> {
    // TODO: Implémenter la logique de récupération des données
    const resultats = await this.getResultatsEtudiant(etudiantId, inscriptionId, semestre);
    
    const doc = new PDFDocument({
      size: 'A4',
      margins: {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50,
      },
    });
    
    const chunks: Buffer[] = [];
    
    return new Promise((resolve) => {
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      // En-tête du document
      this.addHeader(doc, 'RELEVÉ DE NOTES');

      // Informations étudiant
      this.addEtudiantInfo(doc, resultats.etudiant);

      // Tableau des notes
      this.addNotesTable(doc, resultats);

      // Récapitulatif
      this.addRecapitulatif(doc, resultats);

      // Pied de page
      this.addFooter(doc);

      doc.end();
    });
  }

  /**
   * Génère le PDF du diplôme
   */
  async genererPdfDiplome(diplome: Diplome): Promise<Buffer> {
    const doc = new PDFDocument({
      size: 'A4',
      margins: {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50,
      },
    });
    
    const chunks: Buffer[] = [];
    
    return new Promise((resolve) => {
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      // Cadre décoratif
      this.addDiplomeBorder(doc);

      // En-tête officiel
      doc.fontSize(24).font('Helvetica-Bold').text('IMTECH UNIVERSITY', { align: 'center' });
      doc.fontSize(14).font('Helvetica').text('Établissement d\'Enseignement Supérieur Privé', { align: 'center' });
      doc.moveDown(2);

      // Titre du diplôme
      doc.fontSize(20).font('Times-Bold').text('DIPLOME', { align: 'center' });
      doc.fontSize(16).text(diplome.typeDiplome.toUpperCase(), { align: 'center' });
      doc.moveDown(3);

      // Texte officiel
      doc.fontSize(12).font('Times-Roman');
      doc.text('Le Conseil d\'Administration de l\'IMTECH UNIVERSITY', { align: 'center' });
      doc.text('Vu le code de l\'éducation', { align: 'center' });
      doc.text('Vu les règlements intérieurs', { align: 'center' });
      doc.text('Vu les délibérations du jury', { align: 'center' });
      doc.moveDown(2);

      doc.text('DÉCERNE À :', { align: 'center' });
      doc.moveDown();

      // Nom de l'étudiant
      doc.fontSize(16).font('Times-Bold').text(
        `${diplome.etudiant.prenoms} ${diplome.etudiant.nom}`,
        { align: 'center' }
      );

      // Détails du diplôme
      doc.fontSize(12).font('Times-Roman');
      doc.moveDown(2);
      doc.text(`Le diplôme de ${diplome.typeDiplome} en`, { align: 'center' });
      doc.fontSize(14).font('Times-Bold').text(diplome.parcours.nom, { align: 'center' });
      doc.fontSize(12).font('Times-Roman');
      doc.moveDown();
      doc.text(`Avec la mention : ${diplome.mentionGenerale}`, { align: 'center' });
      doc.text(`Moyenne finale : ${diplome.moyenneFinale}/20`, { align: 'center' });
      doc.text(`Total crédits ECTS : ${diplome.totalCreditsECTS}`, { align: 'center' });
      doc.moveDown(2);

      // Date et lieu
      doc.text(`Fait à ${diplome.lieuObtention}, le ${this.formatDate(diplome.dateObtention)}`, { align: 'center' });

      // Signatures
      doc.moveDown(4);
      this.addSignatures(doc);

      // Numéro de diplôme et QR code
      doc.fontSize(10).font('Helvetica');
      doc.text(`Numéro : ${diplome.numeroDiplome}`, { align: 'left' });
      doc.text(`Hash : ${diplome.hashIntegrite?.substring(0, 20)}...`, { align: 'left' });

      doc.end();
    });
  }

  /**
   * Génère le PDF du supplément au diplôme
   */
  async genererPdfSuplementDiplome(suplement: SuplementDiplome): Promise<Buffer> {
    const doc = new PDFDocument({
      size: 'A4',
      margins: {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50,
      },
    });
    
    const chunks: Buffer[] = [];
    
    return new Promise((resolve) => {
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      // En-tête
      this.addHeader(doc, 'SUPPLÉMENT AU DIPLÔME');

      // Informations du titulaire
      doc.fontSize(14).font('Helvetica-Bold').text('1. INFORMATIONS SUR LE TITULAIRE');
      doc.moveDown(0.5);
      doc.fontSize(11).font('Helvetica');
      doc.text(`Nom : ${suplement.identiteTitulaire.nom}`);
      doc.text(`Prénoms : ${suplement.identiteTitulaire.prenoms}`);
      doc.text(`Date de naissance : ${this.formatDate(suplement.identiteTitulaire.dateNaissance)}`);
      doc.text(`Lieu de naissance : ${suplement.identiteTitulaire.lieuNaissance}`);
      doc.text(`Nationalité : ${suplement.identiteTitulaire.nationalite}`);
      doc.moveDown();

      // Informations sur le diplôme
      doc.fontSize(14).font('Helvetica-Bold').text('2. INFORMATIONS SUR LE DIPLÔME');
      doc.moveDown(0.5);
      doc.fontSize(11).font('Helvetica');
      doc.text(`Intitulé du diplôme : ${suplement.nomDiplome}`);
      doc.text(`Domaine d\'études : ${suplement.domaineEtudes || 'N/A'}`);
      doc.text(`Niveau de qualification : ${suplement.niveauQualification}`);
      doc.text(`Durée des études : ${suplement.dureeEtudes}`);
      doc.moveDown();

      // Informations sur l'établissement
      doc.fontSize(14).font('Helvetica-Bold').text('3. INFORMATIONS SUR L\'ÉTABLISSEMENT');
      doc.moveDown(0.5);
      doc.fontSize(11).font('Helvetica');
      doc.text(`Nom de l\'établissement : ${suplement.nomEtablissement}`);
      doc.text(`Statut : ${suplement.statutEtablissement}`);
      doc.text(`Langue d\'enseignement : ${suplement.langueEnseignement}`);
      doc.moveDown();

      // Détails du programme
      doc.fontSize(14).font('Helvetica-Bold').text('4. DÉTAILS DU PROGRAMME');
      doc.moveDown(0.5);
      
      if (suplement.detailsProgramme?.semestres) {
        suplement.detailsProgramme.semestres.forEach((semestre, index) => {
          doc.fontSize(12).font('Helvetica-Bold').text(`Semestre ${semestre.numero}`);
          doc.fontSize(10).font('Helvetica');
          
          semestre.ues.forEach(ue => {
            doc.text(`  • ${ue.code} - ${ue.intitule} (${ue.credits} ECTS, Coef: ${ue.coefficient})`);
          });
          doc.moveDown(0.5);
        });
      }

      // Résultats détaillés
      doc.fontSize(14).font('Helvetica-Bold').text('5. RÉSULTATS DÉTAILLÉS');
      doc.moveDown(0.5);
      
      if (suplement.resultatsDetailles?.semestres) {
        suplement.resultatsDetailles.semestres.forEach(semestre => {
          doc.fontSize(12).font('Helvetica-Bold').text(`Semestre ${semestre.numero}`);
          doc.fontSize(10).font('Helvetica');
          doc.text(`  Moyenne semestrielle : ${semestre.moyenne}/20`);
          doc.text(`  Crédits ECTS acquis : ${semestre.creditsAcquis}`);
          
          semestre.ues.forEach(ue => {
            doc.text(`  • ${ue.code} : ${ue.moyenne}/20 (${ue.statut})`);
          });
          doc.moveDown(0.5);
        });
      }

      // Compétences
      if (suplement.competences) {
        doc.fontSize(14).font('Helvetica-Bold').text('6. COMPÉTENCES ACQUISES');
        doc.moveDown(0.5);
        doc.fontSize(11).font('Helvetica');
        
        if (suplement.competences.competencesTransversales?.length > 0) {
          doc.text('Compétences transversales :');
          suplement.competences.competencesTransversales.forEach(comp => {
            doc.text(`  • ${comp}`);
          });
          doc.moveDown();
        }

        if (suplement.competences.langues?.length > 0) {
          doc.text('Langues :');
          suplement.competences.langues.forEach(lang => {
            doc.text(`  • ${lang.langue} : ${lang.niveau}`);
          });
          doc.moveDown();
        }
      }

      // Certification
      doc.fontSize(14).font('Helvetica-Bold').text('7. CERTIFICATION');
      doc.moveDown(0.5);
      doc.fontSize(11).font('Helvetica');
      doc.text(`Certifié par : ${suplement.certifiePar || 'Autorité compétente'}`);
      doc.text(`Date de certification : ${this.formatDate(suplement.dateCertification)}`);
      doc.text(`Hash d\'intégrité : ${suplement.hashIntegrite?.substring(0, 30)}...`);

      // Pied de page
      this.addFooter(doc);

      doc.end();
    });
  }

  /**
   * Génère une attestation de réussite
   */
  async genererAttestationReussite(
    etudiantId: string,
    inscriptionId: string,
  ): Promise<Buffer> {
    // TODO: Implémenter la logique
    throw new BadRequestException('Non implémenté');
  }

  /**
   * Génère une attestation de scolarité
   */
  async genererAttestationScolarite(
    etudiantId: string,
    inscriptionId: string,
  ): Promise<Buffer> {
    // TODO: Implémenter la logique
    throw new BadRequestException('Non implémenté');
  }

  /**
   * Méthodes utilitaires privées
   */
  private addHeader(doc: PDFKit.PDFDocument, title: string): void {
    // Logo ou en-tête institutionnel
    doc.fontSize(20).font('Helvetica-Bold').text('IMTECH UNIVERSITY', { align: 'center' });
    doc.fontSize(12).font('Helvetica').text('BP XXX - Antananarivo - Madagascar', { align: 'center' });
    doc.fontSize(12).font('Helvetica').text('Tel: +261 XX XX XXX XX - Email: info@imtech.edu', { align: 'center' });
    doc.moveDown();
    
    // Ligne de séparation
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown();

    // Titre
    doc.fontSize(16).font('Helvetica-Bold').text(title, { align: 'center' });
    doc.moveDown();
  }

  private addEtudiantInfo(doc: PDFKit.PDFDocument, etudiant: Etudiant): void {
    doc.fontSize(12).font('Helvetica-Bold').text('INFORMATIONS ÉTUDIANT');
    doc.moveDown(0.5);
    
    doc.fontSize(11).font('Helvetica');
    doc.text(`Matricule : ${etudiant.matricule}`);
    doc.text(`Nom : ${etudiant.nom}`);
    doc.text(`Prénoms : ${etudiant.prenoms}`);
    doc.text(`Date de naissance : ${this.formatDate(etudiant.dateNaissance)}`);
    doc.text(`Lieu de naissance : ${etudiant.lieuNaissance}`);
    doc.moveDown();
  }

  private addNotesTable(doc: PDFKit.PDFDocument, resultats: any): void {
    doc.fontSize(12).font('Helvetica-Bold').text('RÉSULTATS PAR SEMESTRE');
    doc.moveDown(0.5);

    // TODO: Implémenter le tableau de notes
    doc.fontSize(11).font('Helvetica');
    doc.text('[Tableau des notes à implémenter]');
    doc.moveDown();
  }

  private addRecapitulatif(doc: PDFKit.PDFDocument, resultats: any): void {
    doc.fontSize(12).font('Helvetica-Bold').text('RÉCAPITULATIF');
    doc.moveDown(0.5);
    
    doc.fontSize(11).font('Helvetica');
    doc.text(`Moyenne générale : ${resultats.moyenneGenerale}/20`);
    doc.text(`Total crédits ECTS : ${resultats.totalCredits}`);
    doc.text(`Crédits acquis : ${resultats.creditsAcquis}`);
    doc.text(`Statut : ${resultats.statut}`);
    doc.moveDown();
  }

  private addFooter(doc: PDFKit.PDFDocument): void {
    doc.fontSize(8).font('Helvetica');
    doc.text('Document généré par IMTECH University - Système de gestion académique', { align: 'center' });
    doc.text(`Date d'émission : ${this.formatDate(new Date())}`, { align: 'center' });
  }

  private addDiplomeBorder(doc: PDFKit.PDFDocument): void {
    // Cadre décoratif autour du diplôme
    doc.lineWidth(2);
    doc.rect(40, 40, 515, 755).stroke();
    
    // Coins décoratifs
    const cornerSize = 30;
    // Coin supérieur gauche
    doc.moveTo(40, 40 + cornerSize).lineTo(40, 40).lineTo(40 + cornerSize, 40).stroke();
    // Coin supérieur droit
    doc.moveTo(555 - cornerSize, 40).lineTo(555, 40).lineTo(555, 40 + cornerSize).stroke();
    // Coin inférieur gauche
    doc.moveTo(40, 795 - cornerSize).lineTo(40, 795).lineTo(40 + cornerSize, 795).stroke();
    // Coin inférieur droit
    doc.moveTo(555 - cornerSize, 795).lineTo(555, 795).lineTo(555, 795 - cornerSize).stroke();
  }

  private addSignatures(doc: PDFKit.PDFDocument): void {
    const signatureY = doc.y;
    
    // Signature du Président
    doc.fontSize(10).font('Helvetica');
    doc.text('Le Président', 100, signatureY, { align: 'center' });
    doc.text('du Conseil d\'Administration', 100, signatureY + 15, { align: 'center' });
    doc.moveTo(50, signatureY + 40).lineTo(150, signatureY + 40).stroke();
    
    // Signature du Doyen
    doc.text('Le Doyen', 300, signatureY, { align: 'center' });
    doc.text('de la Faculté', 300, signatureY + 15, { align: 'center' });
    doc.moveTo(250, signatureY + 40).lineTo(350, signatureY + 40).stroke();
    
    // Sceau
    doc.text('SCEAU', 470, signatureY + 20, { align: 'center' });
    doc.circle(470, signatureY + 50, 20).stroke();
  }

  private formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  private async getResultatsEtudiant(
    etudiantId: string,
    inscriptionId: string,
    semestre?: number,
  ): Promise<any> {
    // TODO: Implémenter la récupération des résultats
    return {
      etudiant: {
        matricule: 'TEST001',
        nom: 'RAKOTO',
        prenoms: 'Jean Paul',
        dateNaissance: '2000-01-01',
        lieuNaissance: 'Antananarivo',
      },
      resultats: [],
      moyenneGenerale: 0,
      totalCredits: 0,
      creditsAcquis: 0,
      statut: 'En cours',
    };
  }
}
