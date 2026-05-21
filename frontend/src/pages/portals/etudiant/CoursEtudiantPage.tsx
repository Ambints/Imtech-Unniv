import React from 'react';
import { BookOpen, Calendar, Clock, MapPin, User } from 'lucide-react';

export const CoursEtudiantPage: React.FC = () => {
  // Données mockées pour l'exemple
  const cours = [
    { id: 1, nom: 'Algorithmique Avancée', code: 'INF301', prof: 'Dr. RAKOTO', salle: 'Amphi A', jour: 'Lundi', heure: '08:00 - 10:00', type: 'CM' },
    { id: 2, nom: 'Base de Données', code: 'INF302', prof: 'Pr. ANDRIA', salle: 'Salle 201', jour: 'Lundi', heure: '10:15 - 12:15', type: 'TD' },
    { id: 3, nom: 'Réseaux Informatiques', code: 'INF303', prof: 'Dr. RABE', salle: 'Lab Info 1', jour: 'Mardi', heure: '14:00 - 17:00', type: 'TP' },
    { id: 4, nom: 'Génie Logiciel', code: 'INF304', prof: 'Pr. HERY', salle: 'Amphi B', jour: 'Mercredi', heure: '08:00 - 10:00', type: 'CM' },
    { id: 5, nom: 'Intelligence Artificielle', code: 'INF305', prof: 'Dr. FIDY', salle: 'Salle 305', jour: 'Jeudi', heure: '10:15 - 12:15', type: 'TD' },
  ];

  const typeColors: Record<string, { bg: string; text: string }> = {
    CM: { bg: '#dbeafe', text: '#1e40af' },
    TD: { bg: '#dcfce7', text: '#166534' },
    TP: { bg: '#fef3c7', text: '#92400e' },
  };

  return (
    <div style={{ padding: 32, background: '#F5F5F0', minHeight: '100vh' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <BookOpen size={32} color="#1a5276" />
          Mes Cours & Ressources
        </h1>
        <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>
          Emploi du temps et supports de cours
        </p>
      </div>

      {/* Emploi du temps */}
      <div style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 2px 10px rgba(0,0,0,0.07)', marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Calendar size={20} /> Emploi du Temps de la Semaine
        </h2>

        <div style={{ display: 'grid', gap: 12 }}>
          {cours.map(c => (
            <div key={c.id} style={{ display: 'flex', gap: 16, padding: 16, background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>{c.nom}</h3>
                  <span style={{ padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: typeColors[c.type].bg, color: typeColors[c.type].text }}>
                    {c.type}
                  </span>
                </div>
                <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 8px' }}>Code: {c.code}</p>
                <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#64748b' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <User size={14} /> {c.prof}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <MapPin size={14} /> {c.salle}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center', minWidth: 140 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1a5276', marginBottom: 4 }}>{c.jour}</div>
                <div style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={14} /> {c.heure}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ressources pédagogiques */}
      <div style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <BookOpen size={20} /> Supports de Cours
        </h2>
        <p style={{ color: '#94a3b8', textAlign: 'center', padding: 40, fontSize: 14 }}>
          Les supports de cours seront disponibles prochainement.
          <br />
          Consultez régulièrement cette section pour télécharger les documents partagés par vos enseignants.
        </p>
      </div>
    </div>
  );
};

// Made with Bob
