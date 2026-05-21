import React, { useState } from 'react';
import { useBatiments } from '../hooks/useSalles';

export default function BatimentsPage() {
  const { data: batiments, isLoading } = useBatiments();

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
        <h2>
          <i className="bi bi-building me-2"></i>
          Gestion des bâtiments
        </h2>
      </div>

      <div className="row g-3">
        {batiments?.map((batiment) => (
          <div key={batiment.id} className="col-md-6 col-lg-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <h5 className="card-title mb-1">{batiment.nom}</h5>
                    {batiment.code && (
                      <p className="text-muted small mb-0">Code: {batiment.code}</p>
                    )}
                  </div>
                  <span className={`badge ${batiment.actif ? 'bg-success' : 'bg-secondary'}`}>
                    {batiment.actif ? 'Actif' : 'Inactif'}
                  </span>
                </div>

                {batiment.adresse && (
                  <p className="text-muted small mb-3">
                    <i className="bi bi-geo-alt me-1"></i>
                    {batiment.adresse}
                  </p>
                )}

                <div className="row g-2">
                  <div className="col-6">
                    <div className="bg-light p-2 rounded text-center">
                      <div className="fw-bold text-primary">{batiment.nb_salles}</div>
                      <small className="text-muted">Salles</small>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="bg-light p-2 rounded text-center">
                      <div className="fw-bold text-success">{batiment.salles_disponibles}</div>
                      <small className="text-muted">Disponibles</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Made with Bob
