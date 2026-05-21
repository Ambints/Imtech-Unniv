--
-- PostgreSQL database dump
--

\restrict O7O4RnISthuX5XKcHD30sUKwTGvC1AVYxTLWNU5GHcB37VnDIEOLhbCPVgBmiMz

-- Dumped from database version 18.0
-- Dumped by pg_dump version 18.0

-- Started on 2026-05-19 10:11:23

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE ONLY tenant_test.verrouillage_notes DROP CONSTRAINT verrouillage_notes_verrouille_par_fkey;
ALTER TABLE ONLY tenant_test.verrouillage_notes DROP CONSTRAINT verrouillage_notes_session_examen_id_fkey;
ALTER TABLE ONLY tenant_test.verrouillage_notes DROP CONSTRAINT verrouillage_notes_etudiant_id_fkey;
ALTER TABLE ONLY tenant_test.verrouillage_notes DROP CONSTRAINT verrouillage_notes_deliberation_id_fkey;
ALTER TABLE ONLY tenant_test.verrouillage_notes DROP CONSTRAINT verrouillage_notes_autorise_par_fkey;
ALTER TABLE ONLY tenant_test.unite_enseignement DROP CONSTRAINT unite_enseignement_parcours_id_fkey;
ALTER TABLE ONLY tenant_test.unite_enseignement DROP CONSTRAINT unite_enseignement_enseignant_id_fkey;
ALTER TABLE ONLY tenant_test.transfert_etudiant DROP CONSTRAINT transfert_etudiant_parcours_origine_id_fkey;
ALTER TABLE ONLY tenant_test.transfert_etudiant DROP CONSTRAINT transfert_etudiant_parcours_destination_id_fkey;
ALTER TABLE ONLY tenant_test.transfert_etudiant DROP CONSTRAINT transfert_etudiant_etudiant_id_fkey;
ALTER TABLE ONLY tenant_test.ticket_maintenance DROP CONSTRAINT ticket_maintenance_signale_par_fkey;
ALTER TABLE ONLY tenant_test.ticket_maintenance DROP CONSTRAINT ticket_maintenance_salle_id_fkey;
ALTER TABLE ONLY tenant_test.ticket_maintenance DROP CONSTRAINT ticket_maintenance_batiment_id_fkey;
ALTER TABLE ONLY tenant_test.ticket_maintenance DROP CONSTRAINT ticket_maintenance_assigne_a_fkey;
ALTER TABLE ONLY tenant_test.support_cours DROP CONSTRAINT support_cours_ec_id_fkey;
ALTER TABLE ONLY tenant_test.support_cours DROP CONSTRAINT support_cours_auteur_id_fkey;
ALTER TABLE ONLY tenant_test.suplement_diplome DROP CONSTRAINT suplement_diplome_etudiant_id_fkey;
ALTER TABLE ONLY tenant_test.suplement_diplome DROP CONSTRAINT suplement_diplome_diplome_id_fkey;
ALTER TABLE ONLY tenant_test.sujet_examen DROP CONSTRAINT sujet_examen_valide_par_fkey;
ALTER TABLE ONLY tenant_test.sujet_examen DROP CONSTRAINT sujet_examen_ue_id_fkey;
ALTER TABLE ONLY tenant_test.sujet_examen DROP CONSTRAINT sujet_examen_soumis_par_fkey;
ALTER TABLE ONLY tenant_test.sujet_examen DROP CONSTRAINT sujet_examen_relu_par_fkey;
ALTER TABLE ONLY tenant_test.sujet_examen DROP CONSTRAINT sujet_examen_enseignant_id_fkey;
ALTER TABLE ONLY tenant_test.sujet_examen DROP CONSTRAINT sujet_examen_ec_id_fkey;
ALTER TABLE ONLY tenant_test.stage DROP CONSTRAINT stage_rapporteur_id_fkey;
ALTER TABLE ONLY tenant_test.stage DROP CONSTRAINT stage_parcours_id_fkey;
ALTER TABLE ONLY tenant_test.stage DROP CONSTRAINT stage_etudiant_id_fkey;
ALTER TABLE ONLY tenant_test.stage DROP CONSTRAINT stage_encadrant_id_fkey;
ALTER TABLE ONLY tenant_test.stage DROP CONSTRAINT stage_annee_academique_id_fkey;
ALTER TABLE ONLY tenant_test.soutenance DROP CONSTRAINT soutenance_stage_id_fkey;
ALTER TABLE ONLY tenant_test.soutenance DROP CONSTRAINT soutenance_salle_id_fkey;
ALTER TABLE ONLY tenant_test.soutenance DROP CONSTRAINT soutenance_president_jury_id_fkey;
ALTER TABLE ONLY tenant_test.session_jwt DROP CONSTRAINT session_jwt_utilisateur_id_fkey;
ALTER TABLE ONLY tenant_test.session_examen DROP CONSTRAINT session_examen_annee_academique_id_fkey;
ALTER TABLE ONLY tenant_test.secretaire_parcours DROP CONSTRAINT secretaire_parcours_parcours_id_fkey;
ALTER TABLE ONLY tenant_test.secretaire_parcours DROP CONSTRAINT secretaire_parcours_assigned_by_fkey;
ALTER TABLE ONLY tenant_test.salle DROP CONSTRAINT salle_batiment_id_fkey;
ALTER TABLE ONLY tenant_test.resultat_ue DROP CONSTRAINT resultat_ue_ue_id_fkey;
ALTER TABLE ONLY tenant_test.resultat_ue DROP CONSTRAINT resultat_ue_resultat_semestre_id_fkey;
ALTER TABLE ONLY tenant_test.resultat_ue DROP CONSTRAINT resultat_ue_etudiant_id_fkey;
ALTER TABLE ONLY tenant_test.resultat_ue DROP CONSTRAINT resultat_ue_compensation_ue_id_fkey;
ALTER TABLE ONLY tenant_test.resultat_semestre DROP CONSTRAINT resultat_semestre_inscription_id_fkey;
ALTER TABLE ONLY tenant_test.resultat_semestre DROP CONSTRAINT resultat_semestre_etudiant_id_fkey;
ALTER TABLE ONLY tenant_test.resultat_semestre DROP CONSTRAINT resultat_semestre_deliberation_id_fkey;
ALTER TABLE ONLY tenant_test.resultat_deliberation DROP CONSTRAINT resultat_deliberation_pv_id_fkey;
ALTER TABLE ONLY tenant_test.resultat_deliberation DROP CONSTRAINT resultat_deliberation_etudiant_id_fkey;
ALTER TABLE ONLY tenant_test.reservation_salle DROP CONSTRAINT reservation_salle_salle_id_fkey;
ALTER TABLE ONLY tenant_test.reservation_salle DROP CONSTRAINT reservation_salle_demande_par_fkey;
ALTER TABLE ONLY tenant_test.reservation_salle DROP CONSTRAINT reservation_salle_approuve_par_fkey;
ALTER TABLE ONLY tenant_test.referentiel_competences DROP CONSTRAINT referentiel_competences_valide_par_fkey;
ALTER TABLE ONLY tenant_test.referentiel_competences DROP CONSTRAINT referentiel_competences_parcours_id_fkey;
ALTER TABLE ONLY tenant_test.recrutement DROP CONSTRAINT recrutement_responsable_id_fkey;
ALTER TABLE ONLY tenant_test.recrutement DROP CONSTRAINT recrutement_departement_id_fkey;
ALTER TABLE ONLY tenant_test.rattrapage DROP CONSTRAINT rattrapage_salle_id_fkey;
ALTER TABLE ONLY tenant_test.rattrapage DROP CONSTRAINT rattrapage_remplaceur_id_fkey;
ALTER TABLE ONLY tenant_test.rattrapage DROP CONSTRAINT rattrapage_planifie_par_fkey;
ALTER TABLE ONLY tenant_test.rattrapage DROP CONSTRAINT rattrapage_absence_id_fkey;
ALTER TABLE ONLY tenant_test.rapport_entretien DROP CONSTRAINT rapport_entretien_realise_par_fkey;
ALTER TABLE ONLY tenant_test.rapport_entretien DROP CONSTRAINT rapport_entretien_planning_id_fkey;
ALTER TABLE ONLY tenant_test.pv_deliberation DROP CONSTRAINT pv_deliberation_session_id_fkey;
ALTER TABLE ONLY tenant_test.pv_deliberation DROP CONSTRAINT pv_deliberation_president_jury_fkey;
ALTER TABLE ONLY tenant_test.pv_deliberation DROP CONSTRAINT pv_deliberation_parcours_id_fkey;
ALTER TABLE ONLY tenant_test.proces_verbal DROP CONSTRAINT proces_verbal_valide_par_fkey;
ALTER TABLE ONLY tenant_test.proces_verbal DROP CONSTRAINT proces_verbal_redige_par_fkey;
ALTER TABLE ONLY tenant_test.proces_verbal DROP CONSTRAINT proces_verbal_parcours_id_fkey;
ALTER TABLE ONLY tenant_test.proces_verbal DROP CONSTRAINT proces_verbal_annee_academique_id_fkey;
ALTER TABLE ONLY tenant_test.presence DROP CONSTRAINT presence_valide_par_fkey;
ALTER TABLE ONLY tenant_test.presence DROP CONSTRAINT presence_seance_id_fkey;
ALTER TABLE ONLY tenant_test.presence DROP CONSTRAINT presence_saisi_par_fkey;
ALTER TABLE ONLY tenant_test.presence DROP CONSTRAINT presence_etudiant_id_fkey;
ALTER TABLE ONLY tenant_test.planning_entretien DROP CONSTRAINT planning_entretien_salle_id_fkey;
ALTER TABLE ONLY tenant_test.planning_entretien DROP CONSTRAINT planning_entretien_responsable_id_fkey;
ALTER TABLE ONLY tenant_test.planning_entretien DROP CONSTRAINT planning_entretien_batiment_id_fkey;
ALTER TABLE ONLY tenant_test.parcours DROP CONSTRAINT parcours_secretaire_id_fkey;
ALTER TABLE ONLY tenant_test.parcours DROP CONSTRAINT parcours_responsable_id_fkey;
ALTER TABLE ONLY tenant_test.parcours DROP CONSTRAINT parcours_departement_id_fkey;
ALTER TABLE ONLY tenant_test.paiement_inscription DROP CONSTRAINT paiement_inscription_valide_par_fkey;
ALTER TABLE ONLY tenant_test.paiement_inscription DROP CONSTRAINT paiement_inscription_inscription_id_fkey;
ALTER TABLE ONLY tenant_test.paiement DROP CONSTRAINT paiement_inscription_id_fkey;
ALTER TABLE ONLY tenant_test.paiement_inscription DROP CONSTRAINT paiement_inscription_etudiant_id_fkey;
ALTER TABLE ONLY tenant_test.paiement DROP CONSTRAINT paiement_echeancier_id_fkey;
ALTER TABLE ONLY tenant_test.paiement DROP CONSTRAINT paiement_caissier_id_fkey;
ALTER TABLE ONLY tenant_test.notification DROP CONSTRAINT notification_utilisateur_id_fkey;
ALTER TABLE ONLY tenant_test.note DROP CONSTRAINT note_valide_par_fkey;
ALTER TABLE ONLY tenant_test.note DROP CONSTRAINT note_ue_id_fkey;
ALTER TABLE ONLY tenant_test.note DROP CONSTRAINT note_session_id_fkey;
ALTER TABLE ONLY tenant_test.note DROP CONSTRAINT note_saisi_par_fkey;
ALTER TABLE ONLY tenant_test.note DROP CONSTRAINT note_etudiant_id_fkey;
ALTER TABLE ONLY tenant_test.note DROP CONSTRAINT note_ec_id_fkey;
ALTER TABLE ONLY tenant_test.note_derogatoire DROP CONSTRAINT note_derogatoire_valide_par_scolarite_fkey;
ALTER TABLE ONLY tenant_test.note_derogatoire DROP CONSTRAINT note_derogatoire_valide_par_fkey;
ALTER TABLE ONLY tenant_test.note_derogatoire DROP CONSTRAINT note_derogatoire_ue_id_fkey;
ALTER TABLE ONLY tenant_test.note_derogatoire DROP CONSTRAINT note_derogatoire_session_examen_id_fkey;
ALTER TABLE ONLY tenant_test.note_derogatoire DROP CONSTRAINT note_derogatoire_saisie_par_fkey;
ALTER TABLE ONLY tenant_test.note_derogatoire DROP CONSTRAINT note_derogatoire_etudiant_id_fkey;
ALTER TABLE ONLY tenant_test.note_derogatoire DROP CONSTRAINT note_derogatoire_ec_id_fkey;
ALTER TABLE ONLY tenant_test.mouvement_stock DROP CONSTRAINT mouvement_stock_utilisateur_id_fkey;
ALTER TABLE ONLY tenant_test.mouvement_stock DROP CONSTRAINT mouvement_stock_stock_id_fkey;
ALTER TABLE ONLY tenant_test.message DROP CONSTRAINT message_parent_id_fkey;
ALTER TABLE ONLY tenant_test.message DROP CONSTRAINT message_expediteur_id_fkey;
ALTER TABLE ONLY tenant_test.message_enseignant DROP CONSTRAINT message_enseignant_parcours_id_fkey;
ALTER TABLE ONLY tenant_test.message_enseignant DROP CONSTRAINT message_enseignant_niveau_id_fkey;
ALTER TABLE ONLY tenant_test.message_enseignant DROP CONSTRAINT message_enseignant_etudiant_id_fkey;
ALTER TABLE ONLY tenant_test.message_enseignant DROP CONSTRAINT message_enseignant_enseignant_id_fkey;
ALTER TABLE ONLY tenant_test.message_destinataire DROP CONSTRAINT message_destinataire_message_id_fkey;
ALTER TABLE ONLY tenant_test.message DROP CONSTRAINT message_destinataire_id_fkey;
ALTER TABLE ONLY tenant_test.message_destinataire DROP CONSTRAINT message_destinataire_etudiant_id_fkey;
ALTER TABLE ONLY tenant_test.inscription DROP CONSTRAINT inscription_validee_par_fkey;
ALTER TABLE ONLY tenant_test.inscription DROP CONSTRAINT inscription_parcours_id_fkey;
ALTER TABLE ONLY tenant_test.inscription DROP CONSTRAINT inscription_etudiant_id_fkey;
ALTER TABLE ONLY tenant_test.inscription DROP CONSTRAINT inscription_annee_academique_id_fkey;
ALTER TABLE ONLY tenant_test.incident_disciplinaire DROP CONSTRAINT incident_disciplinaire_rapporte_par_fkey;
ALTER TABLE ONLY tenant_test.incident_disciplinaire DROP CONSTRAINT incident_disciplinaire_etudiant_id_fkey;
ALTER TABLE ONLY tenant_test.incident_disciplinaire DROP CONSTRAINT incident_disciplinaire_arbitre_par_fkey;
ALTER TABLE ONLY tenant_test.heure_complementaire DROP CONSTRAINT heure_complementaire_valide_par_fkey;
ALTER TABLE ONLY tenant_test.heure_complementaire DROP CONSTRAINT heure_complementaire_enseignant_id_fkey;
ALTER TABLE ONLY tenant_test.grille_tarifaire DROP CONSTRAINT grille_tarifaire_parcours_id_fkey;
ALTER TABLE ONLY tenant_test.grille_tarifaire DROP CONSTRAINT grille_tarifaire_annee_academique_id_fkey;
ALTER TABLE ONLY tenant_test.frais_inscription DROP CONSTRAINT frais_inscription_parcours_id_fkey;
ALTER TABLE ONLY tenant_test.frais_inscription DROP CONSTRAINT frais_inscription_modifie_par_fkey;
ALTER TABLE ONLY tenant_test.frais_inscription DROP CONSTRAINT frais_inscription_cree_par_fkey;
ALTER TABLE ONLY tenant_test.frais_inscription DROP CONSTRAINT frais_inscription_annee_academique_id_fkey;
ALTER TABLE ONLY tenant_test.fiche_suivi_stage DROP CONSTRAINT fiche_suivi_stage_stage_id_fkey;
ALTER TABLE ONLY tenant_test.fiche_suivi_stage DROP CONSTRAINT fiche_suivi_stage_auteur_id_fkey;
ALTER TABLE ONLY tenant_test.fiche_paie DROP CONSTRAINT fiche_paie_contrat_id_fkey;
ALTER TABLE ONLY tenant_test.evaluation_soutenance DROP CONSTRAINT evaluation_soutenance_soutenance_id_fkey;
ALTER TABLE ONLY tenant_test.evaluation_soutenance DROP CONSTRAINT evaluation_soutenance_evaluateur_id_fkey;
ALTER TABLE ONLY tenant_test.evaluation_personnel DROP CONSTRAINT evaluation_personnel_utilisateur_id_fkey;
ALTER TABLE ONLY tenant_test.evaluation_personnel DROP CONSTRAINT evaluation_personnel_evaluateur_id_fkey;
ALTER TABLE ONLY tenant_test.etudiant DROP CONSTRAINT etudiant_utilisateur_id_fkey;
ALTER TABLE ONLY tenant_test.enseignant DROP CONSTRAINT enseignant_utilisateur_id_fkey;
ALTER TABLE ONLY tenant_test.enseignant DROP CONSTRAINT enseignant_departement_id_fkey;
ALTER TABLE ONLY tenant_test.emploi_du_temps DROP CONSTRAINT emploi_du_temps_salle_id_fkey;
ALTER TABLE ONLY tenant_test.emploi_du_temps DROP CONSTRAINT emploi_du_temps_created_by_id_fkey;
ALTER TABLE ONLY tenant_test.emploi_du_temps DROP CONSTRAINT emploi_du_temps_annee_academique_id_fkey;
ALTER TABLE ONLY tenant_test.emploi_du_temps DROP CONSTRAINT emploi_du_temps_affectation_id_fkey;
ALTER TABLE ONLY tenant_test.element_constitutif DROP CONSTRAINT element_constitutif_ue_id_fkey;
ALTER TABLE ONLY tenant_test.echeancier DROP CONSTRAINT echeancier_inscription_id_fkey;
ALTER TABLE ONLY tenant_test.dossier_etudiant DROP CONSTRAINT dossier_etudiant_traite_par_fkey;
ALTER TABLE ONLY tenant_test.dossier_etudiant DROP CONSTRAINT dossier_etudiant_etudiant_id_fkey;
ALTER TABLE ONLY tenant_test.dossier_etudiant DROP CONSTRAINT dossier_etudiant_demande_par_fkey;
ALTER TABLE ONLY tenant_test.diplome DROP CONSTRAINT diplome_signe_par_fkey;
ALTER TABLE ONLY tenant_test.diplome DROP CONSTRAINT diplome_parcours_id_fkey;
ALTER TABLE ONLY tenant_test.diplome DROP CONSTRAINT diplome_etudiant_id_fkey;
ALTER TABLE ONLY tenant_test.diplome DROP CONSTRAINT diplome_annee_academique_id_fkey;
ALTER TABLE ONLY tenant_test.depense DROP CONSTRAINT depense_demande_par_fkey;
ALTER TABLE ONLY tenant_test.depense DROP CONSTRAINT depense_budget_id_fkey;
ALTER TABLE ONLY tenant_test.depense DROP CONSTRAINT depense_approuve_par_fkey;
ALTER TABLE ONLY tenant_test.depense DROP CONSTRAINT depense_annee_academique_id_fkey;
ALTER TABLE ONLY tenant_test.departement DROP CONSTRAINT departement_responsable_id_fkey;
ALTER TABLE ONLY tenant_test.demande_ressource DROP CONSTRAINT demande_ressource_traite_par_fkey;
ALTER TABLE ONLY tenant_test.demande_ressource DROP CONSTRAINT demande_ressource_demandeur_id_fkey;
ALTER TABLE ONLY tenant_test.demande_etudiant DROP CONSTRAINT demande_etudiant_traite_par_fkey;
ALTER TABLE ONLY tenant_test.demande_etudiant DROP CONSTRAINT demande_etudiant_etudiant_id_fkey;
ALTER TABLE ONLY tenant_test.deliberation DROP CONSTRAINT deliberation_validee_par_fkey;
ALTER TABLE ONLY tenant_test.deliberation DROP CONSTRAINT deliberation_president_jury_id_fkey;
ALTER TABLE ONLY tenant_test.deliberation DROP CONSTRAINT deliberation_parcours_id_fkey;
ALTER TABLE ONLY tenant_test.convocation DROP CONSTRAINT convocation_session_examen_id_fkey;
ALTER TABLE ONLY tenant_test.convocation DROP CONSTRAINT convocation_salle_id_fkey;
ALTER TABLE ONLY tenant_test.convocation DROP CONSTRAINT convocation_genere_par_fkey;
ALTER TABLE ONLY tenant_test.convocation DROP CONSTRAINT convocation_etudiant_id_fkey;
ALTER TABLE ONLY tenant_test.contrat_personnel DROP CONSTRAINT contrat_personnel_utilisateur_id_fkey;
ALTER TABLE ONLY tenant_test.contrat_personnel DROP CONSTRAINT contrat_personnel_departement_id_fkey;
ALTER TABLE ONLY tenant_test.conge_personnel DROP CONSTRAINT conge_personnel_utilisateur_id_fkey;
ALTER TABLE ONLY tenant_test.conge_personnel DROP CONSTRAINT conge_personnel_approuve_par_fkey;
ALTER TABLE ONLY tenant_test.cloture_caisse DROP CONSTRAINT cloture_caisse_valide_par_fkey;
ALTER TABLE ONLY tenant_test.cloture_caisse DROP CONSTRAINT cloture_caisse_caissier_id_fkey;
ALTER TABLE ONLY tenant_test.candidature DROP CONSTRAINT candidature_recrutement_id_fkey;
ALTER TABLE ONLY tenant_test.calendrier_academique DROP CONSTRAINT calendrier_academique_parcours_id_fkey;
ALTER TABLE ONLY tenant_test.calendrier_academique DROP CONSTRAINT calendrier_academique_annee_academique_id_fkey;
ALTER TABLE ONLY tenant_test.budget DROP CONSTRAINT budget_departement_id_fkey;
ALTER TABLE ONLY tenant_test.budget DROP CONSTRAINT budget_created_by_fkey;
ALTER TABLE ONLY tenant_test.budget DROP CONSTRAINT budget_annee_academique_id_fkey;
ALTER TABLE ONLY tenant_test.attestation DROP CONSTRAINT attestation_inscription_id_fkey;
ALTER TABLE ONLY tenant_test.attestation DROP CONSTRAINT attestation_etudiant_id_fkey;
ALTER TABLE ONLY tenant_test.attestation DROP CONSTRAINT attestation_annee_academique_id_fkey;
ALTER TABLE ONLY tenant_test.archive_scolarite DROP CONSTRAINT archive_scolarite_etudiant_id_fkey;
ALTER TABLE ONLY tenant_test.archive_scolarite DROP CONSTRAINT archive_scolarite_archive_par_fkey;
ALTER TABLE ONLY tenant_test.annonce DROP CONSTRAINT annonce_parcours_id_fkey;
ALTER TABLE ONLY tenant_test.annonce DROP CONSTRAINT annonce_auteur_id_fkey;
ALTER TABLE ONLY tenant_test.affectation_cours DROP CONSTRAINT affectation_cours_valide_par_fkey;
ALTER TABLE ONLY tenant_test.affectation_cours DROP CONSTRAINT affectation_cours_ue_id_fkey;
ALTER TABLE ONLY tenant_test.affectation_cours DROP CONSTRAINT affectation_cours_enseignant_id_fkey;
ALTER TABLE ONLY tenant_test.affectation_cours DROP CONSTRAINT affectation_cours_ec_id_fkey;
ALTER TABLE ONLY tenant_test.affectation_cours DROP CONSTRAINT affectation_cours_annee_academique_id_fkey;
ALTER TABLE ONLY tenant_test.absence_enseignant DROP CONSTRAINT absence_enseignant_validee_par_fkey;
ALTER TABLE ONLY tenant_test.absence_enseignant DROP CONSTRAINT absence_enseignant_seance_id_fkey;
ALTER TABLE ONLY tenant_test.absence_enseignant DROP CONSTRAINT absence_enseignant_enseignant_id_fkey;
ALTER TABLE ONLY tenant_test.absence_enseignant DROP CONSTRAINT absence_enseignant_declaree_par_fkey;
DROP TRIGGER update_verrouillage_notes_updated_at ON tenant_test.verrouillage_notes;
DROP TRIGGER update_transfert_etudiant_updated_at ON tenant_test.transfert_etudiant;
DROP TRIGGER update_suplement_diplome_updated_at ON tenant_test.suplement_diplome;
DROP TRIGGER update_resultat_ue_updated_at ON tenant_test.resultat_ue;
DROP TRIGGER update_resultat_semestre_updated_at ON tenant_test.resultat_semestre;
DROP TRIGGER update_diplome_updated_at ON tenant_test.diplome;
DROP TRIGGER update_deliberation_updated_at ON tenant_test.deliberation;
DROP TRIGGER update_archive_scolarite_updated_at ON tenant_test.archive_scolarite;
DROP TRIGGER trigger_update_paiement_inscription_updated_at ON tenant_test.paiement_inscription;
DROP TRIGGER trg_updated_at ON tenant_test.verrouillage_notes;
DROP TRIGGER trg_updated_at ON tenant_test.utilisateur;
DROP TRIGGER trg_updated_at ON tenant_test.unite_enseignement;
DROP TRIGGER trg_updated_at ON tenant_test.transfert_etudiant;
DROP TRIGGER trg_updated_at ON tenant_test.ticket_maintenance;
DROP TRIGGER trg_updated_at ON tenant_test.support_cours;
DROP TRIGGER trg_updated_at ON tenant_test.suplement_diplome;
DROP TRIGGER trg_updated_at ON tenant_test.sujet_examen;
DROP TRIGGER trg_updated_at ON tenant_test.suivi_moral;
DROP TRIGGER trg_updated_at ON tenant_test.stage;
DROP TRIGGER trg_updated_at ON tenant_test.soutenance;
DROP TRIGGER trg_updated_at ON tenant_test.secretaire_parcours;
DROP TRIGGER trg_updated_at ON tenant_test.resultat_ue;
DROP TRIGGER trg_updated_at ON tenant_test.resultat_semestre;
DROP TRIGGER trg_updated_at ON tenant_test.referentiel_competences;
DROP TRIGGER trg_updated_at ON tenant_test.recrutement;
DROP TRIGGER trg_updated_at ON tenant_test.rattrapage;
DROP TRIGGER trg_updated_at ON tenant_test.rapport_conduite;
DROP TRIGGER trg_updated_at ON tenant_test.pv_deliberation;
DROP TRIGGER trg_updated_at ON tenant_test.proces_verbal;
DROP TRIGGER trg_updated_at ON tenant_test.presence_surveillance;
DROP TRIGGER trg_updated_at ON tenant_test.presence;
DROP TRIGGER trg_updated_at ON tenant_test.pointage_qr;
DROP TRIGGER trg_updated_at ON tenant_test.parcours;
DROP TRIGGER trg_updated_at ON tenant_test.note_derogatoire;
DROP TRIGGER trg_updated_at ON tenant_test.note;
DROP TRIGGER trg_updated_at ON tenant_test.niveau_etude;
DROP TRIGGER trg_updated_at ON tenant_test.inscription;
DROP TRIGGER trg_updated_at ON tenant_test.heure_complementaire;
DROP TRIGGER trg_updated_at ON tenant_test.evaluation_personnel;
DROP TRIGGER trg_updated_at ON tenant_test.enseignant;
DROP TRIGGER trg_updated_at ON tenant_test.emploi_du_temps;
DROP TRIGGER trg_updated_at ON tenant_test.element_constitutif;
DROP TRIGGER trg_updated_at ON tenant_test.dossier_etudiant;
DROP TRIGGER trg_updated_at ON tenant_test.depense;
DROP TRIGGER trg_updated_at ON tenant_test.demande_ressource;
DROP TRIGGER trg_updated_at ON tenant_test.demande_etudiant;
DROP TRIGGER trg_updated_at ON tenant_test.deliberation;
DROP TRIGGER trg_updated_at ON tenant_test.delegation_signature;
DROP TRIGGER trg_updated_at ON tenant_test.declaration_sociale;
DROP TRIGGER trg_updated_at ON tenant_test.convocation;
DROP TRIGGER trg_updated_at ON tenant_test.convention;
DROP TRIGGER trg_updated_at ON tenant_test.contrat_personnel;
DROP TRIGGER trg_updated_at ON tenant_test.conseil_discipline;
DROP TRIGGER trg_updated_at ON tenant_test.configuration_examen;
DROP TRIGGER trg_updated_at ON tenant_test.candidature;
DROP TRIGGER trg_updated_at ON tenant_test.budget;
DROP TRIGGER trg_updated_at ON tenant_test.autorisation_sortie;
DROP TRIGGER trg_updated_at ON tenant_test.attestation;
DROP TRIGGER trg_updated_at ON tenant_test.archive_scolarite;
DROP TRIGGER trg_updated_at ON tenant_test.annonce;
DROP TRIGGER trg_updated_at ON tenant_test.alerte_discipline;
DROP TRIGGER trg_updated_at ON tenant_test.affectation_cours;
DROP TRIGGER trg_updated_at ON tenant_test.absence_enseignant;
DROP TRIGGER trg_numero_recu ON tenant_test.paiement;
DROP TRIGGER trg_notif_paiement ON tenant_test.paiement;
DROP TRIGGER trg_note_verrouille ON tenant_test.note;
DROP TRIGGER trg_alerte_stock ON tenant_test.stock;
DROP TRIGGER prevent_locked_note_modification ON tenant_test.note;
CREATE OR REPLACE VIEW tenant_test.vue_frais_inscription_actifs AS
SELECT
    NULL::uuid AS id,
    NULL::uuid AS parcours_id,
    NULL::uuid AS annee_academique_id,
    NULL::numeric(10,2) AS montant_inscription,
    NULL::numeric(10,2) AS montant_scolarite,
    NULL::numeric(10,2) AS montant_total,
    NULL::text AS description,
    NULL::boolean AS actif,
    NULL::date AS date_limite_paiement,
    NULL::jsonb AS modalites_paiement,
    NULL::uuid AS cree_par,
    NULL::uuid AS modifie_par,
    NULL::timestamp with time zone AS created_at,
    NULL::timestamp with time zone AS updated_at,
    NULL::character varying(30) AS parcours_code,
    NULL::character varying(200) AS parcours_nom,
    NULL::character varying(200) AS departement_nom,
    NULL::character varying(20) AS annee_academique,
    NULL::date AS annee_debut,
    NULL::date AS annee_fin,
    NULL::bigint AS nb_inscriptions,
    NULL::numeric AS total_encaisse;
DROP INDEX tenant_test.idx_verrouillage_statut;
DROP INDEX tenant_test.idx_verrouillage_session;
DROP INDEX tenant_test.idx_verrouillage_etudiant;
DROP INDEX tenant_test.idx_utilisateur_tenant_id;
DROP INDEX tenant_test.idx_utilisateur_role;
DROP INDEX tenant_test.idx_utilisateur_password_reset;
DROP INDEX tenant_test.idx_utilisateur_last_password_reset;
DROP INDEX tenant_test.idx_utilisateur_email;
DROP INDEX tenant_test.idx_utilisateur_actif;
DROP INDEX tenant_test.idx_unite_enseignement_parcours;
DROP INDEX tenant_test.idx_ue_enseignant;
DROP INDEX tenant_test.idx_transfert_etudiant_etudiant;
DROP INDEX tenant_test.idx_transfert_etudiant;
DROP INDEX tenant_test.idx_ticket_statut;
DROP INDEX tenant_test.idx_support_cours_ec;
DROP INDEX tenant_test.idx_support_cours_auteur;
DROP INDEX tenant_test.idx_suplement_diplome_diplome;
DROP INDEX tenant_test.idx_sujet_session;
DROP INDEX tenant_test.idx_sujet_enseignant;
DROP INDEX tenant_test.idx_suivi_moral_etudiant;
DROP INDEX tenant_test.idx_stock_seuil;
DROP INDEX tenant_test.idx_stage_etudiant;
DROP INDEX tenant_test.idx_stage_encadrant;
DROP INDEX tenant_test.idx_soutenance_stage;
DROP INDEX tenant_test.idx_session_jwt_user;
DROP INDEX tenant_test.idx_session_jwt_token;
DROP INDEX tenant_test.idx_secretaire_parcours_secretaire;
DROP INDEX tenant_test.idx_secretaire_parcours_parcours;
DROP INDEX tenant_test.idx_resultat_ue_ue;
DROP INDEX tenant_test.idx_resultat_ue_statut;
DROP INDEX tenant_test.idx_resultat_ue_etudiant;
DROP INDEX tenant_test.idx_resultat_semestre_statut;
DROP INDEX tenant_test.idx_resultat_semestre_inscription;
DROP INDEX tenant_test.idx_resultat_semestre_etudiant;
DROP INDEX tenant_test.idx_resultat_semestre_deliberation;
DROP INDEX tenant_test.idx_referentiel_parcours;
DROP INDEX tenant_test.idx_recrutement_statut;
DROP INDEX tenant_test.idx_rattrapage_absence;
DROP INDEX tenant_test.idx_rapport_conduite_etudiant;
DROP INDEX tenant_test.idx_pv_session;
DROP INDEX tenant_test.idx_pv_parcours;
DROP INDEX tenant_test.idx_presence_surveillance_seance;
DROP INDEX tenant_test.idx_presence_surveillance_etudiant;
DROP INDEX tenant_test.idx_presence_statut;
DROP INDEX tenant_test.idx_presence_seance;
DROP INDEX tenant_test.idx_presence_etudiant;
DROP INDEX tenant_test.idx_pointage_qr_seance;
DROP INDEX tenant_test.idx_pointage_qr_etudiant;
DROP INDEX tenant_test.idx_parcours_secretaire;
DROP INDEX tenant_test.idx_paiement_statut;
DROP INDEX tenant_test.idx_paiement_inscription_statut;
DROP INDEX tenant_test.idx_paiement_inscription_inscription;
DROP INDEX tenant_test.idx_paiement_inscription_etudiant;
DROP INDEX tenant_test.idx_paiement_inscription;
DROP INDEX tenant_test.idx_paiement_date;
DROP INDEX tenant_test.idx_notification_user;
DROP INDEX tenant_test.idx_note_verrouille;
DROP INDEX tenant_test.idx_note_ue;
DROP INDEX tenant_test.idx_note_session;
DROP INDEX tenant_test.idx_note_etudiant;
DROP INDEX tenant_test.idx_note_ec;
DROP INDEX tenant_test.idx_note_derog_etudiant;
DROP INDEX tenant_test.idx_niveau_etude_ordre;
DROP INDEX tenant_test.idx_niveau_etude_code;
DROP INDEX tenant_test.idx_message_enseignant_id;
DROP INDEX tenant_test.idx_message_date;
DROP INDEX tenant_test.idx_inscription_parcours_annee;
DROP INDEX tenant_test.idx_inscription_etudiant;
DROP INDEX tenant_test.idx_heure_comp_enseignant;
DROP INDEX tenant_test.idx_frais_inscription_parcours;
DROP INDEX tenant_test.idx_frais_inscription_annee_academique;
DROP INDEX tenant_test.idx_fiche_paie_contrat;
DROP INDEX tenant_test.idx_evaluation_soutenance;
DROP INDEX tenant_test.idx_eval_utilisateur;
DROP INDEX tenant_test.idx_eval_annee;
DROP INDEX tenant_test.idx_etudiant_nom;
DROP INDEX tenant_test.idx_etudiant_matricule;
DROP INDEX tenant_test.idx_emploi_du_temps_date;
DROP INDEX tenant_test.idx_element_constitutif_ue;
DROP INDEX tenant_test.idx_edt_salle;
DROP INDEX tenant_test.idx_edt_affectation;
DROP INDEX tenant_test.idx_echeancier_statut;
DROP INDEX tenant_test.idx_dossier_etudiant_id;
DROP INDEX tenant_test.idx_diplome_parcours;
DROP INDEX tenant_test.idx_diplome_numero;
DROP INDEX tenant_test.idx_diplome_etudiant;
DROP INDEX tenant_test.idx_destinataire_message;
DROP INDEX tenant_test.idx_destinataire_etudiant;
DROP INDEX tenant_test.idx_demande_ressource_demandeur;
DROP INDEX tenant_test.idx_demande_etudiant;
DROP INDEX tenant_test.idx_deliberation_statut;
DROP INDEX tenant_test.idx_deliberation_session;
DROP INDEX tenant_test.idx_deliberation_parcours;
DROP INDEX tenant_test.idx_delegation_delegataire;
DROP INDEX tenant_test.idx_delegation_dates;
DROP INDEX tenant_test.idx_decl_sociale_type;
DROP INDEX tenant_test.idx_decl_sociale_periode;
DROP INDEX tenant_test.idx_convocation_session;
DROP INDEX tenant_test.idx_convocation_etudiant;
DROP INDEX tenant_test.idx_convention_statut;
DROP INDEX tenant_test.idx_contrat_personnel_utilisateur;
DROP INDEX tenant_test.idx_conseil_discipline_etudiant;
DROP INDEX tenant_test.idx_conge_personnel_utilisateur;
DROP INDEX tenant_test.idx_configuration_examen_session;
DROP INDEX tenant_test.idx_cloture_caisse_date;
DROP INDEX tenant_test.idx_cloture_caisse_caissier;
DROP INDEX tenant_test.idx_candidature_recrutement;
DROP INDEX tenant_test.idx_autorisation_etudiant;
DROP INDEX tenant_test.idx_attestation_etudiant;
DROP INDEX tenant_test.idx_archive_type;
DROP INDEX tenant_test.idx_archive_etudiant;
DROP INDEX tenant_test.idx_archive_annee;
DROP INDEX tenant_test.idx_annonce_publie;
DROP INDEX tenant_test.idx_alerte_discipline_etudiant;
DROP INDEX tenant_test.idx_absence_enseignant;
DROP INDEX tenant_test.idx_absence_date;
ALTER TABLE ONLY tenant_test.verrouillage_notes DROP CONSTRAINT verrouillage_notes_pkey;
ALTER TABLE ONLY tenant_test.verrouillage_notes DROP CONSTRAINT verrouillage_notes_deliberation_id_etudiant_id_session_exam_key;
ALTER TABLE ONLY tenant_test.utilisateur DROP CONSTRAINT utilisateur_pkey;
ALTER TABLE ONLY tenant_test.utilisateur DROP CONSTRAINT utilisateur_email_key;
ALTER TABLE ONLY tenant_test.unite_enseignement DROP CONSTRAINT unite_enseignement_pkey;
ALTER TABLE ONLY tenant_test.unite_enseignement DROP CONSTRAINT unite_enseignement_parcours_id_code_key;
ALTER TABLE ONLY tenant_test.transfert_etudiant DROP CONSTRAINT transfert_etudiant_pkey;
ALTER TABLE ONLY tenant_test.ticket_maintenance DROP CONSTRAINT ticket_maintenance_pkey;
ALTER TABLE ONLY tenant_test.support_cours DROP CONSTRAINT support_cours_pkey;
ALTER TABLE ONLY tenant_test.suplement_diplome DROP CONSTRAINT suplement_diplome_pkey;
ALTER TABLE ONLY tenant_test.sujet_examen DROP CONSTRAINT sujet_examen_pkey;
ALTER TABLE ONLY tenant_test.suivi_moral DROP CONSTRAINT suivi_moral_pkey;
ALTER TABLE ONLY tenant_test.stock DROP CONSTRAINT stock_reference_key;
ALTER TABLE ONLY tenant_test.stock DROP CONSTRAINT stock_pkey;
ALTER TABLE ONLY tenant_test.stage DROP CONSTRAINT stage_pkey;
ALTER TABLE ONLY tenant_test.soutenance DROP CONSTRAINT soutenance_stage_id_key;
ALTER TABLE ONLY tenant_test.soutenance DROP CONSTRAINT soutenance_pkey;
ALTER TABLE ONLY tenant_test.session_jwt DROP CONSTRAINT session_jwt_refresh_token_key;
ALTER TABLE ONLY tenant_test.session_jwt DROP CONSTRAINT session_jwt_pkey;
ALTER TABLE ONLY tenant_test.session_examen DROP CONSTRAINT session_examen_pkey;
ALTER TABLE ONLY tenant_test.secretaire_parcours DROP CONSTRAINT secretaire_parcours_secretaire_id_parcours_id_actif_key;
ALTER TABLE ONLY tenant_test.secretaire_parcours DROP CONSTRAINT secretaire_parcours_pkey;
ALTER TABLE ONLY tenant_test.salle DROP CONSTRAINT salle_pkey;
ALTER TABLE ONLY tenant_test.salle DROP CONSTRAINT salle_code_key;
ALTER TABLE ONLY tenant_test.resultat_ue DROP CONSTRAINT resultat_ue_pkey;
ALTER TABLE ONLY tenant_test.resultat_ue DROP CONSTRAINT resultat_ue_etudiant_id_ue_id_resultat_semestre_id_key;
ALTER TABLE ONLY tenant_test.resultat_semestre DROP CONSTRAINT resultat_semestre_pkey;
ALTER TABLE ONLY tenant_test.resultat_semestre DROP CONSTRAINT resultat_semestre_etudiant_id_inscription_id_semestre_annee_key;
ALTER TABLE ONLY tenant_test.resultat_deliberation DROP CONSTRAINT resultat_deliberation_pv_id_etudiant_id_key;
ALTER TABLE ONLY tenant_test.resultat_deliberation DROP CONSTRAINT resultat_deliberation_pkey;
ALTER TABLE ONLY tenant_test.reservation_salle DROP CONSTRAINT reservation_salle_pkey;
ALTER TABLE ONLY tenant_test.referentiel_competences DROP CONSTRAINT referentiel_competences_pkey;
ALTER TABLE ONLY tenant_test.recrutement DROP CONSTRAINT recrutement_pkey;
ALTER TABLE ONLY tenant_test.rattrapage DROP CONSTRAINT rattrapage_pkey;
ALTER TABLE ONLY tenant_test.rapport_entretien DROP CONSTRAINT rapport_entretien_pkey;
ALTER TABLE ONLY tenant_test.rapport_conduite DROP CONSTRAINT rapport_conduite_pkey;
ALTER TABLE ONLY tenant_test.pv_deliberation DROP CONSTRAINT pv_deliberation_pkey;
ALTER TABLE ONLY tenant_test.proces_verbal DROP CONSTRAINT proces_verbal_pkey;
ALTER TABLE ONLY tenant_test.proces_verbal DROP CONSTRAINT proces_verbal_numero_key;
ALTER TABLE ONLY tenant_test.presence_surveillance DROP CONSTRAINT presence_surveillance_pkey;
ALTER TABLE ONLY tenant_test.presence DROP CONSTRAINT presence_pkey;
ALTER TABLE ONLY tenant_test.presence DROP CONSTRAINT presence_etudiant_id_seance_id_key;
ALTER TABLE ONLY tenant_test.pointage_qr DROP CONSTRAINT pointage_qr_pkey;
ALTER TABLE ONLY tenant_test.pointage_qr DROP CONSTRAINT pointage_qr_code_qr_key;
ALTER TABLE ONLY tenant_test.planning_entretien DROP CONSTRAINT planning_entretien_pkey;
ALTER TABLE ONLY tenant_test.permissions_portail DROP CONSTRAINT permissions_portail_type_portail_permission_key_key;
ALTER TABLE ONLY tenant_test.permissions_portail DROP CONSTRAINT permissions_portail_pkey;
ALTER TABLE ONLY tenant_test.parcours DROP CONSTRAINT parcours_pkey;
ALTER TABLE ONLY tenant_test.parcours DROP CONSTRAINT parcours_code_key;
ALTER TABLE ONLY tenant_test.paiement DROP CONSTRAINT paiement_reference_key;
ALTER TABLE ONLY tenant_test.paiement DROP CONSTRAINT paiement_pkey;
ALTER TABLE ONLY tenant_test.paiement DROP CONSTRAINT paiement_numero_recu_key;
ALTER TABLE ONLY tenant_test.paiement_inscription DROP CONSTRAINT paiement_inscription_reference_paiement_key;
ALTER TABLE ONLY tenant_test.paiement_inscription DROP CONSTRAINT paiement_inscription_pkey;
ALTER TABLE ONLY tenant_test.notification DROP CONSTRAINT notification_pkey;
ALTER TABLE ONLY tenant_test.note DROP CONSTRAINT note_pkey;
ALTER TABLE ONLY tenant_test.note DROP CONSTRAINT note_etudiant_id_ec_id_session_id_key;
ALTER TABLE ONLY tenant_test.note_derogatoire DROP CONSTRAINT note_derogatoire_pkey;
ALTER TABLE ONLY tenant_test.niveau_etude DROP CONSTRAINT niveau_etude_pkey;
ALTER TABLE ONLY tenant_test.niveau_etude DROP CONSTRAINT niveau_etude_code_key;
ALTER TABLE ONLY tenant_test.mouvement_stock DROP CONSTRAINT mouvement_stock_pkey;
ALTER TABLE ONLY tenant_test.message DROP CONSTRAINT message_pkey;
ALTER TABLE ONLY tenant_test.message_enseignant DROP CONSTRAINT message_enseignant_pkey;
ALTER TABLE ONLY tenant_test.message_destinataire DROP CONSTRAINT message_destinataire_pkey;
ALTER TABLE ONLY tenant_test.message_destinataire DROP CONSTRAINT message_destinataire_message_id_etudiant_id_key;
ALTER TABLE ONLY tenant_test.inscription DROP CONSTRAINT inscription_pkey;
ALTER TABLE ONLY tenant_test.inscription DROP CONSTRAINT inscription_numero_carte_key;
ALTER TABLE ONLY tenant_test.inscription DROP CONSTRAINT inscription_etudiant_id_parcours_id_annee_academique_id_key;
ALTER TABLE ONLY tenant_test.incident_disciplinaire DROP CONSTRAINT incident_disciplinaire_pkey;
ALTER TABLE ONLY tenant_test.heure_complementaire DROP CONSTRAINT heure_complementaire_pkey;
ALTER TABLE ONLY tenant_test.grille_tarifaire DROP CONSTRAINT grille_tarifaire_pkey;
ALTER TABLE ONLY tenant_test.grille_tarifaire DROP CONSTRAINT grille_tarifaire_parcours_id_annee_academique_id_annee_nive_key;
ALTER TABLE ONLY tenant_test.frais_inscription DROP CONSTRAINT frais_inscription_pkey;
ALTER TABLE ONLY tenant_test.frais_inscription DROP CONSTRAINT frais_inscription_parcours_id_annee_academique_id_key;
ALTER TABLE ONLY tenant_test.fiche_suivi_stage DROP CONSTRAINT fiche_suivi_stage_pkey;
ALTER TABLE ONLY tenant_test.fiche_paie DROP CONSTRAINT fiche_paie_pkey;
ALTER TABLE ONLY tenant_test.fiche_paie DROP CONSTRAINT fiche_paie_contrat_id_annee_mois_key;
ALTER TABLE ONLY tenant_test.evaluation_soutenance DROP CONSTRAINT evaluation_soutenance_soutenance_id_evaluateur_id_key;
ALTER TABLE ONLY tenant_test.evaluation_soutenance DROP CONSTRAINT evaluation_soutenance_pkey;
ALTER TABLE ONLY tenant_test.evaluation_personnel DROP CONSTRAINT evaluation_personnel_utilisateur_id_annee_evaluation_key;
ALTER TABLE ONLY tenant_test.evaluation_personnel DROP CONSTRAINT evaluation_personnel_pkey;
ALTER TABLE ONLY tenant_test.etudiant DROP CONSTRAINT etudiant_utilisateur_id_key;
ALTER TABLE ONLY tenant_test.etudiant DROP CONSTRAINT etudiant_pkey;
ALTER TABLE ONLY tenant_test.etudiant DROP CONSTRAINT etudiant_matricule_key;
ALTER TABLE ONLY tenant_test.enseignant DROP CONSTRAINT enseignant_utilisateur_id_key;
ALTER TABLE ONLY tenant_test.enseignant DROP CONSTRAINT enseignant_pkey;
ALTER TABLE ONLY tenant_test.enseignant DROP CONSTRAINT enseignant_matricule_key;
ALTER TABLE ONLY tenant_test.emploi_du_temps DROP CONSTRAINT emploi_du_temps_pkey;
ALTER TABLE ONLY tenant_test.element_constitutif DROP CONSTRAINT element_constitutif_ue_id_code_key;
ALTER TABLE ONLY tenant_test.element_constitutif DROP CONSTRAINT element_constitutif_pkey;
ALTER TABLE ONLY tenant_test.echeancier DROP CONSTRAINT echeancier_pkey;
ALTER TABLE ONLY tenant_test.echeancier DROP CONSTRAINT echeancier_inscription_id_num_tranche_key;
ALTER TABLE ONLY tenant_test.dossier_etudiant DROP CONSTRAINT dossier_etudiant_pkey;
ALTER TABLE ONLY tenant_test.diplome DROP CONSTRAINT diplome_pkey;
ALTER TABLE ONLY tenant_test.diplome DROP CONSTRAINT diplome_numero_diplome_key;
ALTER TABLE ONLY tenant_test.diplome DROP CONSTRAINT diplome_etudiant_id_type_diplome_parcours_id_key;
ALTER TABLE ONLY tenant_test.depense DROP CONSTRAINT depense_pkey;
ALTER TABLE ONLY tenant_test.departement DROP CONSTRAINT departement_pkey;
ALTER TABLE ONLY tenant_test.departement DROP CONSTRAINT departement_code_key;
ALTER TABLE ONLY tenant_test.demande_ressource DROP CONSTRAINT demande_ressource_pkey;
ALTER TABLE ONLY tenant_test.demande_etudiant DROP CONSTRAINT demande_etudiant_pkey;
ALTER TABLE ONLY tenant_test.deliberation DROP CONSTRAINT deliberation_session_examen_id_parcours_id_semestre_annee_n_key;
ALTER TABLE ONLY tenant_test.deliberation DROP CONSTRAINT deliberation_pkey;
ALTER TABLE ONLY tenant_test.delegation_signature DROP CONSTRAINT delegation_signature_pkey;
ALTER TABLE ONLY tenant_test.declaration_sociale DROP CONSTRAINT declaration_sociale_pkey;
ALTER TABLE ONLY tenant_test.convocation DROP CONSTRAINT convocation_pkey;
ALTER TABLE ONLY tenant_test.convention DROP CONSTRAINT convention_pkey;
ALTER TABLE ONLY tenant_test.contrat_personnel DROP CONSTRAINT contrat_personnel_pkey;
ALTER TABLE ONLY tenant_test.conseil_discipline DROP CONSTRAINT conseil_discipline_pkey;
ALTER TABLE ONLY tenant_test.conge_personnel DROP CONSTRAINT conge_personnel_pkey;
ALTER TABLE ONLY tenant_test.configuration_examen DROP CONSTRAINT configuration_examen_pkey;
ALTER TABLE ONLY tenant_test.cloture_caisse DROP CONSTRAINT cloture_caisse_pkey;
ALTER TABLE ONLY tenant_test.cloture_caisse DROP CONSTRAINT cloture_caisse_date_cloture_caissier_id_key;
ALTER TABLE ONLY tenant_test.candidature DROP CONSTRAINT candidature_pkey;
ALTER TABLE ONLY tenant_test.calendrier_academique DROP CONSTRAINT calendrier_academique_pkey;
ALTER TABLE ONLY tenant_test.budget DROP CONSTRAINT budget_pkey;
ALTER TABLE ONLY tenant_test.batiment DROP CONSTRAINT batiment_pkey;
ALTER TABLE ONLY tenant_test.batiment DROP CONSTRAINT batiment_code_key;
ALTER TABLE ONLY tenant_test.autorisation_sortie DROP CONSTRAINT autorisation_sortie_pkey;
ALTER TABLE ONLY tenant_test.attestation DROP CONSTRAINT attestation_pkey;
ALTER TABLE ONLY tenant_test.archive_scolarite DROP CONSTRAINT archive_scolarite_pkey;
ALTER TABLE ONLY tenant_test.annonce DROP CONSTRAINT annonce_pkey;
ALTER TABLE ONLY tenant_test.annee_academique DROP CONSTRAINT annee_academique_pkey;
ALTER TABLE ONLY tenant_test.annee_academique DROP CONSTRAINT annee_academique_libelle_key;
ALTER TABLE ONLY tenant_test.alerte_discipline DROP CONSTRAINT alerte_discipline_pkey;
ALTER TABLE ONLY tenant_test.affectation_cours DROP CONSTRAINT affectation_cours_pkey;
ALTER TABLE ONLY tenant_test.absence_enseignant DROP CONSTRAINT absence_enseignant_pkey;
ALTER TABLE tenant_test.delegation_signature ALTER COLUMN id DROP DEFAULT;
ALTER TABLE tenant_test.convention ALTER COLUMN id DROP DEFAULT;
DROP VIEW tenant_test.vue_statistiques_paiement_parcours;
DROP VIEW tenant_test.vue_statistiques_deliberation;
DROP VIEW tenant_test.vue_paiement_etudiant;
DROP VIEW tenant_test.vue_moyenne_semestre;
DROP VIEW tenant_test.vue_moyenne_ue;
DROP VIEW tenant_test.vue_kpi_president;
DROP VIEW tenant_test.vue_frais_inscription_actifs;
DROP VIEW tenant_test.vue_absences_etudiant;
DROP TABLE tenant_test.verrouillage_notes;
DROP TABLE tenant_test.utilisateur;
DROP TABLE tenant_test.unite_enseignement;
DROP TABLE tenant_test.transfert_etudiant;
DROP TABLE tenant_test.ticket_maintenance;
DROP TABLE tenant_test.support_cours;
DROP TABLE tenant_test.suplement_diplome;
DROP TABLE tenant_test.sujet_examen;
DROP TABLE tenant_test.suivi_moral;
DROP TABLE tenant_test.stock;
DROP TABLE tenant_test.stage;
DROP TABLE tenant_test.soutenance;
DROP TABLE tenant_test.session_jwt;
DROP TABLE tenant_test.session_examen;
DROP SEQUENCE tenant_test.seq_recu;
DROP TABLE tenant_test.secretaire_parcours;
DROP TABLE tenant_test.salle;
DROP TABLE tenant_test.resultat_ue;
DROP TABLE tenant_test.resultat_semestre;
DROP TABLE tenant_test.resultat_deliberation;
DROP TABLE tenant_test.reservation_salle;
DROP TABLE tenant_test.referentiel_competences;
DROP TABLE tenant_test.recrutement;
DROP TABLE tenant_test.rattrapage;
DROP TABLE tenant_test.rapport_entretien;
DROP TABLE tenant_test.rapport_conduite;
DROP TABLE tenant_test.pv_deliberation;
DROP TABLE tenant_test.proces_verbal;
DROP TABLE tenant_test.presence_surveillance;
DROP TABLE tenant_test.presence;
DROP TABLE tenant_test.pointage_qr;
DROP TABLE tenant_test.planning_entretien;
DROP TABLE tenant_test.permissions_portail;
DROP TABLE tenant_test.parcours;
DROP TABLE tenant_test.paiement_inscription;
DROP TABLE tenant_test.paiement;
DROP TABLE tenant_test.notification;
DROP TABLE tenant_test.note_derogatoire;
DROP TABLE tenant_test.note;
DROP TABLE tenant_test.niveau_etude;
DROP TABLE tenant_test.mouvement_stock;
DROP TABLE tenant_test.message_enseignant;
DROP TABLE tenant_test.message_destinataire;
DROP TABLE tenant_test.message;
DROP TABLE tenant_test.inscription;
DROP TABLE tenant_test.incident_disciplinaire;
DROP TABLE tenant_test.heure_complementaire;
DROP TABLE tenant_test.grille_tarifaire;
DROP TABLE tenant_test.frais_inscription;
DROP TABLE tenant_test.fiche_suivi_stage;
DROP TABLE tenant_test.fiche_paie;
DROP TABLE tenant_test.evaluation_soutenance;
DROP TABLE tenant_test.evaluation_personnel;
DROP TABLE tenant_test.etudiant;
DROP TABLE tenant_test.enseignant;
DROP TABLE tenant_test.emploi_du_temps;
DROP TABLE tenant_test.element_constitutif;
DROP TABLE tenant_test.echeancier;
DROP TABLE tenant_test.dossier_etudiant;
DROP TABLE tenant_test.diplome;
DROP TABLE tenant_test.depense;
DROP TABLE tenant_test.departement;
DROP TABLE tenant_test.demande_ressource;
DROP TABLE tenant_test.demande_etudiant;
DROP TABLE tenant_test.deliberation;
DROP SEQUENCE tenant_test.delegation_signature_id_seq;
DROP TABLE tenant_test.delegation_signature;
DROP TABLE tenant_test.declaration_sociale;
DROP TABLE tenant_test.convocation;
DROP SEQUENCE tenant_test.convention_id_seq;
DROP TABLE tenant_test.convention;
DROP TABLE tenant_test.contrat_personnel;
DROP TABLE tenant_test.conseil_discipline;
DROP TABLE tenant_test.conge_personnel;
DROP TABLE tenant_test.configuration_examen;
DROP TABLE tenant_test.cloture_caisse;
DROP TABLE tenant_test.candidature;
DROP TABLE tenant_test.calendrier_academique;
DROP TABLE tenant_test.budget;
DROP TABLE tenant_test.batiment;
DROP TABLE tenant_test.autorisation_sortie;
DROP TABLE tenant_test.attestation;
DROP TABLE tenant_test.archive_scolarite;
DROP TABLE tenant_test.annonce;
DROP TABLE tenant_test.annee_academique;
DROP TABLE tenant_test.alerte_discipline;
DROP TABLE tenant_test.affectation_cours;
DROP TABLE tenant_test.absence_enseignant;
DROP FUNCTION tenant_test.update_updated_at_column();
DROP FUNCTION tenant_test.update_paiement_inscription_updated_at();
DROP FUNCTION tenant_test.trigger_set_updated_at();
DROP FUNCTION tenant_test.trigger_numero_recu();
DROP FUNCTION tenant_test.trigger_notification_paiement();
DROP FUNCTION tenant_test.trigger_note_verrouille();
DROP FUNCTION tenant_test.trigger_alerte_stock();
DROP FUNCTION tenant_test.check_note_verrouillee();
DROP FUNCTION tenant_test.calculer_moyenne_semestre(p_etudiant_id uuid, p_inscription_id uuid, p_semestre smallint, p_annee_niveau smallint);
DROP FUNCTION tenant_test.calculer_credits_acquis(p_etudiant_id uuid, p_inscription_id uuid, p_semestre smallint, p_annee_niveau smallint);
DROP SCHEMA tenant_test;
--
-- TOC entry 9 (class 2615 OID 98158)
-- Name: tenant_test; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA tenant_test;


ALTER SCHEMA tenant_test OWNER TO postgres;

--
-- TOC entry 492 (class 1255 OID 98167)
-- Name: calculer_credits_acquis(uuid, uuid, smallint, smallint); Type: FUNCTION; Schema: tenant_test; Owner: postgres
--

CREATE FUNCTION tenant_test.calculer_credits_acquis(p_etudiant_id uuid, p_inscription_id uuid, p_semestre smallint, p_annee_niveau smallint) RETURNS smallint
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_credits_acquis SMALLINT;
BEGIN
    SELECT COALESCE(SUM(ue.credits_ects), 0) INTO v_credits_acquis
    FROM resultat_ue ru
    JOIN unite_enseignement ue ON ru.ue_id = ue.id
    JOIN resultat_semestre rs ON ru.resultat_semestre_id = rs.id
    WHERE ru.etudiant_id = p_etudiant_id
    AND rs.inscription_id = p_inscription_id
    AND rs.semestre = p_semestre
    AND rs.annee_niveau = p_annee_niveau
    AND ru.statut = 'valide';
    
    RETURN v_credits_acquis;
END;
$$;


ALTER FUNCTION tenant_test.calculer_credits_acquis(p_etudiant_id uuid, p_inscription_id uuid, p_semestre smallint, p_annee_niveau smallint) OWNER TO postgres;

--
-- TOC entry 491 (class 1255 OID 98166)
-- Name: calculer_moyenne_semestre(uuid, uuid, smallint, smallint); Type: FUNCTION; Schema: tenant_test; Owner: postgres
--

CREATE FUNCTION tenant_test.calculer_moyenne_semestre(p_etudiant_id uuid, p_inscription_id uuid, p_semestre smallint, p_annee_niveau smallint) RETURNS numeric
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_moyenne DECIMAL(5,2);
BEGIN
    SELECT COALESCE(
        SUM(n.valeur * ec.coefficient) / SUM(ec.coefficient), 
        0
    ) INTO v_moyenne
    FROM note n
    JOIN element_constitutif ec ON n.ec_id = ec.id
    JOIN unite_enseignement ue ON ec.ue_id = ue.id
    WHERE n.etudiant_id = p_etudiant_id
    AND ue.semestre = p_semestre
    AND ue.annee_niveau = p_annee_niveau
    AND n.absence_justifiee = FALSE;
    
    RETURN ROUND(v_moyenne, 2);
END;
$$;


ALTER FUNCTION tenant_test.calculer_moyenne_semestre(p_etudiant_id uuid, p_inscription_id uuid, p_semestre smallint, p_annee_niveau smallint) OWNER TO postgres;

--
-- TOC entry 490 (class 1255 OID 98165)
-- Name: check_note_verrouillee(); Type: FUNCTION; Schema: tenant_test; Owner: postgres
--

CREATE FUNCTION tenant_test.check_note_verrouillee() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Vérifier si la note est verrouillée
    IF EXISTS (
        SELECT 1 FROM verrouillage_notes vn 
        WHERE vn.etudiant_id = NEW.etudiant_id 
        AND vn.session_examen_id = NEW.session_id 
        AND vn.statut = 'verrouille'
        AND (vn.autorisation_modif IS FALSE OR vn.date_fin_autorisation < CURRENT_DATE)
    ) THEN
        RAISE EXCEPTION 'Impossible de modifier une note verrouillée après délibération';
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION tenant_test.check_note_verrouillee() OWNER TO postgres;

--
-- TOC entry 486 (class 1255 OID 98163)
-- Name: trigger_alerte_stock(); Type: FUNCTION; Schema: tenant_test; Owner: postgres
--

CREATE FUNCTION tenant_test.trigger_alerte_stock() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW.quantite_stock <= NEW.seuil_alerte THEN
        INSERT INTO notification (utilisateur_id, titre, message, type_notification)
        SELECT u.id,
               'Alerte stock : ' || NEW.libelle,
               'Le stock de ' || NEW.libelle || ' est sous le seuil d''alerte (' || NEW.quantite_stock || ' ' || NEW.unite || ' restant(s)).',
               'alerte'
        FROM utilisateur u
        WHERE u.role IN ('logistique', 'admin') AND u.actif = TRUE;
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION tenant_test.trigger_alerte_stock() OWNER TO postgres;

--
-- TOC entry 487 (class 1255 OID 98164)
-- Name: trigger_note_verrouille(); Type: FUNCTION; Schema: tenant_test; Owner: postgres
--

CREATE FUNCTION tenant_test.trigger_note_verrouille() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF OLD.verrouille = TRUE AND NEW.verrouille = TRUE THEN
        RAISE EXCEPTION 'Modification interdite : la note (%) est verrouillée après délibération.', OLD.id;
    END IF;
    IF NEW.verrouille = TRUE AND OLD.verrouille = FALSE THEN
        NEW.date_verrouillage = NOW();
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION tenant_test.trigger_note_verrouille() OWNER TO postgres;

--
-- TOC entry 485 (class 1255 OID 98162)
-- Name: trigger_notification_paiement(); Type: FUNCTION; Schema: tenant_test; Owner: postgres
--

CREATE FUNCTION tenant_test.trigger_notification_paiement() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_user_id UUID;
BEGIN
    SELECT e.utilisateur_id INTO v_user_id
    FROM inscription i
    JOIN etudiant e ON e.id = i.etudiant_id
    WHERE i.id = NEW.inscription_id;

    IF v_user_id IS NOT NULL THEN
        INSERT INTO notification (utilisateur_id, titre, message, type_notification)
        VALUES (
            v_user_id,
            'Paiement reçu',
            'Votre paiement de ' || NEW.montant || ' a été enregistré. Reçu N° ' || NEW.numero_recu,
            'paiement'
        );
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION tenant_test.trigger_notification_paiement() OWNER TO postgres;

--
-- TOC entry 484 (class 1255 OID 98161)
-- Name: trigger_numero_recu(); Type: FUNCTION; Schema: tenant_test; Owner: postgres
--

CREATE FUNCTION tenant_test.trigger_numero_recu() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW.numero_recu IS NULL OR NEW.numero_recu = '' THEN
        NEW.numero_recu = 'RECU-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(nextval('seq_recu')::TEXT, 6, '0');
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION tenant_test.trigger_numero_recu() OWNER TO postgres;

--
-- TOC entry 483 (class 1255 OID 98160)
-- Name: trigger_set_updated_at(); Type: FUNCTION; Schema: tenant_test; Owner: postgres
--

CREATE FUNCTION tenant_test.trigger_set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION tenant_test.trigger_set_updated_at() OWNER TO postgres;

--
-- TOC entry 488 (class 1255 OID 98168)
-- Name: update_paiement_inscription_updated_at(); Type: FUNCTION; Schema: tenant_test; Owner: postgres
--

CREATE FUNCTION tenant_test.update_paiement_inscription_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION tenant_test.update_paiement_inscription_updated_at() OWNER TO postgres;

--
-- TOC entry 489 (class 1255 OID 98159)
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: tenant_test; Owner: postgres
--

CREATE FUNCTION tenant_test.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION tenant_test.update_updated_at_column() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 351 (class 1259 OID 99102)
-- Name: absence_enseignant; Type: TABLE; Schema: tenant_test; Owner: postgres
--

CREATE TABLE tenant_test.absence_enseignant (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    enseignant_id uuid NOT NULL,
    seance_id uuid,
    date_absence date NOT NULL,
    heure_debut time without time zone,
    heure_fin time without time zone,
    motif character varying(100) NOT NULL,
    justification text,
    justificatif_url character varying(500),
    est_justifiee boolean DEFAULT false,
    statut character varying(20) DEFAULT 'declaree'::character varying,
    declaree_par uuid NOT NULL,
    validee_par uuid,
    date_validation timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT absence_enseignant_motif_check CHECK (((motif)::text = ANY ((ARRAY['maladie'::character varying, 'formation'::character varying, 'congres'::character varying, 'personnel'::character varying, 'autre'::character varying])::text[]))),
    CONSTRAINT absence_enseignant_statut_check CHECK (((statut)::text = ANY ((ARRAY['declaree'::character varying, 'validee'::character varying, 'refusee'::character varying])::text[])))
);


ALTER TABLE tenant_test.absence_enseignant OWNER TO postgres;

--
-- TOC entry 339 (class 1259 OID 98648)
-- Name: affectation_cours; Type: TABLE; Schema: tenant_test; Owner: postgres
--

CREATE TABLE tenant_test.affectation_cours (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    enseignant_id uuid NOT NULL,
    ue_id uuid,
    ec_id uuid,
    annee_academique_id uuid NOT NULL,
    type_seance character varying(10) DEFAULT 'CM'::character varying NOT NULL,
    volume_prevu smallint DEFAULT 0 NOT NULL,
    volume_realise smallint DEFAULT 0,
    valide_par uuid,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT affectation_cours_check CHECK (((ue_id IS NOT NULL) OR (ec_id IS NOT NULL))),
    CONSTRAINT affectation_cours_type_seance_check CHECK (((type_seance)::text = ANY ((ARRAY['CM'::character varying, 'TD'::character varying, 'TP'::character varying])::text[])))
);


ALTER TABLE tenant_test.affectation_cours OWNER TO postgres;

--
-- TOC entry 394 (class 1259 OID 100464)
-- Name: alerte_discipline; Type: TABLE; Schema: tenant_test; Owner: postgres
--

CREATE TABLE tenant_test.alerte_discipline (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    etudiant_id uuid NOT NULL,
    type character varying(100) NOT NULL,
    message text NOT NULL,
    statut character varying(50) DEFAULT 'non_lue'::character varying,
    generee_par uuid NOT NULL,
    destinataire_role character varying(100) DEFAULT 'secretariat'::character varying,
    date_lecture timestamp without time zone,
    traitee_par uuid,
    date_traitement timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT alerte_discipline_statut_check CHECK (((statut)::text = ANY ((ARRAY['non_lue'::character varying, 'lue'::character varying, 'traitee'::character varying])::text[]))),
    CONSTRAINT alerte_discipline_type_check CHECK (((type)::text = ANY ((ARRAY['absence_repetee'::character varying, 'retard_cumule'::character varying, 'sanction_grave'::character varying, 'incident_critique'::character varying])::text[])))
);


ALTER TABLE tenant_test.alerte_discipline OWNER TO postgres;

--
-- TOC entry 7007 (class 0 OID 0)
-- Dependencies: 394
-- Name: TABLE alerte_discipline; Type: COMMENT; Schema: tenant_test; Owner: postgres
--

COMMENT ON TABLE tenant_test.alerte_discipline IS 'Alertes automatiques remontées au secrétariat';


--
-- TOC entry 320 (class 1259 OID 98214)
-- Name: annee_academique; Type: TABLE; Schema: tenant_test; Owner: postgres
--

CREATE TABLE tenant_test.annee_academique (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    libelle character varying(20) NOT NULL,
    date_debut date NOT NULL,
    date_fin date NOT NULL,
    active boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE tenant_test.annee_academique OWNER TO postgres;

--
-- TOC entry 379 (class 1259 OID 100035)
-- Name: annonce; Type: TABLE; Schema: tenant_test; Owner: postgres
--

CREATE TABLE tenant_test.annonce (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    titre character varying(300) NOT NULL,
    contenu text NOT NULL,
    type_annonce character varying(30) DEFAULT 'information'::character varying,
    cible character varying(20) DEFAULT 'tous'::character varying,
    parcours_id uuid,
    publie boolean DEFAULT false,
    date_publication timestamp with time zone,
    date_expiration timestamp with time zone,
    auteur_id uuid NOT NULL,
    photo_url character varying(500),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT annonce_cible_check CHECK (((cible)::text = ANY ((ARRAY['tous'::character varying, 'etudiants'::character varying, 'parents'::character varying, 'enseignants'::character varying, 'personnel'::character varying, 'parcours'::character varying])::text[]))),
    CONSTRAINT annonce_type_annonce_check CHECK (((type_annonce)::text = ANY ((ARRAY['information'::character varying, 'urgent'::character varying, 'evenement'::character varying, 'resultat'::character varying, 'pastoral'::character varying, 'fermeture'::character varying])::text[])))
);


ALTER TABLE tenant_test.annonce OWNER TO postgres;

--
-- TOC entry 401 (class 1259 OID 100633)
-- Name: archive_scolarite; Type: TABLE; Schema: tenant_test; Owner: postgres
--

CREATE TABLE tenant_test.archive_scolarite (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    etudiant_id uuid NOT NULL,
    type_document character varying(50) NOT NULL,
    titre_document character varying(200) NOT NULL,
    annee_academique character varying(20) NOT NULL,
    semestre smallint,
    fichier_original_url character varying(500),
    fichier_pdf_url character varying(500),
    hash_integrite character varying(128),
    format character varying(20) DEFAULT 'PDF'::character varying,
    taille_octets bigint,
    langue character varying(10) DEFAULT 'FR'::character varying,
    acces_public boolean DEFAULT false,
    date_limite_acces date,
    archive_par uuid NOT NULL,
    date_archivage timestamp with time zone DEFAULT now(),
    duree_conservation integer DEFAULT 10,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT archive_scolarite_type_document_check CHECK (((type_document)::text = ANY ((ARRAY['releve_notes'::character varying, 'attestation_reussite'::character varying, 'diplome'::character varying, 'suplement_diplome'::character varying, 'certificat_scolarite'::character varying, 'transcript'::character varying])::text[])))
);


ALTER TABLE tenant_test.archive_scolarite OWNER TO postgres;

--
-- TOC entry 7008 (class 0 OID 0)
-- Dependencies: 401
-- Name: TABLE archive_scolarite; Type: COMMENT; Schema: tenant_test; Owner: postgres
--

COMMENT ON TABLE tenant_test.archive_scolarite IS 'Archivage officiel des documents de scolarité';


--
-- TOC entry 402 (class 1259 OID 100665)
-- Name: attestation; Type: TABLE; Schema: tenant_test; Owner: postgres
--

CREATE TABLE tenant_test.attestation (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    etudiant_id uuid NOT NULL,
    inscription_id uuid,
    type_attestation character varying(50) NOT NULL,
    numero_attestation character varying(100) NOT NULL,
    annee_academique_id uuid,
    motif text,
    observations text,
    statut character varying(30) DEFAULT 'en_attente'::character varying,
    genere_par uuid,
    date_generation timestamp with time zone DEFAULT now(),
    fichier_url character varying(500),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    date_emission timestamp with time zone DEFAULT now(),
    CONSTRAINT attestation_statut_check CHECK (((statut)::text = ANY ((ARRAY['en_attente'::character varying, 'validee'::character varying, 'refusee'::character varying, 'annulee'::character varying])::text[]))),
    CONSTRAINT attestation_type_attestation_check CHECK (((type_attestation)::text = ANY ((ARRAY['scolarite'::character varying, 'reussite'::character varying, 'inscription'::character varying, 'preinscription'::character varying, 'stage'::character varying, 'autre'::character varying])::text[])))
);


ALTER TABLE tenant_test.attestation OWNER TO postgres;

--
-- TOC entry 7009 (class 0 OID 0)
-- Dependencies: 402
-- Name: TABLE attestation; Type: COMMENT; Schema: tenant_test; Owner: postgres
--

COMMENT ON TABLE tenant_test.attestation IS 'Gestion des attestations étudiants (scolarité, réussite, inscription, etc.)';


--
-- TOC entry 397 (class 1259 OID 100521)
-- Name: autorisation_sortie; Type: TABLE; Schema: tenant_test; Owner: postgres
--

CREATE TABLE tenant_test.autorisation_sortie (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    etudiant_id uuid NOT NULL,
    type character varying(100) NOT NULL,
    date_debut timestamp without time zone NOT NULL,
    date_fin timestamp without time zone NOT NULL,
    motif text NOT NULL,
    demande_par uuid NOT NULL,
    est_mineur boolean DEFAULT false,
    autorisation_parentale_url text,
    statut character varying(50) DEFAULT 'en_attente'::character varying,
    validee_par uuid,
    date_validation timestamp without time zone,
    motif_refus text,
    observations text,
    sortie_effective boolean DEFAULT false,
    heure_sortie time without time zone,
    heure_retour time without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT autorisation_sortie_statut_check CHECK (((statut)::text = ANY ((ARRAY['en_attente'::character varying, 'approuvee'::character varying, 'refusee'::character varying, 'annulee'::character varying])::text[]))),
    CONSTRAINT autorisation_sortie_type_check CHECK (((type)::text = ANY ((ARRAY['sortie_anticipee'::character varying, 'absence_prevue'::character varying, 'sortie_exceptionnelle'::character varying])::text[])))
);


ALTER TABLE tenant_test.autorisation_sortie OWNER TO postgres;

--
-- TOC entry 322 (class 1259 OID 98246)
-- Name: batiment; Type: TABLE; Schema: tenant_test; Owner: postgres
--

CREATE TABLE tenant_test.batiment (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nom character varying(100) NOT NULL,
    code character varying(20),
    adresse text,
    actif boolean DEFAULT true
);


ALTER TABLE tenant_test.batiment OWNER TO postgres;

--
-- TOC entry 365 (class 1259 OID 99613)
-- Name: budget; Type: TABLE; Schema: tenant_test; Owner: postgres
--

CREATE TABLE tenant_test.budget (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    annee_academique_id uuid NOT NULL,
    departement_id uuid,
    categorie character varying(100) NOT NULL,
    montant_prevu numeric(15,2) NOT NULL,
    montant_realise numeric(15,2) DEFAULT 0,
    description text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE tenant_test.budget OWNER TO postgres;

--
-- TOC entry 372 (class 1259 OID 99820)
-- Name: calendrier_academique; Type: TABLE; Schema: tenant_test; Owner: postgres
--

CREATE TABLE tenant_test.calendrier_academique (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    annee_academique_id uuid NOT NULL,
    evenement character varying(200) NOT NULL,
    type_evenement character varying(50) NOT NULL,
    date_debut date NOT NULL,
    date_fin date NOT NULL,
    parcours_id uuid,
    description text,
    valide_par_president uuid,
    valide_le timestamp with time zone,
    commentaire_president text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT calendrier_academique_type_evenement_check CHECK (((type_evenement)::text = ANY ((ARRAY['rentree'::character varying, 'cours'::character varying, 'vacances'::character varying, 'examens'::character varying, 'deliberation'::character varying, 'ceremonie'::character varying, 'pastoral'::character varying, 'autre'::character varying])::text[])))
);


ALTER TABLE tenant_test.calendrier_academique OWNER TO postgres;

--
-- TOC entry 346 (class 1259 OID 98884)
-- Name: candidature; Type: TABLE; Schema: tenant_test; Owner: postgres
--

CREATE TABLE tenant_test.candidature (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    recrutement_id uuid NOT NULL,
    nom character varying(100) NOT NULL,
    prenom character varying(100) NOT NULL,
    email character varying(254) NOT NULL,
    telephone character varying(30),
    cv_url character varying(500),
    lettre_motivation_url character varying(500),
    statut character varying(20) DEFAULT 'recue'::character varying,
    notes_evaluation text,
    date_entretien timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT candidature_statut_check CHECK (((statut)::text = ANY ((ARRAY['recue'::character varying, 'preselectionne'::character varying, 'entretien'::character varying, 'retenu'::character varying, 'refuse'::character varying])::text[])))
);


ALTER TABLE tenant_test.candidature OWNER TO postgres;

--
-- TOC entry 345 (class 1259 OID 98850)
-- Name: cloture_caisse; Type: TABLE; Schema: tenant_test; Owner: postgres
--

CREATE TABLE tenant_test.cloture_caisse (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    date_cloture date NOT NULL,
    caissier_id uuid NOT NULL,
    total_especes numeric(12,2) DEFAULT 0,
    total_cheques numeric(12,2) DEFAULT 0,
    total_virements numeric(12,2) DEFAULT 0,
    total_carte_bancaire numeric(12,2) DEFAULT 0,
    total_mobile_money numeric(12,2) DEFAULT 0,
    total_general numeric(12,2) DEFAULT 0,
    nombre_paiements integer DEFAULT 0,
    details_paiements jsonb DEFAULT '{"autres": {"nombre": 0, "montant": 0}, "scolarite": {"nombre": 0, "montant": 0}, "inscription": {"nombre": 0, "montant": 0}}'::jsonb,
    solde_banque_theorique numeric(12,2),
    solde_banque_reel numeric(12,2),
    ecart numeric(12,2),
    motif_ecart text,
    valide boolean DEFAULT false,
    valide_par uuid,
    date_validation timestamp with time zone,
    observations text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE tenant_test.cloture_caisse OWNER TO postgres;

--
-- TOC entry 7010 (class 0 OID 0)
-- Dependencies: 345
-- Name: TABLE cloture_caisse; Type: COMMENT; Schema: tenant_test; Owner: postgres
--

COMMENT ON TABLE tenant_test.cloture_caisse IS 'Clôture journalière de caisse avec réconciliation bancaire';


--
-- TOC entry 395 (class 1259 OID 100483)
-- Name: configuration_examen; Type: TABLE; Schema: tenant_test; Owner: postgres
--

CREATE TABLE tenant_test.configuration_examen (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    session_examen_id uuid NOT NULL,
    salle_id uuid NOT NULL,
    places_total integer DEFAULT 0,
    places_attribuees integer DEFAULT 0,
    plan_places jsonb DEFAULT '[]'::jsonb,
    surveillant_id uuid NOT NULL,
    statut character varying(50) DEFAULT 'preparation'::character varying,
    rapport_incident text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT configuration_examen_statut_check CHECK (((statut)::text = ANY ((ARRAY['preparation'::character varying, 'en_cours'::character varying, 'termine'::character varying, 'incident'::character varying])::text[])))
);


ALTER TABLE tenant_test.configuration_examen OWNER TO postgres;

--
-- TOC entry 7011 (class 0 OID 0)
-- Dependencies: 395
-- Name: TABLE configuration_examen; Type: COMMENT; Schema: tenant_test; Owner: postgres
--

COMMENT ON TABLE tenant_test.configuration_examen IS 'Configuration des salles d''examen et placement des étudiants';


--
-- TOC entry 367 (class 1259 OID 99681)
-- Name: conge_personnel; Type: TABLE; Schema: tenant_test; Owner: postgres
--

CREATE TABLE tenant_test.conge_personnel (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    utilisateur_id uuid NOT NULL,
    type_conge character varying(50) NOT NULL,
    date_debut date NOT NULL,
    date_fin date NOT NULL,
    nb_jours smallint GENERATED ALWAYS AS (((date_fin - date_debut) + 1)) STORED,
    motif text,
    statut character varying(20) DEFAULT 'demande'::character varying,
    approuve_par uuid,
    date_approbation timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT conge_personnel_statut_check CHECK (((statut)::text = ANY ((ARRAY['demande'::character varying, 'approuve'::character varying, 'refuse'::character varying, 'annule'::character varying])::text[]))),
    CONSTRAINT conge_personnel_type_conge_check CHECK (((type_conge)::text = ANY ((ARRAY['annuel'::character varying, 'maladie'::character varying, 'maternite'::character varying, 'paternite'::character varying, 'sans_solde'::character varying, 'autre'::character varying])::text[])))
);


ALTER TABLE tenant_test.conge_personnel OWNER TO postgres;

--
-- TOC entry 399 (class 1259 OID 100567)
-- Name: conseil_discipline; Type: TABLE; Schema: tenant_test; Owner: postgres
--

CREATE TABLE tenant_test.conseil_discipline (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    etudiant_id uuid NOT NULL,
    date_conseil timestamp without time zone NOT NULL,
    motif_convocation text NOT NULL,
    incidents_lies jsonb DEFAULT '[]'::jsonb,
    membres_presents jsonb DEFAULT '[]'::jsonb,
    deliberation text,
    decision character varying(100),
    justification_decision text,
    droit_appel boolean DEFAULT true,
    delai_appel_jours integer DEFAULT 15,
    statut character varying(50) DEFAULT 'convoque'::character varying,
    proces_verbal_url text,
    parent_present boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT conseil_discipline_decision_check CHECK (((decision)::text = ANY ((ARRAY['aucune_sanction'::character varying, 'avertissement'::character varying, 'blame'::character varying, 'exclusion_temporaire'::character varying, 'exclusion_definitive'::character varying, 'renvoi'::character varying])::text[]))),
    CONSTRAINT conseil_discipline_statut_check CHECK (((statut)::text = ANY ((ARRAY['convoque'::character varying, 'tenu'::character varying, 'reporte'::character varying, 'annule'::character varying])::text[])))
);


ALTER TABLE tenant_test.conseil_discipline OWNER TO postgres;

--
-- TOC entry 331 (class 1259 OID 98493)
-- Name: contrat_personnel; Type: TABLE; Schema: tenant_test; Owner: postgres
--

CREATE TABLE tenant_test.contrat_personnel (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    utilisateur_id uuid NOT NULL,
    type_contrat character varying(30) NOT NULL,
    poste character varying(200) NOT NULL,
    departement_id uuid,
    date_debut date NOT NULL,
    date_fin date,
    salaire_brut numeric(12,2),
    salaire_net numeric(12,2),
    volume_horaire_hebdo smallint,
    actif boolean DEFAULT true,
    fichier_contrat_url character varying(500),
    observations text,
    valide_par uuid,
    valide_le timestamp with time zone,
    commentaire_president text,
    conditions_speciales text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT contrat_personnel_type_contrat_check CHECK (((type_contrat)::text = ANY ((ARRAY['CDI'::character varying, 'CDD'::character varying, 'vacataire'::character varying, 'stagiaire'::character varying, 'benevolat'::character varying])::text[])))
);


ALTER TABLE tenant_test.contrat_personnel OWNER TO postgres;

--
-- TOC entry 334 (class 1259 OID 98551)
-- Name: convention; Type: TABLE; Schema: tenant_test; Owner: postgres
--

CREATE TABLE tenant_test.convention (
    id integer NOT NULL,
    intitule character varying(255) NOT NULL,
    partenaire character varying(255) NOT NULL,
    type_partenaire character varying(50) NOT NULL,
    objet_convention text NOT NULL,
    date_proposee date NOT NULL,
    document_url text,
    statut character varying(50) DEFAULT 'en_attente_signature'::character varying NOT NULL,
    signe_president boolean DEFAULT false,
    date_signature timestamp with time zone,
    signature_hash character varying(255),
    representant_partenaire character varying(255),
    date_effet date,
    remarques_president text,
    cree_par integer,
    cree_le timestamp with time zone DEFAULT now(),
    modifie_le timestamp with time zone DEFAULT now(),
    CONSTRAINT convention_statut_check CHECK (((statut)::text = ANY ((ARRAY['en_attente_signature'::character varying, 'signee'::character varying, 'rejetee'::character varying, 'expiree'::character varying])::text[]))),
    CONSTRAINT convention_type_partenaire_check CHECK (((type_partenaire)::text = ANY ((ARRAY['eglise'::character varying, 'diocese'::character varying, 'etat'::character varying, 'entreprise'::character varying, 'universite'::character varying])::text[])))
);


ALTER TABLE tenant_test.convention OWNER TO postgres;

--
-- TOC entry 333 (class 1259 OID 98550)
-- Name: convention_id_seq; Type: SEQUENCE; Schema: tenant_test; Owner: postgres
--

CREATE SEQUENCE tenant_test.convention_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE tenant_test.convention_id_seq OWNER TO postgres;

--
-- TOC entry 7012 (class 0 OID 0)
-- Dependencies: 333
-- Name: convention_id_seq; Type: SEQUENCE OWNED BY; Schema: tenant_test; Owner: postgres
--

ALTER SEQUENCE tenant_test.convention_id_seq OWNED BY tenant_test.convention.id;


--
-- TOC entry 376 (class 1259 OID 99935)
-- Name: convocation; Type: TABLE; Schema: tenant_test; Owner: postgres
--

CREATE TABLE tenant_test.convocation (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    etudiant_id uuid,
    session_examen_id uuid,
    soutenance_id uuid,
    type character varying(50) NOT NULL,
    libelle character varying(200) NOT NULL,
    message text,
    date_convocation date NOT NULL,
    heure_convocation time without time zone,
    lieu character varying(200),
    salle_id uuid,
    statut character varying(20) DEFAULT 'brouillon'::character varying,
    date_envoi timestamp with time zone,
    date_lecture timestamp with time zone,
    date_confirmation timestamp with time zone,
    genere_par uuid NOT NULL,
    fichier_url character varying(500),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT convocation_statut_check CHECK (((statut)::text = ANY ((ARRAY['brouillon'::character varying, 'envoyee'::character varying, 'lue'::character varying, 'confirme'::character varying, 'annule'::character varying])::text[]))),
    CONSTRAINT convocation_type_check CHECK (((type)::text = ANY ((ARRAY['examen'::character varying, 'rattrapage'::character varying, 'soutenance'::character varying, 'reunion'::character varying, 'conseil_discipline'::character varying, 'autre'::character varying])::text[])))
);


ALTER TABLE tenant_test.convocation OWNER TO postgres;

--
-- TOC entry 371 (class 1259 OID 99798)
-- Name: declaration_sociale; Type: TABLE; Schema: tenant_test; Owner: postgres
--

CREATE TABLE tenant_test.declaration_sociale (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    type_declaration character varying(50) NOT NULL,
    periode_debut date NOT NULL,
    periode_fin date NOT NULL,
    organisme character varying(200) NOT NULL,
    montant_total_cotisations numeric(12,2) DEFAULT 0 NOT NULL,
    nb_salaries smallint DEFAULT 0 NOT NULL,
    statut character varying(20) DEFAULT 'preparation'::character varying,
    date_transmission timestamp with time zone,
    date_paiement timestamp with time zone,
    fichier_export_url character varying(500),
    observations text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT declaration_sociale_statut_check CHECK (((statut)::text = ANY ((ARRAY['preparation'::character varying, 'validee'::character varying, 'transmise'::character varying, 'payee'::character varying])::text[]))),
    CONSTRAINT declaration_sociale_type_declaration_check CHECK (((type_declaration)::text = ANY ((ARRAY['URSSAF'::character varying, 'MSA'::character varying, 'retraite'::character varying, 'prevoyance'::character varying, 'mutuelle'::character varying, 'autre'::character varying])::text[])))
);


ALTER TABLE tenant_test.declaration_sociale OWNER TO postgres;

--
-- TOC entry 336 (class 1259 OID 98573)
-- Name: delegation_signature; Type: TABLE; Schema: tenant_test; Owner: postgres
--

CREATE TABLE tenant_test.delegation_signature (
    id integer NOT NULL,
    delegataire_id integer NOT NULL,
    types_actes text[] NOT NULL,
    date_debut date NOT NULL,
    date_fin date NOT NULL,
    conditions text,
    revoquee boolean DEFAULT false,
    revoquee_le timestamp with time zone,
    revoquee_par integer,
    cree_par integer NOT NULL,
    cree_le timestamp with time zone DEFAULT now(),
    CONSTRAINT check_dates CHECK ((date_fin > date_debut))
);


ALTER TABLE tenant_test.delegation_signature OWNER TO postgres;

--
-- TOC entry 335 (class 1259 OID 98572)
-- Name: delegation_signature_id_seq; Type: SEQUENCE; Schema: tenant_test; Owner: postgres
--

CREATE SEQUENCE tenant_test.delegation_signature_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE tenant_test.delegation_signature_id_seq OWNER TO postgres;

--
-- TOC entry 7013 (class 0 OID 0)
-- Dependencies: 335
-- Name: delegation_signature_id_seq; Type: SEQUENCE OWNED BY; Schema: tenant_test; Owner: postgres
--

ALTER SEQUENCE tenant_test.delegation_signature_id_seq OWNED BY tenant_test.delegation_signature.id;


--
-- TOC entry 357 (class 1259 OID 99321)
-- Name: deliberation; Type: TABLE; Schema: tenant_test; Owner: postgres
--

CREATE TABLE tenant_test.deliberation (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    session_examen_id uuid NOT NULL,
    parcours_id uuid NOT NULL,
    semestre smallint NOT NULL,
    annee_niveau smallint NOT NULL,
    date_deliberation date NOT NULL,
    president_jury_id uuid NOT NULL,
    membres_jury uuid[] DEFAULT '{}'::uuid[],
    statut character varying(20) DEFAULT 'planifiee'::character varying NOT NULL,
    observations_generales text,
    rapport_deliberation text,
    validee_par uuid,
    date_validation timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT deliberation_statut_check CHECK (((statut)::text = ANY ((ARRAY['planifiee'::character varying, 'en_cours'::character varying, 'terminee'::character varying, 'annulee'::character varying])::text[])))
);


ALTER TABLE tenant_test.deliberation OWNER TO postgres;

--
-- TOC entry 7014 (class 0 OID 0)
-- Dependencies: 357
-- Name: TABLE deliberation; Type: COMMENT; Schema: tenant_test; Owner: postgres
--

COMMENT ON TABLE tenant_test.deliberation IS 'Gestion des délibérations de jury pour validation des résultats';


--
-- TOC entry 375 (class 1259 OID 99906)
-- Name: demande_etudiant; Type: TABLE; Schema: tenant_test; Owner: postgres
--

CREATE TABLE tenant_test.demande_etudiant (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    etudiant_id uuid NOT NULL,
    type_demande character varying(50) NOT NULL,
    description text NOT NULL,
    justification text,
    piece_jointe_url character varying(500),
    date_soumission date DEFAULT CURRENT_DATE NOT NULL,
    statut character varying(20) DEFAULT 'soumise'::character varying,
    reponse text,
    traite_par uuid,
    date_traitement timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT demande_etudiant_statut_check CHECK (((statut)::text = ANY ((ARRAY['soumise'::character varying, 'en_traitement'::character varying, 'acceptee'::character varying, 'refusee'::character varying, 'completee'::character varying])::text[]))),
    CONSTRAINT demande_etudiant_type_demande_check CHECK (((type_demande)::text = ANY ((ARRAY['certificat_scolarite'::character varying, 'attestation'::character varying, 'report_examen'::character varying, 'dispense'::character varying, 'changement_parcours'::character varying, 'autre'::character varying])::text[])))
);


ALTER TABLE tenant_test.demande_etudiant OWNER TO postgres;

--
-- TOC entry 378 (class 1259 OID 100007)
-- Name: demande_ressource; Type: TABLE; Schema: tenant_test; Owner: postgres
--

CREATE TABLE tenant_test.demande_ressource (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    type_ressource character varying(50) NOT NULL,
    date_souhaitee date NOT NULL,
    heure_debut time without time zone,
    heure_fin time without time zone,
    motif text NOT NULL,
    nb_participants smallint,
    materiel_requis text,
    demandeur_id uuid NOT NULL,
    statut character varying(30) DEFAULT 'soumise'::character varying,
    traite_par uuid,
    date_traitement timestamp with time zone,
    commentaire_rejet text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT demande_ressource_statut_check CHECK (((statut)::text = ANY ((ARRAY['soumise'::character varying, 'en_cours'::character varying, 'approuvee'::character varying, 'rejetee'::character varying, 'livree'::character varying])::text[]))),
    CONSTRAINT demande_ressource_type_ressource_check CHECK (((type_ressource)::text = ANY ((ARRAY['salle'::character varying, 'materiel'::character varying, 'laboratoire'::character varying, 'equipement'::character varying, 'autre'::character varying])::text[])))
);


ALTER TABLE tenant_test.demande_ressource OWNER TO postgres;

--
-- TOC entry 324 (class 1259 OID 98277)
-- Name: departement; Type: TABLE; Schema: tenant_test; Owner: postgres
--

CREATE TABLE tenant_test.departement (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code character varying(20) NOT NULL,
    nom character varying(200) NOT NULL,
    description text,
    responsable_id uuid,
    actif boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE tenant_test.departement OWNER TO postgres;

--
-- TOC entry 366 (class 1259 OID 99643)
-- Name: depense; Type: TABLE; Schema: tenant_test; Owner: postgres
--

CREATE TABLE tenant_test.depense (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    budget_id uuid,
    annee_academique_id uuid NOT NULL,
    libelle character varying(300) NOT NULL,
    montant numeric(12,2) NOT NULL,
    categorie character varying(100),
    date_depense date DEFAULT CURRENT_DATE NOT NULL,
    fournisseur character varying(200),
    numero_facture character varying(100),
    facture_url character varying(500),
    statut character varying(20) DEFAULT 'en_attente'::character varying,
    demande_par uuid,
    approuve_par uuid,
    date_approbation timestamp with time zone,
    observations text,
    valide_par_president uuid,
    valide_le timestamp with time zone,
    motif_decision text,
    conditions_speciales text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT depense_montant_check CHECK ((montant > (0)::numeric)),
    CONSTRAINT depense_statut_check CHECK (((statut)::text = ANY ((ARRAY['en_attente'::character varying, 'approuve'::character varying, 'paye'::character varying, 'rejete'::character varying])::text[])))
);


ALTER TABLE tenant_test.depense OWNER TO postgres;

--
-- TOC entry 400 (class 1259 OID 100589)
-- Name: diplome; Type: TABLE; Schema: tenant_test; Owner: postgres
--

CREATE TABLE tenant_test.diplome (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    etudiant_id uuid NOT NULL,
    parcours_id uuid NOT NULL,
    annee_academique_id uuid NOT NULL,
    numero_diplome character varying(50) NOT NULL,
    type_diplome character varying(50) NOT NULL,
    mention character varying(20),
    date_obtention date NOT NULL,
    moyenne_generale numeric(5,2),
    credits_obtenus smallint,
    fichier_url character varying(500),
    hash_document character varying(128) NOT NULL,
    signe_par uuid NOT NULL,
    signature_url character varying(500),
    date_signature timestamp with time zone,
    signe_president boolean DEFAULT false,
    mention_speciale text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT diplome_type_diplome_check CHECK (((type_diplome)::text = ANY ((ARRAY['Licence'::character varying, 'Master'::character varying, 'Doctorat'::character varying, 'BTS'::character varying, 'DUT'::character varying, 'Certificat'::character varying])::text[])))
);


ALTER TABLE tenant_test.diplome OWNER TO postgres;

--
-- TOC entry 7015 (class 0 OID 0)
-- Dependencies: 400
-- Name: TABLE diplome; Type: COMMENT; Schema: tenant_test; Owner: postgres
--

COMMENT ON TABLE tenant_test.diplome IS 'Gestion des diplômes délivrés par l établissement';


--
-- TOC entry 377 (class 1259 OID 99973)
-- Name: dossier_etudiant; Type: TABLE; Schema: tenant_test; Owner: postgres
--

CREATE TABLE tenant_test.dossier_etudiant (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    etudiant_id uuid NOT NULL,
    type_document character varying(50) NOT NULL,
    libelle character varying(200) NOT NULL,
    fichier_url character varying(500) NOT NULL,
    reference character varying(100),
    date_demande date,
    date_delivrance date,
    statut character varying(20) DEFAULT 'en_attente'::character varying,
    motif_refus text,
    demande_par uuid,
    traite_par uuid,
    est_archive boolean DEFAULT false,
    date_archivage date,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT dossier_etudiant_statut_check CHECK (((statut)::text = ANY ((ARRAY['en_attente'::character varying, 'en_preparation'::character varying, 'delivre'::character varying, 'refuse'::character varying, 'archive'::character varying])::text[]))),
    CONSTRAINT dossier_etudiant_type_document_check CHECK (((type_document)::text = ANY ((ARRAY['certificat_scolarite'::character varying, 'attestation_inscription'::character varying, 'releve_notes'::character varying, 'copie_diplome'::character varying, 'carte_etudiant'::character varying, 'certificat_medical'::character varying, 'piece_identite'::character varying, 'photo'::character varying, 'autre'::character varying])::text[])))
);


ALTER TABLE tenant_test.dossier_etudiant OWNER TO postgres;

--
-- TOC entry 341 (class 1259 OID 98711)
-- Name: echeancier; Type: TABLE; Schema: tenant_test; Owner: postgres
--

CREATE TABLE tenant_test.echeancier (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    inscription_id uuid NOT NULL,
    num_tranche smallint NOT NULL,
    montant_du numeric(12,2) NOT NULL,
    date_echeance date NOT NULL,
    statut character varying(20) DEFAULT 'en_attente'::character varying,
    CONSTRAINT echeancier_statut_check CHECK (((statut)::text = ANY ((ARRAY['en_attente'::character varying, 'paye'::character varying, 'en_retard'::character varying, 'annule'::character varying])::text[])))
);


ALTER TABLE tenant_test.echeancier OWNER TO postgres;

--
-- TOC entry 338 (class 1259 OID 98627)
-- Name: element_constitutif; Type: TABLE; Schema: tenant_test; Owner: postgres
--

CREATE TABLE tenant_test.element_constitutif (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    ue_id uuid NOT NULL,
    code character varying(30) NOT NULL,
    intitule character varying(200) NOT NULL,
    coefficient numeric(4,2) DEFAULT 1.0 NOT NULL,
    actif boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE tenant_test.element_constitutif OWNER TO postgres;

--
-- TOC entry 347 (class 1259 OID 98906)
-- Name: emploi_du_temps; Type: TABLE; Schema: tenant_test; Owner: postgres
--

CREATE TABLE tenant_test.emploi_du_temps (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    annee_academique_id uuid NOT NULL,
    affectation_id uuid NOT NULL,
    salle_id uuid,
    date_seance date NOT NULL,
    heure_debut time without time zone NOT NULL,
    heure_fin time without time zone NOT NULL,
    type_seance character varying(10) DEFAULT 'CM'::character varying NOT NULL,
    statut character varying(20) DEFAULT 'planifie'::character varying,
    motif_annulation text,
    created_by_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT emploi_du_temps_check CHECK ((heure_fin > heure_debut)),
    CONSTRAINT emploi_du_temps_statut_check CHECK (((statut)::text = ANY ((ARRAY['planifie'::character varying, 'realise'::character varying, 'annule'::character varying, 'reporte'::character varying])::text[]))),
    CONSTRAINT emploi_du_temps_type_seance_check CHECK (((type_seance)::text = ANY ((ARRAY['CM'::character varying, 'TD'::character varying, 'TP'::character varying])::text[])))
);


ALTER TABLE tenant_test.emploi_du_temps OWNER TO postgres;

--
-- TOC entry 327 (class 1259 OID 98358)
-- Name: enseignant; Type: TABLE; Schema: tenant_test; Owner: postgres
--

CREATE TABLE tenant_test.enseignant (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    utilisateur_id uuid,
    matricule character varying(30) NOT NULL,
    nom character varying(100) NOT NULL,
    prenom character varying(100) NOT NULL,
    titre character varying(50),
    grade character varying(50),
    specialite character varying(200),
    type_contrat character varying(20) DEFAULT 'permanent'::character varying NOT NULL,
    departement_id uuid,
    email character varying(254),
    telephone character varying(30),
    actif boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT enseignant_type_contrat_check CHECK (((type_contrat)::text = ANY ((ARRAY['permanent'::character varying, 'vacataire'::character varying, 'hdr'::character varying, 'invite'::character varying])::text[])))
);


ALTER TABLE tenant_test.enseignant OWNER TO postgres;

--
-- TOC entry 328 (class 1259 OID 98390)
-- Name: etudiant; Type: TABLE; Schema: tenant_test; Owner: postgres
--

CREATE TABLE tenant_test.etudiant (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    utilisateur_id uuid,
    matricule character varying(30) NOT NULL,
    nom character varying(100) NOT NULL,
    prenom character varying(100) NOT NULL,
    date_naissance date NOT NULL,
    lieu_naissance character varying(100),
    sexe character(1),
    nationalite character varying(100) DEFAULT 'Malagasy'::character varying,
    adresse text,
    telephone character varying(30),
    email character varying(254),
    nom_parent character varying(200),
    telephone_parent character varying(30),
    email_parent character varying(254),
    religion character varying(50),
    situation_familiale character varying(30),
    photo_url character varying(500),
    dossier_medical_url character varying(500),
    actif boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT etudiant_sexe_check CHECK ((sexe = ANY (ARRAY['M'::bpchar, 'F'::bpchar])))
);


ALTER TABLE tenant_test.etudiant OWNER TO postgres;

--
-- TOC entry 370 (class 1259 OID 99768)
-- Name: evaluation_personnel; Type: TABLE; Schema: tenant_test; Owner: postgres
--

CREATE TABLE tenant_test.evaluation_personnel (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    utilisateur_id uuid NOT NULL,
    evaluateur_id uuid NOT NULL,
    annee_evaluation smallint NOT NULL,
    date_evaluation timestamp with time zone DEFAULT now(),
    objectifs jsonb,
    competences jsonb,
    auto_evaluation jsonb,
    date_auto_evaluation timestamp with time zone,
    appreciation text,
    points_forts text,
    axes_amelioration text,
    note_globale numeric(3,1),
    statut character varying(20) DEFAULT 'en_cours'::character varying,
    date_finalisation timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT evaluation_personnel_note_globale_check CHECK (((note_globale >= (0)::numeric) AND (note_globale <= (5)::numeric))),
    CONSTRAINT evaluation_personnel_statut_check CHECK (((statut)::text = ANY ((ARRAY['en_cours'::character varying, 'auto_evalue'::character varying, 'finalise'::character varying, 'archive'::character varying])::text[])))
);


ALTER TABLE tenant_test.evaluation_personnel OWNER TO postgres;

--
-- TOC entry 364 (class 1259 OID 99587)
-- Name: evaluation_soutenance; Type: TABLE; Schema: tenant_test; Owner: postgres
--

CREATE TABLE tenant_test.evaluation_soutenance (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    soutenance_id uuid NOT NULL,
    evaluateur_id uuid NOT NULL,
    note numeric(5,2) NOT NULL,
    appreciation text,
    date_evaluation timestamp with time zone DEFAULT now(),
    CONSTRAINT evaluation_soutenance_note_check CHECK (((note >= (0)::numeric) AND (note <= (20)::numeric)))
);


ALTER TABLE tenant_test.evaluation_soutenance OWNER TO postgres;

--
-- TOC entry 368 (class 1259 OID 99709)
-- Name: fiche_paie; Type: TABLE; Schema: tenant_test; Owner: postgres
--

CREATE TABLE tenant_test.fiche_paie (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    contrat_id uuid NOT NULL,
    annee smallint NOT NULL,
    mois smallint NOT NULL,
    salaire_brut numeric(12,2) NOT NULL,
    cotisations numeric(12,2) DEFAULT 0,
    primes numeric(12,2) DEFAULT 0,
    retenues numeric(12,2) DEFAULT 0,
    net_a_payer numeric(12,2) NOT NULL,
    heures_supp numeric(6,2) DEFAULT 0,
    montant_heures_supp numeric(12,2) DEFAULT 0,
    statut character varying(20) DEFAULT 'brouillon'::character varying,
    fichier_url character varying(500),
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT fiche_paie_mois_check CHECK (((mois >= 1) AND (mois <= 12))),
    CONSTRAINT fiche_paie_statut_check CHECK (((statut)::text = ANY ((ARRAY['brouillon'::character varying, 'valide'::character varying, 'paye'::character varying])::text[])))
);


ALTER TABLE tenant_test.fiche_paie OWNER TO postgres;

--
-- TOC entry 362 (class 1259 OID 99527)
-- Name: fiche_suivi_stage; Type: TABLE; Schema: tenant_test; Owner: postgres
--

CREATE TABLE tenant_test.fiche_suivi_stage (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    stage_id uuid NOT NULL,
    date_rencontre date NOT NULL,
    travail_effectue text NOT NULL,
    observations text,
    note_avancement numeric(5,2),
    auteur_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT fiche_suivi_stage_note_avancement_check CHECK (((note_avancement >= (0)::numeric) AND (note_avancement <= (20)::numeric)))
);


ALTER TABLE tenant_test.fiche_suivi_stage OWNER TO postgres;

--
-- TOC entry 344 (class 1259 OID 98809)
-- Name: frais_inscription; Type: TABLE; Schema: tenant_test; Owner: postgres
--

CREATE TABLE tenant_test.frais_inscription (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    parcours_id uuid NOT NULL,
    annee_academique_id uuid NOT NULL,
    montant_inscription numeric(10,2) DEFAULT 0 NOT NULL,
    montant_scolarite numeric(10,2) DEFAULT 0,
    montant_total numeric(10,2) NOT NULL,
    description text,
    actif boolean DEFAULT true,
    date_limite_paiement date,
    modalites_paiement jsonb DEFAULT '{"cheque": true, "especes": true, "virement": true, "echelonnement": false, "carte_bancaire": true}'::jsonb,
    cree_par uuid,
    modifie_par uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE tenant_test.frais_inscription OWNER TO postgres;

--
-- TOC entry 7016 (class 0 OID 0)
-- Dependencies: 344
-- Name: TABLE frais_inscription; Type: COMMENT; Schema: tenant_test; Owner: postgres
--

COMMENT ON TABLE tenant_test.frais_inscription IS 'Configuration des frais d''inscription et de scolarité par parcours et année académique';


--
-- TOC entry 329 (class 1259 OID 98417)
-- Name: grille_tarifaire; Type: TABLE; Schema: tenant_test; Owner: postgres
--

CREATE TABLE tenant_test.grille_tarifaire (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    parcours_id uuid NOT NULL,
    annee_academique_id uuid NOT NULL,
    annee_niveau smallint,
    montant_total numeric(12,2) NOT NULL,
    montant_inscription numeric(12,2) DEFAULT 0,
    montant_scolarite numeric(12,2) DEFAULT 0,
    nb_tranches smallint DEFAULT 1,
    date_limite_paiement date,
    modalites_paiement jsonb,
    description text,
    actif boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE tenant_test.grille_tarifaire OWNER TO postgres;

--
-- TOC entry 369 (class 1259 OID 99739)
-- Name: heure_complementaire; Type: TABLE; Schema: tenant_test; Owner: postgres
--

CREATE TABLE tenant_test.heure_complementaire (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    enseignant_id uuid NOT NULL,
    date_travail date NOT NULL,
    nb_heures numeric(5,2) NOT NULL,
    taux_horaire numeric(10,2) NOT NULL,
    motif text,
    statut character varying(20) DEFAULT 'saisie'::character varying,
    valide_par uuid,
    date_validation timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT heure_complementaire_nb_heures_check CHECK ((nb_heures > (0)::numeric)),
    CONSTRAINT heure_complementaire_statut_check CHECK (((statut)::text = ANY ((ARRAY['saisie'::character varying, 'valide'::character varying, 'refuse'::character varying, 'paye'::character varying])::text[]))),
    CONSTRAINT heure_complementaire_taux_horaire_check CHECK ((taux_horaire > (0)::numeric))
);


ALTER TABLE tenant_test.heure_complementaire OWNER TO postgres;

--
-- TOC entry 373 (class 1259 OID 99846)
-- Name: incident_disciplinaire; Type: TABLE; Schema: tenant_test; Owner: postgres
--

CREATE TABLE tenant_test.incident_disciplinaire (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    etudiant_id uuid NOT NULL,
    date_incident date DEFAULT CURRENT_DATE NOT NULL,
    type_incident character varying(50) NOT NULL,
    description text NOT NULL,
    sanction character varying(100),
    duree_sanction integer,
    statut character varying(20) DEFAULT 'ouvert'::character varying,
    rapporte_par uuid NOT NULL,
    arbitre_par uuid,
    date_cloture date,
    observations text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT incident_disciplinaire_statut_check CHECK (((statut)::text = ANY ((ARRAY['ouvert'::character varying, 'en_cours'::character varying, 'clos'::character varying, 'arbitrage'::character varying])::text[]))),
    CONSTRAINT incident_disciplinaire_type_incident_check CHECK (((type_incident)::text = ANY ((ARRAY['retard'::character varying, 'absenteisme'::character varying, 'incivilite'::character varying, 'triche'::character varying, 'violence'::character varying, 'autre'::character varying])::text[])))
);


ALTER TABLE tenant_test.incident_disciplinaire OWNER TO postgres;

--
-- TOC entry 330 (class 1259 OID 98446)
-- Name: inscription; Type: TABLE; Schema: tenant_test; Owner: postgres
--

CREATE TABLE tenant_test.inscription (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    etudiant_id uuid NOT NULL,
    parcours_id uuid NOT NULL,
    annee_academique_id uuid NOT NULL,
    annee_niveau smallint NOT NULL,
    type_inscription character varying(20) DEFAULT 'premiere'::character varying NOT NULL,
    statut character varying(20) DEFAULT 'en_attente'::character varying NOT NULL,
    numero_carte character varying(30),
    date_inscription date DEFAULT CURRENT_DATE,
    bourse boolean DEFAULT false,
    type_bourse character varying(100),
    montant_bourse numeric(10,2),
    observations text,
    validee_par uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT inscription_statut_check CHECK (((statut)::text = ANY ((ARRAY['en_attente'::character varying, 'validee'::character varying, 'annulee'::character varying, 'abandonnee'::character varying])::text[]))),
    CONSTRAINT inscription_type_inscription_check CHECK (((type_inscription)::text = ANY ((ARRAY['premiere'::character varying, 'reinscription'::character varying, 'transfert'::character varying, 'equivalence'::character varying])::text[])))
);


ALTER TABLE tenant_test.inscription OWNER TO postgres;

--
-- TOC entry 381 (class 1259 OID 100085)
-- Name: message; Type: TABLE; Schema: tenant_test; Owner: postgres
--

CREATE TABLE tenant_test.message (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    expediteur_id uuid NOT NULL,
    destinataire_id uuid NOT NULL,
    sujet character varying(300),
    contenu text NOT NULL,
    lu boolean DEFAULT false,
    lu_at timestamp with time zone,
    parent_id uuid,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE tenant_test.message OWNER TO postgres;

--
-- TOC entry 383 (class 1259 OID 100154)
-- Name: message_destinataire; Type: TABLE; Schema: tenant_test; Owner: postgres
--

CREATE TABLE tenant_test.message_destinataire (
    id uuid DEFAULT gen_random_uuid() CONSTRAINT message_destinataire_id_not_null1 NOT NULL,
    message_id uuid NOT NULL,
    etudiant_id uuid NOT NULL,
    lu boolean DEFAULT false,
    date_lecture timestamp with time zone
);


ALTER TABLE tenant_test.message_destinataire OWNER TO postgres;

--
-- TOC entry 7017 (class 0 OID 0)
-- Dependencies: 383
-- Name: TABLE message_destinataire; Type: COMMENT; Schema: tenant_test; Owner: postgres
--

COMMENT ON TABLE tenant_test.message_destinataire IS 'Destinataires individuels des messages avec statut de lecture';


--
-- TOC entry 382 (class 1259 OID 100114)
-- Name: message_enseignant; Type: TABLE; Schema: tenant_test; Owner: postgres
--

CREATE TABLE tenant_test.message_enseignant (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    enseignant_id uuid NOT NULL,
    sujet character varying(255) NOT NULL,
    contenu text NOT NULL,
    type_message character varying(50) NOT NULL,
    etudiant_id uuid,
    classe_id uuid,
    parcours_id uuid,
    niveau_id uuid,
    nombre_destinataires integer DEFAULT 0,
    date_envoi timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    statut character varying(50) DEFAULT 'envoye'::character varying,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT message_enseignant_statut_check CHECK (((statut)::text = ANY ((ARRAY['envoye'::character varying, 'lu'::character varying, 'archive'::character varying])::text[]))),
    CONSTRAINT message_enseignant_type_message_check CHECK (((type_message)::text = ANY ((ARRAY['direct'::character varying, 'classe'::character varying, 'parcours'::character varying])::text[])))
);


ALTER TABLE tenant_test.message_enseignant OWNER TO postgres;

--
-- TOC entry 7018 (class 0 OID 0)
-- Dependencies: 382
-- Name: TABLE message_enseignant; Type: COMMENT; Schema: tenant_test; Owner: postgres
--

COMMENT ON TABLE tenant_test.message_enseignant IS 'Messages envoyés par les enseignants aux étudiants';


--
-- TOC entry 7019 (class 0 OID 0)
-- Dependencies: 382
-- Name: COLUMN message_enseignant.type_message; Type: COMMENT; Schema: tenant_test; Owner: postgres
--

COMMENT ON COLUMN tenant_test.message_enseignant.type_message IS 'Type: direct (1 étudiant), classe (tous étudiants classe), parcours (filtré par parcours/niveau)';


--
-- TOC entry 387 (class 1259 OID 100275)
-- Name: mouvement_stock; Type: TABLE; Schema: tenant_test; Owner: postgres
--

CREATE TABLE tenant_test.mouvement_stock (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    stock_id uuid NOT NULL,
    type_mouvement character varying(20) NOT NULL,
    quantite numeric(10,2) NOT NULL,
    motif character varying(200),
    reference_doc character varying(100),
    utilisateur_id uuid,
    date_mouvement timestamp with time zone DEFAULT now(),
    CONSTRAINT mouvement_stock_type_mouvement_check CHECK (((type_mouvement)::text = ANY ((ARRAY['entree'::character varying, 'sortie'::character varying, 'ajustement'::character varying])::text[])))
);


ALTER TABLE tenant_test.mouvement_stock OWNER TO postgres;

--
-- TOC entry 321 (class 1259 OID 98228)
-- Name: niveau_etude; Type: TABLE; Schema: tenant_test; Owner: postgres
--

CREATE TABLE tenant_test.niveau_etude (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code character varying(20) NOT NULL,
    libelle character varying(255) NOT NULL,
    description text,
    ordre integer NOT NULL,
    type_diplome character varying(50),
    actif boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT niveau_etude_type_diplome_check CHECK (((type_diplome)::text = ANY ((ARRAY['Licence'::character varying, 'Master'::character varying, 'Doctorat'::character varying, 'BTS'::character varying, 'DUT'::character varying, 'Autre'::character varying])::text[])))
);


ALTER TABLE tenant_test.niveau_etude OWNER TO postgres;

--
-- TOC entry 348 (class 1259 OID 98948)
-- Name: note; Type: TABLE; Schema: tenant_test; Owner: postgres
--

CREATE TABLE tenant_test.note (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    etudiant_id uuid NOT NULL,
    ec_id uuid,
    ue_id uuid,
    session_id uuid NOT NULL,
    valeur numeric(5,2) NOT NULL,
    type_evaluation character varying(30) DEFAULT 'examen_final'::character varying,
    absence_justifiee boolean DEFAULT false,
    mention character varying(20) GENERATED ALWAYS AS (
CASE
    WHEN (valeur >= (16)::numeric) THEN 'Très Bien'::text
    WHEN (valeur >= (14)::numeric) THEN 'Bien'::text
    WHEN (valeur >= (12)::numeric) THEN 'Assez Bien'::text
    WHEN (valeur >= (10)::numeric) THEN 'Passable'::text
    ELSE 'Insuffisant'::text
END) STORED,
    verrouille boolean DEFAULT false,
    hash_integrite character varying(128),
    saisi_par uuid NOT NULL,
    valide_par uuid,
    date_saisie timestamp with time zone DEFAULT now(),
    date_verrouillage timestamp with time zone,
    observations text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT note_check CHECK (((ec_id IS NOT NULL) OR (ue_id IS NOT NULL))),
    CONSTRAINT note_type_evaluation_check CHECK (((type_evaluation)::text = ANY ((ARRAY['examen_final'::character varying, 'controle_continu'::character varying, 'tp'::character varying, 'soutenance'::character varying, 'stage'::character varying])::text[]))),
    CONSTRAINT note_valeur_check CHECK (((valeur >= (0)::numeric) AND (valeur <= (20)::numeric)))
);


ALTER TABLE tenant_test.note OWNER TO postgres;

--
-- TOC entry 350 (class 1259 OID 99044)
-- Name: note_derogatoire; Type: TABLE; Schema: tenant_test; Owner: postgres
--

CREATE TABLE tenant_test.note_derogatoire (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    etudiant_id uuid NOT NULL,
    ec_id uuid,
    ue_id uuid,
    session_examen_id uuid,
    valeur numeric(5,2) NOT NULL,
    motif_derogation text NOT NULL,
    type_derogation character varying(50) DEFAULT 'cas_particulier'::character varying,
    est_derogatoire boolean DEFAULT true,
    soumis_a_scolarite boolean DEFAULT false,
    valide_par_scolarite uuid,
    date_validation_scolarite timestamp with time zone,
    statut character varying(20) DEFAULT 'proposee'::character varying,
    saisie_par uuid NOT NULL,
    valide_par uuid,
    date_saisie timestamp with time zone DEFAULT now(),
    observations text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT note_derogatoire_statut_check CHECK (((statut)::text = ANY ((ARRAY['proposee'::character varying, 'soumise'::character varying, 'validee'::character varying, 'refusee'::character varying])::text[]))),
    CONSTRAINT note_derogatoire_type_derogation_check CHECK (((type_derogation)::text = ANY ((ARRAY['cas_particulier'::character varying, 'erreur_saisie'::character varying, 'rattrapage_administratif'::character varying, 'autre'::character varying])::text[]))),
    CONSTRAINT note_derogatoire_valeur_check CHECK (((valeur >= (0)::numeric) AND (valeur <= (20)::numeric)))
);


ALTER TABLE tenant_test.note_derogatoire OWNER TO postgres;

--
-- TOC entry 380 (class 1259 OID 100064)
-- Name: notification; Type: TABLE; Schema: tenant_test; Owner: postgres
--

CREATE TABLE tenant_test.notification (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    utilisateur_id uuid NOT NULL,
    titre character varying(200) NOT NULL,
    message text NOT NULL,
    type_notification character varying(30) DEFAULT 'info'::character varying,
    lue boolean DEFAULT false,
    lue_at timestamp with time zone,
    lien character varying(500),
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT notification_type_notification_check CHECK (((type_notification)::text = ANY ((ARRAY['info'::character varying, 'alerte'::character varying, 'paiement'::character varying, 'note'::character varying, 'absence'::character varying, 'discipline'::character varying])::text[])))
);


ALTER TABLE tenant_test.notification OWNER TO postgres;

--
-- TOC entry 342 (class 1259 OID 98731)
-- Name: paiement; Type: TABLE; Schema: tenant_test; Owner: postgres
--

CREATE TABLE tenant_test.paiement (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    inscription_id uuid NOT NULL,
    echeancier_id uuid,
    montant numeric(12,2) NOT NULL,
    mode_paiement character varying(20) NOT NULL,
    date_paiement timestamp with time zone DEFAULT now(),
    reference character varying(100),
    numero_recu character varying(50) NOT NULL,
    recu_url character varying(500),
    caissier_id uuid NOT NULL,
    statut character varying(20) DEFAULT 'valide'::character varying,
    motif_annulation text,
    observations text,
    type_paiement character varying(50),
    cloture_caisse_id uuid,
    details_paiement jsonb,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT paiement_mode_paiement_check CHECK (((mode_paiement)::text = ANY ((ARRAY['especes'::character varying, 'cheque'::character varying, 'virement'::character varying, 'carte_bancaire'::character varying, 'mobile_money'::character varying])::text[]))),
    CONSTRAINT paiement_montant_check CHECK ((montant > (0)::numeric)),
    CONSTRAINT paiement_statut_check CHECK (((statut)::text = ANY ((ARRAY['valide'::character varying, 'annule'::character varying, 'rembourse'::character varying, 'en_attente'::character varying])::text[])))
);


ALTER TABLE tenant_test.paiement OWNER TO postgres;

--
-- TOC entry 343 (class 1259 OID 98770)
-- Name: paiement_inscription; Type: TABLE; Schema: tenant_test; Owner: postgres
--

CREATE TABLE tenant_test.paiement_inscription (
    id uuid DEFAULT gen_random_uuid() CONSTRAINT paiement_inscription_id_not_null1 NOT NULL,
    inscription_id uuid NOT NULL,
    etudiant_id uuid NOT NULL,
    montant numeric(10,2) NOT NULL,
    methode_paiement character varying(50) NOT NULL,
    reference_paiement character varying(255) NOT NULL,
    date_paiement timestamp with time zone NOT NULL,
    preuve_url text,
    statut character varying(50) DEFAULT 'en_attente'::character varying,
    valide_par uuid,
    date_validation timestamp with time zone,
    note_validation text,
    motif_rejet text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT check_validation CHECK (((((statut)::text = 'valide'::text) AND (valide_par IS NOT NULL) AND (date_validation IS NOT NULL)) OR (((statut)::text = 'rejete'::text) AND (valide_par IS NOT NULL) AND (date_validation IS NOT NULL) AND (motif_rejet IS NOT NULL)) OR (((statut)::text = 'en_attente'::text) AND (valide_par IS NULL) AND (date_validation IS NULL)))),
    CONSTRAINT paiement_inscription_methode_paiement_check CHECK (((methode_paiement)::text = ANY ((ARRAY['virement'::character varying, 'mobile_money'::character varying, 'especes'::character varying, 'cheque'::character varying, 'carte_bancaire'::character varying])::text[]))),
    CONSTRAINT paiement_inscription_montant_check CHECK ((montant > (0)::numeric)),
    CONSTRAINT paiement_inscription_statut_check CHECK (((statut)::text = ANY ((ARRAY['en_attente'::character varying, 'valide'::character varying, 'rejete'::character varying])::text[])))
);


ALTER TABLE tenant_test.paiement_inscription OWNER TO postgres;

--
-- TOC entry 7020 (class 0 OID 0)
-- Dependencies: 343
-- Name: TABLE paiement_inscription; Type: COMMENT; Schema: tenant_test; Owner: postgres
--

COMMENT ON TABLE tenant_test.paiement_inscription IS 'Suivi des paiements d''inscription par étudiant';


--
-- TOC entry 7021 (class 0 OID 0)
-- Dependencies: 343
-- Name: COLUMN paiement_inscription.methode_paiement; Type: COMMENT; Schema: tenant_test; Owner: postgres
--

COMMENT ON COLUMN tenant_test.paiement_inscription.methode_paiement IS 'virement, mobile_money, especes, cheque, carte_bancaire';


--
-- TOC entry 7022 (class 0 OID 0)
-- Dependencies: 343
-- Name: COLUMN paiement_inscription.reference_paiement; Type: COMMENT; Schema: tenant_test; Owner: postgres
--

COMMENT ON COLUMN tenant_test.paiement_inscription.reference_paiement IS 'Numéro de transaction ou référence du paiement';


--
-- TOC entry 7023 (class 0 OID 0)
-- Dependencies: 343
-- Name: COLUMN paiement_inscription.preuve_url; Type: COMMENT; Schema: tenant_test; Owner: postgres
--

COMMENT ON COLUMN tenant_test.paiement_inscription.preuve_url IS 'URL de la capture d''écran ou preuve de paiement';


--
-- TOC entry 326 (class 1259 OID 98322)
-- Name: parcours; Type: TABLE; Schema: tenant_test; Owner: postgres
--

CREATE TABLE tenant_test.parcours (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    departement_id uuid NOT NULL,
    code character varying(30) NOT NULL,
    nom character varying(200) NOT NULL,
    niveau character varying(20) NOT NULL,
    duree_annees smallint DEFAULT 3 NOT NULL,
    responsable_id uuid,
    secretaire_id uuid,
    description text,
    actif boolean DEFAULT true,
    annee_ouverture integer,
    date_ouverture date,
    motif_ouverture text,
    conditions_ouverture text,
    date_fermeture date,
    motif_fermeture text,
    valide_par_president uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT parcours_niveau_check CHECK (((niveau)::text = ANY ((ARRAY['Licence'::character varying, 'Master'::character varying, 'Doctorat'::character varying, 'BTS'::character varying, 'DUT'::character varying])::text[])))
);


ALTER TABLE tenant_test.parcours OWNER TO postgres;

--
-- TOC entry 323 (class 1259 OID 98259)
-- Name: permissions_portail; Type: TABLE; Schema: tenant_test; Owner: postgres
--

CREATE TABLE tenant_test.permissions_portail (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    type_portail character varying(20) NOT NULL,
    permission_key character varying(100) NOT NULL,
    permission_label character varying(200) NOT NULL,
    actif boolean DEFAULT true,
    description text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT permissions_portail_type_portail_check CHECK (((type_portail)::text = ANY ((ARRAY['etudiant'::character varying, 'parent'::character varying, 'enseignant'::character varying])::text[])))
);


ALTER TABLE tenant_test.permissions_portail OWNER TO postgres;

--
-- TOC entry 388 (class 1259 OID 100297)
-- Name: planning_entretien; Type: TABLE; Schema: tenant_test; Owner: postgres
--

CREATE TABLE tenant_test.planning_entretien (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    salle_id uuid,
    batiment_id uuid,
    zone character varying(200),
    type_nettoyage character varying(50) NOT NULL,
    responsable_id uuid,
    jour_semaine smallint,
    heure_debut time without time zone,
    duree_minutes smallint,
    actif boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT planning_entretien_jour_semaine_check CHECK (((jour_semaine >= 1) AND (jour_semaine <= 7))),
    CONSTRAINT planning_entretien_type_nettoyage_check CHECK (((type_nettoyage)::text = ANY ((ARRAY['quotidien'::character varying, 'hebdomadaire'::character varying, 'mensuel'::character varying, 'apres_evenement'::character varying, 'desinfection'::character varying])::text[])))
);


ALTER TABLE tenant_test.planning_entretien OWNER TO postgres;

--
-- TOC entry 392 (class 1259 OID 100425)
-- Name: pointage_qr; Type: TABLE; Schema: tenant_test; Owner: postgres
--

CREATE TABLE tenant_test.pointage_qr (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    seance_id uuid NOT NULL,
    etudiant_id uuid NOT NULL,
    code_qr character varying(255) NOT NULL,
    date_generation timestamp without time zone DEFAULT now(),
    date_scan timestamp without time zone,
    scanne_par uuid,
    statut character varying(50) DEFAULT 'scanne'::character varying,
    localisation_scan character varying(255),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT pointage_qr_statut_check CHECK (((statut)::text = ANY ((ARRAY['scanne'::character varying, 'manuel'::character varying, 'absent'::character varying])::text[])))
);


ALTER TABLE tenant_test.pointage_qr OWNER TO postgres;

--
-- TOC entry 7024 (class 0 OID 0)
-- Dependencies: 392
-- Name: TABLE pointage_qr; Type: COMMENT; Schema: tenant_test; Owner: postgres
--

COMMENT ON TABLE tenant_test.pointage_qr IS 'QR codes générés pour l''appel numérique';


--
-- TOC entry 349 (class 1259 OID 99003)
-- Name: presence; Type: TABLE; Schema: tenant_test; Owner: postgres
--

CREATE TABLE tenant_test.presence (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    etudiant_id uuid NOT NULL,
    seance_id uuid NOT NULL,
    statut character varying(20) DEFAULT 'absent'::character varying NOT NULL,
    heure_arrivee time without time zone,
    justifie boolean DEFAULT false,
    justificatif_url character varying(500),
    motif text,
    mode_pointage character varying(20) DEFAULT 'manuel'::character varying,
    saisi_par uuid,
    valide_par uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT presence_mode_pointage_check CHECK (((mode_pointage)::text = ANY ((ARRAY['manuel'::character varying, 'qr_code'::character varying, 'badge'::character varying, 'empreinte'::character varying])::text[]))),
    CONSTRAINT presence_statut_check CHECK (((statut)::text = ANY ((ARRAY['present'::character varying, 'absent'::character varying, 'retard'::character varying, 'excuse'::character varying, 'sorti_tot'::character varying])::text[])))
);


ALTER TABLE tenant_test.presence OWNER TO postgres;

--
-- TOC entry 393 (class 1259 OID 100444)
-- Name: presence_surveillance; Type: TABLE; Schema: tenant_test; Owner: postgres
--

CREATE TABLE tenant_test.presence_surveillance (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    etudiant_id uuid NOT NULL,
    seance_id uuid NOT NULL,
    date_pointage date DEFAULT CURRENT_DATE,
    heure_arrivee time without time zone,
    heure_depart time without time zone,
    statut character varying(50) DEFAULT 'present'::character varying,
    justificatif_url text,
    est_justifie boolean DEFAULT false,
    justifie_par uuid,
    date_justification timestamp without time zone,
    mode_pointage character varying(50) DEFAULT 'manuel'::character varying,
    pointe_par uuid NOT NULL,
    observations text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT presence_surveillance_mode_pointage_check CHECK (((mode_pointage)::text = ANY ((ARRAY['qr'::character varying, 'manuel'::character varying, 'badge'::character varying])::text[]))),
    CONSTRAINT presence_surveillance_statut_check CHECK (((statut)::text = ANY ((ARRAY['present'::character varying, 'absent'::character varying, 'retard'::character varying, 'sortie_anticipee'::character varying])::text[])))
);


ALTER TABLE tenant_test.presence_surveillance OWNER TO postgres;

--
-- TOC entry 7025 (class 0 OID 0)
-- Dependencies: 393
-- Name: TABLE presence_surveillance; Type: COMMENT; Schema: tenant_test; Owner: postgres
--

COMMENT ON TABLE tenant_test.presence_surveillance IS 'Enregistrement des présences avec validation surveillant';


--
-- TOC entry 391 (class 1259 OID 100377)
-- Name: proces_verbal; Type: TABLE; Schema: tenant_test; Owner: postgres
--

CREATE TABLE tenant_test.proces_verbal (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    session_examen_id uuid NOT NULL,
    parcours_id uuid NOT NULL,
    annee_academique_id uuid NOT NULL,
    numero character varying(50) NOT NULL,
    date_deliberation date NOT NULL,
    membres_jury jsonb DEFAULT '[]'::jsonb,
    resultats jsonb DEFAULT '[]'::jsonb,
    nb_admis integer DEFAULT 0,
    nb_ajournes integer DEFAULT 0,
    nb_absents integer DEFAULT 0,
    taux_reussite numeric(5,2) DEFAULT 0,
    observations text,
    fichier_url character varying(500),
    statut character varying(20) DEFAULT 'brouillon'::character varying,
    redige_par uuid NOT NULL,
    valide_par uuid,
    date_validation timestamp with time zone,
    transmis_a_scolarite boolean DEFAULT false,
    date_transmission_scolarite timestamp with time zone,
    transmis_par character varying(255),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT proces_verbal_statut_check CHECK (((statut)::text = ANY ((ARRAY['brouillon'::character varying, 'valide'::character varying, 'archive'::character varying])::text[])))
);


ALTER TABLE tenant_test.proces_verbal OWNER TO postgres;

--
-- TOC entry 355 (class 1259 OID 99259)
-- Name: pv_deliberation; Type: TABLE; Schema: tenant_test; Owner: postgres
--

CREATE TABLE tenant_test.pv_deliberation (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    session_id uuid NOT NULL,
    parcours_id uuid NOT NULL,
    annee_niveau smallint NOT NULL,
    date_deliberation date DEFAULT CURRENT_DATE NOT NULL,
    president_jury uuid NOT NULL,
    membres_jury jsonb DEFAULT '[]'::jsonb,
    statut character varying(20) DEFAULT 'brouillon'::character varying,
    fichier_pv_url character varying(500),
    hash_pv character varying(128),
    observations text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT pv_deliberation_statut_check CHECK (((statut)::text = ANY ((ARRAY['brouillon'::character varying, 'signe'::character varying, 'transmis'::character varying, 'archive'::character varying])::text[])))
);


ALTER TABLE tenant_test.pv_deliberation OWNER TO postgres;

--
-- TOC entry 398 (class 1259 OID 100543)
-- Name: rapport_conduite; Type: TABLE; Schema: tenant_test; Owner: postgres
--

CREATE TABLE tenant_test.rapport_conduite (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    etudiant_id uuid NOT NULL,
    periode_debut date NOT NULL,
    periode_fin date NOT NULL,
    note_comportement numeric(3,1) NOT NULL,
    note_assiduite numeric(3,1) NOT NULL,
    note_discipline numeric(3,1) NOT NULL,
    nombre_absences integer DEFAULT 0,
    nombre_retards integer DEFAULT 0,
    nombre_sanctions integer DEFAULT 0,
    appreciation_generale text NOT NULL,
    points_forts text,
    points_amelioration text,
    recommandations text,
    redige_par uuid NOT NULL,
    valide_par uuid,
    statut character varying(50) DEFAULT 'brouillon'::character varying,
    date_transmission timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT rapport_conduite_statut_check CHECK (((statut)::text = ANY ((ARRAY['brouillon'::character varying, 'valide'::character varying, 'transmis_parents'::character varying])::text[])))
);


ALTER TABLE tenant_test.rapport_conduite OWNER TO postgres;

--
-- TOC entry 389 (class 1259 OID 100324)
-- Name: rapport_entretien; Type: TABLE; Schema: tenant_test; Owner: postgres
--

CREATE TABLE tenant_test.rapport_entretien (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    planning_id uuid,
    realise_par uuid NOT NULL,
    date_realisation date DEFAULT CURRENT_DATE NOT NULL,
    heure_debut time without time zone,
    heure_fin time without time zone,
    statut character varying(20) DEFAULT 'realise'::character varying,
    observations text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT rapport_entretien_statut_check CHECK (((statut)::text = ANY ((ARRAY['realise'::character varying, 'partiel'::character varying, 'non_realise'::character varying])::text[])))
);


ALTER TABLE tenant_test.rapport_entretien OWNER TO postgres;

--
-- TOC entry 352 (class 1259 OID 99141)
-- Name: rattrapage; Type: TABLE; Schema: tenant_test; Owner: postgres
--

CREATE TABLE tenant_test.rattrapage (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    absence_id uuid NOT NULL,
    salle_id uuid,
    date_rattrapage date NOT NULL,
    heure_debut time without time zone NOT NULL,
    heure_fin time without time zone NOT NULL,
    observations text,
    statut character varying(20) DEFAULT 'planifie'::character varying,
    remplaceur_id uuid,
    planifie_par uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT rattrapage_statut_check CHECK (((statut)::text = ANY ((ARRAY['planifie'::character varying, 'effectue'::character varying, 'annule'::character varying])::text[])))
);


ALTER TABLE tenant_test.rattrapage OWNER TO postgres;

--
-- TOC entry 332 (class 1259 OID 98520)
-- Name: recrutement; Type: TABLE; Schema: tenant_test; Owner: postgres
--

CREATE TABLE tenant_test.recrutement (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    poste character varying(200) NOT NULL,
    type_contrat character varying(30) NOT NULL,
    departement_id uuid,
    description text,
    competences_requises text,
    nb_postes smallint DEFAULT 1 NOT NULL,
    date_ouverture date DEFAULT CURRENT_DATE,
    date_cloture date,
    salaire_min numeric(12,2),
    salaire_max numeric(12,2),
    statut character varying(20) DEFAULT 'ouvert'::character varying,
    responsable_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT recrutement_nb_postes_check CHECK ((nb_postes > 0)),
    CONSTRAINT recrutement_statut_check CHECK (((statut)::text = ANY ((ARRAY['ouvert'::character varying, 'en_cours'::character varying, 'cloture'::character varying, 'pourvu'::character varying, 'annule'::character varying])::text[]))),
    CONSTRAINT recrutement_type_contrat_check CHECK (((type_contrat)::text = ANY ((ARRAY['CDI'::character varying, 'CDD'::character varying, 'vacataire'::character varying, 'stagiaire'::character varying])::text[])))
);


ALTER TABLE tenant_test.recrutement OWNER TO postgres;

--
-- TOC entry 390 (class 1259 OID 100349)
-- Name: referentiel_competences; Type: TABLE; Schema: tenant_test; Owner: postgres
--

CREATE TABLE tenant_test.referentiel_competences (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    parcours_id uuid NOT NULL,
    code character varying(30) NOT NULL,
    intitule character varying(200) NOT NULL,
    description text,
    niveau character varying(20),
    competences jsonb DEFAULT '[]'::jsonb,
    valide_par uuid,
    date_validation timestamp with time zone,
    statut character varying(20) DEFAULT 'brouillon'::character varying,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT referentiel_competences_niveau_check CHECK (((niveau)::text = ANY ((ARRAY['Licence'::character varying, 'Master'::character varying, 'Doctorat'::character varying, 'BTS'::character varying, 'DUT'::character varying])::text[]))),
    CONSTRAINT referentiel_competences_statut_check CHECK (((statut)::text = ANY ((ARRAY['brouillon'::character varying, 'valide'::character varying, 'archive'::character varying])::text[])))
);


ALTER TABLE tenant_test.referentiel_competences OWNER TO postgres;

--
-- TOC entry 385 (class 1259 OID 100219)
-- Name: reservation_salle; Type: TABLE; Schema: tenant_test; Owner: postgres
--

CREATE TABLE tenant_test.reservation_salle (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    salle_id uuid NOT NULL,
    titre character varying(200) NOT NULL,
    description text,
    date_reservation date NOT NULL,
    heure_debut time without time zone NOT NULL,
    heure_fin time without time zone NOT NULL,
    demande_par uuid NOT NULL,
    approuve_par uuid,
    statut character varying(20) DEFAULT 'en_attente'::character varying,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT reservation_salle_check CHECK ((heure_fin > heure_debut)),
    CONSTRAINT reservation_salle_statut_check CHECK (((statut)::text = ANY ((ARRAY['en_attente'::character varying, 'approuvee'::character varying, 'refusee'::character varying, 'annulee'::character varying])::text[])))
);


ALTER TABLE tenant_test.reservation_salle OWNER TO postgres;

--
-- TOC entry 356 (class 1259 OID 99294)
-- Name: resultat_deliberation; Type: TABLE; Schema: tenant_test; Owner: postgres
--

CREATE TABLE tenant_test.resultat_deliberation (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    pv_id uuid NOT NULL,
    etudiant_id uuid NOT NULL,
    decision character varying(30) NOT NULL,
    credits_valides smallint DEFAULT 0,
    mention_annee character varying(20),
    passage_annee_sup boolean DEFAULT false,
    observations text,
    CONSTRAINT resultat_deliberation_decision_check CHECK (((decision)::text = ANY ((ARRAY['admis'::character varying, 'ajourne'::character varying, 'ajourné_rattrap'::character varying, 'exclus'::character varying, 'abandon'::character varying])::text[])))
);


ALTER TABLE tenant_test.resultat_deliberation OWNER TO postgres;

--
-- TOC entry 358 (class 1259 OID 99359)
-- Name: resultat_semestre; Type: TABLE; Schema: tenant_test; Owner: postgres
--

CREATE TABLE tenant_test.resultat_semestre (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    etudiant_id uuid NOT NULL,
    inscription_id uuid NOT NULL,
    semestre smallint NOT NULL,
    annee_niveau smallint NOT NULL,
    moyenne_generale numeric(5,2),
    total_credits_ects smallint,
    credits_acquis smallint DEFAULT 0,
    credits_manquants smallint DEFAULT 0,
    nombre_ues smallint DEFAULT 0,
    nombre_ues_validees smallint DEFAULT 0,
    statut character varying(20) DEFAULT 'en_cours'::character varying NOT NULL,
    mention character varying(30),
    deliberation_id uuid,
    classement smallint,
    effectif_promotion smallint,
    date_validation timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT resultat_semestre_statut_check CHECK (((statut)::text = ANY ((ARRAY['en_cours'::character varying, 'valide'::character varying, 'ajourne'::character varying, 'redoublement'::character varying])::text[])))
);


ALTER TABLE tenant_test.resultat_semestre OWNER TO postgres;

--
-- TOC entry 7026 (class 0 OID 0)
-- Dependencies: 358
-- Name: TABLE resultat_semestre; Type: COMMENT; Schema: tenant_test; Owner: postgres
--

COMMENT ON TABLE tenant_test.resultat_semestre IS 'Résultats consolidés par semestre pour chaque étudiant';


--
-- TOC entry 359 (class 1259 OID 99396)
-- Name: resultat_ue; Type: TABLE; Schema: tenant_test; Owner: postgres
--

CREATE TABLE tenant_test.resultat_ue (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    etudiant_id uuid NOT NULL,
    ue_id uuid NOT NULL,
    resultat_semestre_id uuid NOT NULL,
    moyenne_ue numeric(5,2),
    credits_ects smallint,
    credits_acquis boolean DEFAULT false,
    statut character varying(20) DEFAULT 'en_cours'::character varying NOT NULL,
    compensation_ue_id uuid,
    date_validation timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT resultat_ue_statut_check CHECK (((statut)::text = ANY ((ARRAY['en_cours'::character varying, 'valide'::character varying, 'ajourne'::character varying, 'compense'::character varying])::text[])))
);


ALTER TABLE tenant_test.resultat_ue OWNER TO postgres;

--
-- TOC entry 7027 (class 0 OID 0)
-- Dependencies: 359
-- Name: TABLE resultat_ue; Type: COMMENT; Schema: tenant_test; Owner: postgres
--

COMMENT ON TABLE tenant_test.resultat_ue IS 'Résultats détaillés par Unité dEnseignement';


--
-- TOC entry 325 (class 1259 OID 98297)
-- Name: salle; Type: TABLE; Schema: tenant_test; Owner: postgres
--

CREATE TABLE tenant_test.salle (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    batiment_id uuid,
    nom character varying(100) NOT NULL,
    code character varying(20),
    capacite smallint NOT NULL,
    type_salle character varying(30) DEFAULT 'cours'::character varying NOT NULL,
    equipements jsonb DEFAULT '{}'::jsonb,
    disponible boolean DEFAULT true,
    etage smallint DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT salle_type_salle_check CHECK (((type_salle)::text = ANY ((ARRAY['cours'::character varying, 'amphitheatre'::character varying, 'laboratoire'::character varying, 'salle_info'::character varying, 'salle_reunion'::character varying, 'bibliotheque'::character varying])::text[])))
);


ALTER TABLE tenant_test.salle OWNER TO postgres;

--
-- TOC entry 374 (class 1259 OID 99881)
-- Name: secretaire_parcours; Type: TABLE; Schema: tenant_test; Owner: postgres
--

CREATE TABLE tenant_test.secretaire_parcours (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    secretaire_id uuid NOT NULL,
    parcours_id uuid NOT NULL,
    assigned_at timestamp with time zone DEFAULT now(),
    assigned_by uuid,
    actif boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE tenant_test.secretaire_parcours OWNER TO postgres;

--
-- TOC entry 317 (class 1259 OID 98169)
-- Name: seq_recu; Type: SEQUENCE; Schema: tenant_test; Owner: postgres
--

CREATE SEQUENCE tenant_test.seq_recu
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE tenant_test.seq_recu OWNER TO postgres;

--
-- TOC entry 340 (class 1259 OID 98690)
-- Name: session_examen; Type: TABLE; Schema: tenant_test; Owner: postgres
--

CREATE TABLE tenant_test.session_examen (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    annee_academique_id uuid NOT NULL,
    libelle character varying(100) NOT NULL,
    type_session character varying(20) DEFAULT 'normale'::character varying NOT NULL,
    semestre smallint NOT NULL,
    date_debut date,
    date_fin date,
    statut character varying(20) DEFAULT 'planifie'::character varying,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT session_examen_statut_check CHECK (((statut)::text = ANY ((ARRAY['planifie'::character varying, 'en_cours'::character varying, 'cloturee'::character varying, 'deliberee'::character varying])::text[]))),
    CONSTRAINT session_examen_type_session_check CHECK (((type_session)::text = ANY ((ARRAY['normale'::character varying, 'rattrapage'::character varying, 'deuxieme_chance'::character varying])::text[])))
);


ALTER TABLE tenant_test.session_examen OWNER TO postgres;

--
-- TOC entry 319 (class 1259 OID 98193)
-- Name: session_jwt; Type: TABLE; Schema: tenant_test; Owner: postgres
--

CREATE TABLE tenant_test.session_jwt (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    utilisateur_id uuid NOT NULL,
    refresh_token text NOT NULL,
    ip_address inet,
    user_agent text,
    expires_at timestamp with time zone NOT NULL,
    revoque boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE tenant_test.session_jwt OWNER TO postgres;

--
-- TOC entry 363 (class 1259 OID 99552)
-- Name: soutenance; Type: TABLE; Schema: tenant_test; Owner: postgres
--

CREATE TABLE tenant_test.soutenance (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    stage_id uuid NOT NULL,
    date_soutenance timestamp with time zone NOT NULL,
    salle_id uuid,
    president_jury_id uuid,
    membres_jury jsonb DEFAULT '[]'::jsonb,
    duree_minutes smallint DEFAULT 60,
    statut character varying(30) DEFAULT 'planifie'::character varying,
    note_finale numeric(5,2),
    mention character varying(30),
    observations text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT soutenance_mention_check CHECK (((mention)::text = ANY ((ARRAY['passable'::character varying, 'assez_bien'::character varying, 'bien'::character varying, 'tres_bien'::character varying, 'excellent'::character varying])::text[]))),
    CONSTRAINT soutenance_statut_check CHECK (((statut)::text = ANY ((ARRAY['planifie'::character varying, 'realise'::character varying, 'annule'::character varying])::text[])))
);


ALTER TABLE tenant_test.soutenance OWNER TO postgres;

--
-- TOC entry 361 (class 1259 OID 99480)
-- Name: stage; Type: TABLE; Schema: tenant_test; Owner: postgres
--

CREATE TABLE tenant_test.stage (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    etudiant_id uuid NOT NULL,
    parcours_id uuid NOT NULL,
    annee_academique_id uuid NOT NULL,
    type_stage character varying(30) NOT NULL,
    titre character varying(500) NOT NULL,
    entreprise character varying(300),
    lieu character varying(300),
    encadrant_id uuid,
    rapporteur_id uuid,
    date_debut date NOT NULL,
    date_fin date NOT NULL,
    duree_mois smallint,
    statut character varying(30) DEFAULT 'en_cours'::character varying,
    note_finale numeric(5,2),
    appreciation text,
    fichier_rapport_url character varying(500),
    date_soutenance timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT stage_check CHECK ((date_fin > date_debut)),
    CONSTRAINT stage_statut_check CHECK (((statut)::text = ANY ((ARRAY['en_cours'::character varying, 'termine'::character varying, 'abandonne'::character varying, 'valide'::character varying])::text[]))),
    CONSTRAINT stage_type_stage_check CHECK (((type_stage)::text = ANY ((ARRAY['stage'::character varying, 'memoire'::character varying, 'projet_fin_etude'::character varying, 'these'::character varying])::text[])))
);


ALTER TABLE tenant_test.stage OWNER TO postgres;

--
-- TOC entry 386 (class 1259 OID 100253)
-- Name: stock; Type: TABLE; Schema: tenant_test; Owner: postgres
--

CREATE TABLE tenant_test.stock (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    reference character varying(50) NOT NULL,
    libelle character varying(200) NOT NULL,
    categorie character varying(50) NOT NULL,
    unite character varying(20) NOT NULL,
    quantite_stock numeric(10,2) DEFAULT 0 NOT NULL,
    seuil_alerte numeric(10,2) DEFAULT 0 NOT NULL,
    prix_unitaire numeric(10,2),
    fournisseur character varying(200),
    emplacement character varying(100),
    derniere_mise_a_jour timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT stock_categorie_check CHECK (((categorie)::text = ANY ((ARRAY['bureau'::character varying, 'nettoyage'::character varying, 'informatique'::character varying, 'pedagogique'::character varying, 'energie'::character varying, 'autre'::character varying])::text[])))
);


ALTER TABLE tenant_test.stock OWNER TO postgres;

--
-- TOC entry 396 (class 1259 OID 100502)
-- Name: suivi_moral; Type: TABLE; Schema: tenant_test; Owner: postgres
--

CREATE TABLE tenant_test.suivi_moral (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    etudiant_id uuid NOT NULL,
    date_entretien date NOT NULL,
    sujet character varying(255) NOT NULL,
    observations text NOT NULL,
    recommandations text,
    suivi_par uuid NOT NULL,
    parent_informe boolean DEFAULT false,
    date_information_parent timestamp without time zone,
    statut character varying(50) DEFAULT 'en_cours'::character varying,
    prochain_rdv date,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT suivi_moral_statut_check CHECK (((statut)::text = ANY ((ARRAY['en_cours'::character varying, 'cloture'::character varying, 'suivi_requis'::character varying])::text[])))
);


ALTER TABLE tenant_test.suivi_moral OWNER TO postgres;

--
-- TOC entry 353 (class 1259 OID 99179)
-- Name: sujet_examen; Type: TABLE; Schema: tenant_test; Owner: postgres
--

CREATE TABLE tenant_test.sujet_examen (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    session_examen_id uuid NOT NULL,
    ue_id uuid,
    ec_id uuid,
    enseignant_id uuid NOT NULL,
    titre character varying(300) NOT NULL,
    description text,
    fichier_url character varying(500),
    duree_minutes smallint DEFAULT 120,
    bareme_total numeric(5,2) DEFAULT 20.0,
    statut character varying(20) DEFAULT 'soumis'::character varying,
    soumis_par uuid NOT NULL,
    date_soumission timestamp with time zone DEFAULT now(),
    relu_par uuid,
    date_relecture timestamp with time zone,
    valide_par uuid,
    date_validation timestamp with time zone,
    commentaires text,
    motif_rejet text,
    fichier_correction_url character varying(500),
    date_depot_correction timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT sujet_examen_statut_check CHECK (((statut)::text = ANY ((ARRAY['soumis'::character varying, 'en_relecture'::character varying, 'valide'::character varying, 'rejete'::character varying])::text[])))
);


ALTER TABLE tenant_test.sujet_examen OWNER TO postgres;

--
-- TOC entry 403 (class 1259 OID 100699)
-- Name: suplement_diplome; Type: TABLE; Schema: tenant_test; Owner: postgres
--

CREATE TABLE tenant_test.suplement_diplome (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    diplome_id uuid NOT NULL,
    etudiant_id uuid NOT NULL,
    parcours_suivi text,
    competences_acquises text,
    stages_effectues text,
    projets_realises text,
    activites_extra text,
    langues_maitrisees jsonb,
    certifications jsonb,
    mobilite_internationale text,
    systeme_notation text,
    echelle_ects text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE tenant_test.suplement_diplome OWNER TO postgres;

--
-- TOC entry 7028 (class 0 OID 0)
-- Dependencies: 403
-- Name: TABLE suplement_diplome; Type: COMMENT; Schema: tenant_test; Owner: postgres
--

COMMENT ON TABLE tenant_test.suplement_diplome IS 'Supplément au diplôme (Diploma Supplement) selon standards européens';


--
-- TOC entry 354 (class 1259 OID 99229)
-- Name: support_cours; Type: TABLE; Schema: tenant_test; Owner: postgres
--

CREATE TABLE tenant_test.support_cours (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    titre character varying(300) NOT NULL,
    description text,
    type_fichier character varying(50) NOT NULL,
    fichier_url character varying(500) NOT NULL,
    taille_fichier bigint,
    ec_id uuid,
    auteur_id uuid NOT NULL,
    date_depot timestamp with time zone DEFAULT now(),
    partage_parcours_ids uuid[] DEFAULT '{}'::uuid[],
    date_partage timestamp with time zone,
    nb_telechargements integer DEFAULT 0,
    actif boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT support_cours_type_fichier_check CHECK (((type_fichier)::text = ANY ((ARRAY['pdf'::character varying, 'docx'::character varying, 'pptx'::character varying, 'xlsx'::character varying, 'zip'::character varying, 'video'::character varying, 'autre'::character varying])::text[])))
);


ALTER TABLE tenant_test.support_cours OWNER TO postgres;

--
-- TOC entry 384 (class 1259 OID 100176)
-- Name: ticket_maintenance; Type: TABLE; Schema: tenant_test; Owner: postgres
--

CREATE TABLE tenant_test.ticket_maintenance (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    batiment_id uuid,
    salle_id uuid,
    titre character varying(200) NOT NULL,
    description text NOT NULL,
    type_maintenance character varying(30) DEFAULT 'curative'::character varying NOT NULL,
    priorite character varying(20) DEFAULT 'normale'::character varying,
    statut character varying(20) DEFAULT 'ouvert'::character varying,
    signale_par uuid NOT NULL,
    assigne_a uuid,
    date_signalement timestamp with time zone DEFAULT now(),
    date_resolution timestamp with time zone,
    photos_url jsonb DEFAULT '[]'::jsonb,
    cout_reparation numeric(10,2),
    observations text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT ticket_maintenance_priorite_check CHECK (((priorite)::text = ANY ((ARRAY['basse'::character varying, 'normale'::character varying, 'haute'::character varying, 'urgente'::character varying])::text[]))),
    CONSTRAINT ticket_maintenance_statut_check CHECK (((statut)::text = ANY ((ARRAY['ouvert'::character varying, 'en_cours'::character varying, 'resolu'::character varying, 'ferme'::character varying, 'annule'::character varying])::text[]))),
    CONSTRAINT ticket_maintenance_type_maintenance_check CHECK (((type_maintenance)::text = ANY ((ARRAY['preventive'::character varying, 'curative'::character varying, 'urgence'::character varying])::text[])))
);


ALTER TABLE tenant_test.ticket_maintenance OWNER TO postgres;

--
-- TOC entry 404 (class 1259 OID 100722)
-- Name: transfert_etudiant; Type: TABLE; Schema: tenant_test; Owner: postgres
--

CREATE TABLE tenant_test.transfert_etudiant (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    etudiant_id uuid NOT NULL,
    parcours_origine_id uuid NOT NULL,
    parcours_destination_id uuid,
    etablissement_destination character varying(200),
    type_transfert character varying(50) NOT NULL,
    motif text,
    date_demande date DEFAULT CURRENT_DATE,
    statut character varying(30) DEFAULT 'en_attente'::character varying,
    traite_par uuid,
    date_traitement timestamp with time zone,
    observations text,
    documents_fournis jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT transfert_etudiant_statut_check CHECK (((statut)::text = ANY ((ARRAY['en_attente'::character varying, 'approuve'::character varying, 'refuse'::character varying, 'annule'::character varying])::text[]))),
    CONSTRAINT transfert_etudiant_type_transfert_check CHECK (((type_transfert)::text = ANY ((ARRAY['interne'::character varying, 'externe'::character varying, 'reorientation'::character varying])::text[])))
);


ALTER TABLE tenant_test.transfert_etudiant OWNER TO postgres;

--
-- TOC entry 7029 (class 0 OID 0)
-- Dependencies: 404
-- Name: TABLE transfert_etudiant; Type: COMMENT; Schema: tenant_test; Owner: postgres
--

COMMENT ON TABLE tenant_test.transfert_etudiant IS 'Gestion des transferts et équivalences détudiants';


--
-- TOC entry 337 (class 1259 OID 98590)
-- Name: unite_enseignement; Type: TABLE; Schema: tenant_test; Owner: postgres
--

CREATE TABLE tenant_test.unite_enseignement (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    parcours_id uuid NOT NULL,
    code character varying(30) NOT NULL,
    intitule character varying(200) NOT NULL,
    credits_ects smallint DEFAULT 3 NOT NULL,
    coefficient numeric(4,2) DEFAULT 1.0 NOT NULL,
    volume_cm smallint DEFAULT 0,
    volume_td smallint DEFAULT 0,
    volume_tp smallint DEFAULT 0,
    semestre smallint NOT NULL,
    annee_niveau smallint NOT NULL,
    type_ue character varying(20) DEFAULT 'obligatoire'::character varying,
    enseignant_id uuid,
    actif boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT unite_enseignement_annee_niveau_check CHECK (((annee_niveau >= 1) AND (annee_niveau <= 8))),
    CONSTRAINT unite_enseignement_semestre_check CHECK (((semestre >= 1) AND (semestre <= 12))),
    CONSTRAINT unite_enseignement_type_ue_check CHECK (((type_ue)::text = ANY ((ARRAY['obligatoire'::character varying, 'optionnel'::character varying, 'libre'::character varying])::text[])))
);


ALTER TABLE tenant_test.unite_enseignement OWNER TO postgres;

--
-- TOC entry 7030 (class 0 OID 0)
-- Dependencies: 337
-- Name: COLUMN unite_enseignement.enseignant_id; Type: COMMENT; Schema: tenant_test; Owner: postgres
--

COMMENT ON COLUMN tenant_test.unite_enseignement.enseignant_id IS 'enseignant responsable de l''UE. RÈGLE MÉTIER: Une UE ne peut avoir qu''un seul enseignant responsable.';


--
-- TOC entry 318 (class 1259 OID 98170)
-- Name: utilisateur; Type: TABLE; Schema: tenant_test; Owner: postgres
--

CREATE TABLE tenant_test.utilisateur (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email character varying(254) NOT NULL,
    password_hash character varying(255) NOT NULL,
    nom character varying(100) NOT NULL,
    prenom character varying(100) NOT NULL,
    telephone character varying(30),
    photo_url character varying(500),
    role character varying(50) NOT NULL,
    actif boolean DEFAULT true,
    email_verifie boolean DEFAULT false,
    derniere_connexion timestamp with time zone,
    token_reset text,
    token_reset_expiry timestamp with time zone,
    password_reset_required boolean DEFAULT false,
    last_password_reset timestamp with time zone,
    tenant_id uuid,
    parcours_assignes jsonb DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT utilisateur_role_check CHECK (((role)::text = ANY ((ARRAY['president'::character varying, 'resp_pedagogique'::character varying, 'secretaire_parcours'::character varying, 'surveillant_general'::character varying, 'scolarite'::character varying, 'rh'::character varying, 'economat'::character varying, 'caissier'::character varying, 'communication'::character varying, 'logistique'::character varying, 'entretien'::character varying, 'admin'::character varying, 'etudiant'::character varying, 'parent'::character varying, 'enseignant'::character varying])::text[])))
);


ALTER TABLE tenant_test.utilisateur OWNER TO postgres;

--
-- TOC entry 360 (class 1259 OID 99434)
-- Name: verrouillage_notes; Type: TABLE; Schema: tenant_test; Owner: postgres
--

CREATE TABLE tenant_test.verrouillage_notes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    deliberation_id uuid NOT NULL,
    etudiant_id uuid NOT NULL,
    session_examen_id uuid NOT NULL,
    statut character varying(20) DEFAULT 'deverrouille'::character varying NOT NULL,
    date_verrouillage timestamp with time zone,
    verrouille_par uuid,
    autorisation_modif boolean DEFAULT false,
    motif_autorisation text,
    autorise_par uuid,
    date_autorisation timestamp with time zone,
    date_fin_autorisation date,
    historique_modifs jsonb DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT verrouillage_notes_statut_check CHECK (((statut)::text = ANY ((ARRAY['deverrouille'::character varying, 'verrouille'::character varying, 'modification_autorisee'::character varying])::text[])))
);


ALTER TABLE tenant_test.verrouillage_notes OWNER TO postgres;

--
-- TOC entry 7031 (class 0 OID 0)
-- Dependencies: 360
-- Name: TABLE verrouillage_notes; Type: COMMENT; Schema: tenant_test; Owner: postgres
--

COMMENT ON TABLE tenant_test.verrouillage_notes IS 'Contrôle d accès et verrouillage des notes après délibération';


--
-- TOC entry 409 (class 1259 OID 100941)
-- Name: vue_absences_etudiant; Type: VIEW; Schema: tenant_test; Owner: postgres
--

CREATE VIEW tenant_test.vue_absences_etudiant AS
 SELECT e.id AS etudiant_id,
    e.matricule,
    (((e.nom)::text || ' '::text) || (e.prenom)::text) AS etudiant_nom,
    count(pr.id) AS total_seances,
    count(pr.id) FILTER (WHERE ((pr.statut)::text = 'absent'::text)) AS absences_total,
    count(pr.id) FILTER (WHERE (((pr.statut)::text = 'absent'::text) AND (pr.justifie = true))) AS absences_justifiees,
    count(pr.id) FILTER (WHERE (((pr.statut)::text = 'absent'::text) AND (pr.justifie = false))) AS absences_injustifiees,
    count(pr.id) FILTER (WHERE ((pr.statut)::text = 'retard'::text)) AS retards,
    round(((100.0 * (count(pr.id) FILTER (WHERE ((pr.statut)::text = 'present'::text)))::numeric) / (NULLIF(count(pr.id), 0))::numeric), 1) AS taux_assiduite
   FROM (tenant_test.etudiant e
     JOIN tenant_test.presence pr ON ((e.id = pr.etudiant_id)))
  GROUP BY e.id, e.matricule, e.nom, e.prenom;


ALTER VIEW tenant_test.vue_absences_etudiant OWNER TO postgres;

--
-- TOC entry 410 (class 1259 OID 100946)
-- Name: vue_frais_inscription_actifs; Type: VIEW; Schema: tenant_test; Owner: postgres
--

CREATE VIEW tenant_test.vue_frais_inscription_actifs AS
SELECT
    NULL::uuid AS id,
    NULL::uuid AS parcours_id,
    NULL::uuid AS annee_academique_id,
    NULL::numeric(10,2) AS montant_inscription,
    NULL::numeric(10,2) AS montant_scolarite,
    NULL::numeric(10,2) AS montant_total,
    NULL::text AS description,
    NULL::boolean AS actif,
    NULL::date AS date_limite_paiement,
    NULL::jsonb AS modalites_paiement,
    NULL::uuid AS cree_par,
    NULL::uuid AS modifie_par,
    NULL::timestamp with time zone AS created_at,
    NULL::timestamp with time zone AS updated_at,
    NULL::character varying(30) AS parcours_code,
    NULL::character varying(200) AS parcours_nom,
    NULL::character varying(200) AS departement_nom,
    NULL::character varying(20) AS annee_academique,
    NULL::date AS annee_debut,
    NULL::date AS annee_fin,
    NULL::bigint AS nb_inscriptions,
    NULL::numeric AS total_encaisse;


ALTER VIEW tenant_test.vue_frais_inscription_actifs OWNER TO postgres;

--
-- TOC entry 407 (class 1259 OID 100931)
-- Name: vue_kpi_president; Type: VIEW; Schema: tenant_test; Owner: postgres
--

CREATE VIEW tenant_test.vue_kpi_president AS
 SELECT ( SELECT count(*) AS count
           FROM tenant_test.etudiant
          WHERE (etudiant.actif = true)) AS total_etudiants,
    ( SELECT count(*) AS count
           FROM (tenant_test.inscription i
             JOIN tenant_test.annee_academique aa ON ((aa.id = i.annee_academique_id)))
          WHERE ((aa.active = true) AND ((i.statut)::text = 'validee'::text))) AS etudiants_inscrits_annee,
    ( SELECT count(*) AS count
           FROM tenant_test.utilisateur
          WHERE (((utilisateur.role)::text = 'enseignant'::text) AND (utilisateur.actif = true))) AS total_enseignants,
    ( SELECT count(*) AS count
           FROM tenant_test.utilisateur
          WHERE (((utilisateur.role)::text <> ALL ((ARRAY['etudiant'::character varying, 'parent'::character varying, 'enseignant'::character varying])::text[])) AND (utilisateur.actif = true))) AS total_personnel,
    ( SELECT COALESCE(sum(p.montant), (0)::numeric) AS "coalesce"
           FROM ((tenant_test.paiement p
             JOIN tenant_test.inscription i ON ((p.inscription_id = i.id)))
             JOIN tenant_test.annee_academique aa ON ((aa.id = i.annee_academique_id)))
          WHERE ((aa.active = true) AND ((p.statut)::text = 'valide'::text))) AS recettes_annee,
    ( SELECT COALESCE(sum(depense.montant), (0)::numeric) AS "coalesce"
           FROM tenant_test.depense
          WHERE (((depense.statut)::text = 'paye'::text) AND (depense.date_depense >= date_trunc('month'::text, now())))) AS depenses_mois,
    ( SELECT count(*) AS count
           FROM tenant_test.ticket_maintenance
          WHERE ((ticket_maintenance.statut)::text = ANY ((ARRAY['ouvert'::character varying, 'en_cours'::character varying])::text[]))) AS tickets_maintenance_ouverts,
    ( SELECT count(*) AS count
           FROM tenant_test.stock
          WHERE (stock.quantite_stock <= stock.seuil_alerte)) AS alertes_stock;


ALTER VIEW tenant_test.vue_kpi_president OWNER TO postgres;

--
-- TOC entry 405 (class 1259 OID 100921)
-- Name: vue_moyenne_ue; Type: VIEW; Schema: tenant_test; Owner: postgres
--

CREATE VIEW tenant_test.vue_moyenne_ue AS
 SELECT n.etudiant_id,
    ec.ue_id,
    n.session_id,
    round((sum((n.valeur * ec.coefficient)) / NULLIF(sum(ec.coefficient), (0)::numeric)), 2) AS moyenne_ue,
    count(n.id) AS nb_notes,
    bool_and(n.verrouille) AS toutes_verrouillees
   FROM (tenant_test.note n
     JOIN tenant_test.element_constitutif ec ON ((n.ec_id = ec.id)))
  GROUP BY n.etudiant_id, ec.ue_id, n.session_id;


ALTER VIEW tenant_test.vue_moyenne_ue OWNER TO postgres;

--
-- TOC entry 406 (class 1259 OID 100926)
-- Name: vue_moyenne_semestre; Type: VIEW; Schema: tenant_test; Owner: postgres
--

CREATE VIEW tenant_test.vue_moyenne_semestre AS
 SELECT mue.etudiant_id,
    ue.semestre,
    mue.session_id,
    round((sum((mue.moyenne_ue * ue.coefficient)) / NULLIF(sum(ue.coefficient), (0)::numeric)), 2) AS moyenne_semestre,
    sum(
        CASE
            WHEN (mue.moyenne_ue >= (10)::numeric) THEN (ue.credits_ects)::integer
            ELSE 0
        END) AS credits_valides,
    sum(ue.credits_ects) AS credits_total
   FROM (tenant_test.vue_moyenne_ue mue
     JOIN tenant_test.unite_enseignement ue ON ((mue.ue_id = ue.id)))
  GROUP BY mue.etudiant_id, ue.semestre, mue.session_id;


ALTER VIEW tenant_test.vue_moyenne_semestre OWNER TO postgres;

--
-- TOC entry 408 (class 1259 OID 100936)
-- Name: vue_paiement_etudiant; Type: VIEW; Schema: tenant_test; Owner: postgres
--

CREATE VIEW tenant_test.vue_paiement_etudiant AS
 SELECT e.id AS etudiant_id,
    e.matricule,
    (((e.nom)::text || ' '::text) || (e.prenom)::text) AS etudiant_nom,
    p.nom AS parcours,
    aa.libelle AS annee,
    gt.montant_total AS montant_du,
    COALESCE(sum(pay.montant) FILTER (WHERE ((pay.statut)::text = 'valide'::text)), (0)::numeric) AS montant_paye,
    (gt.montant_total - COALESCE(sum(pay.montant) FILTER (WHERE ((pay.statut)::text = 'valide'::text)), (0)::numeric)) AS solde,
        CASE
            WHEN ((gt.montant_total - COALESCE(sum(pay.montant) FILTER (WHERE ((pay.statut)::text = 'valide'::text)), (0)::numeric)) <= (0)::numeric) THEN 'solde'::text
            WHEN (COALESCE(sum(pay.montant) FILTER (WHERE ((pay.statut)::text = 'valide'::text)), (0)::numeric) > (0)::numeric) THEN 'partiel'::text
            ELSE 'impaye'::text
        END AS statut_paiement
   FROM (((((tenant_test.etudiant e
     JOIN tenant_test.inscription i ON ((e.id = i.etudiant_id)))
     JOIN tenant_test.parcours p ON ((p.id = i.parcours_id)))
     JOIN tenant_test.annee_academique aa ON ((aa.id = i.annee_academique_id)))
     LEFT JOIN tenant_test.grille_tarifaire gt ON (((gt.parcours_id = i.parcours_id) AND (gt.annee_academique_id = i.annee_academique_id) AND ((gt.annee_niveau = i.annee_niveau) OR (gt.annee_niveau IS NULL)))))
     LEFT JOIN tenant_test.paiement pay ON ((pay.inscription_id = i.id)))
  WHERE (aa.active = true)
  GROUP BY e.id, e.matricule, e.nom, e.prenom, p.nom, aa.libelle, gt.montant_total;


ALTER VIEW tenant_test.vue_paiement_etudiant OWNER TO postgres;

--
-- TOC entry 412 (class 1259 OID 100974)
-- Name: vue_statistiques_deliberation; Type: VIEW; Schema: tenant_test; Owner: postgres
--

CREATE VIEW tenant_test.vue_statistiques_deliberation AS
 SELECT d.id AS deliberation_id,
    d.date_deliberation,
    p.code AS parcours_code,
    p.nom AS parcours_nom,
    d.semestre,
    d.annee_niveau,
    count(rs.id) AS nombre_etudiants,
    count(
        CASE
            WHEN ((rs.statut)::text = 'valide'::text) THEN 1
            ELSE NULL::integer
        END) AS admis,
    count(
        CASE
            WHEN ((rs.statut)::text = 'ajourne'::text) THEN 1
            ELSE NULL::integer
        END) AS ajournes,
    count(
        CASE
            WHEN ((rs.statut)::text = 'redoublement'::text) THEN 1
            ELSE NULL::integer
        END) AS redoublants,
    round(avg(rs.moyenne_generale), 2) AS moyenne_promotion,
    max(rs.moyenne_generale) AS moyenne_max,
    min(rs.moyenne_generale) AS moyenne_min
   FROM (((tenant_test.deliberation d
     JOIN tenant_test.parcours p ON ((d.parcours_id = p.id)))
     JOIN tenant_test.session_examen se ON ((d.session_examen_id = se.id)))
     LEFT JOIN tenant_test.resultat_semestre rs ON ((d.id = rs.deliberation_id)))
  GROUP BY d.id, p.code, p.nom, d.semestre, d.annee_niveau, d.date_deliberation
  ORDER BY d.date_deliberation DESC;


ALTER VIEW tenant_test.vue_statistiques_deliberation OWNER TO postgres;

--
-- TOC entry 411 (class 1259 OID 100951)
-- Name: vue_statistiques_paiement_parcours; Type: VIEW; Schema: tenant_test; Owner: postgres
--

CREATE VIEW tenant_test.vue_statistiques_paiement_parcours AS
 SELECT p.code AS parcours_code,
    p.nom AS parcours_nom,
    aa.date_debut AS annee_debut,
    aa.date_fin AS annee_fin,
    count(DISTINCT pa.inscription_id) AS nb_etudiants_payants,
    count(DISTINCT i.id) AS nb_etudiants_inscrits,
    COALESCE(sum(pa.montant), (0)::numeric) AS total_encaisse,
    COALESCE(avg(pa.montant), (0)::numeric) AS montant_moyen,
    count(*) AS nb_transactions
   FROM (((tenant_test.parcours p
     JOIN tenant_test.inscription i ON ((i.parcours_id = p.id)))
     JOIN tenant_test.annee_academique aa ON ((aa.id = i.annee_academique_id)))
     LEFT JOIN tenant_test.paiement pa ON (((pa.inscription_id = i.id) AND ((pa.statut)::text = 'valide'::text))))
  GROUP BY p.id, p.code, p.nom, aa.date_debut, aa.date_fin
  ORDER BY COALESCE(sum(pa.montant), (0)::numeric) DESC;


ALTER VIEW tenant_test.vue_statistiques_paiement_parcours OWNER TO postgres;

--
-- TOC entry 5643 (class 2604 OID 98554)
-- Name: convention id; Type: DEFAULT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.convention ALTER COLUMN id SET DEFAULT nextval('tenant_test.convention_id_seq'::regclass);


--
-- TOC entry 5648 (class 2604 OID 98576)
-- Name: delegation_signature id; Type: DEFAULT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.delegation_signature ALTER COLUMN id SET DEFAULT nextval('tenant_test.delegation_signature_id_seq'::regclass);


--
-- TOC entry 6948 (class 0 OID 99102)
-- Dependencies: 351
-- Data for Name: absence_enseignant; Type: TABLE DATA; Schema: tenant_test; Owner: postgres
--

COPY tenant_test.absence_enseignant (id, enseignant_id, seance_id, date_absence, heure_debut, heure_fin, motif, justification, justificatif_url, est_justifiee, statut, declaree_par, validee_par, date_validation, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6936 (class 0 OID 98648)
-- Dependencies: 339
-- Data for Name: affectation_cours; Type: TABLE DATA; Schema: tenant_test; Owner: postgres
--

COPY tenant_test.affectation_cours (id, enseignant_id, ue_id, ec_id, annee_academique_id, type_seance, volume_prevu, volume_realise, valide_par, created_at) FROM stdin;
\.


--
-- TOC entry 6991 (class 0 OID 100464)
-- Dependencies: 394
-- Data for Name: alerte_discipline; Type: TABLE DATA; Schema: tenant_test; Owner: postgres
--

COPY tenant_test.alerte_discipline (id, etudiant_id, type, message, statut, generee_par, destinataire_role, date_lecture, traitee_par, date_traitement, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6917 (class 0 OID 98214)
-- Dependencies: 320
-- Data for Name: annee_academique; Type: TABLE DATA; Schema: tenant_test; Owner: postgres
--

COPY tenant_test.annee_academique (id, libelle, date_debut, date_fin, active, created_at) FROM stdin;
014a42dd-fe2c-4cba-b322-19d4a344797c	2025-2026	2025-09-01	2026-07-31	t	2026-05-19 07:09:41.536916+00
\.


--
-- TOC entry 6976 (class 0 OID 100035)
-- Dependencies: 379
-- Data for Name: annonce; Type: TABLE DATA; Schema: tenant_test; Owner: postgres
--

COPY tenant_test.annonce (id, titre, contenu, type_annonce, cible, parcours_id, publie, date_publication, date_expiration, auteur_id, photo_url, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6998 (class 0 OID 100633)
-- Dependencies: 401
-- Data for Name: archive_scolarite; Type: TABLE DATA; Schema: tenant_test; Owner: postgres
--

COPY tenant_test.archive_scolarite (id, etudiant_id, type_document, titre_document, annee_academique, semestre, fichier_original_url, fichier_pdf_url, hash_integrite, format, taille_octets, langue, acces_public, date_limite_acces, archive_par, date_archivage, duree_conservation, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6999 (class 0 OID 100665)
-- Dependencies: 402
-- Data for Name: attestation; Type: TABLE DATA; Schema: tenant_test; Owner: postgres
--

COPY tenant_test.attestation (id, etudiant_id, inscription_id, type_attestation, numero_attestation, annee_academique_id, motif, observations, statut, genere_par, date_generation, fichier_url, created_at, updated_at, date_emission) FROM stdin;
\.


--
-- TOC entry 6994 (class 0 OID 100521)
-- Dependencies: 397
-- Data for Name: autorisation_sortie; Type: TABLE DATA; Schema: tenant_test; Owner: postgres
--

COPY tenant_test.autorisation_sortie (id, etudiant_id, type, date_debut, date_fin, motif, demande_par, est_mineur, autorisation_parentale_url, statut, validee_par, date_validation, motif_refus, observations, sortie_effective, heure_sortie, heure_retour, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6919 (class 0 OID 98246)
-- Dependencies: 322
-- Data for Name: batiment; Type: TABLE DATA; Schema: tenant_test; Owner: postgres
--

COPY tenant_test.batiment (id, nom, code, adresse, actif) FROM stdin;
37af36ea-b807-4b6e-a44a-bf68b240bc0f	Bloc A - Sciences	BLOCA	\N	t
eef2f294-6c04-4069-8ef7-8499d0b605a4	Bloc B - Administration	BLOCB	\N	t
7e898d8e-0269-4e09-a57c-c622cc34d5c7	Amphithéâtre Central	AMPHI	\N	t
\.


--
-- TOC entry 6962 (class 0 OID 99613)
-- Dependencies: 365
-- Data for Name: budget; Type: TABLE DATA; Schema: tenant_test; Owner: postgres
--

COPY tenant_test.budget (id, annee_academique_id, departement_id, categorie, montant_prevu, montant_realise, description, created_by, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6969 (class 0 OID 99820)
-- Dependencies: 372
-- Data for Name: calendrier_academique; Type: TABLE DATA; Schema: tenant_test; Owner: postgres
--

COPY tenant_test.calendrier_academique (id, annee_academique_id, evenement, type_evenement, date_debut, date_fin, parcours_id, description, valide_par_president, valide_le, commentaire_president, created_at) FROM stdin;
\.


--
-- TOC entry 6943 (class 0 OID 98884)
-- Dependencies: 346
-- Data for Name: candidature; Type: TABLE DATA; Schema: tenant_test; Owner: postgres
--

COPY tenant_test.candidature (id, recrutement_id, nom, prenom, email, telephone, cv_url, lettre_motivation_url, statut, notes_evaluation, date_entretien, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6942 (class 0 OID 98850)
-- Dependencies: 345
-- Data for Name: cloture_caisse; Type: TABLE DATA; Schema: tenant_test; Owner: postgres
--

COPY tenant_test.cloture_caisse (id, date_cloture, caissier_id, total_especes, total_cheques, total_virements, total_carte_bancaire, total_mobile_money, total_general, nombre_paiements, details_paiements, solde_banque_theorique, solde_banque_reel, ecart, motif_ecart, valide, valide_par, date_validation, observations, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6992 (class 0 OID 100483)
-- Dependencies: 395
-- Data for Name: configuration_examen; Type: TABLE DATA; Schema: tenant_test; Owner: postgres
--

COPY tenant_test.configuration_examen (id, session_examen_id, salle_id, places_total, places_attribuees, plan_places, surveillant_id, statut, rapport_incident, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6964 (class 0 OID 99681)
-- Dependencies: 367
-- Data for Name: conge_personnel; Type: TABLE DATA; Schema: tenant_test; Owner: postgres
--

COPY tenant_test.conge_personnel (id, utilisateur_id, type_conge, date_debut, date_fin, motif, statut, approuve_par, date_approbation, created_at) FROM stdin;
\.


--
-- TOC entry 6996 (class 0 OID 100567)
-- Dependencies: 399
-- Data for Name: conseil_discipline; Type: TABLE DATA; Schema: tenant_test; Owner: postgres
--

COPY tenant_test.conseil_discipline (id, etudiant_id, date_conseil, motif_convocation, incidents_lies, membres_presents, deliberation, decision, justification_decision, droit_appel, delai_appel_jours, statut, proces_verbal_url, parent_present, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6928 (class 0 OID 98493)
-- Dependencies: 331
-- Data for Name: contrat_personnel; Type: TABLE DATA; Schema: tenant_test; Owner: postgres
--

COPY tenant_test.contrat_personnel (id, utilisateur_id, type_contrat, poste, departement_id, date_debut, date_fin, salaire_brut, salaire_net, volume_horaire_hebdo, actif, fichier_contrat_url, observations, valide_par, valide_le, commentaire_president, conditions_speciales, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6931 (class 0 OID 98551)
-- Dependencies: 334
-- Data for Name: convention; Type: TABLE DATA; Schema: tenant_test; Owner: postgres
--

COPY tenant_test.convention (id, intitule, partenaire, type_partenaire, objet_convention, date_proposee, document_url, statut, signe_president, date_signature, signature_hash, representant_partenaire, date_effet, remarques_president, cree_par, cree_le, modifie_le) FROM stdin;
\.


--
-- TOC entry 6973 (class 0 OID 99935)
-- Dependencies: 376
-- Data for Name: convocation; Type: TABLE DATA; Schema: tenant_test; Owner: postgres
--

COPY tenant_test.convocation (id, etudiant_id, session_examen_id, soutenance_id, type, libelle, message, date_convocation, heure_convocation, lieu, salle_id, statut, date_envoi, date_lecture, date_confirmation, genere_par, fichier_url, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6968 (class 0 OID 99798)
-- Dependencies: 371
-- Data for Name: declaration_sociale; Type: TABLE DATA; Schema: tenant_test; Owner: postgres
--

COPY tenant_test.declaration_sociale (id, type_declaration, periode_debut, periode_fin, organisme, montant_total_cotisations, nb_salaries, statut, date_transmission, date_paiement, fichier_export_url, observations, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6933 (class 0 OID 98573)
-- Dependencies: 336
-- Data for Name: delegation_signature; Type: TABLE DATA; Schema: tenant_test; Owner: postgres
--

COPY tenant_test.delegation_signature (id, delegataire_id, types_actes, date_debut, date_fin, conditions, revoquee, revoquee_le, revoquee_par, cree_par, cree_le) FROM stdin;
\.


--
-- TOC entry 6954 (class 0 OID 99321)
-- Dependencies: 357
-- Data for Name: deliberation; Type: TABLE DATA; Schema: tenant_test; Owner: postgres
--

COPY tenant_test.deliberation (id, session_examen_id, parcours_id, semestre, annee_niveau, date_deliberation, president_jury_id, membres_jury, statut, observations_generales, rapport_deliberation, validee_par, date_validation, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6972 (class 0 OID 99906)
-- Dependencies: 375
-- Data for Name: demande_etudiant; Type: TABLE DATA; Schema: tenant_test; Owner: postgres
--

COPY tenant_test.demande_etudiant (id, etudiant_id, type_demande, description, justification, piece_jointe_url, date_soumission, statut, reponse, traite_par, date_traitement, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6975 (class 0 OID 100007)
-- Dependencies: 378
-- Data for Name: demande_ressource; Type: TABLE DATA; Schema: tenant_test; Owner: postgres
--

COPY tenant_test.demande_ressource (id, type_ressource, date_souhaitee, heure_debut, heure_fin, motif, nb_participants, materiel_requis, demandeur_id, statut, traite_par, date_traitement, commentaire_rejet, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6921 (class 0 OID 98277)
-- Dependencies: 324
-- Data for Name: departement; Type: TABLE DATA; Schema: tenant_test; Owner: postgres
--

COPY tenant_test.departement (id, code, nom, description, responsable_id, actif, created_at) FROM stdin;
d20eb4b5-6eed-4dc2-931d-b0b589127329	INFO	Département Informatique et Numérique	\N	\N	t	2026-05-19 07:09:41.570045+00
c81236cd-06fe-40fd-b0e8-17184b03807f	GESTION	Département Gestion et Commerce	\N	\N	t	2026-05-19 07:09:41.570045+00
68cb3a67-cda7-4042-80f2-1d337a1c2fe8	DROIT	Département Droit et Sciences Politiques	\N	\N	t	2026-05-19 07:09:41.570045+00
\.


--
-- TOC entry 6963 (class 0 OID 99643)
-- Dependencies: 366
-- Data for Name: depense; Type: TABLE DATA; Schema: tenant_test; Owner: postgres
--

COPY tenant_test.depense (id, budget_id, annee_academique_id, libelle, montant, categorie, date_depense, fournisseur, numero_facture, facture_url, statut, demande_par, approuve_par, date_approbation, observations, valide_par_president, valide_le, motif_decision, conditions_speciales, created_at) FROM stdin;
\.


--
-- TOC entry 6997 (class 0 OID 100589)
-- Dependencies: 400
-- Data for Name: diplome; Type: TABLE DATA; Schema: tenant_test; Owner: postgres
--

COPY tenant_test.diplome (id, etudiant_id, parcours_id, annee_academique_id, numero_diplome, type_diplome, mention, date_obtention, moyenne_generale, credits_obtenus, fichier_url, hash_document, signe_par, signature_url, date_signature, signe_president, mention_speciale, created_at) FROM stdin;
\.


--
-- TOC entry 6974 (class 0 OID 99973)
-- Dependencies: 377
-- Data for Name: dossier_etudiant; Type: TABLE DATA; Schema: tenant_test; Owner: postgres
--

COPY tenant_test.dossier_etudiant (id, etudiant_id, type_document, libelle, fichier_url, reference, date_demande, date_delivrance, statut, motif_refus, demande_par, traite_par, est_archive, date_archivage, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6938 (class 0 OID 98711)
-- Dependencies: 341
-- Data for Name: echeancier; Type: TABLE DATA; Schema: tenant_test; Owner: postgres
--

COPY tenant_test.echeancier (id, inscription_id, num_tranche, montant_du, date_echeance, statut) FROM stdin;
\.


--
-- TOC entry 6935 (class 0 OID 98627)
-- Dependencies: 338
-- Data for Name: element_constitutif; Type: TABLE DATA; Schema: tenant_test; Owner: postgres
--

COPY tenant_test.element_constitutif (id, ue_id, code, intitule, coefficient, actif, created_at) FROM stdin;
\.


--
-- TOC entry 6944 (class 0 OID 98906)
-- Dependencies: 347
-- Data for Name: emploi_du_temps; Type: TABLE DATA; Schema: tenant_test; Owner: postgres
--

COPY tenant_test.emploi_du_temps (id, annee_academique_id, affectation_id, salle_id, date_seance, heure_debut, heure_fin, type_seance, statut, motif_annulation, created_by_id, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6924 (class 0 OID 98358)
-- Dependencies: 327
-- Data for Name: enseignant; Type: TABLE DATA; Schema: tenant_test; Owner: postgres
--

COPY tenant_test.enseignant (id, utilisateur_id, matricule, nom, prenom, titre, grade, specialite, type_contrat, departement_id, email, telephone, actif, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6925 (class 0 OID 98390)
-- Dependencies: 328
-- Data for Name: etudiant; Type: TABLE DATA; Schema: tenant_test; Owner: postgres
--

COPY tenant_test.etudiant (id, utilisateur_id, matricule, nom, prenom, date_naissance, lieu_naissance, sexe, nationalite, adresse, telephone, email, nom_parent, telephone_parent, email_parent, religion, situation_familiale, photo_url, dossier_medical_url, actif, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6967 (class 0 OID 99768)
-- Dependencies: 370
-- Data for Name: evaluation_personnel; Type: TABLE DATA; Schema: tenant_test; Owner: postgres
--

COPY tenant_test.evaluation_personnel (id, utilisateur_id, evaluateur_id, annee_evaluation, date_evaluation, objectifs, competences, auto_evaluation, date_auto_evaluation, appreciation, points_forts, axes_amelioration, note_globale, statut, date_finalisation, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6961 (class 0 OID 99587)
-- Dependencies: 364
-- Data for Name: evaluation_soutenance; Type: TABLE DATA; Schema: tenant_test; Owner: postgres
--

COPY tenant_test.evaluation_soutenance (id, soutenance_id, evaluateur_id, note, appreciation, date_evaluation) FROM stdin;
\.


--
-- TOC entry 6965 (class 0 OID 99709)
-- Dependencies: 368
-- Data for Name: fiche_paie; Type: TABLE DATA; Schema: tenant_test; Owner: postgres
--

COPY tenant_test.fiche_paie (id, contrat_id, annee, mois, salaire_brut, cotisations, primes, retenues, net_a_payer, heures_supp, montant_heures_supp, statut, fichier_url, created_at) FROM stdin;
\.


--
-- TOC entry 6959 (class 0 OID 99527)
-- Dependencies: 362
-- Data for Name: fiche_suivi_stage; Type: TABLE DATA; Schema: tenant_test; Owner: postgres
--

COPY tenant_test.fiche_suivi_stage (id, stage_id, date_rencontre, travail_effectue, observations, note_avancement, auteur_id, created_at) FROM stdin;
\.


--
-- TOC entry 6941 (class 0 OID 98809)
-- Dependencies: 344
-- Data for Name: frais_inscription; Type: TABLE DATA; Schema: tenant_test; Owner: postgres
--

COPY tenant_test.frais_inscription (id, parcours_id, annee_academique_id, montant_inscription, montant_scolarite, montant_total, description, actif, date_limite_paiement, modalites_paiement, cree_par, modifie_par, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6926 (class 0 OID 98417)
-- Dependencies: 329
-- Data for Name: grille_tarifaire; Type: TABLE DATA; Schema: tenant_test; Owner: postgres
--

COPY tenant_test.grille_tarifaire (id, parcours_id, annee_academique_id, annee_niveau, montant_total, montant_inscription, montant_scolarite, nb_tranches, date_limite_paiement, modalites_paiement, description, actif, created_at) FROM stdin;
\.


--
-- TOC entry 6966 (class 0 OID 99739)
-- Dependencies: 369
-- Data for Name: heure_complementaire; Type: TABLE DATA; Schema: tenant_test; Owner: postgres
--

COPY tenant_test.heure_complementaire (id, enseignant_id, date_travail, nb_heures, taux_horaire, motif, statut, valide_par, date_validation, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6970 (class 0 OID 99846)
-- Dependencies: 373
-- Data for Name: incident_disciplinaire; Type: TABLE DATA; Schema: tenant_test; Owner: postgres
--

COPY tenant_test.incident_disciplinaire (id, etudiant_id, date_incident, type_incident, description, sanction, duree_sanction, statut, rapporte_par, arbitre_par, date_cloture, observations, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6927 (class 0 OID 98446)
-- Dependencies: 330
-- Data for Name: inscription; Type: TABLE DATA; Schema: tenant_test; Owner: postgres
--

COPY tenant_test.inscription (id, etudiant_id, parcours_id, annee_academique_id, annee_niveau, type_inscription, statut, numero_carte, date_inscription, bourse, type_bourse, montant_bourse, observations, validee_par, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6978 (class 0 OID 100085)
-- Dependencies: 381
-- Data for Name: message; Type: TABLE DATA; Schema: tenant_test; Owner: postgres
--

COPY tenant_test.message (id, expediteur_id, destinataire_id, sujet, contenu, lu, lu_at, parent_id, created_at) FROM stdin;
\.


--
-- TOC entry 6980 (class 0 OID 100154)
-- Dependencies: 383
-- Data for Name: message_destinataire; Type: TABLE DATA; Schema: tenant_test; Owner: postgres
--

COPY tenant_test.message_destinataire (id, message_id, etudiant_id, lu, date_lecture) FROM stdin;
\.


--
-- TOC entry 6979 (class 0 OID 100114)
-- Dependencies: 382
-- Data for Name: message_enseignant; Type: TABLE DATA; Schema: tenant_test; Owner: postgres
--

COPY tenant_test.message_enseignant (id, enseignant_id, sujet, contenu, type_message, etudiant_id, classe_id, parcours_id, niveau_id, nombre_destinataires, date_envoi, statut, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6984 (class 0 OID 100275)
-- Dependencies: 387
-- Data for Name: mouvement_stock; Type: TABLE DATA; Schema: tenant_test; Owner: postgres
--

COPY tenant_test.mouvement_stock (id, stock_id, type_mouvement, quantite, motif, reference_doc, utilisateur_id, date_mouvement) FROM stdin;
\.


--
-- TOC entry 6918 (class 0 OID 98228)
-- Dependencies: 321
-- Data for Name: niveau_etude; Type: TABLE DATA; Schema: tenant_test; Owner: postgres
--

COPY tenant_test.niveau_etude (id, code, libelle, description, ordre, type_diplome, actif, created_at, updated_at) FROM stdin;
b5e43cf0-3e9a-4d19-a4ad-8f39e38f4a08	L1	L1 - 1ère année	Première année de Licence	1	Licence	t	2026-05-19 07:09:40.388605+00	2026-05-19 07:09:40.388605+00
6438b66c-6cca-4062-9279-561c16d08e68	L2	L2 - 2ème année	Deuxième année de Licence	2	Licence	t	2026-05-19 07:09:40.388605+00	2026-05-19 07:09:40.388605+00
47e14e4e-e53b-4625-a86f-37cad75d530f	L3	L3 - 3ème année	Troisième année de Licence	3	Licence	t	2026-05-19 07:09:40.388605+00	2026-05-19 07:09:40.388605+00
74226fc5-3d7b-4db9-b84d-f11f3e9c6158	M1	M1 - 1ère année Master	Première année de Master	4	Master	t	2026-05-19 07:09:40.388605+00	2026-05-19 07:09:40.388605+00
3b60faf9-0873-4ed2-9d2e-0173c6ee6bc6	M2	M2 - 2ème année Master	Deuxième année de Master	5	Master	t	2026-05-19 07:09:40.388605+00	2026-05-19 07:09:40.388605+00
\.


--
-- TOC entry 6945 (class 0 OID 98948)
-- Dependencies: 348
-- Data for Name: note; Type: TABLE DATA; Schema: tenant_test; Owner: postgres
--

COPY tenant_test.note (id, etudiant_id, ec_id, ue_id, session_id, valeur, type_evaluation, absence_justifiee, verrouille, hash_integrite, saisi_par, valide_par, date_saisie, date_verrouillage, observations, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6947 (class 0 OID 99044)
-- Dependencies: 350
-- Data for Name: note_derogatoire; Type: TABLE DATA; Schema: tenant_test; Owner: postgres
--

COPY tenant_test.note_derogatoire (id, etudiant_id, ec_id, ue_id, session_examen_id, valeur, motif_derogation, type_derogation, est_derogatoire, soumis_a_scolarite, valide_par_scolarite, date_validation_scolarite, statut, saisie_par, valide_par, date_saisie, observations, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6977 (class 0 OID 100064)
-- Dependencies: 380
-- Data for Name: notification; Type: TABLE DATA; Schema: tenant_test; Owner: postgres
--

COPY tenant_test.notification (id, utilisateur_id, titre, message, type_notification, lue, lue_at, lien, created_at) FROM stdin;
\.


--
-- TOC entry 6939 (class 0 OID 98731)
-- Dependencies: 342
-- Data for Name: paiement; Type: TABLE DATA; Schema: tenant_test; Owner: postgres
--

COPY tenant_test.paiement (id, inscription_id, echeancier_id, montant, mode_paiement, date_paiement, reference, numero_recu, recu_url, caissier_id, statut, motif_annulation, observations, type_paiement, cloture_caisse_id, details_paiement, created_at) FROM stdin;
\.


--
-- TOC entry 6940 (class 0 OID 98770)
-- Dependencies: 343
-- Data for Name: paiement_inscription; Type: TABLE DATA; Schema: tenant_test; Owner: postgres
--

COPY tenant_test.paiement_inscription (id, inscription_id, etudiant_id, montant, methode_paiement, reference_paiement, date_paiement, preuve_url, statut, valide_par, date_validation, note_validation, motif_rejet, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6923 (class 0 OID 98322)
-- Dependencies: 326
-- Data for Name: parcours; Type: TABLE DATA; Schema: tenant_test; Owner: postgres
--

COPY tenant_test.parcours (id, departement_id, code, nom, niveau, duree_annees, responsable_id, secretaire_id, description, actif, annee_ouverture, date_ouverture, motif_ouverture, conditions_ouverture, date_fermeture, motif_fermeture, valide_par_president, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6920 (class 0 OID 98259)
-- Dependencies: 323
-- Data for Name: permissions_portail; Type: TABLE DATA; Schema: tenant_test; Owner: postgres
--

COPY tenant_test.permissions_portail (id, type_portail, permission_key, permission_label, actif, description, created_at, updated_at) FROM stdin;
74abad14-5879-490e-a46b-75af902d56cf	etudiant	emploi_du_temps	Consulter emploi du temps	t	Accès à l'emploi du temps personnel	2026-05-19 07:09:40.409916+00	2026-05-19 07:09:40.409916+00
84f8ab69-70fe-4768-b238-923c2585de07	etudiant	supports_cours	Télécharger supports de cours	t	Téléchargement des documents pédagogiques	2026-05-19 07:09:40.409916+00	2026-05-19 07:09:40.409916+00
f07486fb-409d-4f3a-b3e1-74b50f4c1f41	etudiant	notes	Consulter les notes	t	Consultation des notes et bulletins	2026-05-19 07:09:40.409916+00	2026-05-19 07:09:40.409916+00
d2080869-2607-4493-b009-d0968779d38b	etudiant	paiements	Suivi des paiements	t	Consultation de l'état des paiements	2026-05-19 07:09:40.409916+00	2026-05-19 07:09:40.409916+00
d1e05388-85ff-4569-8581-ce97c7d577d3	etudiant	absences	Justificatif d'absence	t	Soumission de justificatifs d'absence	2026-05-19 07:09:40.409916+00	2026-05-19 07:09:40.409916+00
a49aac72-dceb-4b18-b636-1cbed3194afa	etudiant	attestations	Télécharger attestations	t	Téléchargement d'attestations diverses	2026-05-19 07:09:40.409916+00	2026-05-19 07:09:40.409916+00
071810f7-6f62-4e25-895f-af5d9c524555	etudiant	inscription_examens	Inscription aux examens	t	Inscription en ligne aux sessions d'examens	2026-05-19 07:09:40.409916+00	2026-05-19 07:09:40.409916+00
95b6576a-6c05-4531-ad58-a2cb74326f31	etudiant	paiement_en_ligne	Paiement en ligne	t	Effectuer des paiements en ligne	2026-05-19 07:09:40.409916+00	2026-05-19 07:09:40.409916+00
3c56b250-6064-45b5-969a-42c0e6c585aa	parent	suivi_academique	Suivi académique	t	Suivi de la scolarité de l'enfant	2026-05-19 07:09:40.409916+00	2026-05-19 07:09:40.409916+00
e71daf17-6494-4912-a422-ee9c36a12337	parent	suivi_financier	Suivi financier	t	Consultation des frais et paiements	2026-05-19 07:09:40.409916+00	2026-05-19 07:09:40.409916+00
8b93a931-dcf3-4d63-85e9-8aa34427b1ee	parent	bulletins	Visualisation bulletins	t	Accès aux bulletins de notes	2026-05-19 07:09:40.409916+00	2026-05-19 07:09:40.409916+00
c731291c-2791-4ef4-a367-9b0285509a3b	parent	absences	Suivi absences/retards	t	Consultation des absences et retards	2026-05-19 07:09:40.409916+00	2026-05-19 07:09:40.409916+00
28ceef86-4ea5-4a7c-a9f8-35dbfb380763	parent	paiement_frais	Paiement frais scolarité	t	Paiement en ligne des frais	2026-05-19 07:09:40.409916+00	2026-05-19 07:09:40.409916+00
f0d04c41-8f99-41e6-b6f4-06728d3db7b6	parent	autorisation_sortie	Autorisation sortie	t	Gestion des autorisations de sortie	2026-05-19 07:09:40.409916+00	2026-05-19 07:09:40.409916+00
a0b348e3-03eb-4b20-aee8-05ce9b5c41b3	parent	messagerie	Messagerie	t	Communication avec l'administration	2026-05-19 07:09:40.409916+00	2026-05-19 07:09:40.409916+00
73666afb-eeb8-4e98-8fbe-6ddc4e6a5dfa	parent	notifications	Notifications	t	Réception de notifications	2026-05-19 07:09:40.409916+00	2026-05-19 07:09:40.409916+00
0f7e7258-0730-4cba-81da-b135ecf8072f	enseignant	publier_cours	Publier supports de cours	t	Publication de documents pédagogiques	2026-05-19 07:09:40.409916+00	2026-05-19 07:09:40.409916+00
27e4ad69-1a74-4334-9a06-98936ec7bc42	enseignant	saisie_notes	Saisie des notes	t	Saisie et modification des notes	2026-05-19 07:09:40.409916+00	2026-05-19 07:09:40.409916+00
b7965d3f-a14c-462d-8b83-21895cb527c2	enseignant	pointage_presences	Pointage présences	t	Gestion des présences étudiants	2026-05-19 07:09:40.409916+00	2026-05-19 07:09:40.409916+00
2defb5ea-5844-4c7b-bd05-6ecdb7497181	enseignant	depot_sujets	Dépôt sujets examens	t	Dépôt des sujets d'examens	2026-05-19 07:09:40.409916+00	2026-05-19 07:09:40.409916+00
06726eff-452a-4b8f-9207-eebedc9b99c9	enseignant	listes_etudiants	Consultation listes étudiants	t	Accès aux listes d'étudiants	2026-05-19 07:09:40.409916+00	2026-05-19 07:09:40.409916+00
14b39ec0-8939-40b5-abd3-25f974258948	enseignant	demande_ressources	Demande ressources	t	Demande de ressources pédagogiques	2026-05-19 07:09:40.409916+00	2026-05-19 07:09:40.409916+00
7d69255c-bf55-4d18-84f8-8d1474284e22	enseignant	messagerie_etudiants	Messagerie étudiants	t	Communication avec les étudiants	2026-05-19 07:09:40.409916+00	2026-05-19 07:09:40.409916+00
aaa0abc6-0e41-44ca-94e9-ae43391f1e4b	enseignant	signature_presence	Signature présence	t	Signature électronique de présence	2026-05-19 07:09:40.409916+00	2026-05-19 07:09:40.409916+00
\.


--
-- TOC entry 6985 (class 0 OID 100297)
-- Dependencies: 388
-- Data for Name: planning_entretien; Type: TABLE DATA; Schema: tenant_test; Owner: postgres
--

COPY tenant_test.planning_entretien (id, salle_id, batiment_id, zone, type_nettoyage, responsable_id, jour_semaine, heure_debut, duree_minutes, actif, created_at) FROM stdin;
\.


--
-- TOC entry 6989 (class 0 OID 100425)
-- Dependencies: 392
-- Data for Name: pointage_qr; Type: TABLE DATA; Schema: tenant_test; Owner: postgres
--

COPY tenant_test.pointage_qr (id, seance_id, etudiant_id, code_qr, date_generation, date_scan, scanne_par, statut, localisation_scan, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6946 (class 0 OID 99003)
-- Dependencies: 349
-- Data for Name: presence; Type: TABLE DATA; Schema: tenant_test; Owner: postgres
--

COPY tenant_test.presence (id, etudiant_id, seance_id, statut, heure_arrivee, justifie, justificatif_url, motif, mode_pointage, saisi_par, valide_par, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6990 (class 0 OID 100444)
-- Dependencies: 393
-- Data for Name: presence_surveillance; Type: TABLE DATA; Schema: tenant_test; Owner: postgres
--

COPY tenant_test.presence_surveillance (id, etudiant_id, seance_id, date_pointage, heure_arrivee, heure_depart, statut, justificatif_url, est_justifie, justifie_par, date_justification, mode_pointage, pointe_par, observations, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6988 (class 0 OID 100377)
-- Dependencies: 391
-- Data for Name: proces_verbal; Type: TABLE DATA; Schema: tenant_test; Owner: postgres
--

COPY tenant_test.proces_verbal (id, session_examen_id, parcours_id, annee_academique_id, numero, date_deliberation, membres_jury, resultats, nb_admis, nb_ajournes, nb_absents, taux_reussite, observations, fichier_url, statut, redige_par, valide_par, date_validation, transmis_a_scolarite, date_transmission_scolarite, transmis_par, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6952 (class 0 OID 99259)
-- Dependencies: 355
-- Data for Name: pv_deliberation; Type: TABLE DATA; Schema: tenant_test; Owner: postgres
--

COPY tenant_test.pv_deliberation (id, session_id, parcours_id, annee_niveau, date_deliberation, president_jury, membres_jury, statut, fichier_pv_url, hash_pv, observations, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6995 (class 0 OID 100543)
-- Dependencies: 398
-- Data for Name: rapport_conduite; Type: TABLE DATA; Schema: tenant_test; Owner: postgres
--

COPY tenant_test.rapport_conduite (id, etudiant_id, periode_debut, periode_fin, note_comportement, note_assiduite, note_discipline, nombre_absences, nombre_retards, nombre_sanctions, appreciation_generale, points_forts, points_amelioration, recommandations, redige_par, valide_par, statut, date_transmission, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6986 (class 0 OID 100324)
-- Dependencies: 389
-- Data for Name: rapport_entretien; Type: TABLE DATA; Schema: tenant_test; Owner: postgres
--

COPY tenant_test.rapport_entretien (id, planning_id, realise_par, date_realisation, heure_debut, heure_fin, statut, observations, created_at) FROM stdin;
\.


--
-- TOC entry 6949 (class 0 OID 99141)
-- Dependencies: 352
-- Data for Name: rattrapage; Type: TABLE DATA; Schema: tenant_test; Owner: postgres
--

COPY tenant_test.rattrapage (id, absence_id, salle_id, date_rattrapage, heure_debut, heure_fin, observations, statut, remplaceur_id, planifie_par, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6929 (class 0 OID 98520)
-- Dependencies: 332
-- Data for Name: recrutement; Type: TABLE DATA; Schema: tenant_test; Owner: postgres
--

COPY tenant_test.recrutement (id, poste, type_contrat, departement_id, description, competences_requises, nb_postes, date_ouverture, date_cloture, salaire_min, salaire_max, statut, responsable_id, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6987 (class 0 OID 100349)
-- Dependencies: 390
-- Data for Name: referentiel_competences; Type: TABLE DATA; Schema: tenant_test; Owner: postgres
--

COPY tenant_test.referentiel_competences (id, parcours_id, code, intitule, description, niveau, competences, valide_par, date_validation, statut, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6982 (class 0 OID 100219)
-- Dependencies: 385
-- Data for Name: reservation_salle; Type: TABLE DATA; Schema: tenant_test; Owner: postgres
--

COPY tenant_test.reservation_salle (id, salle_id, titre, description, date_reservation, heure_debut, heure_fin, demande_par, approuve_par, statut, created_at) FROM stdin;
\.


--
-- TOC entry 6953 (class 0 OID 99294)
-- Dependencies: 356
-- Data for Name: resultat_deliberation; Type: TABLE DATA; Schema: tenant_test; Owner: postgres
--

COPY tenant_test.resultat_deliberation (id, pv_id, etudiant_id, decision, credits_valides, mention_annee, passage_annee_sup, observations) FROM stdin;
\.


--
-- TOC entry 6955 (class 0 OID 99359)
-- Dependencies: 358
-- Data for Name: resultat_semestre; Type: TABLE DATA; Schema: tenant_test; Owner: postgres
--

COPY tenant_test.resultat_semestre (id, etudiant_id, inscription_id, semestre, annee_niveau, moyenne_generale, total_credits_ects, credits_acquis, credits_manquants, nombre_ues, nombre_ues_validees, statut, mention, deliberation_id, classement, effectif_promotion, date_validation, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6956 (class 0 OID 99396)
-- Dependencies: 359
-- Data for Name: resultat_ue; Type: TABLE DATA; Schema: tenant_test; Owner: postgres
--

COPY tenant_test.resultat_ue (id, etudiant_id, ue_id, resultat_semestre_id, moyenne_ue, credits_ects, credits_acquis, statut, compensation_ue_id, date_validation, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6922 (class 0 OID 98297)
-- Dependencies: 325
-- Data for Name: salle; Type: TABLE DATA; Schema: tenant_test; Owner: postgres
--

COPY tenant_test.salle (id, batiment_id, nom, code, capacite, type_salle, equipements, disponible, etage, created_at) FROM stdin;
\.


--
-- TOC entry 6971 (class 0 OID 99881)
-- Dependencies: 374
-- Data for Name: secretaire_parcours; Type: TABLE DATA; Schema: tenant_test; Owner: postgres
--

COPY tenant_test.secretaire_parcours (id, secretaire_id, parcours_id, assigned_at, assigned_by, actif, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6937 (class 0 OID 98690)
-- Dependencies: 340
-- Data for Name: session_examen; Type: TABLE DATA; Schema: tenant_test; Owner: postgres
--

COPY tenant_test.session_examen (id, annee_academique_id, libelle, type_session, semestre, date_debut, date_fin, statut, created_at) FROM stdin;
\.


--
-- TOC entry 6916 (class 0 OID 98193)
-- Dependencies: 319
-- Data for Name: session_jwt; Type: TABLE DATA; Schema: tenant_test; Owner: postgres
--

COPY tenant_test.session_jwt (id, utilisateur_id, refresh_token, ip_address, user_agent, expires_at, revoque, created_at) FROM stdin;
\.


--
-- TOC entry 6960 (class 0 OID 99552)
-- Dependencies: 363
-- Data for Name: soutenance; Type: TABLE DATA; Schema: tenant_test; Owner: postgres
--

COPY tenant_test.soutenance (id, stage_id, date_soutenance, salle_id, president_jury_id, membres_jury, duree_minutes, statut, note_finale, mention, observations, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6958 (class 0 OID 99480)
-- Dependencies: 361
-- Data for Name: stage; Type: TABLE DATA; Schema: tenant_test; Owner: postgres
--

COPY tenant_test.stage (id, etudiant_id, parcours_id, annee_academique_id, type_stage, titre, entreprise, lieu, encadrant_id, rapporteur_id, date_debut, date_fin, duree_mois, statut, note_finale, appreciation, fichier_rapport_url, date_soutenance, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6983 (class 0 OID 100253)
-- Dependencies: 386
-- Data for Name: stock; Type: TABLE DATA; Schema: tenant_test; Owner: postgres
--

COPY tenant_test.stock (id, reference, libelle, categorie, unite, quantite_stock, seuil_alerte, prix_unitaire, fournisseur, emplacement, derniere_mise_a_jour, created_at) FROM stdin;
\.


--
-- TOC entry 6993 (class 0 OID 100502)
-- Dependencies: 396
-- Data for Name: suivi_moral; Type: TABLE DATA; Schema: tenant_test; Owner: postgres
--

COPY tenant_test.suivi_moral (id, etudiant_id, date_entretien, sujet, observations, recommandations, suivi_par, parent_informe, date_information_parent, statut, prochain_rdv, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6950 (class 0 OID 99179)
-- Dependencies: 353
-- Data for Name: sujet_examen; Type: TABLE DATA; Schema: tenant_test; Owner: postgres
--

COPY tenant_test.sujet_examen (id, session_examen_id, ue_id, ec_id, enseignant_id, titre, description, fichier_url, duree_minutes, bareme_total, statut, soumis_par, date_soumission, relu_par, date_relecture, valide_par, date_validation, commentaires, motif_rejet, fichier_correction_url, date_depot_correction, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 7000 (class 0 OID 100699)
-- Dependencies: 403
-- Data for Name: suplement_diplome; Type: TABLE DATA; Schema: tenant_test; Owner: postgres
--

COPY tenant_test.suplement_diplome (id, diplome_id, etudiant_id, parcours_suivi, competences_acquises, stages_effectues, projets_realises, activites_extra, langues_maitrisees, certifications, mobilite_internationale, systeme_notation, echelle_ects, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6951 (class 0 OID 99229)
-- Dependencies: 354
-- Data for Name: support_cours; Type: TABLE DATA; Schema: tenant_test; Owner: postgres
--

COPY tenant_test.support_cours (id, titre, description, type_fichier, fichier_url, taille_fichier, ec_id, auteur_id, date_depot, partage_parcours_ids, date_partage, nb_telechargements, actif, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6981 (class 0 OID 100176)
-- Dependencies: 384
-- Data for Name: ticket_maintenance; Type: TABLE DATA; Schema: tenant_test; Owner: postgres
--

COPY tenant_test.ticket_maintenance (id, batiment_id, salle_id, titre, description, type_maintenance, priorite, statut, signale_par, assigne_a, date_signalement, date_resolution, photos_url, cout_reparation, observations, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 7001 (class 0 OID 100722)
-- Dependencies: 404
-- Data for Name: transfert_etudiant; Type: TABLE DATA; Schema: tenant_test; Owner: postgres
--

COPY tenant_test.transfert_etudiant (id, etudiant_id, parcours_origine_id, parcours_destination_id, etablissement_destination, type_transfert, motif, date_demande, statut, traite_par, date_traitement, observations, documents_fournis, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6934 (class 0 OID 98590)
-- Dependencies: 337
-- Data for Name: unite_enseignement; Type: TABLE DATA; Schema: tenant_test; Owner: postgres
--

COPY tenant_test.unite_enseignement (id, parcours_id, code, intitule, credits_ects, coefficient, volume_cm, volume_td, volume_tp, semestre, annee_niveau, type_ue, enseignant_id, actif, created_at) FROM stdin;
\.


--
-- TOC entry 6915 (class 0 OID 98170)
-- Dependencies: 318
-- Data for Name: utilisateur; Type: TABLE DATA; Schema: tenant_test; Owner: postgres
--

COPY tenant_test.utilisateur (id, email, password_hash, nom, prenom, telephone, photo_url, role, actif, email_verifie, derniere_connexion, token_reset, token_reset_expiry, password_reset_required, last_password_reset, tenant_id, parcours_assignes, created_at, updated_at) FROM stdin;
d0cd645a-3ef2-41ec-b2f1-efd13a183e09	admin@test.edu	$2a$06$8eYX4pkW8aOgafLaDX1IjOExiGNYarXH2FPGhdYS1EarweKxlhl5O	ADMIN	Système	\N	\N	admin	t	t	\N	\N	\N	f	\N	\N	[]	2026-05-19 07:09:41.538581+00	2026-05-19 07:09:41.538581+00
\.


--
-- TOC entry 6957 (class 0 OID 99434)
-- Dependencies: 360
-- Data for Name: verrouillage_notes; Type: TABLE DATA; Schema: tenant_test; Owner: postgres
--

COPY tenant_test.verrouillage_notes (id, deliberation_id, etudiant_id, session_examen_id, statut, date_verrouillage, verrouille_par, autorisation_modif, motif_autorisation, autorise_par, date_autorisation, date_fin_autorisation, historique_modifs, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 7032 (class 0 OID 0)
-- Dependencies: 333
-- Name: convention_id_seq; Type: SEQUENCE SET; Schema: tenant_test; Owner: postgres
--

SELECT pg_catalog.setval('tenant_test.convention_id_seq', 1, false);


--
-- TOC entry 7033 (class 0 OID 0)
-- Dependencies: 335
-- Name: delegation_signature_id_seq; Type: SEQUENCE SET; Schema: tenant_test; Owner: postgres
--

SELECT pg_catalog.setval('tenant_test.delegation_signature_id_seq', 1, false);


--
-- TOC entry 7034 (class 0 OID 0)
-- Dependencies: 317
-- Name: seq_recu; Type: SEQUENCE SET; Schema: tenant_test; Owner: postgres
--

SELECT pg_catalog.setval('tenant_test.seq_recu', 1, false);


--
-- TOC entry 6289 (class 2606 OID 99120)
-- Name: absence_enseignant absence_enseignant_pkey; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.absence_enseignant
    ADD CONSTRAINT absence_enseignant_pkey PRIMARY KEY (id);


--
-- TOC entry 6225 (class 2606 OID 98664)
-- Name: affectation_cours affectation_cours_pkey; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.affectation_cours
    ADD CONSTRAINT affectation_cours_pkey PRIMARY KEY (id);


--
-- TOC entry 6456 (class 2606 OID 100482)
-- Name: alerte_discipline alerte_discipline_pkey; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.alerte_discipline
    ADD CONSTRAINT alerte_discipline_pkey PRIMARY KEY (id);


--
-- TOC entry 6144 (class 2606 OID 98227)
-- Name: annee_academique annee_academique_libelle_key; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.annee_academique
    ADD CONSTRAINT annee_academique_libelle_key UNIQUE (libelle);


--
-- TOC entry 6146 (class 2606 OID 98225)
-- Name: annee_academique annee_academique_pkey; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.annee_academique
    ADD CONSTRAINT annee_academique_pkey PRIMARY KEY (id);


--
-- TOC entry 6403 (class 2606 OID 100053)
-- Name: annonce annonce_pkey; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.annonce
    ADD CONSTRAINT annonce_pkey PRIMARY KEY (id);


--
-- TOC entry 6483 (class 2606 OID 100654)
-- Name: archive_scolarite archive_scolarite_pkey; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.archive_scolarite
    ADD CONSTRAINT archive_scolarite_pkey PRIMARY KEY (id);


--
-- TOC entry 6488 (class 2606 OID 100683)
-- Name: attestation attestation_pkey; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.attestation
    ADD CONSTRAINT attestation_pkey PRIMARY KEY (id);


--
-- TOC entry 6465 (class 2606 OID 100542)
-- Name: autorisation_sortie autorisation_sortie_pkey; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.autorisation_sortie
    ADD CONSTRAINT autorisation_sortie_pkey PRIMARY KEY (id);


--
-- TOC entry 6154 (class 2606 OID 98258)
-- Name: batiment batiment_code_key; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.batiment
    ADD CONSTRAINT batiment_code_key UNIQUE (code);


--
-- TOC entry 6156 (class 2606 OID 98256)
-- Name: batiment batiment_pkey; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.batiment
    ADD CONSTRAINT batiment_pkey PRIMARY KEY (id);


--
-- TOC entry 6355 (class 2606 OID 99627)
-- Name: budget budget_pkey; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.budget
    ADD CONSTRAINT budget_pkey PRIMARY KEY (id);


--
-- TOC entry 6380 (class 2606 OID 99835)
-- Name: calendrier_academique calendrier_academique_pkey; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.calendrier_academique
    ADD CONSTRAINT calendrier_academique_pkey PRIMARY KEY (id);


--
-- TOC entry 6262 (class 2606 OID 98900)
-- Name: candidature candidature_pkey; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.candidature
    ADD CONSTRAINT candidature_pkey PRIMARY KEY (id);


--
-- TOC entry 6256 (class 2606 OID 98873)
-- Name: cloture_caisse cloture_caisse_date_cloture_caissier_id_key; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.cloture_caisse
    ADD CONSTRAINT cloture_caisse_date_cloture_caissier_id_key UNIQUE (date_cloture, caissier_id);


--
-- TOC entry 6258 (class 2606 OID 98871)
-- Name: cloture_caisse cloture_caisse_pkey; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.cloture_caisse
    ADD CONSTRAINT cloture_caisse_pkey PRIMARY KEY (id);


--
-- TOC entry 6459 (class 2606 OID 100501)
-- Name: configuration_examen configuration_examen_pkey; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.configuration_examen
    ADD CONSTRAINT configuration_examen_pkey PRIMARY KEY (id);


--
-- TOC entry 6359 (class 2606 OID 99698)
-- Name: conge_personnel conge_personnel_pkey; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.conge_personnel
    ADD CONSTRAINT conge_personnel_pkey PRIMARY KEY (id);


--
-- TOC entry 6471 (class 2606 OID 100588)
-- Name: conseil_discipline conseil_discipline_pkey; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.conseil_discipline
    ADD CONSTRAINT conseil_discipline_pkey PRIMARY KEY (id);


--
-- TOC entry 6201 (class 2606 OID 98509)
-- Name: contrat_personnel contrat_personnel_pkey; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.contrat_personnel
    ADD CONSTRAINT contrat_personnel_pkey PRIMARY KEY (id);


--
-- TOC entry 6207 (class 2606 OID 98571)
-- Name: convention convention_pkey; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.convention
    ADD CONSTRAINT convention_pkey PRIMARY KEY (id);


--
-- TOC entry 6393 (class 2606 OID 99952)
-- Name: convocation convocation_pkey; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.convocation
    ADD CONSTRAINT convocation_pkey PRIMARY KEY (id);


--
-- TOC entry 6376 (class 2606 OID 99819)
-- Name: declaration_sociale declaration_sociale_pkey; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.declaration_sociale
    ADD CONSTRAINT declaration_sociale_pkey PRIMARY KEY (id);


--
-- TOC entry 6210 (class 2606 OID 98589)
-- Name: delegation_signature delegation_signature_pkey; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.delegation_signature
    ADD CONSTRAINT delegation_signature_pkey PRIMARY KEY (id);


--
-- TOC entry 6310 (class 2606 OID 99341)
-- Name: deliberation deliberation_pkey; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.deliberation
    ADD CONSTRAINT deliberation_pkey PRIMARY KEY (id);


--
-- TOC entry 6312 (class 2606 OID 99343)
-- Name: deliberation deliberation_session_examen_id_parcours_id_semestre_annee_n_key; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.deliberation
    ADD CONSTRAINT deliberation_session_examen_id_parcours_id_semestre_annee_n_key UNIQUE (session_examen_id, parcours_id, semestre, annee_niveau);


--
-- TOC entry 6390 (class 2606 OID 99924)
-- Name: demande_etudiant demande_etudiant_pkey; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.demande_etudiant
    ADD CONSTRAINT demande_etudiant_pkey PRIMARY KEY (id);


--
-- TOC entry 6400 (class 2606 OID 100024)
-- Name: demande_ressource demande_ressource_pkey; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.demande_ressource
    ADD CONSTRAINT demande_ressource_pkey PRIMARY KEY (id);


--
-- TOC entry 6162 (class 2606 OID 98291)
-- Name: departement departement_code_key; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.departement
    ADD CONSTRAINT departement_code_key UNIQUE (code);


--
-- TOC entry 6164 (class 2606 OID 98289)
-- Name: departement departement_pkey; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.departement
    ADD CONSTRAINT departement_pkey PRIMARY KEY (id);


--
-- TOC entry 6357 (class 2606 OID 99660)
-- Name: depense depense_pkey; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.depense
    ADD CONSTRAINT depense_pkey PRIMARY KEY (id);


--
-- TOC entry 6474 (class 2606 OID 100612)
-- Name: diplome diplome_etudiant_id_type_diplome_parcours_id_key; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.diplome
    ADD CONSTRAINT diplome_etudiant_id_type_diplome_parcours_id_key UNIQUE (etudiant_id, type_diplome, parcours_id);


--
-- TOC entry 6476 (class 2606 OID 100610)
-- Name: diplome diplome_numero_diplome_key; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.diplome
    ADD CONSTRAINT diplome_numero_diplome_key UNIQUE (numero_diplome);


--
-- TOC entry 6478 (class 2606 OID 100608)
-- Name: diplome diplome_pkey; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.diplome
    ADD CONSTRAINT diplome_pkey PRIMARY KEY (id);


--
-- TOC entry 6397 (class 2606 OID 99991)
-- Name: dossier_etudiant dossier_etudiant_pkey; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.dossier_etudiant
    ADD CONSTRAINT dossier_etudiant_pkey PRIMARY KEY (id);


--
-- TOC entry 6229 (class 2606 OID 98725)
-- Name: echeancier echeancier_inscription_id_num_tranche_key; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.echeancier
    ADD CONSTRAINT echeancier_inscription_id_num_tranche_key UNIQUE (inscription_id, num_tranche);


--
-- TOC entry 6231 (class 2606 OID 98723)
-- Name: echeancier echeancier_pkey; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.echeancier
    ADD CONSTRAINT echeancier_pkey PRIMARY KEY (id);


--
-- TOC entry 6220 (class 2606 OID 98640)
-- Name: element_constitutif element_constitutif_pkey; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.element_constitutif
    ADD CONSTRAINT element_constitutif_pkey PRIMARY KEY (id);


--
-- TOC entry 6222 (class 2606 OID 98642)
-- Name: element_constitutif element_constitutif_ue_id_code_key; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.element_constitutif
    ADD CONSTRAINT element_constitutif_ue_id_code_key UNIQUE (ue_id, code);


--
-- TOC entry 6265 (class 2606 OID 98927)
-- Name: emploi_du_temps emploi_du_temps_pkey; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.emploi_du_temps
    ADD CONSTRAINT emploi_du_temps_pkey PRIMARY KEY (id);


--
-- TOC entry 6175 (class 2606 OID 98379)
-- Name: enseignant enseignant_matricule_key; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.enseignant
    ADD CONSTRAINT enseignant_matricule_key UNIQUE (matricule);


--
-- TOC entry 6177 (class 2606 OID 98375)
-- Name: enseignant enseignant_pkey; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.enseignant
    ADD CONSTRAINT enseignant_pkey PRIMARY KEY (id);


--
-- TOC entry 6179 (class 2606 OID 98377)
-- Name: enseignant enseignant_utilisateur_id_key; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.enseignant
    ADD CONSTRAINT enseignant_utilisateur_id_key UNIQUE (utilisateur_id);


--
-- TOC entry 6181 (class 2606 OID 98411)
-- Name: etudiant etudiant_matricule_key; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.etudiant
    ADD CONSTRAINT etudiant_matricule_key UNIQUE (matricule);


--
-- TOC entry 6183 (class 2606 OID 98407)
-- Name: etudiant etudiant_pkey; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.etudiant
    ADD CONSTRAINT etudiant_pkey PRIMARY KEY (id);


--
-- TOC entry 6185 (class 2606 OID 98409)
-- Name: etudiant etudiant_utilisateur_id_key; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.etudiant
    ADD CONSTRAINT etudiant_utilisateur_id_key UNIQUE (utilisateur_id);


--
-- TOC entry 6370 (class 2606 OID 99785)
-- Name: evaluation_personnel evaluation_personnel_pkey; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.evaluation_personnel
    ADD CONSTRAINT evaluation_personnel_pkey PRIMARY KEY (id);


--
-- TOC entry 6372 (class 2606 OID 99787)
-- Name: evaluation_personnel evaluation_personnel_utilisateur_id_annee_evaluation_key; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.evaluation_personnel
    ADD CONSTRAINT evaluation_personnel_utilisateur_id_annee_evaluation_key UNIQUE (utilisateur_id, annee_evaluation);


--
-- TOC entry 6350 (class 2606 OID 99600)
-- Name: evaluation_soutenance evaluation_soutenance_pkey; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.evaluation_soutenance
    ADD CONSTRAINT evaluation_soutenance_pkey PRIMARY KEY (id);


--
-- TOC entry 6352 (class 2606 OID 99602)
-- Name: evaluation_soutenance evaluation_soutenance_soutenance_id_evaluateur_id_key; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.evaluation_soutenance
    ADD CONSTRAINT evaluation_soutenance_soutenance_id_evaluateur_id_key UNIQUE (soutenance_id, evaluateur_id);


--
-- TOC entry 6362 (class 2606 OID 99733)
-- Name: fiche_paie fiche_paie_contrat_id_annee_mois_key; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.fiche_paie
    ADD CONSTRAINT fiche_paie_contrat_id_annee_mois_key UNIQUE (contrat_id, annee, mois);


--
-- TOC entry 6364 (class 2606 OID 99731)
-- Name: fiche_paie fiche_paie_pkey; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.fiche_paie
    ADD CONSTRAINT fiche_paie_pkey PRIMARY KEY (id);


--
-- TOC entry 6343 (class 2606 OID 99541)
-- Name: fiche_suivi_stage fiche_suivi_stage_pkey; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.fiche_suivi_stage
    ADD CONSTRAINT fiche_suivi_stage_pkey PRIMARY KEY (id);


--
-- TOC entry 6250 (class 2606 OID 98829)
-- Name: frais_inscription frais_inscription_parcours_id_annee_academique_id_key; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.frais_inscription
    ADD CONSTRAINT frais_inscription_parcours_id_annee_academique_id_key UNIQUE (parcours_id, annee_academique_id);


--
-- TOC entry 6252 (class 2606 OID 98827)
-- Name: frais_inscription frais_inscription_pkey; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.frais_inscription
    ADD CONSTRAINT frais_inscription_pkey PRIMARY KEY (id);


--
-- TOC entry 6189 (class 2606 OID 98435)
-- Name: grille_tarifaire grille_tarifaire_parcours_id_annee_academique_id_annee_nive_key; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.grille_tarifaire
    ADD CONSTRAINT grille_tarifaire_parcours_id_annee_academique_id_annee_nive_key UNIQUE (parcours_id, annee_academique_id, annee_niveau);


--
-- TOC entry 6191 (class 2606 OID 98433)
-- Name: grille_tarifaire grille_tarifaire_pkey; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.grille_tarifaire
    ADD CONSTRAINT grille_tarifaire_pkey PRIMARY KEY (id);


--
-- TOC entry 6367 (class 2606 OID 99757)
-- Name: heure_complementaire heure_complementaire_pkey; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.heure_complementaire
    ADD CONSTRAINT heure_complementaire_pkey PRIMARY KEY (id);


--
-- TOC entry 6382 (class 2606 OID 99865)
-- Name: incident_disciplinaire incident_disciplinaire_pkey; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.incident_disciplinaire
    ADD CONSTRAINT incident_disciplinaire_pkey PRIMARY KEY (id);


--
-- TOC entry 6195 (class 2606 OID 98472)
-- Name: inscription inscription_etudiant_id_parcours_id_annee_academique_id_key; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.inscription
    ADD CONSTRAINT inscription_etudiant_id_parcours_id_annee_academique_id_key UNIQUE (etudiant_id, parcours_id, annee_academique_id);


--
-- TOC entry 6197 (class 2606 OID 98470)
-- Name: inscription inscription_numero_carte_key; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.inscription
    ADD CONSTRAINT inscription_numero_carte_key UNIQUE (numero_carte);


--
-- TOC entry 6199 (class 2606 OID 98468)
-- Name: inscription inscription_pkey; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.inscription
    ADD CONSTRAINT inscription_pkey PRIMARY KEY (id);


--
-- TOC entry 6417 (class 2606 OID 100165)
-- Name: message_destinataire message_destinataire_message_id_etudiant_id_key; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.message_destinataire
    ADD CONSTRAINT message_destinataire_message_id_etudiant_id_key UNIQUE (message_id, etudiant_id);


--
-- TOC entry 6419 (class 2606 OID 100163)
-- Name: message_destinataire message_destinataire_pkey; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.message_destinataire
    ADD CONSTRAINT message_destinataire_pkey PRIMARY KEY (id);


--
-- TOC entry 6413 (class 2606 OID 100133)
-- Name: message_enseignant message_enseignant_pkey; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.message_enseignant
    ADD CONSTRAINT message_enseignant_pkey PRIMARY KEY (id);


--
-- TOC entry 6409 (class 2606 OID 100098)
-- Name: message message_pkey; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.message
    ADD CONSTRAINT message_pkey PRIMARY KEY (id);


--
-- TOC entry 6431 (class 2606 OID 100286)
-- Name: mouvement_stock mouvement_stock_pkey; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.mouvement_stock
    ADD CONSTRAINT mouvement_stock_pkey PRIMARY KEY (id);


--
-- TOC entry 6150 (class 2606 OID 98245)
-- Name: niveau_etude niveau_etude_code_key; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.niveau_etude
    ADD CONSTRAINT niveau_etude_code_key UNIQUE (code);


--
-- TOC entry 6152 (class 2606 OID 98243)
-- Name: niveau_etude niveau_etude_pkey; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.niveau_etude
    ADD CONSTRAINT niveau_etude_pkey PRIMARY KEY (id);


--
-- TOC entry 6287 (class 2606 OID 99066)
-- Name: note_derogatoire note_derogatoire_pkey; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.note_derogatoire
    ADD CONSTRAINT note_derogatoire_pkey PRIMARY KEY (id);


--
-- TOC entry 6275 (class 2606 OID 98972)
-- Name: note note_etudiant_id_ec_id_session_id_key; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.note
    ADD CONSTRAINT note_etudiant_id_ec_id_session_id_key UNIQUE (etudiant_id, ec_id, session_id);


--
-- TOC entry 6277 (class 2606 OID 98970)
-- Name: note note_pkey; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.note
    ADD CONSTRAINT note_pkey PRIMARY KEY (id);


--
-- TOC entry 6407 (class 2606 OID 100079)
-- Name: notification notification_pkey; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.notification
    ADD CONSTRAINT notification_pkey PRIMARY KEY (id);


--
-- TOC entry 6246 (class 2606 OID 98791)
-- Name: paiement_inscription paiement_inscription_pkey; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.paiement_inscription
    ADD CONSTRAINT paiement_inscription_pkey PRIMARY KEY (id);


--
-- TOC entry 6248 (class 2606 OID 98793)
-- Name: paiement_inscription paiement_inscription_reference_paiement_key; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.paiement_inscription
    ADD CONSTRAINT paiement_inscription_reference_paiement_key UNIQUE (reference_paiement);


--
-- TOC entry 6237 (class 2606 OID 98754)
-- Name: paiement paiement_numero_recu_key; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.paiement
    ADD CONSTRAINT paiement_numero_recu_key UNIQUE (numero_recu);


--
-- TOC entry 6239 (class 2606 OID 98750)
-- Name: paiement paiement_pkey; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.paiement
    ADD CONSTRAINT paiement_pkey PRIMARY KEY (id);


--
-- TOC entry 6241 (class 2606 OID 98752)
-- Name: paiement paiement_reference_key; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.paiement
    ADD CONSTRAINT paiement_reference_key UNIQUE (reference);


--
-- TOC entry 6171 (class 2606 OID 98342)
-- Name: parcours parcours_code_key; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.parcours
    ADD CONSTRAINT parcours_code_key UNIQUE (code);


--
-- TOC entry 6173 (class 2606 OID 98340)
-- Name: parcours parcours_pkey; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.parcours
    ADD CONSTRAINT parcours_pkey PRIMARY KEY (id);


--
-- TOC entry 6158 (class 2606 OID 98274)
-- Name: permissions_portail permissions_portail_pkey; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.permissions_portail
    ADD CONSTRAINT permissions_portail_pkey PRIMARY KEY (id);


--
-- TOC entry 6160 (class 2606 OID 98276)
-- Name: permissions_portail permissions_portail_type_portail_permission_key_key; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.permissions_portail
    ADD CONSTRAINT permissions_portail_type_portail_permission_key_key UNIQUE (type_portail, permission_key);


--
-- TOC entry 6433 (class 2606 OID 100308)
-- Name: planning_entretien planning_entretien_pkey; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.planning_entretien
    ADD CONSTRAINT planning_entretien_pkey PRIMARY KEY (id);


--
-- TOC entry 6448 (class 2606 OID 100443)
-- Name: pointage_qr pointage_qr_code_qr_key; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.pointage_qr
    ADD CONSTRAINT pointage_qr_code_qr_key UNIQUE (code_qr);


--
-- TOC entry 6450 (class 2606 OID 100441)
-- Name: pointage_qr pointage_qr_pkey; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.pointage_qr
    ADD CONSTRAINT pointage_qr_pkey PRIMARY KEY (id);


--
-- TOC entry 6282 (class 2606 OID 99023)
-- Name: presence presence_etudiant_id_seance_id_key; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.presence
    ADD CONSTRAINT presence_etudiant_id_seance_id_key UNIQUE (etudiant_id, seance_id);


--
-- TOC entry 6284 (class 2606 OID 99021)
-- Name: presence presence_pkey; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.presence
    ADD CONSTRAINT presence_pkey PRIMARY KEY (id);


--
-- TOC entry 6454 (class 2606 OID 100463)
-- Name: presence_surveillance presence_surveillance_pkey; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.presence_surveillance
    ADD CONSTRAINT presence_surveillance_pkey PRIMARY KEY (id);


--
-- TOC entry 6442 (class 2606 OID 100404)
-- Name: proces_verbal proces_verbal_numero_key; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.proces_verbal
    ADD CONSTRAINT proces_verbal_numero_key UNIQUE (numero);


--
-- TOC entry 6444 (class 2606 OID 100402)
-- Name: proces_verbal proces_verbal_pkey; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.proces_verbal
    ADD CONSTRAINT proces_verbal_pkey PRIMARY KEY (id);


--
-- TOC entry 6304 (class 2606 OID 99278)
-- Name: pv_deliberation pv_deliberation_pkey; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.pv_deliberation
    ADD CONSTRAINT pv_deliberation_pkey PRIMARY KEY (id);


--
-- TOC entry 6469 (class 2606 OID 100566)
-- Name: rapport_conduite rapport_conduite_pkey; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.rapport_conduite
    ADD CONSTRAINT rapport_conduite_pkey PRIMARY KEY (id);


--
-- TOC entry 6435 (class 2606 OID 100338)
-- Name: rapport_entretien rapport_entretien_pkey; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.rapport_entretien
    ADD CONSTRAINT rapport_entretien_pkey PRIMARY KEY (id);


--
-- TOC entry 6294 (class 2606 OID 99158)
-- Name: rattrapage rattrapage_pkey; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.rattrapage
    ADD CONSTRAINT rattrapage_pkey PRIMARY KEY (id);


--
-- TOC entry 6205 (class 2606 OID 98539)
-- Name: recrutement recrutement_pkey; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.recrutement
    ADD CONSTRAINT recrutement_pkey PRIMARY KEY (id);


--
-- TOC entry 6438 (class 2606 OID 100366)
-- Name: referentiel_competences referentiel_competences_pkey; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.referentiel_competences
    ADD CONSTRAINT referentiel_competences_pkey PRIMARY KEY (id);


--
-- TOC entry 6424 (class 2606 OID 100237)
-- Name: reservation_salle reservation_salle_pkey; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.reservation_salle
    ADD CONSTRAINT reservation_salle_pkey PRIMARY KEY (id);


--
-- TOC entry 6306 (class 2606 OID 99308)
-- Name: resultat_deliberation resultat_deliberation_pkey; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.resultat_deliberation
    ADD CONSTRAINT resultat_deliberation_pkey PRIMARY KEY (id);


--
-- TOC entry 6308 (class 2606 OID 99310)
-- Name: resultat_deliberation resultat_deliberation_pv_id_etudiant_id_key; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.resultat_deliberation
    ADD CONSTRAINT resultat_deliberation_pv_id_etudiant_id_key UNIQUE (pv_id, etudiant_id);


--
-- TOC entry 6321 (class 2606 OID 99380)
-- Name: resultat_semestre resultat_semestre_etudiant_id_inscription_id_semestre_annee_key; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.resultat_semestre
    ADD CONSTRAINT resultat_semestre_etudiant_id_inscription_id_semestre_annee_key UNIQUE (etudiant_id, inscription_id, semestre, annee_niveau);


--
-- TOC entry 6323 (class 2606 OID 99378)
-- Name: resultat_semestre resultat_semestre_pkey; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.resultat_semestre
    ADD CONSTRAINT resultat_semestre_pkey PRIMARY KEY (id);


--
-- TOC entry 6328 (class 2606 OID 99413)
-- Name: resultat_ue resultat_ue_etudiant_id_ue_id_resultat_semestre_id_key; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.resultat_ue
    ADD CONSTRAINT resultat_ue_etudiant_id_ue_id_resultat_semestre_id_key UNIQUE (etudiant_id, ue_id, resultat_semestre_id);


--
-- TOC entry 6330 (class 2606 OID 99411)
-- Name: resultat_ue resultat_ue_pkey; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.resultat_ue
    ADD CONSTRAINT resultat_ue_pkey PRIMARY KEY (id);


--
-- TOC entry 6166 (class 2606 OID 98316)
-- Name: salle salle_code_key; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.salle
    ADD CONSTRAINT salle_code_key UNIQUE (code);


--
-- TOC entry 6168 (class 2606 OID 98314)
-- Name: salle salle_pkey; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.salle
    ADD CONSTRAINT salle_pkey PRIMARY KEY (id);


--
-- TOC entry 6386 (class 2606 OID 99893)
-- Name: secretaire_parcours secretaire_parcours_pkey; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.secretaire_parcours
    ADD CONSTRAINT secretaire_parcours_pkey PRIMARY KEY (id);


--
-- TOC entry 6388 (class 2606 OID 99895)
-- Name: secretaire_parcours secretaire_parcours_secretaire_id_parcours_id_actif_key; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.secretaire_parcours
    ADD CONSTRAINT secretaire_parcours_secretaire_id_parcours_id_actif_key UNIQUE (secretaire_id, parcours_id, actif);


--
-- TOC entry 6227 (class 2606 OID 98705)
-- Name: session_examen session_examen_pkey; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.session_examen
    ADD CONSTRAINT session_examen_pkey PRIMARY KEY (id);


--
-- TOC entry 6140 (class 2606 OID 98206)
-- Name: session_jwt session_jwt_pkey; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.session_jwt
    ADD CONSTRAINT session_jwt_pkey PRIMARY KEY (id);


--
-- TOC entry 6142 (class 2606 OID 98208)
-- Name: session_jwt session_jwt_refresh_token_key; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.session_jwt
    ADD CONSTRAINT session_jwt_refresh_token_key UNIQUE (refresh_token);


--
-- TOC entry 6346 (class 2606 OID 99569)
-- Name: soutenance soutenance_pkey; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.soutenance
    ADD CONSTRAINT soutenance_pkey PRIMARY KEY (id);


--
-- TOC entry 6348 (class 2606 OID 99571)
-- Name: soutenance soutenance_stage_id_key; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.soutenance
    ADD CONSTRAINT soutenance_stage_id_key UNIQUE (stage_id);


--
-- TOC entry 6341 (class 2606 OID 99501)
-- Name: stage stage_pkey; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.stage
    ADD CONSTRAINT stage_pkey PRIMARY KEY (id);


--
-- TOC entry 6427 (class 2606 OID 100272)
-- Name: stock stock_pkey; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.stock
    ADD CONSTRAINT stock_pkey PRIMARY KEY (id);


--
-- TOC entry 6429 (class 2606 OID 100274)
-- Name: stock stock_reference_key; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.stock
    ADD CONSTRAINT stock_reference_key UNIQUE (reference);


--
-- TOC entry 6463 (class 2606 OID 100520)
-- Name: suivi_moral suivi_moral_pkey; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.suivi_moral
    ADD CONSTRAINT suivi_moral_pkey PRIMARY KEY (id);


--
-- TOC entry 6298 (class 2606 OID 99198)
-- Name: sujet_examen sujet_examen_pkey; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.sujet_examen
    ADD CONSTRAINT sujet_examen_pkey PRIMARY KEY (id);


--
-- TOC entry 6492 (class 2606 OID 100711)
-- Name: suplement_diplome suplement_diplome_pkey; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.suplement_diplome
    ADD CONSTRAINT suplement_diplome_pkey PRIMARY KEY (id);


--
-- TOC entry 6302 (class 2606 OID 99248)
-- Name: support_cours support_cours_pkey; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.support_cours
    ADD CONSTRAINT support_cours_pkey PRIMARY KEY (id);


--
-- TOC entry 6422 (class 2606 OID 100198)
-- Name: ticket_maintenance ticket_maintenance_pkey; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.ticket_maintenance
    ADD CONSTRAINT ticket_maintenance_pkey PRIMARY KEY (id);


--
-- TOC entry 6496 (class 2606 OID 100739)
-- Name: transfert_etudiant transfert_etudiant_pkey; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.transfert_etudiant
    ADD CONSTRAINT transfert_etudiant_pkey PRIMARY KEY (id);


--
-- TOC entry 6216 (class 2606 OID 98616)
-- Name: unite_enseignement unite_enseignement_parcours_id_code_key; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.unite_enseignement
    ADD CONSTRAINT unite_enseignement_parcours_id_code_key UNIQUE (parcours_id, code);


--
-- TOC entry 6218 (class 2606 OID 98614)
-- Name: unite_enseignement unite_enseignement_pkey; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.unite_enseignement
    ADD CONSTRAINT unite_enseignement_pkey PRIMARY KEY (id);


--
-- TOC entry 6134 (class 2606 OID 98192)
-- Name: utilisateur utilisateur_email_key; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.utilisateur
    ADD CONSTRAINT utilisateur_email_key UNIQUE (email);


--
-- TOC entry 6136 (class 2606 OID 98190)
-- Name: utilisateur utilisateur_pkey; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.utilisateur
    ADD CONSTRAINT utilisateur_pkey PRIMARY KEY (id);


--
-- TOC entry 6335 (class 2606 OID 99454)
-- Name: verrouillage_notes verrouillage_notes_deliberation_id_etudiant_id_session_exam_key; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.verrouillage_notes
    ADD CONSTRAINT verrouillage_notes_deliberation_id_etudiant_id_session_exam_key UNIQUE (deliberation_id, etudiant_id, session_examen_id);


--
-- TOC entry 6337 (class 2606 OID 99452)
-- Name: verrouillage_notes verrouillage_notes_pkey; Type: CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.verrouillage_notes
    ADD CONSTRAINT verrouillage_notes_pkey PRIMARY KEY (id);


--
-- TOC entry 6290 (class 1259 OID 100812)
-- Name: idx_absence_date; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_absence_date ON tenant_test.absence_enseignant USING btree (date_absence);


--
-- TOC entry 6291 (class 1259 OID 100811)
-- Name: idx_absence_enseignant; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_absence_enseignant ON tenant_test.absence_enseignant USING btree (enseignant_id);


--
-- TOC entry 6457 (class 1259 OID 100848)
-- Name: idx_alerte_discipline_etudiant; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_alerte_discipline_etudiant ON tenant_test.alerte_discipline USING btree (etudiant_id);


--
-- TOC entry 6404 (class 1259 OID 100798)
-- Name: idx_annonce_publie; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_annonce_publie ON tenant_test.annonce USING btree (publie, date_publication);


--
-- TOC entry 6484 (class 1259 OID 100964)
-- Name: idx_archive_annee; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_archive_annee ON tenant_test.archive_scolarite USING btree (annee_academique);


--
-- TOC entry 6485 (class 1259 OID 100838)
-- Name: idx_archive_etudiant; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_archive_etudiant ON tenant_test.archive_scolarite USING btree (etudiant_id);


--
-- TOC entry 6486 (class 1259 OID 100963)
-- Name: idx_archive_type; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_archive_type ON tenant_test.archive_scolarite USING btree (type_document);


--
-- TOC entry 6489 (class 1259 OID 100839)
-- Name: idx_attestation_etudiant; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_attestation_etudiant ON tenant_test.attestation USING btree (etudiant_id);


--
-- TOC entry 6466 (class 1259 OID 100851)
-- Name: idx_autorisation_etudiant; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_autorisation_etudiant ON tenant_test.autorisation_sortie USING btree (etudiant_id);


--
-- TOC entry 6263 (class 1259 OID 100810)
-- Name: idx_candidature_recrutement; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_candidature_recrutement ON tenant_test.candidature USING btree (recrutement_id);


--
-- TOC entry 6259 (class 1259 OID 100794)
-- Name: idx_cloture_caisse_caissier; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_cloture_caisse_caissier ON tenant_test.cloture_caisse USING btree (caissier_id);


--
-- TOC entry 6260 (class 1259 OID 100793)
-- Name: idx_cloture_caisse_date; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_cloture_caisse_date ON tenant_test.cloture_caisse USING btree (date_cloture);


--
-- TOC entry 6460 (class 1259 OID 100849)
-- Name: idx_configuration_examen_session; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_configuration_examen_session ON tenant_test.configuration_examen USING btree (session_examen_id);


--
-- TOC entry 6360 (class 1259 OID 100802)
-- Name: idx_conge_personnel_utilisateur; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_conge_personnel_utilisateur ON tenant_test.conge_personnel USING btree (utilisateur_id);


--
-- TOC entry 6472 (class 1259 OID 100853)
-- Name: idx_conseil_discipline_etudiant; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_conseil_discipline_etudiant ON tenant_test.conseil_discipline USING btree (etudiant_id);


--
-- TOC entry 6202 (class 1259 OID 100801)
-- Name: idx_contrat_personnel_utilisateur; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_contrat_personnel_utilisateur ON tenant_test.contrat_personnel USING btree (utilisateur_id);


--
-- TOC entry 6208 (class 1259 OID 100854)
-- Name: idx_convention_statut; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_convention_statut ON tenant_test.convention USING btree (statut);


--
-- TOC entry 6394 (class 1259 OID 100816)
-- Name: idx_convocation_etudiant; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_convocation_etudiant ON tenant_test.convocation USING btree (etudiant_id);


--
-- TOC entry 6395 (class 1259 OID 100817)
-- Name: idx_convocation_session; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_convocation_session ON tenant_test.convocation USING btree (session_examen_id);


--
-- TOC entry 6377 (class 1259 OID 100808)
-- Name: idx_decl_sociale_periode; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_decl_sociale_periode ON tenant_test.declaration_sociale USING btree (periode_debut, periode_fin);


--
-- TOC entry 6378 (class 1259 OID 100807)
-- Name: idx_decl_sociale_type; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_decl_sociale_type ON tenant_test.declaration_sociale USING btree (type_declaration);


--
-- TOC entry 6211 (class 1259 OID 100856)
-- Name: idx_delegation_dates; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_delegation_dates ON tenant_test.delegation_signature USING btree (date_debut, date_fin);


--
-- TOC entry 6212 (class 1259 OID 100855)
-- Name: idx_delegation_delegataire; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_delegation_delegataire ON tenant_test.delegation_signature USING btree (delegataire_id);


--
-- TOC entry 6313 (class 1259 OID 100824)
-- Name: idx_deliberation_parcours; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_deliberation_parcours ON tenant_test.deliberation USING btree (parcours_id);


--
-- TOC entry 6314 (class 1259 OID 100960)
-- Name: idx_deliberation_session; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_deliberation_session ON tenant_test.deliberation USING btree (session_examen_id);


--
-- TOC entry 6315 (class 1259 OID 100961)
-- Name: idx_deliberation_statut; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_deliberation_statut ON tenant_test.deliberation USING btree (statut);


--
-- TOC entry 6391 (class 1259 OID 100815)
-- Name: idx_demande_etudiant; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_demande_etudiant ON tenant_test.demande_etudiant USING btree (etudiant_id);


--
-- TOC entry 6401 (class 1259 OID 100837)
-- Name: idx_demande_ressource_demandeur; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_demande_ressource_demandeur ON tenant_test.demande_ressource USING btree (demandeur_id);


--
-- TOC entry 6414 (class 1259 OID 100860)
-- Name: idx_destinataire_etudiant; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_destinataire_etudiant ON tenant_test.message_destinataire USING btree (etudiant_id);


--
-- TOC entry 6415 (class 1259 OID 100859)
-- Name: idx_destinataire_message; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_destinataire_message ON tenant_test.message_destinataire USING btree (message_id);


--
-- TOC entry 6479 (class 1259 OID 100840)
-- Name: idx_diplome_etudiant; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_diplome_etudiant ON tenant_test.diplome USING btree (etudiant_id);


--
-- TOC entry 6480 (class 1259 OID 100841)
-- Name: idx_diplome_numero; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_diplome_numero ON tenant_test.diplome USING btree (numero_diplome);


--
-- TOC entry 6481 (class 1259 OID 100959)
-- Name: idx_diplome_parcours; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_diplome_parcours ON tenant_test.diplome USING btree (parcours_id);


--
-- TOC entry 6398 (class 1259 OID 100818)
-- Name: idx_dossier_etudiant_id; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_dossier_etudiant_id ON tenant_test.dossier_etudiant USING btree (etudiant_id);


--
-- TOC entry 6232 (class 1259 OID 100789)
-- Name: idx_echeancier_statut; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_echeancier_statut ON tenant_test.echeancier USING btree (statut);


--
-- TOC entry 6266 (class 1259 OID 100785)
-- Name: idx_edt_affectation; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_edt_affectation ON tenant_test.emploi_du_temps USING btree (affectation_id);


--
-- TOC entry 6267 (class 1259 OID 100784)
-- Name: idx_edt_salle; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_edt_salle ON tenant_test.emploi_du_temps USING btree (salle_id);


--
-- TOC entry 6223 (class 1259 OID 100770)
-- Name: idx_element_constitutif_ue; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_element_constitutif_ue ON tenant_test.element_constitutif USING btree (ue_id);


--
-- TOC entry 6268 (class 1259 OID 100783)
-- Name: idx_emploi_du_temps_date; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_emploi_du_temps_date ON tenant_test.emploi_du_temps USING btree (date_seance);


--
-- TOC entry 6186 (class 1259 OID 100771)
-- Name: idx_etudiant_matricule; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_etudiant_matricule ON tenant_test.etudiant USING btree (matricule);


--
-- TOC entry 6187 (class 1259 OID 100772)
-- Name: idx_etudiant_nom; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_etudiant_nom ON tenant_test.etudiant USING btree (nom, prenom);


--
-- TOC entry 6373 (class 1259 OID 100806)
-- Name: idx_eval_annee; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_eval_annee ON tenant_test.evaluation_personnel USING btree (annee_evaluation);


--
-- TOC entry 6374 (class 1259 OID 100805)
-- Name: idx_eval_utilisateur; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_eval_utilisateur ON tenant_test.evaluation_personnel USING btree (utilisateur_id);


--
-- TOC entry 6353 (class 1259 OID 100836)
-- Name: idx_evaluation_soutenance; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_evaluation_soutenance ON tenant_test.evaluation_soutenance USING btree (soutenance_id);


--
-- TOC entry 6365 (class 1259 OID 100803)
-- Name: idx_fiche_paie_contrat; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_fiche_paie_contrat ON tenant_test.fiche_paie USING btree (contrat_id);


--
-- TOC entry 6253 (class 1259 OID 100796)
-- Name: idx_frais_inscription_annee_academique; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_frais_inscription_annee_academique ON tenant_test.frais_inscription USING btree (annee_academique_id);


--
-- TOC entry 6254 (class 1259 OID 100795)
-- Name: idx_frais_inscription_parcours; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_frais_inscription_parcours ON tenant_test.frais_inscription USING btree (parcours_id);


--
-- TOC entry 6368 (class 1259 OID 100804)
-- Name: idx_heure_comp_enseignant; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_heure_comp_enseignant ON tenant_test.heure_complementaire USING btree (enseignant_id);


--
-- TOC entry 6192 (class 1259 OID 100773)
-- Name: idx_inscription_etudiant; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_inscription_etudiant ON tenant_test.inscription USING btree (etudiant_id);


--
-- TOC entry 6193 (class 1259 OID 100774)
-- Name: idx_inscription_parcours_annee; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_inscription_parcours_annee ON tenant_test.inscription USING btree (parcours_id, annee_academique_id);


--
-- TOC entry 6410 (class 1259 OID 100858)
-- Name: idx_message_date; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_message_date ON tenant_test.message_enseignant USING btree (date_envoi);


--
-- TOC entry 6411 (class 1259 OID 100857)
-- Name: idx_message_enseignant_id; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_message_enseignant_id ON tenant_test.message_enseignant USING btree (enseignant_id);


--
-- TOC entry 6147 (class 1259 OID 100764)
-- Name: idx_niveau_etude_code; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_niveau_etude_code ON tenant_test.niveau_etude USING btree (code);


--
-- TOC entry 6148 (class 1259 OID 100763)
-- Name: idx_niveau_etude_ordre; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_niveau_etude_ordre ON tenant_test.niveau_etude USING btree (ordre) WHERE (actif = true);


--
-- TOC entry 6285 (class 1259 OID 100814)
-- Name: idx_note_derog_etudiant; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_note_derog_etudiant ON tenant_test.note_derogatoire USING btree (etudiant_id);


--
-- TOC entry 6269 (class 1259 OID 100778)
-- Name: idx_note_ec; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_note_ec ON tenant_test.note USING btree (ec_id);


--
-- TOC entry 6270 (class 1259 OID 100775)
-- Name: idx_note_etudiant; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_note_etudiant ON tenant_test.note USING btree (etudiant_id);


--
-- TOC entry 6271 (class 1259 OID 100776)
-- Name: idx_note_session; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_note_session ON tenant_test.note USING btree (session_id);


--
-- TOC entry 6272 (class 1259 OID 100777)
-- Name: idx_note_ue; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_note_ue ON tenant_test.note USING btree (ue_id);


--
-- TOC entry 6273 (class 1259 OID 100779)
-- Name: idx_note_verrouille; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_note_verrouille ON tenant_test.note USING btree (verrouille);


--
-- TOC entry 6405 (class 1259 OID 100797)
-- Name: idx_notification_user; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_notification_user ON tenant_test.notification USING btree (utilisateur_id, lue);


--
-- TOC entry 6233 (class 1259 OID 100787)
-- Name: idx_paiement_date; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_paiement_date ON tenant_test.paiement USING btree (date_paiement);


--
-- TOC entry 6234 (class 1259 OID 100786)
-- Name: idx_paiement_inscription; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_paiement_inscription ON tenant_test.paiement USING btree (inscription_id);


--
-- TOC entry 6242 (class 1259 OID 100791)
-- Name: idx_paiement_inscription_etudiant; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_paiement_inscription_etudiant ON tenant_test.paiement_inscription USING btree (etudiant_id);


--
-- TOC entry 6243 (class 1259 OID 100790)
-- Name: idx_paiement_inscription_inscription; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_paiement_inscription_inscription ON tenant_test.paiement_inscription USING btree (inscription_id);


--
-- TOC entry 6244 (class 1259 OID 100792)
-- Name: idx_paiement_inscription_statut; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_paiement_inscription_statut ON tenant_test.paiement_inscription USING btree (statut);


--
-- TOC entry 6235 (class 1259 OID 100788)
-- Name: idx_paiement_statut; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_paiement_statut ON tenant_test.paiement USING btree (statut);


--
-- TOC entry 6169 (class 1259 OID 100765)
-- Name: idx_parcours_secretaire; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_parcours_secretaire ON tenant_test.parcours USING btree (secretaire_id);


--
-- TOC entry 6445 (class 1259 OID 100845)
-- Name: idx_pointage_qr_etudiant; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_pointage_qr_etudiant ON tenant_test.pointage_qr USING btree (etudiant_id);


--
-- TOC entry 6446 (class 1259 OID 100844)
-- Name: idx_pointage_qr_seance; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_pointage_qr_seance ON tenant_test.pointage_qr USING btree (seance_id);


--
-- TOC entry 6278 (class 1259 OID 100780)
-- Name: idx_presence_etudiant; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_presence_etudiant ON tenant_test.presence USING btree (etudiant_id);


--
-- TOC entry 6279 (class 1259 OID 100781)
-- Name: idx_presence_seance; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_presence_seance ON tenant_test.presence USING btree (seance_id);


--
-- TOC entry 6280 (class 1259 OID 100782)
-- Name: idx_presence_statut; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_presence_statut ON tenant_test.presence USING btree (statut);


--
-- TOC entry 6451 (class 1259 OID 100846)
-- Name: idx_presence_surveillance_etudiant; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_presence_surveillance_etudiant ON tenant_test.presence_surveillance USING btree (etudiant_id);


--
-- TOC entry 6452 (class 1259 OID 100847)
-- Name: idx_presence_surveillance_seance; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_presence_surveillance_seance ON tenant_test.presence_surveillance USING btree (seance_id);


--
-- TOC entry 6439 (class 1259 OID 100822)
-- Name: idx_pv_parcours; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_pv_parcours ON tenant_test.proces_verbal USING btree (parcours_id);


--
-- TOC entry 6440 (class 1259 OID 100823)
-- Name: idx_pv_session; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_pv_session ON tenant_test.proces_verbal USING btree (session_examen_id);


--
-- TOC entry 6467 (class 1259 OID 100852)
-- Name: idx_rapport_conduite_etudiant; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_rapport_conduite_etudiant ON tenant_test.rapport_conduite USING btree (etudiant_id);


--
-- TOC entry 6292 (class 1259 OID 100813)
-- Name: idx_rattrapage_absence; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_rattrapage_absence ON tenant_test.rattrapage USING btree (absence_id);


--
-- TOC entry 6203 (class 1259 OID 100809)
-- Name: idx_recrutement_statut; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_recrutement_statut ON tenant_test.recrutement USING btree (statut);


--
-- TOC entry 6436 (class 1259 OID 100819)
-- Name: idx_referentiel_parcours; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_referentiel_parcours ON tenant_test.referentiel_competences USING btree (parcours_id);


--
-- TOC entry 6316 (class 1259 OID 100957)
-- Name: idx_resultat_semestre_deliberation; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_resultat_semestre_deliberation ON tenant_test.resultat_semestre USING btree (deliberation_id);


--
-- TOC entry 6317 (class 1259 OID 100825)
-- Name: idx_resultat_semestre_etudiant; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_resultat_semestre_etudiant ON tenant_test.resultat_semestre USING btree (etudiant_id);


--
-- TOC entry 6318 (class 1259 OID 100826)
-- Name: idx_resultat_semestre_inscription; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_resultat_semestre_inscription ON tenant_test.resultat_semestre USING btree (inscription_id);


--
-- TOC entry 6319 (class 1259 OID 100956)
-- Name: idx_resultat_semestre_statut; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_resultat_semestre_statut ON tenant_test.resultat_semestre USING btree (statut);


--
-- TOC entry 6324 (class 1259 OID 100827)
-- Name: idx_resultat_ue_etudiant; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_resultat_ue_etudiant ON tenant_test.resultat_ue USING btree (etudiant_id);


--
-- TOC entry 6325 (class 1259 OID 100958)
-- Name: idx_resultat_ue_statut; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_resultat_ue_statut ON tenant_test.resultat_ue USING btree (statut);


--
-- TOC entry 6326 (class 1259 OID 100828)
-- Name: idx_resultat_ue_ue; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_resultat_ue_ue ON tenant_test.resultat_ue USING btree (ue_id);


--
-- TOC entry 6383 (class 1259 OID 100767)
-- Name: idx_secretaire_parcours_parcours; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_secretaire_parcours_parcours ON tenant_test.secretaire_parcours USING btree (parcours_id) WHERE (actif = true);


--
-- TOC entry 6384 (class 1259 OID 100766)
-- Name: idx_secretaire_parcours_secretaire; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_secretaire_parcours_secretaire ON tenant_test.secretaire_parcours USING btree (secretaire_id) WHERE (actif = true);


--
-- TOC entry 6137 (class 1259 OID 100761)
-- Name: idx_session_jwt_token; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_session_jwt_token ON tenant_test.session_jwt USING btree (refresh_token);


--
-- TOC entry 6138 (class 1259 OID 100762)
-- Name: idx_session_jwt_user; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_session_jwt_user ON tenant_test.session_jwt USING btree (utilisateur_id);


--
-- TOC entry 6344 (class 1259 OID 100835)
-- Name: idx_soutenance_stage; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_soutenance_stage ON tenant_test.soutenance USING btree (stage_id);


--
-- TOC entry 6338 (class 1259 OID 100834)
-- Name: idx_stage_encadrant; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_stage_encadrant ON tenant_test.stage USING btree (encadrant_id);


--
-- TOC entry 6339 (class 1259 OID 100833)
-- Name: idx_stage_etudiant; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_stage_etudiant ON tenant_test.stage USING btree (etudiant_id);


--
-- TOC entry 6425 (class 1259 OID 100800)
-- Name: idx_stock_seuil; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_stock_seuil ON tenant_test.stock USING btree (quantite_stock, seuil_alerte);


--
-- TOC entry 6461 (class 1259 OID 100850)
-- Name: idx_suivi_moral_etudiant; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_suivi_moral_etudiant ON tenant_test.suivi_moral USING btree (etudiant_id);


--
-- TOC entry 6295 (class 1259 OID 100821)
-- Name: idx_sujet_enseignant; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_sujet_enseignant ON tenant_test.sujet_examen USING btree (enseignant_id);


--
-- TOC entry 6296 (class 1259 OID 100820)
-- Name: idx_sujet_session; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_sujet_session ON tenant_test.sujet_examen USING btree (session_examen_id);


--
-- TOC entry 6490 (class 1259 OID 100842)
-- Name: idx_suplement_diplome_diplome; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_suplement_diplome_diplome ON tenant_test.suplement_diplome USING btree (diplome_id);


--
-- TOC entry 6299 (class 1259 OID 100832)
-- Name: idx_support_cours_auteur; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_support_cours_auteur ON tenant_test.support_cours USING btree (auteur_id);


--
-- TOC entry 6300 (class 1259 OID 100831)
-- Name: idx_support_cours_ec; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_support_cours_ec ON tenant_test.support_cours USING btree (ec_id);


--
-- TOC entry 6420 (class 1259 OID 100799)
-- Name: idx_ticket_statut; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_ticket_statut ON tenant_test.ticket_maintenance USING btree (statut, priorite);


--
-- TOC entry 6493 (class 1259 OID 100962)
-- Name: idx_transfert_etudiant; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_transfert_etudiant ON tenant_test.transfert_etudiant USING btree (etudiant_id);


--
-- TOC entry 6494 (class 1259 OID 100843)
-- Name: idx_transfert_etudiant_etudiant; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_transfert_etudiant_etudiant ON tenant_test.transfert_etudiant USING btree (etudiant_id);


--
-- TOC entry 6213 (class 1259 OID 100769)
-- Name: idx_ue_enseignant; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_ue_enseignant ON tenant_test.unite_enseignement USING btree (enseignant_id);


--
-- TOC entry 6214 (class 1259 OID 100768)
-- Name: idx_unite_enseignement_parcours; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_unite_enseignement_parcours ON tenant_test.unite_enseignement USING btree (parcours_id);


--
-- TOC entry 6127 (class 1259 OID 100758)
-- Name: idx_utilisateur_actif; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_utilisateur_actif ON tenant_test.utilisateur USING btree (actif);


--
-- TOC entry 6128 (class 1259 OID 100755)
-- Name: idx_utilisateur_email; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_utilisateur_email ON tenant_test.utilisateur USING btree (email);


--
-- TOC entry 6129 (class 1259 OID 100760)
-- Name: idx_utilisateur_last_password_reset; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_utilisateur_last_password_reset ON tenant_test.utilisateur USING btree (last_password_reset);


--
-- TOC entry 6130 (class 1259 OID 100759)
-- Name: idx_utilisateur_password_reset; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_utilisateur_password_reset ON tenant_test.utilisateur USING btree (password_reset_required);


--
-- TOC entry 6131 (class 1259 OID 100756)
-- Name: idx_utilisateur_role; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_utilisateur_role ON tenant_test.utilisateur USING btree (role);


--
-- TOC entry 6132 (class 1259 OID 100757)
-- Name: idx_utilisateur_tenant_id; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_utilisateur_tenant_id ON tenant_test.utilisateur USING btree (tenant_id);


--
-- TOC entry 6331 (class 1259 OID 100829)
-- Name: idx_verrouillage_etudiant; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_verrouillage_etudiant ON tenant_test.verrouillage_notes USING btree (etudiant_id);


--
-- TOC entry 6332 (class 1259 OID 100830)
-- Name: idx_verrouillage_session; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_verrouillage_session ON tenant_test.verrouillage_notes USING btree (session_examen_id);


--
-- TOC entry 6333 (class 1259 OID 100965)
-- Name: idx_verrouillage_statut; Type: INDEX; Schema: tenant_test; Owner: postgres
--

CREATE INDEX idx_verrouillage_statut ON tenant_test.verrouillage_notes USING btree (statut);


--
-- TOC entry 6911 (class 2618 OID 100949)
-- Name: vue_frais_inscription_actifs _RETURN; Type: RULE; Schema: tenant_test; Owner: postgres
--

CREATE OR REPLACE VIEW tenant_test.vue_frais_inscription_actifs AS
 SELECT fi.id,
    fi.parcours_id,
    fi.annee_academique_id,
    fi.montant_inscription,
    fi.montant_scolarite,
    fi.montant_total,
    fi.description,
    fi.actif,
    fi.date_limite_paiement,
    fi.modalites_paiement,
    fi.cree_par,
    fi.modifie_par,
    fi.created_at,
    fi.updated_at,
    p.code AS parcours_code,
    p.nom AS parcours_nom,
    d.nom AS departement_nom,
    aa.libelle AS annee_academique,
    aa.date_debut AS annee_debut,
    aa.date_fin AS annee_fin,
    count(DISTINCT i.id) AS nb_inscriptions,
    COALESCE(sum(pa.montant), (0)::numeric) AS total_encaisse
   FROM (((((tenant_test.frais_inscription fi
     JOIN tenant_test.parcours p ON ((p.id = fi.parcours_id)))
     LEFT JOIN tenant_test.departement d ON ((d.id = p.departement_id)))
     JOIN tenant_test.annee_academique aa ON ((aa.id = fi.annee_academique_id)))
     LEFT JOIN tenant_test.inscription i ON (((i.parcours_id = fi.parcours_id) AND (i.annee_academique_id = fi.annee_academique_id))))
     LEFT JOIN tenant_test.paiement pa ON (((pa.inscription_id = i.id) AND ((pa.statut)::text = 'valide'::text))))
  WHERE (fi.actif = true)
  GROUP BY fi.id, p.code, p.nom, d.nom, aa.libelle, aa.date_debut, aa.date_fin;


--
-- TOC entry 6703 (class 2620 OID 100919)
-- Name: note prevent_locked_note_modification; Type: TRIGGER; Schema: tenant_test; Owner: postgres
--

CREATE TRIGGER prevent_locked_note_modification BEFORE DELETE OR UPDATE ON tenant_test.note FOR EACH ROW EXECUTE FUNCTION tenant_test.check_note_verrouillee();


--
-- TOC entry 6735 (class 2620 OID 100917)
-- Name: stock trg_alerte_stock; Type: TRIGGER; Schema: tenant_test; Owner: postgres
--

CREATE TRIGGER trg_alerte_stock AFTER INSERT OR UPDATE ON tenant_test.stock FOR EACH ROW EXECUTE FUNCTION tenant_test.trigger_alerte_stock();


--
-- TOC entry 6704 (class 2620 OID 100918)
-- Name: note trg_note_verrouille; Type: TRIGGER; Schema: tenant_test; Owner: postgres
--

CREATE TRIGGER trg_note_verrouille BEFORE UPDATE ON tenant_test.note FOR EACH ROW EXECUTE FUNCTION tenant_test.trigger_note_verrouille();


--
-- TOC entry 6698 (class 2620 OID 100916)
-- Name: paiement trg_notif_paiement; Type: TRIGGER; Schema: tenant_test; Owner: postgres
--

CREATE TRIGGER trg_notif_paiement AFTER INSERT ON tenant_test.paiement FOR EACH ROW EXECUTE FUNCTION tenant_test.trigger_notification_paiement();


--
-- TOC entry 6699 (class 2620 OID 100915)
-- Name: paiement trg_numero_recu; Type: TRIGGER; Schema: tenant_test; Owner: postgres
--

CREATE TRIGGER trg_numero_recu BEFORE INSERT ON tenant_test.paiement FOR EACH ROW EXECUTE FUNCTION tenant_test.trigger_numero_recu();


--
-- TOC entry 6708 (class 2620 OID 100879)
-- Name: absence_enseignant trg_updated_at; Type: TRIGGER; Schema: tenant_test; Owner: postgres
--

CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_test.absence_enseignant FOR EACH ROW EXECUTE FUNCTION tenant_test.trigger_set_updated_at();


--
-- TOC entry 6697 (class 2620 OID 100866)
-- Name: affectation_cours trg_updated_at; Type: TRIGGER; Schema: tenant_test; Owner: postgres
--

CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_test.affectation_cours FOR EACH ROW EXECUTE FUNCTION tenant_test.trigger_set_updated_at();


--
-- TOC entry 6740 (class 2620 OID 100899)
-- Name: alerte_discipline trg_updated_at; Type: TRIGGER; Schema: tenant_test; Owner: postgres
--

CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_test.alerte_discipline FOR EACH ROW EXECUTE FUNCTION tenant_test.trigger_set_updated_at();


--
-- TOC entry 6733 (class 2620 OID 100872)
-- Name: annonce trg_updated_at; Type: TRIGGER; Schema: tenant_test; Owner: postgres
--

CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_test.annonce FOR EACH ROW EXECUTE FUNCTION tenant_test.trigger_set_updated_at();


--
-- TOC entry 6747 (class 2620 OID 100889)
-- Name: archive_scolarite trg_updated_at; Type: TRIGGER; Schema: tenant_test; Owner: postgres
--

CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_test.archive_scolarite FOR EACH ROW EXECUTE FUNCTION tenant_test.trigger_set_updated_at();


--
-- TOC entry 6749 (class 2620 OID 100890)
-- Name: attestation trg_updated_at; Type: TRIGGER; Schema: tenant_test; Owner: postgres
--

CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_test.attestation FOR EACH ROW EXECUTE FUNCTION tenant_test.trigger_set_updated_at();


--
-- TOC entry 6743 (class 2620 OID 100902)
-- Name: autorisation_sortie trg_updated_at; Type: TRIGGER; Schema: tenant_test; Owner: postgres
--

CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_test.autorisation_sortie FOR EACH ROW EXECUTE FUNCTION tenant_test.trigger_set_updated_at();


--
-- TOC entry 6723 (class 2620 OID 100875)
-- Name: budget trg_updated_at; Type: TRIGGER; Schema: tenant_test; Owner: postgres
--

CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_test.budget FOR EACH ROW EXECUTE FUNCTION tenant_test.trigger_set_updated_at();


--
-- TOC entry 6701 (class 2620 OID 100911)
-- Name: candidature trg_updated_at; Type: TRIGGER; Schema: tenant_test; Owner: postgres
--

CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_test.candidature FOR EACH ROW EXECUTE FUNCTION tenant_test.trigger_set_updated_at();


--
-- TOC entry 6741 (class 2620 OID 100900)
-- Name: configuration_examen trg_updated_at; Type: TRIGGER; Schema: tenant_test; Owner: postgres
--

CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_test.configuration_examen FOR EACH ROW EXECUTE FUNCTION tenant_test.trigger_set_updated_at();


--
-- TOC entry 6745 (class 2620 OID 100904)
-- Name: conseil_discipline trg_updated_at; Type: TRIGGER; Schema: tenant_test; Owner: postgres
--

CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_test.conseil_discipline FOR EACH ROW EXECUTE FUNCTION tenant_test.trigger_set_updated_at();


--
-- TOC entry 6691 (class 2620 OID 100871)
-- Name: contrat_personnel trg_updated_at; Type: TRIGGER; Schema: tenant_test; Owner: postgres
--

CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_test.contrat_personnel FOR EACH ROW EXECUTE FUNCTION tenant_test.trigger_set_updated_at();


--
-- TOC entry 6693 (class 2620 OID 100905)
-- Name: convention trg_updated_at; Type: TRIGGER; Schema: tenant_test; Owner: postgres
--

CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_test.convention FOR EACH ROW EXECUTE FUNCTION tenant_test.trigger_set_updated_at();


--
-- TOC entry 6730 (class 2620 OID 100883)
-- Name: convocation trg_updated_at; Type: TRIGGER; Schema: tenant_test; Owner: postgres
--

CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_test.convocation FOR EACH ROW EXECUTE FUNCTION tenant_test.trigger_set_updated_at();


--
-- TOC entry 6727 (class 2620 OID 100908)
-- Name: declaration_sociale trg_updated_at; Type: TRIGGER; Schema: tenant_test; Owner: postgres
--

CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_test.declaration_sociale FOR EACH ROW EXECUTE FUNCTION tenant_test.trigger_set_updated_at();


--
-- TOC entry 6694 (class 2620 OID 100906)
-- Name: delegation_signature trg_updated_at; Type: TRIGGER; Schema: tenant_test; Owner: postgres
--

CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_test.delegation_signature FOR EACH ROW EXECUTE FUNCTION tenant_test.trigger_set_updated_at();


--
-- TOC entry 6713 (class 2620 OID 100893)
-- Name: deliberation trg_updated_at; Type: TRIGGER; Schema: tenant_test; Owner: postgres
--

CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_test.deliberation FOR EACH ROW EXECUTE FUNCTION tenant_test.trigger_set_updated_at();


--
-- TOC entry 6729 (class 2620 OID 100882)
-- Name: demande_etudiant trg_updated_at; Type: TRIGGER; Schema: tenant_test; Owner: postgres
--

CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_test.demande_etudiant FOR EACH ROW EXECUTE FUNCTION tenant_test.trigger_set_updated_at();


--
-- TOC entry 6732 (class 2620 OID 100888)
-- Name: demande_ressource trg_updated_at; Type: TRIGGER; Schema: tenant_test; Owner: postgres
--

CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_test.demande_ressource FOR EACH ROW EXECUTE FUNCTION tenant_test.trigger_set_updated_at();


--
-- TOC entry 6724 (class 2620 OID 100874)
-- Name: depense trg_updated_at; Type: TRIGGER; Schema: tenant_test; Owner: postgres
--

CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_test.depense FOR EACH ROW EXECUTE FUNCTION tenant_test.trigger_set_updated_at();


--
-- TOC entry 6731 (class 2620 OID 100884)
-- Name: dossier_etudiant trg_updated_at; Type: TRIGGER; Schema: tenant_test; Owner: postgres
--

CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_test.dossier_etudiant FOR EACH ROW EXECUTE FUNCTION tenant_test.trigger_set_updated_at();


--
-- TOC entry 6696 (class 2620 OID 100913)
-- Name: element_constitutif trg_updated_at; Type: TRIGGER; Schema: tenant_test; Owner: postgres
--

CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_test.element_constitutif FOR EACH ROW EXECUTE FUNCTION tenant_test.trigger_set_updated_at();


--
-- TOC entry 6702 (class 2620 OID 100867)
-- Name: emploi_du_temps trg_updated_at; Type: TRIGGER; Schema: tenant_test; Owner: postgres
--

CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_test.emploi_du_temps FOR EACH ROW EXECUTE FUNCTION tenant_test.trigger_set_updated_at();


--
-- TOC entry 6689 (class 2620 OID 100864)
-- Name: enseignant trg_updated_at; Type: TRIGGER; Schema: tenant_test; Owner: postgres
--

CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_test.enseignant FOR EACH ROW EXECUTE FUNCTION tenant_test.trigger_set_updated_at();


--
-- TOC entry 6726 (class 2620 OID 100907)
-- Name: evaluation_personnel trg_updated_at; Type: TRIGGER; Schema: tenant_test; Owner: postgres
--

CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_test.evaluation_personnel FOR EACH ROW EXECUTE FUNCTION tenant_test.trigger_set_updated_at();


--
-- TOC entry 6725 (class 2620 OID 100909)
-- Name: heure_complementaire trg_updated_at; Type: TRIGGER; Schema: tenant_test; Owner: postgres
--

CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_test.heure_complementaire FOR EACH ROW EXECUTE FUNCTION tenant_test.trigger_set_updated_at();


--
-- TOC entry 6690 (class 2620 OID 100863)
-- Name: inscription trg_updated_at; Type: TRIGGER; Schema: tenant_test; Owner: postgres
--

CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_test.inscription FOR EACH ROW EXECUTE FUNCTION tenant_test.trigger_set_updated_at();


--
-- TOC entry 6687 (class 2620 OID 100865)
-- Name: niveau_etude trg_updated_at; Type: TRIGGER; Schema: tenant_test; Owner: postgres
--

CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_test.niveau_etude FOR EACH ROW EXECUTE FUNCTION tenant_test.trigger_set_updated_at();


--
-- TOC entry 6705 (class 2620 OID 100868)
-- Name: note trg_updated_at; Type: TRIGGER; Schema: tenant_test; Owner: postgres
--

CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_test.note FOR EACH ROW EXECUTE FUNCTION tenant_test.trigger_set_updated_at();


--
-- TOC entry 6707 (class 2620 OID 100881)
-- Name: note_derogatoire trg_updated_at; Type: TRIGGER; Schema: tenant_test; Owner: postgres
--

CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_test.note_derogatoire FOR EACH ROW EXECUTE FUNCTION tenant_test.trigger_set_updated_at();


--
-- TOC entry 6688 (class 2620 OID 100862)
-- Name: parcours trg_updated_at; Type: TRIGGER; Schema: tenant_test; Owner: postgres
--

CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_test.parcours FOR EACH ROW EXECUTE FUNCTION tenant_test.trigger_set_updated_at();


--
-- TOC entry 6738 (class 2620 OID 100897)
-- Name: pointage_qr trg_updated_at; Type: TRIGGER; Schema: tenant_test; Owner: postgres
--

CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_test.pointage_qr FOR EACH ROW EXECUTE FUNCTION tenant_test.trigger_set_updated_at();


--
-- TOC entry 6706 (class 2620 OID 100873)
-- Name: presence trg_updated_at; Type: TRIGGER; Schema: tenant_test; Owner: postgres
--

CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_test.presence FOR EACH ROW EXECUTE FUNCTION tenant_test.trigger_set_updated_at();


--
-- TOC entry 6739 (class 2620 OID 100898)
-- Name: presence_surveillance trg_updated_at; Type: TRIGGER; Schema: tenant_test; Owner: postgres
--

CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_test.presence_surveillance FOR EACH ROW EXECUTE FUNCTION tenant_test.trigger_set_updated_at();


--
-- TOC entry 6737 (class 2620 OID 100878)
-- Name: proces_verbal trg_updated_at; Type: TRIGGER; Schema: tenant_test; Owner: postgres
--

CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_test.proces_verbal FOR EACH ROW EXECUTE FUNCTION tenant_test.trigger_set_updated_at();


--
-- TOC entry 6712 (class 2620 OID 100869)
-- Name: pv_deliberation trg_updated_at; Type: TRIGGER; Schema: tenant_test; Owner: postgres
--

CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_test.pv_deliberation FOR EACH ROW EXECUTE FUNCTION tenant_test.trigger_set_updated_at();


--
-- TOC entry 6744 (class 2620 OID 100903)
-- Name: rapport_conduite trg_updated_at; Type: TRIGGER; Schema: tenant_test; Owner: postgres
--

CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_test.rapport_conduite FOR EACH ROW EXECUTE FUNCTION tenant_test.trigger_set_updated_at();


--
-- TOC entry 6709 (class 2620 OID 100880)
-- Name: rattrapage trg_updated_at; Type: TRIGGER; Schema: tenant_test; Owner: postgres
--

CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_test.rattrapage FOR EACH ROW EXECUTE FUNCTION tenant_test.trigger_set_updated_at();


--
-- TOC entry 6692 (class 2620 OID 100910)
-- Name: recrutement trg_updated_at; Type: TRIGGER; Schema: tenant_test; Owner: postgres
--

CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_test.recrutement FOR EACH ROW EXECUTE FUNCTION tenant_test.trigger_set_updated_at();


--
-- TOC entry 6736 (class 2620 OID 100876)
-- Name: referentiel_competences trg_updated_at; Type: TRIGGER; Schema: tenant_test; Owner: postgres
--

CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_test.referentiel_competences FOR EACH ROW EXECUTE FUNCTION tenant_test.trigger_set_updated_at();


--
-- TOC entry 6715 (class 2620 OID 100894)
-- Name: resultat_semestre trg_updated_at; Type: TRIGGER; Schema: tenant_test; Owner: postgres
--

CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_test.resultat_semestre FOR EACH ROW EXECUTE FUNCTION tenant_test.trigger_set_updated_at();


--
-- TOC entry 6717 (class 2620 OID 100895)
-- Name: resultat_ue trg_updated_at; Type: TRIGGER; Schema: tenant_test; Owner: postgres
--

CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_test.resultat_ue FOR EACH ROW EXECUTE FUNCTION tenant_test.trigger_set_updated_at();


--
-- TOC entry 6728 (class 2620 OID 100914)
-- Name: secretaire_parcours trg_updated_at; Type: TRIGGER; Schema: tenant_test; Owner: postgres
--

CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_test.secretaire_parcours FOR EACH ROW EXECUTE FUNCTION tenant_test.trigger_set_updated_at();


--
-- TOC entry 6722 (class 2620 OID 100887)
-- Name: soutenance trg_updated_at; Type: TRIGGER; Schema: tenant_test; Owner: postgres
--

CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_test.soutenance FOR EACH ROW EXECUTE FUNCTION tenant_test.trigger_set_updated_at();


--
-- TOC entry 6721 (class 2620 OID 100886)
-- Name: stage trg_updated_at; Type: TRIGGER; Schema: tenant_test; Owner: postgres
--

CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_test.stage FOR EACH ROW EXECUTE FUNCTION tenant_test.trigger_set_updated_at();


--
-- TOC entry 6742 (class 2620 OID 100901)
-- Name: suivi_moral trg_updated_at; Type: TRIGGER; Schema: tenant_test; Owner: postgres
--

CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_test.suivi_moral FOR EACH ROW EXECUTE FUNCTION tenant_test.trigger_set_updated_at();


--
-- TOC entry 6710 (class 2620 OID 100877)
-- Name: sujet_examen trg_updated_at; Type: TRIGGER; Schema: tenant_test; Owner: postgres
--

CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_test.sujet_examen FOR EACH ROW EXECUTE FUNCTION tenant_test.trigger_set_updated_at();


--
-- TOC entry 6750 (class 2620 OID 100891)
-- Name: suplement_diplome trg_updated_at; Type: TRIGGER; Schema: tenant_test; Owner: postgres
--

CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_test.suplement_diplome FOR EACH ROW EXECUTE FUNCTION tenant_test.trigger_set_updated_at();


--
-- TOC entry 6711 (class 2620 OID 100885)
-- Name: support_cours trg_updated_at; Type: TRIGGER; Schema: tenant_test; Owner: postgres
--

CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_test.support_cours FOR EACH ROW EXECUTE FUNCTION tenant_test.trigger_set_updated_at();


--
-- TOC entry 6734 (class 2620 OID 100870)
-- Name: ticket_maintenance trg_updated_at; Type: TRIGGER; Schema: tenant_test; Owner: postgres
--

CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_test.ticket_maintenance FOR EACH ROW EXECUTE FUNCTION tenant_test.trigger_set_updated_at();


--
-- TOC entry 6752 (class 2620 OID 100892)
-- Name: transfert_etudiant trg_updated_at; Type: TRIGGER; Schema: tenant_test; Owner: postgres
--

CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_test.transfert_etudiant FOR EACH ROW EXECUTE FUNCTION tenant_test.trigger_set_updated_at();


--
-- TOC entry 6695 (class 2620 OID 100912)
-- Name: unite_enseignement trg_updated_at; Type: TRIGGER; Schema: tenant_test; Owner: postgres
--

CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_test.unite_enseignement FOR EACH ROW EXECUTE FUNCTION tenant_test.trigger_set_updated_at();


--
-- TOC entry 6686 (class 2620 OID 100861)
-- Name: utilisateur trg_updated_at; Type: TRIGGER; Schema: tenant_test; Owner: postgres
--

CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_test.utilisateur FOR EACH ROW EXECUTE FUNCTION tenant_test.trigger_set_updated_at();


--
-- TOC entry 6719 (class 2620 OID 100896)
-- Name: verrouillage_notes trg_updated_at; Type: TRIGGER; Schema: tenant_test; Owner: postgres
--

CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_test.verrouillage_notes FOR EACH ROW EXECUTE FUNCTION tenant_test.trigger_set_updated_at();


--
-- TOC entry 6700 (class 2620 OID 100920)
-- Name: paiement_inscription trigger_update_paiement_inscription_updated_at; Type: TRIGGER; Schema: tenant_test; Owner: postgres
--

CREATE TRIGGER trigger_update_paiement_inscription_updated_at BEFORE UPDATE ON tenant_test.paiement_inscription FOR EACH ROW EXECUTE FUNCTION tenant_test.update_paiement_inscription_updated_at();


--
-- TOC entry 6748 (class 2620 OID 100972)
-- Name: archive_scolarite update_archive_scolarite_updated_at; Type: TRIGGER; Schema: tenant_test; Owner: postgres
--

CREATE TRIGGER update_archive_scolarite_updated_at BEFORE UPDATE ON tenant_test.archive_scolarite FOR EACH ROW EXECUTE FUNCTION tenant_test.update_updated_at_column();


--
-- TOC entry 6714 (class 2620 OID 100966)
-- Name: deliberation update_deliberation_updated_at; Type: TRIGGER; Schema: tenant_test; Owner: postgres
--

CREATE TRIGGER update_deliberation_updated_at BEFORE UPDATE ON tenant_test.deliberation FOR EACH ROW EXECUTE FUNCTION tenant_test.update_updated_at_column();


--
-- TOC entry 6746 (class 2620 OID 100969)
-- Name: diplome update_diplome_updated_at; Type: TRIGGER; Schema: tenant_test; Owner: postgres
--

CREATE TRIGGER update_diplome_updated_at BEFORE UPDATE ON tenant_test.diplome FOR EACH ROW EXECUTE FUNCTION tenant_test.update_updated_at_column();


--
-- TOC entry 6716 (class 2620 OID 100967)
-- Name: resultat_semestre update_resultat_semestre_updated_at; Type: TRIGGER; Schema: tenant_test; Owner: postgres
--

CREATE TRIGGER update_resultat_semestre_updated_at BEFORE UPDATE ON tenant_test.resultat_semestre FOR EACH ROW EXECUTE FUNCTION tenant_test.update_updated_at_column();


--
-- TOC entry 6718 (class 2620 OID 100968)
-- Name: resultat_ue update_resultat_ue_updated_at; Type: TRIGGER; Schema: tenant_test; Owner: postgres
--

CREATE TRIGGER update_resultat_ue_updated_at BEFORE UPDATE ON tenant_test.resultat_ue FOR EACH ROW EXECUTE FUNCTION tenant_test.update_updated_at_column();


--
-- TOC entry 6751 (class 2620 OID 100970)
-- Name: suplement_diplome update_suplement_diplome_updated_at; Type: TRIGGER; Schema: tenant_test; Owner: postgres
--

CREATE TRIGGER update_suplement_diplome_updated_at BEFORE UPDATE ON tenant_test.suplement_diplome FOR EACH ROW EXECUTE FUNCTION tenant_test.update_updated_at_column();


--
-- TOC entry 6753 (class 2620 OID 100971)
-- Name: transfert_etudiant update_transfert_etudiant_updated_at; Type: TRIGGER; Schema: tenant_test; Owner: postgres
--

CREATE TRIGGER update_transfert_etudiant_updated_at BEFORE UPDATE ON tenant_test.transfert_etudiant FOR EACH ROW EXECUTE FUNCTION tenant_test.update_updated_at_column();


--
-- TOC entry 6720 (class 2620 OID 100973)
-- Name: verrouillage_notes update_verrouillage_notes_updated_at; Type: TRIGGER; Schema: tenant_test; Owner: postgres
--

CREATE TRIGGER update_verrouillage_notes_updated_at BEFORE UPDATE ON tenant_test.verrouillage_notes FOR EACH ROW EXECUTE FUNCTION tenant_test.update_updated_at_column();


--
-- TOC entry 6560 (class 2606 OID 99131)
-- Name: absence_enseignant absence_enseignant_declaree_par_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.absence_enseignant
    ADD CONSTRAINT absence_enseignant_declaree_par_fkey FOREIGN KEY (declaree_par) REFERENCES tenant_test.utilisateur(id);


--
-- TOC entry 6561 (class 2606 OID 99121)
-- Name: absence_enseignant absence_enseignant_enseignant_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.absence_enseignant
    ADD CONSTRAINT absence_enseignant_enseignant_id_fkey FOREIGN KEY (enseignant_id) REFERENCES tenant_test.enseignant(id) ON DELETE CASCADE;


--
-- TOC entry 6562 (class 2606 OID 99126)
-- Name: absence_enseignant absence_enseignant_seance_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.absence_enseignant
    ADD CONSTRAINT absence_enseignant_seance_id_fkey FOREIGN KEY (seance_id) REFERENCES tenant_test.emploi_du_temps(id) ON DELETE SET NULL;


--
-- TOC entry 6563 (class 2606 OID 99136)
-- Name: absence_enseignant absence_enseignant_validee_par_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.absence_enseignant
    ADD CONSTRAINT absence_enseignant_validee_par_fkey FOREIGN KEY (validee_par) REFERENCES tenant_test.utilisateur(id);


--
-- TOC entry 6519 (class 2606 OID 98680)
-- Name: affectation_cours affectation_cours_annee_academique_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.affectation_cours
    ADD CONSTRAINT affectation_cours_annee_academique_id_fkey FOREIGN KEY (annee_academique_id) REFERENCES tenant_test.annee_academique(id);


--
-- TOC entry 6520 (class 2606 OID 98675)
-- Name: affectation_cours affectation_cours_ec_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.affectation_cours
    ADD CONSTRAINT affectation_cours_ec_id_fkey FOREIGN KEY (ec_id) REFERENCES tenant_test.element_constitutif(id) ON DELETE CASCADE;


--
-- TOC entry 6521 (class 2606 OID 98665)
-- Name: affectation_cours affectation_cours_enseignant_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.affectation_cours
    ADD CONSTRAINT affectation_cours_enseignant_id_fkey FOREIGN KEY (enseignant_id) REFERENCES tenant_test.enseignant(id) ON DELETE RESTRICT;


--
-- TOC entry 6522 (class 2606 OID 98670)
-- Name: affectation_cours affectation_cours_ue_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.affectation_cours
    ADD CONSTRAINT affectation_cours_ue_id_fkey FOREIGN KEY (ue_id) REFERENCES tenant_test.unite_enseignement(id) ON DELETE CASCADE;


--
-- TOC entry 6523 (class 2606 OID 98685)
-- Name: affectation_cours affectation_cours_valide_par_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.affectation_cours
    ADD CONSTRAINT affectation_cours_valide_par_fkey FOREIGN KEY (valide_par) REFERENCES tenant_test.utilisateur(id);


--
-- TOC entry 6640 (class 2606 OID 100059)
-- Name: annonce annonce_auteur_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.annonce
    ADD CONSTRAINT annonce_auteur_id_fkey FOREIGN KEY (auteur_id) REFERENCES tenant_test.utilisateur(id);


--
-- TOC entry 6641 (class 2606 OID 100054)
-- Name: annonce annonce_parcours_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.annonce
    ADD CONSTRAINT annonce_parcours_id_fkey FOREIGN KEY (parcours_id) REFERENCES tenant_test.parcours(id);


--
-- TOC entry 6676 (class 2606 OID 100660)
-- Name: archive_scolarite archive_scolarite_archive_par_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.archive_scolarite
    ADD CONSTRAINT archive_scolarite_archive_par_fkey FOREIGN KEY (archive_par) REFERENCES tenant_test.utilisateur(id);


--
-- TOC entry 6677 (class 2606 OID 100655)
-- Name: archive_scolarite archive_scolarite_etudiant_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.archive_scolarite
    ADD CONSTRAINT archive_scolarite_etudiant_id_fkey FOREIGN KEY (etudiant_id) REFERENCES tenant_test.etudiant(id) ON DELETE RESTRICT;


--
-- TOC entry 6678 (class 2606 OID 100694)
-- Name: attestation attestation_annee_academique_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.attestation
    ADD CONSTRAINT attestation_annee_academique_id_fkey FOREIGN KEY (annee_academique_id) REFERENCES tenant_test.annee_academique(id);


--
-- TOC entry 6679 (class 2606 OID 100684)
-- Name: attestation attestation_etudiant_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.attestation
    ADD CONSTRAINT attestation_etudiant_id_fkey FOREIGN KEY (etudiant_id) REFERENCES tenant_test.etudiant(id);


--
-- TOC entry 6680 (class 2606 OID 100689)
-- Name: attestation attestation_inscription_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.attestation
    ADD CONSTRAINT attestation_inscription_id_fkey FOREIGN KEY (inscription_id) REFERENCES tenant_test.inscription(id);


--
-- TOC entry 6608 (class 2606 OID 99628)
-- Name: budget budget_annee_academique_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.budget
    ADD CONSTRAINT budget_annee_academique_id_fkey FOREIGN KEY (annee_academique_id) REFERENCES tenant_test.annee_academique(id);


--
-- TOC entry 6609 (class 2606 OID 99638)
-- Name: budget budget_created_by_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.budget
    ADD CONSTRAINT budget_created_by_fkey FOREIGN KEY (created_by) REFERENCES tenant_test.utilisateur(id);


--
-- TOC entry 6610 (class 2606 OID 99633)
-- Name: budget budget_departement_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.budget
    ADD CONSTRAINT budget_departement_id_fkey FOREIGN KEY (departement_id) REFERENCES tenant_test.departement(id);


--
-- TOC entry 6622 (class 2606 OID 99836)
-- Name: calendrier_academique calendrier_academique_annee_academique_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.calendrier_academique
    ADD CONSTRAINT calendrier_academique_annee_academique_id_fkey FOREIGN KEY (annee_academique_id) REFERENCES tenant_test.annee_academique(id);


--
-- TOC entry 6623 (class 2606 OID 99841)
-- Name: calendrier_academique calendrier_academique_parcours_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.calendrier_academique
    ADD CONSTRAINT calendrier_academique_parcours_id_fkey FOREIGN KEY (parcours_id) REFERENCES tenant_test.parcours(id);


--
-- TOC entry 6538 (class 2606 OID 98901)
-- Name: candidature candidature_recrutement_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.candidature
    ADD CONSTRAINT candidature_recrutement_id_fkey FOREIGN KEY (recrutement_id) REFERENCES tenant_test.recrutement(id) ON DELETE CASCADE;


--
-- TOC entry 6536 (class 2606 OID 98874)
-- Name: cloture_caisse cloture_caisse_caissier_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.cloture_caisse
    ADD CONSTRAINT cloture_caisse_caissier_id_fkey FOREIGN KEY (caissier_id) REFERENCES tenant_test.utilisateur(id) ON DELETE RESTRICT;


--
-- TOC entry 6537 (class 2606 OID 98879)
-- Name: cloture_caisse cloture_caisse_valide_par_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.cloture_caisse
    ADD CONSTRAINT cloture_caisse_valide_par_fkey FOREIGN KEY (valide_par) REFERENCES tenant_test.utilisateur(id);


--
-- TOC entry 6615 (class 2606 OID 99704)
-- Name: conge_personnel conge_personnel_approuve_par_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.conge_personnel
    ADD CONSTRAINT conge_personnel_approuve_par_fkey FOREIGN KEY (approuve_par) REFERENCES tenant_test.utilisateur(id);


--
-- TOC entry 6616 (class 2606 OID 99699)
-- Name: conge_personnel conge_personnel_utilisateur_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.conge_personnel
    ADD CONSTRAINT conge_personnel_utilisateur_id_fkey FOREIGN KEY (utilisateur_id) REFERENCES tenant_test.utilisateur(id);


--
-- TOC entry 6512 (class 2606 OID 98515)
-- Name: contrat_personnel contrat_personnel_departement_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.contrat_personnel
    ADD CONSTRAINT contrat_personnel_departement_id_fkey FOREIGN KEY (departement_id) REFERENCES tenant_test.departement(id);


--
-- TOC entry 6513 (class 2606 OID 98510)
-- Name: contrat_personnel contrat_personnel_utilisateur_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.contrat_personnel
    ADD CONSTRAINT contrat_personnel_utilisateur_id_fkey FOREIGN KEY (utilisateur_id) REFERENCES tenant_test.utilisateur(id) ON DELETE RESTRICT;


--
-- TOC entry 6631 (class 2606 OID 99953)
-- Name: convocation convocation_etudiant_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.convocation
    ADD CONSTRAINT convocation_etudiant_id_fkey FOREIGN KEY (etudiant_id) REFERENCES tenant_test.etudiant(id) ON DELETE CASCADE;


--
-- TOC entry 6632 (class 2606 OID 99968)
-- Name: convocation convocation_genere_par_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.convocation
    ADD CONSTRAINT convocation_genere_par_fkey FOREIGN KEY (genere_par) REFERENCES tenant_test.utilisateur(id);


--
-- TOC entry 6633 (class 2606 OID 99963)
-- Name: convocation convocation_salle_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.convocation
    ADD CONSTRAINT convocation_salle_id_fkey FOREIGN KEY (salle_id) REFERENCES tenant_test.salle(id) ON DELETE SET NULL;


--
-- TOC entry 6634 (class 2606 OID 99958)
-- Name: convocation convocation_session_examen_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.convocation
    ADD CONSTRAINT convocation_session_examen_id_fkey FOREIGN KEY (session_examen_id) REFERENCES tenant_test.session_examen(id) ON DELETE CASCADE;


--
-- TOC entry 6581 (class 2606 OID 99344)
-- Name: deliberation deliberation_parcours_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.deliberation
    ADD CONSTRAINT deliberation_parcours_id_fkey FOREIGN KEY (parcours_id) REFERENCES tenant_test.parcours(id) ON DELETE RESTRICT;


--
-- TOC entry 6582 (class 2606 OID 99349)
-- Name: deliberation deliberation_president_jury_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.deliberation
    ADD CONSTRAINT deliberation_president_jury_id_fkey FOREIGN KEY (president_jury_id) REFERENCES tenant_test.utilisateur(id);


--
-- TOC entry 6583 (class 2606 OID 99354)
-- Name: deliberation deliberation_validee_par_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.deliberation
    ADD CONSTRAINT deliberation_validee_par_fkey FOREIGN KEY (validee_par) REFERENCES tenant_test.utilisateur(id);


--
-- TOC entry 6629 (class 2606 OID 99925)
-- Name: demande_etudiant demande_etudiant_etudiant_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.demande_etudiant
    ADD CONSTRAINT demande_etudiant_etudiant_id_fkey FOREIGN KEY (etudiant_id) REFERENCES tenant_test.etudiant(id) ON DELETE CASCADE;


--
-- TOC entry 6630 (class 2606 OID 99930)
-- Name: demande_etudiant demande_etudiant_traite_par_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.demande_etudiant
    ADD CONSTRAINT demande_etudiant_traite_par_fkey FOREIGN KEY (traite_par) REFERENCES tenant_test.utilisateur(id);


--
-- TOC entry 6638 (class 2606 OID 100025)
-- Name: demande_ressource demande_ressource_demandeur_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.demande_ressource
    ADD CONSTRAINT demande_ressource_demandeur_id_fkey FOREIGN KEY (demandeur_id) REFERENCES tenant_test.utilisateur(id) ON DELETE CASCADE;


--
-- TOC entry 6639 (class 2606 OID 100030)
-- Name: demande_ressource demande_ressource_traite_par_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.demande_ressource
    ADD CONSTRAINT demande_ressource_traite_par_fkey FOREIGN KEY (traite_par) REFERENCES tenant_test.utilisateur(id) ON DELETE SET NULL;


--
-- TOC entry 6498 (class 2606 OID 98292)
-- Name: departement departement_responsable_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.departement
    ADD CONSTRAINT departement_responsable_id_fkey FOREIGN KEY (responsable_id) REFERENCES tenant_test.utilisateur(id) ON DELETE SET NULL;


--
-- TOC entry 6611 (class 2606 OID 99666)
-- Name: depense depense_annee_academique_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.depense
    ADD CONSTRAINT depense_annee_academique_id_fkey FOREIGN KEY (annee_academique_id) REFERENCES tenant_test.annee_academique(id);


--
-- TOC entry 6612 (class 2606 OID 99676)
-- Name: depense depense_approuve_par_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.depense
    ADD CONSTRAINT depense_approuve_par_fkey FOREIGN KEY (approuve_par) REFERENCES tenant_test.utilisateur(id);


--
-- TOC entry 6613 (class 2606 OID 99661)
-- Name: depense depense_budget_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.depense
    ADD CONSTRAINT depense_budget_id_fkey FOREIGN KEY (budget_id) REFERENCES tenant_test.budget(id);


--
-- TOC entry 6614 (class 2606 OID 99671)
-- Name: depense depense_demande_par_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.depense
    ADD CONSTRAINT depense_demande_par_fkey FOREIGN KEY (demande_par) REFERENCES tenant_test.utilisateur(id);


--
-- TOC entry 6672 (class 2606 OID 100623)
-- Name: diplome diplome_annee_academique_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.diplome
    ADD CONSTRAINT diplome_annee_academique_id_fkey FOREIGN KEY (annee_academique_id) REFERENCES tenant_test.annee_academique(id);


--
-- TOC entry 6673 (class 2606 OID 100613)
-- Name: diplome diplome_etudiant_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.diplome
    ADD CONSTRAINT diplome_etudiant_id_fkey FOREIGN KEY (etudiant_id) REFERENCES tenant_test.etudiant(id) ON DELETE RESTRICT;


--
-- TOC entry 6674 (class 2606 OID 100618)
-- Name: diplome diplome_parcours_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.diplome
    ADD CONSTRAINT diplome_parcours_id_fkey FOREIGN KEY (parcours_id) REFERENCES tenant_test.parcours(id);


--
-- TOC entry 6675 (class 2606 OID 100628)
-- Name: diplome diplome_signe_par_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.diplome
    ADD CONSTRAINT diplome_signe_par_fkey FOREIGN KEY (signe_par) REFERENCES tenant_test.utilisateur(id);


--
-- TOC entry 6635 (class 2606 OID 99997)
-- Name: dossier_etudiant dossier_etudiant_demande_par_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.dossier_etudiant
    ADD CONSTRAINT dossier_etudiant_demande_par_fkey FOREIGN KEY (demande_par) REFERENCES tenant_test.utilisateur(id);


--
-- TOC entry 6636 (class 2606 OID 99992)
-- Name: dossier_etudiant dossier_etudiant_etudiant_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.dossier_etudiant
    ADD CONSTRAINT dossier_etudiant_etudiant_id_fkey FOREIGN KEY (etudiant_id) REFERENCES tenant_test.etudiant(id) ON DELETE CASCADE;


--
-- TOC entry 6637 (class 2606 OID 100002)
-- Name: dossier_etudiant dossier_etudiant_traite_par_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.dossier_etudiant
    ADD CONSTRAINT dossier_etudiant_traite_par_fkey FOREIGN KEY (traite_par) REFERENCES tenant_test.utilisateur(id);


--
-- TOC entry 6525 (class 2606 OID 98726)
-- Name: echeancier echeancier_inscription_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.echeancier
    ADD CONSTRAINT echeancier_inscription_id_fkey FOREIGN KEY (inscription_id) REFERENCES tenant_test.inscription(id) ON DELETE CASCADE;


--
-- TOC entry 6518 (class 2606 OID 98643)
-- Name: element_constitutif element_constitutif_ue_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.element_constitutif
    ADD CONSTRAINT element_constitutif_ue_id_fkey FOREIGN KEY (ue_id) REFERENCES tenant_test.unite_enseignement(id) ON DELETE CASCADE;


--
-- TOC entry 6539 (class 2606 OID 98933)
-- Name: emploi_du_temps emploi_du_temps_affectation_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.emploi_du_temps
    ADD CONSTRAINT emploi_du_temps_affectation_id_fkey FOREIGN KEY (affectation_id) REFERENCES tenant_test.affectation_cours(id) ON DELETE CASCADE;


--
-- TOC entry 6540 (class 2606 OID 98928)
-- Name: emploi_du_temps emploi_du_temps_annee_academique_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.emploi_du_temps
    ADD CONSTRAINT emploi_du_temps_annee_academique_id_fkey FOREIGN KEY (annee_academique_id) REFERENCES tenant_test.annee_academique(id);


--
-- TOC entry 6541 (class 2606 OID 98943)
-- Name: emploi_du_temps emploi_du_temps_created_by_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.emploi_du_temps
    ADD CONSTRAINT emploi_du_temps_created_by_id_fkey FOREIGN KEY (created_by_id) REFERENCES tenant_test.utilisateur(id) ON DELETE SET NULL;


--
-- TOC entry 6542 (class 2606 OID 98938)
-- Name: emploi_du_temps emploi_du_temps_salle_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.emploi_du_temps
    ADD CONSTRAINT emploi_du_temps_salle_id_fkey FOREIGN KEY (salle_id) REFERENCES tenant_test.salle(id) ON DELETE SET NULL;


--
-- TOC entry 6503 (class 2606 OID 98385)
-- Name: enseignant enseignant_departement_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.enseignant
    ADD CONSTRAINT enseignant_departement_id_fkey FOREIGN KEY (departement_id) REFERENCES tenant_test.departement(id);


--
-- TOC entry 6504 (class 2606 OID 98380)
-- Name: enseignant enseignant_utilisateur_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.enseignant
    ADD CONSTRAINT enseignant_utilisateur_id_fkey FOREIGN KEY (utilisateur_id) REFERENCES tenant_test.utilisateur(id) ON DELETE SET NULL;


--
-- TOC entry 6505 (class 2606 OID 98412)
-- Name: etudiant etudiant_utilisateur_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.etudiant
    ADD CONSTRAINT etudiant_utilisateur_id_fkey FOREIGN KEY (utilisateur_id) REFERENCES tenant_test.utilisateur(id) ON DELETE SET NULL;


--
-- TOC entry 6620 (class 2606 OID 99793)
-- Name: evaluation_personnel evaluation_personnel_evaluateur_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.evaluation_personnel
    ADD CONSTRAINT evaluation_personnel_evaluateur_id_fkey FOREIGN KEY (evaluateur_id) REFERENCES tenant_test.utilisateur(id);


--
-- TOC entry 6621 (class 2606 OID 99788)
-- Name: evaluation_personnel evaluation_personnel_utilisateur_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.evaluation_personnel
    ADD CONSTRAINT evaluation_personnel_utilisateur_id_fkey FOREIGN KEY (utilisateur_id) REFERENCES tenant_test.utilisateur(id) ON DELETE CASCADE;


--
-- TOC entry 6606 (class 2606 OID 99608)
-- Name: evaluation_soutenance evaluation_soutenance_evaluateur_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.evaluation_soutenance
    ADD CONSTRAINT evaluation_soutenance_evaluateur_id_fkey FOREIGN KEY (evaluateur_id) REFERENCES tenant_test.utilisateur(id) ON DELETE CASCADE;


--
-- TOC entry 6607 (class 2606 OID 99603)
-- Name: evaluation_soutenance evaluation_soutenance_soutenance_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.evaluation_soutenance
    ADD CONSTRAINT evaluation_soutenance_soutenance_id_fkey FOREIGN KEY (soutenance_id) REFERENCES tenant_test.soutenance(id) ON DELETE CASCADE;


--
-- TOC entry 6617 (class 2606 OID 99734)
-- Name: fiche_paie fiche_paie_contrat_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.fiche_paie
    ADD CONSTRAINT fiche_paie_contrat_id_fkey FOREIGN KEY (contrat_id) REFERENCES tenant_test.contrat_personnel(id);


--
-- TOC entry 6601 (class 2606 OID 99547)
-- Name: fiche_suivi_stage fiche_suivi_stage_auteur_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.fiche_suivi_stage
    ADD CONSTRAINT fiche_suivi_stage_auteur_id_fkey FOREIGN KEY (auteur_id) REFERENCES tenant_test.utilisateur(id) ON DELETE CASCADE;


--
-- TOC entry 6602 (class 2606 OID 99542)
-- Name: fiche_suivi_stage fiche_suivi_stage_stage_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.fiche_suivi_stage
    ADD CONSTRAINT fiche_suivi_stage_stage_id_fkey FOREIGN KEY (stage_id) REFERENCES tenant_test.stage(id) ON DELETE CASCADE;


--
-- TOC entry 6532 (class 2606 OID 98835)
-- Name: frais_inscription frais_inscription_annee_academique_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.frais_inscription
    ADD CONSTRAINT frais_inscription_annee_academique_id_fkey FOREIGN KEY (annee_academique_id) REFERENCES tenant_test.annee_academique(id) ON DELETE RESTRICT;


--
-- TOC entry 6533 (class 2606 OID 98840)
-- Name: frais_inscription frais_inscription_cree_par_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.frais_inscription
    ADD CONSTRAINT frais_inscription_cree_par_fkey FOREIGN KEY (cree_par) REFERENCES tenant_test.utilisateur(id);


--
-- TOC entry 6534 (class 2606 OID 98845)
-- Name: frais_inscription frais_inscription_modifie_par_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.frais_inscription
    ADD CONSTRAINT frais_inscription_modifie_par_fkey FOREIGN KEY (modifie_par) REFERENCES tenant_test.utilisateur(id);


--
-- TOC entry 6535 (class 2606 OID 98830)
-- Name: frais_inscription frais_inscription_parcours_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.frais_inscription
    ADD CONSTRAINT frais_inscription_parcours_id_fkey FOREIGN KEY (parcours_id) REFERENCES tenant_test.parcours(id) ON DELETE RESTRICT;


--
-- TOC entry 6506 (class 2606 OID 98441)
-- Name: grille_tarifaire grille_tarifaire_annee_academique_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.grille_tarifaire
    ADD CONSTRAINT grille_tarifaire_annee_academique_id_fkey FOREIGN KEY (annee_academique_id) REFERENCES tenant_test.annee_academique(id);


--
-- TOC entry 6507 (class 2606 OID 98436)
-- Name: grille_tarifaire grille_tarifaire_parcours_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.grille_tarifaire
    ADD CONSTRAINT grille_tarifaire_parcours_id_fkey FOREIGN KEY (parcours_id) REFERENCES tenant_test.parcours(id);


--
-- TOC entry 6618 (class 2606 OID 99758)
-- Name: heure_complementaire heure_complementaire_enseignant_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.heure_complementaire
    ADD CONSTRAINT heure_complementaire_enseignant_id_fkey FOREIGN KEY (enseignant_id) REFERENCES tenant_test.enseignant(id) ON DELETE CASCADE;


--
-- TOC entry 6619 (class 2606 OID 99763)
-- Name: heure_complementaire heure_complementaire_valide_par_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.heure_complementaire
    ADD CONSTRAINT heure_complementaire_valide_par_fkey FOREIGN KEY (valide_par) REFERENCES tenant_test.utilisateur(id);


--
-- TOC entry 6624 (class 2606 OID 99876)
-- Name: incident_disciplinaire incident_disciplinaire_arbitre_par_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.incident_disciplinaire
    ADD CONSTRAINT incident_disciplinaire_arbitre_par_fkey FOREIGN KEY (arbitre_par) REFERENCES tenant_test.utilisateur(id);


--
-- TOC entry 6625 (class 2606 OID 99866)
-- Name: incident_disciplinaire incident_disciplinaire_etudiant_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.incident_disciplinaire
    ADD CONSTRAINT incident_disciplinaire_etudiant_id_fkey FOREIGN KEY (etudiant_id) REFERENCES tenant_test.etudiant(id);


--
-- TOC entry 6626 (class 2606 OID 99871)
-- Name: incident_disciplinaire incident_disciplinaire_rapporte_par_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.incident_disciplinaire
    ADD CONSTRAINT incident_disciplinaire_rapporte_par_fkey FOREIGN KEY (rapporte_par) REFERENCES tenant_test.utilisateur(id);


--
-- TOC entry 6508 (class 2606 OID 98483)
-- Name: inscription inscription_annee_academique_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.inscription
    ADD CONSTRAINT inscription_annee_academique_id_fkey FOREIGN KEY (annee_academique_id) REFERENCES tenant_test.annee_academique(id);


--
-- TOC entry 6509 (class 2606 OID 98473)
-- Name: inscription inscription_etudiant_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.inscription
    ADD CONSTRAINT inscription_etudiant_id_fkey FOREIGN KEY (etudiant_id) REFERENCES tenant_test.etudiant(id) ON DELETE RESTRICT;


--
-- TOC entry 6510 (class 2606 OID 98478)
-- Name: inscription inscription_parcours_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.inscription
    ADD CONSTRAINT inscription_parcours_id_fkey FOREIGN KEY (parcours_id) REFERENCES tenant_test.parcours(id) ON DELETE RESTRICT;


--
-- TOC entry 6511 (class 2606 OID 98488)
-- Name: inscription inscription_validee_par_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.inscription
    ADD CONSTRAINT inscription_validee_par_fkey FOREIGN KEY (validee_par) REFERENCES tenant_test.utilisateur(id);


--
-- TOC entry 6650 (class 2606 OID 100171)
-- Name: message_destinataire message_destinataire_etudiant_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.message_destinataire
    ADD CONSTRAINT message_destinataire_etudiant_id_fkey FOREIGN KEY (etudiant_id) REFERENCES tenant_test.etudiant(id) ON DELETE CASCADE;


--
-- TOC entry 6643 (class 2606 OID 100104)
-- Name: message message_destinataire_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.message
    ADD CONSTRAINT message_destinataire_id_fkey FOREIGN KEY (destinataire_id) REFERENCES tenant_test.utilisateur(id);


--
-- TOC entry 6651 (class 2606 OID 100166)
-- Name: message_destinataire message_destinataire_message_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.message_destinataire
    ADD CONSTRAINT message_destinataire_message_id_fkey FOREIGN KEY (message_id) REFERENCES tenant_test.message_enseignant(id) ON DELETE CASCADE;


--
-- TOC entry 6646 (class 2606 OID 100134)
-- Name: message_enseignant message_enseignant_enseignant_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.message_enseignant
    ADD CONSTRAINT message_enseignant_enseignant_id_fkey FOREIGN KEY (enseignant_id) REFERENCES tenant_test.utilisateur(id) ON DELETE CASCADE;


--
-- TOC entry 6647 (class 2606 OID 100139)
-- Name: message_enseignant message_enseignant_etudiant_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.message_enseignant
    ADD CONSTRAINT message_enseignant_etudiant_id_fkey FOREIGN KEY (etudiant_id) REFERENCES tenant_test.etudiant(id) ON DELETE CASCADE;


--
-- TOC entry 6648 (class 2606 OID 100149)
-- Name: message_enseignant message_enseignant_niveau_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.message_enseignant
    ADD CONSTRAINT message_enseignant_niveau_id_fkey FOREIGN KEY (niveau_id) REFERENCES tenant_test.niveau_etude(id) ON DELETE SET NULL;


--
-- TOC entry 6649 (class 2606 OID 100144)
-- Name: message_enseignant message_enseignant_parcours_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.message_enseignant
    ADD CONSTRAINT message_enseignant_parcours_id_fkey FOREIGN KEY (parcours_id) REFERENCES tenant_test.parcours(id) ON DELETE SET NULL;


--
-- TOC entry 6644 (class 2606 OID 100099)
-- Name: message message_expediteur_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.message
    ADD CONSTRAINT message_expediteur_id_fkey FOREIGN KEY (expediteur_id) REFERENCES tenant_test.utilisateur(id);


--
-- TOC entry 6645 (class 2606 OID 100109)
-- Name: message message_parent_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.message
    ADD CONSTRAINT message_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES tenant_test.message(id);


--
-- TOC entry 6659 (class 2606 OID 100287)
-- Name: mouvement_stock mouvement_stock_stock_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.mouvement_stock
    ADD CONSTRAINT mouvement_stock_stock_id_fkey FOREIGN KEY (stock_id) REFERENCES tenant_test.stock(id);


--
-- TOC entry 6660 (class 2606 OID 100292)
-- Name: mouvement_stock mouvement_stock_utilisateur_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.mouvement_stock
    ADD CONSTRAINT mouvement_stock_utilisateur_id_fkey FOREIGN KEY (utilisateur_id) REFERENCES tenant_test.utilisateur(id);


--
-- TOC entry 6553 (class 2606 OID 99072)
-- Name: note_derogatoire note_derogatoire_ec_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.note_derogatoire
    ADD CONSTRAINT note_derogatoire_ec_id_fkey FOREIGN KEY (ec_id) REFERENCES tenant_test.element_constitutif(id) ON DELETE SET NULL;


--
-- TOC entry 6554 (class 2606 OID 99067)
-- Name: note_derogatoire note_derogatoire_etudiant_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.note_derogatoire
    ADD CONSTRAINT note_derogatoire_etudiant_id_fkey FOREIGN KEY (etudiant_id) REFERENCES tenant_test.etudiant(id) ON DELETE CASCADE;


--
-- TOC entry 6555 (class 2606 OID 99092)
-- Name: note_derogatoire note_derogatoire_saisie_par_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.note_derogatoire
    ADD CONSTRAINT note_derogatoire_saisie_par_fkey FOREIGN KEY (saisie_par) REFERENCES tenant_test.utilisateur(id);


--
-- TOC entry 6556 (class 2606 OID 99082)
-- Name: note_derogatoire note_derogatoire_session_examen_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.note_derogatoire
    ADD CONSTRAINT note_derogatoire_session_examen_id_fkey FOREIGN KEY (session_examen_id) REFERENCES tenant_test.session_examen(id) ON DELETE SET NULL;


--
-- TOC entry 6557 (class 2606 OID 99077)
-- Name: note_derogatoire note_derogatoire_ue_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.note_derogatoire
    ADD CONSTRAINT note_derogatoire_ue_id_fkey FOREIGN KEY (ue_id) REFERENCES tenant_test.unite_enseignement(id) ON DELETE SET NULL;


--
-- TOC entry 6558 (class 2606 OID 99097)
-- Name: note_derogatoire note_derogatoire_valide_par_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.note_derogatoire
    ADD CONSTRAINT note_derogatoire_valide_par_fkey FOREIGN KEY (valide_par) REFERENCES tenant_test.utilisateur(id);


--
-- TOC entry 6559 (class 2606 OID 99087)
-- Name: note_derogatoire note_derogatoire_valide_par_scolarite_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.note_derogatoire
    ADD CONSTRAINT note_derogatoire_valide_par_scolarite_fkey FOREIGN KEY (valide_par_scolarite) REFERENCES tenant_test.utilisateur(id);


--
-- TOC entry 6543 (class 2606 OID 98978)
-- Name: note note_ec_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.note
    ADD CONSTRAINT note_ec_id_fkey FOREIGN KEY (ec_id) REFERENCES tenant_test.element_constitutif(id) ON DELETE RESTRICT;


--
-- TOC entry 6544 (class 2606 OID 98973)
-- Name: note note_etudiant_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.note
    ADD CONSTRAINT note_etudiant_id_fkey FOREIGN KEY (etudiant_id) REFERENCES tenant_test.etudiant(id) ON DELETE RESTRICT;


--
-- TOC entry 6545 (class 2606 OID 98993)
-- Name: note note_saisi_par_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.note
    ADD CONSTRAINT note_saisi_par_fkey FOREIGN KEY (saisi_par) REFERENCES tenant_test.utilisateur(id);


--
-- TOC entry 6546 (class 2606 OID 98988)
-- Name: note note_session_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.note
    ADD CONSTRAINT note_session_id_fkey FOREIGN KEY (session_id) REFERENCES tenant_test.session_examen(id);


--
-- TOC entry 6547 (class 2606 OID 98983)
-- Name: note note_ue_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.note
    ADD CONSTRAINT note_ue_id_fkey FOREIGN KEY (ue_id) REFERENCES tenant_test.unite_enseignement(id) ON DELETE RESTRICT;


--
-- TOC entry 6548 (class 2606 OID 98998)
-- Name: note note_valide_par_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.note
    ADD CONSTRAINT note_valide_par_fkey FOREIGN KEY (valide_par) REFERENCES tenant_test.utilisateur(id);


--
-- TOC entry 6642 (class 2606 OID 100080)
-- Name: notification notification_utilisateur_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.notification
    ADD CONSTRAINT notification_utilisateur_id_fkey FOREIGN KEY (utilisateur_id) REFERENCES tenant_test.utilisateur(id) ON DELETE CASCADE;


--
-- TOC entry 6526 (class 2606 OID 98765)
-- Name: paiement paiement_caissier_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.paiement
    ADD CONSTRAINT paiement_caissier_id_fkey FOREIGN KEY (caissier_id) REFERENCES tenant_test.utilisateur(id);


--
-- TOC entry 6527 (class 2606 OID 98760)
-- Name: paiement paiement_echeancier_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.paiement
    ADD CONSTRAINT paiement_echeancier_id_fkey FOREIGN KEY (echeancier_id) REFERENCES tenant_test.echeancier(id);


--
-- TOC entry 6529 (class 2606 OID 98799)
-- Name: paiement_inscription paiement_inscription_etudiant_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.paiement_inscription
    ADD CONSTRAINT paiement_inscription_etudiant_id_fkey FOREIGN KEY (etudiant_id) REFERENCES tenant_test.etudiant(id) ON DELETE CASCADE;


--
-- TOC entry 6528 (class 2606 OID 98755)
-- Name: paiement paiement_inscription_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.paiement
    ADD CONSTRAINT paiement_inscription_id_fkey FOREIGN KEY (inscription_id) REFERENCES tenant_test.inscription(id) ON DELETE RESTRICT;


--
-- TOC entry 6530 (class 2606 OID 98794)
-- Name: paiement_inscription paiement_inscription_inscription_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.paiement_inscription
    ADD CONSTRAINT paiement_inscription_inscription_id_fkey FOREIGN KEY (inscription_id) REFERENCES tenant_test.inscription(id) ON DELETE CASCADE;


--
-- TOC entry 6531 (class 2606 OID 98804)
-- Name: paiement_inscription paiement_inscription_valide_par_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.paiement_inscription
    ADD CONSTRAINT paiement_inscription_valide_par_fkey FOREIGN KEY (valide_par) REFERENCES tenant_test.utilisateur(id);


--
-- TOC entry 6500 (class 2606 OID 98343)
-- Name: parcours parcours_departement_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.parcours
    ADD CONSTRAINT parcours_departement_id_fkey FOREIGN KEY (departement_id) REFERENCES tenant_test.departement(id) ON DELETE RESTRICT;


--
-- TOC entry 6501 (class 2606 OID 98348)
-- Name: parcours parcours_responsable_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.parcours
    ADD CONSTRAINT parcours_responsable_id_fkey FOREIGN KEY (responsable_id) REFERENCES tenant_test.utilisateur(id) ON DELETE SET NULL;


--
-- TOC entry 6502 (class 2606 OID 98353)
-- Name: parcours parcours_secretaire_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.parcours
    ADD CONSTRAINT parcours_secretaire_id_fkey FOREIGN KEY (secretaire_id) REFERENCES tenant_test.utilisateur(id) ON DELETE SET NULL;


--
-- TOC entry 6661 (class 2606 OID 100314)
-- Name: planning_entretien planning_entretien_batiment_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.planning_entretien
    ADD CONSTRAINT planning_entretien_batiment_id_fkey FOREIGN KEY (batiment_id) REFERENCES tenant_test.batiment(id);


--
-- TOC entry 6662 (class 2606 OID 100319)
-- Name: planning_entretien planning_entretien_responsable_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.planning_entretien
    ADD CONSTRAINT planning_entretien_responsable_id_fkey FOREIGN KEY (responsable_id) REFERENCES tenant_test.utilisateur(id);


--
-- TOC entry 6663 (class 2606 OID 100309)
-- Name: planning_entretien planning_entretien_salle_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.planning_entretien
    ADD CONSTRAINT planning_entretien_salle_id_fkey FOREIGN KEY (salle_id) REFERENCES tenant_test.salle(id);


--
-- TOC entry 6549 (class 2606 OID 99024)
-- Name: presence presence_etudiant_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.presence
    ADD CONSTRAINT presence_etudiant_id_fkey FOREIGN KEY (etudiant_id) REFERENCES tenant_test.etudiant(id) ON DELETE CASCADE;


--
-- TOC entry 6550 (class 2606 OID 99034)
-- Name: presence presence_saisi_par_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.presence
    ADD CONSTRAINT presence_saisi_par_fkey FOREIGN KEY (saisi_par) REFERENCES tenant_test.utilisateur(id);


--
-- TOC entry 6551 (class 2606 OID 99029)
-- Name: presence presence_seance_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.presence
    ADD CONSTRAINT presence_seance_id_fkey FOREIGN KEY (seance_id) REFERENCES tenant_test.emploi_du_temps(id) ON DELETE CASCADE;


--
-- TOC entry 6552 (class 2606 OID 99039)
-- Name: presence presence_valide_par_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.presence
    ADD CONSTRAINT presence_valide_par_fkey FOREIGN KEY (valide_par) REFERENCES tenant_test.utilisateur(id);


--
-- TOC entry 6668 (class 2606 OID 100410)
-- Name: proces_verbal proces_verbal_annee_academique_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.proces_verbal
    ADD CONSTRAINT proces_verbal_annee_academique_id_fkey FOREIGN KEY (annee_academique_id) REFERENCES tenant_test.annee_academique(id);


--
-- TOC entry 6669 (class 2606 OID 100405)
-- Name: proces_verbal proces_verbal_parcours_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.proces_verbal
    ADD CONSTRAINT proces_verbal_parcours_id_fkey FOREIGN KEY (parcours_id) REFERENCES tenant_test.parcours(id) ON DELETE CASCADE;


--
-- TOC entry 6670 (class 2606 OID 100415)
-- Name: proces_verbal proces_verbal_redige_par_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.proces_verbal
    ADD CONSTRAINT proces_verbal_redige_par_fkey FOREIGN KEY (redige_par) REFERENCES tenant_test.utilisateur(id);


--
-- TOC entry 6671 (class 2606 OID 100420)
-- Name: proces_verbal proces_verbal_valide_par_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.proces_verbal
    ADD CONSTRAINT proces_verbal_valide_par_fkey FOREIGN KEY (valide_par) REFERENCES tenant_test.utilisateur(id) ON DELETE SET NULL;


--
-- TOC entry 6576 (class 2606 OID 99284)
-- Name: pv_deliberation pv_deliberation_parcours_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.pv_deliberation
    ADD CONSTRAINT pv_deliberation_parcours_id_fkey FOREIGN KEY (parcours_id) REFERENCES tenant_test.parcours(id);


--
-- TOC entry 6577 (class 2606 OID 99289)
-- Name: pv_deliberation pv_deliberation_president_jury_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.pv_deliberation
    ADD CONSTRAINT pv_deliberation_president_jury_fkey FOREIGN KEY (president_jury) REFERENCES tenant_test.utilisateur(id);


--
-- TOC entry 6578 (class 2606 OID 99279)
-- Name: pv_deliberation pv_deliberation_session_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.pv_deliberation
    ADD CONSTRAINT pv_deliberation_session_id_fkey FOREIGN KEY (session_id) REFERENCES tenant_test.session_examen(id);


--
-- TOC entry 6664 (class 2606 OID 100339)
-- Name: rapport_entretien rapport_entretien_planning_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.rapport_entretien
    ADD CONSTRAINT rapport_entretien_planning_id_fkey FOREIGN KEY (planning_id) REFERENCES tenant_test.planning_entretien(id);


--
-- TOC entry 6665 (class 2606 OID 100344)
-- Name: rapport_entretien rapport_entretien_realise_par_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.rapport_entretien
    ADD CONSTRAINT rapport_entretien_realise_par_fkey FOREIGN KEY (realise_par) REFERENCES tenant_test.utilisateur(id);


--
-- TOC entry 6564 (class 2606 OID 99159)
-- Name: rattrapage rattrapage_absence_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.rattrapage
    ADD CONSTRAINT rattrapage_absence_id_fkey FOREIGN KEY (absence_id) REFERENCES tenant_test.absence_enseignant(id) ON DELETE CASCADE;


--
-- TOC entry 6565 (class 2606 OID 99174)
-- Name: rattrapage rattrapage_planifie_par_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.rattrapage
    ADD CONSTRAINT rattrapage_planifie_par_fkey FOREIGN KEY (planifie_par) REFERENCES tenant_test.utilisateur(id);


--
-- TOC entry 6566 (class 2606 OID 99169)
-- Name: rattrapage rattrapage_remplaceur_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.rattrapage
    ADD CONSTRAINT rattrapage_remplaceur_id_fkey FOREIGN KEY (remplaceur_id) REFERENCES tenant_test.enseignant(id) ON DELETE SET NULL;


--
-- TOC entry 6567 (class 2606 OID 99164)
-- Name: rattrapage rattrapage_salle_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.rattrapage
    ADD CONSTRAINT rattrapage_salle_id_fkey FOREIGN KEY (salle_id) REFERENCES tenant_test.salle(id) ON DELETE SET NULL;


--
-- TOC entry 6514 (class 2606 OID 98540)
-- Name: recrutement recrutement_departement_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.recrutement
    ADD CONSTRAINT recrutement_departement_id_fkey FOREIGN KEY (departement_id) REFERENCES tenant_test.departement(id);


--
-- TOC entry 6515 (class 2606 OID 98545)
-- Name: recrutement recrutement_responsable_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.recrutement
    ADD CONSTRAINT recrutement_responsable_id_fkey FOREIGN KEY (responsable_id) REFERENCES tenant_test.utilisateur(id);


--
-- TOC entry 6666 (class 2606 OID 100367)
-- Name: referentiel_competences referentiel_competences_parcours_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.referentiel_competences
    ADD CONSTRAINT referentiel_competences_parcours_id_fkey FOREIGN KEY (parcours_id) REFERENCES tenant_test.parcours(id) ON DELETE CASCADE;


--
-- TOC entry 6667 (class 2606 OID 100372)
-- Name: referentiel_competences referentiel_competences_valide_par_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.referentiel_competences
    ADD CONSTRAINT referentiel_competences_valide_par_fkey FOREIGN KEY (valide_par) REFERENCES tenant_test.utilisateur(id) ON DELETE SET NULL;


--
-- TOC entry 6656 (class 2606 OID 100248)
-- Name: reservation_salle reservation_salle_approuve_par_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.reservation_salle
    ADD CONSTRAINT reservation_salle_approuve_par_fkey FOREIGN KEY (approuve_par) REFERENCES tenant_test.utilisateur(id);


--
-- TOC entry 6657 (class 2606 OID 100243)
-- Name: reservation_salle reservation_salle_demande_par_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.reservation_salle
    ADD CONSTRAINT reservation_salle_demande_par_fkey FOREIGN KEY (demande_par) REFERENCES tenant_test.utilisateur(id);


--
-- TOC entry 6658 (class 2606 OID 100238)
-- Name: reservation_salle reservation_salle_salle_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.reservation_salle
    ADD CONSTRAINT reservation_salle_salle_id_fkey FOREIGN KEY (salle_id) REFERENCES tenant_test.salle(id);


--
-- TOC entry 6579 (class 2606 OID 99316)
-- Name: resultat_deliberation resultat_deliberation_etudiant_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.resultat_deliberation
    ADD CONSTRAINT resultat_deliberation_etudiant_id_fkey FOREIGN KEY (etudiant_id) REFERENCES tenant_test.etudiant(id);


--
-- TOC entry 6580 (class 2606 OID 99311)
-- Name: resultat_deliberation resultat_deliberation_pv_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.resultat_deliberation
    ADD CONSTRAINT resultat_deliberation_pv_id_fkey FOREIGN KEY (pv_id) REFERENCES tenant_test.pv_deliberation(id);


--
-- TOC entry 6584 (class 2606 OID 99391)
-- Name: resultat_semestre resultat_semestre_deliberation_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.resultat_semestre
    ADD CONSTRAINT resultat_semestre_deliberation_id_fkey FOREIGN KEY (deliberation_id) REFERENCES tenant_test.deliberation(id);


--
-- TOC entry 6585 (class 2606 OID 99381)
-- Name: resultat_semestre resultat_semestre_etudiant_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.resultat_semestre
    ADD CONSTRAINT resultat_semestre_etudiant_id_fkey FOREIGN KEY (etudiant_id) REFERENCES tenant_test.etudiant(id) ON DELETE RESTRICT;


--
-- TOC entry 6586 (class 2606 OID 99386)
-- Name: resultat_semestre resultat_semestre_inscription_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.resultat_semestre
    ADD CONSTRAINT resultat_semestre_inscription_id_fkey FOREIGN KEY (inscription_id) REFERENCES tenant_test.inscription(id) ON DELETE RESTRICT;


--
-- TOC entry 6587 (class 2606 OID 99429)
-- Name: resultat_ue resultat_ue_compensation_ue_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.resultat_ue
    ADD CONSTRAINT resultat_ue_compensation_ue_id_fkey FOREIGN KEY (compensation_ue_id) REFERENCES tenant_test.unite_enseignement(id);


--
-- TOC entry 6588 (class 2606 OID 99414)
-- Name: resultat_ue resultat_ue_etudiant_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.resultat_ue
    ADD CONSTRAINT resultat_ue_etudiant_id_fkey FOREIGN KEY (etudiant_id) REFERENCES tenant_test.etudiant(id) ON DELETE RESTRICT;


--
-- TOC entry 6589 (class 2606 OID 99424)
-- Name: resultat_ue resultat_ue_resultat_semestre_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.resultat_ue
    ADD CONSTRAINT resultat_ue_resultat_semestre_id_fkey FOREIGN KEY (resultat_semestre_id) REFERENCES tenant_test.resultat_semestre(id) ON DELETE RESTRICT;


--
-- TOC entry 6590 (class 2606 OID 99419)
-- Name: resultat_ue resultat_ue_ue_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.resultat_ue
    ADD CONSTRAINT resultat_ue_ue_id_fkey FOREIGN KEY (ue_id) REFERENCES tenant_test.unite_enseignement(id) ON DELETE RESTRICT;


--
-- TOC entry 6499 (class 2606 OID 98317)
-- Name: salle salle_batiment_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.salle
    ADD CONSTRAINT salle_batiment_id_fkey FOREIGN KEY (batiment_id) REFERENCES tenant_test.batiment(id) ON DELETE SET NULL;


--
-- TOC entry 6627 (class 2606 OID 99901)
-- Name: secretaire_parcours secretaire_parcours_assigned_by_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.secretaire_parcours
    ADD CONSTRAINT secretaire_parcours_assigned_by_fkey FOREIGN KEY (assigned_by) REFERENCES tenant_test.utilisateur(id) ON DELETE SET NULL;


--
-- TOC entry 6628 (class 2606 OID 99896)
-- Name: secretaire_parcours secretaire_parcours_parcours_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.secretaire_parcours
    ADD CONSTRAINT secretaire_parcours_parcours_id_fkey FOREIGN KEY (parcours_id) REFERENCES tenant_test.parcours(id) ON DELETE CASCADE;


--
-- TOC entry 6524 (class 2606 OID 98706)
-- Name: session_examen session_examen_annee_academique_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.session_examen
    ADD CONSTRAINT session_examen_annee_academique_id_fkey FOREIGN KEY (annee_academique_id) REFERENCES tenant_test.annee_academique(id);


--
-- TOC entry 6497 (class 2606 OID 98209)
-- Name: session_jwt session_jwt_utilisateur_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.session_jwt
    ADD CONSTRAINT session_jwt_utilisateur_id_fkey FOREIGN KEY (utilisateur_id) REFERENCES tenant_test.utilisateur(id) ON DELETE CASCADE;


--
-- TOC entry 6603 (class 2606 OID 99582)
-- Name: soutenance soutenance_president_jury_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.soutenance
    ADD CONSTRAINT soutenance_president_jury_id_fkey FOREIGN KEY (president_jury_id) REFERENCES tenant_test.utilisateur(id) ON DELETE SET NULL;


--
-- TOC entry 6604 (class 2606 OID 99577)
-- Name: soutenance soutenance_salle_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.soutenance
    ADD CONSTRAINT soutenance_salle_id_fkey FOREIGN KEY (salle_id) REFERENCES tenant_test.salle(id) ON DELETE SET NULL;


--
-- TOC entry 6605 (class 2606 OID 99572)
-- Name: soutenance soutenance_stage_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.soutenance
    ADD CONSTRAINT soutenance_stage_id_fkey FOREIGN KEY (stage_id) REFERENCES tenant_test.stage(id) ON DELETE CASCADE;


--
-- TOC entry 6596 (class 2606 OID 99512)
-- Name: stage stage_annee_academique_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.stage
    ADD CONSTRAINT stage_annee_academique_id_fkey FOREIGN KEY (annee_academique_id) REFERENCES tenant_test.annee_academique(id);


--
-- TOC entry 6597 (class 2606 OID 99517)
-- Name: stage stage_encadrant_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.stage
    ADD CONSTRAINT stage_encadrant_id_fkey FOREIGN KEY (encadrant_id) REFERENCES tenant_test.utilisateur(id) ON DELETE SET NULL;


--
-- TOC entry 6598 (class 2606 OID 99502)
-- Name: stage stage_etudiant_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.stage
    ADD CONSTRAINT stage_etudiant_id_fkey FOREIGN KEY (etudiant_id) REFERENCES tenant_test.etudiant(id) ON DELETE CASCADE;


--
-- TOC entry 6599 (class 2606 OID 99507)
-- Name: stage stage_parcours_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.stage
    ADD CONSTRAINT stage_parcours_id_fkey FOREIGN KEY (parcours_id) REFERENCES tenant_test.parcours(id) ON DELETE RESTRICT;


--
-- TOC entry 6600 (class 2606 OID 99522)
-- Name: stage stage_rapporteur_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.stage
    ADD CONSTRAINT stage_rapporteur_id_fkey FOREIGN KEY (rapporteur_id) REFERENCES tenant_test.utilisateur(id) ON DELETE SET NULL;


--
-- TOC entry 6568 (class 2606 OID 99204)
-- Name: sujet_examen sujet_examen_ec_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.sujet_examen
    ADD CONSTRAINT sujet_examen_ec_id_fkey FOREIGN KEY (ec_id) REFERENCES tenant_test.element_constitutif(id) ON DELETE SET NULL;


--
-- TOC entry 6569 (class 2606 OID 99209)
-- Name: sujet_examen sujet_examen_enseignant_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.sujet_examen
    ADD CONSTRAINT sujet_examen_enseignant_id_fkey FOREIGN KEY (enseignant_id) REFERENCES tenant_test.utilisateur(id);


--
-- TOC entry 6570 (class 2606 OID 99219)
-- Name: sujet_examen sujet_examen_relu_par_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.sujet_examen
    ADD CONSTRAINT sujet_examen_relu_par_fkey FOREIGN KEY (relu_par) REFERENCES tenant_test.utilisateur(id) ON DELETE SET NULL;


--
-- TOC entry 6571 (class 2606 OID 99214)
-- Name: sujet_examen sujet_examen_soumis_par_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.sujet_examen
    ADD CONSTRAINT sujet_examen_soumis_par_fkey FOREIGN KEY (soumis_par) REFERENCES tenant_test.utilisateur(id);


--
-- TOC entry 6572 (class 2606 OID 99199)
-- Name: sujet_examen sujet_examen_ue_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.sujet_examen
    ADD CONSTRAINT sujet_examen_ue_id_fkey FOREIGN KEY (ue_id) REFERENCES tenant_test.unite_enseignement(id) ON DELETE SET NULL;


--
-- TOC entry 6573 (class 2606 OID 99224)
-- Name: sujet_examen sujet_examen_valide_par_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.sujet_examen
    ADD CONSTRAINT sujet_examen_valide_par_fkey FOREIGN KEY (valide_par) REFERENCES tenant_test.utilisateur(id) ON DELETE SET NULL;


--
-- TOC entry 6681 (class 2606 OID 100712)
-- Name: suplement_diplome suplement_diplome_diplome_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.suplement_diplome
    ADD CONSTRAINT suplement_diplome_diplome_id_fkey FOREIGN KEY (diplome_id) REFERENCES tenant_test.diplome(id) ON DELETE RESTRICT;


--
-- TOC entry 6682 (class 2606 OID 100717)
-- Name: suplement_diplome suplement_diplome_etudiant_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.suplement_diplome
    ADD CONSTRAINT suplement_diplome_etudiant_id_fkey FOREIGN KEY (etudiant_id) REFERENCES tenant_test.etudiant(id);


--
-- TOC entry 6574 (class 2606 OID 99254)
-- Name: support_cours support_cours_auteur_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.support_cours
    ADD CONSTRAINT support_cours_auteur_id_fkey FOREIGN KEY (auteur_id) REFERENCES tenant_test.utilisateur(id) ON DELETE CASCADE;


--
-- TOC entry 6575 (class 2606 OID 99249)
-- Name: support_cours support_cours_ec_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.support_cours
    ADD CONSTRAINT support_cours_ec_id_fkey FOREIGN KEY (ec_id) REFERENCES tenant_test.element_constitutif(id) ON DELETE CASCADE;


--
-- TOC entry 6652 (class 2606 OID 100214)
-- Name: ticket_maintenance ticket_maintenance_assigne_a_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.ticket_maintenance
    ADD CONSTRAINT ticket_maintenance_assigne_a_fkey FOREIGN KEY (assigne_a) REFERENCES tenant_test.utilisateur(id);


--
-- TOC entry 6653 (class 2606 OID 100199)
-- Name: ticket_maintenance ticket_maintenance_batiment_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.ticket_maintenance
    ADD CONSTRAINT ticket_maintenance_batiment_id_fkey FOREIGN KEY (batiment_id) REFERENCES tenant_test.batiment(id);


--
-- TOC entry 6654 (class 2606 OID 100204)
-- Name: ticket_maintenance ticket_maintenance_salle_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.ticket_maintenance
    ADD CONSTRAINT ticket_maintenance_salle_id_fkey FOREIGN KEY (salle_id) REFERENCES tenant_test.salle(id);


--
-- TOC entry 6655 (class 2606 OID 100209)
-- Name: ticket_maintenance ticket_maintenance_signale_par_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.ticket_maintenance
    ADD CONSTRAINT ticket_maintenance_signale_par_fkey FOREIGN KEY (signale_par) REFERENCES tenant_test.utilisateur(id);


--
-- TOC entry 6683 (class 2606 OID 100740)
-- Name: transfert_etudiant transfert_etudiant_etudiant_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.transfert_etudiant
    ADD CONSTRAINT transfert_etudiant_etudiant_id_fkey FOREIGN KEY (etudiant_id) REFERENCES tenant_test.etudiant(id) ON DELETE RESTRICT;


--
-- TOC entry 6684 (class 2606 OID 100750)
-- Name: transfert_etudiant transfert_etudiant_parcours_destination_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.transfert_etudiant
    ADD CONSTRAINT transfert_etudiant_parcours_destination_id_fkey FOREIGN KEY (parcours_destination_id) REFERENCES tenant_test.parcours(id);


--
-- TOC entry 6685 (class 2606 OID 100745)
-- Name: transfert_etudiant transfert_etudiant_parcours_origine_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.transfert_etudiant
    ADD CONSTRAINT transfert_etudiant_parcours_origine_id_fkey FOREIGN KEY (parcours_origine_id) REFERENCES tenant_test.parcours(id);


--
-- TOC entry 6516 (class 2606 OID 98622)
-- Name: unite_enseignement unite_enseignement_enseignant_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.unite_enseignement
    ADD CONSTRAINT unite_enseignement_enseignant_id_fkey FOREIGN KEY (enseignant_id) REFERENCES tenant_test.enseignant(id) ON DELETE SET NULL;


--
-- TOC entry 6517 (class 2606 OID 98617)
-- Name: unite_enseignement unite_enseignement_parcours_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.unite_enseignement
    ADD CONSTRAINT unite_enseignement_parcours_id_fkey FOREIGN KEY (parcours_id) REFERENCES tenant_test.parcours(id) ON DELETE RESTRICT;


--
-- TOC entry 6591 (class 2606 OID 99475)
-- Name: verrouillage_notes verrouillage_notes_autorise_par_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.verrouillage_notes
    ADD CONSTRAINT verrouillage_notes_autorise_par_fkey FOREIGN KEY (autorise_par) REFERENCES tenant_test.utilisateur(id);


--
-- TOC entry 6592 (class 2606 OID 99455)
-- Name: verrouillage_notes verrouillage_notes_deliberation_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.verrouillage_notes
    ADD CONSTRAINT verrouillage_notes_deliberation_id_fkey FOREIGN KEY (deliberation_id) REFERENCES tenant_test.deliberation(id) ON DELETE RESTRICT;


--
-- TOC entry 6593 (class 2606 OID 99460)
-- Name: verrouillage_notes verrouillage_notes_etudiant_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.verrouillage_notes
    ADD CONSTRAINT verrouillage_notes_etudiant_id_fkey FOREIGN KEY (etudiant_id) REFERENCES tenant_test.etudiant(id) ON DELETE RESTRICT;


--
-- TOC entry 6594 (class 2606 OID 99465)
-- Name: verrouillage_notes verrouillage_notes_session_examen_id_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.verrouillage_notes
    ADD CONSTRAINT verrouillage_notes_session_examen_id_fkey FOREIGN KEY (session_examen_id) REFERENCES tenant_test.session_examen(id);


--
-- TOC entry 6595 (class 2606 OID 99470)
-- Name: verrouillage_notes verrouillage_notes_verrouille_par_fkey; Type: FK CONSTRAINT; Schema: tenant_test; Owner: postgres
--

ALTER TABLE ONLY tenant_test.verrouillage_notes
    ADD CONSTRAINT verrouillage_notes_verrouille_par_fkey FOREIGN KEY (verrouille_par) REFERENCES tenant_test.utilisateur(id);


-- Completed on 2026-05-19 10:11:24

--
-- PostgreSQL database dump complete
--

\unrestrict O7O4RnISthuX5XKcHD30sUKwTGvC1AVYxTLWNU5GHcB37VnDIEOLhbCPVgBmiMz

