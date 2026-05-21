import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore';
import { api } from '../../../api/client';
import toast from 'react-hot-toast';
import { Send, ArrowLeft, Users, Mail } from 'lucide-react';

interface Classe {
  id: string;
  nom: string;
  code: string;
  parcours: string;
  niveau: string;
  nombre_etudiants: number;
}

export const MessageClassePage: React.FC = () => {
  const navigate = useNavigate();
  const { tenant } = useAuthStore();
  const [classes, setClasses] = useState<Classe[]>([]);
  const [selectedClasse, setSelectedClasse] = useState<Classe | null>(null);
  const [sujet, setSujet] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      const { data } = await api.get('/portail/enseignant/mes-classes');
      setClasses(data);
    } catch (error) {
      console.error('Erreur chargement classes:', error);
      toast.error('Impossible de charger la liste des classes');
    }
  };

  const handleSend = async () => {
    if (!selectedClasse || !sujet || !message) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    try {
      await api.post('/portail/enseignant/envoyer-message-classe', {
        classe_id: selectedClasse.id,
        sujet,
        message,
        type: 'classe'
      });
      toast.success(`Message envoyé à ${selectedClasse.nombre_etudiants} étudiant(s) !`);
      setSujet('');
      setMessage('');
      setSelectedClasse(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'envoi');
    } finally {
      setLoading(false);
    }
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
          Message à une Classe
        </h1>
        <p className="text-muted mb-0">Envoyer un message à tous les étudiants d'une classe</p>
      </div>

      <div className="row g-4">
        {/* Liste des classes */}
        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
            <div className="card-body p-4">
              <h6 className="fw-bold mb-3">Sélectionner une classe</h6>
              
              <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                {classes.length === 0 ? (
                  <div className="text-center py-4 text-muted">
                    <Users size={48} style={{ opacity: 0.3 }} className="mb-3" />
                    <p>Aucune classe disponible</p>
                  </div>
                ) : (
                  classes.map((classe) => (
                    <div
                      key={classe.id}
                      onClick={() => setSelectedClasse(classe)}
                      className="p-3 mb-3"
                      style={{
                        background: selectedClasse?.id === classe.id ? 'rgba(59, 130, 246, 0.1)' : '#f8fafc',
                        borderRadius: 8,
                        cursor: 'pointer',
                        border: selectedClasse?.id === classe.id ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div className="d-flex align-items-start gap-3">
                        <div
                          className="d-flex align-items-center justify-content-center"
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: 8,
                            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                            color: '#fff',
                            fontSize: 14,
                            fontWeight: 600
                          }}
                        >
                          <Users size={24} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', marginBottom: 4 }}>
                            {classe.nom}
                          </div>
                          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 2 }}>
                            Code: {classe.code}
                          </div>
                          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 2 }}>
                            {classe.parcours} - {classe.niveau}
                          </div>
                          <div
                            className="badge"
                            style={{
                              background: 'rgba(34, 197, 94, 0.1)',
                              color: '#16a34a',
                              fontSize: 11,
                              fontWeight: 600
                            }}
                          >
                            {classe.nombre_etudiants} étudiant{classe.nombre_etudiants > 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Formulaire de message */}
        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
            <div className="card-body p-4">
              <h6 className="fw-bold mb-4">Composer le message</h6>

              {selectedClasse ? (
                <>
                  <div className="alert alert-info mb-4">
                    <Users size={18} className="me-2" />
                    Destinataires : <strong>{selectedClasse.nom}</strong> ({selectedClasse.nombre_etudiants} étudiant{selectedClasse.nombre_etudiants > 1 ? 's' : ''})
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
                      Ce message sera envoyé à tous les étudiants de la classe sélectionnée
                    </small>
                  </div>

                  <div className="d-flex justify-content-end gap-2">
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => {
                        setSujet('');
                        setMessage('');
                        setSelectedClasse(null);
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
                          Envoyer à {selectedClasse.nombre_etudiants} étudiant{selectedClasse.nombre_etudiants > 1 ? 's' : ''}
                        </>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-5 text-muted">
                  <Users size={48} style={{ opacity: 0.3 }} className="mb-3" />
                  <p>Sélectionnez une classe pour commencer</p>
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
