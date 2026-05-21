import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, ArrowLeft, ChevronLeft, ChevronRight,
  Clock, MapPin, Users, BookOpen, Filter, Download, Printer, AlertCircle
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../api/client';
import toast from 'react-hot-toast';

interface Seance {
  id: string;
  ueId: string;
  ecId?: string;
  enseignantId: string;
  parcoursId: string;
  salleId: string;
  dateSeance: string;
  heureDebut: string;
  heureFin: string;
  type: 'CM' | 'TD' | 'TP';
  statut: string;
  // Relations
  ue?: { code: string; intitule: string };
  ec?: { code: string; intitule: string };
  enseignant?: { firstName: string; lastName: string };
  parcours?: { name: string; level: string };
  salle?: { nom: string; batiment?: string; capacite?: number };
}

interface Semaine {
  numero: number;
  dateDebut: Date;
  dateFin: Date;
}

const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const HEURES = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00'
];

const TYPE_COLORS: Record<string, string> = {
  CM: '#3b82f6',
  TD: '#10b981',
  TP: '#f59e0b'
};

export const EmploiDuTempsReadOnly: React.FC = () => {
  const navigate = useNavigate();
  const { tenant } = useAuthStore();
  const [semaine, setSemaine] = useState<Semaine>(getWeekDates(new Date()));
  const [seances, setSeances] = useState<Seance[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterParcours, setFilterParcours] = useState<string>('all');
  const [filterSalle, setFilterSalle] = useState<string>('all');
  const [parcoursList, setParcoursList] = useState<any[]>([]);
  const [sallesList, setSallesList] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'semaine' | 'jour'>('semaine');
  const [jourSelectionne, setJourSelectionne] = useState<number>(new Date().getDay() - 1);

  function getWeekDates(date: Date): Semaine {
    const curr = new Date(date);
    const first = curr.getDate() - curr.getDay() + 1; // Lundi
    const dateDebut = new Date(curr.setDate(first));
    const dateFin = new Date(dateDebut);
    dateFin.setDate(dateDebut.getDate() + 5); // Samedi
    
    return {
      numero: getWeekNumber(dateDebut),
      dateDebut,
      dateFin
    };
  }

  function getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }

  useEffect(() => {
    loadEmploiDuTemps();
  }, [semaine, filterParcours]);

  const loadEmploiDuTemps = async () => {
    if (!tenant?.id) return;
    
    setLoading(true);
    try {
      const params: any = {
        dateDebut: semaine.dateDebut.toISOString().split('T')[0],
        dateFin: semaine.dateFin.toISOString().split('T')[0]
      };

      if (filterParcours !== 'all') {
        params.parcoursId = filterParcours;
      }

      const response = await api.get(`/secretaire/${tenant.id}/emploi-du-temps`, { params });
      
      if (response.data && Array.isArray(response.data)) {
        setSeances(response.data);
        
        // Extraire les parcours et salles uniques
        const uniqueParcours = Array.from(new Set(response.data.map((s: Seance) => s.parcours).filter(Boolean)));
        const uniqueSalles = Array.from(new Set(response.data.map((s: Seance) => s.salle).filter(Boolean)));
        
        setParcoursList(uniqueParcours as any[]);
        setSallesList(uniqueSalles as any[]);
      }
    } catch (error: any) {
      console.error('Erreur chargement EDT:', error);
      toast.error(error.response?.data?.message || 'Erreur lors du chargement de l\'emploi du temps');
      setSeances([]);
    } finally {
      setLoading(false);
    }
  };

  const changerSemaine = (direction: 'prev' | 'next') => {
    const newDate = new Date(semaine.dateDebut);
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    setSemaine(getWeekDates(newDate));
  };

  const filteredSeances = seances.filter(s => {
    const matchSalle = filterSalle === 'all' || s.salle?.nom === filterSalle;
    return matchSalle;
  });

  const getSeancesForSlot = (jour: number, heure: string) => {
    return filteredSeances.filter(s => {
      const seanceDate = new Date(s.dateSeance);
      const jourSeance = seanceDate.getDay() - 1; // 0 = Lundi
      if (jourSeance !== jour) return false;
      
      return heure >= s.heureDebut && heure < s.heureFin;
    });
  };

  const calculateSeanceHeight = (heureDebut: string, heureFin: string) => {
    const debut = HEURES.indexOf(heureDebut);
    const fin = HEURES.indexOf(heureFin);
    return (fin - debut) * 60; // 60px par demi-heure
  };

  const exportPDF = () => {
    toast('Export PDF en cours de développement...', { icon: 'ℹ️' });
  };

  const imprimer = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col">
          <button className="btn btn-link text-decoration-none p-0 mb-2" onClick={() => navigate('/surveillance')}>
            <ArrowLeft size={20} className="me-2" />
            Retour au Dashboard
          </button>
          <h2 className="mb-1">
            <Calendar className="me-2" size={28} />
            Emploi du Temps (Consultation)
          </h2>
          <p className="text-muted mb-0">
            <AlertCircle size={16} className="me-1" />
            Vue en lecture seule - Surveillant Général
          </p>
        </div>
        <div className="col-auto">
          <button className="btn btn-outline-primary me-2" onClick={exportPDF}>
            <Download size={18} className="me-2" />
            Exporter PDF
          </button>
          <button className="btn btn-outline-secondary" onClick={imprimer}>
            <Printer size={18} className="me-2" />
            Imprimer
          </button>
        </div>
      </div>

      {/* Filters & Navigation */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3 align-items-center">
            <div className="col-12 col-md-auto">
              <div className="btn-group">
                <button 
                  className="btn btn-outline-primary"
                  onClick={() => changerSemaine('prev')}
                >
                  <ChevronLeft size={18} />
                </button>
                <button className="btn btn-outline-primary" disabled>
                  Semaine {semaine.numero} ({semaine.dateDebut.toLocaleDateString('fr-FR')} - {semaine.dateFin.toLocaleDateString('fr-FR')})
                </button>
                <button 
                  className="btn btn-outline-primary"
                  onClick={() => changerSemaine('next')}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
            <div className="col-12 col-md-auto">
              <div className="btn-group">
                <button 
                  className={`btn ${viewMode === 'semaine' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setViewMode('semaine')}
                >
                  Vue Semaine
                </button>
                <button 
                  className={`btn ${viewMode === 'jour' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setViewMode('jour')}
                >
                  Vue Jour
                </button>
              </div>
            </div>
            <div className="col-12 col-md-3">
              <select 
                className="form-select"
                value={filterParcours}
                onChange={(e) => setFilterParcours(e.target.value)}
              >
                <option value="all">Tous les parcours</option>
                {parcoursList.map((p: any) => (
                  <option key={p.id} value={p.id}>{p.name} - {p.level}</option>
                ))}
              </select>
            </div>
            <div className="col-12 col-md-3">
              <select 
                className="form-select"
                value={filterSalle}
                onChange={(e) => setFilterSalle(e.target.value)}
              >
                <option value="all">Toutes les salles</option>
                {sallesList.map((s: any) => (
                  <option key={s.id} value={s.nom}>{s.nom}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Légende */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="d-flex gap-4 flex-wrap">
            <div className="d-flex align-items-center">
              <div className="rounded me-2" style={{ width: 20, height: 20, backgroundColor: TYPE_COLORS.CM }}></div>
              <span className="small">CM - Cours Magistral</span>
            </div>
            <div className="d-flex align-items-center">
              <div className="rounded me-2" style={{ width: 20, height: 20, backgroundColor: TYPE_COLORS.TD }}></div>
              <span className="small">TD - Travaux Dirigés</span>
            </div>
            <div className="d-flex align-items-center">
              <div className="rounded me-2" style={{ width: 20, height: 20, backgroundColor: TYPE_COLORS.TP }}></div>
              <span className="small">TP - Travaux Pratiques</span>
            </div>
          </div>
        </div>
      </div>

      {/* Vue Semaine */}
      {viewMode === 'semaine' && (
        <div className="card border-0 shadow-sm">
          <div className="card-body p-0">
            <div className="table-responsive" style={{ overflowX: 'auto' }}>
              <table className="table table-bordered mb-0" style={{ minWidth: '1200px' }}>
                <thead className="table-light">
                  <tr>
                    <th style={{ width: '80px', position: 'sticky', left: 0, backgroundColor: '#f8f9fa', zIndex: 10 }}>
                      Heure
                    </th>
                    {JOURS.map((jour, index) => (
                      <th key={index} className="text-center">
                        {jour}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {HEURES.map((heure, heureIndex) => (
                    <tr key={heureIndex} style={{ height: '60px' }}>
                      <td 
                        className="text-center align-middle small fw-semibold"
                        style={{ position: 'sticky', left: 0, backgroundColor: '#fff', zIndex: 9 }}
                      >
                        {heure}
                      </td>
                      {JOURS.map((_, jourIndex) => {
                        const seancesSlot = getSeancesForSlot(jourIndex, heure);
                        const isFirstSlot = seancesSlot.length > 0 && seancesSlot[0].heureDebut === heure;
                        
                        return (
                          <td 
                            key={jourIndex} 
                            className="p-1 position-relative"
                            style={{ verticalAlign: 'top' }}
                          >
                            {isFirstSlot && seancesSlot.map(s => (
                              <div
                                key={s.id}
                                className="rounded p-2 text-white small position-absolute w-100"
                                style={{
                                  backgroundColor: TYPE_COLORS[s.type] || '#6c757d',
                                  height: `${calculateSeanceHeight(s.heureDebut, s.heureFin)}px`,
                                  left: 0,
                                  top: 0,
                                  overflow: 'hidden',
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }}
                                title={`${s.ue?.intitule || s.ec?.intitule} - ${s.enseignant?.firstName} ${s.enseignant?.lastName}`}
                              >
                                <div className="fw-bold mb-1" style={{ fontSize: '11px' }}>
                                  {s.ue?.code || s.ec?.code} - {s.type}
                                </div>
                                <div style={{ fontSize: '10px', lineHeight: 1.3 }}>
                                  {s.ue?.intitule || s.ec?.intitule}
                                </div>
                                <div style={{ fontSize: '10px', opacity: 0.9 }} className="mt-1">
                                  <MapPin size={10} className="me-1" />
                                  {s.salle?.nom}
                                </div>
                                <div style={{ fontSize: '10px', opacity: 0.9 }}>
                                  <Users size={10} className="me-1" />
                                  {s.parcours?.name}
                                </div>
                                <div style={{ fontSize: '10px', opacity: 0.9 }}>
                                  <Clock size={10} className="me-1" />
                                  {s.heureDebut} - {s.heureFin}
                                </div>
                              </div>
                            ))}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Vue Jour */}
      {viewMode === 'jour' && (
        <>
          <div className="btn-group mb-3 w-100">
            {JOURS.map((jour, index) => (
              <button
                key={index}
                className={`btn ${jourSelectionne === index ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setJourSelectionne(index)}
              >
                {jour}
              </button>
            ))}
          </div>
          <div className="row g-3">
            {filteredSeances
              .filter(s => {
                const seanceDate = new Date(s.dateSeance);
                const jourSeance = seanceDate.getDay() - 1;
                return jourSeance === jourSelectionne;
              })
              .sort((a, b) => a.heureDebut.localeCompare(b.heureDebut))
              .map(s => (
                <div key={s.id} className="col-12">
                  <div 
                    className="card border-0 shadow-sm"
                    style={{ borderLeft: `4px solid ${TYPE_COLORS[s.type] || '#6c757d'}` }}
                  >
                    <div className="card-body">
                      <div className="row align-items-center">
                        <div className="col-12 col-md-8">
                          <div className="d-flex align-items-center mb-2">
                            <span 
                              className="badge me-2"
                              style={{ backgroundColor: TYPE_COLORS[s.type] || '#6c757d' }}
                            >
                              {s.type}
                            </span>
                            <h5 className="mb-0">{s.ue?.intitule || s.ec?.intitule}</h5>
                          </div>
                          <div className="text-muted small">
                            <div className="mb-1">
                              <BookOpen size={14} className="me-2" />
                              <strong>Code:</strong> {s.ue?.code || s.ec?.code}
                            </div>
                            <div className="mb-1">
                              <Users size={14} className="me-2" />
                              <strong>Parcours:</strong> {s.parcours?.name} - {s.parcours?.level}
                            </div>
                            <div className="mb-1">
                              <MapPin size={14} className="me-2" />
                              <strong>Salle:</strong> {s.salle?.nom} {s.salle?.batiment && `(${s.salle.batiment})`}
                            </div>
                            <div>
                              👨‍🏫 <strong>Enseignant:</strong> {s.enseignant?.firstName} {s.enseignant?.lastName}
                            </div>
                          </div>
                        </div>
                        <div className="col-12 col-md-4 text-md-end mt-3 mt-md-0">
                          <div className="d-flex align-items-center justify-content-md-end">
                            <Clock size={20} className="me-2 text-primary" />
                            <div>
                              <div className="fw-bold">{s.heureDebut} - {s.heureFin}</div>
                              <small className="text-muted">
                                {(() => {
                                  const [hD, mD] = s.heureDebut.split(':').map(Number);
                                  const [hF, mF] = s.heureFin.split(':').map(Number);
                                  const minutes = (hF * 60 + mF) - (hD * 60 + mD);
                                  return `${Math.floor(minutes / 60)}h${minutes % 60 > 0 ? minutes % 60 : ''}`;
                                })()}
                              </small>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            {filteredSeances.filter(s => {
              const seanceDate = new Date(s.dateSeance);
              const jourSeance = seanceDate.getDay() - 1;
              return jourSeance === jourSelectionne;
            }).length === 0 && (
              <div className="col-12">
                <div className="card border-0 shadow-sm">
                  <div className="card-body text-center py-5">
                    <Calendar size={48} className="text-muted mb-3 opacity-25" />
                    <p className="text-muted">Aucun cours prévu pour ce jour</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default EmploiDuTempsReadOnly;

// Made with Bob