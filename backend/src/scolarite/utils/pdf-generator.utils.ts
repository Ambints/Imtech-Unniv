import PDFDocument from 'pdfkit';
import * as https from 'https';
import * as http from 'http';
import { URL } from 'url';

export interface TenantInfo {
  nom: string;
  adresse: string;
  telephone: string;
  email_contact?: string;
  logo_url?: string;
  slogan?: string;
  pays?: string;
}

export interface DocumentHeader {
  tenant: TenantInfo;
  numeroDocument: string;
  dateDelivrance: Date;
}

/**
 * Télécharge une image depuis une URL ou convertit une Data URL en Buffer
 */
async function downloadImage(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      // Vérifier si c'est une Data URL (data:image/png;base64,...)
      if (url.startsWith('data:')) {
        try {
          // Extraire le contenu base64
          const matches = url.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
          if (matches && matches.length === 3) {
            const base64Data = matches[2];
            const buffer = Buffer.from(base64Data, 'base64');
            resolve(buffer);
          } else {
            reject(new Error('Invalid data URL format'));
          }
        } catch (error) {
          reject(error);
        }
        return;
      }
      
      // Sinon, télécharger depuis HTTP/HTTPS
      const parsedUrl = new URL(url);
      const protocol = parsedUrl.protocol === 'https:' ? https : http;
      
      protocol.get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download image: ${response.statusCode}`));
          return;
        }
        
        const chunks: Buffer[] = [];
        response.on('data', (chunk) => chunks.push(chunk));
        response.on('end', () => resolve(Buffer.concat(chunks)));
        response.on('error', reject);
      }).on('error', reject);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Ajoute l'en-tête du document avec logo et informations de l'université
 */
export async function addDocumentHeader(
  doc: PDFKit.PDFDocument,
  header: DocumentHeader,
  title: string
): Promise<void> {
  const pageWidth = doc.page.width;
  const margin = 50;
  
  // En-tête avec bordure
  doc.rect(margin, margin, pageWidth - 2 * margin, 120).stroke();
  
  let yPos = margin + 15;
  
  // Logo (si disponible)
  if (header.tenant.logo_url) {
    try {
      const logoBuffer = await downloadImage(header.tenant.logo_url);
      // Afficher le logo (80x80 pixels)
      doc.image(logoBuffer, margin + 15, yPos, {
        width: 80,
        height: 80,
        fit: [80, 80],
        align: 'center'
      });
    } catch (error) {
      console.error('Erreur chargement logo:', error);
      // Fallback: afficher un placeholder
      doc.fontSize(10).text('[LOGO]', margin + 15, yPos, { width: 80, align: 'center' });
    }
  }
  
  // Informations de l'université (à droite du logo)
  const textX = margin + 110;
  doc.fontSize(14)
     .font('Helvetica-Bold')
     .text(header.tenant.nom.toUpperCase(), textX, yPos, { 
       width: pageWidth - textX - margin - 10,
       align: 'center'
     });
  
  yPos += 20;
  
  if (header.tenant.slogan) {
    doc.fontSize(9)
       .font('Helvetica-Oblique')
       .text(header.tenant.slogan, textX, yPos, {
         width: pageWidth - textX - margin - 10,
         align: 'center'
       });
    yPos += 15;
  }
  
  doc.fontSize(9)
     .font('Helvetica')
     .text(header.tenant.adresse || '', textX, yPos, {
       width: pageWidth - textX - margin - 10,
       align: 'center'
     });
  
  yPos += 12;
  
  const contacts = [];
  if (header.tenant.telephone) contacts.push(`Tél: ${header.tenant.telephone}`);
  if (header.tenant.email_contact) contacts.push(`Email: ${header.tenant.email_contact}`);
  
  if (contacts.length > 0) {
    doc.fontSize(8)
       .text(contacts.join(' | '), textX, yPos, {
         width: pageWidth - textX - margin - 10,
         align: 'center'
       });
  }
  
  // Titre du document
  yPos = margin + 140;
  doc.fontSize(18)
     .font('Helvetica-Bold')
     .text(title.toUpperCase(), margin, yPos, {
       width: pageWidth - 2 * margin,
       align: 'center',
       underline: true
     });
  
  // Numéro de document
  yPos += 35;
  doc.fontSize(10)
     .font('Helvetica')
     .text(`N° ${header.numeroDocument}`, margin, yPos, {
       width: pageWidth - 2 * margin,
       align: 'center'
     });
}

/**
 * Ajoute le pied de page avec mentions légales et date
 */
export function addDocumentFooter(
  doc: PDFKit.PDFDocument,
  dateDelivrance: Date,
  mentionsLegales?: string
): void {
  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;
  const margin = 50;
  const footerY = pageHeight - 80;
  
  // Ligne de séparation
  doc.moveTo(margin, footerY)
     .lineTo(pageWidth - margin, footerY)
     .stroke();
  
  // Date de délivrance
  doc.fontSize(9)
     .font('Helvetica')
     .text(
       `Fait le ${dateDelivrance.toLocaleDateString('fr-FR', { 
         day: '2-digit', 
         month: 'long', 
         year: 'numeric' 
       })}`,
       margin,
       footerY + 10,
       { width: pageWidth - 2 * margin, align: 'right' }
     );
  
  // Mentions légales
  if (mentionsLegales) {
    doc.fontSize(7)
       .font('Helvetica-Oblique')
       .text(mentionsLegales, margin, footerY + 30, {
         width: pageWidth - 2 * margin,
         align: 'center'
       });
  }
}

/**
 * Ajoute une section de signature
 */
export async function addSignatureSection(
  doc: PDFKit.PDFDocument,
  yPos: number,
  signataire: {
    nom: string;
    fonction: string;
    signature_url?: string;
  },
  label: string = 'Le Responsable'
): Promise<number> {
  const pageWidth = doc.page.width;
  const margin = 50;
  const signatureX = pageWidth - margin - 200;
  
  doc.fontSize(10)
     .font('Helvetica-Bold')
     .text(label, signatureX, yPos);
  
  yPos += 15;
  
  // Espace pour la signature
  if (signataire.signature_url) {
    try {
      const signatureBuffer = await downloadImage(signataire.signature_url);
      // Afficher la signature (150x50 pixels)
      doc.image(signatureBuffer, signatureX, yPos, {
        width: 150,
        height: 50,
        fit: [150, 50]
      });
    } catch (error) {
      console.error('Erreur chargement signature:', error);
      // Fallback: afficher un placeholder
      doc.fontSize(9)
         .font('Helvetica-Oblique')
         .text('[Signature]', signatureX, yPos);
    }
  } else {
    doc.rect(signatureX, yPos, 150, 50).stroke();
  }
  
  yPos += 60;
  
  // Nom et fonction du signataire
  doc.fontSize(10)
     .font('Helvetica-Bold')
     .text(signataire.nom, signatureX, yPos);
  
  yPos += 15;
  
  doc.fontSize(9)
     .font('Helvetica-Oblique')
     .text(signataire.fonction, signatureX, yPos);
  
  return yPos + 20;
}

/**
 * Ajoute un champ d'information (label: valeur)
 */
export function addInfoField(
  doc: PDFKit.PDFDocument,
  x: number,
  y: number,
  label: string,
  value: string,
  options?: { bold?: boolean; width?: number }
): number {
  const width = options?.width || 400;
  
  doc.fontSize(10)
     .font('Helvetica-Bold')
     .text(`${label}: `, x, y, { continued: true, width })
     .font(options?.bold ? 'Helvetica-Bold' : 'Helvetica')
     .text(value || 'N/A');
  
  return y + 15;
}

/**
 * Génère un certificat d'inscription ou de scolarité
 */
export async function generateCertificatInscription(
  tenant: TenantInfo,
  data: {
    numero_document: string;
    date_delivrance: Date;
    etudiant: {
      matricule: string;
      nom: string;
      prenom: string;
      date_naissance: Date;
      lieu_naissance: string;
    };
    formation: {
      parcours_nom: string;
      niveau: string;
      annee_academique: string;
      date_inscription: Date;
    };
    signataire: {
      nom: string;
      fonction: string;
      signature_url?: string;
    };
    titre?: string;  // Titre personnalisé (optionnel)
  }
): Promise<PDFKit.PDFDocument> {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  
  // Titre par défaut ou personnalisé
  const titre = data.titre || 'Certificat d\'Inscription';
  
  // En-tête
  await addDocumentHeader(doc, {
    tenant,
    numeroDocument: data.numero_document,
    dateDelivrance: data.date_delivrance
  }, titre);
  
  // Corps du document
  let yPos = 280;
  const margin = 50;
  
  doc.fontSize(11)
     .font('Helvetica')
     .text(
       'Le Président de l\'Université certifie que :',
       margin,
       yPos,
       { width: doc.page.width - 2 * margin }
     );
  
  yPos += 30;
  
  // Informations étudiant
  yPos = addInfoField(doc, margin + 20, yPos, 'Nom et Prénom', 
    `${data.etudiant.nom} ${data.etudiant.prenom}`, { bold: true });
  yPos = addInfoField(doc, margin + 20, yPos, 'Matricule', data.etudiant.matricule);
  yPos = addInfoField(doc, margin + 20, yPos, 'Né(e) le', 
    data.etudiant.date_naissance.toLocaleDateString('fr-FR'));
  yPos = addInfoField(doc, margin + 20, yPos, 'À', data.etudiant.lieu_naissance);
  
  yPos += 20;
  
  // Informations formation
  doc.fontSize(11)
     .font('Helvetica')
     .text(
       `Est régulièrement inscrit(e) pour l'année universitaire ${data.formation.annee_academique} en :`,
       margin,
       yPos,
       { width: doc.page.width - 2 * margin }
     );
  
  yPos += 25;
  
  yPos = addInfoField(doc, margin + 20, yPos, 'Formation', 
    data.formation.parcours_nom, { bold: true });
  yPos = addInfoField(doc, margin + 20, yPos, 'Niveau', data.formation.niveau);
  yPos = addInfoField(doc, margin + 20, yPos, 'Date d\'inscription', 
    data.formation.date_inscription.toLocaleDateString('fr-FR'));
  
  yPos += 30;
  
  doc.fontSize(10)
     .font('Helvetica-Oblique')
     .text(
       'Le présent certificat est délivré pour servir et valoir ce que de droit.',
       margin,
       yPos,
       { width: doc.page.width - 2 * margin, align: 'justify' }
     );
  
  // Signature
  yPos += 50;
  await addSignatureSection(doc, yPos, data.signataire, 'Le Président');
  
  // Pied de page
  addDocumentFooter(doc, data.date_delivrance,
    'Document officiel - Toute falsification est passible de poursuites');
  
  return doc;
}

