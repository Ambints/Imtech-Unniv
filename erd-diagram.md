# Diagramme ERD - Système de Gestion Universitaire IMTECH

## Vue d'Ensemble

```mermaid
erDiagram
    %% UTILISATEURS ET AUTHENTIFICATION
    User ||--o{ User } : "Gère les utilisateurs"
    SuperAdmin ||--o{ SuperAdmin } : "Administrateurs système"
    Utilisateur ||--o{ Utilisateur } : "Utilisateurs standards"
    
    %% MULTI-TENANCY
    Tenant ||--o{ Tenant } : "Universités/Établissements"
    Tenant ||--|| User : "Appartenance tenant"
    
    %% GOUVERNANCE ET HAUTE DIRECTION
    President ||--o{ President } : "Président d'université"
    President ||--|| DecisionPresidentielle : "Décisions présidentielles"
    President ||--|| ValidationRecrutement : "Validations recrutement"
    President ||--|| Arbitrage : "Arbitrages"
    President ||--|| ConseilUniversitaire : "Conseils universitaires"
    
    %% SURVEILLANCE GÉNÉRALE
    SurveillantGeneral ||--o{ SurveillantGeneral } : "Surveillants généraux"
    SurveillantGeneral ||--|| AppelNumerique : "Appels numériques"
    SurveillantGeneral ||--|| IncidentDisciplinaire : "Incidents disciplinaires"
    SurveillantGeneral ||--|| OrganisationExamen : "Organisations examens"
    SurveillantGeneral ||--|| RapportSurveillance : "Rapports surveillance"
    
    %% LOGISTIQUE ET ENTRETIEN
    ResponsableLogistique ||--o{ ResponsableLogistique } : "Responsables logistique"
    ResponsableLogistique ||--|| ServiceEntretien : "Services entretien"
    ResponsableLogistique ||--|| PlanningNettoyage : "Plannings nettoyage"
    ResponsableLogistique ||--|| MaintenancePreventive : "Maintenances préventives"
    ResponsableLogistique ||--|| RapportEntretien : "Rapports entretien"
    ResponsableLogistique ||--|| StockProduitsMenage : "Stocks produits ménage"
    
    %% FINANCE ET ÉCONOMAT
    GrilleTarifaire ||--o{ GrilleTarifaire } : "Grilles tarifaires"
    Echeancier ||--o{ Echeancier } : "Échéanciers paiement"
    Paiement ||--o{ Paiement } : "Paiements"
    Budget ||--o{ Budget } : "Budgets"
    Depense ||--o{ Depense } : "Dépenses"
    ContratPersonnel ||--o{ ContratPersonnel } : "Contrats personnel"
    FichePaie ||--o{ FichePaie } : "Fiches de paie"
    
    %% SCOLARITÉ ET PÉDAGOGIE
    Etudiant ||--o{ Etudiant } : "Étudiants"
    Inscription ||--o{ Inscription } : "Inscriptions"
    Parcours ||--o{ Parcours } : "Parcours académiques"
    UniteEnseignement ||--o{ UniteEnseignement } : "Unités d'enseignement"
    ElementConstitutif ||--o{ ElementConstitutif } : "Éléments constitutifs"
    AnneeAcademique ||--o{ AnneeAcademique } : "Années académiques"
    CalendrierAcademique ||--o{ CalendrierAcademique } : "Calendriers académiques"
    Enseignant ||--o{ Enseignant } : "Enseignants"
    AffectationCours ||--o{ AffectationCours } : "Affectations cours"
    Salle ||--o{ Salle } : "Salles"
    Batiment ||--o{ Batiment } : "Bâtiments"
    EmploiDuTemps ||--o{ EmploiDuTemps } : "Emplois du temps"
    SessionExamen ||--o{ SessionExamen } : "Sessions d'examens"
    Note ||--o{ Note } : "Notes"
    
    %% COMMUNICATION
    Annonce ||--o{ Annonce } : "Annonces"
    Notification ||--o{ Notification } : "Notifications"
    Message ||--o{ Message } : "Messages"
    
    %% DISCIPLINE
    Incident ||--o{ Incident } : "Incidents"
    Sanction ||--o{ Sanction } : "Sanctions"
    Avertissement ||--o{ Avertissement } : "Avertissements"
    PointageQR ||--o{ PointageQR } : "Pointage QR"
    SurveillanceDiscipline ||--o{ SurveillanceDiscipline } : "Surveillance discipline"
    AlerteDiscipline ||--o{ AlerteDiscipline } : "Alertes discipline"
    ConfigurationExamen ||--o{ ConfigurationExamen } : "Configuration examens"
    
    %% DOCUMENTS
    ReleveNote ||--o{ ReleveNote } : "Relevés de notes"
    Attestation ||--o{ Attestation } : "Attestations"
    Diplome ||--o{ Diplome } : "Diplômes"
    SuplementDiplome ||--o{ SuplementDiplome } : "Suppléments diplômes"
    TransfertEtudiant ||--o{ TransfertEtudiant } : "Transferts étudiants"
    ArchiveScolarite ||--o{ ArchiveScolarite } : "Archives scolarité"
    VerrouillageNotes ||--o{ VerrouillageNotes } : "Verrouillage notes"
    
    %% EXAMENS
    SujetExamen ||--o{ SujetExamen } : "Sujets d'examens"
    Deliberation ||--o{ Deliberation } : "Délibérations"
    Jury ||--o{ Jury } : "Jurys"
    PVNote ||--o{ PVNote } : "PV de notes"
    
    %% RELATIONS ENTRE MODULES
    User ||--|| Etudiant : "Étudiant"
    User ||--|| Enseignant : "Enseignant"
    User ||--|| SurveillantGeneral : "Surveillant"
    User ||--|| ResponsableLogistique : "Responsable logistique"
    User ||--|| President : "Président"
    User ||--|| SuperAdmin : "Super admin"
    
    Etudiant ||--|| Inscription : "Inscriptions"
    Etudiant ||--|| Note : "Notes"
    Etudiant ||--|| ReleveNote : "Relevés notes"
    Etudiant ||--|| Attestation : "Attestations"
    Etudiant ||--|| Diplome : "Diplômes"
    
    Enseignant ||--|| AffectationCours : "Affectations cours"
    Enseignant ||--|| Note : "Notes"
    
    President ||--|| DecisionPresidentielle : "Décisions"
    President ||--|| ValidationRecrutement : "Validations"
    President ||--|| Arbitrage : "Arbitrages"
    President ||--|| ConseilUniversitaire : "Conseils"
    
    SurveillantGeneral ||--|| AppelNumerique : "Appels"
    SurveillantGeneral ||--|| IncidentDisciplinaire : "Incidents"
    SurveillantGeneral ||--|| OrganisationExamen : "Organisations examens"
    SurveillantGeneral ||--|| RapportSurveillance : "Rapports"
    
    ResponsableLogistique ||--|| ServiceEntretien : "Services"
    ResponsableLogistique ||--|| PlanningNettoyage : "Plannings"
    ResponsableLogistique ||--|| StockProduitsMenage : "Stocks"
    ResponsableLogistique ||--|| MaintenancePreventive : "Maintenances"
    ResponsableLogistique ||--|| RapportEntretien : "Rapports"
    
    %% RELATIONS FINANCIÈRES
    Etudiant ||--|| Echeancier : "Échéanciers"
    Etudiant ||--|| Paiement : "Paiements"
    Paiement ||--|| Echeancier : "Échéanciers"
    
    %% RELATIONS SCOLAIRES
    Inscription ||--|| Parcours : "Parcours"
    Inscription ||--|| AnneeAcademique : "Années académiques"
    Parcours ||--|| UniteEnseignement : "Unités"
    Parcours ||--|| ElementConstitutif : "Éléments"
    UniteEnseignement ||--|| ElementConstitutif : "Éléments"
    UniteEnseignement ||--|| Enseignant : "Enseignants"
    UniteEnseignement ||--|| AffectationCours : "Affectations"
    
    %% RELATIONS LOGISTIQUES
    PlanningNettoyage ||--|| StockProduitsMenage : "Produits utilisés"
    ServiceEntretien ||--|| MaintenancePreventive : "Maintenances par service"
```

