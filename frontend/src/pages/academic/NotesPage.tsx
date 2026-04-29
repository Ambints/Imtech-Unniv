import React, { useState, useEffect } from 'react';
import { academicApi } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import { FileText, Trophy, Clock, Save, ClipboardList, Lock, LockOpen } from 'lucide-react';

export const NotesPage: React.FC = () => {
  const { user } = useAuthStore();
  const tid = user?.tenantId || '';
  const [parcours, setParcours] = useState<any[]>([]);
  const [selectedParcours, setSelectedParcours] = useState('');
  const [ues, setUes] = useState<any[]>([]);
  const [form, setForm] = useState({ etudiantId: '', ueId: '', noteCC: '', noteExam: '', anneeAcademique: '2024-2025', semester: '1' });
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState<any[]>([]);

  useEffect(() => {
    if (tid) academicApi.getParcours(tid).then(r => setParcours(r.data)).catch(() => {});
  }, [tid]);

  useEffect(() => {
    if (selectedParcours) academicApi.getUE(tid, selectedParcours).then(r => setUes(r.data)).catch(() => {});
  }, [selectedParcours]);

  const handleSaisir = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        noteCC: form.noteCC ? Number(form.noteCC) : undefined,
        noteExam: form.noteExam ? Number(form.noteExam) : undefined,
        semester: Number(form.semester),
      };
      await academicApi.saisirNote(tid, payload);
      toast.success('Note saisie avec succès !');
      if (form.etudiantId) {
        academicApi.getNotes(tid, form.etudiantId, form.anneeAcademique).then(r => setNotes(r.data));
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur saisie note');
    } finally {
      setLoading(false);
    }
  };

  const handleDeliberer = async () => {
    if (!selectedParcours) return toast.error('Sélectionner un parcours');
    if (!confirm('Lancer la délibération ? Les notes seront verrouillées.')) return;
    try {
      await academicApi.deliberer(tid, { parcoursId: selectedParcours, semestre: 1, annee: '2024-2025' });
      toast.success('Délibération effectuée — notes verrouillées');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur délibération');
    }
  };

  return (
    <div style={{ padding: 32, background: '#F5F5F0', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 10 }}><FileText size={28} /> Saisie et Gestion des Notes</h1>
          <p style={{ color: '#64748b', fontSize: 14 }}>Calcul automatique des moyennes · Verrouillage après délibération</p>
        </div>
        <button onClick={handleDeliberer} style={{ padding: '11px 18px', background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
<Trophy size={16} style={{ marginRight: 6 }} /> Lancer Délibération
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 20 }}>
        {/* Formulaire */}
        <div style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 20px' }}>Saisir une Note</h3>
          <form onSubmit={handleSaisir}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Parcours</label>
              <select value={selectedParcours} onChange={e => setSelectedParcours(e.target.value)}
                style={{ width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14, background: '#fff' }}>
                <option value="">— Sélectionner un parcours —</option>
                {parcours.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Unité d'Enseignement (UE)</label>
              <select value={form.ueId} onChange={e => setForm(f => ({ ...f, ueId: e.target.value }))} required
                style={{ width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14, background: '#fff' }}>
                <option value="">— Sélectionner une UE —</option>
                {ues.map(u => <option key={u.id} value={u.id}>{u.code} — {u.name}</option>)}
              </select>
            </div>
            {[
              { label: 'Matricule Étudiant', key: 'etudiantId', placeholder: 'ETU-2024-001' },
              { label: 'Note CC / 20', key: 'noteCC', placeholder: '14.5', type: 'number' },
              { label: 'Note Examen / 20', key: 'noteExam', placeholder: '12.0', type: 'number' },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>{f.label}</label>
                <input type={f.type || 'text'} placeholder={f.placeholder} value={(form as any)[f.key]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  min={f.type === 'number' ? 0 : undefined} max={f.type === 'number' ? 20 : undefined} step={f.type === 'number' ? 0.25 : undefined}
                  style={{ width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14, outline: 'none' }}
                  onFocus={e => e.target.style.borderColor = '#1a5276'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
              </div>
            ))}
            {form.noteCC && form.noteExam && (
              <div style={{ background: '#f0fdf4', borderRadius: 10, padding: '10px 14px', marginBottom: 14, border: '1px solid #bbf7d0' }}>
                <span style={{ fontSize: 13, color: '#166534', fontWeight: 600 }}>
                  Prévisualisation Moyenne : {(Number(form.noteCC) * 0.4 + Number(form.noteExam) * 0.6).toFixed(2)} / 20
                </span>
              </div>
            )}
            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '13px',
              background: loading ? '#94a3b8' : 'linear-gradient(135deg, #1a5276, #148f77)',
              color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
            }}>
              {loading ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><Clock size={16} /> Enregistrement...</span> : <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><Save size={16} /> Enregistrer la Note</span>}
            </button>
          </form>
        </div>

        {/* Notes affichées */}
        <div style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 16px' }}>
            Relevé de Notes — {form.etudiantId || 'Saisir un matricule'}
          </h3>
          {notes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <span style={{ display: 'flex', justifyContent: 'center' }}><ClipboardList size={40} color="#94a3b8" /></span>
              <p style={{ color: '#94a3b8', fontSize: 13, marginTop: 12 }}>Saisir un matricule pour afficher les notes</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['UE', 'CC', 'Examen', 'Moyenne', 'Mention', 'Statut'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {notes.map((n, i) => (
                  <tr key={i} style={{ borderTop: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px', fontSize: 12, color: '#64748b' }}>{n.ueId?.slice(0, 8)}</td>
                    <td style={{ padding: '12px', fontSize: 13 }}>{n.noteCC ?? '—'}</td>
                    <td style={{ padding: '12px', fontSize: 13 }}>{n.noteExam ?? '—'}</td>
                    <td style={{ padding: '12px', fontSize: 15, fontWeight: 800, color: Number(n.noteFinal) >= 10 ? '#148f77' : '#e74c3c' }}>
                      {n.noteFinal ?? '—'}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ padding: '3px 8px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: Number(n.noteFinal) >= 10 ? '#dcfce7' : '#fef2f2', color: Number(n.noteFinal) >= 10 ? '#166534' : '#991b1b' }}>
                        {n.mention || '—'}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ display: 'flex' }}>{n.isLocked ? <Lock size={16} color="#e74c3c" /> : <LockOpen size={16} color="#148f77" />}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};