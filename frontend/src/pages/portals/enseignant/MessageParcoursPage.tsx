import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore';
import { api } from '../../../api/client';
import toast from 'react-hot-toast';
import { Send, ArrowLeft, Filter, Mail, Users } from 'lucide-react';

interface Parcours {
  id: string;
  nom: string;
  code: string;
}

interface Niveau {
  id: string;
  nom: string;
  code: string;
}

interface FiltreStats {
  nombre_etudiants: number;
  parcours_nom?: string;
  niveau_nom?: string;
}

export const MessageParcoursPage: React.FC = () => {
  const navigate = useNavigate();
  const { tenant } = useAuthStore();
  const [parcours, setParcours] = useState<Parcours[]>([]);
  const [niveaux, setNiveaux] = useState<Niveau[]>([]);
  const [selectedParcours, setSelectedParcours] = useState<string>('');
  const [selectedNiveau, setSelectedNiveau] = useState<string>('');
  const [stats, setStats] = useState<FiltreStats | null>(null);
  const [sujet, setSujet] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    loadParcours();
    loadNiveaux();
  }, []);

  useEffect(() => {
    if (selectedParcours || selectedNiveau) {
      loadStats();
    } else {
      setStats(null);
    }
  }, [selectedParcours, selectedNiveau]);

  const loadParcours = async () => {
    try {
      const { data } = await api.get('/portail/enseignant/parcours-disponibles');
      setParcours(data);
    } catch (error) {
      console.error('Erreur chargement parcours:', error);
      toast.error('Impossible de charger la liste des parcours');
    }
  };

  const loadNiveaux = async () => {
    try {
      const { data } = await api.get('/portail/enseignant/niveaux-disponibles');
      setNiveaux(data);
    } catch (error) {
      console.error('Erreur chargement niveaux:', error);
      toast.error('Impossible de charger la liste des niveaux');
    }
  };

  const loadStats = async () => {
    setLoadingStats(true);
    try {
      const { data } = await api.get('/portail/enseignant/stats-filtres', {
        params: {
          parcours_id: selectedParcours || undefined,
          niveau_id: selectedNiveau || undefined
        }
      });
      setStats(data);
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleSend = async () => {
    if (!selectedParcours && !selectedNiveau) {
      toast.error('Veuillez sélectionner au moins un filtre');
      return;
    }

    if (!sujet || !message) {
      toast.error('Veuillez remplir le sujet et le message');
      return;
    }

    if (!stats || stats.nombre_etudiants === 0) {
      toast.error('Aucun étudiant ne correspond aux filtres sélectionnés');
      return;
    }

    setLoading(true);
    try {
      await api.post('/portail/enseignant/envoyer-message-parcours', {
        parcours_id: selectedParcours || null,
        niveau_id: selectedNiveau || null,
        sujet,
        message,
        type: 'parcours'
      });
      toast.success(`Message envoyé à ${stats.nombre_etudiants} étudiant(s) !`);
      setSujet('');
      setMessage('');
      setSelectedParcours('');
      setSelectedNiveau('');
      setStats(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'envoi');
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setSelectedParcours('');
    setSelectedNiveau('');
    setStats(null);
  };

  return (
    <div className="container-fluid p-4">
      <div className="mb-4">
        <button
          onClick={() => navigate('/portail/enseignant/messagerie')}
          className="btn btn-outline-primary btn-sm mb-3"
        >
          <ArrowLeft size={16} className="me-2" />
          Retour à la messagerie
        </button>
        <h1 className="h3 fw-bold mb-2" style={{ color: '#1e293b' }}>
          <Mail size={28} className="me-2" />
          Message par Parcours/Niveau
        </h1>
        <p className="text-muted mb-0">Envoyer un message avec filtres avancés</p>
      </div>

      <div className="row g-4">
        {/* Filtres */}
        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
            <div className="card-body p-4">
              <h6 className="fw-bold mb-3">
                <Filter size={18} className="me-2" />
                Filtres de sélection
              </h6>

              <div className="mb-3">
                <label className="form-label fw-semibold">Parcours</label>
                <select
                  className="form-select"
                  value={selectedParcours}
                  onChange={(e) => setSelectedParcours(e.target.value)}
                >
                  <option value="">Tous les parcours</option>
                  {parcours.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nom} ({p.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Niveau</label>
                <select
                  className="form-select"
                  value={selectedNiveau}
                  onChange={(e) => setSelectedNiveau(e.target.value)}
                >
                  <option value="">Tous les niveaux</option>
                  {niveaux.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.nom} ({n.code})
                    </option>
                  ))}
                </select>
              </div>

              {(selectedParcours || selectedNiveau) && (
                <button
                  className="btn btn-outline-secondary btn-sm w-100"
                  onClick={resetFilters}
                >
                  Réinitialiser les filtres
                </button>
              )}

              {/* Statistiques */}
              {loadingStats ? (
                <div className="text-center py-4">
                  <div className="spinner-border spinner-border-sm text-primary" />
                  <p className="text-muted mt-2 mb-0" style={{ fontSize: 12 }}>
                    Calcul en cours...
                  </p>
                </div>
              ) : stats ? (
                <div className="mt-4 p-3" style={{ background: '#f0f9ff', borderRadius: 8 }}>
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <Users size={20} color="#0284c7" />
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#0c4a6e' }}>
                      Destinataires
                    </span>
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#0284c7', marginBottom: 8 }}>
                    {stats.nombre_etudiants}
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>
                    {stats.parcours_nom && <div>Parcours: {stats.parcours_nom}</div>}
                    {stats.niveau_nom && <div>Niveau: {stats.niveau_nom}</div>}
                    {!stats.parcours_nom && !stats.niveau_nom && <div>Tous les étudiants</div>}
                  </div>
                </div>
              ) : (
                <div className="mt-4 p-3 text-center" style={{ background: '#f8fafc', borderRadius: 8 }}>
                  <Filter size={32} style={{ opacity: 0.3 }} className="mb-2" />
                  <p className="text-muted mb-0" style={{ fontSize: 12 }}>
                    Sélectionnez des filtres pour voir le nombre de destinataires
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Formulaire de message */}
        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
            <div className="card-body p-4">
              <h6 className="fw-bold mb-4">Composer le message</h6>

              {stats && stats.nombre_etudiants > 0 ? (
                <>
                  <div className="alert alert-info mb-4">
                    <Users size={18} className="me-2" />
                    Ce message sera envoyé à <strong>{stats.nombre_etudiants} étudiant{stats.nombre_etudiants > 1 ? 's' : ''}</strong>
                    {stats.parcours_nom && ` du parcours ${stats.parcours_nom}`}
                    {stats.niveau_nom && ` en ${stats.niveau_nom}`}
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Sujet</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Objet du message"
                      value={sujet}
                      onChange={(e) => setSujet(e.target.value)}
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-semibold">Message</label>
                    <textarea
                      className="form-control"
                      rows={10}
                      placeholder="Écrivez votre message ici..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                    <small className="text-muted">
                      Ce message sera envoyé à tous les étudiants correspondant aux filtres sélectionnés
                    </small>
                  </div>

                  <div className="d-flex justify-content-end gap-2">
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => {
                        setSujet('');
                        setMessage('');
                      }}
                    >
                      Annuler
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={handleSend}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" />
                          Envoi en cours...
                        </>
                      ) : (
                        <>
                          <Send size={16} className="me-2" />
                          Envoyer à {stats.nombre_etudiants} étudiant{stats.nombre_etudiants > 1 ? 's' : ''}
                        </>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-5 text-muted">
                  <Filter size={48} style={{ opacity: 0.3 }} className="mb-3" />
                  <p>
                    {!selectedParcours && !selectedNiveau
                      ? 'Sélectionnez des filtres pour commencer'
                      : 'Aucun étudiant ne correspond aux filtres sélectionnés'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Made with Bob
