import React, { useState, useEffect } from 'react';
import { academicApi, financeApi } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { Hand, BarChart3, CheckCircle2, ClipboardList, CreditCard, X } from 'lucide-react';

export const EtudiantPortal: React.FC = () => {
  const { user } = useAuthStore();
  const tid = user?.tenantId || '';
  const [notes, setNotes] = useState<any[]>([]);
  const [paiements, setPaiements] = useState<any[]>([]);
  const [absences, setAbsences] = useState<any[]>([]);
  const annee = '2024-2025';

  useEffect(() => {
    if (!tid || !user?.id) return;
    academicApi.getNotes(tid, user.id, annee).then(r => setNotes(r.data)).catch(() => {});
    financeApi.getPaiementsEtudiant(tid, user.id).then(r => setPaiements(r.data)).catch(() => {});
    academicApi.getAbsences(tid, user.id).then(r => setAbsences(r.data)).catch(() => {});
  }, [tid, user?.id]);

  const moyenneGen = notes.length > 0
    ? (notes.reduce((s, n) => s + Number(n.noteFinal || 0), 0) / notes.length).toFixed(2)
    : '—';

  const section = (title: React.ReactNode, children: React.ReactNode) => (
    <div style={{ background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 2px 10px rgba(0,0,0,0.07)', marginBottom: 20 }}>
      <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '0 0 16px' }}>{title}</h3>
      {children}
    </div>
  );

  return (
    <div style={{ padding: 32, background: '#F5F5F0', minHeight: '100vh' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', margin: '0 0 4px' }}>
          <Hand size={24} style={{ marginRight: 8, verticalAlign: 'middle' }} /> Bonjour, {user?.firstName} !
        </h1>
        <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>
          Matricule : {user?.matricule || 'ETU-2024-001'} · Parcours : {user?.parcours || 'Licence Informatique'}
        </p>
      </div>

      {/* Stats rapides */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
        {[
          { label: 'Moyenne Générale', value: moyenneGen, icon: <BarChart3 size={24} color="#1a5276" />, color: '#1a5276' },
          { label: 'UE Validées', value: `${notes.filter(n => n.noteFinal >= 10).length}/${notes.length}`, icon: <CheckCircle2 size={24} color="#148f77" />, color: '#148f77' },
          { label: 'Absences', value: absences.length, icon: <ClipboardList size={24} color="#e74c3c" />, color: '#e74c3c' },
          { label: 'Paiements', value: paiements.length, icon: <CreditCard size={24} color="#f39c12" />, color: '#f39c12' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 12, padding: '16px 18px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderTop: `3px solid ${s.color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ color: '#94a3b8', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', margin: '0 0 6px' }}>{s.label}</p>
                <p style={{ fontSize: 24, fontWeight: 900, color: s.color, margin: 0 }}>{s.value}</p>
              </div>
              <span style={{ fontSize: 26 }}>{s.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {section(<span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><BarChart3 size={18} /> Mes Notes</span>, notes.length === 0 ? (
          <p style={{ color: '#94a3b8', textAlign: 'center', padding: 16, fontSize: 13 }}>Aucune note disponible</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['UE', 'CC', 'Examen', 'Moyenne', 'Mention'].map(h => (
                  <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {notes.map((n, i) => (
                <tr key={i} style={{ borderTop: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px', fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{n.ueId?.slice(0, 8) || '—'}</td>
                  <td style={{ padding: '10px', fontSize: 13, color: '#64748b' }}>{n.noteCC ?? '—'}</td>
                  <td style={{ padding: '10px', fontSize: 13, color: '#64748b' }}>{n.noteExam ?? '—'}</td>
                  <td style={{ padding: '10px', fontSize: 14, fontWeight: 700, color: Number(n.noteFinal) >= 10 ? '#148f77' : '#e74c3c' }}>
                    {n.noteFinal ?? '—'}
                  </td>
                  <td style={{ padding: '10px' }}>
                    <span style={{ padding: '3px 8px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: Number(n.noteFinal) >= 10 ? '#dcfce7' : '#fef2f2', color: Number(n.noteFinal) >= 10 ? '#166534' : '#991b1b' }}>
                      {n.mention || '—'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ))}

        {section(<span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><CreditCard size={18} /> Mes Paiements</span>, paiements.length === 0 ? (
          <p style={{ color: '#94a3b8', textAlign: 'center', padding: 16, fontSize: 13 }}>Aucun paiement enregistré</p>
        ) : (
          <div>
            {paiements.slice(0, 6).map((p, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{p.motif}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>{p.reference} · {p.mode}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#148f77' }}>{Number(p.montant).toLocaleString('fr')} FCFA</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>{new Date(p.createdAt).toLocaleDateString('fr-FR')}</div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {section(<span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><ClipboardList size={18} /> Mes Absences</span>, absences.length === 0 ? (
        <p style={{ color: '#94a3b8', textAlign: 'center', padding: 16, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><CheckCircle2 size={16} color="#148f77" /> Aucune absence enregistrée</p>
      ) : (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {absences.map((a, i) => (
            <div key={i} style={{ padding: '8px 14px', background: a.status === 'justified' ? '#f0fdf4' : '#fef2f2', borderRadius: 9, border: `1px solid ${a.status === 'justified' ? '#bbf7d0' : '#fecaca'}` }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{new Date(a.date).toLocaleDateString('fr-FR')}</div>
              <div style={{ fontSize: 11, color: a.status === 'justified' ? '#166534' : '#991b1b', display: 'flex', alignItems: 'center', gap: 4 }}>
                {a.status === 'justified' ? <><CheckCircle2 size={12} color="#166534" /> Justifiée</> : <><X size={12} color="#991b1b" /> Non justifiée</>}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};