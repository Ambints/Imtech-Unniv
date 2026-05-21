import React, { useState } from 'react';
import { useTickets, useCreateTicket, useUpdateTicket } from '../hooks/useTickets';
import { useBatiments, useSalles } from '../hooks/useSalles';
import type { CreateTicketDto, UpdateTicketDto, Ticket } from '../types/logistique.types';

export default function TicketsPage() {
  const [filters, setFilters] = useState<{ statut?: string; priorite?: string }>({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const { data: tickets, isLoading } = useTickets(filters);
  const { data: batiments } = useBatiments();
  const { data: salles } = useSalles();
  const createMutation = useCreateTicket();
  const updateMutation = useUpdateTicket();

  const handleCreateTicket = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const data: CreateTicketDto = {
      batiment_id: formData.get('batiment_id') as string || undefined,
      salle_id: formData.get('salle_id') as string || undefined,
      titre: formData.get('titre') as string,
      description: formData.get('description') as string,
      type_maintenance: formData.get('type_maintenance') as any,
      priorite: formData.get('priorite') as any,
    };

    await createMutation.mutateAsync(data);
    setShowCreateModal(false);
    e.currentTarget.reset();
  };

  const handleUpdateTicket = async (id: string, data: UpdateTicketDto) => {
    await updateMutation.mutateAsync({ id, data });
    setSelectedTicket(null);
  };

  const getPriorityBadge = (priorite: string) => {
    const classes = {
      urgente: 'bg-danger',
      haute: 'bg-warning text-dark',
      normale: 'bg-primary',
      basse: 'bg-secondary',
    };
    return classes[priorite as keyof typeof classes] || 'bg-secondary';
  };

  const getStatutBadge = (statut: string) => {
    const classes = {
      ouvert: 'bg-danger',
      en_cours: 'bg-warning text-dark',
      resolu: 'bg-success',
      ferme: 'bg-secondary',
      annule: 'bg-dark',
    };
    return classes[statut as keyof typeof classes] || 'bg-secondary';
  };

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
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <i className="bi bi-wrench me-2"></i>
          Tickets de maintenance
        </h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          <i className="bi bi-plus-lg me-2"></i>
          Nouveau ticket
        </button>
      </div>

      {/* Filtres */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label small">Statut</label>
              <select
                className="form-select"
                value={filters.statut || ''}
                onChange={(e) => setFilters({ ...filters, statut: e.target.value || undefined })}
              >
                <option value="">Tous</option>
                <option value="ouvert">Ouvert</option>
                <option value="en_cours">En cours</option>
                <option value="resolu">Résolu</option>
                <option value="ferme">Fermé</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label small">Priorité</label>
              <select
                className="form-select"
                value={filters.priorite || ''}
                onChange={(e) => setFilters({ ...filters, priorite: e.target.value || undefined })}
              >
                <option value="">Toutes</option>
                <option value="urgente">Urgente</option>
                <option value="haute">Haute</option>
                <option value="normale">Normale</option>
                <option value="basse">Basse</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label small">&nbsp;</label>
              <button
                className="btn btn-outline-secondary w-100"
                onClick={() => setFilters({})}
              >
                <i className="bi bi-x-circle me-2"></i>
                Réinitialiser
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Liste tickets */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Priorité</th>
                  <th>Titre</th>
                  <th>Type</th>
                  <th>Statut</th>
                  <th>Localisation</th>
                  <th>Signalé par</th>
                  <th>Assigné à</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(tickets) ? tickets.map((ticket) => (
                  <tr key={ticket.id}>
                    <td>
                      <span className={`badge ${getPriorityBadge(ticket.priorite)}`}>
                        {ticket.priorite === 'urgente' && <i className="bi bi-exclamation-triangle-fill me-1"></i>}
                        {ticket.priorite}
                      </span>
                    </td>
                    <td className="fw-medium">{ticket.titre}</td>
                    <td>
                      <span className="badge bg-info">{ticket.type_maintenance}</span>
                    </td>
                    <td>
                      <span className={`badge ${getStatutBadge(ticket.statut)}`}>
                        {ticket.statut}
                      </span>
                    </td>
                    <td className="text-muted small">
                      {ticket.batiment_nom && `${ticket.batiment_nom} > `}
                      {ticket.salle_nom || '-'}
                    </td>
                    <td className="text-muted">{ticket.signale_par_nom}</td>
                    <td className="text-muted">{ticket.assigne_a_nom || '-'}</td>
                    <td className="text-muted small">
                      {new Date(ticket.date_signalement).toLocaleDateString('fr-FR')}
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => setSelectedTicket(ticket)}
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={9} className="text-center text-muted py-4">
                      Aucun ticket trouvé
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal création */}
      {showCreateModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <form onSubmit={handleCreateTicket}>
                <div className="modal-header">
                  <h5 className="modal-title">Nouveau ticket de maintenance</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowCreateModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Bâtiment</label>
                      <select name="batiment_id" className="form-select">
                        <option value="">Sélectionner...</option>
                        {(batiments || []).map((b) => (
                          <option key={b.id} value={b.id}>{b.nom}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Salle</label>
                      <select name="salle_id" className="form-select">
                        <option value="">Sélectionner...</option>
                        {(salles || []).map((s) => (
                          <option key={s.id} value={s.id}>{s.nom}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label">Titre *</label>
                      <input
                        type="text"
                        name="titre"
                        className="form-control"
                        required
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Description *</label>
                      <textarea
                        name="description"
                        className="form-control"
                        rows={4}
                        required
                      ></textarea>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Type de maintenance *</label>
                      <select name="type_maintenance" className="form-select" required>
                        <option value="preventive">Préventive</option>
                        <option value="curative">Curative</option>
                        <option value="urgence">Urgence</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Priorité</label>
                      <select name="priorite" className="form-select">
                        <option value="normale">Normale</option>
                        <option value="basse">Basse</option>
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
                    onClick={() => setShowCreateModal(false)}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending ? 'Création...' : 'Créer le ticket'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal modification */}
      {selectedTicket && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Modifier le ticket</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedTicket(null)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Statut</label>
                  <select
                    className="form-select"
                    defaultValue={selectedTicket.statut}
                    onChange={(e) => handleUpdateTicket(selectedTicket.id, { statut: e.target.value as any })}
                  >
                    <option value="ouvert">Ouvert</option>
                    <option value="en_cours">En cours</option>
                    <option value="resolu">Résolu</option>
                    <option value="ferme">Fermé</option>
                    <option value="annule">Annulé</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Priorité</label>
                  <select
                    className="form-select"
                    defaultValue={selectedTicket.priorite}
                    onChange={(e) => handleUpdateTicket(selectedTicket.id, { priorite: e.target.value as any })}
                  >
                    <option value="basse">Basse</option>
                    <option value="normale">Normale</option>
                    <option value="haute">Haute</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedTicket(null)}
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Made with Bob
