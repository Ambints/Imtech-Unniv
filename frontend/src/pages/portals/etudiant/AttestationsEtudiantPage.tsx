import React from 'react';
import { FileText, Download, CheckCircle, Clock } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';

export const AttestationsEtudiantPage: React.FC = () => {
  const { user } = useAuthStore();

  const attestations = [
    { id: 1, type: 'Attestation d\'Inscription', annee: '2024-2025', date: '2024-09-15', status: 'available' },
    { id: 2, type: 'Certificat de Scolarité', annee: '2024-2025', date: '2024-09-15', status: 'available' },
    { id: 3, type: 'Relevé de Notes S1', annee: '2023-2024', date: '2024-02-20', status: 'available' },
    { id: 4, type: 'Relevé de Notes S2', annee: '2023-2024', date: '2024-07-15', status: 'available' },
    { id: 5, type: 'Attestation de Réussite', annee: '2023-2024', date: '2024-07-20', status: 'available' },
  ];

  const demandesEnCours = [
    { id: 1, type: 'Attestation de Stage', demandeLe: '2024-10-01', status: 'pending' },
  ];

  return (
    <div style={{ padding: 32, background: '#F5F5F0', minHeight: '100vh' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <FileText size={32} color="#1a5276" />
          Mes Attestations
        </h1>
        <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>
          Téléchargez vos documents officiels
        </p>
      </div>

      {/* Informations étudiant */}
      <div style={{ background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 2px 10px rgba(0,0,0,0.07)', marginBottom: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '0 0 12px' }}>Informations</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, fontSize: 13 }}>
          <div>
            <span style={{ color: '#94a3b8', display: 'block', marginBottom: 4 }}>Nom complet</span>
            <span style={{ color: '#0f172a', fontWeight: 600 }}>{user?.firstName} {user?.lastName}</span>
          </div>
          <div>
            <span style={{ color: '#94a3b8', display: 'block', marginBottom: 4 }}>Matricule</span>
            <span style={{ color: '#0f172a', fontWeight: 600 }}>{user?.matricule || 'ETU-2024-001'}</span>
          </div>
          <div>
            <span style={{ color: '#94a3b8', display: 'block', marginBottom: 4 }}>Parcours</span>
            <span style={{ color: '#0f172a', fontWeight: 600 }}>{user?.parcours || 'Licence Informatique'}</span>
          </div>
        </div>
      </div>

      {/* Demandes en cours */}
      {demandesEnCours.length > 0 && (
        <div style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 2px 10px rgba(0,0,0,0.07)', marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Clock size={20} /> Demandes en Cours
          </h2>
          <div style={{ display: 'grid', gap: 12 }}>
            {demandesEnCours.map(d => (
              <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 14, background: '#fef3c7', borderRadius: 10, border: '1px solid #fde68a' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginBottom: 4 }}>{d.type}</div>
                  <div style={{ fontSize: 12, color: '#92400e' }}>Demandé le {new Date(d.demandeLe).toLocaleDateString('fr-FR')}</div>
                </div>
                <span style={{ padding: '4px 12px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: '#fef3c7', color: '#92400e', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={14} /> En traitement
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Attestations disponibles */}
      <div style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: 0 }}>Documents Disponibles</h2>
          <button style={{ padding: '8px 16px', background: '#1a5276', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            + Nouvelle Demande
          </button>
        </div>

        <div style={{ display: 'grid', gap: 12 }}>
          {attestations.map(a => (
            <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16, background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, background: '#dbeafe', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={20} color="#1e40af" />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>{a.type}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>
                    Année: {a.annee} · Généré le {new Date(a.date).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: '#dcfce7', color: '#166534', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <CheckCircle size={14} /> Disponible
                </span>
                <button style={{ padding: '8px 14px', background: '#1a5276', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Download size={14} /> Télécharger
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Note informative */}
      <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: 16, marginTop: 24 }}>
        <div style={{ fontSize: 13, color: '#1e40af' }}>
          <strong>Note:</strong> Les attestations sont générées automatiquement et sont valables pour toutes démarches administratives. 
          Pour toute demande spécifique, veuillez contacter le service de scolarité.
        </div>
      </div>
    </div>
  );
};

// Made with Bob
