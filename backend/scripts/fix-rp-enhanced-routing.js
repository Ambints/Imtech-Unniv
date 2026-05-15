const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/pedagogique/rp-enhanced.controller.ts');

console.log('🔧 Correction du routing rp-enhanced.controller.ts...\n');

// Lire le fichier
let content = fs.readFileSync(filePath, 'utf8');

// Remplacements à effectuer
const replacements = [
  // getMesParcours
  { from: "@Get(':tid/mes-parcours')", to: "@Get('mes-parcours')" },
  { from: "@ApiParam({ name: 'tid', description: 'Tenant ID' })\n  @ApiResponse({ status: 200, description: 'Liste des parcours récupérée avec succès' })\n  @ApiResponse({ status: 403, description: 'Accès interdit' })\n  getMesParcours(\n    @Param('tid') tid: string,\n    @CurrentUser() user: any\n  ) {\n    return this.rpService.getMesParcours(tid, user.id);", 
    to: "@ApiResponse({ status: 200, description: 'Liste des parcours récupérée avec succès' })\n  @ApiResponse({ status: 403, description: 'Accès interdit' })\n  getMesParcours(\n    @Req() req: Request,\n    @CurrentUser() user: any\n  ) {\n    return this.rpService.getMesParcours(this.getTenantId(req), user.id);" },
  
  // Toutes les autres routes avec :tid
  { from: /@Get\(':tid\//g, to: "@Get('" },
  { from: /@Post\(':tid\//g, to: "@Post('" },
  { from: /@Patch\(':tid\//g, to: "@Patch('" },
  { from: /@Delete\(':tid\//g, to: "@Delete('" },
  
  // Supprimer les @ApiParam tid
  { from: /  @ApiParam\({ name: 'tid', description: 'Tenant ID' }\)\n/g, to: "" },
  
  // Remplacer @Param('tid') tid: string par @Req() req: Request (au début des paramètres)
  { from: /\(\n    @Param\('tid'\) tid: string,/g, to: "(\n    @Req() req: Request," },
  
  // Remplacer les appels this.rpService.xxx(tid, par this.rpService.xxx(this.getTenantId(req),
  { from: /this\.rpService\.(\w+)\(tid,/g, to: "this.rpService.$1(this.getTenantId(req)," },
];

let changeCount = 0;

replacements.forEach((replacement, index) => {
  const before = content;
  if (replacement.from instanceof RegExp) {
    content = content.replace(replacement.from, replacement.to);
  } else {
    content = content.split(replacement.from).join(replacement.to);
  }
  
  if (before !== content) {
    changeCount++;
    console.log(`✅ Remplacement ${index + 1} effectué`);
  }
});

// Écrire le fichier modifié
fs.writeFileSync(filePath, content, 'utf8');

console.log(`\n✅ Fichier corrigé avec succès!`);
console.log(`📊 ${changeCount} remplacements effectués`);
console.log(`📁 Fichier: ${filePath}`);

// Made with Bob
