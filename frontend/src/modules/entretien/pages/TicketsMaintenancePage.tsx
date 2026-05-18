import React, { useState } from 'react';
import { useTickets, useTicketsUrgents, useCreateTicket, useUpdateTicket } from '../hooks';
import { CreateTicketMaintenanceDto, UpdateTicketMaintenanceDto, PrioriteTicket, StatutTicket } from '../types/entretien.types';

export default function TicketsMaintenancePage() {
  const [filters, setFilters] = useState({
    statut: '',
    priorite: '',
  });
  const [showModal, setShowModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [formData, setFormData] = useState<CreateTicketMaintenanceDto>({
    titre: '',
    description: '',
    type_maintenance: 'curative',
    priorite: 'normale',
  });

  const { data: tickets, isLoading } = useTickets(filters);
  const { data: urgents } = useTicketsUrgents();
  const createMutation = useCreateTicket();
  const updateMutation = useUpdateTicket();

  const priorityColors: Record<PrioriteTicket, string> = {
    urgente: 'danger',
    haute: 'warning',
    normale: 'primary',
    basse: 'secondary',
  };

  const statutColors: Record<StatutTicket, string> = {
    ouvert: 'danger',
    en_cours: 'warning',
    resolu: 'success',
    ferme: 'secondary',
    annule: 'dark',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync(formData);
      setShowModal(false);
      setFormData({
        titre: '',
        description: '',
        type_maintenance: 'curative',
        priorite: 'normale',
      });
    } catch (error) {
      console.error('Erreur création ticket:', error);
    }
  };

  const handleUpdateStatut = async (id: string, statut: StatutTicket) => {
    try {
      await updateMutation.mutateAsync({ id, data: { statut } });
    } catch (error) {
      console.error('Erreur mise à jour ticket:', error);
    }
  };

  const quickFilters = [
    { label: 'Tous', statut: '', priorite: '' },
    { label: 'Urgents', statut: '', priorite: 'urgente' },
    { label: 'Ouverts', statut: 'ouvert', priorite: '' },
    { label: 'En cours', statut: 'en_cours', priorite: '' },
    { label: 'Résolus', statut: 'resolu', priorite: '' },
  ];

  if (isLoading) {
    return (
      <div className="container-fluid py-4">
        <div className="d-flex justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          <i className="bi bi-ticket-perforated me-2"></i>
          Tickets de Maintenance
        </h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <i className="bi bi-plus-circle me-2"></i>
          Nouveau Ticket
        </button>
      </div>

      {/* Tickets urgents */}
      {urgents && urgents.length > 0 && (
        <div className="alert alert-danger d-flex align-items-center mb-4" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2 fs-4"></i>
          <div>
            <strong>{urgents.length} ticket(s) urgent(s)</strong> nécessitent une attention immédiate
          </div>
        </div>
      )}

      {/* Filtres rapides */}
      <div className="btn-group mb-4" role="group">
        {quickFilters.map((filter, idx) => (
          <button
            key={idx}
            type="button"
            className={`btn ${
              filters.statut === filter.statut && filters.priorite === filter.priorite
                ? 'btn-primary'
                : 'btn-outline-primary'
            }`}
            onClick={() => setFilters({ statut: filter.statut, priorite: filter.priorite })}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Liste des tickets */}
      <div className="row g-3">
        {tickets?.map((ticket) => (
          <div key={ticket.id} className="col-md-6 col-lg-4">
            <div className={`card h-100 border-${priorityColors[ticket.priorite]}`}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <h5 className="card-title mb-0">{ticket.titre}</h5>
                  <span
                    className={`badge bg-${priorityColors[ticket.priorite]} ${
                      ticket.priorite === 'urgente' ? 'badge-urgente' : ''
                    }`}
                  >
                    {ticket.priorite}
                  </span>
                </div>

                <p className="card-text text-muted small mb-2">{ticket.description}</p>

                <div className="mb-2">
                  <span className={`badge bg-${statutColors[ticket.statut]} me-2`}>
                    {ticket.statut}
                  </span>
                  <span className="badge bg-secondary">{ticket.type_maintenance}</span>
                </div>

                <div className="small text-muted mb-2">
                  {ticket.batiment_nom && (
                    <div>
                      <i className="bi bi-building me-1"></i>
                      {ticket.batiment_nom}
                      {ticket.salle_nom && ` - ${ticket.salle_nom}`}
                    </div>
                  )}
                  <div>
                    <i className="bi bi-person me-1"></i>
                    Signalé par: {ticket.signale_par_nom}
                  </div>
                  {ticket.assigne_a_nom && (
                    <div>
                      <i className="bi bi-person-check me-1"></i>
                      Assigné à: {ticket.assigne_a_nom}
                    </div>
                  )}
                  <div>
                    <i className="bi bi-calendar me-1"></i>
                    {new Date(ticket.date_signalement).toLocaleDateString('fr-FR')}
                  </div>
                </div>

                {ticket.statut === 'ouvert' && (
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-sm btn-warning flex-fill"
                      onClick={() => handleUpdateStatut(ticket.id, 'en_cours')}
                    >
                      <i className="bi bi-play-circle me-1"></i>
                      Démarrer
                    </button>
                    <button
                      className="btn btn-sm btn-success flex-fill"
                      onClick={() => handleUpdateStatut(ticket.id, 'resolu')}
                    >
                      <i className="bi bi-check-circle me-1"></i>
                      Résoudre
                    </button>
                  </div>
                )}

                {ticket.statut === 'en_cours' && (
                  <button
                    className="btn btn-sm btn-success w-100"
                    onClick={() => handleUpdateStatut(ticket.id, 'resolu')}
                  >
                    <i className="bi bi-check-circle me-1"></i>
                    Marquer comme résolu
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {tickets?.length === 0 && (
          <div className="col-12">
            <div className="alert alert-info text-center">
              <i className="bi bi-info-circle me-2"></i>
              Aucun ticket trouvé
            </div>
          </div>
        )}
      </div>

      {/* Modal Création */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Nouveau Ticket de Maintenance</h5>
                <button className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label">Titre *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.titre}
                        onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Description *</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        required
                      ></textarea>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Type de maintenance *</label>
                      <select
                        className="form-select"
                        value={formData.type_maintenance}
                        onChange={(e) =>
                          setFormData({ ...formData, type_maintenance: e.target.value as any })
                        }
                        required
                      >
                        <option value="preventive">Préventive</option>
                        <option value="curative">Curative</option>
                        <option value="urgence">Urgence</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Priorité</label>
                      <select
                        className="form-select"
                        value={formData.priorite}
                        onChange={(e) =>
                          setFormData({ ...formData, priorite: e.target.value as PrioriteTicket })
                        }
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
                    onClick={() => setShowModal(false)}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending ? 'Création...' : 'Créer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Made with Bob
