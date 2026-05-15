import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, ArrowLeft, ChevronLeft, ChevronRight,
  Clock, MapPin, Users, BookOpen, Filter, Download, Printer
} from 'lucide-react';

interface Cours {
  id: string;
  matiere: string;
  code: string;
  type: 'CM' | 'TD' | 'TP';
  enseignant: string;
  salle: string;
  classe: string;
  heureDebut: string;
  heureFin: string;
  jour: number; // 0 = Lundi, 4 = Vendredi
  effectif: number;
  couleur: string;
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

export const EmploiDuTempsSurveillance: React.FC = () => {
  const navigate = useNavigate();
  const [semaine, setSemaine] = useState<Semaine>({
    numero: 1,
    dateDebut: new Date(),
    dateFin: new Date()
  });
  const [cours, setCours] = useState<Cours[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterClasse, setFilterClasse] = useState<string>('all');
  const [filterSalle, setFilterSalle] = useState<string>('all');
  const [classes, setClasses] = useState<string[]>([]);
  const [salles, setSalles] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'semaine' | 'jour'>('semaine');
  const [jourSelectionne, setJourSelectionne] = useState<number>(0);

  useEffect(() => {
    loadEmploiDuTemps();
  }, [semaine, filterClasse, filterSalle]);

  const loadEmploiDuTemps = async () => {
    try {
      // TODO: Remplacer par appel API réel
      const mockCours: Cours[] = [
        {
          id: '1',
          matiere: 'Mathématiques Appliquées',
          code: 'MATH301',
          type: 'CM',
          enseignant: 'Dr. KOUASSI',
          salle: 'Amphi A',
          classe: 'L3 Informatique',
          heureDebut: '08:00',
          heureFin: '10:00',
          jour: 0,
          effectif: 45,
          couleur: TYPE_COLORS.CM
        },
        {
          id: '2',
          matiere: 'Programmation Web',
          code: 'INFO205',
          type: 'TD',
          enseignant: 'Prof. DIALLO',
          salle: 'Salle B105',
          classe: 'L2 Informatique',
          heureDebut: '10:00',
          heureFin: '12:00',
          jour: 0,
          effectif: 38,
          couleur: TYPE_COLORS.TD
        },
        {
          id: '3',
          matiere: 'Base de Données',
          code: 'INFO302',
          type: 'TP',
          enseignant: 'Dr. TRAORE',
          salle: 'Lab C201',
          classe: 'L3 Informatique',
          heureDebut: '14:00',
          heureFin: '17:00',
          jour: 0,
          effectif: 42,
          couleur: TYPE_COLORS.TP
        },
        {
          id: '4',
          matiere: 'Réseaux Informatiques',
          code: 'INFO401',
          type: 'CM',
          enseignant: 'Prof. KONE',
          salle: 'Amphi B',
          classe: 'L3 Informatique',
          heureDebut: '08:00',
          heureFin: '10:00',
          jour: 1,
          effectif: 50,
          couleur: TYPE_COLORS.CM
        },
        {
          id: '5',
          matiere: 'Gestion de Projet',
          code: 'GEST201',
          type: 'TD',
          enseignant: 'Dr. COULIBALY',
          salle: 'Salle A203',
          classe: 'L2 Gestion',
          heureDebut: '10:00',
          heureFin: '12:00',
          jour: 1,
          effectif: 35,
          couleur: TYPE_COLORS.TD
        },
        {
          id: '6',
          matiere: 'Comptabilité Analytique',
          code: 'COMPTA301',
          type: 'CM',
          enseignant: 'Prof. BAMBA',
          salle: 'Amphi C',
          classe: 'L3 Gestion',
          heureDebut: '14:00',
          heureFin: '16:00',
          jour: 2,
          effectif: 48,
          couleur: TYPE_COLORS.CM
        },
        {
          id: '7',
          matiere: 'Systèmes d\'Exploitation',
          code: 'INFO305',
          type: 'TP',
          enseignant: 'Dr. KOUASSI',
          salle: 'Lab B102',
          classe: 'L3 Informatique',
          heureDebut: '08:00',
          heureFin: '11:00',
          jour: 3,
          effectif: 40,
          couleur: TYPE_COLORS.TP
        },
        {
          id: '8',
          matiere: 'Marketing Digital',
          code: 'MARK201',
          type: 'TD',
          enseignant: 'Prof. DIALLO',
          salle: 'Salle C105',
          classe: 'L2 Gestion',
          heureDebut: '14:00',
          heureFin: '16:00',
          jour: 3,
          effectif: 32,
          couleur: TYPE_COLORS.TD
        },
        {
          id: '9',
          matiere: 'Intelligence Artificielle',
          code: 'INFO501',
          type: 'CM',
          enseignant: 'Dr. TRAORE',
          salle: 'Amphi A',
          classe: 'M1 Informatique',
          heureDebut: '08:00',
          heureFin: '10:00',
          jour: 4,
          effectif: 30,
          couleur: TYPE_COLORS.CM
        },
        {
          id: '10',
          matiere: 'Droit des Affaires',
          code: 'DROIT301',
          type: 'CM',
          enseignant: 'Prof. KONE',
          salle: 'Amphi B',
          classe: 'L3 Gestion',
          heureDebut: '10:00',
          heureFin: '12:00',
          jour: 4,
          effectif: 45,
          couleur: TYPE_COLORS.CM
        }
      ];

      setCours(mockCours);

      // Extraire les classes et salles uniques
      const uniqueClasses = [...new Set(mockCours.map(c => c.classe))];
      const uniqueSalles = [...new Set(mockCours.map(c => c.salle))];
      setClasses(uniqueClasses);
      setSalles(uniqueSalles);

      setLoading(false);
    } catch (error) {
      console.error('Erreur chargement EDT:', error);
      setLoading(false);
    }
  };

  const changerSemaine = (direction: 'prev' | 'next') => {
    const newSemaine = { ...semaine };
    if (direction === 'prev') {
      newSemaine.numero--;
      newSemaine.dateDebut = new Date(newSemaine.dateDebut.getTime() - 7 * 24 * 60 * 60 * 1000);
      newSemaine.dateFin = new Date(newSemaine.dateFin.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else {
      newSemaine.numero++;
      newSemaine.dateDebut = new Date(newSemaine.dateDebut.getTime() + 7 * 24 * 60 * 60 * 1000);
      newSemaine.dateFin = new Date(newSemaine.dateFin.getTime() + 7 * 24 * 60 * 60 * 1000);
    }
    setSemaine(newSemaine);
  };

  const filteredCours = cours.filter(c => {
    const matchClasse = filterClasse === 'all' || c.classe === filterClasse;
    const matchSalle = filterSalle === 'all' || c.salle === filterSalle;
    return matchClasse && matchSalle;
  });

  const getCoursForSlot = (jour: number, heure: string) => {
    return filteredCours.filter(c => {
      if (c.jour !== jour) return false;
      const heureDebut = c.heureDebut;
      const heureFin = c.heureFin;
      return heure >= heureDebut && heure < heureFin;
    });
  };

  const calculateCoursHeight = (heureDebut: string, heureFin: string) => {
    const debut = HEURES.indexOf(heureDebut);
    const fin = HEURES.indexOf(heureFin);
    return (fin - debut) * 60; // 60px par demi-heure
  };

  const exportPDF = () => {
    alert('Export PDF en cours de développement...');
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
            Emploi du Temps
          </h2>
          <p className="text-muted mb-0">Consultation des emplois du temps (lecture seule)</p>
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
                  Semaine {semaine.numero}
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
                value={filterClasse}
                onChange={(e) => setFilterClasse(e.target.value)}
              >
                <option value="all">Toutes les classes</option>
                {classes.map(classe => (
                  <option key={classe} value={classe}>{classe}</option>
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
                {salles.map(salle => (
                  <option key={salle} value={salle}>{salle}</option>
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
                        const coursSlot = getCoursForSlot(jourIndex, heure);
                        const isFirstSlot = coursSlot.length > 0 && coursSlot[0].heureDebut === heure;
                        
                        return (
                          <td 
                            key={jourIndex} 
                            className="p-1 position-relative"
                            style={{ verticalAlign: 'top' }}
                          >
                            {isFirstSlot && coursSlot.map(c => (
                              <div
                                key={c.id}
                                className="rounded p-2 text-white small position-absolute w-100"
                                style={{
                                  backgroundColor: c.couleur,
                                  height: `${calculateCoursHeight(c.heureDebut, c.heureFin)}px`,
                                  left: 0,
                                  top: 0,
                                  overflow: 'hidden',
                                  cursor: 'pointer',
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }}
                                title={`${c.matiere} - ${c.enseignant}`}
                              >
                                <div className="fw-bold mb-1" style={{ fontSize: '11px' }}>
                                  {c.code} - {c.type}
                                </div>
                                <div style={{ fontSize: '10px', lineHeight: 1.3 }}>
                                  {c.matiere}
                                </div>
                                <div style={{ fontSize: '10px', opacity: 0.9 }} className="mt-1">
                                  <MapPin size={10} className="me-1" />
                                  {c.salle}
                                </div>
                                <div style={{ fontSize: '10px', opacity: 0.9 }}>
                                  <Users size={10} className="me-1" />
                                  {c.classe}
                                </div>
                                <div style={{ fontSize: '10px', opacity: 0.9 }}>
                                  <Clock size={10} className="me-1" />
                                  {c.heureDebut} - {c.heureFin}
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
            {filteredCours
              .filter(c => c.jour === jourSelectionne)
              .sort((a, b) => a.heureDebut.localeCompare(b.heureDebut))
              .map(c => (
                <div key={c.id} className="col-12">
                  <div 
                    className="card border-0 shadow-sm"
                    style={{ borderLeft: `4px solid ${c.couleur}` }}
                  >
                    <div className="card-body">
                      <div className="row align-items-center">
                        <div className="col-12 col-md-8">
                          <div className="d-flex align-items-center mb-2">
                            <span 
                              className="badge me-2"
                              style={{ backgroundColor: c.couleur }}
                            >
                              {c.type}
                            </span>
                            <h5 className="mb-0">{c.matiere}</h5>
                          </div>
                          <div className="text-muted small">
                            <div className="mb-1">
                              <BookOpen size={14} className="me-2" />
                              <strong>Code:</strong> {c.code}
                            </div>
                            <div className="mb-1">
                              <Users size={14} className="me-2" />
                              <strong>Classe:</strong> {c.classe} ({c.effectif} étudiants)
                            </div>
                            <div className="mb-1">
                              <MapPin size={14} className="me-2" />
                              <strong>Salle:</strong> {c.salle}
                            </div>
                            <div>
                              👨‍🏫 <strong>Enseignant:</strong> {c.enseignant}
                            </div>
                          </div>
                        </div>
                        <div className="col-12 col-md-4 text-md-end mt-3 mt-md-0">
                          <div className="d-flex align-items-center justify-content-md-end">
                            <Clock size={20} className="me-2 text-primary" />
                            <div>
                              <div className="fw-bold">{c.heureDebut} - {c.heureFin}</div>
                              <small className="text-muted">
                                {Math.floor((new Date(`2000-01-01 ${c.heureFin}`).getTime() - new Date(`2000-01-01 ${c.heureDebut}`).getTime()) / 3600000)}h
                              </small>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            {filteredCours.filter(c => c.jour === jourSelectionne).length === 0 && (
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

export default EmploiDuTempsSurveillance;

// Made with Bob
