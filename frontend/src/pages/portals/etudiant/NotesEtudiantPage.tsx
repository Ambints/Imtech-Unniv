import React, { useState, useEffect } from 'react';
import { academicApi } from '../../../api/client';
import { useAuthStore } from '../../../store/authStore';
import { BarChart3, Download, TrendingUp, Award } from 'lucide-react';

export const NotesEtudiantPage: React.FC = () => {
  const { user } = useAuthStore();
  const tid = user?.tenantId || '';
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const annee = '2024-2025';

  useEffect(() => {
    if (!tid || !user?.id) return;
    setLoading(true);
    academicApi.getNotes(tid, user.id, annee)
      .then(r => setNotes(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [tid, user?.id]);

  const moyenneGen = notes.length > 0
    ? (notes.reduce((s, n) => s + Number(n.noteFinal || 0), 0) / notes.length).toFixed(2)
    : '0.00';

  const ueValidees = notes.filter(n => Number(n.noteFinal) >= 10).length;
  const tauxReussite = notes.length > 0 ? ((ueValidees / notes.length) * 100).toFixed(1) : '0';

  return (
    <div style={{ padding: 32, background: '#F5F5F0', minHeight: '100vh' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <BarChart3 size={32} color="#1a5276" />
          Mes Notes
        </h1>
        <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>
          Année académique {annee}
        </p>
      </div>

      {/* Statistiques */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Moyenne Générale', value: moyenneGen, icon: <BarChart3 size={24} />, color: '#1a5276' },
          { label: 'UE Validées', value: `${ueValidees}/${notes.length}`, icon: <Award size={24} />, color: '#148f77' },
          { label: 'Taux de Réussite', value: `${tauxReussite}%`, icon: <TrendingUp size={24} />, color: '#f39c12' },
          { label: 'Crédits ECTS', value: ueValidees * 6, icon: <Award size={24} />, color: '#9b59b6' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderTop: `4px solid ${s.color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ color: '#94a3b8', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', margin: '0 0 8px' }}>{s.label}</p>
                <p style={{ fontSize: 28, fontWeight: 900, color: s.color, margin: 0 }}>{s.value}</p>
              </div>
              <span style={{ color: s.color }}>{s.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Tableau des notes */}
      <div style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: 0 }}>Détail des Notes</h2>
          <button style={{ padding: '8px 16px', background: '#1a5276', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Download size={16} /> Télécharger le relevé
          </button>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', color: '#94a3b8', padding: 40 }}>Chargement...</p>
        ) : notes.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#94a3b8', padding: 40 }}>Aucune note disponible</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                {['Code UE', 'Intitulé', 'Crédits', 'CC (40%)', 'Examen (60%)', 'Moyenne', 'Mention', 'Statut'].map(h => (
                  <th key={h} style={{ padding: '12px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {notes.map((n, i) => {
                const noteFinal = Number(n.noteFinal || 0);
                const isValide = noteFinal >= 10;
                return (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px', fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{n.codeUE || 'UE-' + (i + 1)}</td>
                    <td style={{ padding: '14px', fontSize: 13, color: '#64748b' }}>{n.intitule || 'Unité d\'Enseignement'}</td>
                    <td style={{ padding: '14px', fontSize: 13, color: '#64748b', textAlign: 'center' }}>6</td>
                    <td style={{ padding: '14px', fontSize: 13, color: '#64748b', textAlign: 'center' }}>{n.noteCC ?? '—'}</td>
                    <td style={{ padding: '14px', fontSize: 13, color: '#64748b', textAlign: 'center' }}>{n.noteExam ?? '—'}</td>
                    <td style={{ padding: '14px', fontSize: 16, fontWeight: 700, color: isValide ? '#148f77' : '#e74c3c', textAlign: 'center' }}>
                      {noteFinal.toFixed(2)}
                    </td>
                    <td style={{ padding: '14px', textAlign: 'center' }}>
                      <span style={{ padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: isValide ? '#dcfce7' : '#fef2f2', color: isValide ? '#166534' : '#991b1b' }}>
                        {n.mention || (isValide ? 'Passable' : 'Ajourné')}
                      </span>
                    </td>
                    <td style={{ padding: '14px', textAlign: 'center' }}>
                      <span style={{ padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: isValide ? '#dbeafe' : '#fee2e2', color: isValide ? '#1e40af' : '#991b1b' }}>
                        {isValide ? 'Validé' : 'Non validé'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

// Made with Bob
