import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export const ParentAutorisations: React.FC = () => {
  const navigate = useNavigate();
  const [enfants, setEnfants] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    etudiantId: '',
    type: 'sortie_anticipee',
    dateDebut: '',
    dateFin: '',
    heureDebut: '',
    heureFin: '',
    motif: '',
    justificatifUrl: '',
    commentaire: ''
  });

  useEffect(() => {
    loadEnfants();
  }, []);

  const loadEnfants = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/v1/portail/parent/enfants');
      setEnfants(response.data);
      if (response.data.length > 0) {
        setForm(prev => ({ ...prev, etudiantId: response.data[0].id }));
      }
    } catch (err) {
      console.error('Erreur chargement enfants:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await axios.post('/api/v1/portail/parent/autorisations/sortie', form);
      alert('Autorisation soumise avec succès ! Elle sera traitée par le surveillant général.');
      setForm({
        etudiantId: enfants[0]?.id || '',
        type: 'sortie_anticipee',
        dateDebut: '',
        dateFin: '',
        heureDebut: '',
        heureFin: '',
        motif: '',
        justificatifUrl: '',
        commentaire: ''
      });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors de la soumission');
    } finally {
      setSubmitting(false);
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'sortie_anticipee': 'Sortie Anticipée',
      'absence_prevue': 'Absence Prévisionnelle',
      'sortie_exceptionnelle': 'Sortie Exceptionnelle',
      'dispense_cours': 'Dispense de Cours'
    };
    return labels[type] || type;
  };

  const getTypeDescription = (type: string) => {
    const descriptions: Record<string, string> = {
      'sortie_anticipee': 'Autoriser votre enfant à quitter l\'établissement avant la fin des cours',
      'absence_prevue': 'Informer d\'une absence planifiée (rendez-vous médical, événement familial, etc.)',
      'sortie_exceptionnelle': 'Autorisation ponctuelle pour une sortie exceptionnelle',
      'dispense_cours': 'Demander une dispense pour un cours spécifique'
    };
    return descriptions[type] || '';
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col-12">
          <button className="btn btn-outline-secondary mb-3" onClick={() => navigate(-1)}>
            <i className="bi bi-arrow-left me-2"></i>
            Retour au tableau de bord
          </button>
          <h3>
            <i className="bi bi-door-open me-2"></i>
            Autorisations de Sortie / Absence
          </h3>
          <p className="text-muted">
            Soumettez une demande d'autorisation pour votre enfant
          </p>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-8">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">
                <i className="bi bi-file-earmark-text me-2"></i>
                Nouvelle Autorisation
              </h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="alert alert-info">
                  <i className="bi bi-info-circle me-2"></i>
                  Votre demande sera examinée par le surveillant général. Vous recevrez une notification une fois traitée.
                </div>

                <div className="mb-4">
                  <label className="form-label">Enfant concerné *</label>
                  <select
                    className="form-select"
                    value={form.etudiantId}
                    onChange={(e) => setForm({ ...form, etudiantId: e.target.value })}
                    required
                  >
                    {enfants.map(enfant => (
                      <option key={enfant.id} value={enfant.id}>
                        {enfant.prenom} {enfant.nom} - {enfant.parcours} (Niveau {enfant.annee_niveau})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="form-label">Type d'autorisation *</label>
                  <select
                    className="form-select"
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    required
                  >
                    <option value="sortie_anticipee">Sortie Anticipée</option>
                    <option value="absence_prevue">Absence Prévisionnelle</option>
                    <option value="sortie_exceptionnelle">Sortie Exceptionnelle</option>
                    <option value="dispense_cours">Dispense de Cours</option>
                  </select>
                  <small className="text-muted">{getTypeDescription(form.type)}</small>
                </div>

                <div className="row mb-4">
                  <div className="col-md-6">
                    <label className="form-label">Date de début *</label>
                    <input
                      type="date"
                      className="form-control"
                      value={form.dateDebut}
                      onChange={(e) => setForm({ ...form, dateDebut: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Date de fin *</label>
                    <input
                      type="date"
                      className="form-control"
                      value={form.dateFin}
                      onChange={(e) => setForm({ ...form, dateFin: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="row mb-4">
                  <div className="col-md-6">
                    <label className="form-label">Heure de début (optionnel)</label>
                    <input
                      type="time"
                      className="form-control"
                      value={form.heureDebut}
                      onChange={(e) => setForm({ ...form, heureDebut: e.target.value })}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Heure de fin (optionnel)</label>
                    <input
                      type="time"
                      className="form-control"
                      value={form.heureFin}
                      onChange={(e) => setForm({ ...form, heureFin: e.target.value })}
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label">Motif de l'autorisation *</label>
                  <textarea
                    className="form-control"
                    rows={4}
                    value={form.motif}
                    onChange={(e) => setForm({ ...form, motif: e.target.value })}
                    required
                    placeholder="Expliquez la raison de cette demande d'autorisation..."
                  ></textarea>
                </div>

                <div className="mb-4">
                  <label className="form-label">Justificatif (URL)</label>
                  <input
                    type="url"
                    className="form-control"
                    value={form.justificatifUrl}
                    onChange={(e) => setForm({ ...form, justificatifUrl: e.target.value })}
                    placeholder="https://..."
                  />
                  <small className="text-muted">
                    Certificat médical, convocation, etc. (optionnel mais recommandé)
                  </small>
                </div>

                <div className="mb-4">
                  <label className="form-label">Commentaire additionnel</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={form.commentaire}
                    onChange={(e) => setForm({ ...form, commentaire: e.target.value })}
                    placeholder="Informations complémentaires..."
                  ></textarea>
                </div>

                <div className="d-grid gap-2">
                  <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-send me-2"></i>
                        Soumettre l'autorisation
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card shadow-sm mb-3">
            <div className="card-header bg-info text-white">
              <h6 className="mb-0">
                <i className="bi bi-info-circle me-2"></i>
                Informations Importantes
              </h6>
            </div>
            <div className="card-body">
              <h6>Délai de traitement</h6>
              <p className="small">Les demandes sont généralement traitées sous 24-48 heures.</p>

              <h6>Documents requis</h6>
              <ul className="small">
                <li>Certificat médical pour absence maladie</li>
                <li>Convocation pour rendez-vous officiel</li>
                <li>Justificatif pour événement familial</li>
              </ul>

              <h6>Contact</h6>
              <p className="small mb-0">
                Pour toute urgence, contactez le surveillant général directement via la messagerie.
              </p>
            </div>
          </div>

          <div className="card shadow-sm">
            <div className="card-header bg-warning text-dark">
              <h6 className="mb-0">
                <i className="bi bi-exclamation-triangle me-2"></i>
                Rappel
              </h6>
            </div>
            <div className="card-body">
              <p className="small mb-0">
                Les autorisations doivent être soumises <strong>au moins 24 heures à l'avance</strong> sauf cas d'urgence justifiée.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentAutorisations;

// Made with Bob
