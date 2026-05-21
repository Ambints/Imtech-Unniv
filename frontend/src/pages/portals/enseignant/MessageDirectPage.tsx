import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore';
import { api } from '../../../api/client';
import toast from 'react-hot-toast';
import { Send, ArrowLeft, User, Search, Mail } from 'lucide-react';

interface Etudiant {
  id: string;
  nom: string;
  prenom: string;
  matricule: string;
  email: string;
  parcours: string;
  niveau: string;
}

export const MessageDirectPage: React.FC = () => {
  const navigate = useNavigate();
  const { tenant } = useAuthStore();
  const [etudiants, setEtudiants] = useState<Etudiant[]>([]);
  const [selectedEtudiant, setSelectedEtudiant] = useState<Etudiant | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sujet, setSujet] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadEtudiants();
  }, []);

  const loadEtudiants = async () => {
    try {
      const { data } = await api.get('/portail/enseignant/tous-etudiants');
      setEtudiants(data);
    } catch (error) {
      console.error('Erreur chargement étudiants:', error);
      toast.error('Impossible de charger la liste des étudiants');
    }
  };

  const handleSend = async () => {
    if (!selectedEtudiant || !sujet || !message) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    try {
      await api.post('/portail/enseignant/envoyer-message-direct', {
        etudiant_id: selectedEtudiant.id,
        sujet,
        message,
        type: 'direct'
      });
      toast.success('Message envoyé avec succès !');
      setSujet('');
      setMessage('');
      setSelectedEtudiant(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'envoi');
    } finally {
      setLoading(false);
    }
  };

  const filteredEtudiants = etudiants.filter(e =>
    e.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.matricule.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          Message Direct
        </h1>
        <p className="text-muted mb-0">Envoyer un message à un étudiant spécifique</p>
      </div>

      <div className="row g-4">
        {/* Liste des étudiants */}
        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
            <div className="card-body p-4">
              <h6 className="fw-bold mb-3">Sélectionner un étudiant</h6>
              
              <div className="mb-3">
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <Search size={18} color="#64748b" />
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0"
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                {filteredEtudiants.map((etudiant) => (
                  <div
                    key={etudiant.id}
                    onClick={() => setSelectedEtudiant(etudiant)}
                    className="p-3 mb-2"
                    style={{
                      background: selectedEtudiant?.id === etudiant.id ? 'rgba(59, 130, 246, 0.1)' : '#f8fafc',
                      borderRadius: 8,
                      cursor: 'pointer',
                      border: selectedEtudiant?.id === etudiant.id ? '2px solid #3b82f6' : '1px solid #e5e7eb'
                    }}
                  >
                    <div className="d-flex align-items-center gap-2">
                      <div
                        className="d-flex align-items-center justify-content-center"
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                          color: '#fff',
                          fontSize: 12,
                          fontWeight: 600
                        }}
                      >
                        {etudiant.nom[0]}{etudiant.prenom[0]}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>
                          {etudiant.nom} {etudiant.prenom}
                        </div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>
                          {etudiant.matricule} • {etudiant.parcours}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Formulaire de message */}
        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
            <div className="card-body p-4">
              <h6 className="fw-bold mb-4">Composer le message</h6>

              {selectedEtudiant ? (
                <>
                  <div className="alert alert-info mb-4">
                    <User size={18} className="me-2" />
                    Destinataire : <strong>{selectedEtudiant.nom} {selectedEtudiant.prenom}</strong> ({selectedEtudiant.email})
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
                  </div>

                  <div className="d-flex justify-content-end gap-2">
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => {
                        setSujet('');
                        setMessage('');
                        setSelectedEtudiant(null);
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
                          Envoi...
                        </>
                      ) : (
                        <>
                          <Send size={16} className="me-2" />
                          Envoyer
                        </>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-5 text-muted">
                  <User size={48} style={{ opacity: 0.3 }} className="mb-3" />
                  <p>Sélectionnez un étudiant pour commencer</p>
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
