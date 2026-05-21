--
-- PostgreSQL database dump
--

\restrict CiAJsyKo5DVY5Xk0fS3cbeZedVFYPWycyUHzm5xJjHldkzeEfcZCNdgBdIbWgM7

-- Dumped from database version 18.0
-- Dumped by pg_dump version 18.0

-- Started on 2026-05-19 07:09:56

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

ALTER TABLE ONLY tenant_ispm.verrouillage_notes DROP CONSTRAINT verrouillage_notes_verrouille_par_fkey;
ALTER TABLE ONLY tenant_ispm.verrouillage_notes DROP CONSTRAINT verrouillage_notes_session_examen_id_fkey;
ALTER TABLE ONLY tenant_ispm.verrouillage_notes DROP CONSTRAINT verrouillage_notes_etudiant_id_fkey;
ALTER TABLE ONLY tenant_ispm.verrouillage_notes DROP CONSTRAINT verrouillage_notes_deliberation_id_fkey;
ALTER TABLE ONLY tenant_ispm.verrouillage_notes DROP CONSTRAINT verrouillage_notes_autorise_par_fkey;
ALTER TABLE ONLY tenant_ispm.unite_enseignement DROP CONSTRAINT unite_enseignement_parcours_id_fkey;
ALTER TABLE ONLY tenant_ispm.unite_enseignement DROP CONSTRAINT unite_enseignement_enseignant_id_fkey;
ALTER TABLE ONLY tenant_ispm.transfert_etudiant DROP CONSTRAINT transfert_etudiant_valide_par_fkey;
ALTER TABLE ONLY tenant_ispm.transfert_etudiant DROP CONSTRAINT transfert_etudiant_parcours_destination_id_fkey;
ALTER TABLE ONLY tenant_ispm.transfert_etudiant DROP CONSTRAINT transfert_etudiant_etudiant_id_fkey;
ALTER TABLE ONLY tenant_ispm.ticket_maintenance DROP CONSTRAINT ticket_maintenance_signale_par_fkey;
ALTER TABLE ONLY tenant_ispm.ticket_maintenance DROP CONSTRAINT ticket_maintenance_salle_id_fkey;
ALTER TABLE ONLY tenant_ispm.ticket_maintenance DROP CONSTRAINT ticket_maintenance_batiment_id_fkey;
ALTER TABLE ONLY tenant_ispm.ticket_maintenance DROP CONSTRAINT ticket_maintenance_assigne_a_fkey;
ALTER TABLE ONLY tenant_ispm.support_cours DROP CONSTRAINT support_cours_ec_id_fkey;
ALTER TABLE ONLY tenant_ispm.support_cours DROP CONSTRAINT support_cours_auteur_id_fkey;
ALTER TABLE ONLY tenant_ispm.suplement_diplome DROP CONSTRAINT suplement_diplome_diplome_id_fkey;
ALTER TABLE ONLY tenant_ispm.suplement_diplome DROP CONSTRAINT suplement_diplome_certifie_par_fkey;
ALTER TABLE ONLY tenant_ispm.sujet_examen DROP CONSTRAINT sujet_examen_valide_par_fkey;
ALTER TABLE ONLY tenant_ispm.sujet_examen DROP CONSTRAINT sujet_examen_ue_id_fkey;
ALTER TABLE ONLY tenant_ispm.sujet_examen DROP CONSTRAINT sujet_examen_soumis_par_fkey;
ALTER TABLE ONLY tenant_ispm.sujet_examen DROP CONSTRAINT sujet_examen_relu_par_fkey;
ALTER TABLE ONLY tenant_ispm.sujet_examen DROP CONSTRAINT sujet_examen_enseignant_id_fkey;
ALTER TABLE ONLY tenant_ispm.sujet_examen DROP CONSTRAINT sujet_examen_ec_id_fkey;
ALTER TABLE ONLY tenant_ispm.stage DROP CONSTRAINT stage_rapporteur_id_fkey;
ALTER TABLE ONLY tenant_ispm.stage DROP CONSTRAINT stage_parcours_id_fkey;
ALTER TABLE ONLY tenant_ispm.stage DROP CONSTRAINT stage_etudiant_id_fkey;
ALTER TABLE ONLY tenant_ispm.stage DROP CONSTRAINT stage_encadrant_id_fkey;
ALTER TABLE ONLY tenant_ispm.stage DROP CONSTRAINT stage_annee_academique_id_fkey;
ALTER TABLE ONLY tenant_ispm.soutenance DROP CONSTRAINT soutenance_stage_id_fkey;
ALTER TABLE ONLY tenant_ispm.soutenance DROP CONSTRAINT soutenance_salle_id_fkey;
ALTER TABLE ONLY tenant_ispm.soutenance DROP CONSTRAINT soutenance_president_jury_id_fkey;
ALTER TABLE ONLY tenant_ispm.session_jwt DROP CONSTRAINT session_jwt_utilisateur_id_fkey;
ALTER TABLE ONLY tenant_ispm.session_examen DROP CONSTRAINT session_examen_annee_academique_id_fkey;
ALTER TABLE ONLY tenant_ispm.salle DROP CONSTRAINT salle_batiment_id_fkey;
ALTER TABLE ONLY tenant_ispm.resultat_ue DROP CONSTRAINT resultat_ue_ue_id_fkey;
ALTER TABLE ONLY tenant_ispm.resultat_ue DROP CONSTRAINT resultat_ue_resultat_semestre_id_fkey;
ALTER TABLE ONLY tenant_ispm.resultat_ue DROP CONSTRAINT resultat_ue_etudiant_id_fkey;
ALTER TABLE ONLY tenant_ispm.resultat_ue DROP CONSTRAINT resultat_ue_compensation_ue_id_fkey;
ALTER TABLE ONLY tenant_ispm.resultat_semestre DROP CONSTRAINT resultat_semestre_inscription_id_fkey;
ALTER TABLE ONLY tenant_ispm.resultat_semestre DROP CONSTRAINT resultat_semestre_etudiant_id_fkey;
ALTER TABLE ONLY tenant_ispm.resultat_semestre DROP CONSTRAINT resultat_semestre_deliberation_id_fkey;
ALTER TABLE ONLY tenant_ispm.resultat_deliberation DROP CONSTRAINT resultat_deliberation_pv_id_fkey;
ALTER TABLE ONLY tenant_ispm.resultat_deliberation DROP CONSTRAINT resultat_deliberation_etudiant_id_fkey;
ALTER TABLE ONLY tenant_ispm.reservation_salle DROP CONSTRAINT reservation_salle_salle_id_fkey;
ALTER TABLE ONLY tenant_ispm.reservation_salle DROP CONSTRAINT reservation_salle_demande_par_fkey;
ALTER TABLE ONLY tenant_ispm.reservation_salle DROP CONSTRAINT reservation_salle_approuve_par_fkey;
ALTER TABLE ONLY tenant_ispm.referentiel_competences DROP CONSTRAINT referentiel_competences_valide_par_fkey;
ALTER TABLE ONLY tenant_ispm.referentiel_competences DROP CONSTRAINT referentiel_competences_parcours_id_fkey;
ALTER TABLE ONLY tenant_ispm.recrutement DROP CONSTRAINT recrutement_responsable_id_fkey;
ALTER TABLE ONLY tenant_ispm.recrutement DROP CONSTRAINT recrutement_departement_id_fkey;
ALTER TABLE ONLY tenant_ispm.rattrapage DROP CONSTRAINT rattrapage_salle_id_fkey;
ALTER TABLE ONLY tenant_ispm.rattrapage DROP CONSTRAINT rattrapage_remplaceur_id_fkey;
ALTER TABLE ONLY tenant_ispm.rattrapage DROP CONSTRAINT rattrapage_planifie_par_fkey;
ALTER TABLE ONLY tenant_ispm.rattrapage DROP CONSTRAINT rattrapage_absence_id_fkey;
ALTER TABLE ONLY tenant_ispm.rapport_entretien DROP CONSTRAINT rapport_entretien_realise_par_fkey;
ALTER TABLE ONLY tenant_ispm.rapport_entretien DROP CONSTRAINT rapport_entretien_planning_id_fkey;
ALTER TABLE ONLY tenant_ispm.pv_deliberation DROP CONSTRAINT pv_deliberation_session_id_fkey;
ALTER TABLE ONLY tenant_ispm.pv_deliberation DROP CONSTRAINT pv_deliberation_president_jury_fkey;
ALTER TABLE ONLY tenant_ispm.pv_deliberation DROP CONSTRAINT pv_deliberation_parcours_id_fkey;
ALTER TABLE ONLY tenant_ispm.proces_verbal DROP CONSTRAINT proces_verbal_valide_par_fkey;
ALTER TABLE ONLY tenant_ispm.proces_verbal DROP CONSTRAINT proces_verbal_redige_par_fkey;
ALTER TABLE ONLY tenant_ispm.proces_verbal DROP CONSTRAINT proces_verbal_parcours_id_fkey;
ALTER TABLE ONLY tenant_ispm.proces_verbal DROP CONSTRAINT proces_verbal_annee_academique_id_fkey;
ALTER TABLE ONLY tenant_ispm.presence DROP CONSTRAINT presence_valide_par_fkey;
ALTER TABLE ONLY tenant_ispm.presence DROP CONSTRAINT presence_seance_id_fkey;
ALTER TABLE ONLY tenant_ispm.presence DROP CONSTRAINT presence_saisi_par_fkey;
ALTER TABLE ONLY tenant_ispm.presence DROP CONSTRAINT presence_etudiant_id_fkey;
ALTER TABLE ONLY tenant_ispm.planning_entretien DROP CONSTRAINT planning_entretien_salle_id_fkey;
ALTER TABLE ONLY tenant_ispm.planning_entretien DROP CONSTRAINT planning_entretien_responsable_id_fkey;
ALTER TABLE ONLY tenant_ispm.planning_entretien DROP CONSTRAINT planning_entretien_batiment_id_fkey;
ALTER TABLE ONLY tenant_ispm.parcours DROP CONSTRAINT parcours_secretaire_id_fkey;
ALTER TABLE ONLY tenant_ispm.parcours DROP CONSTRAINT parcours_responsable_id_fkey;
ALTER TABLE ONLY tenant_ispm.parcours DROP CONSTRAINT parcours_departement_id_fkey;
ALTER TABLE ONLY tenant_ispm.paiement_inscription DROP CONSTRAINT paiement_inscription_valide_par_fkey;
ALTER TABLE ONLY tenant_ispm.paiement_inscription DROP CONSTRAINT paiement_inscription_inscription_id_fkey;
ALTER TABLE ONLY tenant_ispm.paiement DROP CONSTRAINT paiement_inscription_id_fkey;
ALTER TABLE ONLY tenant_ispm.paiement_inscription DROP CONSTRAINT paiement_inscription_etudiant_id_fkey;
ALTER TABLE ONLY tenant_ispm.paiement DROP CONSTRAINT paiement_echeancier_id_fkey;
ALTER TABLE ONLY tenant_ispm.paiement DROP CONSTRAINT paiement_caissier_id_fkey;
ALTER TABLE ONLY tenant_ispm.notification DROP CONSTRAINT notification_utilisateur_id_fkey;
ALTER TABLE ONLY tenant_ispm.note DROP CONSTRAINT note_valide_par_fkey;
ALTER TABLE ONLY tenant_ispm.note DROP CONSTRAINT note_ue_id_fkey;
ALTER TABLE ONLY tenant_ispm.note DROP CONSTRAINT note_session_id_fkey;
ALTER TABLE ONLY tenant_ispm.note DROP CONSTRAINT note_saisi_par_fkey;
ALTER TABLE ONLY tenant_ispm.note DROP CONSTRAINT note_etudiant_id_fkey;
ALTER TABLE ONLY tenant_ispm.note DROP CONSTRAINT note_ec_id_fkey;
ALTER TABLE ONLY tenant_ispm.note_derogatoire DROP CONSTRAINT note_derogatoire_valide_par_scolarite_fkey;
ALTER TABLE ONLY tenant_ispm.note_derogatoire DROP CONSTRAINT note_derogatoire_valide_par_fkey;
ALTER TABLE ONLY tenant_ispm.note_derogatoire DROP CONSTRAINT note_derogatoire_ue_id_fkey;
ALTER TABLE ONLY tenant_ispm.note_derogatoire DROP CONSTRAINT note_derogatoire_session_examen_id_fkey;
ALTER TABLE ONLY tenant_ispm.note_derogatoire DROP CONSTRAINT note_derogatoire_saisie_par_fkey;
ALTER TABLE ONLY tenant_ispm.note_derogatoire DROP CONSTRAINT note_derogatoire_etudiant_id_fkey;
ALTER TABLE ONLY tenant_ispm.note_derogatoire DROP CONSTRAINT note_derogatoire_ec_id_fkey;
ALTER TABLE ONLY tenant_ispm.mouvement_stock DROP CONSTRAINT mouvement_stock_utilisateur_id_fkey;
ALTER TABLE ONLY tenant_ispm.mouvement_stock DROP CONSTRAINT mouvement_stock_stock_id_fkey;
ALTER TABLE ONLY tenant_ispm.message DROP CONSTRAINT message_parent_id_fkey;
ALTER TABLE ONLY tenant_ispm.message DROP CONSTRAINT message_expediteur_id_fkey;
ALTER TABLE ONLY tenant_ispm.message DROP CONSTRAINT message_destinataire_id_fkey;
ALTER TABLE ONLY tenant_ispm.inscription DROP CONSTRAINT inscription_validee_par_fkey;
ALTER TABLE ONLY tenant_ispm.inscription DROP CONSTRAINT inscription_parcours_id_fkey;
ALTER TABLE ONLY tenant_ispm.inscription DROP CONSTRAINT inscription_etudiant_id_fkey;
ALTER TABLE ONLY tenant_ispm.inscription DROP CONSTRAINT inscription_annee_academique_id_fkey;
ALTER TABLE ONLY tenant_ispm.incident_disciplinaire DROP CONSTRAINT incident_disciplinaire_rapporte_par_fkey;
ALTER TABLE ONLY tenant_ispm.incident_disciplinaire DROP CONSTRAINT incident_disciplinaire_etudiant_id_fkey;
ALTER TABLE ONLY tenant_ispm.incident_disciplinaire DROP CONSTRAINT incident_disciplinaire_arbitre_par_fkey;
ALTER TABLE ONLY tenant_ispm.heure_complementaire DROP CONSTRAINT heure_complementaire_valide_par_fkey;
ALTER TABLE ONLY tenant_ispm.heure_complementaire DROP CONSTRAINT heure_complementaire_enseignant_id_fkey;
ALTER TABLE ONLY tenant_ispm.grille_tarifaire DROP CONSTRAINT grille_tarifaire_parcours_id_fkey;
ALTER TABLE ONLY tenant_ispm.grille_tarifaire DROP CONSTRAINT grille_tarifaire_annee_academique_id_fkey;
ALTER TABLE ONLY tenant_ispm.secretaire_parcours DROP CONSTRAINT fk_secretaire_parcours_parcours;
ALTER TABLE ONLY tenant_ispm.message_enseignant DROP CONSTRAINT fk_parcours;
ALTER TABLE ONLY tenant_ispm.message_enseignant DROP CONSTRAINT fk_niveau;
ALTER TABLE ONLY tenant_ispm.message_destinataire DROP CONSTRAINT fk_message;
ALTER TABLE ONLY tenant_ispm.message_destinataire DROP CONSTRAINT fk_etudiant_dest;
ALTER TABLE ONLY tenant_ispm.message_enseignant DROP CONSTRAINT fk_etudiant;
ALTER TABLE ONLY tenant_ispm.message_enseignant DROP CONSTRAINT fk_enseignant;
ALTER TABLE ONLY tenant_ispm.fiche_suivi_stage DROP CONSTRAINT fiche_suivi_stage_stage_id_fkey;
ALTER TABLE ONLY tenant_ispm.fiche_suivi_stage DROP CONSTRAINT fiche_suivi_stage_auteur_id_fkey;
ALTER TABLE ONLY tenant_ispm.fiche_paie DROP CONSTRAINT fiche_paie_contrat_id_fkey;
ALTER TABLE ONLY tenant_ispm.evaluation_soutenance DROP CONSTRAINT evaluation_soutenance_soutenance_id_fkey;
ALTER TABLE ONLY tenant_ispm.evaluation_soutenance DROP CONSTRAINT evaluation_soutenance_evaluateur_id_fkey;
ALTER TABLE ONLY tenant_ispm.etudiant DROP CONSTRAINT etudiant_utilisateur_id_fkey;
ALTER TABLE ONLY tenant_ispm.enseignant DROP CONSTRAINT enseignant_utilisateur_id_fkey;
ALTER TABLE ONLY tenant_ispm.enseignant DROP CONSTRAINT enseignant_departement_id_fkey;
ALTER TABLE ONLY tenant_ispm.emploi_du_temps DROP CONSTRAINT emploi_du_temps_salle_id_fkey;
ALTER TABLE ONLY tenant_ispm.emploi_du_temps DROP CONSTRAINT emploi_du_temps_annee_academique_id_fkey;
ALTER TABLE ONLY tenant_ispm.emploi_du_temps DROP CONSTRAINT emploi_du_temps_affectation_id_fkey;
ALTER TABLE ONLY tenant_ispm.element_constitutif DROP CONSTRAINT element_constitutif_ue_id_fkey;
ALTER TABLE ONLY tenant_ispm.echeancier DROP CONSTRAINT echeancier_inscription_id_fkey;
ALTER TABLE ONLY tenant_ispm.dossier_etudiant DROP CONSTRAINT dossier_etudiant_traite_par_fkey;
ALTER TABLE ONLY tenant_ispm.dossier_etudiant DROP CONSTRAINT dossier_etudiant_etudiant_id_fkey;
ALTER TABLE ONLY tenant_ispm.dossier_etudiant DROP CONSTRAINT dossier_etudiant_demande_par_fkey;
ALTER TABLE ONLY tenant_ispm.diplome DROP CONSTRAINT diplome_parcours_id_fkey;
ALTER TABLE ONLY tenant_ispm.diplome DROP CONSTRAINT diplome_inscription_id_fkey;
ALTER TABLE ONLY tenant_ispm.diplome DROP CONSTRAINT diplome_etudiant_id_fkey;
ALTER TABLE ONLY tenant_ispm.diplome DROP CONSTRAINT diplome_delivre_par_fkey;
ALTER TABLE ONLY tenant_ispm.depense DROP CONSTRAINT depense_demande_par_fkey;
ALTER TABLE ONLY tenant_ispm.depense DROP CONSTRAINT depense_budget_id_fkey;
ALTER TABLE ONLY tenant_ispm.depense DROP CONSTRAINT depense_approuve_par_fkey;
ALTER TABLE ONLY tenant_ispm.depense DROP CONSTRAINT depense_annee_academique_id_fkey;
ALTER TABLE ONLY tenant_ispm.departement DROP CONSTRAINT departement_responsable_id_fkey;
ALTER TABLE ONLY tenant_ispm.demande_ressource DROP CONSTRAINT demande_ressource_traite_par_fkey;
ALTER TABLE ONLY tenant_ispm.demande_ressource DROP CONSTRAINT demande_ressource_demandeur_id_fkey;
ALTER TABLE ONLY tenant_ispm.demande_etudiant DROP CONSTRAINT demande_etudiant_traite_par_fkey;
ALTER TABLE ONLY tenant_ispm.demande_etudiant DROP CONSTRAINT demande_etudiant_etudiant_id_fkey;
ALTER TABLE ONLY tenant_ispm.deliberation DROP CONSTRAINT deliberation_validee_par_fkey;
ALTER TABLE ONLY tenant_ispm.deliberation DROP CONSTRAINT deliberation_session_examen_id_fkey;
ALTER TABLE ONLY tenant_ispm.deliberation DROP CONSTRAINT deliberation_president_jury_id_fkey;
ALTER TABLE ONLY tenant_ispm.deliberation DROP CONSTRAINT deliberation_parcours_id_fkey;
ALTER TABLE ONLY tenant_ispm.convocation DROP CONSTRAINT convocation_session_examen_id_fkey;
ALTER TABLE ONLY tenant_ispm.convocation DROP CONSTRAINT convocation_salle_id_fkey;
ALTER TABLE ONLY tenant_ispm.convocation DROP CONSTRAINT convocation_genere_par_fkey;
ALTER TABLE ONLY tenant_ispm.convocation DROP CONSTRAINT convocation_etudiant_id_fkey;
ALTER TABLE ONLY tenant_ispm.contrat_personnel DROP CONSTRAINT contrat_personnel_utilisateur_id_fkey;
ALTER TABLE ONLY tenant_ispm.contrat_personnel DROP CONSTRAINT contrat_personnel_departement_id_fkey;
ALTER TABLE ONLY tenant_ispm.conge_personnel DROP CONSTRAINT conge_personnel_utilisateur_id_fkey;
ALTER TABLE ONLY tenant_ispm.conge_personnel DROP CONSTRAINT conge_personnel_approuve_par_fkey;
ALTER TABLE ONLY tenant_ispm.candidature DROP CONSTRAINT candidature_recrutement_id_fkey;
ALTER TABLE ONLY tenant_ispm.calendrier_academique DROP CONSTRAINT calendrier_academique_parcours_id_fkey;
ALTER TABLE ONLY tenant_ispm.calendrier_academique DROP CONSTRAINT calendrier_academique_annee_academique_id_fkey;
ALTER TABLE ONLY tenant_ispm.budget DROP CONSTRAINT budget_departement_id_fkey;
ALTER TABLE ONLY tenant_ispm.budget DROP CONSTRAINT budget_created_by_fkey;
ALTER TABLE ONLY tenant_ispm.budget DROP CONSTRAINT budget_annee_academique_id_fkey;
ALTER TABLE ONLY tenant_ispm.archive_scolarite DROP CONSTRAINT archive_scolarite_etudiant_id_fkey;
ALTER TABLE ONLY tenant_ispm.archive_scolarite DROP CONSTRAINT archive_scolarite_archive_par_fkey;
ALTER TABLE ONLY tenant_ispm.annonce DROP CONSTRAINT annonce_parcours_id_fkey;
ALTER TABLE ONLY tenant_ispm.annonce DROP CONSTRAINT annonce_auteur_id_fkey;
ALTER TABLE ONLY tenant_ispm.affectation_cours DROP CONSTRAINT affectation_cours_valide_par_fkey;
ALTER TABLE ONLY tenant_ispm.affectation_cours DROP CONSTRAINT affectation_cours_ue_id_fkey;
ALTER TABLE ONLY tenant_ispm.affectation_cours DROP CONSTRAINT affectation_cours_enseignant_id_fkey;
ALTER TABLE ONLY tenant_ispm.affectation_cours DROP CONSTRAINT affectation_cours_ec_id_fkey;
ALTER TABLE ONLY tenant_ispm.affectation_cours DROP CONSTRAINT affectation_cours_annee_academique_id_fkey;
ALTER TABLE ONLY tenant_ispm.absence_enseignant DROP CONSTRAINT absence_enseignant_validee_par_fkey;
ALTER TABLE ONLY tenant_ispm.absence_enseignant DROP CONSTRAINT absence_enseignant_seance_id_fkey;
ALTER TABLE ONLY tenant_ispm.absence_enseignant DROP CONSTRAINT absence_enseignant_enseignant_id_fkey;
ALTER TABLE ONLY tenant_ispm.absence_enseignant DROP CONSTRAINT absence_enseignant_declaree_par_fkey;
DROP TRIGGER update_verrouillage_notes_updated_at ON tenant_ispm.verrouillage_notes;
DROP TRIGGER update_transfert_etudiant_updated_at ON tenant_ispm.transfert_etudiant;
DROP TRIGGER update_support_cours_updated_at ON tenant_ispm.support_cours;
DROP TRIGGER update_suplement_diplome_updated_at ON tenant_ispm.suplement_diplome;
DROP TRIGGER update_stage_updated_at ON tenant_ispm.stage;
DROP TRIGGER update_soutenance_updated_at ON tenant_ispm.soutenance;
DROP TRIGGER update_resultat_ue_updated_at ON tenant_ispm.resultat_ue;
DROP TRIGGER update_resultat_semestre_updated_at ON tenant_ispm.resultat_semestre;
DROP TRIGGER update_recrutement_updated_at ON tenant_ispm.recrutement;
DROP TRIGGER update_heure_complementaire_updated_at ON tenant_ispm.heure_complementaire;
DROP TRIGGER update_evaluation_personnel_updated_at ON tenant_ispm.evaluation_personnel;
DROP TRIGGER update_diplome_updated_at ON tenant_ispm.diplome;
DROP TRIGGER update_demande_ressource_updated_at ON tenant_ispm.demande_ressource;
DROP TRIGGER update_deliberation_updated_at ON tenant_ispm.deliberation;
DROP TRIGGER update_declaration_sociale_updated_at ON tenant_ispm.declaration_sociale;
DROP TRIGGER update_candidature_updated_at ON tenant_ispm.candidature;
DROP TRIGGER update_archive_scolarite_updated_at ON tenant_ispm.archive_scolarite;
DROP TRIGGER trigger_update_paiement_inscription_updated_at ON tenant_ispm.paiement_inscription;
DROP TRIGGER trg_updated_at ON tenant_ispm.utilisateur;
DROP TRIGGER trg_updated_at ON tenant_ispm.ticket_maintenance;
DROP TRIGGER trg_updated_at ON tenant_ispm.sujet_examen;
DROP TRIGGER trg_updated_at ON tenant_ispm.referentiel_competences;
DROP TRIGGER trg_updated_at ON tenant_ispm.rattrapage;
DROP TRIGGER trg_updated_at ON tenant_ispm.pv_deliberation;
DROP TRIGGER trg_updated_at ON tenant_ispm.proces_verbal;
DROP TRIGGER trg_updated_at ON tenant_ispm.presence;
DROP TRIGGER trg_updated_at ON tenant_ispm.parcours;
DROP TRIGGER trg_updated_at ON tenant_ispm.note_derogatoire;
DROP TRIGGER trg_updated_at ON tenant_ispm.note;
DROP TRIGGER trg_updated_at ON tenant_ispm.inscription;
DROP TRIGGER trg_updated_at ON tenant_ispm.enseignant;
DROP TRIGGER trg_updated_at ON tenant_ispm.emploi_du_temps;
DROP TRIGGER trg_updated_at ON tenant_ispm.dossier_etudiant;
DROP TRIGGER trg_updated_at ON tenant_ispm.depense;
DROP TRIGGER trg_updated_at ON tenant_ispm.demande_etudiant;
DROP TRIGGER trg_updated_at ON tenant_ispm.convocation;
DROP TRIGGER trg_updated_at ON tenant_ispm.contrat_personnel;
DROP TRIGGER trg_updated_at ON tenant_ispm.budget;
DROP TRIGGER trg_updated_at ON tenant_ispm.annonce;
DROP TRIGGER trg_updated_at ON tenant_ispm.affectation_cours;
DROP TRIGGER trg_updated_at ON tenant_ispm.absence_enseignant;
DROP TRIGGER trg_numero_recu ON tenant_ispm.paiement;
DROP TRIGGER trg_notif_paiement ON tenant_ispm.paiement;
DROP TRIGGER trg_note_verrouille ON tenant_ispm.note;
DROP TRIGGER trg_alerte_stock ON tenant_ispm.stock;
DROP TRIGGER prevent_locked_note_modification ON tenant_ispm.note;
DROP INDEX tenant_ispm.idx_verrouillage_statut;
DROP INDEX tenant_ispm.idx_verrouillage_session;
DROP INDEX tenant_ispm.idx_verrouillage_etudiant;
DROP INDEX tenant_ispm.idx_utilisateur_role;
DROP INDEX tenant_ispm.idx_utilisateur_email;
DROP INDEX tenant_ispm.idx_ue_enseignant;
DROP INDEX tenant_ispm.idx_transfert_etudiant;
DROP INDEX tenant_ispm.idx_transfert_decision;
DROP INDEX tenant_ispm.idx_ticket_statut;
DROP INDEX tenant_ispm.idx_tenant_ispm_utilisateur_tenant_id;
DROP INDEX tenant_ispm.idx_tenant_ispm_utilisateur_role;
DROP INDEX tenant_ispm.idx_tenant_ispm_utilisateur_email;
DROP INDEX tenant_ispm.idx_tenant_ispm_utilisateur_actif;
DROP INDEX tenant_ispm.idx_support_cours_ec;
DROP INDEX tenant_ispm.idx_support_cours_date;
DROP INDEX tenant_ispm.idx_support_cours_auteur;
DROP INDEX tenant_ispm.idx_sujet_statut;
DROP INDEX tenant_ispm.idx_sujet_session;
DROP INDEX tenant_ispm.idx_sujet_enseignant;
DROP INDEX tenant_ispm.idx_sujet_date;
DROP INDEX tenant_ispm.idx_stock_seuil;
DROP INDEX tenant_ispm.idx_stage_statut;
DROP INDEX tenant_ispm.idx_stage_rapporteur;
DROP INDEX tenant_ispm.idx_stage_etudiant;
DROP INDEX tenant_ispm.idx_stage_encadrant;
DROP INDEX tenant_ispm.idx_soutenance_statut;
DROP INDEX tenant_ispm.idx_soutenance_stage;
DROP INDEX tenant_ispm.idx_soutenance_date;
DROP INDEX tenant_ispm.idx_session_jwt_user;
DROP INDEX tenant_ispm.idx_session_jwt_token;
DROP INDEX tenant_ispm.idx_secretaire_parcours_unique;
DROP INDEX tenant_ispm.idx_secretaire_parcours_secretaire;
DROP INDEX tenant_ispm.idx_secretaire_parcours_parcours;
DROP INDEX tenant_ispm.idx_resultat_ue_ue;
DROP INDEX tenant_ispm.idx_resultat_ue_statut;
DROP INDEX tenant_ispm.idx_resultat_ue_etudiant;
DROP INDEX tenant_ispm.idx_resultat_semestre_statut;
DROP INDEX tenant_ispm.idx_resultat_semestre_inscription;
DROP INDEX tenant_ispm.idx_resultat_semestre_etudiant;
DROP INDEX tenant_ispm.idx_resultat_semestre_deliberation;
DROP INDEX tenant_ispm.idx_referentiel_statut;
DROP INDEX tenant_ispm.idx_referentiel_parcours;
DROP INDEX tenant_ispm.idx_referentiel_created;
DROP INDEX tenant_ispm.idx_recrutement_statut;
DROP INDEX tenant_ispm.idx_recrutement_departement;
DROP INDEX tenant_ispm.idx_recrutement_date_cloture;
DROP INDEX tenant_ispm.idx_rattrapage_date;
DROP INDEX tenant_ispm.idx_rattrapage_absence;
DROP INDEX tenant_ispm.idx_pv_statut;
DROP INDEX tenant_ispm.idx_pv_session;
DROP INDEX tenant_ispm.idx_pv_parcours;
DROP INDEX tenant_ispm.idx_pv_date;
DROP INDEX tenant_ispm.idx_pv_annee;
DROP INDEX tenant_ispm.idx_presence_surveillance_seance;
DROP INDEX tenant_ispm.idx_presence_surveillance_etudiant;
DROP INDEX tenant_ispm.idx_presence_surveillance_date;
DROP INDEX tenant_ispm.idx_presence_statut;
DROP INDEX tenant_ispm.idx_presence_seance;
DROP INDEX tenant_ispm.idx_presence_etudiant;
DROP INDEX tenant_ispm.idx_pointage_qr_seance;
DROP INDEX tenant_ispm.idx_pointage_qr_etudiant;
DROP INDEX tenant_ispm.idx_parcours_secretaire;
DROP INDEX tenant_ispm.idx_paiement_statut;
DROP INDEX tenant_ispm.idx_paiement_inscription_statut;
DROP INDEX tenant_ispm.idx_paiement_inscription_reference;
DROP INDEX tenant_ispm.idx_paiement_inscription_inscription;
DROP INDEX tenant_ispm.idx_paiement_inscription_etudiant;
DROP INDEX tenant_ispm.idx_paiement_inscription_date;
DROP INDEX tenant_ispm.idx_paiement_inscription;
DROP INDEX tenant_ispm.idx_paiement_date;
DROP INDEX tenant_ispm.idx_notification_user;
DROP INDEX tenant_ispm.idx_note_verrouille;
DROP INDEX tenant_ispm.idx_note_ue;
DROP INDEX tenant_ispm.idx_note_session;
DROP INDEX tenant_ispm.idx_note_etudiant;
DROP INDEX tenant_ispm.idx_note_ec;
DROP INDEX tenant_ispm.idx_note_derog_statut;
DROP INDEX tenant_ispm.idx_note_derog_etudiant;
DROP INDEX tenant_ispm.idx_niveau_etude_code;
DROP INDEX tenant_ispm.idx_message_type;
DROP INDEX tenant_ispm.idx_message_enseignant_id;
DROP INDEX tenant_ispm.idx_message_date;
DROP INDEX tenant_ispm.idx_inscription_parcours_annee;
DROP INDEX tenant_ispm.idx_inscription_etudiant;
DROP INDEX tenant_ispm.idx_heure_comp_statut;
DROP INDEX tenant_ispm.idx_heure_comp_enseignant;
DROP INDEX tenant_ispm.idx_heure_comp_date;
DROP INDEX tenant_ispm.idx_fiche_suivi_stage;
DROP INDEX tenant_ispm.idx_fiche_suivi_date;
DROP INDEX tenant_ispm.idx_evaluation_soutenance;
DROP INDEX tenant_ispm.idx_evaluation_evaluateur;
DROP INDEX tenant_ispm.idx_eval_utilisateur;
DROP INDEX tenant_ispm.idx_eval_statut;
DROP INDEX tenant_ispm.idx_eval_evaluateur;
DROP INDEX tenant_ispm.idx_eval_date;
DROP INDEX tenant_ispm.idx_eval_annee;
DROP INDEX tenant_ispm.idx_etudiant_nom;
DROP INDEX tenant_ispm.idx_etudiant_matricule;
DROP INDEX tenant_ispm.idx_edt_salle;
DROP INDEX tenant_ispm.idx_edt_date;
DROP INDEX tenant_ispm.idx_edt_affectation;
DROP INDEX tenant_ispm.idx_echeancier_statut;
DROP INDEX tenant_ispm.idx_dossier_type;
DROP INDEX tenant_ispm.idx_dossier_statut;
DROP INDEX tenant_ispm.idx_dossier_etudiant_id;
DROP INDEX tenant_ispm.idx_dossier_archive;
DROP INDEX tenant_ispm.idx_diplome_statut;
DROP INDEX tenant_ispm.idx_diplome_parcours;
DROP INDEX tenant_ispm.idx_diplome_numero;
DROP INDEX tenant_ispm.idx_diplome_etudiant;
DROP INDEX tenant_ispm.idx_destinataire_message;
DROP INDEX tenant_ispm.idx_destinataire_lu;
DROP INDEX tenant_ispm.idx_destinataire_etudiant;
DROP INDEX tenant_ispm.idx_demande_statut;
DROP INDEX tenant_ispm.idx_demande_ressource_statut;
DROP INDEX tenant_ispm.idx_demande_ressource_demandeur;
DROP INDEX tenant_ispm.idx_demande_ressource_date;
DROP INDEX tenant_ispm.idx_demande_etudiant;
DROP INDEX tenant_ispm.idx_deliberation_statut;
DROP INDEX tenant_ispm.idx_deliberation_session;
DROP INDEX tenant_ispm.idx_deliberation_parcours;
DROP INDEX tenant_ispm.idx_delegation_revoquee;
DROP INDEX tenant_ispm.idx_delegation_delegataire;
DROP INDEX tenant_ispm.idx_delegation_dates;
DROP INDEX tenant_ispm.idx_decl_sociale_type;
DROP INDEX tenant_ispm.idx_decl_sociale_statut;
DROP INDEX tenant_ispm.idx_decl_sociale_periode;
DROP INDEX tenant_ispm.idx_convocation_statut;
DROP INDEX tenant_ispm.idx_convocation_session;
DROP INDEX tenant_ispm.idx_convocation_genere;
DROP INDEX tenant_ispm.idx_convocation_etudiant;
DROP INDEX tenant_ispm.idx_convocation_date;
DROP INDEX tenant_ispm.idx_convention_type_partenaire;
DROP INDEX tenant_ispm.idx_convention_statut;
DROP INDEX tenant_ispm.idx_convention_date_proposee;
DROP INDEX tenant_ispm.idx_configuration_examen_session;
DROP INDEX tenant_ispm.idx_configuration_examen_salle;
DROP INDEX tenant_ispm.idx_candidature_statut;
DROP INDEX tenant_ispm.idx_candidature_recrutement;
DROP INDEX tenant_ispm.idx_candidature_email;
DROP INDEX tenant_ispm.idx_attestation_statut;
DROP INDEX tenant_ispm.idx_attestation_etudiant;
DROP INDEX tenant_ispm.idx_archive_type;
DROP INDEX tenant_ispm.idx_archive_etudiant;
DROP INDEX tenant_ispm.idx_archive_annee;
DROP INDEX tenant_ispm.idx_annonce_publie;
DROP INDEX tenant_ispm.idx_alerte_discipline_statut;
DROP INDEX tenant_ispm.idx_alerte_discipline_etudiant;
DROP INDEX tenant_ispm.idx_absence_statut;
DROP INDEX tenant_ispm.idx_absence_enseignant;
DROP INDEX tenant_ispm.idx_absence_date;
ALTER TABLE ONLY tenant_ispm.verrouillage_notes DROP CONSTRAINT verrouillage_notes_pkey;
ALTER TABLE ONLY tenant_ispm.verrouillage_notes DROP CONSTRAINT verrouillage_notes_deliberation_id_etudiant_id_session_exam_key;
ALTER TABLE ONLY tenant_ispm.utilisateur DROP CONSTRAINT utilisateur_pkey;
ALTER TABLE ONLY tenant_ispm.utilisateur DROP CONSTRAINT utilisateur_email_key;
ALTER TABLE ONLY tenant_ispm.unite_enseignement DROP CONSTRAINT unite_enseignement_pkey;
ALTER TABLE ONLY tenant_ispm.unite_enseignement DROP CONSTRAINT unite_enseignement_parcours_id_code_key;
ALTER TABLE ONLY tenant_ispm.paiement_inscription DROP CONSTRAINT unique_reference_paiement;
ALTER TABLE ONLY tenant_ispm.message_destinataire DROP CONSTRAINT unique_message_etudiant;
ALTER TABLE ONLY tenant_ispm.transfert_etudiant DROP CONSTRAINT transfert_etudiant_pkey;
ALTER TABLE ONLY tenant_ispm.ticket_maintenance DROP CONSTRAINT ticket_maintenance_pkey;
ALTER TABLE ONLY tenant_ispm.support_cours DROP CONSTRAINT support_cours_pkey;
ALTER TABLE ONLY tenant_ispm.suplement_diplome DROP CONSTRAINT suplement_diplome_pkey;
ALTER TABLE ONLY tenant_ispm.sujet_examen DROP CONSTRAINT sujet_examen_pkey;
ALTER TABLE ONLY tenant_ispm.stock DROP CONSTRAINT stock_reference_key;
ALTER TABLE ONLY tenant_ispm.stock DROP CONSTRAINT stock_pkey;
ALTER TABLE ONLY tenant_ispm.stage DROP CONSTRAINT stage_pkey;
ALTER TABLE ONLY tenant_ispm.soutenance DROP CONSTRAINT soutenance_stage_id_key;
ALTER TABLE ONLY tenant_ispm.soutenance DROP CONSTRAINT soutenance_pkey;
ALTER TABLE ONLY tenant_ispm.session_jwt DROP CONSTRAINT session_jwt_refresh_token_key;
ALTER TABLE ONLY tenant_ispm.session_jwt DROP CONSTRAINT session_jwt_pkey;
ALTER TABLE ONLY tenant_ispm.session_examen DROP CONSTRAINT session_examen_pkey;
ALTER TABLE ONLY tenant_ispm.secretaire_parcours DROP CONSTRAINT secretaire_parcours_pkey;
ALTER TABLE ONLY tenant_ispm.salle DROP CONSTRAINT salle_pkey;
ALTER TABLE ONLY tenant_ispm.salle DROP CONSTRAINT salle_code_key;
ALTER TABLE ONLY tenant_ispm.resultat_ue DROP CONSTRAINT resultat_ue_pkey;
ALTER TABLE ONLY tenant_ispm.resultat_ue DROP CONSTRAINT resultat_ue_etudiant_id_ue_id_resultat_semestre_id_key;
ALTER TABLE ONLY tenant_ispm.resultat_semestre DROP CONSTRAINT resultat_semestre_pkey;
ALTER TABLE ONLY tenant_ispm.resultat_semestre DROP CONSTRAINT resultat_semestre_etudiant_id_inscription_id_semestre_annee_key;
ALTER TABLE ONLY tenant_ispm.resultat_deliberation DROP CONSTRAINT resultat_deliberation_pv_id_etudiant_id_key;
ALTER TABLE ONLY tenant_ispm.resultat_deliberation DROP CONSTRAINT resultat_deliberation_pkey;
ALTER TABLE ONLY tenant_ispm.reservation_salle DROP CONSTRAINT reservation_salle_pkey;
ALTER TABLE ONLY tenant_ispm.referentiel_competences DROP CONSTRAINT referentiel_competences_pkey;
ALTER TABLE ONLY tenant_ispm.recrutement DROP CONSTRAINT recrutement_pkey;
ALTER TABLE ONLY tenant_ispm.rattrapage DROP CONSTRAINT rattrapage_pkey;
ALTER TABLE ONLY tenant_ispm.rapport_entretien DROP CONSTRAINT rapport_entretien_pkey;
ALTER TABLE ONLY tenant_ispm.pv_deliberation DROP CONSTRAINT pv_deliberation_pkey;
ALTER TABLE ONLY tenant_ispm.proces_verbal DROP CONSTRAINT proces_verbal_pkey;
ALTER TABLE ONLY tenant_ispm.proces_verbal DROP CONSTRAINT proces_verbal_numero_key;
ALTER TABLE ONLY tenant_ispm.presence_surveillance DROP CONSTRAINT presence_surveillance_pkey;
ALTER TABLE ONLY tenant_ispm.presence DROP CONSTRAINT presence_pkey;
ALTER TABLE ONLY tenant_ispm.presence DROP CONSTRAINT presence_etudiant_id_seance_id_key;
ALTER TABLE ONLY tenant_ispm.pointage_qr DROP CONSTRAINT pointage_qr_pkey;
ALTER TABLE ONLY tenant_ispm.pointage_qr DROP CONSTRAINT pointage_qr_code_qr_key;
ALTER TABLE ONLY tenant_ispm.planning_entretien DROP CONSTRAINT planning_entretien_pkey;
ALTER TABLE ONLY tenant_ispm.permissions_portail DROP CONSTRAINT permissions_portail_type_portail_permission_key_key;
ALTER TABLE ONLY tenant_ispm.permissions_portail DROP CONSTRAINT permissions_portail_pkey;
ALTER TABLE ONLY tenant_ispm.parcours DROP CONSTRAINT parcours_pkey;
ALTER TABLE ONLY tenant_ispm.parcours DROP CONSTRAINT parcours_code_key;
ALTER TABLE ONLY tenant_ispm.paiement DROP CONSTRAINT paiement_reference_key;
ALTER TABLE ONLY tenant_ispm.paiement DROP CONSTRAINT paiement_pkey;
ALTER TABLE ONLY tenant_ispm.paiement DROP CONSTRAINT paiement_numero_recu_key;
ALTER TABLE ONLY tenant_ispm.paiement_inscription DROP CONSTRAINT paiement_inscription_pkey;
ALTER TABLE ONLY tenant_ispm.notification DROP CONSTRAINT notification_pkey;
ALTER TABLE ONLY tenant_ispm.note DROP CONSTRAINT note_pkey;
ALTER TABLE ONLY tenant_ispm.note DROP CONSTRAINT note_etudiant_id_ec_id_session_id_key;
ALTER TABLE ONLY tenant_ispm.note_derogatoire DROP CONSTRAINT note_derogatoire_pkey;
ALTER TABLE ONLY tenant_ispm.niveau_etude DROP CONSTRAINT niveau_etude_pkey;
ALTER TABLE ONLY tenant_ispm.niveau_etude DROP CONSTRAINT niveau_etude_code_key;
ALTER TABLE ONLY tenant_ispm.mouvement_stock DROP CONSTRAINT mouvement_stock_pkey;
ALTER TABLE ONLY tenant_ispm.message DROP CONSTRAINT message_pkey;
ALTER TABLE ONLY tenant_ispm.message_enseignant DROP CONSTRAINT message_enseignant_pkey;
ALTER TABLE ONLY tenant_ispm.message_destinataire DROP CONSTRAINT message_destinataire_pkey;
ALTER TABLE ONLY tenant_ispm.inscription DROP CONSTRAINT inscription_pkey;
ALTER TABLE ONLY tenant_ispm.inscription DROP CONSTRAINT inscription_numero_carte_key;
ALTER TABLE ONLY tenant_ispm.inscription DROP CONSTRAINT inscription_etudiant_id_parcours_id_annee_academique_id_key;
ALTER TABLE ONLY tenant_ispm.incident_disciplinaire DROP CONSTRAINT incident_disciplinaire_pkey;
ALTER TABLE ONLY tenant_ispm.heure_complementaire DROP CONSTRAINT heure_complementaire_pkey;
ALTER TABLE ONLY tenant_ispm.grille_tarifaire DROP CONSTRAINT grille_tarifaire_pkey;
ALTER TABLE ONLY tenant_ispm.grille_tarifaire DROP CONSTRAINT grille_tarifaire_parcours_id_annee_academique_id_annee_nive_key;
ALTER TABLE ONLY tenant_ispm.fiche_suivi_stage DROP CONSTRAINT fiche_suivi_stage_pkey;
ALTER TABLE ONLY tenant_ispm.fiche_paie DROP CONSTRAINT fiche_paie_pkey;
ALTER TABLE ONLY tenant_ispm.fiche_paie DROP CONSTRAINT fiche_paie_contrat_id_annee_mois_key;
ALTER TABLE ONLY tenant_ispm.evaluation_soutenance DROP CONSTRAINT evaluation_soutenance_soutenance_id_evaluateur_id_key;
ALTER TABLE ONLY tenant_ispm.evaluation_soutenance DROP CONSTRAINT evaluation_soutenance_pkey;
ALTER TABLE ONLY tenant_ispm.evaluation_personnel DROP CONSTRAINT evaluation_personnel_pkey;
ALTER TABLE ONLY tenant_ispm.etudiant DROP CONSTRAINT etudiant_utilisateur_id_key;
ALTER TABLE ONLY tenant_ispm.etudiant DROP CONSTRAINT etudiant_pkey;
ALTER TABLE ONLY tenant_ispm.etudiant DROP CONSTRAINT etudiant_matricule_key;
ALTER TABLE ONLY tenant_ispm.enseignant DROP CONSTRAINT enseignant_utilisateur_id_key;
ALTER TABLE ONLY tenant_ispm.enseignant DROP CONSTRAINT enseignant_pkey;
ALTER TABLE ONLY tenant_ispm.enseignant DROP CONSTRAINT enseignant_matricule_key;
ALTER TABLE ONLY tenant_ispm.emploi_du_temps DROP CONSTRAINT emploi_du_temps_pkey;
ALTER TABLE ONLY tenant_ispm.element_constitutif DROP CONSTRAINT element_constitutif_ue_id_code_key;
ALTER TABLE ONLY tenant_ispm.element_constitutif DROP CONSTRAINT element_constitutif_pkey;
ALTER TABLE ONLY tenant_ispm.echeancier DROP CONSTRAINT echeancier_pkey;
ALTER TABLE ONLY tenant_ispm.echeancier DROP CONSTRAINT echeancier_inscription_id_num_tranche_key;
ALTER TABLE ONLY tenant_ispm.dossier_etudiant DROP CONSTRAINT dossier_etudiant_pkey;
ALTER TABLE ONLY tenant_ispm.diplome DROP CONSTRAINT diplome_pkey;
ALTER TABLE ONLY tenant_ispm.diplome DROP CONSTRAINT diplome_numero_diplome_key;
ALTER TABLE ONLY tenant_ispm.depense DROP CONSTRAINT depense_pkey;
ALTER TABLE ONLY tenant_ispm.departement DROP CONSTRAINT departement_pkey;
ALTER TABLE ONLY tenant_ispm.departement DROP CONSTRAINT departement_code_key;
ALTER TABLE ONLY tenant_ispm.demande_ressource DROP CONSTRAINT demande_ressource_pkey;
ALTER TABLE ONLY tenant_ispm.demande_etudiant DROP CONSTRAINT demande_etudiant_pkey;
ALTER TABLE ONLY tenant_ispm.deliberation DROP CONSTRAINT deliberation_session_examen_id_parcours_id_semestre_annee_n_key;
ALTER TABLE ONLY tenant_ispm.deliberation DROP CONSTRAINT deliberation_pkey;
ALTER TABLE ONLY tenant_ispm.delegation_signature DROP CONSTRAINT delegation_signature_pkey;
ALTER TABLE ONLY tenant_ispm.declaration_sociale DROP CONSTRAINT declaration_sociale_pkey;
ALTER TABLE ONLY tenant_ispm.convocation DROP CONSTRAINT convocation_pkey;
ALTER TABLE ONLY tenant_ispm.convention DROP CONSTRAINT convention_pkey;
ALTER TABLE ONLY tenant_ispm.contrat_personnel DROP CONSTRAINT contrat_personnel_pkey;
ALTER TABLE ONLY tenant_ispm.conge_personnel DROP CONSTRAINT conge_personnel_pkey;
ALTER TABLE ONLY tenant_ispm.configuration_examen DROP CONSTRAINT configuration_examen_pkey;
ALTER TABLE ONLY tenant_ispm.candidature DROP CONSTRAINT candidature_pkey;
ALTER TABLE ONLY tenant_ispm.calendrier_academique DROP CONSTRAINT calendrier_academique_pkey;
ALTER TABLE ONLY tenant_ispm.budget DROP CONSTRAINT budget_pkey;
ALTER TABLE ONLY tenant_ispm.batiment DROP CONSTRAINT batiment_pkey;
ALTER TABLE ONLY tenant_ispm.batiment DROP CONSTRAINT batiment_code_key;
ALTER TABLE ONLY tenant_ispm.attestation DROP CONSTRAINT attestation_pkey;
ALTER TABLE ONLY tenant_ispm.archive_scolarite DROP CONSTRAINT archive_scolarite_pkey;
ALTER TABLE ONLY tenant_ispm.annonce DROP CONSTRAINT annonce_pkey;
ALTER TABLE ONLY tenant_ispm.annee_academique DROP CONSTRAINT annee_academique_pkey;
ALTER TABLE ONLY tenant_ispm.annee_academique DROP CONSTRAINT annee_academique_libelle_key;
ALTER TABLE ONLY tenant_ispm.alerte_discipline DROP CONSTRAINT alerte_discipline_pkey;
ALTER TABLE ONLY tenant_ispm.affectation_cours DROP CONSTRAINT affectation_cours_pkey;
ALTER TABLE ONLY tenant_ispm.absence_enseignant DROP CONSTRAINT absence_enseignant_pkey;
ALTER TABLE tenant_ispm.evaluation_personnel ALTER COLUMN id DROP DEFAULT;
ALTER TABLE tenant_ispm.delegation_signature ALTER COLUMN id DROP DEFAULT;
ALTER TABLE tenant_ispm.convention ALTER COLUMN id DROP DEFAULT;
DROP VIEW tenant_ispm.vue_paiement_etudiant;
DROP VIEW tenant_ispm.vue_moyenne_semestre;
DROP VIEW tenant_ispm.vue_moyenne_ue;
DROP VIEW tenant_ispm.vue_kpi_president;
DROP VIEW tenant_ispm.vue_absences_etudiant;
DROP TABLE tenant_ispm.verrouillage_notes;
DROP TABLE tenant_ispm.utilisateur;
DROP TABLE tenant_ispm.unite_enseignement;
DROP TABLE tenant_ispm.transfert_etudiant;
DROP TABLE tenant_ispm.ticket_maintenance;
DROP TABLE tenant_ispm.support_cours;
DROP TABLE tenant_ispm.suplement_diplome;
DROP TABLE tenant_ispm.sujet_examen;
DROP TABLE tenant_ispm.stock;
DROP TABLE tenant_ispm.stage;
DROP TABLE tenant_ispm.soutenance;
DROP TABLE tenant_ispm.session_jwt;
DROP TABLE tenant_ispm.session_examen;
DROP SEQUENCE tenant_ispm.seq_recu;
DROP TABLE tenant_ispm.secretaire_parcours;
DROP TABLE tenant_ispm.salle;
DROP TABLE tenant_ispm.resultat_ue;
DROP TABLE tenant_ispm.resultat_semestre;
DROP TABLE tenant_ispm.resultat_deliberation;
DROP TABLE tenant_ispm.reservation_salle;
DROP TABLE tenant_ispm.referentiel_competences;
DROP TABLE tenant_ispm.recrutement;
DROP TABLE tenant_ispm.rattrapage;
DROP TABLE tenant_ispm.rapport_entretien;
DROP TABLE tenant_ispm.pv_deliberation;
DROP TABLE tenant_ispm.proces_verbal;
DROP TABLE tenant_ispm.presence_surveillance;
DROP TABLE tenant_ispm.presence;
DROP TABLE tenant_ispm.pointage_qr;
DROP TABLE tenant_ispm.planning_entretien;
DROP TABLE tenant_ispm.permissions_portail;
DROP TABLE tenant_ispm.parcours;
DROP TABLE tenant_ispm.paiement_inscription;
DROP TABLE tenant_ispm.paiement;
DROP TABLE tenant_ispm.notification;
DROP TABLE tenant_ispm.note_derogatoire;
DROP TABLE tenant_ispm.note;
DROP TABLE tenant_ispm.niveau_etude;
DROP TABLE tenant_ispm.mouvement_stock;
DROP TABLE tenant_ispm.message_enseignant;
DROP TABLE tenant_ispm.message_destinataire;
DROP TABLE tenant_ispm.message;
DROP TABLE tenant_ispm.inscription;
DROP TABLE tenant_ispm.incident_disciplinaire;
DROP TABLE tenant_ispm.heure_complementaire;
DROP TABLE tenant_ispm.grille_tarifaire;
DROP TABLE tenant_ispm.fiche_suivi_stage;
DROP TABLE tenant_ispm.fiche_paie;
DROP TABLE tenant_ispm.evaluation_soutenance;
DROP SEQUENCE tenant_ispm.evaluation_personnel_id_seq;
DROP TABLE tenant_ispm.evaluation_personnel;
DROP TABLE tenant_ispm.etudiant;
DROP TABLE tenant_ispm.enseignant;
DROP TABLE tenant_ispm.emploi_du_temps;
DROP TABLE tenant_ispm.element_constitutif;
DROP TABLE tenant_ispm.echeancier;
DROP TABLE tenant_ispm.dossier_etudiant;
DROP TABLE tenant_ispm.diplome;
DROP TABLE tenant_ispm.depense;
DROP TABLE tenant_ispm.departement;
DROP TABLE tenant_ispm.demande_ressource;
DROP TABLE tenant_ispm.demande_etudiant;
DROP TABLE tenant_ispm.deliberation;
DROP SEQUENCE tenant_ispm.delegation_signature_id_seq;
DROP TABLE tenant_ispm.delegation_signature;
DROP TABLE tenant_ispm.declaration_sociale;
DROP TABLE tenant_ispm.convocation;
DROP SEQUENCE tenant_ispm.convention_id_seq;
DROP TABLE tenant_ispm.convention;
DROP TABLE tenant_ispm.contrat_personnel;
DROP TABLE tenant_ispm.conge_personnel;
DROP TABLE tenant_ispm.configuration_examen;
DROP TABLE tenant_ispm.candidature;
DROP TABLE tenant_ispm.calendrier_academique;
DROP TABLE tenant_ispm.budget;
DROP TABLE tenant_ispm.batiment;
DROP TABLE tenant_ispm.attestation;
DROP TABLE tenant_ispm.archive_scolarite;
DROP TABLE tenant_ispm.annonce;
DROP TABLE tenant_ispm.annee_academique;
DROP TABLE tenant_ispm.alerte_discipline;
DROP TABLE tenant_ispm.affectation_cours;
DROP TABLE tenant_ispm.absence_enseignant;
DROP FUNCTION tenant_ispm.update_updated_at_column();
DROP FUNCTION tenant_ispm.update_paiement_inscription_updated_at();
DROP FUNCTION tenant_ispm.trigger_set_updated_at();
DROP FUNCTION tenant_ispm.trigger_numero_recu();
DROP FUNCTION tenant_ispm.trigger_notification_paiement();
DROP FUNCTION tenant_ispm.trigger_note_verrouille();
DROP FUNCTION tenant_ispm.trigger_alerte_stock();
DROP FUNCTION tenant_ispm.check_note_verrouillee();
DROP FUNCTION tenant_ispm.calculer_moyenne_semestre(p_etudiant_id uuid, p_inscription_id uuid, p_semestre smallint, p_annee_niveau smallint);
DROP FUNCTION tenant_ispm.calculer_credits_acquis(p_etudiant_id uuid, p_inscription_id uuid, p_semestre smallint, p_annee_niveau smallint);
DROP SCHEMA tenant_ispm;
--
-- TOC entry 8 (class 2615 OID 56682)
-- Name: tenant_ispm; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA tenant_ispm;


