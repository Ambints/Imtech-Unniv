import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Configuration du transporteur SMTP
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER || process.env.EMAIL_USER,
        pass: process.env.SMTP_PASSWORD || process.env.EMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false, // Pour les environnements de développement
      },
    });
  }

  /**
   * Envoie un email avec les identifiants de connexion
   */
  async sendCredentialsEmail(
    email: string,
    nom: string,
    prenom: string,
    password: string,
    role: string,
    universityName?: string,
  ): Promise<boolean> {
    try {
      const subject = 'Vos identifiants de connexion - IMTECH University';
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Identifiants de connexion - IMTECH University</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2c3e50; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .credentials { background: white; padding: 15px; border-left: 4px solid #3498db; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            .btn { display: inline-block; padding: 10px 20px; background: #3498db; color: white; text-decoration: none; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎓 IMTECH University</h1>
              <p>Vos identifiants de connexion</p>
            </div>
            
            <div class="content">
              <p>Bonjour ${prenom} ${nom},</p>
              
              <p>Votre compte a été créé avec succès sur la plateforme IMTECH University${universityName ? ` - ${universityName}` : ''}.</p>
              
              <div class="credentials">
                <h3>🔐 Vos identifiants de connexion</h3>
                <p><strong>Email :</strong> ${email}</p>
                <p><strong>Mot de passe :</strong> <code style="background: #f0f0f0; padding: 2px 4px; border-radius: 3px;">${password}</code></p>
                <p><strong>Rôle :</strong> ${role}</p>
              </div>
              
              <p><strong>⚠️ Important :</strong></p>
              <ul>
                <li>Conservez ce mot de passe en lieu sûr</li>
                <li>Vous devrez changer votre mot de passe lors de votre première connexion</li>
                <li>N'utilisez jamais ce mot de passe sur d'autres sites</li>
              </ul>
              
              <p style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" class="btn">
                  Me connecter maintenant
                </a>
              </p>
              
              <p>Si vous n'avez pas demandé la création de ce compte, veuillez contacter immédiatement l'administrateur système.</p>
            </div>
            
            <div class="footer">
              <p>Cet email a été généré automatiquement par IMTECH University</p>
              <p>© 2024 IMTECH University - Tous droits réservés</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const textContent = `
        IMTECH University - Vos identifiants de connexion
        
        Bonjour ${prenom} ${nom},
        
        Votre compte a été créé avec succès sur la plateforme IMTECH University${universityName ? ` - ${universityName}` : ''}.
        
        Vos identifiants de connexion :
        Email : ${email}
        Mot de passe : ${password}
        Rôle : ${role}
        
        Important :
        - Conservez ce mot de passe en lieu sûr
        - Vous devrez changer votre mot de passe lors de votre première connexion
        - N'utilisez jamais ce mot de passe sur d'autres sites
        
        URL de connexion : ${process.env.FRONTEND_URL || 'http://localhost:3000'}/login
        
        Si vous n'avez pas demandé la création de ce compte, veuillez contacter immédiatement l'administrateur système.
        
        © 2024 IMTECH University - Tous droits réservés
      `;

      await this.transporter.sendMail({
        from: `"IMTECH University" <${process.env.SMTP_FROM || process.env.EMAIL_USER}>`,
        to: email,
        subject: subject,
        text: textContent,
        html: htmlContent,
      });

      console.log(`Email d'identifiants envoyé à ${email}`);
      return true;
    } catch (error: any) {
      console.error('Erreur lors de l\'envoi d\'email:', error);
      // Ne pas lancer d'erreur pour ne pas bloquer la création d'utilisateur
      return false;
    }
  }

  /**
   * Envoie un email de réinitialisation de mot de passe
   */
  async sendPasswordResetEmail(
    email: string,
    nom: string,
    prenom: string,
    resetToken: string,
  ): Promise<boolean> {
    try {
      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Réinitialisation de mot de passe - IMTECH University</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #e74c3c; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .alert { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 4px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            .btn { display: inline-block; padding: 10px 20px; background: #e74c3c; color: white; text-decoration: none; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 IMTECH University</h1>
              <p>Réinitialisation de mot de passe</p>
            </div>
            
            <div class="content">
              <p>Bonjour ${prenom} ${nom},</p>
              
              <div class="alert">
                <strong>⚠️ Sécurité :</strong> Vous avez demandé la réinitialisation de votre mot de passe.
              </div>
              
              <p>Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe :</p>
              
              <p style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" class="btn">
                  Réinitialiser mon mot de passe
                </a>
              </p>
              
              <p><strong>Important :</strong></p>
              <ul>
                <li>Ce lien expire dans 1 heure</li>
                <li>Ne partagez jamais ce lien avec quelqu'un d'autre</li>
                <li>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email</li>
              </ul>
              
              <p>Si le bouton ne fonctionne pas, copiez-collez ce lien dans votre navigateur :</p>
              <p><code>${resetUrl}</code></p>
            </div>
            
            <div class="footer">
              <p>Cet email a été généré automatiquement par IMTECH University</p>
              <p>© 2024 IMTECH University - Tous droits réservés</p>
            </div>
          </div>
        </body>
        </html>
      `;

      await this.transporter.sendMail({
        from: `"IMTECH University" <${process.env.SMTP_FROM || process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Réinitialisation de mot de passe - IMTECH University',
        html: htmlContent,
      });

      console.log(`Email de réinitialisation envoyé à ${email}`);
      return true;
    } catch (error: any) {
      console.error('Erreur lors de l\'envoi d\'email de réinitialisation:', error);
      return false;
    }
  }

  /**
   * Vérifie la configuration SMTP
   */
  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('Configuration SMTP vérifiée avec succès');
      return true;
    } catch (error: any) {
      console.error('Erreur de configuration SMTP:', error);
      return false;
    }
  }
}