## Description des Entités Principales

### 🏛️ **Gouvernance et Haute Direction**
- **President**: Gère les présidents d'université avec leurs mandats et signatures numériques
- **DecisionPresidentielle**: Décisions officielles prises par le président
- **ValidationRecrutement**: Validations présidentielles des recrutements
- **Arbitrage**: Arbitrages de conflits ou litiges
- **ConseilUniversitaire**: Conseils universitaires et comptes-rendus

### 👥 **Surveillance Générale**
- **SurveillantGeneral**: Surveillants généraux avec leurs contrats et spécialités
- **AppelNumerique**: Appels numériques pour suivi des présences
- **IncidentDisciplinaire**: Incidents disciplinaires signalés
- **OrganisationExamen**: Organisation des sessions d'examens
- **RapportSurveillance**: Rapports de surveillance et activités

### 🔧 **Logistique et Entretien**
- **ResponsableLogistique**: Responsables des services logistiques
- **ServiceEntretien**: Services d'entretien (nettoyage, maintenance, etc.)
- **PlanningNettoyage**: Plannings de nettoyage des locaux
- **StockProduitsMenage**: Gestion des stocks de produits de ménage
- **MaintenancePreventive**: Maintenances préventives planifiées
- **RapportEntretien**: Rapports d'activités d'entretien

