const fs = require('fs');
const path = require('path');

// Mapping des colonnes DB vers les propriétés d'entités
const fixes = {
  'etudiant.entity.ts': [
    // Supprimer informationsMedicales qui n'existe pas
    { from: /  @Column\({ type: 'text', nullable: true, name: 'informations_medicales' }\)\n  informationsMedicales: string;\n\n/, to: '' },
    // Supprimer statut qui n'existe pas (DB a 'actif' boolean)
    { from: /  @Column\({ type: 'varchar', length: 20, default: 'actif' }\)\n  statut: string;\n\n/, to: '' },
  ],
  'parcours.entity.ts': [
    { from: '@Column({ type: \'smallint\', name: \'duree_annees\' })\n  dureeAnnees:', to: '@Column({ type: \'smallint\', name: \'duree_annees\' })\n  dureeAnnees:' },
    { from: '@Column({ type: \'uuid\', nullable: true, name: \'responsable_id\' })\n  responsableId:', to: '@Column({ type: \'uuid\', nullable: true, name: \'responsable_id\' })\n  responsableId:' },
    { from: '@Column({ type: \'integer\', nullable: true, name: \'annee_ouverture\' })\n  anneeOuverture:', to: '@Column({ type: \'integer\', nullable: true, name: \'annee_ouverture\' })\n  anneeOuverture:' },
    { from: '@CreateDateColumn({ type: \'timestamptz\', name: \'created_at\' })\n  createdAt:', to: '@CreateDateColumn({ type: \'timestamptz\', name: \'created_at\' })\n  createdAt:' },
    { from: '@UpdateDateColumn({ type: \'timestamptz\', name: \'updated_at\' })\n  updatedAt:', to: '@UpdateDateColumn({ type: \'timestamptz\', name: \'updated_at\' })\n  updatedAt:' },
    // Supprimer domaine qui n'existe pas
    { from: /  @Column\({ type: 'varchar', length: 100, nullable: true }\)\n  domaine: string;\n\n/, to: '' },
  ],
  'inscription.entity.ts': [
    { from: '@Column({ type: \'smallint\' })\n  anneeNiveau:', to: '@Column({ type: \'smallint\', name: \'annee_niveau\' })\n  anneeNiveau:' },
    { from: '@Column({ type: \'varchar\', length: 20 })\n  typeInscription:', to: '@Column({ type: \'varchar\', length: 20, name: \'type_inscription\' })\n  typeInscription:' },
    { from: '@Column({ type: \'varchar\', length: 50, nullable: true })\n  numeroCarte:', to: '@Column({ type: \'varchar\', length: 50, nullable: true, name: \'numero_carte\' })\n  numeroCarte:' },
    { from: '@Column({ type: \'date\' })\n  dateInscription:', to: '@Column({ type: \'date\', name: \'date_inscription\' })\n  dateInscription:' },
    { from: '@Column({ type: \'varchar\', length: 50, nullable: true })\n  typeBourse:', to: '@Column({ type: \'varchar\', length: 50, nullable: true, name: \'type_bourse\' })\n  typeBourse:' },
    { from: '@Column({ type: \'decimal\', precision: 10, scale: 2, nullable: true })\n  montantBourse:', to: '@Column({ type: \'decimal\', precision: 10, scale: 2, nullable: true, name: \'montant_bourse\' })\n  montantBourse:' },
    { from: '@Column({ type: \'uuid\', nullable: true })\n  valideeePar:', to: '@Column({ type: \'uuid\', nullable: true, name: \'validee_par\' })\n  valideePar:' },
    { from: '@CreateDateColumn({ type: \'timestamptz\' })\n  createdAt:', to: '@CreateDateColumn({ type: \'timestamptz\', name: \'created_at\' })\n  createdAt:' },
    { from: '@UpdateDateColumn({ type: \'timestamptz\' })\n  updatedAt:', to: '@UpdateDateColumn({ type: \'timestamptz\', name: \'updated_at\' })\n  updatedAt:' },
  ],
  'utilisateur.entity.ts': [
    { from: '@Column({ type: \'varchar\', length: 255 })\n  passwordHash:', to: '@Column({ type: \'varchar\', length: 255, name: \'password_hash\' })\n  passwordHash:' },
    { from: '@Column({ type: \'varchar\', length: 500, nullable: true })\n  photoUrl:', to: '@Column({ type: \'varchar\', length: 500, nullable: true, name: \'photo_url\' })\n  photoUrl:' },
    { from: '@Column({ type: \'boolean\', default: false })\n  emailVerifie:', to: '@Column({ type: \'boolean\', default: false, name: \'email_verifie\' })\n  emailVerifie:' },
    { from: '@Column({ type: \'timestamptz\', nullable: true })\n  derniereConnexion:', to: '@Column({ type: \'timestamptz\', nullable: true, name: \'derniere_connexion\' })\n  derniereConnexion:' },
    { from: '@Column({ type: \'text\', nullable: true })\n  tokenReset:', to: '@Column({ type: \'text\', nullable: true, name: \'token_reset\' })\n  tokenReset:' },
    { from: '@Column({ type: \'timestamptz\', nullable: true })\n  tokenResetExpiry:', to: '@Column({ type: \'timestamptz\', nullable: true, name: \'token_reset_expiry\' })\n  tokenResetExpiry:' },
    { from: '@CreateDateColumn({ type: \'timestamptz\' })\n  createdAt:', to: '@CreateDateColumn({ type: \'timestamptz\', name: \'created_at\' })\n  createdAt:' },
    { from: '@UpdateDateColumn({ type: \'timestamptz\' })\n  updatedAt:', to: '@UpdateDateColumn({ type: \'timestamptz\', name: \'updated_at\' })\n  updatedAt:' },
  ],
};

const entitiesDir = path.join(__dirname, '../src/scolarite/entities');

Object.keys(fixes).forEach(filename => {
  const filepath = path.join(entitiesDir, filename);
  
  if (!fs.existsSync(filepath)) {
    console.log(`⚠️  Fichier non trouvé: ${filename}`);
    return;
  }
  
  let content = fs.readFileSync(filepath, 'utf8');
  let modified = false;
  
  fixes[filename].forEach(fix => {
    if (fix.from instanceof RegExp) {
      if (fix.from.test(content)) {
        content = content.replace(fix.from, fix.to);
        modified = true;
      }
    } else {
      if (content.includes(fix.from)) {
        content = content.replace(fix.from, fix.to);
        modified = true;
      }
    }
  });
  
  if (modified) {
    fs.writeFileSync(filepath, content, 'utf8');
    console.log(`✅ ${filename} corrigé`);
  } else {
    console.log(`ℹ️  ${filename} déjà à jour`);
  }
});

console.log('\n✅ Toutes les entités ont été corrigées!');
console.log('Redémarrez le serveur NestJS maintenant.');

// Made with Bob
