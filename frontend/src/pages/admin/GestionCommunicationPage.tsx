import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';

interface Annonce {
  id: string;
  titre: string;
  contenu: string;
  type_annonce: string;
  cible: string;
  publie: boolean;
  date_publication?: string;
  date_expiration?: string;
  auteur_nom?: string;
  created_at: string;
}

interface Message {
  id: string;
  expediteur_nom?: string;
  destinataire_nom?: string;
  sujet: string;
  contenu: string;
  lu: boolean;
  created_at: string;
}

interface Notification {
  total: number;
  lues: number;
  non_lues: number;
  type_notification: string;
  count_par_type: number;
}

const GestionCommunicationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'annonces' | 'messages' | 'notifications'>('annonces');
  
  // États pour les annonces
  const [annonces, setAnnonces] = useState<Annonce[]>([]);
  const [showAnnonceModal, setShowAnnonceModal] = useState(false);
  const [currentAnnonce, setCurrentAnnonce] = useState<Partial<Annonce>>({});
  
  // États pour les messages
  const [messagesRecus, setMessagesRecus] = useState<Message[]>([]);
  const [messagesEnvoyes, setMessagesEnvoyes] = useState<Message[]>([]);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageType, setMessageType] = useState<'recus' | 'envoyes'>('recus');
  const [newMessage, setNewMessage] = useState({ destinataireId: '', sujet: '', contenu: '' });
  
  // États pour les notifications
  const [statsNotifications, setStatsNotifications] = useState<Notification[]>([]);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationCiblee, setNotificationCiblee] = useState({
    titre: '',
    message: '',
    filieres: [] as string[],
    annees: [] as number[],
    niveaux: [] as string[]
  });

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
    loadUsers();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'annonces') {
        const response = await api.get('/communication/annonces/admin');
        setAnnonces(response.data);
      } else if (activeTab === 'messages') {
        const [recus, envoyes] = await Promise.all([
          api.get('/communication/messages/recus'),
          api.get('/communication/messages/envoyes')
        ]);
        setMessagesRecus(recus.data);
        setMessagesEnvoyes(envoyes.data);
      } else if (activeTab === 'notifications') {
        const response = await api.get('/communication/notifications/stats');
        setStatsNotifications(response.data);
      }
    } catch (error) {
      console.error('Erreur chargement données:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Erreur chargement utilisateurs:', error);
    }
  };

  // ========== GESTION DES ANNONCES ==========
  const handleCreateAnnonce = async () => {
    try {
      // Validation côté client
      if (!currentAnnonce.titre || currentAnnonce.titre.trim() === '') {
        alert('Le titre est requis');
        return;
      }

      if (!currentAnnonce.contenu || currentAnnonce.contenu.trim() === '') {
        alert('Le contenu est requis');
        return;
      }

      console.log('[FRONTEND] Sending annonce data:', currentAnnonce);
      
      const response = await api.post('/communication/annonces', currentAnnonce);
      
      console.log('[FRONTEND] Annonce created successfully:', response.data);
      setShowAnnonceModal(false);
      setCurrentAnnonce({});
      loadData();
      alert('Annonce créée avec succès');
    } catch (error: any) {
      // Log détaillé de l'erreur
      console.error('[FRONTEND] Error creating annonce:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data
        }
      });

      // Afficher un message d'erreur détaillé
      let errorMessage = 'Erreur lors de la création de l\'annonce';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      alert(`Erreur: ${errorMessage}\n\nConsultez la console (F12) pour plus de détails.`);
    }
  };

  const handlePublierAnnonce = async (id: string) => {
    try {
      await api.patch(`/communication/annonces/${id}/publier`);
      loadData();
      alert('Annonce publiée avec succès');
    } catch (error) {
      console.error('Erreur publication annonce:', error);
      alert('Erreur lors de la publication');
    }
  };

  const handleDepublierAnnonce = async (id: string) => {
    try {
      await api.patch(`/communication/annonces/${id}/depublier`);
      loadData();
      alert('Annonce dépubliée avec succès');
    } catch (error) {
      console.error('Erreur dépublication annonce:', error);
      alert('Erreur lors de la dépublication');
    }
  };

  const handleDeleteAnnonce = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) return;
    
    try {
      await api.delete(`/communication/annonces/${id}`);
      loadData();
      alert('Annonce supprimée avec succès');
    } catch (error) {
      console.error('Erreur suppression annonce:', error);
      alert('Erreur lors de la suppression');
    }
  };

  // ========== GESTION DES MESSAGES ==========
  const handleSendMessage = async () => {
    try {
      await api.post('/communication/messages', newMessage);
      setShowMessageModal(false);
      setNewMessage({ destinataireId: '', sujet: '', contenu: '' });
      loadData();
      alert('Message envoyé avec succès');
    } catch (error) {
      console.error('Erreur envoi message:', error);
      alert('Erreur lors de l\'envoi du message');
    }
  };

  const handleMarquerLu = async (id: string) => {
    try {
      await api.patch(`/communication/messages/${id}/lu`);
      loadData();
    } catch (error) {
      console.error('Erreur marquage message:', error);
    }
  };

  // ========== GESTION DES NOTIFICATIONS ==========
  const handleEnvoyerNotificationCiblee = async () => {
    try {
      const response = await api.post('/communication/notifications/envoyer', notificationCiblee);
      setShowNotificationModal(false);
      setNotificationCiblee({
        titre: '',
        message: '',
        filieres: [],
        annees: [],
        niveaux: []
      });
      alert(`Notification envoyée à ${response.data.envoyees} destinataires`);
      loadData();
    } catch (error) {
      console.error('Erreur envoi notification:', error);
      alert('Erreur lors de l\'envoi de la notification');
    }
  };

  // ========== RENDU DES ONGLETS ==========
  const renderAnnonces = () => (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5>Gestion des Annonces</h5>
        <button 
          className="btn btn-primary"
          onClick={() => {
            setCurrentAnnonce({});
            setShowAnnonceModal(true);
          }}
        >
          <i className="bi bi-plus-circle me-2"></i>
          Nouvelle Annonce
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-hover">
          <thead>
            <tr>
              <th>Titre</th>
              <th>Type</th>
              <th>Cible</th>
              <th>Statut</th>
              <th>Auteur</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {annonces.map(annonce => (
              <tr key={annonce.id}>
                <td>{annonce.titre}</td>
                <td>
                  <span className={`badge bg-${
                    annonce.type_annonce === 'urgent' ? 'danger' :
                    annonce.type_annonce === 'evenement' ? 'info' :
                    'secondary'
                  }`}>
                    {annonce.type_annonce}
                  </span>
                </td>
                <td>{annonce.cible}</td>
                <td>
                  <span className={`badge bg-${annonce.publie ? 'success' : 'warning'}`}>
                    {annonce.publie ? 'Publié' : 'Brouillon'}
                  </span>
                </td>
                <td>{annonce.auteur_nom || 'N/A'}</td>
                <td>{new Date(annonce.created_at).toLocaleDateString()}</td>
                <td>
                  {!annonce.publie ? (
                    <button
                      className="btn btn-sm btn-success me-1"
                      onClick={() => handlePublierAnnonce(annonce.id)}
                      title="Publier"
                    >
                      <i className="bi bi-check-circle"></i>
                    </button>
                  ) : (
                    <button
                      className="btn btn-sm btn-warning me-1"
                      onClick={() => handleDepublierAnnonce(annonce.id)}
                      title="Dépublier"
                    >
                      <i className="bi bi-x-circle"></i>
                    </button>
                  )}
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDeleteAnnonce(annonce.id)}
                    title="Supprimer"
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderMessages = () => (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5>Messagerie Interne</h5>
        <button 
          className="btn btn-primary"
          onClick={() => setShowMessageModal(true)}
        >
          <i className="bi bi-envelope me-2"></i>
          Nouveau Message
        </button>
      </div>

      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <button 
            className={`nav-link ${messageType === 'recus' ? 'active' : ''}`}
            onClick={() => setMessageType('recus')}
          >
            Messages Reçus ({messagesRecus.length})
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${messageType === 'envoyes' ? 'active' : ''}`}
            onClick={() => setMessageType('envoyes')}
          >
            Messages Envoyés ({messagesEnvoyes.length})
          </button>
        </li>
      </ul>

      <div className="table-responsive">
        <table className="table table-hover">
          <thead>
            <tr>
              <th>{messageType === 'recus' ? 'Expéditeur' : 'Destinataire'}</th>
              <th>Sujet</th>
              <th>Date</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(messageType === 'recus' ? messagesRecus : messagesEnvoyes).map(message => (
              <tr key={message.id} className={!message.lu && messageType === 'recus' ? 'table-primary' : ''}>
                <td>
                  {messageType === 'recus' ? message.expediteur_nom : message.destinataire_nom}
                </td>
                <td>{message.sujet}</td>
                <td>{new Date(message.created_at).toLocaleDateString()}</td>
                <td>
                  {messageType === 'recus' && (
                    <span className={`badge bg-${message.lu ? 'secondary' : 'primary'}`}>
                      {message.lu ? 'Lu' : 'Non lu'}
                    </span>
                  )}
                </td>
                <td>
                  {messageType === 'recus' && !message.lu && (
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => handleMarquerLu(message.id)}
                      title="Marquer comme lu"
                    >
                      <i className="bi bi-check"></i>
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5>Notifications Ciblées</h5>
        <button 
          className="btn btn-primary"
          onClick={() => setShowNotificationModal(true)}
        >
          <i className="bi bi-bell me-2"></i>
          Envoyer Notification
        </button>
      </div>

      <div className="row">
        {statsNotifications.map((stat, index) => (
          <div key={index} className="col-md-4 mb-3">
            <div className="card">
              <div className="card-body">
                <h6 className="card-title text-capitalize">{stat.type_notification}</h6>
                <p className="card-text">
                  <strong>Total:</strong> {stat.total}<br />
                  <strong>Lues:</strong> {stat.lues}<br />
                  <strong>Non lues:</strong> {stat.non_lues}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="container-fluid py-4">
      <h3 className="mb-4">Gestion de la Communication</h3>

      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'annonces' ? 'active' : ''}`}
            onClick={() => setActiveTab('annonces')}
          >
            <i className="bi bi-megaphone me-2"></i>
            Annonces
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'messages' ? 'active' : ''}`}
            onClick={() => setActiveTab('messages')}
          >
            <i className="bi bi-envelope me-2"></i>
            Messages
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            <i className="bi bi-bell me-2"></i>
            Notifications
          </button>
        </li>
      </ul>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      ) : (
        <>
          {activeTab === 'annonces' && renderAnnonces()}
          {activeTab === 'messages' && renderMessages()}
          {activeTab === 'notifications' && renderNotifications()}
        </>
      )}

      {/* Modal Nouvelle Annonce */}
      {showAnnonceModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Nouvelle Annonce</h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowAnnonceModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Titre *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={currentAnnonce.titre || ''}
                    onChange={(e) => setCurrentAnnonce({...currentAnnonce, titre: e.target.value})}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Contenu *</label>
                  <textarea
                    className="form-control"
                    rows={5}
                    value={currentAnnonce.contenu || ''}
                    onChange={(e) => setCurrentAnnonce({...currentAnnonce, contenu: e.target.value})}
                  ></textarea>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Type</label>
                    <select
                      className="form-select"
                      value={currentAnnonce.type_annonce || 'information'}
                      onChange={(e) => setCurrentAnnonce({...currentAnnonce, type_annonce: e.target.value})}
                    >
                      <option value="information">Information</option>
                      <option value="urgent">Urgent</option>
                      <option value="evenement">Événement</option>
                      <option value="resultat">Résultat</option>
                      <option value="pastoral">Pastoral</option>
                      <option value="fermeture">Fermeture</option>
                    </select>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Cible</label>
                    <select
                      className="form-select"
                      value={currentAnnonce.cible || 'tous'}
                      onChange={(e) => setCurrentAnnonce({...currentAnnonce, cible: e.target.value})}
                    >
                      <option value="tous">Tous</option>
                      <option value="etudiants">Étudiants</option>
                      <option value="parents">Parents</option>
                      <option value="professeurs">Professeurs</option>
                      <option value="personnel">Personnel</option>
                    </select>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Date d'expiration (optionnel)</label>
                  <input
                    type="date"
                    className="form-control"
                    value={currentAnnonce.date_expiration || ''}
                    onChange={(e) => setCurrentAnnonce({...currentAnnonce, date_expiration: e.target.value})}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowAnnonceModal(false)}
                >
                  Annuler
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={handleCreateAnnonce}
                >
                  Créer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nouveau Message */}
      {showMessageModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Nouveau Message</h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowMessageModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Destinataire *</label>
                  <select
                    className="form-select"
                    value={newMessage.destinataireId}
                    onChange={(e) => setNewMessage({...newMessage, destinataireId: e.target.value})}
                  >
                    <option value="">Sélectionner un destinataire</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.nom} {user.prenom} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Sujet *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newMessage.sujet}
                    onChange={(e) => setNewMessage({...newMessage, sujet: e.target.value})}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Message *</label>
                  <textarea
                    className="form-control"
                    rows={5}
                    value={newMessage.contenu}
                    onChange={(e) => setNewMessage({...newMessage, contenu: e.target.value})}
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowMessageModal(false)}
                >
                  Annuler
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={handleSendMessage}
                >
                  Envoyer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Notification Ciblée */}
      {showNotificationModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Envoyer Notification Ciblée</h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowNotificationModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Titre *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={notificationCiblee.titre}
                    onChange={(e) => setNotificationCiblee({...notificationCiblee, titre: e.target.value})}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Message *</label>
                  <textarea
                    className="form-control"
                    rows={4}
                    value={notificationCiblee.message}
                    onChange={(e) => setNotificationCiblee({...notificationCiblee, message: e.target.value})}
                  ></textarea>
                </div>
                <div className="alert alert-info">
                  <small>
                    <i className="bi bi-info-circle me-2"></i>
                    Laissez les champs de ciblage vides pour envoyer à tous les étudiants
                  </small>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowNotificationModal(false)}
                >
                  Annuler
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={handleEnvoyerNotificationCiblee}
                >
                  Envoyer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionCommunicationPage;

// Made with Bob
