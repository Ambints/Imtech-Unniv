import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';

interface Ticket {
  id: string;
  titre: string;
  description: string;
  type_maintenance: string;
  priorite: string;
  statut: string;
  signale_par_nom?: string;
  assigne_a_nom?: string;
  salle_nom?: string;
  batiment_nom?: string;
  date_signalement: string;
  cout_reparation?: number;
}

interface Stock {
  id: string;
  reference: string;
  libelle: string;
  categorie: string;
  unite: string;
  quantite_stock: number;
  seuil_alerte: number;
  prix_unitaire?: number;
  fournisseur?: string;
  emplacement?: string;
}

interface Reservation {
  id: string;
  salle_nom?: string;
  titre: string;
  description?: string;
  date_reservation: string;
  heure_debut: string;
  heure_fin: string;
  demande_par_nom?: string;
  approuve_par_nom?: string;
  statut: string;
}

const GestionLogistiquePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tickets' | 'stocks' | 'reservations'>('tickets');
  
  // États pour les tickets
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [currentTicket, setCurrentTicket] = useState<Partial<Ticket>>({});
  
  // États pour les stocks
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [stocksAlerte, setStocksAlerte] = useState<Stock[]>([]);
  const [showStockModal, setShowStockModal] = useState(false);
  const [currentStock, setCurrentStock] = useState<Partial<Stock>>({});
  
  // États pour les réservations
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [currentReservation, setCurrentReservation] = useState<Partial<Reservation>>({});
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'tickets') {
        const response = await api.get('/logistics/tickets');
        setTickets(response.data);
      } else if (activeTab === 'stocks') {
        const [stocksRes, alertesRes] = await Promise.all([
          api.get('/logistics/stocks'),
          api.get('/logistics/stocks/alertes')
        ]);
        setStocks(stocksRes.data);
        setStocksAlerte(alertesRes.data);
      } else if (activeTab === 'reservations') {
        const response = await api.get('/logistics/reservations');
        setReservations(response.data);
      }
    } catch (error) {
      console.error('Erreur chargement données:', error);
    } finally {
      setLoading(false);
    }
  };

  // ========== GESTION DES TICKETS ==========
  const handleCreateTicket = async () => {
    try {
      await api.post('/logistics/tickets', currentTicket);
      setShowTicketModal(false);
      setCurrentTicket({});
      loadData();
      alert('Ticket créé avec succès');
    } catch (error) {
      console.error('Erreur création ticket:', error);
      alert('Erreur lors de la création du ticket');
    }
  };

  const handleUpdateTicketStatus = async (id: string, statut: string) => {
    try {
      await api.patch(`/logistics/tickets/${id}`, { statut });
      loadData();
      alert('Statut mis à jour avec succès');
    } catch (error) {
      console.error('Erreur mise à jour statut:', error);
      alert('Erreur lors de la mise à jour');
    }
  };

  const getPrioriteBadgeClass = (priorite: string) => {
    switch (priorite) {
      case 'urgente': return 'bg-danger';
      case 'haute': return 'bg-warning';
      case 'normale': return 'bg-info';
      case 'basse': return 'bg-secondary';
      default: return 'bg-secondary';
    }
  };

  const getStatutBadgeClass = (statut: string) => {
    switch (statut) {
      case 'ouvert': return 'bg-danger';
      case 'en_cours': return 'bg-warning';
      case 'resolu': return 'bg-success';
      case 'ferme': return 'bg-secondary';
      case 'annule': return 'bg-dark';
      default: return 'bg-secondary';
    }
  };

  // ========== GESTION DES STOCKS ==========
  const handleCreateStock = async () => {
    try {
      await api.post('/logistics/stocks', currentStock);
      setShowStockModal(false);
      setCurrentStock({});
      loadData();
      alert('Article ajouté avec succès');
    } catch (error) {
      console.error('Erreur création stock:', error);
      alert('Erreur lors de l\'ajout de l\'article');
    }
  };

  const handleUpdateStock = async (id: string, quantite: number) => {
    try {
      await api.patch(`/logistics/stocks/${id}`, { quantite });
      loadData();
      alert('Stock mis à jour avec succès');
    } catch (error) {
      console.error('Erreur mise à jour stock:', error);
      alert('Erreur lors de la mise à jour');
    }
  };

  // ========== GESTION DES RÉSERVATIONS ==========
  const handleCreateReservation = async () => {
    try {
      await api.post('/logistics/reservations', currentReservation);
      setShowReservationModal(false);
      setCurrentReservation({});
      loadData();
      alert('Réservation créée avec succès');
    } catch (error) {
      console.error('Erreur création réservation:', error);
      alert('Erreur lors de la création de la réservation');
    }
  };

  const handleApprouverReservation = async (id: string) => {
    try {
      await api.patch(`/logistics/reservations/${id}/approuver`, { approuvePar: 'current-user-id' });
      loadData();
      alert('Réservation approuvée avec succès');
    } catch (error) {
      console.error('Erreur approbation réservation:', error);
      alert('Erreur lors de l\'approbation');
    }
  };

  const handleRefuserReservation = async (id: string) => {
    try {
      await api.patch(`/logistics/reservations/${id}/refuser`, { approuvePar: 'current-user-id' });
      loadData();
      alert('Réservation refusée');
    } catch (error) {
      console.error('Erreur refus réservation:', error);
      alert('Erreur lors du refus');
    }
  };

  // ========== RENDU DES ONGLETS ==========
  const renderTickets = () => (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5>Tickets de Maintenance</h5>
        <button 
          className="btn btn-primary"
          onClick={() => {
            setCurrentTicket({});
            setShowTicketModal(true);
          }}
        >
          <i className="bi bi-plus-circle me-2"></i>
          Nouveau Ticket
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-hover">
          <thead>
            <tr>
              <th>Titre</th>
              <th>Type</th>
              <th>Priorité</th>
              <th>Statut</th>
              <th>Lieu</th>
              <th>Signalé par</th>
              <th>Assigné à</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map(ticket => (
              <tr key={ticket.id}>
                <td><strong>{ticket.titre}</strong></td>
                <td className="text-capitalize">{ticket.type_maintenance}</td>
                <td>
                  <span className={`badge ${getPrioriteBadgeClass(ticket.priorite)}`}>
                    {ticket.priorite}
                  </span>
                </td>
                <td>
                  <span className={`badge ${getStatutBadgeClass(ticket.statut)}`}>
                    {ticket.statut}
                  </span>
                </td>
                <td>
                  <small>{ticket.salle_nom || ticket.batiment_nom || 'N/A'}</small>
                </td>
                <td><small>{ticket.signale_par_nom || 'N/A'}</small></td>
                <td><small>{ticket.assigne_a_nom || 'Non assigné'}</small></td>
                <td><small>{new Date(ticket.date_signalement).toLocaleDateString()}</small></td>
                <td>
                  {ticket.statut === 'ouvert' && (
                    <button
                      className="btn btn-sm btn-warning me-1"
                      onClick={() => handleUpdateTicketStatus(ticket.id, 'en_cours')}
                      title="Prendre en charge"
                    >
                      <i className="bi bi-play-circle"></i>
                    </button>
                  )}
                  {ticket.statut === 'en_cours' && (
                    <button
                      className="btn btn-sm btn-success"
                      onClick={() => handleUpdateTicketStatus(ticket.id, 'resolu')}
                      title="Marquer résolu"
                    >
                      <i className="bi bi-check-circle"></i>
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

  const renderStocks = () => (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5>Gestion des Stocks</h5>
        <button 
          className="btn btn-primary"
          onClick={() => {
            setCurrentStock({});
            setShowStockModal(true);
          }}
        >
          <i className="bi bi-plus-circle me-2"></i>
          Nouvel Article
        </button>
      </div>

      {stocksAlerte.length > 0 && (
        <div className="alert alert-warning mb-3">
          <i className="bi bi-exclamation-triangle me-2"></i>
          <strong>{stocksAlerte.length}</strong> article(s) sous le seuil d'alerte
        </div>
      )}

      <div className="table-responsive">
        <table className="table table-hover">
          <thead>
            <tr>
              <th>Référence</th>
              <th>Libellé</th>
              <th>Catégorie</th>
              <th>Quantité</th>
              <th>Seuil</th>
              <th>Unité</th>
              <th>Prix Unit.</th>
              <th>Emplacement</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {stocks.map(stock => (
              <tr 
                key={stock.id}
                className={stock.quantite_stock <= stock.seuil_alerte ? 'table-warning' : ''}
              >
                <td><strong>{stock.reference}</strong></td>
                <td>{stock.libelle}</td>
                <td className="text-capitalize">{stock.categorie}</td>
                <td>
                  <strong className={stock.quantite_stock <= stock.seuil_alerte ? 'text-danger' : ''}>
                    {stock.quantite_stock}
                  </strong>
                </td>
                <td>{stock.seuil_alerte}</td>
                <td>{stock.unite}</td>
                <td>{stock.prix_unitaire ? `${stock.prix_unitaire} €` : '-'}</td>
                <td><small>{stock.emplacement || '-'}</small></td>
                <td>
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => {
                      const newQty = prompt('Nouvelle quantité:', stock.quantite_stock.toString());
                      if (newQty) handleUpdateStock(stock.id, parseFloat(newQty));
                    }}
                    title="Ajuster stock"
                  >
                    <i className="bi bi-pencil"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderReservations = () => (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5>Réservations de Salles</h5>
        <button 
          className="btn btn-primary"
          onClick={() => {
            setCurrentReservation({});
            setShowReservationModal(true);
          }}
        >
          <i className="bi bi-plus-circle me-2"></i>
          Nouvelle Réservation
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-hover">
          <thead>
            <tr>
              <th>Salle</th>
              <th>Titre</th>
              <th>Date</th>
              <th>Horaire</th>
              <th>Demandé par</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map(reservation => (
              <tr key={reservation.id}>
                <td><strong>{reservation.salle_nom || 'N/A'}</strong></td>
                <td>{reservation.titre}</td>
                <td>{new Date(reservation.date_reservation).toLocaleDateString()}</td>
                <td>
                  <small>{reservation.heure_debut} - {reservation.heure_fin}</small>
                </td>
                <td><small>{reservation.demande_par_nom || 'N/A'}</small></td>
                <td>
                  <span className={`badge bg-${
                    reservation.statut === 'approuvee' ? 'success' :
                    reservation.statut === 'refusee' ? 'danger' :
                    reservation.statut === 'annulee' ? 'secondary' :
                    'warning'
                  }`}>
                    {reservation.statut}
                  </span>
                </td>
                <td>
                  {reservation.statut === 'en_attente' && (
                    <>
                      <button
                        className="btn btn-sm btn-success me-1"
                        onClick={() => handleApprouverReservation(reservation.id)}
                        title="Approuver"
                      >
                        <i className="bi bi-check-circle"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleRefuserReservation(reservation.id)}
                        title="Refuser"
                      >
                        <i className="bi bi-x-circle"></i>
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="container-fluid py-4">
      <h3 className="mb-4">Gestion Logistique</h3>

      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'tickets' ? 'active' : ''}`}
            onClick={() => setActiveTab('tickets')}
          >
            <i className="bi bi-tools me-2"></i>
            Maintenance
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'stocks' ? 'active' : ''}`}
            onClick={() => setActiveTab('stocks')}
          >
            <i className="bi bi-box-seam me-2"></i>
            Stocks
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'reservations' ? 'active' : ''}`}
            onClick={() => setActiveTab('reservations')}
          >
            <i className="bi bi-calendar-check me-2"></i>
            Réservations
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
          {activeTab === 'tickets' && renderTickets()}
          {activeTab === 'stocks' && renderStocks()}
          {activeTab === 'reservations' && renderReservations()}
        </>
      )}

      {/* Modal Ticket */}
      {showTicketModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Nouveau Ticket de Maintenance</h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowTicketModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Titre *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={currentTicket.titre || ''}
                    onChange={(e) => setCurrentTicket({...currentTicket, titre: e.target.value})}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Description *</label>
                  <textarea
                    className="form-control"
                    rows={4}
                    value={currentTicket.description || ''}
                    onChange={(e) => setCurrentTicket({...currentTicket, description: e.target.value})}
                  ></textarea>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Type</label>
                    <select
                      className="form-select"
                      value={currentTicket.type_maintenance || 'curative'}
                      onChange={(e) => setCurrentTicket({...currentTicket, type_maintenance: e.target.value})}
                    >
                      <option value="preventive">Préventive</option>
                      <option value="curative">Curative</option>
                      <option value="urgence">Urgence</option>
                    </select>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Priorité</label>
                    <select
                      className="form-select"
                      value={currentTicket.priorite || 'normale'}
                      onChange={(e) => setCurrentTicket({...currentTicket, priorite: e.target.value})}
                    >
                      <option value="basse">Basse</option>
                      <option value="normale">Normale</option>
                      <option value="haute">Haute</option>
                      <option value="urgente">Urgente</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowTicketModal(false)}
                >
                  Annuler
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={handleCreateTicket}
                >
                  Créer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Stock */}
      {showStockModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Nouvel Article en Stock</h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowStockModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Référence *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={currentStock.reference || ''}
                      onChange={(e) => setCurrentStock({...currentStock, reference: e.target.value})}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Libellé *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={currentStock.libelle || ''}
                      onChange={(e) => setCurrentStock({...currentStock, libelle: e.target.value})}
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Catégorie *</label>
                    <select
                      className="form-select"
                      value={currentStock.categorie || ''}
                      onChange={(e) => setCurrentStock({...currentStock, categorie: e.target.value})}
                    >
                      <option value="">Sélectionner</option>
                      <option value="bureau">Bureau</option>
                      <option value="nettoyage">Nettoyage</option>
                      <option value="informatique">Informatique</option>
                      <option value="pedagogique">Pédagogique</option>
                      <option value="energie">Énergie</option>
                      <option value="autre">Autre</option>
                    </select>
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Unité *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Ex: pièce, kg, litre"
                      value={currentStock.unite || ''}
                      onChange={(e) => setCurrentStock({...currentStock, unite: e.target.value})}
                    />
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Quantité initiale</label>
                    <input
                      type="number"
                      className="form-control"
                      value={currentStock.quantite_stock || 0}
                      onChange={(e) => setCurrentStock({...currentStock, quantite_stock: parseFloat(e.target.value)})}
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Seuil d'alerte</label>
                    <input
                      type="number"
                      className="form-control"
                      value={currentStock.seuil_alerte || 0}
                      onChange={(e) => setCurrentStock({...currentStock, seuil_alerte: parseFloat(e.target.value)})}
                    />
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Prix unitaire</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      value={currentStock.prix_unitaire || ''}
                      onChange={(e) => setCurrentStock({...currentStock, prix_unitaire: parseFloat(e.target.value)})}
                    />
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Emplacement</label>
                    <input
                      type="text"
                      className="form-control"
                      value={currentStock.emplacement || ''}
                      onChange={(e) => setCurrentStock({...currentStock, emplacement: e.target.value})}
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Fournisseur</label>
                  <input
                    type="text"
                    className="form-control"
                    value={currentStock.fournisseur || ''}
                    onChange={(e) => setCurrentStock({...currentStock, fournisseur: e.target.value})}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowStockModal(false)}
                >
                  Annuler
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={handleCreateStock}
                >
                  Ajouter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Réservation */}
      {showReservationModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Nouvelle Réservation</h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowReservationModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Titre *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={currentReservation.titre || ''}
                    onChange={(e) => setCurrentReservation({...currentReservation, titre: e.target.value})}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={currentReservation.description || ''}
                    onChange={(e) => setCurrentReservation({...currentReservation, description: e.target.value})}
                  ></textarea>
                </div>
                <div className="mb-3">
                  <label className="form-label">Date *</label>
                  <input
                    type="date"
                    className="form-control"
                    value={currentReservation.date_reservation || ''}
                    onChange={(e) => setCurrentReservation({...currentReservation, date_reservation: e.target.value})}
                  />
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Heure début *</label>
                    <input
                      type="time"
                      className="form-control"
                      value={currentReservation.heure_debut || ''}
                      onChange={(e) => setCurrentReservation({...currentReservation, heure_debut: e.target.value})}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Heure fin *</label>
                    <input
                      type="time"
                      className="form-control"
                      value={currentReservation.heure_fin || ''}
                      onChange={(e) => setCurrentReservation({...currentReservation, heure_fin: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowReservationModal(false)}
                >
                  Annuler
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={handleCreateReservation}
                >
                  Réserver
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionLogistiquePage;

// Made with Bob