/**
 * Génère une attestation de présence en stage
 */
export async function generateAttestationStage(
  tenant: TenantInfo,
  data: {
    numero_document: string;
    date_delivrance: Date;
    stagiaire: {
      matricule: string;
      nom: string;
      prenom: string;
      parcours_nom: string;
      niveau: string;
    };
    stage: {
      organisme_nom: string;
      organisme_adresse: string;
      date_debut: Date;
      date_fin: Date;
      duree: string;
      sujet: string;
      maitre_stage_nom?: string;
      maitre_stage_fonction?: string;
    };
    signataire: {
      nom: string;
      fonction: string;
      signature_url?: string;
    };
  }
): Promise<PDFKit.PDFDocument> {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  
  // En-tête
  await addDocumentHeader(doc, {
    tenant,
    numeroDocument: data.numero_document,
    dateDelivrance: data.date_delivrance
  }, 'Attestation de Présence en Stage');
  
  // Corps du document
  let yPos = 280;
  const margin = 50;
  
  doc.fontSize(11)
     .font('Helvetica')
     .text(
       'Le soussigné, Responsable des Stages, atteste que :',
       margin,
       yPos,
       { width: doc.page.width - 2 * margin }
     );
  
  yPos += 30;
  
  // Informations stagiaire
  yPos = addInfoField(doc, margin + 20, yPos, 'Nom et Prénom', 
    `${data.stagiaire.nom} ${data.stagiaire.prenom}`, { bold: true });
  yPos = addInfoField(doc, margin + 20, yPos, 'Matricule', data.stagiaire.matricule);
  yPos = addInfoField(doc, margin + 20, yPos, 'Formation', 
    `${data.stagiaire.parcours_nom} - ${data.stagiaire.niveau}`);
  
  yPos += 20;
  
  doc.fontSize(11)
     .font('Helvetica')
     .text(
       'A effectué un stage au sein de :',
       margin,
       yPos,
       { width: doc.page.width - 2 * margin }
     );
  
  yPos += 25;
  
  // Informations organisme
  yPos = addInfoField(doc, margin + 20, yPos, 'Organisme', 
    data.stage.organisme_nom, { bold: true });
  yPos = addInfoField(doc, margin + 20, yPos, 'Adresse', data.stage.organisme_adresse);
  
  yPos += 15;
  
  // Période du stage
  yPos = addInfoField(doc, margin + 20, yPos, 'Période', 
    `Du ${data.stage.date_debut.toLocaleDateString('fr-FR')} au ${data.stage.date_fin.toLocaleDateString('fr-FR')}`);
  yPos = addInfoField(doc, margin + 20, yPos, 'Durée', data.stage.duree);
  yPos = addInfoField(doc, margin + 20, yPos, 'Sujet', data.stage.sujet);
  
  if (data.stage.maitre_stage_nom) {
    yPos += 15;
    yPos = addInfoField(doc, margin + 20, yPos, 'Maître de stage', 
      `${data.stage.maitre_stage_nom} - ${data.stage.maitre_stage_fonction || ''}`);
  }
  
  yPos += 30;
  
  doc.fontSize(10)
     .font('Helvetica-Oblique')
     .text(
       'La présente attestation est délivrée pour servir et valoir ce que de droit.',
       margin,
       yPos,
       { width: doc.page.width - 2 * margin, align: 'justify' }
     );
  
  // Signature
  yPos += 50;
  await addSignatureSection(doc, yPos, data.signataire, 'Le Responsable des Stages');
  
  // Pied de page
  addDocumentFooter(doc, data.date_delivrance,
    'Document officiel - Toute falsification est passible de poursuites');
  
  return doc;
}