ALTER SCHEMA tenant_ispm OWNER TO postgres;

--
-- TOC entry 382 (class 1255 OID 61634)
-- Name: calculer_credits_acquis(uuid, uuid, smallint, smallint); Type: FUNCTION; Schema: tenant_ispm; Owner: postgres
--

CREATE FUNCTION tenant_ispm.calculer_credits_acquis(p_etudiant_id uuid, p_inscription_id uuid, p_semestre smallint, p_annee_niveau smallint) RETURNS smallint
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


ALTER FUNCTION tenant_ispm.calculer_credits_acquis(p_etudiant_id uuid, p_inscription_id uuid, p_semestre smallint, p_annee_niveau smallint) OWNER TO postgres;

--
-- TOC entry 381 (class 1255 OID 61633)
-- Name: calculer_moyenne_semestre(uuid, uuid, smallint, smallint); Type: FUNCTION; Schema: tenant_ispm; Owner: postgres
--

CREATE FUNCTION tenant_ispm.calculer_moyenne_semestre(p_etudiant_id uuid, p_inscription_id uuid, p_semestre smallint, p_annee_niveau smallint) RETURNS numeric
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


ALTER FUNCTION tenant_ispm.calculer_moyenne_semestre(p_etudiant_id uuid, p_inscription_id uuid, p_semestre smallint, p_annee_niveau smallint) OWNER TO postgres;

--
-- TOC entry 380 (class 1255 OID 61631)
-- Name: check_note_verrouillee(); Type: FUNCTION; Schema: tenant_ispm; Owner: postgres
--

CREATE FUNCTION tenant_ispm.check_note_verrouillee() RETURNS trigger
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


ALTER FUNCTION tenant_ispm.check_note_verrouillee() OWNER TO postgres;

--
-- TOC entry 376 (class 1255 OID 57885)
-- Name: trigger_alerte_stock(); Type: FUNCTION; Schema: tenant_ispm; Owner: postgres
--

CREATE FUNCTION tenant_ispm.trigger_alerte_stock() RETURNS trigger
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


ALTER FUNCTION tenant_ispm.trigger_alerte_stock() OWNER TO postgres;

--
-- TOC entry 377 (class 1255 OID 57887)
-- Name: trigger_note_verrouille(); Type: FUNCTION; Schema: tenant_ispm; Owner: postgres
--

CREATE FUNCTION tenant_ispm.trigger_note_verrouille() RETURNS trigger
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


ALTER FUNCTION tenant_ispm.trigger_note_verrouille() OWNER TO postgres;

--
-- TOC entry 378 (class 1255 OID 57889)
-- Name: trigger_notification_paiement(); Type: FUNCTION; Schema: tenant_ispm; Owner: postgres
--

CREATE FUNCTION tenant_ispm.trigger_notification_paiement() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Récupération de l'ID utilisateur lié à l'étudiant inscrit
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


ALTER FUNCTION tenant_ispm.trigger_notification_paiement() OWNER TO postgres;

--
-- TOC entry 374 (class 1255 OID 57883)
-- Name: trigger_numero_recu(); Type: FUNCTION; Schema: tenant_ispm; Owner: postgres
--

CREATE FUNCTION tenant_ispm.trigger_numero_recu() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW.numero_recu IS NULL OR NEW.numero_recu = '' THEN
        NEW.numero_recu = 'RECU-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(nextval('seq_recu')::TEXT, 6, '0');
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION tenant_ispm.trigger_numero_recu() OWNER TO postgres;

--
-- TOC entry 363 (class 1255 OID 57868)
-- Name: trigger_set_updated_at(); Type: FUNCTION; Schema: tenant_ispm; Owner: postgres
--

