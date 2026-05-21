import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { AdminService } from '../src/admin/admin.service';
import { DataSource } from 'typeorm';

/**
 * Script d'automatisation des backups quotidiens
 * À exécuter via cron job quotidien
 */

async function runDailyBackups() {
  console.log('🔄 Début des backups quotidiens -', new Date().toISOString());
  
  let app;
  let successCount = 0;
  let failureCount = 0;

  try {
    // Initialiser l'application NestJS
    app = await NestFactory.createApplicationContext(AppModule);
    const adminService = app.get(AdminService);
    const dataSource = app.get(DataSource);

    // Récupérer tous les tenants actifs
    const tenantsQuery = 'SELECT id, nom, slug FROM public.tenant WHERE actif = true';
    const tenants = await dataSource.query(tenantsQuery);

    console.log(`📊 ${tenants.length} universités à sauvegarder`);

    // Créer un backup pour chaque tenant
    for (const tenant of tenants) {
      try {
        console.log(`💾 Backup en cours pour: ${tenant.nom} (${tenant.slug})`);
        
        const result = await adminService.createBackup(tenant.id);
        
        if (result.success) {
          console.log(`✅ Backup réussi pour ${tenant.nom}: ${result.backupId}`);
          successCount++;
        } else {
          console.error(`❌ Backup échoué pour ${tenant.nom}: ${result.message}`);
          failureCount++;
        }
      } catch (error: any) {
        console.error(`❌ Erreur backup pour ${tenant.nom}:`, error.message);
        failureCount++;
      }
    }

    // Nettoyer les anciens backups (plus de 30 jours)
    try {
      console.log('🧹 Nettoyage des anciens backups...');
      const cleanupResult = await adminService.cleanupOldBackups();
      
      if (cleanupResult.success) {
        console.log(`✅ Nettoyage terminé: ${cleanupResult.deleted} anciens backups supprimés`);
      } else {
        console.error(`❌ Erreur nettoyage: ${cleanupResult.message}`);
      }
    } catch (error: any) {
      console.error('❌ Erreur lors du nettoyage:', error.message);
    }

    // Envoyer un rapport par email si configuré
    if (process.env.ADMIN_EMAIL && (failureCount > 0 || process.env.ALWAYS_SEND_REPORT === 'true')) {
      await sendBackupReport(successCount, failureCount, tenants.length);
    }

    console.log(`📈 Résumé: ${successCount} succès, ${failureCount} échecs sur ${tenants.length} universités`);

  } catch (error: any) {
    console.error('💥 Erreur critique lors des backups quotidiens:', error);
    failureCount = 0; // Valeur par défaut si erreur avant la récupération des tenants
  } finally {
    // Fermer l'application proprement
    if (app) {
      await app.close();
    }
  }

  // Sortir avec le code approprié
  process.exit(failureCount > 0 ? 1 : 0);
}

/**
 * Envoie un rapport de backup par email
 */
async function sendBackupReport(successCount: number, failureCount: number, totalCount: number) {
  try {
    // Importer le service email si disponible
    const { EmailService } = await import('../src/email/email.service');
    const emailService = new EmailService();

    const subject = failureCount > 0 
      ? '⚠️ Rapport de backup quotidien - Erreurs détectées' 
      : '✅ Rapport de backup quotidien - Succès';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Rapport de backup quotidien</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2c3e50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .success { background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 4px; margin: 10px 0; }
          .error { background: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 4px; margin: 10px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🗄️ IMTECH University</h1>
            <p>Rapport de backup quotidien</p>
          </div>
          
          <div class="content">
            <p>Bonjour,</p>
            
            <p>Voici le rapport des backups quotidiens du ${new Date().toLocaleDateString('fr-FR')} :</p>
            
            <div class="${failureCount === 0 ? 'success' : 'error'}">
              <h3>📊 Statistiques</h3>
              <ul>
                <li><strong>Total universités :</strong> ${totalCount}</li>
                <li><strong>Backups réussis :</strong> ${successCount}</li>
                <li><strong>Backups échoués :</strong> ${failureCount}</li>
                <li><strong>Taux de succès :</strong> ${Math.round((successCount / totalCount) * 100)}%</li>
              </ul>
            </div>
            
            ${failureCount > 0 ? `
              <div class="error">
                <h3>⚠️ Actions requises</h3>
                <p>${failureCount} backup(s) ont échoué. Veuillez vérifier les logs système et résoudre les problèmes.</p>
              </div>
            ` : ''}
            
            <p><strong>Prochain backup :</strong> Demain à la même heure</p>
          </div>
          
          <div class="footer">
            <p>Ce rapport a été généré automatiquement par IMTECH University</p>
            <p>© 2024 IMTECH University - Tous droits réservés</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await emailService.sendCredentialsEmail(
      process.env.ADMIN_EMAIL!,
      'Administrateur',
      'Système',
      '',
      'Backup Report',
      ''
    );

    console.log('📧 Rapport envoyé par email');
  } catch (error: any) {
    console.error('❌ Erreur lors de l\'envoi du rapport:', error.message);
  }
}

// Exécuter les backups
if (require.main === module) {
  runDailyBackups().catch(error => {
    console.error('Erreur fatale:', error);
    process.exit(1);
  });
}

export { runDailyBackups };
