const fs = require('fs');
const path = require('path');

console.log('🔧 Correction des URLs rp-enhanced dans le frontend...\n');

// Liste des fichiers à corriger (basée sur la recherche précédente)
const filesToFix = [
  'src/pages/pedagogique/StatistiquesPage.tsx',
  'src/pages/pedagogique/RPManagementPage.tsx',
  'src/pages/pedagogique/RPDashboardSimple.tsx',
  'src/pages/pedagogique/ReferentielsPage.tsx',
  'src/pages/pedagogique/PVPage.tsx',
  'src/pages/pedagogique/MaquettesPage.tsx',
  'src/pages/pedagogique/AffectationsPage.tsx'
];

let totalChanges = 0;
const modifiedFiles = [];

filesToFix.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Fichier non trouvé: ${file}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  // Remplacer toutes les occurrences de /rp-enhanced/${tid}/ par /rp-enhanced/
  content = content.replace(/\/rp-enhanced\/\$\{tid\}\//g, '/rp-enhanced/');
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    const changes = (originalContent.match(/\/rp-enhanced\/\$\{tid\}\//g) || []).length;
    totalChanges += changes;
    modifiedFiles.push({ file, changes });
    console.log(`✅ ${file}: ${changes} URL(s) corrigée(s)`);
  }
});

console.log(`\n📊 Résumé:`);
console.log(`   Fichiers modifiés: ${modifiedFiles.length}`);
console.log(`   Total URLs corrigées: ${totalChanges}`);

if (modifiedFiles.length > 0) {
  console.log(`\n📁 Fichiers modifiés:`);
  modifiedFiles.forEach(({ file, changes }) => {
    console.log(`   - ${file} (${changes} changement${changes > 1 ? 's' : ''})`);
  });
}

console.log('\n✅ Correction terminée!');

// Made with Bob