CREATE FUNCTION tenant_ispm.trigger_set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION tenant_ispm.trigger_set_updated_at() OWNER TO postgres;

--
-- TOC entry 383 (class 1255 OID 83963)
-- Name: update_paiement_inscription_updated_at(); Type: FUNCTION; Schema: tenant_ispm; Owner: postgres
--

CREATE FUNCTION tenant_ispm.update_paiement_inscription_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;


ALTER FUNCTION tenant_ispm.update_paiement_inscription_updated_at() OWNER TO postgres;

--
-- TOC entry 379 (class 1255 OID 61622)
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: tenant_ispm; Owner: postgres
--

CREATE FUNCTION tenant_ispm.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION tenant_ispm.update_updated_at_column() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 276 (class 1259 OID 58131)
-- Name: absence_enseignant; Type: TABLE; Schema: tenant_ispm; Owner: postgres
--

CREATE TABLE tenant_ispm.absence_enseignant (
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
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE tenant_ispm.absence_enseignant OWNER TO postgres;

--
-- TOC entry 238 (class 1259 OID 56975)
-- Name: affectation_cours; Type: TABLE; Schema: tenant_ispm; Owner: postgres
--

CREATE TABLE tenant_ispm.affectation_cours (
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


ALTER TABLE tenant_ispm.affectation_cours OWNER TO postgres;

--
-- TOC entry 285 (class 1259 OID 58522)
-- Name: alerte_discipline; Type: TABLE; Schema: tenant_ispm; Owner: postgres
--

CREATE TABLE tenant_ispm.alerte_discipline (
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
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE tenant_ispm.alerte_discipline OWNER TO postgres;

--
-- TOC entry 6526 (class 0 OID 0)
-- Dependencies: 285
-- Name: TABLE alerte_discipline; Type: COMMENT; Schema: tenant_ispm; Owner: postgres
--

COMMENT ON TABLE tenant_ispm.alerte_discipline IS 'Alertes disciplinaires automatiques vers le secrétariat';


--
-- TOC entry 229 (class 1259 OID 56725)
-- Name: annee_academique; Type: TABLE; Schema: tenant_ispm; Owner: postgres
--

CREATE TABLE tenant_ispm.annee_academique (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    libelle character varying(20) NOT NULL,
    date_debut date NOT NULL,
    date_fin date NOT NULL,
    active boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE tenant_ispm.annee_academique OWNER TO postgres;

--
-- TOC entry 263 (class 1259 OID 57762)
-- Name: annonce; Type: TABLE; Schema: tenant_ispm; Owner: postgres
--

CREATE TABLE tenant_ispm.annonce (
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
    CONSTRAINT annonce_cible_check CHECK (((cible)::text = ANY ((ARRAY['tous'::character varying, 'etudiants'::character varying, 'parents'::character varying, 'professeurs'::character varying, 'personnel'::character varying, 'parcours'::character varying])::text[]))),
    CONSTRAINT annonce_type_annonce_check CHECK (((type_annonce)::text = ANY ((ARRAY['information'::character varying, 'urgent'::character varying, 'evenement'::character varying, 'resultat'::character varying, 'pastoral'::character varying, 'fermeture'::character varying])::text[])))
);


ALTER TABLE tenant_ispm.annonce OWNER TO postgres;

--
-- TOC entry 293 (class 1259 OID 62183)
-- Name: archive_scolarite; Type: TABLE; Schema: tenant_ispm; Owner: postgres
--

CREATE TABLE tenant_ispm.archive_scolarite (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
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


ALTER TABLE tenant_ispm.archive_scolarite OWNER TO postgres;

--
-- TOC entry 315 (class 1259 OID 85158)
-- Name: attestation; Type: TABLE; Schema: tenant_ispm; Owner: postgres
--

CREATE TABLE tenant_ispm.attestation (
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
    date_generation timestamp without time zone DEFAULT now(),
    fichier_url character varying(500),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    date_emission timestamp without time zone DEFAULT now(),
    CONSTRAINT attestation_statut_check CHECK (((statut)::text = ANY ((ARRAY['en_attente'::character varying, 'validee'::character varying, 'refusee'::character varying, 'annulee'::character varying])::text[]))),
    CONSTRAINT attestation_type_check CHECK (((type_attestation)::text = ANY ((ARRAY['scolarite'::character varying, 'reussite'::character varying, 'inscription'::character varying, 'preinscription'::character varying, 'stage'::character varying, 'autre'::character varying])::text[])))
);


ALTER TABLE tenant_ispm.attestation OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 57017)
-- Name: batiment; Type: TABLE; Schema: tenant_ispm; Owner: postgres
--

CREATE TABLE tenant_ispm.batiment (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nom character varying(100) NOT NULL,
    code character varying(20),
    adresse text,
    actif boolean DEFAULT true
);


ALTER TABLE tenant_ispm.batiment OWNER TO postgres;

--
-- TOC entry 252 (class 1259 OID 57436)
-- Name: budget; Type: TABLE; Schema: tenant_ispm; Owner: postgres
--

CREATE TABLE tenant_ispm.budget (
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


ALTER TABLE tenant_ispm.budget OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 56843)
-- Name: calendrier_academique; Type: TABLE; Schema: tenant_ispm; Owner: postgres
--

CREATE TABLE tenant_ispm.calendrier_academique (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    annee_academique_id uuid NOT NULL,
    evenement character varying(200) NOT NULL,
    type_evenement character varying(50) NOT NULL,
    date_debut date NOT NULL,
    date_fin date NOT NULL,
    parcours_id uuid,
    description text,
    created_at timestamp with time zone DEFAULT now(),
    valide_par_president integer,
    valide_le timestamp without time zone,
    commentaire_president text,
    CONSTRAINT calendrier_academique_type_evenement_check CHECK (((type_evenement)::text = ANY ((ARRAY['rentree'::character varying, 'cours'::character varying, 'vacances'::character varying, 'examens'::character varying, 'deliberation'::character varying, 'ceremonie'::character varying, 'pastoral'::character varying, 'autre'::character varying])::text[])))
);


ALTER TABLE tenant_ispm.calendrier_academique OWNER TO postgres;

--
-- TOC entry 314 (class 1259 OID 84977)
-- Name: candidature; Type: TABLE; Schema: tenant_ispm; Owner: postgres
--

CREATE TABLE tenant_ispm.candidature (
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


ALTER TABLE tenant_ispm.candidature OWNER TO postgres;

--
-- TOC entry 286 (class 1259 OID 58539)
-- Name: configuration_examen; Type: TABLE; Schema: tenant_ispm; Owner: postgres
--

CREATE TABLE tenant_ispm.configuration_examen (
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
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE tenant_ispm.configuration_examen OWNER TO postgres;

--
-- TOC entry 6527 (class 0 OID 0)
-- Dependencies: 286
-- Name: TABLE configuration_examen; Type: COMMENT; Schema: tenant_ispm; Owner: postgres
--

COMMENT ON TABLE tenant_ispm.configuration_examen IS 'Configuration des salles d''examen et attribution des places';


--
-- TOC entry 255 (class 1259 OID 57531)
-- Name: conge_personnel; Type: TABLE; Schema: tenant_ispm; Owner: postgres
--

CREATE TABLE tenant_ispm.conge_personnel (
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


ALTER TABLE tenant_ispm.conge_personnel OWNER TO postgres;

--
-- TOC entry 254 (class 1259 OID 57504)
-- Name: contrat_personnel; Type: TABLE; Schema: tenant_ispm; Owner: postgres
--

CREATE TABLE tenant_ispm.contrat_personnel (
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
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    valide_par integer,
    valide_le timestamp without time zone,
    commentaire_president text,
    conditions_speciales text,
    CONSTRAINT contrat_personnel_type_contrat_check CHECK (((type_contrat)::text = ANY ((ARRAY['CDI'::character varying, 'CDD'::character varying, 'vacataire'::character varying, 'stagiaire'::character varying, 'benevolat'::character varying])::text[])))
);


ALTER TABLE tenant_ispm.contrat_personnel OWNER TO postgres;

--
-- TOC entry 306 (class 1259 OID 84428)
-- Name: convention; Type: TABLE; Schema: tenant_ispm; Owner: postgres
--

CREATE TABLE tenant_ispm.convention (
    id integer NOT NULL,
    intitule character varying(255) NOT NULL,
    partenaire character varying(255) NOT NULL,
    type_partenaire character varying(50) NOT NULL,
    objet_convention text NOT NULL,
    date_proposee date NOT NULL,
    document_url text,
    statut character varying(50) DEFAULT 'en_attente_signature'::character varying NOT NULL,
    signe_president boolean DEFAULT false,
    date_signature timestamp without time zone,
    signature_hash character varying(255),
    representant_partenaire character varying(255),
    date_effet date,
    remarques_president text,
    cree_par integer,
    cree_le timestamp without time zone DEFAULT now(),
    modifie_le timestamp without time zone DEFAULT now(),
    CONSTRAINT convention_statut_check CHECK (((statut)::text = ANY ((ARRAY['en_attente_signature'::character varying, 'signee'::character varying, 'rejetee'::character varying, 'expiree'::character varying])::text[]))),
    CONSTRAINT convention_type_partenaire_check CHECK (((type_partenaire)::text = ANY ((ARRAY['eglise'::character varying, 'diocese'::character varying, 'etat'::character varying, 'entreprise'::character varying, 'universite'::character varying])::text[])))
);


ALTER TABLE tenant_ispm.convention OWNER TO postgres;

--
-- TOC entry 305 (class 1259 OID 84427)
-- Name: convention_id_seq; Type: SEQUENCE; Schema: tenant_ispm; Owner: postgres
--

CREATE SEQUENCE tenant_ispm.convention_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE tenant_ispm.convention_id_seq OWNER TO postgres;

--
-- TOC entry 6528 (class 0 OID 0)
-- Dependencies: 305
-- Name: convention_id_seq; Type: SEQUENCE OWNED BY; Schema: tenant_ispm; Owner: postgres
--

ALTER SEQUENCE tenant_ispm.convention_id_seq OWNED BY tenant_ispm.convention.id;


--
-- TOC entry 280 (class 1259 OID 58300)
-- Name: convocation; Type: TABLE; Schema: tenant_ispm; Owner: postgres
--

CREATE TABLE tenant_ispm.convocation (
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


ALTER TABLE tenant_ispm.convocation OWNER TO postgres;

--
-- TOC entry 312 (class 1259 OID 84919)
-- Name: declaration_sociale; Type: TABLE; Schema: tenant_ispm; Owner: postgres
--

CREATE TABLE tenant_ispm.declaration_sociale (
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


ALTER TABLE tenant_ispm.declaration_sociale OWNER TO postgres;

--
-- TOC entry 308 (class 1259 OID 84453)
-- Name: delegation_signature; Type: TABLE; Schema: tenant_ispm; Owner: postgres
--

CREATE TABLE tenant_ispm.delegation_signature (
    id integer NOT NULL,
    delegataire_id integer NOT NULL,
    types_actes text[] NOT NULL,
    date_debut date NOT NULL,
    date_fin date NOT NULL,
    conditions text,
    revoquee boolean DEFAULT false,
    revoquee_le timestamp without time zone,
    revoquee_par integer,
    cree_par integer NOT NULL,
    cree_le timestamp without time zone DEFAULT now(),
    CONSTRAINT check_dates CHECK ((date_fin > date_debut))
);


ALTER TABLE tenant_ispm.delegation_signature OWNER TO postgres;

--
-- TOC entry 307 (class 1259 OID 84452)
-- Name: delegation_signature_id_seq; Type: SEQUENCE; Schema: tenant_ispm; Owner: postgres
--

CREATE SEQUENCE tenant_ispm.delegation_signature_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE tenant_ispm.delegation_signature_id_seq OWNER TO postgres;

--
-- TOC entry 6529 (class 0 OID 0)
-- Dependencies: 307
-- Name: delegation_signature_id_seq; Type: SEQUENCE OWNED BY; Schema: tenant_ispm; Owner: postgres
--

ALTER SEQUENCE tenant_ispm.delegation_signature_id_seq OWNED BY tenant_ispm.delegation_signature.id;


--
-- TOC entry 287 (class 1259 OID 61963)
-- Name: deliberation; Type: TABLE; Schema: tenant_ispm; Owner: postgres
--

CREATE TABLE tenant_ispm.deliberation (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
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


ALTER TABLE tenant_ispm.deliberation OWNER TO postgres;

--
-- TOC entry 279 (class 1259 OID 58267)
-- Name: demande_etudiant; Type: TABLE; Schema: tenant_ispm; Owner: postgres
--

CREATE TABLE tenant_ispm.demande_etudiant (
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
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE tenant_ispm.demande_etudiant OWNER TO postgres;

--
-- TOC entry 300 (class 1259 OID 83635)
-- Name: demande_ressource; Type: TABLE; Schema: tenant_ispm; Owner: postgres
--

CREATE TABLE tenant_ispm.demande_ressource (
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


ALTER TABLE tenant_ispm.demande_ressource OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 56739)
-- Name: departement; Type: TABLE; Schema: tenant_ispm; Owner: postgres
--

CREATE TABLE tenant_ispm.departement (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code character varying(20) NOT NULL,
    nom character varying(200) NOT NULL,
    description text,
    responsable_id uuid,
    actif boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE tenant_ispm.departement OWNER TO postgres;

--
-- TOC entry 253 (class 1259 OID 57466)
-- Name: depense; Type: TABLE; Schema: tenant_ispm; Owner: postgres
--

CREATE TABLE tenant_ispm.depense (
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
    created_at timestamp with time zone DEFAULT now(),
    valide_par_president integer,
    valide_le timestamp without time zone,
    motif_decision text,
    conditions_speciales text,
    CONSTRAINT depense_montant_check CHECK ((montant > (0)::numeric)),
    CONSTRAINT depense_statut_check CHECK (((statut)::text = ANY ((ARRAY['en_attente'::character varying, 'approuve'::character varying, 'paye'::character varying, 'rejete'::character varying])::text[])))
);


ALTER TABLE tenant_ispm.depense OWNER TO postgres;

--
-- TOC entry 290 (class 1259 OID 62081)
-- Name: diplome; Type: TABLE; Schema: tenant_ispm; Owner: postgres
--

CREATE TABLE tenant_ispm.diplome (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    etudiant_id uuid NOT NULL,
    inscription_id uuid NOT NULL,
    parcours_id uuid NOT NULL,
    type_diplome character varying(50) NOT NULL,
    mention_generale character varying(30),
    moyenne_finale numeric(5,2),
    total_credits_ects smallint,
    date_obtention date,
    lieu_obtention character varying(200),
    numero_diplome character varying(50),
    hash_integrite character varying(128),
    qr_code_url character varying(500),
    statut character varying(20) DEFAULT 'en_attente'::character varying NOT NULL,
    delivre_par uuid NOT NULL,
    date_delivrance date,
    date_retrait date,
    observations text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    signe_president boolean DEFAULT false,
    date_signature timestamp without time zone,
    signature_hash character varying(255),
    mention_speciale text,
    CONSTRAINT diplome_statut_check CHECK (((statut)::text = ANY ((ARRAY['en_attente'::character varying, 'delivre'::character varying, 'retire'::character varying, 'annule'::character varying, 'remplace'::character varying])::text[]))),
    CONSTRAINT diplome_type_diplome_check CHECK (((type_diplome)::text = ANY ((ARRAY['licence'::character varying, 'master'::character varying, 'doctorat'::character varying, 'bts'::character varying, 'dut'::character varying, 'certificat'::character varying])::text[])))
);


ALTER TABLE tenant_ispm.diplome OWNER TO postgres;

--
-- TOC entry 281 (class 1259 OID 58344)
-- Name: dossier_etudiant; Type: TABLE; Schema: tenant_ispm; Owner: postgres
--

CREATE TABLE tenant_ispm.dossier_etudiant (
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


ALTER TABLE tenant_ispm.dossier_etudiant OWNER TO postgres;

--
-- TOC entry 249 (class 1259 OID 57376)
-- Name: echeancier; Type: TABLE; Schema: tenant_ispm; Owner: postgres
--

CREATE TABLE tenant_ispm.echeancier (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    inscription_id uuid NOT NULL,
    num_tranche smallint NOT NULL,
    montant_du numeric(12,2) NOT NULL,
    date_echeance date NOT NULL,
    statut character varying(20) DEFAULT 'en_attente'::character varying,
    CONSTRAINT echeancier_statut_check CHECK (((statut)::text = ANY ((ARRAY['en_attente'::character varying, 'paye'::character varying, 'en_retard'::character varying, 'annule'::character varying])::text[])))
);


ALTER TABLE tenant_ispm.echeancier OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 56822)
-- Name: element_constitutif; Type: TABLE; Schema: tenant_ispm; Owner: postgres
--

CREATE TABLE tenant_ispm.element_constitutif (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    ue_id uuid NOT NULL,
    code character varying(30) NOT NULL,
    intitule character varying(200) NOT NULL,
    coefficient numeric(4,2) DEFAULT 1.0 NOT NULL,
    actif boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE tenant_ispm.element_constitutif OWNER TO postgres;

--
-- TOC entry 241 (class 1259 OID 57055)
-- Name: emploi_du_temps; Type: TABLE; Schema: tenant_ispm; Owner: postgres
--

CREATE TABLE tenant_ispm.emploi_du_temps (
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
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    created_by_id uuid,
    CONSTRAINT emploi_du_temps_check CHECK ((heure_fin > heure_debut)),
    CONSTRAINT emploi_du_temps_statut_check CHECK (((statut)::text = ANY ((ARRAY['planifie'::character varying, 'realise'::character varying, 'annule'::character varying, 'reporte'::character varying])::text[]))),
    CONSTRAINT emploi_du_temps_type_seance_check CHECK (((type_seance)::text = ANY ((ARRAY['CM'::character varying, 'TD'::character varying, 'TP'::character varying])::text[])))
);


ALTER TABLE tenant_ispm.emploi_du_temps OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 56943)
-- Name: enseignant; Type: TABLE; Schema: tenant_ispm; Owner: postgres
--

CREATE TABLE tenant_ispm.enseignant (
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


ALTER TABLE tenant_ispm.enseignant OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 56869)
-- Name: etudiant; Type: TABLE; Schema: tenant_ispm; Owner: postgres
--

CREATE TABLE tenant_ispm.etudiant (
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


ALTER TABLE tenant_ispm.etudiant OWNER TO postgres;

--
-- TOC entry 310 (class 1259 OID 84590)
-- Name: evaluation_personnel; Type: TABLE; Schema: tenant_ispm; Owner: postgres
--

CREATE TABLE tenant_ispm.evaluation_personnel (
    id integer NOT NULL,
    utilisateur_id uuid NOT NULL,
    evaluateur_id uuid NOT NULL,
    date_evaluation date NOT NULL,
    periode character varying(50) NOT NULL,
    annee_evaluation integer,
    note_globale numeric(3,2),
    competences_techniques numeric(3,2),
    competences_relationnelles numeric(3,2),
    assiduite numeric(3,2),
    initiative numeric(3,2),
    commentaires text,
    objectifs_atteints text,
    axes_amelioration text,
    auto_evaluation text,
    date_auto_evaluation timestamp without time zone,
    statut character varying(50) DEFAULT 'planifiee'::character varying,
    cree_par integer,
    cree_le timestamp without time zone DEFAULT now(),
    modifie_le timestamp without time zone DEFAULT now(),
    CONSTRAINT evaluation_personnel_assiduite_check CHECK (((assiduite >= (0)::numeric) AND (assiduite <= (5)::numeric))),
    CONSTRAINT evaluation_personnel_competences_relationnelles_check CHECK (((competences_relationnelles >= (0)::numeric) AND (competences_relationnelles <= (5)::numeric))),
    CONSTRAINT evaluation_personnel_competences_techniques_check CHECK (((competences_techniques >= (0)::numeric) AND (competences_techniques <= (5)::numeric))),
    CONSTRAINT evaluation_personnel_initiative_check CHECK (((initiative >= (0)::numeric) AND (initiative <= (5)::numeric))),
    CONSTRAINT evaluation_personnel_note_globale_check CHECK (((note_globale >= (0)::numeric) AND (note_globale <= (5)::numeric))),
    CONSTRAINT evaluation_personnel_statut_check CHECK (((statut)::text = ANY ((ARRAY['planifiee'::character varying, 'en_cours'::character varying, 'auto_evalue'::character varying, 'terminee'::character varying])::text[])))
);


ALTER TABLE tenant_ispm.evaluation_personnel OWNER TO postgres;

--
-- TOC entry 6530 (class 0 OID 0)
-- Dependencies: 310
-- Name: TABLE evaluation_personnel; Type: COMMENT; Schema: tenant_ispm; Owner: postgres
--

COMMENT ON TABLE tenant_ispm.evaluation_personnel IS 'Évaluations annuelles du personnel - Gestion des performances et compétences';


--
-- TOC entry 309 (class 1259 OID 84589)
-- Name: evaluation_personnel_id_seq; Type: SEQUENCE; Schema: tenant_ispm; Owner: postgres
--

CREATE SEQUENCE tenant_ispm.evaluation_personnel_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE tenant_ispm.evaluation_personnel_id_seq OWNER TO postgres;

--
-- TOC entry 6531 (class 0 OID 0)
-- Dependencies: 309
-- Name: evaluation_personnel_id_seq; Type: SEQUENCE OWNED BY; Schema: tenant_ispm; Owner: postgres
--

ALTER SEQUENCE tenant_ispm.evaluation_personnel_id_seq OWNED BY tenant_ispm.evaluation_personnel.id;


--
-- TOC entry 299 (class 1259 OID 83607)
-- Name: evaluation_soutenance; Type: TABLE; Schema: tenant_ispm; Owner: postgres
--

CREATE TABLE tenant_ispm.evaluation_soutenance (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    soutenance_id uuid NOT NULL,
    evaluateur_id uuid NOT NULL,
    note numeric(5,2) NOT NULL,
    appreciation text,
    date_evaluation timestamp with time zone DEFAULT now(),
    CONSTRAINT evaluation_soutenance_note_check CHECK (((note >= (0)::numeric) AND (note <= (20)::numeric)))
);


ALTER TABLE tenant_ispm.evaluation_soutenance OWNER TO postgres;

--
-- TOC entry 256 (class 1259 OID 57559)
-- Name: fiche_paie; Type: TABLE; Schema: tenant_ispm; Owner: postgres
--

CREATE TABLE tenant_ispm.fiche_paie (
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


ALTER TABLE tenant_ispm.fiche_paie OWNER TO postgres;

--
-- TOC entry 297 (class 1259 OID 83542)
-- Name: fiche_suivi_stage; Type: TABLE; Schema: tenant_ispm; Owner: postgres
--

CREATE TABLE tenant_ispm.fiche_suivi_stage (
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


ALTER TABLE tenant_ispm.fiche_suivi_stage OWNER TO postgres;

--
-- TOC entry 248 (class 1259 OID 57349)
-- Name: grille_tarifaire; Type: TABLE; Schema: tenant_ispm; Owner: postgres
--

CREATE TABLE tenant_ispm.grille_tarifaire (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    parcours_id uuid NOT NULL,
    annee_academique_id uuid NOT NULL,
    annee_niveau smallint,
    montant_total numeric(12,2) NOT NULL,
    nb_tranches smallint DEFAULT 1,
    description text,
    actif boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    montant_inscription numeric(12,2) DEFAULT 0,
    montant_scolarite numeric(12,2) DEFAULT 0,
    date_limite_paiement date,
    modalites_paiement jsonb
);


ALTER TABLE tenant_ispm.grille_tarifaire OWNER TO postgres;

--
-- TOC entry 311 (class 1259 OID 84887)
-- Name: heure_complementaire; Type: TABLE; Schema: tenant_ispm; Owner: postgres
--

CREATE TABLE tenant_ispm.heure_complementaire (
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


ALTER TABLE tenant_ispm.heure_complementaire OWNER TO postgres;

--
-- TOC entry 243 (class 1259 OID 57133)
-- Name: incident_disciplinaire; Type: TABLE; Schema: tenant_ispm; Owner: postgres
--

CREATE TABLE tenant_ispm.incident_disciplinaire (
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


ALTER TABLE tenant_ispm.incident_disciplinaire OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 56896)
-- Name: inscription; Type: TABLE; Schema: tenant_ispm; Owner: postgres
--

CREATE TABLE tenant_ispm.inscription (
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


ALTER TABLE tenant_ispm.inscription OWNER TO postgres;

--
-- TOC entry 265 (class 1259 OID 57812)
-- Name: message; Type: TABLE; Schema: tenant_ispm; Owner: postgres
--

CREATE TABLE tenant_ispm.message (
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


ALTER TABLE tenant_ispm.message OWNER TO postgres;

--
-- TOC entry 304 (class 1259 OID 84008)
-- Name: message_destinataire; Type: TABLE; Schema: tenant_ispm; Owner: postgres
--

CREATE TABLE tenant_ispm.message_destinataire (
    id uuid DEFAULT gen_random_uuid() CONSTRAINT message_destinataire_id_not_null1 NOT NULL,
    message_id uuid NOT NULL,
    etudiant_id uuid NOT NULL,
    lu boolean DEFAULT false,
    date_lecture timestamp without time zone
);


ALTER TABLE tenant_ispm.message_destinataire OWNER TO postgres;

--
-- TOC entry 6532 (class 0 OID 0)
-- Dependencies: 304
-- Name: TABLE message_destinataire; Type: COMMENT; Schema: tenant_ispm; Owner: postgres
--

COMMENT ON TABLE tenant_ispm.message_destinataire IS 'Destinataires individuels des messages avec statut de lecture';


--
-- TOC entry 303 (class 1259 OID 83970)
-- Name: message_enseignant; Type: TABLE; Schema: tenant_ispm; Owner: postgres
--

CREATE TABLE tenant_ispm.message_enseignant (
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
    date_envoi timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    statut character varying(50) DEFAULT 'envoye'::character varying,
    CONSTRAINT message_enseignant_statut_check CHECK (((statut)::text = ANY ((ARRAY['envoye'::character varying, 'lu'::character varying, 'archive'::character varying])::text[]))),
    CONSTRAINT message_enseignant_type_message_check CHECK (((type_message)::text = ANY ((ARRAY['direct'::character varying, 'classe'::character varying, 'parcours'::character varying])::text[])))
);


ALTER TABLE tenant_ispm.message_enseignant OWNER TO postgres;

--
-- TOC entry 6533 (class 0 OID 0)
-- Dependencies: 303
-- Name: TABLE message_enseignant; Type: COMMENT; Schema: tenant_ispm; Owner: postgres
--

COMMENT ON TABLE tenant_ispm.message_enseignant IS 'Messages envoyés par les enseignants aux étudiants';


--
-- TOC entry 6534 (class 0 OID 0)
-- Dependencies: 303
-- Name: COLUMN message_enseignant.type_message; Type: COMMENT; Schema: tenant_ispm; Owner: postgres
--

COMMENT ON COLUMN tenant_ispm.message_enseignant.type_message IS 'Type: direct (1 étudiant), classe (tous étudiants classe), parcours (filtré par parcours/niveau)';


--
-- TOC entry 260 (class 1259 OID 57688)
-- Name: mouvement_stock; Type: TABLE; Schema: tenant_ispm; Owner: postgres
--

CREATE TABLE tenant_ispm.mouvement_stock (
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


ALTER TABLE tenant_ispm.mouvement_stock OWNER TO postgres;

--
-- TOC entry 301 (class 1259 OID 83901)
-- Name: niveau_etude; Type: TABLE; Schema: tenant_ispm; Owner: postgres
--

CREATE TABLE tenant_ispm.niveau_etude (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code character varying(20) NOT NULL,
    libelle character varying(255) NOT NULL,
    description text,
    ordre integer NOT NULL,
    type_diplome character varying(50),
    actif boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE tenant_ispm.niveau_etude OWNER TO postgres;

--
-- TOC entry 245 (class 1259 OID 57189)
-- Name: note; Type: TABLE; Schema: tenant_ispm; Owner: postgres
--

CREATE TABLE tenant_ispm.note (
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


ALTER TABLE tenant_ispm.note OWNER TO postgres;

--
-- TOC entry 278 (class 1259 OID 58210)
-- Name: note_derogatoire; Type: TABLE; Schema: tenant_ispm; Owner: postgres
--

CREATE TABLE tenant_ispm.note_derogatoire (
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
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE tenant_ispm.note_derogatoire OWNER TO postgres;

--
-- TOC entry 264 (class 1259 OID 57791)
-- Name: notification; Type: TABLE; Schema: tenant_ispm; Owner: postgres
--

CREATE TABLE tenant_ispm.notification (
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


ALTER TABLE tenant_ispm.notification OWNER TO postgres;

--
-- TOC entry 251 (class 1259 OID 57397)
-- Name: paiement; Type: TABLE; Schema: tenant_ispm; Owner: postgres
--

CREATE TABLE tenant_ispm.paiement (
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
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT paiement_mode_paiement_check CHECK (((mode_paiement)::text = ANY ((ARRAY['especes'::character varying, 'cheque'::character varying, 'virement'::character varying, 'carte_bancaire'::character varying, 'mobile_money'::character varying])::text[]))),
    CONSTRAINT paiement_montant_check CHECK ((montant > (0)::numeric)),
    CONSTRAINT paiement_statut_check CHECK (((statut)::text = ANY ((ARRAY['valide'::character varying, 'annule'::character varying, 'rembourse'::character varying, 'en_attente'::character varying])::text[])))
);


ALTER TABLE tenant_ispm.paiement OWNER TO postgres;

--
-- TOC entry 302 (class 1259 OID 83919)
-- Name: paiement_inscription; Type: TABLE; Schema: tenant_ispm; Owner: postgres
--

CREATE TABLE tenant_ispm.paiement_inscription (
    id uuid DEFAULT gen_random_uuid() CONSTRAINT paiement_inscription_id_not_null1 NOT NULL,
    inscription_id uuid NOT NULL,
    etudiant_id uuid NOT NULL,
    montant numeric(10,2) NOT NULL,
    methode_paiement character varying(50) NOT NULL,
    reference_paiement character varying(255) NOT NULL,
    date_paiement timestamp without time zone NOT NULL,
    preuve_url text,
    statut character varying(50) DEFAULT 'en_attente'::character varying,
    valide_par uuid,
    date_validation timestamp without time zone,
    note_validation text,
    motif_rejet text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_validation CHECK (((((statut)::text = 'valide'::text) AND (valide_par IS NOT NULL) AND (date_validation IS NOT NULL)) OR (((statut)::text = 'rejete'::text) AND (valide_par IS NOT NULL) AND (date_validation IS NOT NULL) AND (motif_rejet IS NOT NULL)) OR (((statut)::text = 'en_attente'::text) AND (valide_par IS NULL) AND (date_validation IS NULL)))),
    CONSTRAINT paiement_inscription_methode_paiement_check CHECK (((methode_paiement)::text = ANY ((ARRAY['virement'::character varying, 'mobile_money'::character varying, 'especes'::character varying, 'cheque'::character varying, 'carte_bancaire'::character varying])::text[]))),
    CONSTRAINT paiement_inscription_montant_check CHECK ((montant > (0)::numeric)),
    CONSTRAINT paiement_inscription_statut_check CHECK (((statut)::text = ANY ((ARRAY['en_attente'::character varying, 'valide'::character varying, 'rejete'::character varying])::text[])))
);


ALTER TABLE tenant_ispm.paiement_inscription OWNER TO postgres;

--
-- TOC entry 6535 (class 0 OID 0)
-- Dependencies: 302
-- Name: TABLE paiement_inscription; Type: COMMENT; Schema: tenant_ispm; Owner: postgres
--

COMMENT ON TABLE tenant_ispm.paiement_inscription IS 'Paiements d''inscription soumis par les étudiants en attente de validation';


--
-- TOC entry 6536 (class 0 OID 0)
-- Dependencies: 302
-- Name: COLUMN paiement_inscription.methode_paiement; Type: COMMENT; Schema: tenant_ispm; Owner: postgres
--

COMMENT ON COLUMN tenant_ispm.paiement_inscription.methode_paiement IS 'virement, mobile_money, especes, cheque, carte_bancaire';


--
-- TOC entry 6537 (class 0 OID 0)
-- Dependencies: 302
-- Name: COLUMN paiement_inscription.reference_paiement; Type: COMMENT; Schema: tenant_ispm; Owner: postgres
--

COMMENT ON COLUMN tenant_ispm.paiement_inscription.reference_paiement IS 'Numéro de transaction ou référence du paiement';


--
-- TOC entry 6538 (class 0 OID 0)
-- Dependencies: 302
-- Name: COLUMN paiement_inscription.preuve_url; Type: COMMENT; Schema: tenant_ispm; Owner: postgres
--

COMMENT ON COLUMN tenant_ispm.paiement_inscription.preuve_url IS 'URL de la capture d''écran ou preuve de paiement';


--
-- TOC entry 6539 (class 0 OID 0)
-- Dependencies: 302
-- Name: COLUMN paiement_inscription.statut; Type: COMMENT; Schema: tenant_ispm; Owner: postgres
--

COMMENT ON COLUMN tenant_ispm.paiement_inscription.statut IS 'en_attente, valide, rejete';


--
-- TOC entry 231 (class 1259 OID 56759)
-- Name: parcours; Type: TABLE; Schema: tenant_ispm; Owner: postgres
--

CREATE TABLE tenant_ispm.parcours (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    departement_id uuid NOT NULL,
    code character varying(30) NOT NULL,
    nom character varying(200) NOT NULL,
    niveau character varying(20) NOT NULL,
    duree_annees smallint DEFAULT 3 NOT NULL,
    responsable_id uuid,
    description text,
    actif boolean DEFAULT true,
    annee_ouverture integer,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    secretaire_id uuid,
    date_ouverture date,
    motif_ouverture text,
    conditions_ouverture text,
    date_fermeture date,
    motif_fermeture text,
    valide_par_president integer,
    CONSTRAINT parcours_niveau_check CHECK (((niveau)::text = ANY ((ARRAY['Licence'::character varying, 'Master'::character varying, 'Doctorat'::character varying, 'BTS'::character varying, 'DUT'::character varying])::text[])))
);


ALTER TABLE tenant_ispm.parcours OWNER TO postgres;

--
-- TOC entry 271 (class 1259 OID 57944)
-- Name: permissions_portail; Type: TABLE; Schema: tenant_ispm; Owner: postgres
--

CREATE TABLE tenant_ispm.permissions_portail (
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


ALTER TABLE tenant_ispm.permissions_portail OWNER TO postgres;

--
-- TOC entry 261 (class 1259 OID 57710)
-- Name: planning_entretien; Type: TABLE; Schema: tenant_ispm; Owner: postgres
--

CREATE TABLE tenant_ispm.planning_entretien (
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


ALTER TABLE tenant_ispm.planning_entretien OWNER TO postgres;

--
-- TOC entry 283 (class 1259 OID 58486)
-- Name: pointage_qr; Type: TABLE; Schema: tenant_ispm; Owner: postgres
--

CREATE TABLE tenant_ispm.pointage_qr (
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
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE tenant_ispm.pointage_qr OWNER TO postgres;

--
-- TOC entry 6540 (class 0 OID 0)
-- Dependencies: 283
-- Name: TABLE pointage_qr; Type: COMMENT; Schema: tenant_ispm; Owner: postgres
--

COMMENT ON TABLE tenant_ispm.pointage_qr IS 'Gestion des QR codes pour le pointage des étudiants';


--
-- TOC entry 242 (class 1259 OID 57092)
-- Name: presence; Type: TABLE; Schema: tenant_ispm; Owner: postgres
--

CREATE TABLE tenant_ispm.presence (
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


ALTER TABLE tenant_ispm.presence OWNER TO postgres;

--
-- TOC entry 284 (class 1259 OID 58504)
-- Name: presence_surveillance; Type: TABLE; Schema: tenant_ispm; Owner: postgres
--

CREATE TABLE tenant_ispm.presence_surveillance (
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
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE tenant_ispm.presence_surveillance OWNER TO postgres;

--
-- TOC entry 6541 (class 0 OID 0)
-- Dependencies: 284
-- Name: TABLE presence_surveillance; Type: COMMENT; Schema: tenant_ispm; Owner: postgres
--

COMMENT ON TABLE tenant_ispm.presence_surveillance IS 'Suivi des présences et absences avec validation surveillant';


--
-- TOC entry 275 (class 1259 OID 58063)
-- Name: proces_verbal; Type: TABLE; Schema: tenant_ispm; Owner: postgres
--

CREATE TABLE tenant_ispm.proces_verbal (
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
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    transmis_a_scolarite boolean DEFAULT false,
    date_transmission_scolarite timestamp without time zone,
    transmis_par character varying(255),
    CONSTRAINT proces_verbal_statut_check CHECK (((statut)::text = ANY ((ARRAY['brouillon'::character varying, 'valide'::character varying, 'archive'::character varying])::text[])))
);


ALTER TABLE tenant_ispm.proces_verbal OWNER TO postgres;

--
-- TOC entry 246 (class 1259 OID 57244)
-- Name: pv_deliberation; Type: TABLE; Schema: tenant_ispm; Owner: postgres
--

CREATE TABLE tenant_ispm.pv_deliberation (
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


ALTER TABLE tenant_ispm.pv_deliberation OWNER TO postgres;

--
-- TOC entry 262 (class 1259 OID 57737)
-- Name: rapport_entretien; Type: TABLE; Schema: tenant_ispm; Owner: postgres
--

CREATE TABLE tenant_ispm.rapport_entretien (
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


ALTER TABLE tenant_ispm.rapport_entretien OWNER TO postgres;

--
-- TOC entry 277 (class 1259 OID 58171)
-- Name: rattrapage; Type: TABLE; Schema: tenant_ispm; Owner: postgres
--

CREATE TABLE tenant_ispm.rattrapage (
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
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE tenant_ispm.rattrapage OWNER TO postgres;

--
-- TOC entry 313 (class 1259 OID 84944)
-- Name: recrutement; Type: TABLE; Schema: tenant_ispm; Owner: postgres
--

CREATE TABLE tenant_ispm.recrutement (
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


ALTER TABLE tenant_ispm.recrutement OWNER TO postgres;

--
-- TOC entry 273 (class 1259 OID 57985)
-- Name: referentiel_competences; Type: TABLE; Schema: tenant_ispm; Owner: postgres
--

CREATE TABLE tenant_ispm.referentiel_competences (
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


ALTER TABLE tenant_ispm.referentiel_competences OWNER TO postgres;

--
-- TOC entry 258 (class 1259 OID 57632)
-- Name: reservation_salle; Type: TABLE; Schema: tenant_ispm; Owner: postgres
--

CREATE TABLE tenant_ispm.reservation_salle (
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


ALTER TABLE tenant_ispm.reservation_salle OWNER TO postgres;

--
-- TOC entry 247 (class 1259 OID 57279)
-- Name: resultat_deliberation; Type: TABLE; Schema: tenant_ispm; Owner: postgres
--

CREATE TABLE tenant_ispm.resultat_deliberation (
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


ALTER TABLE tenant_ispm.resultat_deliberation OWNER TO postgres;

--
-- TOC entry 288 (class 1259 OID 62006)
-- Name: resultat_semestre; Type: TABLE; Schema: tenant_ispm; Owner: postgres
--

CREATE TABLE tenant_ispm.resultat_semestre (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
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


ALTER TABLE tenant_ispm.resultat_semestre OWNER TO postgres;

--
-- TOC entry 289 (class 1259 OID 62043)
-- Name: resultat_ue; Type: TABLE; Schema: tenant_ispm; Owner: postgres
--

CREATE TABLE tenant_ispm.resultat_ue (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
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


ALTER TABLE tenant_ispm.resultat_ue OWNER TO postgres;

--
-- TOC entry 240 (class 1259 OID 57030)
-- Name: salle; Type: TABLE; Schema: tenant_ispm; Owner: postgres
--

CREATE TABLE tenant_ispm.salle (
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


ALTER TABLE tenant_ispm.salle OWNER TO postgres;

--
-- TOC entry 282 (class 1259 OID 58385)
-- Name: secretaire_parcours; Type: TABLE; Schema: tenant_ispm; Owner: postgres
--

CREATE TABLE tenant_ispm.secretaire_parcours (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    secretaire_id uuid NOT NULL,
    parcours_id uuid NOT NULL,
    assigned_at timestamp with time zone DEFAULT now(),
    assigned_by uuid,
    actif boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE tenant_ispm.secretaire_parcours OWNER TO postgres;

--
-- TOC entry 250 (class 1259 OID 57396)
-- Name: seq_recu; Type: SEQUENCE; Schema: tenant_ispm; Owner: postgres
--

CREATE SEQUENCE tenant_ispm.seq_recu
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE tenant_ispm.seq_recu OWNER TO postgres;

--
-- TOC entry 244 (class 1259 OID 57168)
-- Name: session_examen; Type: TABLE; Schema: tenant_ispm; Owner: postgres
--

CREATE TABLE tenant_ispm.session_examen (
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


ALTER TABLE tenant_ispm.session_examen OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 56704)
-- Name: session_jwt; Type: TABLE; Schema: tenant_ispm; Owner: postgres
--

CREATE TABLE tenant_ispm.session_jwt (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    utilisateur_id uuid NOT NULL,
    refresh_token text NOT NULL,
    ip_address inet,
    user_agent text,
    expires_at timestamp with time zone NOT NULL,
    revoque boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE tenant_ispm.session_jwt OWNER TO postgres;

--
-- TOC entry 298 (class 1259 OID 83569)
-- Name: soutenance; Type: TABLE; Schema: tenant_ispm; Owner: postgres
--

CREATE TABLE tenant_ispm.soutenance (
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


ALTER TABLE tenant_ispm.soutenance OWNER TO postgres;

--
-- TOC entry 296 (class 1259 OID 83491)
-- Name: stage; Type: TABLE; Schema: tenant_ispm; Owner: postgres
--

CREATE TABLE tenant_ispm.stage (
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


ALTER TABLE tenant_ispm.stage OWNER TO postgres;

--
-- TOC entry 259 (class 1259 OID 57666)
-- Name: stock; Type: TABLE; Schema: tenant_ispm; Owner: postgres
--

CREATE TABLE tenant_ispm.stock (
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


ALTER TABLE tenant_ispm.stock OWNER TO postgres;

--
-- TOC entry 274 (class 1259 OID 58013)
-- Name: sujet_examen; Type: TABLE; Schema: tenant_ispm; Owner: postgres
--

CREATE TABLE tenant_ispm.sujet_examen (
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
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    fichier_correction_url character varying(500),
    date_depot_correction timestamp with time zone,
    CONSTRAINT sujet_examen_statut_check CHECK (((statut)::text = ANY ((ARRAY['soumis'::character varying, 'en_relecture'::character varying, 'valide'::character varying, 'rejete'::character varying])::text[])))
);


ALTER TABLE tenant_ispm.sujet_examen OWNER TO postgres;

--
-- TOC entry 291 (class 1259 OID 62123)
-- Name: suplement_diplome; Type: TABLE; Schema: tenant_ispm; Owner: postgres
--

CREATE TABLE tenant_ispm.suplement_diplome (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    diplome_id uuid NOT NULL,
    langue character varying(10) DEFAULT 'FR'::character varying,
    identite_titulaire jsonb,
    nom_diplome character varying(200) NOT NULL,
    domaine_etudes character varying(200),
    objectifs text,
    niveau_qualification character varying(100),
    duree_etudes character varying(50),
    nom_etablissement character varying(200) NOT NULL,
    statut_etablissement character varying(100),
    langue_enseignement character varying(50),
    details_programme jsonb,
    resultats_detailles jsonb,
    competences jsonb,
    systeme_educatif jsonb,
    stage jsonb,
    projet jsonb,
    certifie_par uuid,
    date_certification timestamp with time zone DEFAULT now(),
    hash_integrite character varying(128),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE tenant_ispm.suplement_diplome OWNER TO postgres;

--
-- TOC entry 295 (class 1259 OID 83458)
-- Name: support_cours; Type: TABLE; Schema: tenant_ispm; Owner: postgres
--

CREATE TABLE tenant_ispm.support_cours (
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


ALTER TABLE tenant_ispm.support_cours OWNER TO postgres;

--
-- TOC entry 257 (class 1259 OID 57589)
-- Name: ticket_maintenance; Type: TABLE; Schema: tenant_ispm; Owner: postgres
--

CREATE TABLE tenant_ispm.ticket_maintenance (
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


ALTER TABLE tenant_ispm.ticket_maintenance OWNER TO postgres;

--
-- TOC entry 292 (class 1259 OID 62149)
-- Name: transfert_etudiant; Type: TABLE; Schema: tenant_ispm; Owner: postgres
--

CREATE TABLE tenant_ispm.transfert_etudiant (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    etudiant_id uuid NOT NULL,
    etablissement_origine character varying(200) NOT NULL,
    pays_origine character varying(100),
    diplome_origine character varying(200),
    annee_obtention_origine integer,
    parcours_destination_id uuid NOT NULL,
    niveau_destination smallint NOT NULL,
    releves_notes_origine text[],
    attestations_origine text[],
    programme_origine text,
    decision_equivalence character varying(20) DEFAULT 'en_attente'::character varying NOT NULL,
    credits_reconnus smallint DEFAULT 0,
    ues_validees uuid[],
    conditions_complementaires text,
    valide_par uuid,
    date_validation timestamp with time zone,
    observations text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT transfert_etudiant_decision_equivalence_check CHECK (((decision_equivalence)::text = ANY ((ARRAY['en_attente'::character varying, 'acceptee'::character varying, 'refusee'::character varying, 'complementaire'::character varying])::text[])))
);


ALTER TABLE tenant_ispm.transfert_etudiant OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 56790)
-- Name: unite_enseignement; Type: TABLE; Schema: tenant_ispm; Owner: postgres
--

CREATE TABLE tenant_ispm.unite_enseignement (
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
    actif boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    enseignant_id uuid,
    CONSTRAINT unite_enseignement_annee_niveau_check CHECK (((annee_niveau >= 1) AND (annee_niveau <= 8))),
    CONSTRAINT unite_enseignement_semestre_check CHECK (((semestre >= 1) AND (semestre <= 12))),
    CONSTRAINT unite_enseignement_type_ue_check CHECK (((type_ue)::text = ANY ((ARRAY['obligatoire'::character varying, 'optionnel'::character varying, 'libre'::character varying])::text[])))
);


ALTER TABLE tenant_ispm.unite_enseignement OWNER TO postgres;

--
-- TOC entry 6542 (class 0 OID 0)
-- Dependencies: 232
-- Name: COLUMN unite_enseignement.enseignant_id; Type: COMMENT; Schema: tenant_ispm; Owner: postgres
--

COMMENT ON COLUMN tenant_ispm.unite_enseignement.enseignant_id IS 'Professeur responsable de l''UE. Une UE ne peut avoir qu''un seul professeur responsable (règle métier).';


--
-- TOC entry 227 (class 1259 OID 56683)
-- Name: utilisateur; Type: TABLE; Schema: tenant_ispm; Owner: postgres
--

CREATE TABLE tenant_ispm.utilisateur (
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
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    tenant_id uuid,
    parcours_assignes jsonb DEFAULT '[]'::jsonb,
    password_reset_required boolean DEFAULT false,
    last_password_reset timestamp with time zone,
    CONSTRAINT utilisateur_role_check CHECK (((role)::text = ANY ((ARRAY['admin'::character varying, 'resp_pedagogique'::character varying, 'secretaire_parcours'::character varying, 'scolarite'::character varying, 'caissier'::character varying, 'economat'::character varying, 'rh'::character varying, 'logistique'::character varying, 'entretien'::character varying, 'communication'::character varying, 'president'::character varying, 'surveillant_general'::character varying, 'etudiant'::character varying, 'parent'::character varying, 'enseignant'::character varying])::text[])))
);


ALTER TABLE tenant_ispm.utilisateur OWNER TO postgres;

--
-- TOC entry 294 (class 1259 OID 62215)
-- Name: verrouillage_notes; Type: TABLE; Schema: tenant_ispm; Owner: postgres
--

CREATE TABLE tenant_ispm.verrouillage_notes (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
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


ALTER TABLE tenant_ispm.verrouillage_notes OWNER TO postgres;

--
-- TOC entry 270 (class 1259 OID 57911)
-- Name: vue_absences_etudiant; Type: VIEW; Schema: tenant_ispm; Owner: postgres
--

CREATE VIEW tenant_ispm.vue_absences_etudiant AS
 SELECT e.id AS etudiant_id,
    e.matricule,
    (((e.nom)::text || ' '::text) || (e.prenom)::text) AS etudiant_nom,
    count(pr.id) AS total_seances,
    count(pr.id) FILTER (WHERE ((pr.statut)::text = 'absent'::text)) AS absences_total,
    count(pr.id) FILTER (WHERE (((pr.statut)::text = 'absent'::text) AND (pr.justifie = true))) AS absences_justifiees,
    count(pr.id) FILTER (WHERE (((pr.statut)::text = 'absent'::text) AND (pr.justifie = false))) AS absences_injustifiees,
    count(pr.id) FILTER (WHERE ((pr.statut)::text = 'retard'::text)) AS retards,
    round(((100.0 * (count(pr.id) FILTER (WHERE ((pr.statut)::text = 'present'::text)))::numeric) / (NULLIF(count(pr.id), 0))::numeric), 1) AS taux_assiduite
   FROM (tenant_ispm.etudiant e
     JOIN tenant_ispm.presence pr ON ((e.id = pr.etudiant_id)))
  GROUP BY e.id, e.matricule, e.nom, e.prenom;


ALTER VIEW tenant_ispm.vue_absences_etudiant OWNER TO postgres;

--
-- TOC entry 268 (class 1259 OID 57901)
-- Name: vue_kpi_president; Type: VIEW; Schema: tenant_ispm; Owner: postgres
--

CREATE VIEW tenant_ispm.vue_kpi_president AS
 SELECT ( SELECT count(*) AS count
           FROM tenant_ispm.etudiant
          WHERE (etudiant.actif = true)) AS total_etudiants,
    ( SELECT count(*) AS count
           FROM (tenant_ispm.inscription i
             JOIN tenant_ispm.annee_academique aa ON ((aa.id = i.annee_academique_id)))
          WHERE ((aa.active = true) AND ((i.statut)::text = 'validee'::text))) AS etudiants_inscrits_annee,
    ( SELECT count(*) AS count
           FROM tenant_ispm.utilisateur
          WHERE (((utilisateur.role)::text = 'professeur'::text) AND (utilisateur.actif = true))) AS total_enseignants,
    ( SELECT count(*) AS count
           FROM tenant_ispm.utilisateur
          WHERE (((utilisateur.role)::text <> ALL ((ARRAY['etudiant'::character varying, 'parent'::character varying, 'professeur'::character varying])::text[])) AND (utilisateur.actif = true))) AS total_personnel,
    ( SELECT COALESCE(sum(p.montant), (0)::numeric) AS "coalesce"
           FROM ((tenant_ispm.paiement p
             JOIN tenant_ispm.inscription i ON ((p.inscription_id = i.id)))
             JOIN tenant_ispm.annee_academique aa ON ((aa.id = i.annee_academique_id)))
          WHERE ((aa.active = true) AND ((p.statut)::text = 'valide'::text))) AS recettes_annee,
    ( SELECT COALESCE(sum(depense.montant), (0)::numeric) AS "coalesce"
           FROM tenant_ispm.depense
          WHERE (((depense.statut)::text = 'paye'::text) AND (depense.date_depense >= date_trunc('month'::text, now())))) AS depenses_mois,
    ( SELECT count(*) AS count
           FROM tenant_ispm.ticket_maintenance
          WHERE ((ticket_maintenance.statut)::text = ANY ((ARRAY['ouvert'::character varying, 'en_cours'::character varying])::text[]))) AS tickets_maintenance_ouverts,
    ( SELECT count(*) AS count
           FROM tenant_ispm.stock
          WHERE (stock.quantite_stock <= stock.seuil_alerte)) AS alertes_stock;


ALTER VIEW tenant_ispm.vue_kpi_president OWNER TO postgres;

--
-- TOC entry 266 (class 1259 OID 57891)
-- Name: vue_moyenne_ue; Type: VIEW; Schema: tenant_ispm; Owner: postgres
--

CREATE VIEW tenant_ispm.vue_moyenne_ue AS
 SELECT n.etudiant_id,
    ec.ue_id,
    n.session_id,
    round((sum((n.valeur * ec.coefficient)) / NULLIF(sum(ec.coefficient), (0)::numeric)), 2) AS moyenne_ue,
    count(n.id) AS nb_notes,
    bool_and(n.verrouille) AS toutes_verrouillees
   FROM (tenant_ispm.note n
     JOIN tenant_ispm.element_constitutif ec ON ((n.ec_id = ec.id)))
  GROUP BY n.etudiant_id, ec.ue_id, n.session_id;


ALTER VIEW tenant_ispm.vue_moyenne_ue OWNER TO postgres;

--
-- TOC entry 267 (class 1259 OID 57896)
-- Name: vue_moyenne_semestre; Type: VIEW; Schema: tenant_ispm; Owner: postgres
--

CREATE VIEW tenant_ispm.vue_moyenne_semestre AS
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
   FROM (tenant_ispm.vue_moyenne_ue mue
     JOIN tenant_ispm.unite_enseignement ue ON ((mue.ue_id = ue.id)))
  GROUP BY mue.etudiant_id, ue.semestre, mue.session_id;


ALTER VIEW tenant_ispm.vue_moyenne_semestre OWNER TO postgres;

--
-- TOC entry 269 (class 1259 OID 57906)
-- Name: vue_paiement_etudiant; Type: VIEW; Schema: tenant_ispm; Owner: postgres
--

CREATE VIEW tenant_ispm.vue_paiement_etudiant AS
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
   FROM (((((tenant_ispm.etudiant e
     JOIN tenant_ispm.inscription i ON ((e.id = i.etudiant_id)))
     JOIN tenant_ispm.parcours p ON ((p.id = i.parcours_id)))
     JOIN tenant_ispm.annee_academique aa ON ((aa.id = i.annee_academique_id)))
     LEFT JOIN tenant_ispm.grille_tarifaire gt ON (((gt.parcours_id = i.parcours_id) AND (gt.annee_academique_id = i.annee_academique_id) AND ((gt.annee_niveau = i.annee_niveau) OR (gt.annee_niveau IS NULL)))))
     LEFT JOIN tenant_ispm.paiement pay ON ((pay.inscription_id = i.id)))
  WHERE (aa.active = true)
  GROUP BY e.id, e.matricule, e.nom, e.prenom, p.nom, aa.libelle, gt.montant_total;


ALTER VIEW tenant_ispm.vue_paiement_etudiant OWNER TO postgres;

--
-- TOC entry 5621 (class 2604 OID 84431)
-- Name: convention id; Type: DEFAULT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.convention ALTER COLUMN id SET DEFAULT nextval('tenant_ispm.convention_id_seq'::regclass);


--
-- TOC entry 5626 (class 2604 OID 84456)
-- Name: delegation_signature id; Type: DEFAULT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.delegation_signature ALTER COLUMN id SET DEFAULT nextval('tenant_ispm.delegation_signature_id_seq'::regclass);


--
-- TOC entry 5629 (class 2604 OID 84593)
-- Name: evaluation_personnel id; Type: DEFAULT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.evaluation_personnel ALTER COLUMN id SET DEFAULT nextval('tenant_ispm.evaluation_personnel_id_seq'::regclass);


--
-- TOC entry 5945 (class 2606 OID 58147)
-- Name: absence_enseignant absence_enseignant_pkey; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.absence_enseignant
    ADD CONSTRAINT absence_enseignant_pkey PRIMARY KEY (id);


--
-- TOC entry 5826 (class 2606 OID 56991)
-- Name: affectation_cours affectation_cours_pkey; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.affectation_cours
    ADD CONSTRAINT affectation_cours_pkey PRIMARY KEY (id);


--
-- TOC entry 5991 (class 2606 OID 58538)
-- Name: alerte_discipline alerte_discipline_pkey; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.alerte_discipline
    ADD CONSTRAINT alerte_discipline_pkey PRIMARY KEY (id);


--
-- TOC entry 5780 (class 2606 OID 56738)
-- Name: annee_academique annee_academique_libelle_key; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.annee_academique
    ADD CONSTRAINT annee_academique_libelle_key UNIQUE (libelle);


--
-- TOC entry 5782 (class 2606 OID 56736)
-- Name: annee_academique annee_academique_pkey; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.annee_academique
    ADD CONSTRAINT annee_academique_pkey PRIMARY KEY (id);


--
-- TOC entry 5913 (class 2606 OID 57780)
-- Name: annonce annonce_pkey; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.annonce
    ADD CONSTRAINT annonce_pkey PRIMARY KEY (id);


--
-- TOC entry 6035 (class 2606 OID 62204)
-- Name: archive_scolarite archive_scolarite_pkey; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.archive_scolarite
    ADD CONSTRAINT archive_scolarite_pkey PRIMARY KEY (id);


--
-- TOC entry 6143 (class 2606 OID 85175)
-- Name: attestation attestation_pkey; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.attestation
    ADD CONSTRAINT attestation_pkey PRIMARY KEY (id);


--
-- TOC entry 5828 (class 2606 OID 57029)
-- Name: batiment batiment_code_key; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.batiment
    ADD CONSTRAINT batiment_code_key UNIQUE (code);


--
-- TOC entry 5830 (class 2606 OID 57027)
-- Name: batiment batiment_pkey; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.batiment
    ADD CONSTRAINT batiment_pkey PRIMARY KEY (id);


--
-- TOC entry 5885 (class 2606 OID 57450)
-- Name: budget budget_pkey; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.budget
    ADD CONSTRAINT budget_pkey PRIMARY KEY (id);


--
-- TOC entry 5802 (class 2606 OID 56858)
-- Name: calendrier_academique calendrier_academique_pkey; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.calendrier_academique
    ADD CONSTRAINT calendrier_academique_pkey PRIMARY KEY (id);


--
-- TOC entry 6138 (class 2606 OID 84993)
-- Name: candidature candidature_pkey; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.candidature
    ADD CONSTRAINT candidature_pkey PRIMARY KEY (id);


--
-- TOC entry 5995 (class 2606 OID 58556)
-- Name: configuration_examen configuration_examen_pkey; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.configuration_examen
    ADD CONSTRAINT configuration_examen_pkey PRIMARY KEY (id);


--
-- TOC entry 5891 (class 2606 OID 57548)
-- Name: conge_personnel conge_personnel_pkey; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.conge_personnel
    ADD CONSTRAINT conge_personnel_pkey PRIMARY KEY (id);


--
-- TOC entry 5889 (class 2606 OID 57520)
-- Name: contrat_personnel contrat_personnel_pkey; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.contrat_personnel
    ADD CONSTRAINT contrat_personnel_pkey PRIMARY KEY (id);


--
-- TOC entry 6106 (class 2606 OID 84448)
-- Name: convention convention_pkey; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.convention
    ADD CONSTRAINT convention_pkey PRIMARY KEY (id);


--
-- TOC entry 5962 (class 2606 OID 58317)
-- Name: convocation convocation_pkey; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.convocation
    ADD CONSTRAINT convocation_pkey PRIMARY KEY (id);


--
-- TOC entry 6128 (class 2606 OID 84940)
-- Name: declaration_sociale declaration_sociale_pkey; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.declaration_sociale
    ADD CONSTRAINT declaration_sociale_pkey PRIMARY KEY (id);


--
-- TOC entry 6111 (class 2606 OID 84469)
-- Name: delegation_signature delegation_signature_pkey; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.delegation_signature
    ADD CONSTRAINT delegation_signature_pkey PRIMARY KEY (id);


--
-- TOC entry 5999 (class 2606 OID 61983)
-- Name: deliberation deliberation_pkey; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.deliberation
    ADD CONSTRAINT deliberation_pkey PRIMARY KEY (id);


--
-- TOC entry 6001 (class 2606 OID 61985)
-- Name: deliberation deliberation_session_examen_id_parcours_id_semestre_annee_n_key; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.deliberation
    ADD CONSTRAINT deliberation_session_examen_id_parcours_id_semestre_annee_n_key UNIQUE (session_examen_id, parcours_id, semestre, annee_niveau);


--
-- TOC entry 5958 (class 2606 OID 58283)
-- Name: demande_etudiant demande_etudiant_pkey; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.demande_etudiant
    ADD CONSTRAINT demande_etudiant_pkey PRIMARY KEY (id);


--
-- TOC entry 6075 (class 2606 OID 83652)
-- Name: demande_ressource demande_ressource_pkey; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.demande_ressource
    ADD CONSTRAINT demande_ressource_pkey PRIMARY KEY (id);


--
-- TOC entry 5784 (class 2606 OID 56753)
-- Name: departement departement_code_key; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.departement
    ADD CONSTRAINT departement_code_key UNIQUE (code);


--
-- TOC entry 5786 (class 2606 OID 56751)
-- Name: departement departement_pkey; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.departement
    ADD CONSTRAINT departement_pkey PRIMARY KEY (id);


--
-- TOC entry 5887 (class 2606 OID 57483)
-- Name: depense depense_pkey; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.depense
    ADD CONSTRAINT depense_pkey PRIMARY KEY (id);


--
-- TOC entry 6021 (class 2606 OID 62102)
-- Name: diplome diplome_numero_diplome_key; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.diplome
    ADD CONSTRAINT diplome_numero_diplome_key UNIQUE (numero_diplome);


--
-- TOC entry 6023 (class 2606 OID 62100)
-- Name: diplome diplome_pkey; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.diplome
    ADD CONSTRAINT diplome_pkey PRIMARY KEY (id);


--
-- TOC entry 5969 (class 2606 OID 58362)
-- Name: dossier_etudiant dossier_etudiant_pkey; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.dossier_etudiant
    ADD CONSTRAINT dossier_etudiant_pkey PRIMARY KEY (id);


--
-- TOC entry 5871 (class 2606 OID 57390)
-- Name: echeancier echeancier_inscription_id_num_tranche_key; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.echeancier
    ADD CONSTRAINT echeancier_inscription_id_num_tranche_key UNIQUE (inscription_id, num_tranche);


--
-- TOC entry 5873 (class 2606 OID 57388)
-- Name: echeancier echeancier_pkey; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.echeancier
    ADD CONSTRAINT echeancier_pkey PRIMARY KEY (id);


--
-- TOC entry 5798 (class 2606 OID 56835)
-- Name: element_constitutif element_constitutif_pkey; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.element_constitutif
    ADD CONSTRAINT element_constitutif_pkey PRIMARY KEY (id);


--
-- TOC entry 5800 (class 2606 OID 56837)
-- Name: element_constitutif element_constitutif_ue_id_code_key; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.element_constitutif
    ADD CONSTRAINT element_constitutif_ue_id_code_key UNIQUE (ue_id, code);


--
-- TOC entry 5836 (class 2606 OID 57076)
-- Name: emploi_du_temps emploi_du_temps_pkey; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.emploi_du_temps
    ADD CONSTRAINT emploi_du_temps_pkey PRIMARY KEY (id);


--
-- TOC entry 5820 (class 2606 OID 56964)
-- Name: enseignant enseignant_matricule_key; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.enseignant
    ADD CONSTRAINT enseignant_matricule_key UNIQUE (matricule);


--
-- TOC entry 5822 (class 2606 OID 56960)
-- Name: enseignant enseignant_pkey; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.enseignant
    ADD CONSTRAINT enseignant_pkey PRIMARY KEY (id);


--
-- TOC entry 5824 (class 2606 OID 56962)
-- Name: enseignant enseignant_utilisateur_id_key; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.enseignant
    ADD CONSTRAINT enseignant_utilisateur_id_key UNIQUE (utilisateur_id);


--
-- TOC entry 5804 (class 2606 OID 56890)
-- Name: etudiant etudiant_matricule_key; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.etudiant
    ADD CONSTRAINT etudiant_matricule_key UNIQUE (matricule);


--
-- TOC entry 5806 (class 2606 OID 56886)
-- Name: etudiant etudiant_pkey; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.etudiant
    ADD CONSTRAINT etudiant_pkey PRIMARY KEY (id);


--
-- TOC entry 5808 (class 2606 OID 56888)
-- Name: etudiant etudiant_utilisateur_id_key; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.etudiant
    ADD CONSTRAINT etudiant_utilisateur_id_key UNIQUE (utilisateur_id);


--
-- TOC entry 6116 (class 2606 OID 84611)
-- Name: evaluation_personnel evaluation_personnel_pkey; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.evaluation_personnel
    ADD CONSTRAINT evaluation_personnel_pkey PRIMARY KEY (id);


--
-- TOC entry 6069 (class 2606 OID 83620)
-- Name: evaluation_soutenance evaluation_soutenance_pkey; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.evaluation_soutenance
    ADD CONSTRAINT evaluation_soutenance_pkey PRIMARY KEY (id);


--
-- TOC entry 6071 (class 2606 OID 83622)
-- Name: evaluation_soutenance evaluation_soutenance_soutenance_id_evaluateur_id_key; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.evaluation_soutenance
    ADD CONSTRAINT evaluation_soutenance_soutenance_id_evaluateur_id_key UNIQUE (soutenance_id, evaluateur_id);


--
-- TOC entry 5893 (class 2606 OID 57583)
-- Name: fiche_paie fiche_paie_contrat_id_annee_mois_key; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.fiche_paie
    ADD CONSTRAINT fiche_paie_contrat_id_annee_mois_key UNIQUE (contrat_id, annee, mois);


--
-- TOC entry 5895 (class 2606 OID 57581)
-- Name: fiche_paie fiche_paie_pkey; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.fiche_paie
    ADD CONSTRAINT fiche_paie_pkey PRIMARY KEY (id);


--
-- TOC entry 6058 (class 2606 OID 83556)
-- Name: fiche_suivi_stage fiche_suivi_stage_pkey; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.fiche_suivi_stage
    ADD CONSTRAINT fiche_suivi_stage_pkey PRIMARY KEY (id);


--
-- TOC entry 5867 (class 2606 OID 57365)
-- Name: grille_tarifaire grille_tarifaire_parcours_id_annee_academique_id_annee_nive_key; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.grille_tarifaire
    ADD CONSTRAINT grille_tarifaire_parcours_id_annee_academique_id_annee_nive_key UNIQUE (parcours_id, annee_academique_id, annee_niveau);


--
-- TOC entry 5869 (class 2606 OID 57363)
-- Name: grille_tarifaire grille_tarifaire_pkey; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.grille_tarifaire
    ADD CONSTRAINT grille_tarifaire_pkey PRIMARY KEY (id);


--
-- TOC entry 6123 (class 2606 OID 84905)
-- Name: heure_complementaire heure_complementaire_pkey; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.heure_complementaire
    ADD CONSTRAINT heure_complementaire_pkey PRIMARY KEY (id);


--
-- TOC entry 5848 (class 2606 OID 57152)
-- Name: incident_disciplinaire incident_disciplinaire_pkey; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.incident_disciplinaire
    ADD CONSTRAINT incident_disciplinaire_pkey PRIMARY KEY (id);


--
-- TOC entry 5814 (class 2606 OID 56922)
-- Name: inscription inscription_etudiant_id_parcours_id_annee_academique_id_key; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.inscription
    ADD CONSTRAINT inscription_etudiant_id_parcours_id_annee_academique_id_key UNIQUE (etudiant_id, parcours_id, annee_academique_id);


--
-- TOC entry 5816 (class 2606 OID 56920)
-- Name: inscription inscription_numero_carte_key; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.inscription
    ADD CONSTRAINT inscription_numero_carte_key UNIQUE (numero_carte);


--
-- TOC entry 5818 (class 2606 OID 56918)
-- Name: inscription inscription_pkey; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.inscription
    ADD CONSTRAINT inscription_pkey PRIMARY KEY (id);


--
-- TOC entry 6102 (class 2606 OID 84017)
-- Name: message_destinataire message_destinataire_pkey; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.message_destinataire
    ADD CONSTRAINT message_destinataire_pkey PRIMARY KEY (id);


--
-- TOC entry 6097 (class 2606 OID 83987)
-- Name: message_enseignant message_enseignant_pkey; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.message_enseignant
    ADD CONSTRAINT message_enseignant_pkey PRIMARY KEY (id);


--
-- TOC entry 5919 (class 2606 OID 57825)
-- Name: message message_pkey; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.message
    ADD CONSTRAINT message_pkey PRIMARY KEY (id);


--
-- TOC entry 5907 (class 2606 OID 57699)
-- Name: mouvement_stock mouvement_stock_pkey; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.mouvement_stock
    ADD CONSTRAINT mouvement_stock_pkey PRIMARY KEY (id);


--
-- TOC entry 6081 (class 2606 OID 83917)
-- Name: niveau_etude niveau_etude_code_key; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.niveau_etude
    ADD CONSTRAINT niveau_etude_code_key UNIQUE (code);


--
-- TOC entry 6083 (class 2606 OID 83915)
-- Name: niveau_etude niveau_etude_pkey; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.niveau_etude
    ADD CONSTRAINT niveau_etude_pkey PRIMARY KEY (id);


--
-- TOC entry 5956 (class 2606 OID 58229)
-- Name: note_derogatoire note_derogatoire_pkey; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.note_derogatoire
    ADD CONSTRAINT note_derogatoire_pkey PRIMARY KEY (id);


--
-- TOC entry 5857 (class 2606 OID 57213)
-- Name: note note_etudiant_id_ec_id_session_id_key; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.note
    ADD CONSTRAINT note_etudiant_id_ec_id_session_id_key UNIQUE (etudiant_id, ec_id, session_id);


--
-- TOC entry 5859 (class 2606 OID 57211)
-- Name: note note_pkey; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.note
    ADD CONSTRAINT note_pkey PRIMARY KEY (id);


--
-- TOC entry 5917 (class 2606 OID 57806)
-- Name: notification notification_pkey; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.notification
    ADD CONSTRAINT notification_pkey PRIMARY KEY (id);


--
-- TOC entry 6090 (class 2606 OID 83940)
-- Name: paiement_inscription paiement_inscription_pkey; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.paiement_inscription
    ADD CONSTRAINT paiement_inscription_pkey PRIMARY KEY (id);


--
-- TOC entry 5879 (class 2606 OID 57420)
-- Name: paiement paiement_numero_recu_key; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.paiement
    ADD CONSTRAINT paiement_numero_recu_key UNIQUE (numero_recu);


--
-- TOC entry 5881 (class 2606 OID 57416)
-- Name: paiement paiement_pkey; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.paiement
    ADD CONSTRAINT paiement_pkey PRIMARY KEY (id);


--
-- TOC entry 5883 (class 2606 OID 57418)
-- Name: paiement paiement_reference_key; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.paiement
    ADD CONSTRAINT paiement_reference_key UNIQUE (reference);


--
-- TOC entry 5789 (class 2606 OID 56779)
-- Name: parcours parcours_code_key; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.parcours
    ADD CONSTRAINT parcours_code_key UNIQUE (code);


--
-- TOC entry 5791 (class 2606 OID 56777)
-- Name: parcours parcours_pkey; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.parcours
    ADD CONSTRAINT parcours_pkey PRIMARY KEY (id);


--
-- TOC entry 5921 (class 2606 OID 57959)
-- Name: permissions_portail permissions_portail_pkey; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.permissions_portail
    ADD CONSTRAINT permissions_portail_pkey PRIMARY KEY (id);


--
-- TOC entry 5923 (class 2606 OID 57961)
-- Name: permissions_portail permissions_portail_type_portail_permission_key_key; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.permissions_portail
    ADD CONSTRAINT permissions_portail_type_portail_permission_key_key UNIQUE (type_portail, permission_key);


--
-- TOC entry 5909 (class 2606 OID 57721)
-- Name: planning_entretien planning_entretien_pkey; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.planning_entretien
    ADD CONSTRAINT planning_entretien_pkey PRIMARY KEY (id);


--
-- TOC entry 5982 (class 2606 OID 58503)
-- Name: pointage_qr pointage_qr_code_qr_key; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.pointage_qr
    ADD CONSTRAINT pointage_qr_code_qr_key UNIQUE (code_qr);


--
-- TOC entry 5984 (class 2606 OID 58501)
-- Name: pointage_qr pointage_qr_pkey; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.pointage_qr
    ADD CONSTRAINT pointage_qr_pkey PRIMARY KEY (id);


--
-- TOC entry 5844 (class 2606 OID 57112)
-- Name: presence presence_etudiant_id_seance_id_key; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.presence
    ADD CONSTRAINT presence_etudiant_id_seance_id_key UNIQUE (etudiant_id, seance_id);


--
-- TOC entry 5846 (class 2606 OID 57110)
-- Name: presence presence_pkey; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.presence
    ADD CONSTRAINT presence_pkey PRIMARY KEY (id);


--
-- TOC entry 5989 (class 2606 OID 58521)
-- Name: presence_surveillance presence_surveillance_pkey; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.presence_surveillance
    ADD CONSTRAINT presence_surveillance_pkey PRIMARY KEY (id);


--
-- TOC entry 5941 (class 2606 OID 58089)
-- Name: proces_verbal proces_verbal_numero_key; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.proces_verbal
    ADD CONSTRAINT proces_verbal_numero_key UNIQUE (numero);


--
-- TOC entry 5943 (class 2606 OID 58087)
-- Name: proces_verbal proces_verbal_pkey; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.proces_verbal
    ADD CONSTRAINT proces_verbal_pkey PRIMARY KEY (id);


--
-- TOC entry 5861 (class 2606 OID 57263)
-- Name: pv_deliberation pv_deliberation_pkey; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.pv_deliberation
    ADD CONSTRAINT pv_deliberation_pkey PRIMARY KEY (id);


--
-- TOC entry 5911 (class 2606 OID 57751)
-- Name: rapport_entretien rapport_entretien_pkey; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.rapport_entretien
    ADD CONSTRAINT rapport_entretien_pkey PRIMARY KEY (id);


--
-- TOC entry 5952 (class 2606 OID 58187)
-- Name: rattrapage rattrapage_pkey; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.rattrapage
    ADD CONSTRAINT rattrapage_pkey PRIMARY KEY (id);


--
-- TOC entry 6136 (class 2606 OID 84963)
-- Name: recrutement recrutement_pkey; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.recrutement
    ADD CONSTRAINT recrutement_pkey PRIMARY KEY (id);


--
-- TOC entry 5928 (class 2606 OID 58002)
-- Name: referentiel_competences referentiel_competences_pkey; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.referentiel_competences
    ADD CONSTRAINT referentiel_competences_pkey PRIMARY KEY (id);


--
-- TOC entry 5900 (class 2606 OID 57650)
-- Name: reservation_salle reservation_salle_pkey; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.reservation_salle
    ADD CONSTRAINT reservation_salle_pkey PRIMARY KEY (id);


--
-- TOC entry 5863 (class 2606 OID 57293)
-- Name: resultat_deliberation resultat_deliberation_pkey; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.resultat_deliberation
    ADD CONSTRAINT resultat_deliberation_pkey PRIMARY KEY (id);


--
-- TOC entry 5865 (class 2606 OID 57295)
-- Name: resultat_deliberation resultat_deliberation_pv_id_etudiant_id_key; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.resultat_deliberation
    ADD CONSTRAINT resultat_deliberation_pv_id_etudiant_id_key UNIQUE (pv_id, etudiant_id);


--
-- TOC entry 6010 (class 2606 OID 62027)
-- Name: resultat_semestre resultat_semestre_etudiant_id_inscription_id_semestre_annee_key; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.resultat_semestre
    ADD CONSTRAINT resultat_semestre_etudiant_id_inscription_id_semestre_annee_key UNIQUE (etudiant_id, inscription_id, semestre, annee_niveau);


--
-- TOC entry 6012 (class 2606 OID 62025)
-- Name: resultat_semestre resultat_semestre_pkey; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.resultat_semestre
    ADD CONSTRAINT resultat_semestre_pkey PRIMARY KEY (id);


--
-- TOC entry 6017 (class 2606 OID 62060)
-- Name: resultat_ue resultat_ue_etudiant_id_ue_id_resultat_semestre_id_key; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.resultat_ue
    ADD CONSTRAINT resultat_ue_etudiant_id_ue_id_resultat_semestre_id_key UNIQUE (etudiant_id, ue_id, resultat_semestre_id);


--
-- TOC entry 6019 (class 2606 OID 62058)
-- Name: resultat_ue resultat_ue_pkey; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.resultat_ue
    ADD CONSTRAINT resultat_ue_pkey PRIMARY KEY (id);


--
-- TOC entry 5832 (class 2606 OID 57049)
-- Name: salle salle_code_key; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.salle
    ADD CONSTRAINT salle_code_key UNIQUE (code);


--
-- TOC entry 5834 (class 2606 OID 57047)
-- Name: salle salle_pkey; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.salle
    ADD CONSTRAINT salle_pkey PRIMARY KEY (id);


--
-- TOC entry 5978 (class 2606 OID 58397)
-- Name: secretaire_parcours secretaire_parcours_pkey; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.secretaire_parcours
    ADD CONSTRAINT secretaire_parcours_pkey PRIMARY KEY (id);


--
-- TOC entry 5850 (class 2606 OID 57183)
-- Name: session_examen session_examen_pkey; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.session_examen
    ADD CONSTRAINT session_examen_pkey PRIMARY KEY (id);


--
-- TOC entry 5776 (class 2606 OID 56717)
-- Name: session_jwt session_jwt_pkey; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.session_jwt
    ADD CONSTRAINT session_jwt_pkey PRIMARY KEY (id);


--
-- TOC entry 5778 (class 2606 OID 56719)
-- Name: session_jwt session_jwt_refresh_token_key; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.session_jwt
    ADD CONSTRAINT session_jwt_refresh_token_key UNIQUE (refresh_token);


--
-- TOC entry 6065 (class 2606 OID 83586)
-- Name: soutenance soutenance_pkey; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.soutenance
    ADD CONSTRAINT soutenance_pkey PRIMARY KEY (id);


--
-- TOC entry 6067 (class 2606 OID 83588)
-- Name: soutenance soutenance_stage_id_key; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.soutenance
    ADD CONSTRAINT soutenance_stage_id_key UNIQUE (stage_id);


--
-- TOC entry 6056 (class 2606 OID 83512)
-- Name: stage stage_pkey; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.stage
    ADD CONSTRAINT stage_pkey PRIMARY KEY (id);


--
-- TOC entry 5903 (class 2606 OID 57685)
-- Name: stock stock_pkey; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.stock
    ADD CONSTRAINT stock_pkey PRIMARY KEY (id);


--
-- TOC entry 5905 (class 2606 OID 57687)
-- Name: stock stock_reference_key; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.stock
    ADD CONSTRAINT stock_reference_key UNIQUE (reference);


--
-- TOC entry 5934 (class 2606 OID 58032)
-- Name: sujet_examen sujet_examen_pkey; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.sujet_examen
    ADD CONSTRAINT sujet_examen_pkey PRIMARY KEY (id);


--
-- TOC entry 6029 (class 2606 OID 62138)
-- Name: suplement_diplome suplement_diplome_pkey; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.suplement_diplome
    ADD CONSTRAINT suplement_diplome_pkey PRIMARY KEY (id);


--
-- TOC entry 6050 (class 2606 OID 83477)
-- Name: support_cours support_cours_pkey; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.support_cours
    ADD CONSTRAINT support_cours_pkey PRIMARY KEY (id);


--
-- TOC entry 5898 (class 2606 OID 57611)
-- Name: ticket_maintenance ticket_maintenance_pkey; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.ticket_maintenance
    ADD CONSTRAINT ticket_maintenance_pkey PRIMARY KEY (id);


--
-- TOC entry 6033 (class 2606 OID 62167)
-- Name: transfert_etudiant transfert_etudiant_pkey; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.transfert_etudiant
    ADD CONSTRAINT transfert_etudiant_pkey PRIMARY KEY (id);


--
-- TOC entry 6104 (class 2606 OID 84019)
-- Name: message_destinataire unique_message_etudiant; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.message_destinataire
    ADD CONSTRAINT unique_message_etudiant UNIQUE (message_id, etudiant_id);


--
-- TOC entry 6092 (class 2606 OID 83942)
-- Name: paiement_inscription unique_reference_paiement; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.paiement_inscription
    ADD CONSTRAINT unique_reference_paiement UNIQUE (reference_paiement);


--
-- TOC entry 5794 (class 2606 OID 56816)
-- Name: unite_enseignement unite_enseignement_parcours_id_code_key; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.unite_enseignement
    ADD CONSTRAINT unite_enseignement_parcours_id_code_key UNIQUE (parcours_id, code);


--
-- TOC entry 5796 (class 2606 OID 56814)
-- Name: unite_enseignement unite_enseignement_pkey; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.unite_enseignement
    ADD CONSTRAINT unite_enseignement_pkey PRIMARY KEY (id);


--
-- TOC entry 5770 (class 2606 OID 56703)
-- Name: utilisateur utilisateur_email_key; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.utilisateur
    ADD CONSTRAINT utilisateur_email_key UNIQUE (email);


--
-- TOC entry 5772 (class 2606 OID 56701)
-- Name: utilisateur utilisateur_pkey; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.utilisateur
    ADD CONSTRAINT utilisateur_pkey PRIMARY KEY (id);


--
-- TOC entry 6043 (class 2606 OID 62235)
-- Name: verrouillage_notes verrouillage_notes_deliberation_id_etudiant_id_session_exam_key; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.verrouillage_notes
    ADD CONSTRAINT verrouillage_notes_deliberation_id_etudiant_id_session_exam_key UNIQUE (deliberation_id, etudiant_id, session_examen_id);


--
-- TOC entry 6045 (class 2606 OID 62233)
-- Name: verrouillage_notes verrouillage_notes_pkey; Type: CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.verrouillage_notes
    ADD CONSTRAINT verrouillage_notes_pkey PRIMARY KEY (id);


--
-- TOC entry 5946 (class 1259 OID 58169)
-- Name: idx_absence_date; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_absence_date ON tenant_ispm.absence_enseignant USING btree (date_absence);


--
-- TOC entry 5947 (class 1259 OID 58168)
-- Name: idx_absence_enseignant; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_absence_enseignant ON tenant_ispm.absence_enseignant USING btree (enseignant_id);


--
-- TOC entry 5948 (class 1259 OID 58170)
-- Name: idx_absence_statut; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_absence_statut ON tenant_ispm.absence_enseignant USING btree (statut);


--
-- TOC entry 5992 (class 1259 OID 58562)
-- Name: idx_alerte_discipline_etudiant; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_alerte_discipline_etudiant ON tenant_ispm.alerte_discipline USING btree (etudiant_id);


--
-- TOC entry 5993 (class 1259 OID 58563)
-- Name: idx_alerte_discipline_statut; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_alerte_discipline_statut ON tenant_ispm.alerte_discipline USING btree (statut);


--
-- TOC entry 5914 (class 1259 OID 57865)
-- Name: idx_annonce_publie; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_annonce_publie ON tenant_ispm.annonce USING btree (publie, date_publication);


--
-- TOC entry 6036 (class 1259 OID 62279)
-- Name: idx_archive_annee; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_archive_annee ON tenant_ispm.archive_scolarite USING btree (annee_academique);


--
-- TOC entry 6037 (class 1259 OID 62277)
-- Name: idx_archive_etudiant; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_archive_etudiant ON tenant_ispm.archive_scolarite USING btree (etudiant_id);


--
-- TOC entry 6038 (class 1259 OID 62278)
-- Name: idx_archive_type; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_archive_type ON tenant_ispm.archive_scolarite USING btree (type_document);


--
-- TOC entry 6144 (class 1259 OID 85176)
-- Name: idx_attestation_etudiant; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_attestation_etudiant ON tenant_ispm.attestation USING btree (etudiant_id);


--
-- TOC entry 6145 (class 1259 OID 85177)
-- Name: idx_attestation_statut; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_attestation_statut ON tenant_ispm.attestation USING btree (statut);


--
-- TOC entry 6139 (class 1259 OID 85001)
-- Name: idx_candidature_email; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_candidature_email ON tenant_ispm.candidature USING btree (email);


--
-- TOC entry 6140 (class 1259 OID 84999)
-- Name: idx_candidature_recrutement; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_candidature_recrutement ON tenant_ispm.candidature USING btree (recrutement_id);


--
-- TOC entry 6141 (class 1259 OID 85000)
-- Name: idx_candidature_statut; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_candidature_statut ON tenant_ispm.candidature USING btree (statut);


--
-- TOC entry 5996 (class 1259 OID 58565)
-- Name: idx_configuration_examen_salle; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_configuration_examen_salle ON tenant_ispm.configuration_examen USING btree (salle_id);


--
-- TOC entry 5997 (class 1259 OID 58564)
-- Name: idx_configuration_examen_session; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_configuration_examen_session ON tenant_ispm.configuration_examen USING btree (session_examen_id);


--
-- TOC entry 6107 (class 1259 OID 84451)
-- Name: idx_convention_date_proposee; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_convention_date_proposee ON tenant_ispm.convention USING btree (date_proposee);


--
-- TOC entry 6108 (class 1259 OID 84449)
-- Name: idx_convention_statut; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_convention_statut ON tenant_ispm.convention USING btree (statut);


--
-- TOC entry 6109 (class 1259 OID 84450)
-- Name: idx_convention_type_partenaire; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_convention_type_partenaire ON tenant_ispm.convention USING btree (type_partenaire);


--
-- TOC entry 5963 (class 1259 OID 58341)
-- Name: idx_convocation_date; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_convocation_date ON tenant_ispm.convocation USING btree (date_convocation);


--
-- TOC entry 5964 (class 1259 OID 58338)
-- Name: idx_convocation_etudiant; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_convocation_etudiant ON tenant_ispm.convocation USING btree (etudiant_id);


--
-- TOC entry 5965 (class 1259 OID 58342)
-- Name: idx_convocation_genere; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_convocation_genere ON tenant_ispm.convocation USING btree (genere_par);


--
-- TOC entry 5966 (class 1259 OID 58339)
-- Name: idx_convocation_session; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_convocation_session ON tenant_ispm.convocation USING btree (session_examen_id);


--
-- TOC entry 5967 (class 1259 OID 58340)
-- Name: idx_convocation_statut; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_convocation_statut ON tenant_ispm.convocation USING btree (statut);


--
-- TOC entry 6129 (class 1259 OID 84942)
-- Name: idx_decl_sociale_periode; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_decl_sociale_periode ON tenant_ispm.declaration_sociale USING btree (periode_debut, periode_fin);


--
-- TOC entry 6130 (class 1259 OID 84943)
-- Name: idx_decl_sociale_statut; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_decl_sociale_statut ON tenant_ispm.declaration_sociale USING btree (statut);


--
-- TOC entry 6131 (class 1259 OID 84941)
-- Name: idx_decl_sociale_type; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_decl_sociale_type ON tenant_ispm.declaration_sociale USING btree (type_declaration);


--
-- TOC entry 6112 (class 1259 OID 84471)
-- Name: idx_delegation_dates; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_delegation_dates ON tenant_ispm.delegation_signature USING btree (date_debut, date_fin);


--
-- TOC entry 6113 (class 1259 OID 84470)
-- Name: idx_delegation_delegataire; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_delegation_delegataire ON tenant_ispm.delegation_signature USING btree (delegataire_id);


--
-- TOC entry 6114 (class 1259 OID 84472)
-- Name: idx_delegation_revoquee; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_delegation_revoquee ON tenant_ispm.delegation_signature USING btree (revoquee);


--
-- TOC entry 6002 (class 1259 OID 62273)
-- Name: idx_deliberation_parcours; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_deliberation_parcours ON tenant_ispm.deliberation USING btree (parcours_id);


--
-- TOC entry 6003 (class 1259 OID 62272)
-- Name: idx_deliberation_session; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_deliberation_session ON tenant_ispm.deliberation USING btree (session_examen_id);


--
-- TOC entry 6004 (class 1259 OID 62274)
-- Name: idx_deliberation_statut; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_deliberation_statut ON tenant_ispm.deliberation USING btree (statut);


--
-- TOC entry 5959 (class 1259 OID 58294)
-- Name: idx_demande_etudiant; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_demande_etudiant ON tenant_ispm.demande_etudiant USING btree (etudiant_id);


--
-- TOC entry 6076 (class 1259 OID 83665)
-- Name: idx_demande_ressource_date; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_demande_ressource_date ON tenant_ispm.demande_ressource USING btree (date_souhaitee);


--
-- TOC entry 6077 (class 1259 OID 83663)
-- Name: idx_demande_ressource_demandeur; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_demande_ressource_demandeur ON tenant_ispm.demande_ressource USING btree (demandeur_id);


--
-- TOC entry 6078 (class 1259 OID 83664)
-- Name: idx_demande_ressource_statut; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_demande_ressource_statut ON tenant_ispm.demande_ressource USING btree (statut);


--
-- TOC entry 5960 (class 1259 OID 58295)
-- Name: idx_demande_statut; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_demande_statut ON tenant_ispm.demande_etudiant USING btree (statut);


--
-- TOC entry 6098 (class 1259 OID 84034)
-- Name: idx_destinataire_etudiant; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_destinataire_etudiant ON tenant_ispm.message_destinataire USING btree (etudiant_id);


--
-- TOC entry 6099 (class 1259 OID 84035)
-- Name: idx_destinataire_lu; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_destinataire_lu ON tenant_ispm.message_destinataire USING btree (lu);


--
-- TOC entry 6100 (class 1259 OID 84033)
-- Name: idx_destinataire_message; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_destinataire_message ON tenant_ispm.message_destinataire USING btree (message_id);


--
-- TOC entry 6024 (class 1259 OID 62268)
-- Name: idx_diplome_etudiant; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_diplome_etudiant ON tenant_ispm.diplome USING btree (etudiant_id);


--
-- TOC entry 6025 (class 1259 OID 62271)
-- Name: idx_diplome_numero; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_diplome_numero ON tenant_ispm.diplome USING btree (numero_diplome);


--
-- TOC entry 6026 (class 1259 OID 62269)
-- Name: idx_diplome_parcours; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_diplome_parcours ON tenant_ispm.diplome USING btree (parcours_id);


--
-- TOC entry 6027 (class 1259 OID 62270)
-- Name: idx_diplome_statut; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_diplome_statut ON tenant_ispm.diplome USING btree (statut);


--
-- TOC entry 5970 (class 1259 OID 58381)
-- Name: idx_dossier_archive; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_dossier_archive ON tenant_ispm.dossier_etudiant USING btree (est_archive);


--
-- TOC entry 5971 (class 1259 OID 58378)
-- Name: idx_dossier_etudiant_id; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_dossier_etudiant_id ON tenant_ispm.dossier_etudiant USING btree (etudiant_id);


--
-- TOC entry 5972 (class 1259 OID 58380)
-- Name: idx_dossier_statut; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_dossier_statut ON tenant_ispm.dossier_etudiant USING btree (statut);


--
-- TOC entry 5973 (class 1259 OID 58379)
-- Name: idx_dossier_type; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_dossier_type ON tenant_ispm.dossier_etudiant USING btree (type_document);


--
-- TOC entry 5874 (class 1259 OID 57863)
-- Name: idx_echeancier_statut; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_echeancier_statut ON tenant_ispm.echeancier USING btree (statut);


--
-- TOC entry 5837 (class 1259 OID 57859)
-- Name: idx_edt_affectation; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_edt_affectation ON tenant_ispm.emploi_du_temps USING btree (affectation_id);


--
-- TOC entry 5838 (class 1259 OID 57857)
-- Name: idx_edt_date; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_edt_date ON tenant_ispm.emploi_du_temps USING btree (date_seance);


--
-- TOC entry 5839 (class 1259 OID 57858)
-- Name: idx_edt_salle; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_edt_salle ON tenant_ispm.emploi_du_temps USING btree (salle_id);


--
-- TOC entry 5809 (class 1259 OID 57845)
-- Name: idx_etudiant_matricule; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_etudiant_matricule ON tenant_ispm.etudiant USING btree (matricule);


--
-- TOC entry 5810 (class 1259 OID 57846)
-- Name: idx_etudiant_nom; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_etudiant_nom ON tenant_ispm.etudiant USING btree (nom, prenom);


--
-- TOC entry 6117 (class 1259 OID 84615)
-- Name: idx_eval_annee; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_eval_annee ON tenant_ispm.evaluation_personnel USING btree (annee_evaluation);


--
-- TOC entry 6118 (class 1259 OID 84616)
-- Name: idx_eval_date; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_eval_date ON tenant_ispm.evaluation_personnel USING btree (date_evaluation);


--
-- TOC entry 6119 (class 1259 OID 84613)
-- Name: idx_eval_evaluateur; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_eval_evaluateur ON tenant_ispm.evaluation_personnel USING btree (evaluateur_id);


--
-- TOC entry 6120 (class 1259 OID 84614)
-- Name: idx_eval_statut; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_eval_statut ON tenant_ispm.evaluation_personnel USING btree (statut);


--
-- TOC entry 6121 (class 1259 OID 84612)
-- Name: idx_eval_utilisateur; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_eval_utilisateur ON tenant_ispm.evaluation_personnel USING btree (utilisateur_id);


--
-- TOC entry 6072 (class 1259 OID 83634)
-- Name: idx_evaluation_evaluateur; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_evaluation_evaluateur ON tenant_ispm.evaluation_soutenance USING btree (evaluateur_id);


--
-- TOC entry 6073 (class 1259 OID 83633)
-- Name: idx_evaluation_soutenance; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_evaluation_soutenance ON tenant_ispm.evaluation_soutenance USING btree (soutenance_id);


--
-- TOC entry 6059 (class 1259 OID 83568)
-- Name: idx_fiche_suivi_date; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_fiche_suivi_date ON tenant_ispm.fiche_suivi_stage USING btree (date_rencontre);


--
-- TOC entry 6060 (class 1259 OID 83567)
-- Name: idx_fiche_suivi_stage; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_fiche_suivi_stage ON tenant_ispm.fiche_suivi_stage USING btree (stage_id);


--
-- TOC entry 6124 (class 1259 OID 84917)
-- Name: idx_heure_comp_date; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_heure_comp_date ON tenant_ispm.heure_complementaire USING btree (date_travail);


--
-- TOC entry 6125 (class 1259 OID 84916)
-- Name: idx_heure_comp_enseignant; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_heure_comp_enseignant ON tenant_ispm.heure_complementaire USING btree (enseignant_id);


--
-- TOC entry 6126 (class 1259 OID 84918)
-- Name: idx_heure_comp_statut; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_heure_comp_statut ON tenant_ispm.heure_complementaire USING btree (statut);


--
-- TOC entry 5811 (class 1259 OID 57847)
-- Name: idx_inscription_etudiant; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_inscription_etudiant ON tenant_ispm.inscription USING btree (etudiant_id);


--
-- TOC entry 5812 (class 1259 OID 57848)
-- Name: idx_inscription_parcours_annee; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_inscription_parcours_annee ON tenant_ispm.inscription USING btree (parcours_id, annee_academique_id);


--
-- TOC entry 6093 (class 1259 OID 84032)
-- Name: idx_message_date; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_message_date ON tenant_ispm.message_enseignant USING btree (date_envoi);


--
-- TOC entry 6094 (class 1259 OID 84030)
-- Name: idx_message_enseignant_id; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_message_enseignant_id ON tenant_ispm.message_enseignant USING btree (enseignant_id);


--
-- TOC entry 6095 (class 1259 OID 84031)
-- Name: idx_message_type; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_message_type ON tenant_ispm.message_enseignant USING btree (type_message);


--
-- TOC entry 6079 (class 1259 OID 83918)
-- Name: idx_niveau_etude_code; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_niveau_etude_code ON tenant_ispm.niveau_etude USING btree (code);


--
-- TOC entry 5953 (class 1259 OID 58265)
-- Name: idx_note_derog_etudiant; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_note_derog_etudiant ON tenant_ispm.note_derogatoire USING btree (etudiant_id);


--
-- TOC entry 5954 (class 1259 OID 58266)
-- Name: idx_note_derog_statut; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_note_derog_statut ON tenant_ispm.note_derogatoire USING btree (statut);


--
-- TOC entry 5851 (class 1259 OID 57852)
-- Name: idx_note_ec; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_note_ec ON tenant_ispm.note USING btree (ec_id);


--
-- TOC entry 5852 (class 1259 OID 57849)
-- Name: idx_note_etudiant; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_note_etudiant ON tenant_ispm.note USING btree (etudiant_id);


--
-- TOC entry 5853 (class 1259 OID 57850)
-- Name: idx_note_session; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_note_session ON tenant_ispm.note USING btree (session_id);


--
-- TOC entry 5854 (class 1259 OID 57851)
-- Name: idx_note_ue; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_note_ue ON tenant_ispm.note USING btree (ue_id);


--
-- TOC entry 5855 (class 1259 OID 57853)
-- Name: idx_note_verrouille; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_note_verrouille ON tenant_ispm.note USING btree (verrouille);


--
-- TOC entry 5915 (class 1259 OID 57864)
-- Name: idx_notification_user; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_notification_user ON tenant_ispm.notification USING btree (utilisateur_id, lue);


--
-- TOC entry 5875 (class 1259 OID 57861)
-- Name: idx_paiement_date; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_paiement_date ON tenant_ispm.paiement USING btree (date_paiement);


--
-- TOC entry 5876 (class 1259 OID 57860)
-- Name: idx_paiement_inscription; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_paiement_inscription ON tenant_ispm.paiement USING btree (inscription_id);


--
-- TOC entry 6084 (class 1259 OID 83961)
-- Name: idx_paiement_inscription_date; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_paiement_inscription_date ON tenant_ispm.paiement_inscription USING btree (date_paiement);


--
-- TOC entry 6085 (class 1259 OID 83959)
-- Name: idx_paiement_inscription_etudiant; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_paiement_inscription_etudiant ON tenant_ispm.paiement_inscription USING btree (etudiant_id);


--
-- TOC entry 6086 (class 1259 OID 83958)
-- Name: idx_paiement_inscription_inscription; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_paiement_inscription_inscription ON tenant_ispm.paiement_inscription USING btree (inscription_id);


--
-- TOC entry 6087 (class 1259 OID 83962)
-- Name: idx_paiement_inscription_reference; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_paiement_inscription_reference ON tenant_ispm.paiement_inscription USING btree (reference_paiement);


--
-- TOC entry 6088 (class 1259 OID 83960)
-- Name: idx_paiement_inscription_statut; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_paiement_inscription_statut ON tenant_ispm.paiement_inscription USING btree (statut);


--
-- TOC entry 5877 (class 1259 OID 57862)
-- Name: idx_paiement_statut; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_paiement_statut ON tenant_ispm.paiement USING btree (statut);


--
-- TOC entry 5787 (class 1259 OID 58130)
-- Name: idx_parcours_secretaire; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_parcours_secretaire ON tenant_ispm.parcours USING btree (secretaire_id);


--
-- TOC entry 5979 (class 1259 OID 58558)
-- Name: idx_pointage_qr_etudiant; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_pointage_qr_etudiant ON tenant_ispm.pointage_qr USING btree (etudiant_id);


--
-- TOC entry 5980 (class 1259 OID 58557)
-- Name: idx_pointage_qr_seance; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_pointage_qr_seance ON tenant_ispm.pointage_qr USING btree (seance_id);


--
-- TOC entry 5840 (class 1259 OID 57854)
-- Name: idx_presence_etudiant; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_presence_etudiant ON tenant_ispm.presence USING btree (etudiant_id);


--
-- TOC entry 5841 (class 1259 OID 57855)
-- Name: idx_presence_seance; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_presence_seance ON tenant_ispm.presence USING btree (seance_id);


--
-- TOC entry 5842 (class 1259 OID 57856)
-- Name: idx_presence_statut; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_presence_statut ON tenant_ispm.presence USING btree (statut);


--
-- TOC entry 5985 (class 1259 OID 58561)
-- Name: idx_presence_surveillance_date; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_presence_surveillance_date ON tenant_ispm.presence_surveillance USING btree (date_pointage);


--
-- TOC entry 5986 (class 1259 OID 58559)
-- Name: idx_presence_surveillance_etudiant; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_presence_surveillance_etudiant ON tenant_ispm.presence_surveillance USING btree (etudiant_id);


--
-- TOC entry 5987 (class 1259 OID 58560)
-- Name: idx_presence_surveillance_seance; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_presence_surveillance_seance ON tenant_ispm.presence_surveillance USING btree (seance_id);


--
-- TOC entry 5935 (class 1259 OID 58119)
-- Name: idx_pv_annee; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_pv_annee ON tenant_ispm.proces_verbal USING btree (annee_academique_id);


--
-- TOC entry 5936 (class 1259 OID 58121)
-- Name: idx_pv_date; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_pv_date ON tenant_ispm.proces_verbal USING btree (date_deliberation);


--
-- TOC entry 5937 (class 1259 OID 58117)
-- Name: idx_pv_parcours; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_pv_parcours ON tenant_ispm.proces_verbal USING btree (parcours_id);


--
-- TOC entry 5938 (class 1259 OID 58118)
-- Name: idx_pv_session; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_pv_session ON tenant_ispm.proces_verbal USING btree (session_examen_id);


--
-- TOC entry 5939 (class 1259 OID 58120)
-- Name: idx_pv_statut; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_pv_statut ON tenant_ispm.proces_verbal USING btree (statut);


--
-- TOC entry 5949 (class 1259 OID 58208)
-- Name: idx_rattrapage_absence; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_rattrapage_absence ON tenant_ispm.rattrapage USING btree (absence_id);


--
-- TOC entry 5950 (class 1259 OID 58209)
-- Name: idx_rattrapage_date; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_rattrapage_date ON tenant_ispm.rattrapage USING btree (date_rattrapage);


--
-- TOC entry 6132 (class 1259 OID 84976)
-- Name: idx_recrutement_date_cloture; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_recrutement_date_cloture ON tenant_ispm.recrutement USING btree (date_cloture);


--
-- TOC entry 6133 (class 1259 OID 84975)
-- Name: idx_recrutement_departement; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_recrutement_departement ON tenant_ispm.recrutement USING btree (departement_id);


--
-- TOC entry 6134 (class 1259 OID 84974)
-- Name: idx_recrutement_statut; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_recrutement_statut ON tenant_ispm.recrutement USING btree (statut);


--
-- TOC entry 5924 (class 1259 OID 58112)
-- Name: idx_referentiel_created; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_referentiel_created ON tenant_ispm.referentiel_competences USING btree (created_at);


--
-- TOC entry 5925 (class 1259 OID 58110)
-- Name: idx_referentiel_parcours; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_referentiel_parcours ON tenant_ispm.referentiel_competences USING btree (parcours_id);


--
-- TOC entry 5926 (class 1259 OID 58111)
-- Name: idx_referentiel_statut; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_referentiel_statut ON tenant_ispm.referentiel_competences USING btree (statut);


--
-- TOC entry 6005 (class 1259 OID 62264)
-- Name: idx_resultat_semestre_deliberation; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_resultat_semestre_deliberation ON tenant_ispm.resultat_semestre USING btree (deliberation_id);


--
-- TOC entry 6006 (class 1259 OID 62261)
-- Name: idx_resultat_semestre_etudiant; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_resultat_semestre_etudiant ON tenant_ispm.resultat_semestre USING btree (etudiant_id);


--
-- TOC entry 6007 (class 1259 OID 62262)
-- Name: idx_resultat_semestre_inscription; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_resultat_semestre_inscription ON tenant_ispm.resultat_semestre USING btree (inscription_id);


--
-- TOC entry 6008 (class 1259 OID 62263)
-- Name: idx_resultat_semestre_statut; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_resultat_semestre_statut ON tenant_ispm.resultat_semestre USING btree (statut);


--
-- TOC entry 6013 (class 1259 OID 62265)
-- Name: idx_resultat_ue_etudiant; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_resultat_ue_etudiant ON tenant_ispm.resultat_ue USING btree (etudiant_id);


--
-- TOC entry 6014 (class 1259 OID 62267)
-- Name: idx_resultat_ue_statut; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_resultat_ue_statut ON tenant_ispm.resultat_ue USING btree (statut);


--
-- TOC entry 6015 (class 1259 OID 62266)
-- Name: idx_resultat_ue_ue; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_resultat_ue_ue ON tenant_ispm.resultat_ue USING btree (ue_id);


--
-- TOC entry 5974 (class 1259 OID 58399)
-- Name: idx_secretaire_parcours_parcours; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_secretaire_parcours_parcours ON tenant_ispm.secretaire_parcours USING btree (parcours_id) WHERE (actif = true);


--
-- TOC entry 5975 (class 1259 OID 58398)
-- Name: idx_secretaire_parcours_secretaire; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_secretaire_parcours_secretaire ON tenant_ispm.secretaire_parcours USING btree (secretaire_id) WHERE (actif = true);


--
-- TOC entry 5976 (class 1259 OID 58400)
-- Name: idx_secretaire_parcours_unique; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE UNIQUE INDEX idx_secretaire_parcours_unique ON tenant_ispm.secretaire_parcours USING btree (secretaire_id, parcours_id) WHERE (actif = true);


--
-- TOC entry 5773 (class 1259 OID 57843)
-- Name: idx_session_jwt_token; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_session_jwt_token ON tenant_ispm.session_jwt USING btree (refresh_token);


--
-- TOC entry 5774 (class 1259 OID 57844)
-- Name: idx_session_jwt_user; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_session_jwt_user ON tenant_ispm.session_jwt USING btree (utilisateur_id);


--
-- TOC entry 6061 (class 1259 OID 83605)
-- Name: idx_soutenance_date; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_soutenance_date ON tenant_ispm.soutenance USING btree (date_soutenance);


--
-- TOC entry 6062 (class 1259 OID 83604)
-- Name: idx_soutenance_stage; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_soutenance_stage ON tenant_ispm.soutenance USING btree (stage_id);


--
-- TOC entry 6063 (class 1259 OID 83606)
-- Name: idx_soutenance_statut; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_soutenance_statut ON tenant_ispm.soutenance USING btree (statut);


--
-- TOC entry 6051 (class 1259 OID 83539)
-- Name: idx_stage_encadrant; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_stage_encadrant ON tenant_ispm.stage USING btree (encadrant_id);


--
-- TOC entry 6052 (class 1259 OID 83538)
-- Name: idx_stage_etudiant; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_stage_etudiant ON tenant_ispm.stage USING btree (etudiant_id);


--
-- TOC entry 6053 (class 1259 OID 83540)
-- Name: idx_stage_rapporteur; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_stage_rapporteur ON tenant_ispm.stage USING btree (rapporteur_id);


--
-- TOC entry 6054 (class 1259 OID 83541)
-- Name: idx_stage_statut; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_stage_statut ON tenant_ispm.stage USING btree (statut);


--
-- TOC entry 5901 (class 1259 OID 57867)
-- Name: idx_stock_seuil; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_stock_seuil ON tenant_ispm.stock USING btree (quantite_stock, seuil_alerte);


--
-- TOC entry 5929 (class 1259 OID 58116)
-- Name: idx_sujet_date; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_sujet_date ON tenant_ispm.sujet_examen USING btree (date_soumission);


--
-- TOC entry 5930 (class 1259 OID 58114)
-- Name: idx_sujet_enseignant; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_sujet_enseignant ON tenant_ispm.sujet_examen USING btree (enseignant_id);


--
-- TOC entry 5931 (class 1259 OID 58113)
-- Name: idx_sujet_session; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_sujet_session ON tenant_ispm.sujet_examen USING btree (session_examen_id);


--
-- TOC entry 5932 (class 1259 OID 58115)
-- Name: idx_sujet_statut; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_sujet_statut ON tenant_ispm.sujet_examen USING btree (statut);


--
-- TOC entry 6046 (class 1259 OID 83489)
-- Name: idx_support_cours_auteur; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_support_cours_auteur ON tenant_ispm.support_cours USING btree (auteur_id);


--
-- TOC entry 6047 (class 1259 OID 83490)
-- Name: idx_support_cours_date; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_support_cours_date ON tenant_ispm.support_cours USING btree (date_depot);


--
-- TOC entry 6048 (class 1259 OID 83488)
-- Name: idx_support_cours_ec; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_support_cours_ec ON tenant_ispm.support_cours USING btree (ec_id);


--
-- TOC entry 5763 (class 1259 OID 83454)
-- Name: idx_tenant_ispm_utilisateur_actif; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_tenant_ispm_utilisateur_actif ON tenant_ispm.utilisateur USING btree (actif);


--
-- TOC entry 5764 (class 1259 OID 83452)
-- Name: idx_tenant_ispm_utilisateur_email; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_tenant_ispm_utilisateur_email ON tenant_ispm.utilisateur USING btree (email);


--
-- TOC entry 5765 (class 1259 OID 83453)
-- Name: idx_tenant_ispm_utilisateur_role; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_tenant_ispm_utilisateur_role ON tenant_ispm.utilisateur USING btree (role);


--
-- TOC entry 5766 (class 1259 OID 83455)
-- Name: idx_tenant_ispm_utilisateur_tenant_id; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_tenant_ispm_utilisateur_tenant_id ON tenant_ispm.utilisateur USING btree (tenant_id);


--
-- TOC entry 5896 (class 1259 OID 57866)
-- Name: idx_ticket_statut; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_ticket_statut ON tenant_ispm.ticket_maintenance USING btree (statut, priorite);


--
-- TOC entry 6030 (class 1259 OID 62276)
-- Name: idx_transfert_decision; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_transfert_decision ON tenant_ispm.transfert_etudiant USING btree (decision_equivalence);


--
-- TOC entry 6031 (class 1259 OID 62275)
-- Name: idx_transfert_etudiant; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_transfert_etudiant ON tenant_ispm.transfert_etudiant USING btree (etudiant_id);


--
-- TOC entry 5792 (class 1259 OID 83888)
-- Name: idx_ue_enseignant; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_ue_enseignant ON tenant_ispm.unite_enseignement USING btree (enseignant_id);


--
-- TOC entry 5767 (class 1259 OID 57841)
-- Name: idx_utilisateur_email; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_utilisateur_email ON tenant_ispm.utilisateur USING btree (email);


--
-- TOC entry 5768 (class 1259 OID 57842)
-- Name: idx_utilisateur_role; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_utilisateur_role ON tenant_ispm.utilisateur USING btree (role);


--
-- TOC entry 6039 (class 1259 OID 62280)
-- Name: idx_verrouillage_etudiant; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_verrouillage_etudiant ON tenant_ispm.verrouillage_notes USING btree (etudiant_id);


--
-- TOC entry 6040 (class 1259 OID 62281)
-- Name: idx_verrouillage_session; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_verrouillage_session ON tenant_ispm.verrouillage_notes USING btree (session_examen_id);


--
-- TOC entry 6041 (class 1259 OID 62282)
-- Name: idx_verrouillage_statut; Type: INDEX; Schema: tenant_ispm; Owner: postgres
--

CREATE INDEX idx_verrouillage_statut ON tenant_ispm.verrouillage_notes USING btree (statut);


--
-- TOC entry 6330 (class 2620 OID 62291)
-- Name: note prevent_locked_note_modification; Type: TRIGGER; Schema: tenant_ispm; Owner: postgres
--

CREATE TRIGGER prevent_locked_note_modification BEFORE DELETE OR UPDATE ON tenant_ispm.note FOR EACH ROW EXECUTE FUNCTION tenant_ispm.check_note_verrouillee();


--
-- TOC entry 6340 (class 2620 OID 57886)
-- Name: stock trg_alerte_stock; Type: TRIGGER; Schema: tenant_ispm; Owner: postgres
--

CREATE TRIGGER trg_alerte_stock AFTER INSERT OR UPDATE ON tenant_ispm.stock FOR EACH ROW EXECUTE FUNCTION tenant_ispm.trigger_alerte_stock();


--
-- TOC entry 6331 (class 2620 OID 57888)
-- Name: note trg_note_verrouille; Type: TRIGGER; Schema: tenant_ispm; Owner: postgres
--

CREATE TRIGGER trg_note_verrouille BEFORE UPDATE ON tenant_ispm.note FOR EACH ROW EXECUTE FUNCTION tenant_ispm.trigger_note_verrouille();


--
-- TOC entry 6334 (class 2620 OID 57890)
-- Name: paiement trg_notif_paiement; Type: TRIGGER; Schema: tenant_ispm; Owner: postgres
--

CREATE TRIGGER trg_notif_paiement AFTER INSERT ON tenant_ispm.paiement FOR EACH ROW EXECUTE FUNCTION tenant_ispm.trigger_notification_paiement();


--
-- TOC entry 6335 (class 2620 OID 57884)
-- Name: paiement trg_numero_recu; Type: TRIGGER; Schema: tenant_ispm; Owner: postgres
--

CREATE TRIGGER trg_numero_recu BEFORE INSERT ON tenant_ispm.paiement FOR EACH ROW EXECUTE FUNCTION tenant_ispm.trigger_numero_recu();


--
-- TOC entry 6345 (class 2620 OID 58296)
-- Name: absence_enseignant trg_updated_at; Type: TRIGGER; Schema: tenant_ispm; Owner: postgres
--

CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_ispm.absence_enseignant FOR EACH ROW EXECUTE FUNCTION tenant_ispm.trigger_set_updated_at();


--
-- TOC entry 6327 (class 2620 OID 57873)
-- Name: affectation_cours trg_updated_at; Type: TRIGGER; Schema: tenant_ispm; Owner: postgres
--

CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_ispm.affectation_cours FOR EACH ROW EXECUTE FUNCTION tenant_ispm.trigger_set_updated_at();


--
-- TOC entry 6341 (class 2620 OID 57879)
-- Name: annonce trg_updated_at; Type: TRIGGER; Schema: tenant_ispm; Owner: postgres
--

CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_ispm.annonce FOR EACH ROW EXECUTE FUNCTION tenant_ispm.trigger_set_updated_at();


--
-- TOC entry 6336 (class 2620 OID 57882)
-- Name: budget trg_updated_at; Type: TRIGGER; Schema: tenant_ispm; Owner: postgres
--

CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_ispm.budget FOR EACH ROW EXECUTE FUNCTION tenant_ispm.trigger_set_updated_at();


--
-- TOC entry 6338 (class 2620 OID 57878)
-- Name: contrat_personnel trg_updated_at; Type: TRIGGER; Schema: tenant_ispm; Owner: postgres
--

CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_ispm.contrat_personnel FOR EACH ROW EXECUTE FUNCTION tenant_ispm.trigger_set_updated_at();


--
-- TOC entry 6349 (class 2620 OID 58343)
-- Name: convocation trg_updated_at; Type: TRIGGER; Schema: tenant_ispm; Owner: postgres
--

CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_ispm.convocation FOR EACH ROW EXECUTE FUNCTION tenant_ispm.trigger_set_updated_at();


--
-- TOC entry 6348 (class 2620 OID 58299)
-- Name: demande_etudiant trg_updated_at; Type: TRIGGER; Schema: tenant_ispm; Owner: postgres
--

CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_ispm.demande_etudiant FOR EACH ROW EXECUTE FUNCTION tenant_ispm.trigger_set_updated_at();


--
-- TOC entry 6337 (class 2620 OID 57881)
-- Name: depense trg_updated_at; Type: TRIGGER; Schema: tenant_ispm; Owner: postgres
--

CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_ispm.depense FOR EACH ROW EXECUTE FUNCTION tenant_ispm.trigger_set_updated_at();


--
-- TOC entry 6350 (class 2620 OID 58382)
-- Name: dossier_etudiant trg_updated_at; Type: TRIGGER; Schema: tenant_ispm; Owner: postgres
--

CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_ispm.dossier_etudiant FOR EACH ROW EXECUTE FUNCTION tenant_ispm.trigger_set_updated_at();


--
-- TOC entry 6328 (class 2620 OID 57874)
-- Name: emploi_du_temps trg_updated_at; Type: TRIGGER; Schema: tenant_ispm; Owner: postgres
--

CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_ispm.emploi_du_temps FOR EACH ROW EXECUTE FUNCTION tenant_ispm.trigger_set_updated_at();


--
-- TOC entry 6326 (class 2620 OID 57872)
-- Name: enseignant trg_updated_at; Type: TRIGGER; Schema: tenant_ispm; Owner: postgres
--

CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_ispm.enseignant FOR EACH ROW EXECUTE FUNCTION tenant_ispm.trigger_set_updated_at();


--
-- TOC entry 6325 (class 2620 OID 57871)
-- Name: inscription trg_updated_at; Type: TRIGGER; Schema: tenant_ispm; Owner: postgres
--

CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_ispm.inscription FOR EACH ROW EXECUTE FUNCTION tenant_ispm.trigger_set_updated_at();


--
-- TOC entry 6332 (class 2620 OID 57875)
-- Name: note trg_updated_at; Type: TRIGGER; Schema: tenant_ispm; Owner: postgres
--

CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_ispm.note FOR EACH ROW EXECUTE FUNCTION tenant_ispm.trigger_set_updated_at();


--
-- TOC entry 6347 (class 2620 OID 58298)
-- Name: note_derogatoire trg_updated_at; Type: TRIGGER; Schema: tenant_ispm; Owner: postgres
--

CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_ispm.note_derogatoire FOR EACH ROW EXECUTE FUNCTION tenant_ispm.trigger_set_updated_at();


--
-- TOC entry 6324 (class 2620 OID 57870)
-- Name: parcours trg_updated_at; Type: TRIGGER; Schema: tenant_ispm; Owner: postgres
--

CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_ispm.parcours FOR EACH ROW EXECUTE FUNCTION tenant_ispm.trigger_set_updated_at();


--
-- TOC entry 6329 (class 2620 OID 57880)
-- Name: presence trg_updated_at; Type: TRIGGER; Schema: tenant_ispm; Owner: postgres
--

CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_ispm.presence FOR EACH ROW EXECUTE FUNCTION tenant_ispm.trigger_set_updated_at();


--
-- TOC entry 6344 (class 2620 OID 58124)
-- Name: proces_verbal trg_updated_at; Type: TRIGGER; Schema: tenant_ispm; Owner: postgres
--

CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_ispm.proces_verbal FOR EACH ROW EXECUTE FUNCTION tenant_ispm.trigger_set_updated_at();


--
-- TOC entry 6333 (class 2620 OID 57876)
-- Name: pv_deliberation trg_updated_at; Type: TRIGGER; Schema: tenant_ispm; Owner: postgres
--

CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_ispm.pv_deliberation FOR EACH ROW EXECUTE FUNCTION tenant_ispm.trigger_set_updated_at();


--
-- TOC entry 6346 (class 2620 OID 58297)
-- Name: rattrapage trg_updated_at; Type: TRIGGER; Schema: tenant_ispm; Owner: postgres
--

CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_ispm.rattrapage FOR EACH ROW EXECUTE FUNCTION tenant_ispm.trigger_set_updated_at();


--
-- TOC entry 6342 (class 2620 OID 58122)
-- Name: referentiel_competences trg_updated_at; Type: TRIGGER; Schema: tenant_ispm; Owner: postgres
--

CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_ispm.referentiel_competences FOR EACH ROW EXECUTE FUNCTION tenant_ispm.trigger_set_updated_at();


--
-- TOC entry 6343 (class 2620 OID 58123)
-- Name: sujet_examen trg_updated_at; Type: TRIGGER; Schema: tenant_ispm; Owner: postgres
--

CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_ispm.sujet_examen FOR EACH ROW EXECUTE FUNCTION tenant_ispm.trigger_set_updated_at();


--
-- TOC entry 6339 (class 2620 OID 57877)
-- Name: ticket_maintenance trg_updated_at; Type: TRIGGER; Schema: tenant_ispm; Owner: postgres
--

CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_ispm.ticket_maintenance FOR EACH ROW EXECUTE FUNCTION tenant_ispm.trigger_set_updated_at();


--
-- TOC entry 6323 (class 2620 OID 57869)
-- Name: utilisateur trg_updated_at; Type: TRIGGER; Schema: tenant_ispm; Owner: postgres
--

CREATE TRIGGER trg_updated_at BEFORE UPDATE ON tenant_ispm.utilisateur FOR EACH ROW EXECUTE FUNCTION tenant_ispm.trigger_set_updated_at();


--
-- TOC entry 6363 (class 2620 OID 83964)
-- Name: paiement_inscription trigger_update_paiement_inscription_updated_at; Type: TRIGGER; Schema: tenant_ispm; Owner: postgres
--

CREATE TRIGGER trigger_update_paiement_inscription_updated_at BEFORE UPDATE ON tenant_ispm.paiement_inscription FOR EACH ROW EXECUTE FUNCTION tenant_ispm.update_paiement_inscription_updated_at();


--
-- TOC entry 6357 (class 2620 OID 62289)
-- Name: archive_scolarite update_archive_scolarite_updated_at; Type: TRIGGER; Schema: tenant_ispm; Owner: postgres
--

CREATE TRIGGER update_archive_scolarite_updated_at BEFORE UPDATE ON tenant_ispm.archive_scolarite FOR EACH ROW EXECUTE FUNCTION tenant_ispm.update_updated_at_column();


--
-- TOC entry 6368 (class 2620 OID 85006)
-- Name: candidature update_candidature_updated_at; Type: TRIGGER; Schema: tenant_ispm; Owner: postgres
--

CREATE TRIGGER update_candidature_updated_at BEFORE UPDATE ON tenant_ispm.candidature FOR EACH ROW EXECUTE FUNCTION tenant_ispm.update_updated_at_column();


--
-- TOC entry 6366 (class 2620 OID 85004)
-- Name: declaration_sociale update_declaration_sociale_updated_at; Type: TRIGGER; Schema: tenant_ispm; Owner: postgres
--

CREATE TRIGGER update_declaration_sociale_updated_at BEFORE UPDATE ON tenant_ispm.declaration_sociale FOR EACH ROW EXECUTE FUNCTION tenant_ispm.update_updated_at_column();


--
-- TOC entry 6351 (class 2620 OID 62283)
-- Name: deliberation update_deliberation_updated_at; Type: TRIGGER; Schema: tenant_ispm; Owner: postgres
--

CREATE TRIGGER update_deliberation_updated_at BEFORE UPDATE ON tenant_ispm.deliberation FOR EACH ROW EXECUTE FUNCTION tenant_ispm.update_updated_at_column();


--
-- TOC entry 6362 (class 2620 OID 83669)
-- Name: demande_ressource update_demande_ressource_updated_at; Type: TRIGGER; Schema: tenant_ispm; Owner: postgres
--

CREATE TRIGGER update_demande_ressource_updated_at BEFORE UPDATE ON tenant_ispm.demande_ressource FOR EACH ROW EXECUTE FUNCTION tenant_ispm.update_updated_at_column();


--
-- TOC entry 6354 (class 2620 OID 62286)
-- Name: diplome update_diplome_updated_at; Type: TRIGGER; Schema: tenant_ispm; Owner: postgres
--

CREATE TRIGGER update_diplome_updated_at BEFORE UPDATE ON tenant_ispm.diplome FOR EACH ROW EXECUTE FUNCTION tenant_ispm.update_updated_at_column();


--
-- TOC entry 6364 (class 2620 OID 85003)
-- Name: evaluation_personnel update_evaluation_personnel_updated_at; Type: TRIGGER; Schema: tenant_ispm; Owner: postgres
--

CREATE TRIGGER update_evaluation_personnel_updated_at BEFORE UPDATE ON tenant_ispm.evaluation_personnel FOR EACH ROW EXECUTE FUNCTION tenant_ispm.update_updated_at_column();


--
-- TOC entry 6365 (class 2620 OID 85002)
-- Name: heure_complementaire update_heure_complementaire_updated_at; Type: TRIGGER; Schema: tenant_ispm; Owner: postgres
--

CREATE TRIGGER update_heure_complementaire_updated_at BEFORE UPDATE ON tenant_ispm.heure_complementaire FOR EACH ROW EXECUTE FUNCTION tenant_ispm.update_updated_at_column();


--
-- TOC entry 6367 (class 2620 OID 85005)
-- Name: recrutement update_recrutement_updated_at; Type: TRIGGER; Schema: tenant_ispm; Owner: postgres
--

CREATE TRIGGER update_recrutement_updated_at BEFORE UPDATE ON tenant_ispm.recrutement FOR EACH ROW EXECUTE FUNCTION tenant_ispm.update_updated_at_column();


--
-- TOC entry 6352 (class 2620 OID 62284)
-- Name: resultat_semestre update_resultat_semestre_updated_at; Type: TRIGGER; Schema: tenant_ispm; Owner: postgres
--

CREATE TRIGGER update_resultat_semestre_updated_at BEFORE UPDATE ON tenant_ispm.resultat_semestre FOR EACH ROW EXECUTE FUNCTION tenant_ispm.update_updated_at_column();


--
-- TOC entry 6353 (class 2620 OID 62285)
-- Name: resultat_ue update_resultat_ue_updated_at; Type: TRIGGER; Schema: tenant_ispm; Owner: postgres
--

CREATE TRIGGER update_resultat_ue_updated_at BEFORE UPDATE ON tenant_ispm.resultat_ue FOR EACH ROW EXECUTE FUNCTION tenant_ispm.update_updated_at_column();


--
-- TOC entry 6361 (class 2620 OID 83668)
-- Name: soutenance update_soutenance_updated_at; Type: TRIGGER; Schema: tenant_ispm; Owner: postgres
--

CREATE TRIGGER update_soutenance_updated_at BEFORE UPDATE ON tenant_ispm.soutenance FOR EACH ROW EXECUTE FUNCTION tenant_ispm.update_updated_at_column();


--
-- TOC entry 6360 (class 2620 OID 83667)
-- Name: stage update_stage_updated_at; Type: TRIGGER; Schema: tenant_ispm; Owner: postgres
--

CREATE TRIGGER update_stage_updated_at BEFORE UPDATE ON tenant_ispm.stage FOR EACH ROW EXECUTE FUNCTION tenant_ispm.update_updated_at_column();


--
-- TOC entry 6355 (class 2620 OID 62287)
-- Name: suplement_diplome update_suplement_diplome_updated_at; Type: TRIGGER; Schema: tenant_ispm; Owner: postgres
--

CREATE TRIGGER update_suplement_diplome_updated_at BEFORE UPDATE ON tenant_ispm.suplement_diplome FOR EACH ROW EXECUTE FUNCTION tenant_ispm.update_updated_at_column();


--
-- TOC entry 6359 (class 2620 OID 83666)
-- Name: support_cours update_support_cours_updated_at; Type: TRIGGER; Schema: tenant_ispm; Owner: postgres
--

CREATE TRIGGER update_support_cours_updated_at BEFORE UPDATE ON tenant_ispm.support_cours FOR EACH ROW EXECUTE FUNCTION tenant_ispm.update_updated_at_column();


--
-- TOC entry 6356 (class 2620 OID 62288)
-- Name: transfert_etudiant update_transfert_etudiant_updated_at; Type: TRIGGER; Schema: tenant_ispm; Owner: postgres
--

CREATE TRIGGER update_transfert_etudiant_updated_at BEFORE UPDATE ON tenant_ispm.transfert_etudiant FOR EACH ROW EXECUTE FUNCTION tenant_ispm.update_updated_at_column();


--
-- TOC entry 6358 (class 2620 OID 62290)
-- Name: verrouillage_notes update_verrouillage_notes_updated_at; Type: TRIGGER; Schema: tenant_ispm; Owner: postgres
--

CREATE TRIGGER update_verrouillage_notes_updated_at BEFORE UPDATE ON tenant_ispm.verrouillage_notes FOR EACH ROW EXECUTE FUNCTION tenant_ispm.update_updated_at_column();


--
-- TOC entry 6241 (class 2606 OID 58158)
-- Name: absence_enseignant absence_enseignant_declaree_par_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.absence_enseignant
    ADD CONSTRAINT absence_enseignant_declaree_par_fkey FOREIGN KEY (declaree_par) REFERENCES tenant_ispm.utilisateur(id);


--
-- TOC entry 6242 (class 2606 OID 58148)
-- Name: absence_enseignant absence_enseignant_enseignant_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.absence_enseignant
    ADD CONSTRAINT absence_enseignant_enseignant_id_fkey FOREIGN KEY (enseignant_id) REFERENCES tenant_ispm.utilisateur(id) ON DELETE CASCADE;


--
-- TOC entry 6243 (class 2606 OID 58153)
-- Name: absence_enseignant absence_enseignant_seance_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.absence_enseignant
    ADD CONSTRAINT absence_enseignant_seance_id_fkey FOREIGN KEY (seance_id) REFERENCES tenant_ispm.emploi_du_temps(id) ON DELETE SET NULL;


--
-- TOC entry 6244 (class 2606 OID 58163)
-- Name: absence_enseignant absence_enseignant_validee_par_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.absence_enseignant
    ADD CONSTRAINT absence_enseignant_validee_par_fkey FOREIGN KEY (validee_par) REFERENCES tenant_ispm.utilisateur(id);


--
-- TOC entry 6163 (class 2606 OID 57007)
-- Name: affectation_cours affectation_cours_annee_academique_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.affectation_cours
    ADD CONSTRAINT affectation_cours_annee_academique_id_fkey FOREIGN KEY (annee_academique_id) REFERENCES tenant_ispm.annee_academique(id);


--
-- TOC entry 6164 (class 2606 OID 57002)
-- Name: affectation_cours affectation_cours_ec_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.affectation_cours
    ADD CONSTRAINT affectation_cours_ec_id_fkey FOREIGN KEY (ec_id) REFERENCES tenant_ispm.element_constitutif(id) ON DELETE CASCADE;


--
-- TOC entry 6165 (class 2606 OID 56992)
-- Name: affectation_cours affectation_cours_enseignant_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.affectation_cours
    ADD CONSTRAINT affectation_cours_enseignant_id_fkey FOREIGN KEY (enseignant_id) REFERENCES tenant_ispm.enseignant(id) ON DELETE RESTRICT;


--
-- TOC entry 6166 (class 2606 OID 56997)
-- Name: affectation_cours affectation_cours_ue_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.affectation_cours
    ADD CONSTRAINT affectation_cours_ue_id_fkey FOREIGN KEY (ue_id) REFERENCES tenant_ispm.unite_enseignement(id) ON DELETE CASCADE;


--
-- TOC entry 6167 (class 2606 OID 57012)
-- Name: affectation_cours affectation_cours_valide_par_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.affectation_cours
    ADD CONSTRAINT affectation_cours_valide_par_fkey FOREIGN KEY (valide_par) REFERENCES tenant_ispm.utilisateur(id);


--
-- TOC entry 6223 (class 2606 OID 57786)
-- Name: annonce annonce_auteur_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.annonce
    ADD CONSTRAINT annonce_auteur_id_fkey FOREIGN KEY (auteur_id) REFERENCES tenant_ispm.utilisateur(id);


--
-- TOC entry 6224 (class 2606 OID 57781)
-- Name: annonce annonce_parcours_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.annonce
    ADD CONSTRAINT annonce_parcours_id_fkey FOREIGN KEY (parcours_id) REFERENCES tenant_ispm.parcours(id);


--
-- TOC entry 6286 (class 2606 OID 62210)
-- Name: archive_scolarite archive_scolarite_archive_par_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.archive_scolarite
    ADD CONSTRAINT archive_scolarite_archive_par_fkey FOREIGN KEY (archive_par) REFERENCES tenant_ispm.utilisateur(id);


--
-- TOC entry 6287 (class 2606 OID 62205)
-- Name: archive_scolarite archive_scolarite_etudiant_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.archive_scolarite
    ADD CONSTRAINT archive_scolarite_etudiant_id_fkey FOREIGN KEY (etudiant_id) REFERENCES tenant_ispm.etudiant(id) ON DELETE RESTRICT;


--
-- TOC entry 6197 (class 2606 OID 57451)
-- Name: budget budget_annee_academique_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.budget
    ADD CONSTRAINT budget_annee_academique_id_fkey FOREIGN KEY (annee_academique_id) REFERENCES tenant_ispm.annee_academique(id);


--
-- TOC entry 6198 (class 2606 OID 57461)
-- Name: budget budget_created_by_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.budget
    ADD CONSTRAINT budget_created_by_fkey FOREIGN KEY (created_by) REFERENCES tenant_ispm.utilisateur(id);


--
-- TOC entry 6199 (class 2606 OID 57456)
-- Name: budget budget_departement_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.budget
    ADD CONSTRAINT budget_departement_id_fkey FOREIGN KEY (departement_id) REFERENCES tenant_ispm.departement(id);


--
-- TOC entry 6154 (class 2606 OID 56859)
-- Name: calendrier_academique calendrier_academique_annee_academique_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.calendrier_academique
    ADD CONSTRAINT calendrier_academique_annee_academique_id_fkey FOREIGN KEY (annee_academique_id) REFERENCES tenant_ispm.annee_academique(id);


--
-- TOC entry 6155 (class 2606 OID 56864)
-- Name: calendrier_academique calendrier_academique_parcours_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.calendrier_academique
    ADD CONSTRAINT calendrier_academique_parcours_id_fkey FOREIGN KEY (parcours_id) REFERENCES tenant_ispm.parcours(id);


--
-- TOC entry 6322 (class 2606 OID 84994)
-- Name: candidature candidature_recrutement_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.candidature
    ADD CONSTRAINT candidature_recrutement_id_fkey FOREIGN KEY (recrutement_id) REFERENCES tenant_ispm.recrutement(id) ON DELETE CASCADE;


--
-- TOC entry 6206 (class 2606 OID 57554)
-- Name: conge_personnel conge_personnel_approuve_par_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.conge_personnel
    ADD CONSTRAINT conge_personnel_approuve_par_fkey FOREIGN KEY (approuve_par) REFERENCES tenant_ispm.utilisateur(id);


--
-- TOC entry 6207 (class 2606 OID 57549)
-- Name: conge_personnel conge_personnel_utilisateur_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.conge_personnel
    ADD CONSTRAINT conge_personnel_utilisateur_id_fkey FOREIGN KEY (utilisateur_id) REFERENCES tenant_ispm.utilisateur(id);


--
-- TOC entry 6204 (class 2606 OID 57526)
-- Name: contrat_personnel contrat_personnel_departement_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.contrat_personnel
    ADD CONSTRAINT contrat_personnel_departement_id_fkey FOREIGN KEY (departement_id) REFERENCES tenant_ispm.departement(id);


--
-- TOC entry 6205 (class 2606 OID 57521)
-- Name: contrat_personnel contrat_personnel_utilisateur_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.contrat_personnel
    ADD CONSTRAINT contrat_personnel_utilisateur_id_fkey FOREIGN KEY (utilisateur_id) REFERENCES tenant_ispm.utilisateur(id) ON DELETE RESTRICT;


--
-- TOC entry 6258 (class 2606 OID 58318)
-- Name: convocation convocation_etudiant_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.convocation
    ADD CONSTRAINT convocation_etudiant_id_fkey FOREIGN KEY (etudiant_id) REFERENCES tenant_ispm.etudiant(id) ON DELETE CASCADE;


--
-- TOC entry 6259 (class 2606 OID 58333)
-- Name: convocation convocation_genere_par_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.convocation
    ADD CONSTRAINT convocation_genere_par_fkey FOREIGN KEY (genere_par) REFERENCES tenant_ispm.utilisateur(id);


--
-- TOC entry 6260 (class 2606 OID 58328)
-- Name: convocation convocation_salle_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.convocation
    ADD CONSTRAINT convocation_salle_id_fkey FOREIGN KEY (salle_id) REFERENCES tenant_ispm.salle(id) ON DELETE SET NULL;


--
-- TOC entry 6261 (class 2606 OID 58323)
-- Name: convocation convocation_session_examen_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.convocation
    ADD CONSTRAINT convocation_session_examen_id_fkey FOREIGN KEY (session_examen_id) REFERENCES tenant_ispm.session_examen(id) ON DELETE CASCADE;


--
-- TOC entry 6266 (class 2606 OID 61991)
-- Name: deliberation deliberation_parcours_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.deliberation
    ADD CONSTRAINT deliberation_parcours_id_fkey FOREIGN KEY (parcours_id) REFERENCES tenant_ispm.parcours(id) ON DELETE RESTRICT;


--
-- TOC entry 6267 (class 2606 OID 61996)
-- Name: deliberation deliberation_president_jury_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.deliberation
    ADD CONSTRAINT deliberation_president_jury_id_fkey FOREIGN KEY (president_jury_id) REFERENCES tenant_ispm.utilisateur(id);


--
-- TOC entry 6268 (class 2606 OID 61986)
-- Name: deliberation deliberation_session_examen_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.deliberation
    ADD CONSTRAINT deliberation_session_examen_id_fkey FOREIGN KEY (session_examen_id) REFERENCES tenant_ispm.session_examen(id) ON DELETE RESTRICT;


--
-- TOC entry 6269 (class 2606 OID 62001)
-- Name: deliberation deliberation_validee_par_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.deliberation
    ADD CONSTRAINT deliberation_validee_par_fkey FOREIGN KEY (validee_par) REFERENCES tenant_ispm.utilisateur(id);


--
-- TOC entry 6256 (class 2606 OID 58284)
-- Name: demande_etudiant demande_etudiant_etudiant_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.demande_etudiant
    ADD CONSTRAINT demande_etudiant_etudiant_id_fkey FOREIGN KEY (etudiant_id) REFERENCES tenant_ispm.etudiant(id) ON DELETE CASCADE;


--
-- TOC entry 6257 (class 2606 OID 58289)
-- Name: demande_etudiant demande_etudiant_traite_par_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.demande_etudiant
    ADD CONSTRAINT demande_etudiant_traite_par_fkey FOREIGN KEY (traite_par) REFERENCES tenant_ispm.utilisateur(id);


--
-- TOC entry 6307 (class 2606 OID 83653)
-- Name: demande_ressource demande_ressource_demandeur_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.demande_ressource
    ADD CONSTRAINT demande_ressource_demandeur_id_fkey FOREIGN KEY (demandeur_id) REFERENCES tenant_ispm.utilisateur(id) ON DELETE CASCADE;


--
-- TOC entry 6308 (class 2606 OID 83658)
-- Name: demande_ressource demande_ressource_traite_par_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.demande_ressource
    ADD CONSTRAINT demande_ressource_traite_par_fkey FOREIGN KEY (traite_par) REFERENCES tenant_ispm.utilisateur(id) ON DELETE SET NULL;


--
-- TOC entry 6147 (class 2606 OID 56754)
-- Name: departement departement_responsable_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.departement
    ADD CONSTRAINT departement_responsable_id_fkey FOREIGN KEY (responsable_id) REFERENCES tenant_ispm.utilisateur(id) ON DELETE SET NULL;


--
-- TOC entry 6200 (class 2606 OID 57489)
-- Name: depense depense_annee_academique_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.depense
    ADD CONSTRAINT depense_annee_academique_id_fkey FOREIGN KEY (annee_academique_id) REFERENCES tenant_ispm.annee_academique(id);


--
-- TOC entry 6201 (class 2606 OID 57499)
-- Name: depense depense_approuve_par_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.depense
    ADD CONSTRAINT depense_approuve_par_fkey FOREIGN KEY (approuve_par) REFERENCES tenant_ispm.utilisateur(id);


--
-- TOC entry 6202 (class 2606 OID 57484)
-- Name: depense depense_budget_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.depense
    ADD CONSTRAINT depense_budget_id_fkey FOREIGN KEY (budget_id) REFERENCES tenant_ispm.budget(id);


--
-- TOC entry 6203 (class 2606 OID 57494)
-- Name: depense depense_demande_par_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.depense
    ADD CONSTRAINT depense_demande_par_fkey FOREIGN KEY (demande_par) REFERENCES tenant_ispm.utilisateur(id);


--
-- TOC entry 6277 (class 2606 OID 62118)
-- Name: diplome diplome_delivre_par_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.diplome
    ADD CONSTRAINT diplome_delivre_par_fkey FOREIGN KEY (delivre_par) REFERENCES tenant_ispm.utilisateur(id);


--
-- TOC entry 6278 (class 2606 OID 62103)
-- Name: diplome diplome_etudiant_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.diplome
    ADD CONSTRAINT diplome_etudiant_id_fkey FOREIGN KEY (etudiant_id) REFERENCES tenant_ispm.etudiant(id) ON DELETE RESTRICT;


--
-- TOC entry 6279 (class 2606 OID 62108)
-- Name: diplome diplome_inscription_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.diplome
    ADD CONSTRAINT diplome_inscription_id_fkey FOREIGN KEY (inscription_id) REFERENCES tenant_ispm.inscription(id) ON DELETE RESTRICT;


--
-- TOC entry 6280 (class 2606 OID 62113)
-- Name: diplome diplome_parcours_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.diplome
    ADD CONSTRAINT diplome_parcours_id_fkey FOREIGN KEY (parcours_id) REFERENCES tenant_ispm.parcours(id) ON DELETE RESTRICT;


--
-- TOC entry 6262 (class 2606 OID 58368)
-- Name: dossier_etudiant dossier_etudiant_demande_par_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.dossier_etudiant
    ADD CONSTRAINT dossier_etudiant_demande_par_fkey FOREIGN KEY (demande_par) REFERENCES tenant_ispm.utilisateur(id);


--
-- TOC entry 6263 (class 2606 OID 58363)
-- Name: dossier_etudiant dossier_etudiant_etudiant_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.dossier_etudiant
    ADD CONSTRAINT dossier_etudiant_etudiant_id_fkey FOREIGN KEY (etudiant_id) REFERENCES tenant_ispm.etudiant(id) ON DELETE CASCADE;


--
-- TOC entry 6264 (class 2606 OID 58373)
-- Name: dossier_etudiant dossier_etudiant_traite_par_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.dossier_etudiant
    ADD CONSTRAINT dossier_etudiant_traite_par_fkey FOREIGN KEY (traite_par) REFERENCES tenant_ispm.utilisateur(id);


--
-- TOC entry 6193 (class 2606 OID 57391)
-- Name: echeancier echeancier_inscription_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.echeancier
    ADD CONSTRAINT echeancier_inscription_id_fkey FOREIGN KEY (inscription_id) REFERENCES tenant_ispm.inscription(id) ON DELETE CASCADE;


--
-- TOC entry 6153 (class 2606 OID 56838)
-- Name: element_constitutif element_constitutif_ue_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.element_constitutif
    ADD CONSTRAINT element_constitutif_ue_id_fkey FOREIGN KEY (ue_id) REFERENCES tenant_ispm.unite_enseignement(id) ON DELETE CASCADE;


--
-- TOC entry 6169 (class 2606 OID 57082)
-- Name: emploi_du_temps emploi_du_temps_affectation_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.emploi_du_temps
    ADD CONSTRAINT emploi_du_temps_affectation_id_fkey FOREIGN KEY (affectation_id) REFERENCES tenant_ispm.affectation_cours(id) ON DELETE CASCADE;


--
-- TOC entry 6170 (class 2606 OID 57077)
-- Name: emploi_du_temps emploi_du_temps_annee_academique_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.emploi_du_temps
    ADD CONSTRAINT emploi_du_temps_annee_academique_id_fkey FOREIGN KEY (annee_academique_id) REFERENCES tenant_ispm.annee_academique(id);


--
-- TOC entry 6171 (class 2606 OID 57087)
-- Name: emploi_du_temps emploi_du_temps_salle_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.emploi_du_temps
    ADD CONSTRAINT emploi_du_temps_salle_id_fkey FOREIGN KEY (salle_id) REFERENCES tenant_ispm.salle(id) ON DELETE SET NULL;


--
-- TOC entry 6161 (class 2606 OID 56970)
-- Name: enseignant enseignant_departement_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.enseignant
    ADD CONSTRAINT enseignant_departement_id_fkey FOREIGN KEY (departement_id) REFERENCES tenant_ispm.departement(id);


--
-- TOC entry 6162 (class 2606 OID 56965)
-- Name: enseignant enseignant_utilisateur_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.enseignant
    ADD CONSTRAINT enseignant_utilisateur_id_fkey FOREIGN KEY (utilisateur_id) REFERENCES tenant_ispm.utilisateur(id) ON DELETE SET NULL;


--
-- TOC entry 6156 (class 2606 OID 56891)
-- Name: etudiant etudiant_utilisateur_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.etudiant
    ADD CONSTRAINT etudiant_utilisateur_id_fkey FOREIGN KEY (utilisateur_id) REFERENCES tenant_ispm.utilisateur(id) ON DELETE SET NULL;


--
-- TOC entry 6305 (class 2606 OID 83628)
-- Name: evaluation_soutenance evaluation_soutenance_evaluateur_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.evaluation_soutenance
    ADD CONSTRAINT evaluation_soutenance_evaluateur_id_fkey FOREIGN KEY (evaluateur_id) REFERENCES tenant_ispm.utilisateur(id) ON DELETE CASCADE;


--
-- TOC entry 6306 (class 2606 OID 83623)
-- Name: evaluation_soutenance evaluation_soutenance_soutenance_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.evaluation_soutenance
    ADD CONSTRAINT evaluation_soutenance_soutenance_id_fkey FOREIGN KEY (soutenance_id) REFERENCES tenant_ispm.soutenance(id) ON DELETE CASCADE;


--
-- TOC entry 6208 (class 2606 OID 57584)
-- Name: fiche_paie fiche_paie_contrat_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.fiche_paie
    ADD CONSTRAINT fiche_paie_contrat_id_fkey FOREIGN KEY (contrat_id) REFERENCES tenant_ispm.contrat_personnel(id);


--
-- TOC entry 6300 (class 2606 OID 83562)
-- Name: fiche_suivi_stage fiche_suivi_stage_auteur_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.fiche_suivi_stage
    ADD CONSTRAINT fiche_suivi_stage_auteur_id_fkey FOREIGN KEY (auteur_id) REFERENCES tenant_ispm.utilisateur(id) ON DELETE CASCADE;


--
-- TOC entry 6301 (class 2606 OID 83557)
-- Name: fiche_suivi_stage fiche_suivi_stage_stage_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.fiche_suivi_stage
    ADD CONSTRAINT fiche_suivi_stage_stage_id_fkey FOREIGN KEY (stage_id) REFERENCES tenant_ispm.stage(id) ON DELETE CASCADE;


--
-- TOC entry 6312 (class 2606 OID 83988)
-- Name: message_enseignant fk_enseignant; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.message_enseignant
    ADD CONSTRAINT fk_enseignant FOREIGN KEY (enseignant_id) REFERENCES tenant_ispm.utilisateur(id) ON DELETE CASCADE;


--
-- TOC entry 6313 (class 2606 OID 83993)
-- Name: message_enseignant fk_etudiant; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.message_enseignant
    ADD CONSTRAINT fk_etudiant FOREIGN KEY (etudiant_id) REFERENCES tenant_ispm.etudiant(id) ON DELETE CASCADE;


--
-- TOC entry 6316 (class 2606 OID 84025)
-- Name: message_destinataire fk_etudiant_dest; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.message_destinataire
    ADD CONSTRAINT fk_etudiant_dest FOREIGN KEY (etudiant_id) REFERENCES tenant_ispm.etudiant(id) ON DELETE CASCADE;


--
-- TOC entry 6317 (class 2606 OID 84020)
-- Name: message_destinataire fk_message; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.message_destinataire
    ADD CONSTRAINT fk_message FOREIGN KEY (message_id) REFERENCES tenant_ispm.message_enseignant(id) ON DELETE CASCADE;


--
-- TOC entry 6314 (class 2606 OID 84003)
-- Name: message_enseignant fk_niveau; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.message_enseignant
    ADD CONSTRAINT fk_niveau FOREIGN KEY (niveau_id) REFERENCES tenant_ispm.niveau_etude(id) ON DELETE SET NULL;


--
-- TOC entry 6315 (class 2606 OID 83998)
-- Name: message_enseignant fk_parcours; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.message_enseignant
    ADD CONSTRAINT fk_parcours FOREIGN KEY (parcours_id) REFERENCES tenant_ispm.parcours(id) ON DELETE SET NULL;


--
-- TOC entry 6265 (class 2606 OID 58401)
-- Name: secretaire_parcours fk_secretaire_parcours_parcours; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.secretaire_parcours
    ADD CONSTRAINT fk_secretaire_parcours_parcours FOREIGN KEY (parcours_id) REFERENCES tenant_ispm.parcours(id) ON DELETE CASCADE;


--
-- TOC entry 6191 (class 2606 OID 57371)
-- Name: grille_tarifaire grille_tarifaire_annee_academique_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.grille_tarifaire
    ADD CONSTRAINT grille_tarifaire_annee_academique_id_fkey FOREIGN KEY (annee_academique_id) REFERENCES tenant_ispm.annee_academique(id);


--
-- TOC entry 6192 (class 2606 OID 57366)
-- Name: grille_tarifaire grille_tarifaire_parcours_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.grille_tarifaire
    ADD CONSTRAINT grille_tarifaire_parcours_id_fkey FOREIGN KEY (parcours_id) REFERENCES tenant_ispm.parcours(id);


--
-- TOC entry 6318 (class 2606 OID 84906)
-- Name: heure_complementaire heure_complementaire_enseignant_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.heure_complementaire
    ADD CONSTRAINT heure_complementaire_enseignant_id_fkey FOREIGN KEY (enseignant_id) REFERENCES tenant_ispm.enseignant(id) ON DELETE CASCADE;


--
-- TOC entry 6319 (class 2606 OID 84911)
-- Name: heure_complementaire heure_complementaire_valide_par_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.heure_complementaire
    ADD CONSTRAINT heure_complementaire_valide_par_fkey FOREIGN KEY (valide_par) REFERENCES tenant_ispm.utilisateur(id);


--
-- TOC entry 6176 (class 2606 OID 57163)
-- Name: incident_disciplinaire incident_disciplinaire_arbitre_par_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.incident_disciplinaire
    ADD CONSTRAINT incident_disciplinaire_arbitre_par_fkey FOREIGN KEY (arbitre_par) REFERENCES tenant_ispm.utilisateur(id);


--
-- TOC entry 6177 (class 2606 OID 57153)
-- Name: incident_disciplinaire incident_disciplinaire_etudiant_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.incident_disciplinaire
    ADD CONSTRAINT incident_disciplinaire_etudiant_id_fkey FOREIGN KEY (etudiant_id) REFERENCES tenant_ispm.etudiant(id);


--
-- TOC entry 6178 (class 2606 OID 57158)
-- Name: incident_disciplinaire incident_disciplinaire_rapporte_par_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.incident_disciplinaire
    ADD CONSTRAINT incident_disciplinaire_rapporte_par_fkey FOREIGN KEY (rapporte_par) REFERENCES tenant_ispm.utilisateur(id);


--
-- TOC entry 6157 (class 2606 OID 56933)
-- Name: inscription inscription_annee_academique_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.inscription
    ADD CONSTRAINT inscription_annee_academique_id_fkey FOREIGN KEY (annee_academique_id) REFERENCES tenant_ispm.annee_academique(id);


--
-- TOC entry 6158 (class 2606 OID 56923)
-- Name: inscription inscription_etudiant_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.inscription
    ADD CONSTRAINT inscription_etudiant_id_fkey FOREIGN KEY (etudiant_id) REFERENCES tenant_ispm.etudiant(id) ON DELETE RESTRICT;


--
-- TOC entry 6159 (class 2606 OID 56928)
-- Name: inscription inscription_parcours_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.inscription
    ADD CONSTRAINT inscription_parcours_id_fkey FOREIGN KEY (parcours_id) REFERENCES tenant_ispm.parcours(id) ON DELETE RESTRICT;


--
-- TOC entry 6160 (class 2606 OID 56938)
-- Name: inscription inscription_validee_par_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.inscription
    ADD CONSTRAINT inscription_validee_par_fkey FOREIGN KEY (validee_par) REFERENCES tenant_ispm.utilisateur(id);


--
-- TOC entry 6226 (class 2606 OID 57831)
-- Name: message message_destinataire_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.message
    ADD CONSTRAINT message_destinataire_id_fkey FOREIGN KEY (destinataire_id) REFERENCES tenant_ispm.utilisateur(id);


--
-- TOC entry 6227 (class 2606 OID 57826)
-- Name: message message_expediteur_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.message
    ADD CONSTRAINT message_expediteur_id_fkey FOREIGN KEY (expediteur_id) REFERENCES tenant_ispm.utilisateur(id);


--
-- TOC entry 6228 (class 2606 OID 57836)
-- Name: message message_parent_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.message
    ADD CONSTRAINT message_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES tenant_ispm.message(id);


--
-- TOC entry 6216 (class 2606 OID 57700)
-- Name: mouvement_stock mouvement_stock_stock_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.mouvement_stock
    ADD CONSTRAINT mouvement_stock_stock_id_fkey FOREIGN KEY (stock_id) REFERENCES tenant_ispm.stock(id);


--
-- TOC entry 6217 (class 2606 OID 57705)
-- Name: mouvement_stock mouvement_stock_utilisateur_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.mouvement_stock
    ADD CONSTRAINT mouvement_stock_utilisateur_id_fkey FOREIGN KEY (utilisateur_id) REFERENCES tenant_ispm.utilisateur(id);


--
-- TOC entry 6249 (class 2606 OID 58235)
-- Name: note_derogatoire note_derogatoire_ec_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.note_derogatoire
    ADD CONSTRAINT note_derogatoire_ec_id_fkey FOREIGN KEY (ec_id) REFERENCES tenant_ispm.element_constitutif(id) ON DELETE SET NULL;


--
-- TOC entry 6250 (class 2606 OID 58230)
-- Name: note_derogatoire note_derogatoire_etudiant_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.note_derogatoire
    ADD CONSTRAINT note_derogatoire_etudiant_id_fkey FOREIGN KEY (etudiant_id) REFERENCES tenant_ispm.etudiant(id) ON DELETE CASCADE;


--
-- TOC entry 6251 (class 2606 OID 58255)
-- Name: note_derogatoire note_derogatoire_saisie_par_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.note_derogatoire
    ADD CONSTRAINT note_derogatoire_saisie_par_fkey FOREIGN KEY (saisie_par) REFERENCES tenant_ispm.utilisateur(id);


--
-- TOC entry 6252 (class 2606 OID 58245)
-- Name: note_derogatoire note_derogatoire_session_examen_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.note_derogatoire
    ADD CONSTRAINT note_derogatoire_session_examen_id_fkey FOREIGN KEY (session_examen_id) REFERENCES tenant_ispm.session_examen(id) ON DELETE SET NULL;


--
-- TOC entry 6253 (class 2606 OID 58240)
-- Name: note_derogatoire note_derogatoire_ue_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.note_derogatoire
    ADD CONSTRAINT note_derogatoire_ue_id_fkey FOREIGN KEY (ue_id) REFERENCES tenant_ispm.unite_enseignement(id) ON DELETE SET NULL;


--
-- TOC entry 6254 (class 2606 OID 58260)
-- Name: note_derogatoire note_derogatoire_valide_par_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.note_derogatoire
    ADD CONSTRAINT note_derogatoire_valide_par_fkey FOREIGN KEY (valide_par) REFERENCES tenant_ispm.utilisateur(id);


--
-- TOC entry 6255 (class 2606 OID 58250)
-- Name: note_derogatoire note_derogatoire_valide_par_scolarite_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.note_derogatoire
    ADD CONSTRAINT note_derogatoire_valide_par_scolarite_fkey FOREIGN KEY (valide_par_scolarite) REFERENCES tenant_ispm.utilisateur(id);


--
-- TOC entry 6180 (class 2606 OID 57219)
-- Name: note note_ec_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.note
    ADD CONSTRAINT note_ec_id_fkey FOREIGN KEY (ec_id) REFERENCES tenant_ispm.element_constitutif(id) ON DELETE RESTRICT;


--
-- TOC entry 6181 (class 2606 OID 57214)
-- Name: note note_etudiant_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.note
    ADD CONSTRAINT note_etudiant_id_fkey FOREIGN KEY (etudiant_id) REFERENCES tenant_ispm.etudiant(id) ON DELETE RESTRICT;


--
-- TOC entry 6182 (class 2606 OID 57234)
-- Name: note note_saisi_par_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.note
    ADD CONSTRAINT note_saisi_par_fkey FOREIGN KEY (saisi_par) REFERENCES tenant_ispm.utilisateur(id);


--
-- TOC entry 6183 (class 2606 OID 57229)
-- Name: note note_session_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.note
    ADD CONSTRAINT note_session_id_fkey FOREIGN KEY (session_id) REFERENCES tenant_ispm.session_examen(id);


--
-- TOC entry 6184 (class 2606 OID 57224)
-- Name: note note_ue_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.note
    ADD CONSTRAINT note_ue_id_fkey FOREIGN KEY (ue_id) REFERENCES tenant_ispm.unite_enseignement(id) ON DELETE RESTRICT;


--
-- TOC entry 6185 (class 2606 OID 57239)
-- Name: note note_valide_par_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.note
    ADD CONSTRAINT note_valide_par_fkey FOREIGN KEY (valide_par) REFERENCES tenant_ispm.utilisateur(id);


--
-- TOC entry 6225 (class 2606 OID 57807)
-- Name: notification notification_utilisateur_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.notification
    ADD CONSTRAINT notification_utilisateur_id_fkey FOREIGN KEY (utilisateur_id) REFERENCES tenant_ispm.utilisateur(id) ON DELETE CASCADE;


--
-- TOC entry 6194 (class 2606 OID 57431)
-- Name: paiement paiement_caissier_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.paiement
    ADD CONSTRAINT paiement_caissier_id_fkey FOREIGN KEY (caissier_id) REFERENCES tenant_ispm.utilisateur(id);


--
-- TOC entry 6195 (class 2606 OID 57426)
-- Name: paiement paiement_echeancier_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.paiement
    ADD CONSTRAINT paiement_echeancier_id_fkey FOREIGN KEY (echeancier_id) REFERENCES tenant_ispm.echeancier(id);


--
-- TOC entry 6309 (class 2606 OID 83948)
-- Name: paiement_inscription paiement_inscription_etudiant_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.paiement_inscription
    ADD CONSTRAINT paiement_inscription_etudiant_id_fkey FOREIGN KEY (etudiant_id) REFERENCES tenant_ispm.etudiant(id) ON DELETE CASCADE;


--
-- TOC entry 6196 (class 2606 OID 57421)
-- Name: paiement paiement_inscription_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.paiement
    ADD CONSTRAINT paiement_inscription_id_fkey FOREIGN KEY (inscription_id) REFERENCES tenant_ispm.inscription(id) ON DELETE RESTRICT;


--
-- TOC entry 6310 (class 2606 OID 83943)
-- Name: paiement_inscription paiement_inscription_inscription_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.paiement_inscription
    ADD CONSTRAINT paiement_inscription_inscription_id_fkey FOREIGN KEY (inscription_id) REFERENCES tenant_ispm.inscription(id) ON DELETE CASCADE;


--
-- TOC entry 6311 (class 2606 OID 83953)
-- Name: paiement_inscription paiement_inscription_valide_par_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.paiement_inscription
    ADD CONSTRAINT paiement_inscription_valide_par_fkey FOREIGN KEY (valide_par) REFERENCES tenant_ispm.utilisateur(id);


--
-- TOC entry 6148 (class 2606 OID 56780)
-- Name: parcours parcours_departement_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.parcours
    ADD CONSTRAINT parcours_departement_id_fkey FOREIGN KEY (departement_id) REFERENCES tenant_ispm.departement(id) ON DELETE RESTRICT;


--
-- TOC entry 6149 (class 2606 OID 56785)
-- Name: parcours parcours_responsable_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.parcours
    ADD CONSTRAINT parcours_responsable_id_fkey FOREIGN KEY (responsable_id) REFERENCES tenant_ispm.utilisateur(id) ON DELETE SET NULL;


--
-- TOC entry 6150 (class 2606 OID 58125)
-- Name: parcours parcours_secretaire_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.parcours
    ADD CONSTRAINT parcours_secretaire_id_fkey FOREIGN KEY (secretaire_id) REFERENCES tenant_ispm.utilisateur(id) ON DELETE SET NULL;


--
-- TOC entry 6218 (class 2606 OID 57727)
-- Name: planning_entretien planning_entretien_batiment_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.planning_entretien
    ADD CONSTRAINT planning_entretien_batiment_id_fkey FOREIGN KEY (batiment_id) REFERENCES tenant_ispm.batiment(id);


--
-- TOC entry 6219 (class 2606 OID 57732)
-- Name: planning_entretien planning_entretien_responsable_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.planning_entretien
    ADD CONSTRAINT planning_entretien_responsable_id_fkey FOREIGN KEY (responsable_id) REFERENCES tenant_ispm.utilisateur(id);


--
-- TOC entry 6220 (class 2606 OID 57722)
-- Name: planning_entretien planning_entretien_salle_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.planning_entretien
    ADD CONSTRAINT planning_entretien_salle_id_fkey FOREIGN KEY (salle_id) REFERENCES tenant_ispm.salle(id);


--
-- TOC entry 6172 (class 2606 OID 57113)
-- Name: presence presence_etudiant_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.presence
    ADD CONSTRAINT presence_etudiant_id_fkey FOREIGN KEY (etudiant_id) REFERENCES tenant_ispm.etudiant(id) ON DELETE CASCADE;


--
-- TOC entry 6173 (class 2606 OID 57123)
-- Name: presence presence_saisi_par_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.presence
    ADD CONSTRAINT presence_saisi_par_fkey FOREIGN KEY (saisi_par) REFERENCES tenant_ispm.utilisateur(id);


--
-- TOC entry 6174 (class 2606 OID 57118)
-- Name: presence presence_seance_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.presence
    ADD CONSTRAINT presence_seance_id_fkey FOREIGN KEY (seance_id) REFERENCES tenant_ispm.emploi_du_temps(id) ON DELETE CASCADE;


--
-- TOC entry 6175 (class 2606 OID 57128)
-- Name: presence presence_valide_par_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.presence
    ADD CONSTRAINT presence_valide_par_fkey FOREIGN KEY (valide_par) REFERENCES tenant_ispm.utilisateur(id);


--
-- TOC entry 6237 (class 2606 OID 58095)
-- Name: proces_verbal proces_verbal_annee_academique_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.proces_verbal
    ADD CONSTRAINT proces_verbal_annee_academique_id_fkey FOREIGN KEY (annee_academique_id) REFERENCES tenant_ispm.annee_academique(id);


--
-- TOC entry 6238 (class 2606 OID 58090)
-- Name: proces_verbal proces_verbal_parcours_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.proces_verbal
    ADD CONSTRAINT proces_verbal_parcours_id_fkey FOREIGN KEY (parcours_id) REFERENCES tenant_ispm.parcours(id) ON DELETE CASCADE;


--
-- TOC entry 6239 (class 2606 OID 58100)
-- Name: proces_verbal proces_verbal_redige_par_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.proces_verbal
    ADD CONSTRAINT proces_verbal_redige_par_fkey FOREIGN KEY (redige_par) REFERENCES tenant_ispm.utilisateur(id);


--
-- TOC entry 6240 (class 2606 OID 58105)
-- Name: proces_verbal proces_verbal_valide_par_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.proces_verbal
    ADD CONSTRAINT proces_verbal_valide_par_fkey FOREIGN KEY (valide_par) REFERENCES tenant_ispm.utilisateur(id) ON DELETE SET NULL;


--
-- TOC entry 6186 (class 2606 OID 57269)
-- Name: pv_deliberation pv_deliberation_parcours_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.pv_deliberation
    ADD CONSTRAINT pv_deliberation_parcours_id_fkey FOREIGN KEY (parcours_id) REFERENCES tenant_ispm.parcours(id);


--
-- TOC entry 6187 (class 2606 OID 57274)
-- Name: pv_deliberation pv_deliberation_president_jury_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.pv_deliberation
    ADD CONSTRAINT pv_deliberation_president_jury_fkey FOREIGN KEY (president_jury) REFERENCES tenant_ispm.utilisateur(id);


--
-- TOC entry 6188 (class 2606 OID 57264)
-- Name: pv_deliberation pv_deliberation_session_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.pv_deliberation
    ADD CONSTRAINT pv_deliberation_session_id_fkey FOREIGN KEY (session_id) REFERENCES tenant_ispm.session_examen(id);


--
-- TOC entry 6221 (class 2606 OID 57752)
-- Name: rapport_entretien rapport_entretien_planning_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.rapport_entretien
    ADD CONSTRAINT rapport_entretien_planning_id_fkey FOREIGN KEY (planning_id) REFERENCES tenant_ispm.planning_entretien(id);


--
-- TOC entry 6222 (class 2606 OID 57757)
-- Name: rapport_entretien rapport_entretien_realise_par_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.rapport_entretien
    ADD CONSTRAINT rapport_entretien_realise_par_fkey FOREIGN KEY (realise_par) REFERENCES tenant_ispm.utilisateur(id);


--
-- TOC entry 6245 (class 2606 OID 58188)
-- Name: rattrapage rattrapage_absence_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.rattrapage
    ADD CONSTRAINT rattrapage_absence_id_fkey FOREIGN KEY (absence_id) REFERENCES tenant_ispm.absence_enseignant(id) ON DELETE CASCADE;


--
-- TOC entry 6246 (class 2606 OID 58203)
-- Name: rattrapage rattrapage_planifie_par_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.rattrapage
    ADD CONSTRAINT rattrapage_planifie_par_fkey FOREIGN KEY (planifie_par) REFERENCES tenant_ispm.utilisateur(id);


--
-- TOC entry 6247 (class 2606 OID 58198)
-- Name: rattrapage rattrapage_remplaceur_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.rattrapage
    ADD CONSTRAINT rattrapage_remplaceur_id_fkey FOREIGN KEY (remplaceur_id) REFERENCES tenant_ispm.utilisateur(id) ON DELETE SET NULL;


--
-- TOC entry 6248 (class 2606 OID 58193)
-- Name: rattrapage rattrapage_salle_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.rattrapage
    ADD CONSTRAINT rattrapage_salle_id_fkey FOREIGN KEY (salle_id) REFERENCES tenant_ispm.salle(id) ON DELETE SET NULL;


--
-- TOC entry 6320 (class 2606 OID 84964)
-- Name: recrutement recrutement_departement_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.recrutement
    ADD CONSTRAINT recrutement_departement_id_fkey FOREIGN KEY (departement_id) REFERENCES tenant_ispm.departement(id);


--
-- TOC entry 6321 (class 2606 OID 84969)
-- Name: recrutement recrutement_responsable_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.recrutement
    ADD CONSTRAINT recrutement_responsable_id_fkey FOREIGN KEY (responsable_id) REFERENCES tenant_ispm.utilisateur(id);


--
-- TOC entry 6229 (class 2606 OID 58003)
-- Name: referentiel_competences referentiel_competences_parcours_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.referentiel_competences
    ADD CONSTRAINT referentiel_competences_parcours_id_fkey FOREIGN KEY (parcours_id) REFERENCES tenant_ispm.parcours(id) ON DELETE CASCADE;


--
-- TOC entry 6230 (class 2606 OID 58008)
-- Name: referentiel_competences referentiel_competences_valide_par_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.referentiel_competences
    ADD CONSTRAINT referentiel_competences_valide_par_fkey FOREIGN KEY (valide_par) REFERENCES tenant_ispm.utilisateur(id) ON DELETE SET NULL;


--
-- TOC entry 6213 (class 2606 OID 57661)
-- Name: reservation_salle reservation_salle_approuve_par_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.reservation_salle
    ADD CONSTRAINT reservation_salle_approuve_par_fkey FOREIGN KEY (approuve_par) REFERENCES tenant_ispm.utilisateur(id);


--
-- TOC entry 6214 (class 2606 OID 57656)
-- Name: reservation_salle reservation_salle_demande_par_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.reservation_salle
    ADD CONSTRAINT reservation_salle_demande_par_fkey FOREIGN KEY (demande_par) REFERENCES tenant_ispm.utilisateur(id);


--
-- TOC entry 6215 (class 2606 OID 57651)
-- Name: reservation_salle reservation_salle_salle_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.reservation_salle
    ADD CONSTRAINT reservation_salle_salle_id_fkey FOREIGN KEY (salle_id) REFERENCES tenant_ispm.salle(id);


--
-- TOC entry 6189 (class 2606 OID 57301)
-- Name: resultat_deliberation resultat_deliberation_etudiant_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.resultat_deliberation
    ADD CONSTRAINT resultat_deliberation_etudiant_id_fkey FOREIGN KEY (etudiant_id) REFERENCES tenant_ispm.etudiant(id);


--
-- TOC entry 6190 (class 2606 OID 57296)
-- Name: resultat_deliberation resultat_deliberation_pv_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.resultat_deliberation
    ADD CONSTRAINT resultat_deliberation_pv_id_fkey FOREIGN KEY (pv_id) REFERENCES tenant_ispm.pv_deliberation(id);


--
-- TOC entry 6270 (class 2606 OID 62038)
-- Name: resultat_semestre resultat_semestre_deliberation_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.resultat_semestre
    ADD CONSTRAINT resultat_semestre_deliberation_id_fkey FOREIGN KEY (deliberation_id) REFERENCES tenant_ispm.deliberation(id);


--
-- TOC entry 6271 (class 2606 OID 62028)
-- Name: resultat_semestre resultat_semestre_etudiant_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.resultat_semestre
    ADD CONSTRAINT resultat_semestre_etudiant_id_fkey FOREIGN KEY (etudiant_id) REFERENCES tenant_ispm.etudiant(id) ON DELETE RESTRICT;


--
-- TOC entry 6272 (class 2606 OID 62033)
-- Name: resultat_semestre resultat_semestre_inscription_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.resultat_semestre
    ADD CONSTRAINT resultat_semestre_inscription_id_fkey FOREIGN KEY (inscription_id) REFERENCES tenant_ispm.inscription(id) ON DELETE RESTRICT;


--
-- TOC entry 6273 (class 2606 OID 62076)
-- Name: resultat_ue resultat_ue_compensation_ue_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.resultat_ue
    ADD CONSTRAINT resultat_ue_compensation_ue_id_fkey FOREIGN KEY (compensation_ue_id) REFERENCES tenant_ispm.unite_enseignement(id);


--
-- TOC entry 6274 (class 2606 OID 62061)
-- Name: resultat_ue resultat_ue_etudiant_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.resultat_ue
    ADD CONSTRAINT resultat_ue_etudiant_id_fkey FOREIGN KEY (etudiant_id) REFERENCES tenant_ispm.etudiant(id) ON DELETE RESTRICT;


--
-- TOC entry 6275 (class 2606 OID 62071)
-- Name: resultat_ue resultat_ue_resultat_semestre_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.resultat_ue
    ADD CONSTRAINT resultat_ue_resultat_semestre_id_fkey FOREIGN KEY (resultat_semestre_id) REFERENCES tenant_ispm.resultat_semestre(id) ON DELETE RESTRICT;


--
-- TOC entry 6276 (class 2606 OID 62066)
-- Name: resultat_ue resultat_ue_ue_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.resultat_ue
    ADD CONSTRAINT resultat_ue_ue_id_fkey FOREIGN KEY (ue_id) REFERENCES tenant_ispm.unite_enseignement(id) ON DELETE RESTRICT;


--
-- TOC entry 6168 (class 2606 OID 57050)
-- Name: salle salle_batiment_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.salle
    ADD CONSTRAINT salle_batiment_id_fkey FOREIGN KEY (batiment_id) REFERENCES tenant_ispm.batiment(id) ON DELETE SET NULL;


--
-- TOC entry 6179 (class 2606 OID 57184)
-- Name: session_examen session_examen_annee_academique_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.session_examen
    ADD CONSTRAINT session_examen_annee_academique_id_fkey FOREIGN KEY (annee_academique_id) REFERENCES tenant_ispm.annee_academique(id);


--
-- TOC entry 6146 (class 2606 OID 56720)
-- Name: session_jwt session_jwt_utilisateur_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.session_jwt
    ADD CONSTRAINT session_jwt_utilisateur_id_fkey FOREIGN KEY (utilisateur_id) REFERENCES tenant_ispm.utilisateur(id) ON DELETE CASCADE;


--
-- TOC entry 6302 (class 2606 OID 83599)
-- Name: soutenance soutenance_president_jury_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.soutenance
    ADD CONSTRAINT soutenance_president_jury_id_fkey FOREIGN KEY (president_jury_id) REFERENCES tenant_ispm.utilisateur(id) ON DELETE SET NULL;


--
-- TOC entry 6303 (class 2606 OID 83594)
-- Name: soutenance soutenance_salle_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.soutenance
    ADD CONSTRAINT soutenance_salle_id_fkey FOREIGN KEY (salle_id) REFERENCES tenant_ispm.salle(id) ON DELETE SET NULL;


--
-- TOC entry 6304 (class 2606 OID 83589)
-- Name: soutenance soutenance_stage_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.soutenance
    ADD CONSTRAINT soutenance_stage_id_fkey FOREIGN KEY (stage_id) REFERENCES tenant_ispm.stage(id) ON DELETE CASCADE;


--
-- TOC entry 6295 (class 2606 OID 83523)
-- Name: stage stage_annee_academique_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.stage
    ADD CONSTRAINT stage_annee_academique_id_fkey FOREIGN KEY (annee_academique_id) REFERENCES tenant_ispm.annee_academique(id);


--
-- TOC entry 6296 (class 2606 OID 83528)
-- Name: stage stage_encadrant_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.stage
    ADD CONSTRAINT stage_encadrant_id_fkey FOREIGN KEY (encadrant_id) REFERENCES tenant_ispm.utilisateur(id) ON DELETE SET NULL;


--
-- TOC entry 6297 (class 2606 OID 83513)
-- Name: stage stage_etudiant_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.stage
    ADD CONSTRAINT stage_etudiant_id_fkey FOREIGN KEY (etudiant_id) REFERENCES tenant_ispm.etudiant(id) ON DELETE CASCADE;


--
-- TOC entry 6298 (class 2606 OID 83518)
-- Name: stage stage_parcours_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.stage
    ADD CONSTRAINT stage_parcours_id_fkey FOREIGN KEY (parcours_id) REFERENCES tenant_ispm.parcours(id) ON DELETE RESTRICT;


--
-- TOC entry 6299 (class 2606 OID 83533)
-- Name: stage stage_rapporteur_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.stage
    ADD CONSTRAINT stage_rapporteur_id_fkey FOREIGN KEY (rapporteur_id) REFERENCES tenant_ispm.utilisateur(id) ON DELETE SET NULL;


--
-- TOC entry 6231 (class 2606 OID 58038)
-- Name: sujet_examen sujet_examen_ec_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.sujet_examen
    ADD CONSTRAINT sujet_examen_ec_id_fkey FOREIGN KEY (ec_id) REFERENCES tenant_ispm.element_constitutif(id) ON DELETE SET NULL;


--
-- TOC entry 6232 (class 2606 OID 58043)
-- Name: sujet_examen sujet_examen_enseignant_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.sujet_examen
    ADD CONSTRAINT sujet_examen_enseignant_id_fkey FOREIGN KEY (enseignant_id) REFERENCES tenant_ispm.utilisateur(id);


--
-- TOC entry 6233 (class 2606 OID 58053)
-- Name: sujet_examen sujet_examen_relu_par_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.sujet_examen
    ADD CONSTRAINT sujet_examen_relu_par_fkey FOREIGN KEY (relu_par) REFERENCES tenant_ispm.utilisateur(id) ON DELETE SET NULL;


--
-- TOC entry 6234 (class 2606 OID 58048)
-- Name: sujet_examen sujet_examen_soumis_par_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.sujet_examen
    ADD CONSTRAINT sujet_examen_soumis_par_fkey FOREIGN KEY (soumis_par) REFERENCES tenant_ispm.utilisateur(id);


--
-- TOC entry 6235 (class 2606 OID 58033)
-- Name: sujet_examen sujet_examen_ue_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.sujet_examen
    ADD CONSTRAINT sujet_examen_ue_id_fkey FOREIGN KEY (ue_id) REFERENCES tenant_ispm.unite_enseignement(id) ON DELETE SET NULL;


--
-- TOC entry 6236 (class 2606 OID 58058)
-- Name: sujet_examen sujet_examen_valide_par_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.sujet_examen
    ADD CONSTRAINT sujet_examen_valide_par_fkey FOREIGN KEY (valide_par) REFERENCES tenant_ispm.utilisateur(id) ON DELETE SET NULL;


--
-- TOC entry 6281 (class 2606 OID 62144)
-- Name: suplement_diplome suplement_diplome_certifie_par_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.suplement_diplome
    ADD CONSTRAINT suplement_diplome_certifie_par_fkey FOREIGN KEY (certifie_par) REFERENCES tenant_ispm.utilisateur(id);


--
-- TOC entry 6282 (class 2606 OID 62139)
-- Name: suplement_diplome suplement_diplome_diplome_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.suplement_diplome
    ADD CONSTRAINT suplement_diplome_diplome_id_fkey FOREIGN KEY (diplome_id) REFERENCES tenant_ispm.diplome(id) ON DELETE RESTRICT;


--
-- TOC entry 6293 (class 2606 OID 83483)
-- Name: support_cours support_cours_auteur_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.support_cours
    ADD CONSTRAINT support_cours_auteur_id_fkey FOREIGN KEY (auteur_id) REFERENCES tenant_ispm.utilisateur(id) ON DELETE CASCADE;


--
-- TOC entry 6294 (class 2606 OID 83478)
-- Name: support_cours support_cours_ec_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.support_cours
    ADD CONSTRAINT support_cours_ec_id_fkey FOREIGN KEY (ec_id) REFERENCES tenant_ispm.element_constitutif(id) ON DELETE CASCADE;


--
-- TOC entry 6209 (class 2606 OID 57627)
-- Name: ticket_maintenance ticket_maintenance_assigne_a_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.ticket_maintenance
    ADD CONSTRAINT ticket_maintenance_assigne_a_fkey FOREIGN KEY (assigne_a) REFERENCES tenant_ispm.utilisateur(id);


--
-- TOC entry 6210 (class 2606 OID 57612)
-- Name: ticket_maintenance ticket_maintenance_batiment_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.ticket_maintenance
    ADD CONSTRAINT ticket_maintenance_batiment_id_fkey FOREIGN KEY (batiment_id) REFERENCES tenant_ispm.batiment(id);


--
-- TOC entry 6211 (class 2606 OID 57617)
-- Name: ticket_maintenance ticket_maintenance_salle_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.ticket_maintenance
    ADD CONSTRAINT ticket_maintenance_salle_id_fkey FOREIGN KEY (salle_id) REFERENCES tenant_ispm.salle(id);


--
-- TOC entry 6212 (class 2606 OID 57622)
-- Name: ticket_maintenance ticket_maintenance_signale_par_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.ticket_maintenance
    ADD CONSTRAINT ticket_maintenance_signale_par_fkey FOREIGN KEY (signale_par) REFERENCES tenant_ispm.utilisateur(id);


--
-- TOC entry 6283 (class 2606 OID 62168)
-- Name: transfert_etudiant transfert_etudiant_etudiant_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.transfert_etudiant
    ADD CONSTRAINT transfert_etudiant_etudiant_id_fkey FOREIGN KEY (etudiant_id) REFERENCES tenant_ispm.etudiant(id) ON DELETE RESTRICT;


--
-- TOC entry 6284 (class 2606 OID 62173)
-- Name: transfert_etudiant transfert_etudiant_parcours_destination_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.transfert_etudiant
    ADD CONSTRAINT transfert_etudiant_parcours_destination_id_fkey FOREIGN KEY (parcours_destination_id) REFERENCES tenant_ispm.parcours(id) ON DELETE RESTRICT;


--
-- TOC entry 6285 (class 2606 OID 62178)
-- Name: transfert_etudiant transfert_etudiant_valide_par_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.transfert_etudiant
    ADD CONSTRAINT transfert_etudiant_valide_par_fkey FOREIGN KEY (valide_par) REFERENCES tenant_ispm.utilisateur(id);


--
-- TOC entry 6151 (class 2606 OID 83883)
-- Name: unite_enseignement unite_enseignement_enseignant_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.unite_enseignement
    ADD CONSTRAINT unite_enseignement_enseignant_id_fkey FOREIGN KEY (enseignant_id) REFERENCES tenant_ispm.enseignant(id) ON DELETE SET NULL;


--
-- TOC entry 6152 (class 2606 OID 56817)
-- Name: unite_enseignement unite_enseignement_parcours_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.unite_enseignement
    ADD CONSTRAINT unite_enseignement_parcours_id_fkey FOREIGN KEY (parcours_id) REFERENCES tenant_ispm.parcours(id) ON DELETE RESTRICT;


--
-- TOC entry 6288 (class 2606 OID 62256)
-- Name: verrouillage_notes verrouillage_notes_autorise_par_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.verrouillage_notes
    ADD CONSTRAINT verrouillage_notes_autorise_par_fkey FOREIGN KEY (autorise_par) REFERENCES tenant_ispm.utilisateur(id);


--
-- TOC entry 6289 (class 2606 OID 62236)
-- Name: verrouillage_notes verrouillage_notes_deliberation_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.verrouillage_notes
    ADD CONSTRAINT verrouillage_notes_deliberation_id_fkey FOREIGN KEY (deliberation_id) REFERENCES tenant_ispm.deliberation(id) ON DELETE RESTRICT;


--
-- TOC entry 6290 (class 2606 OID 62241)
-- Name: verrouillage_notes verrouillage_notes_etudiant_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.verrouillage_notes
    ADD CONSTRAINT verrouillage_notes_etudiant_id_fkey FOREIGN KEY (etudiant_id) REFERENCES tenant_ispm.etudiant(id) ON DELETE RESTRICT;


--
-- TOC entry 6291 (class 2606 OID 62246)
-- Name: verrouillage_notes verrouillage_notes_session_examen_id_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.verrouillage_notes
    ADD CONSTRAINT verrouillage_notes_session_examen_id_fkey FOREIGN KEY (session_examen_id) REFERENCES tenant_ispm.session_examen(id);


--
-- TOC entry 6292 (class 2606 OID 62251)
-- Name: verrouillage_notes verrouillage_notes_verrouille_par_fkey; Type: FK CONSTRAINT; Schema: tenant_ispm; Owner: postgres
--

ALTER TABLE ONLY tenant_ispm.verrouillage_notes
    ADD CONSTRAINT verrouillage_notes_verrouille_par_fkey FOREIGN KEY (verrouille_par) REFERENCES tenant_ispm.utilisateur(id);


-- Completed on 2026-05-19 07:09:56

--
-- PostgreSQL database dump complete
--

\unrestrict CiAJsyKo5DVY5Xk0fS3cbeZedVFYPWycyUHzm5xJjHldkzeEfcZCNdgBdIbWgM7

