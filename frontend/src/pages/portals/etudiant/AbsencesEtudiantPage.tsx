import React, { useState, useEffect } from 'react';
import { academicApi } from '../../../api/client';
import { useAuthStore } from '../../../store/authStore';
import { ClipboardList, CheckCircle, X, Upload, AlertTriangle } from 'lucide-react';

export const AbsencesEtudiantPage: React.FC = () => {
  const { user } = useAuthStore();
  const tid = user?.tenantId || '';
  const [absences, setAbsences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tid || !user?.id) return;
    setLoading(true);
    academicApi.getAbsences(tid, user.id)
      .then(r => setAbsences(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [tid, user?.id]);

  const absencesJustifiees = absences.filter(a => a.status === 'justified').length;
  const absencesNonJustifiees = absences.filter(a => a.status !== 'justified').length;
  const tauxAssiduite = absences.length > 0 ? (((absences.length - absencesNonJustifiees) / absences.length) * 100).toFixed(1) : '100';

  return (
    <div style={{ padding: 32, background: '#F5F5F0', minHeight: '100vh' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <ClipboardList size={32} color="#1a5276" />
          Mes Absences
        </h1>
        <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>
          Suivi de votre assiduité et justifications
        </p>
      </div>

      {/* Statistiques */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Absences', value: absences.length, color: '#64748b' },
          { label: 'Justifiées', value: absencesJustifiees, color: '#148f77' },
          { label: 'Non Justifiées', value: absencesNonJustifiees, color: '#e74c3c' },
          { label: 'Taux d\'Assiduité', value: `${tauxAssiduite}%`, color: Number(tauxAssiduite) >= 80 ? '#148f77' : '#e74c3c' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderTop: `4px solid ${s.color}` }}>
            <p style={{ color: '#94a3b8', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', margin: '0 0 8px' }}>{s.label}</p>
            <p style={{ fontSize: 28, fontWeight: 900, color: s.color, margin: 0 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Alerte si trop d'absences */}
      {absencesNonJustifiees >= 3 && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: 16, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
          <AlertTriangle size={24} color="#991b1b" />
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#991b1b', marginBottom: 4 }}>Attention : Trop d'absences non justifiées</div>
            <div style={{ fontSize: 12, color: '#7f1d1d' }}>
              Vous avez {absencesNonJustifiees} absence(s) non justifiée(s). Veuillez fournir les justificatifs nécessaires.
            </div>
          </div>
        </div>
      )}

      {/* Liste des absences */}
      <div style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: '0 0 20px' }}>Historique des Absences</h2>

        {loading ? (
          <p style={{ textAlign: 'center', color: '#94a3b8', padding: 40 }}>Chargement...</p>
        ) : absences.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <CheckCircle size={48} color="#148f77" style={{ marginBottom: 16 }} />
            <p style={{ color: '#148f77', fontSize: 16, fontWeight: 600, margin: 0 }}>Aucune absence enregistrée</p>
            <p style={{ color: '#94a3b8', fontSize: 13, margin: '8px 0 0' }}>Continuez votre excellent travail !</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {absences.map((a, i) => {
              const isJustified = a.status === 'justified';
              return (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16, background: isJustified ? '#f0fdf4' : '#fef2f2', borderRadius: 10, border: `1px solid ${isJustified ? '#bbf7d0' : '#fecaca'}` }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
                      {new Date(a.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>
                      Cours: {a.courseName || 'Non spécifié'} · {a.heureDebut || '08:00'} - {a.heureFin || '10:00'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ padding: '6px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700, background: isJustified ? '#dcfce7' : '#fee2e2', color: isJustified ? '#166534' : '#991b1b', display: 'flex', alignItems: 'center', gap: 6 }}>
                      {isJustified ? <><CheckCircle size={14} /> Justifiée</> : <><X size={14} /> Non justifiée</>}
                    </span>
                    {!isJustified && (
                      <button style={{ padding: '6px 12px', background: '#1a5276', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Upload size={14} /> Justifier
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// Made with Bob