### 📊 **Finance et Économat**
- **GrilleTarifaire**: Grilles tarifaires pour frais scolaires
- **Echeancier**: Échéanciers de paiement
- **Paiement**: Paiements effectués
- **Budget**: Budgets par département
- **Depense**: Dépenses engagées
- **ContratPersonnel**: Contrats du personnel
- **FichePaie**: Fiches de paie

### 🎓 **Scolarité et Pédagogie**
- **Etudiant**: Informations des étudiants
- **Inscription**: Inscriptions académiques
- **Parcours**: Parcours académiques et programmes
- **UniteEnseignement**: Unités d'enseignement
- **ElementConstitutif**: Éléments constitutifs des parcours
- **AnneeAcademique**: Années académiques
- **CalendrierAcademique**: Calendriers académiques
- **Enseignant**: Corps enseignant
- **AffectationCours**: Affectations des enseignants aux cours
- **Salle**: Salles de cours
- **Batiment**: Bâtiments universitaires
- **EmploiDuTemps**: Emplois du temps
- **SessionExamen**: Sessions d'examens
- **Note**: Notes des étudiants

### 📢 **Communication**
- **Annonce**: Annonces institutionnelles
- **Notification**: Notifications système
- **Message**: Messages internes

### ⚖️ **Discipline**
- **Incident**: Incidents généraux
- **Sanction**: Sanctions appliquées
- **Avertissement**: Avertissements disciplinaires
- **PointageQR**: Pointage par QR code
- **SurveillanceDiscipline**: Surveillance disciplinaire
- **AlerteDiscipline**: Alertes de discipline
- **ConfigurationExamen**: Configuration des examens

### 📄 **Documents**
- **ReleveNote**: Relevés de notes
- **Attestation**: Attestations diverses
- **Diplome**: Diplômes délivrés
- **SuplementDiplome**: Suppléments de diplôme
- **TransfertEtudiant**: Transferts d'étudiants
- **ArchiveScolarite**: Archives académiques
- **VerrouillageNotes**: Verrouillage des notes

### 📝 **Examens**
- **SujetExamen**: Sujets d'examens
- **Deliberation**: Délibérations de jurys
- **Jury**: Jurys d'examens
- **PVNote**: Procès-verbaux de notes

### 🔐 **Authentification et Multi-Tenancy**
- **User**: Utilisateurs du système
- **SuperAdmin**: Administrateurs système
- **Utilisateur**: Utilisateurs standards
- **Tenant**: Universités/Établissements (multi-tenant)

## Relations Clés

### 🏗️ **Architecture Multi-Tenant**
Chaque **Tenant** a son propre schéma PostgreSQL contenant :
- Tables académiques (étudiants, enseignants, parcours, etc.)
- Tables financières (paiements, budget, dépenses)
- Tables logistiques (entretien, maintenance)
- Tables de communication (annonces, messages)
- Tables de discipline (incidents, sanctions)

### 🔐 **Gestion des Droits (RBAC)**
- **Super Admin**: Accès à tous les tenants et toutes les fonctionnalités
- **Admin Tenant**: Gestion complète de son université
- **President**: Gouvernance de son université
- **Responsable Logistique**: Gestion des services logistiques
- **Surveillant**: Surveillance et discipline
- **Enseignant**: Gestion pédagogique
- **Étudiant**: Consultation de ses informations

### 📊 **Statistiques et Tableaux de Bord**
Chaque module dispose d'un dashboard avec :
- Statistiques en temps réel
- Graphiques de performance
- Alertes et notifications
- Rapports personnalisés