/**
 * Génère une attestation de réussite
 */
export async function generateAttestationReussite(
  tenant: TenantInfo,
  data: {
    numero_document: string;
    date_delivrance: Date;
    etudiant: {
      matricule: string;
      nom: string;
      prenom: string;
      date_naissance: Date;
      lieu_naissance: string;
    };
    formation: {
      diplome: string;
      specialite?: string;
      niveau: string;
      annee_academique: string;
    };
    resultat: {
      mention?: string;
      moyenne?: number;
      date_soutenance?: Date;
      session: string;
    };
    signataire: {
      nom: string;
      fonction: string;
      signature_url?: string;
    };
  }
): Promise<PDFKit.PDFDocument> {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  
  // En-tête
  await addDocumentHeader(doc, {
    tenant,
    numeroDocument: data.numero_document,
    dateDelivrance: data.date_delivrance
  }, 'Attestation de Réussite');
  
  // Corps du document
  let yPos = 280;
  const margin = 50;
  
  doc.fontSize(11)
     .font('Helvetica')
     .text(
       'Le Président de l\'Université atteste que :',
       margin,
       yPos,
       { width: doc.page.width - 2 * margin }
     );
  
  yPos += 30;
  
  // Informations étudiant
  yPos = addInfoField(doc, margin + 20, yPos, 'Nom et Prénom', 
    `${data.etudiant.nom} ${data.etudiant.prenom}`, { bold: true });
  yPos = addInfoField(doc, margin + 20, yPos, 'Matricule', data.etudiant.matricule);
  yPos = addInfoField(doc, margin + 20, yPos, 'Né(e) le', 
    data.etudiant.date_naissance.toLocaleDateString('fr-FR'));
  yPos = addInfoField(doc, margin + 20, yPos, 'À', data.etudiant.lieu_naissance);
  
  yPos += 20;
  
  doc.fontSize(11)
     .font('Helvetica')
     .text(
       `A satisfait aux épreuves de ${data.formation.diplome} pour l'année universitaire ${data.formation.annee_academique} :`,
       margin,
       yPos,
       { width: doc.page.width - 2 * margin }
     );
  
  yPos += 25;
  
  // Informations formation
  yPos = addInfoField(doc, margin + 20, yPos, 'Diplôme', 
    data.formation.diplome, { bold: true });
  if (data.formation.specialite) {
    yPos = addInfoField(doc, margin + 20, yPos, 'Spécialité', data.formation.specialite);
  }
  yPos = addInfoField(doc, margin + 20, yPos, 'Niveau', data.formation.niveau);
  yPos = addInfoField(doc, margin + 20, yPos, 'Session', 
    data.resultat.session === 'normale' ? 'Session normale' : 'Session de rattrapage');
  
  yPos += 15;
  
  // Résultats
  if (data.resultat.mention) {
    yPos = addInfoField(doc, margin + 20, yPos, 'Mention', 
      data.resultat.mention, { bold: true });
  }
  if (data.resultat.moyenne) {
    yPos = addInfoField(doc, margin + 20, yPos, 'Moyenne générale', 
      `${data.resultat.moyenne.toFixed(2)}/20`);
  }
  if (data.resultat.date_soutenance) {
    yPos = addInfoField(doc, margin + 20, yPos, 'Date de soutenance', 
      data.resultat.date_soutenance.toLocaleDateString('fr-FR'));
  }
  
  yPos += 30;
  
  doc.fontSize(10)
     .font('Helvetica-Oblique')
     .text(
       'La présente attestation est délivrée en attendant l\'établissement du diplôme définitif.',
       margin,
       yPos,
       { width: doc.page.width - 2 * margin, align: 'justify' }
     );
  
  // Signature
  yPos += 50;
  await addSignatureSection(doc, yPos, data.signataire, 'Le Président');
  
  // Pied de page
  addDocumentFooter(doc, data.date_delivrance,
    'Document provisoire - Le diplôme définitif sera délivré ultérieurement');
  
  return doc;
}

// Made with Bob
