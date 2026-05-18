import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Message {
  id: string;
  sujet: string;
  contenu: string;
  piece_jointe_url: string;
  lu: boolean;
  lu_at: string;
  created_at: string;
  parent_id: string;
  destinataire_nom: string;
  destinataire_prenom: string;
  destinataire_role: string;
  expediteur_nom: string;
  expediteur_prenom: string;
  etudiant_nom: string;
  etudiant_prenom: string;
}

export const ParentMessages: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [newMessageForm, setNewMessageForm] = useState({
    etudiantId: '',
    destinataireType: 'surveillant_general',
    sujet: '',
    message: '',
    pieceJointeUrl: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [enfants, setEnfants] = useState<any[]>([]);

  useEffect(() => {
    loadEnfants();
    loadMessages();
  }, []);

  const loadEnfants = async () => {
    try {
      const response = await axios.get('/api/v1/portail/parent/enfants');
      setEnfants(response.data);
      if (response.data.length > 0) {
        setNewMessageForm(prev => ({ ...prev, etudiantId: response.data[0].id }));
      }
    } catch (err) {
      console.error('Erreur chargement enfants:', err);
    }
  };

  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/v1/portail/parent/messages');
      setMessages(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await axios.post('/api/v1/portail/parent/messages', newMessageForm);
      alert('Message envoyé avec succès !');
      setShowNewMessageModal(false);
      setNewMessageForm({
        etudiantId: enfants[0]?.id || '',
        destinataireType: 'surveillant_general',
        sujet: '',
        message: '',
        pieceJointeUrl: ''
      });
      loadMessages();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors de l\'envoi du message');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDestinataireLabel = (type: string) => {
    const labels: Record<string, string> = {
      'surveillant_general': 'Surveillant Général',
      'secretariat': 'Secrétariat',
      'scolarite': 'Service Scolarité',
      'direction': 'Direction',
      'enseignant': 'Enseignant',
      'caissier': 'Caissier'
    };
    return labels[type] || type;
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
            Retour
          </button>
          <div className="d-flex justify-content-between align-items-center">
            <h3>
              <i className="bi bi-chat-dots me-2"></i>
              Messagerie
            </h3>
            <button className="btn btn-primary" onClick={() => setShowNewMessageModal(true)}>
              <i className="bi bi-plus-circle me-2"></i>
              Nouveau message
            </button>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <h6 className="mb-0">Messages ({messages.length})</h6>
            </div>
            <div className="list-group list-group-flush" style={{ maxHeight: '600px', overflowY: 'auto' }}>
              {messages.map((msg) => (
                <button
                  key={msg.id}
                  className={`list-group-item list-group-item-action ${selectedMessage?.id === msg.id ? 'active' : ''} ${!msg.lu ? 'fw-bold' : ''}`}
                  onClick={() => setSelectedMessage(msg)}
                >
                  <div className="d-flex w-100 justify-content-between">
                    <h6 className="mb-1">{msg.sujet}</h6>
                    {!msg.lu && <span className="badge bg-primary">Nouveau</span>}
                  </div>
                  <p className="mb-1 small">{msg.destinataire_prenom} {msg.destinataire_nom}</p>
                  <small>{formatDate(msg.created_at)}</small>
                </button>
              ))}
              {messages.length === 0 && (
                <div className="text-center py-4">
                  <i className="bi bi-inbox text-muted" style={{ fontSize: '2rem' }}></i>
                  <p className="text-muted mt-2">Aucun message</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-8">
          {selectedMessage ? (
            <div className="card shadow-sm">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">{selectedMessage.sujet}</h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <strong>De:</strong> {selectedMessage.expediteur_prenom} {selectedMessage.expediteur_nom}<br />
                  <strong>À:</strong> {selectedMessage.destinataire_prenom} {selectedMessage.destinataire_nom} ({getDestinataireLabel(selectedMessage.destinataire_role)})<br />
                  <strong>Date:</strong> {formatDate(selectedMessage.created_at)}<br />
                  {selectedMessage.etudiant_nom && (
                    <><strong>Concernant:</strong> {selectedMessage.etudiant_prenom} {selectedMessage.etudiant_nom}<br /></>
                  )}
                </div>
                <hr />
                <div className="message-content" style={{ whiteSpace: 'pre-wrap' }}>
                  {selectedMessage.contenu}
                </div>
                {selectedMessage.piece_jointe_url && (
                  <div className="mt-3">
                    <a href={selectedMessage.piece_jointe_url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary">
                      <i className="bi bi-paperclip me-1"></i>
                      Pièce jointe
                    </a>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="card shadow-sm">
              <div className="card-body text-center py-5">
                <i className="bi bi-envelope-open text-muted" style={{ fontSize: '4rem' }}></i>
                <p className="text-muted mt-3">Sélectionnez un message pour le lire</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal nouveau message */}
      {showNewMessageModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-envelope me-2"></i>
                  Nouveau Message
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowNewMessageModal(false)}></button>
              </div>
              <form onSubmit={handleSendMessage}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Concernant l'enfant *</label>
                      <select
                        className="form-select"
                        value={newMessageForm.etudiantId}
                        onChange={(e) => setNewMessageForm({ ...newMessageForm, etudiantId: e.target.value })}
                        required
                      >
                        {enfants.map(enfant => (
                          <option key={enfant.id} value={enfant.id}>
                            {enfant.prenom} {enfant.nom}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Destinataire *</label>
                      <select
                        className="form-select"
                        value={newMessageForm.destinataireType}
                        onChange={(e) => setNewMessageForm({ ...newMessageForm, destinataireType: e.target.value })}
                        required
                      >
                        <option value="surveillant_general">Surveillant Général</option>
                        <option value="secretariat">Secrétariat</option>
                        <option value="scolarite">Service Scolarité</option>
                        <option value="direction">Direction</option>
                        <option value="caissier">Caissier</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Sujet *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newMessageForm.sujet}
                      onChange={(e) => setNewMessageForm({ ...newMessageForm, sujet: e.target.value })}
                      required
                      placeholder="Objet du message"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Message *</label>
                    <textarea
                      className="form-control"
                      rows={6}
                      value={newMessageForm.message}
                      onChange={(e) => setNewMessageForm({ ...newMessageForm, message: e.target.value })}
                      required
                      placeholder="Votre message..."
                    ></textarea>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Pièce jointe (URL)</label>
                    <input
                      type="url"
                      className="form-control"
                      value={newMessageForm.pieceJointeUrl}
                      onChange={(e) => setNewMessageForm({ ...newMessageForm, pieceJointeUrl: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowNewMessageModal(false)}>
                    Annuler
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Envoi...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-send me-2"></i>
                        Envoyer
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentMessages;

// Made with Bob
