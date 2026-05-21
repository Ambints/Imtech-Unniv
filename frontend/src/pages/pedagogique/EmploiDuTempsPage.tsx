import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../api/client';
import toast from 'react-hot-toast';
import {
  Calendar, Clock, MapPin, Users, Plus, X, ChevronLeft, ChevronRight,
  AlertTriangle, CheckCircle, Building2, Search
} from 'lucide-react';

interface Seance {
  id: string;
  dateSeance: string;
  heureDebut: string;
  heureFin: string;
  typeSeance: string;
  statut: string;
  salleId?: string;
  affectationId: string;
  createdById?: string;
  canEdit?: boolean;
  canDelete?: boolean;
  ue?: {
    id: string;
    code: string;
    intitule: string;
  };
  salle?: {
    id: string;
    nom: string;
    capacite: number;
  };
  enseignant?: {
    id: string;
    nom: string;
    prenom: string;
  };
}

interface Parcours {
  id: string;
  code: string;
  nom: string;
}

interface Salle {
  id: string;
  nom: string;
  capacite: number;
  typeSalle: string;
}

interface Affectation {
  id: string;
  enseignantId: string;
  ueId?: string;
  enseignant?: {
    nom: string;
    prenom: string;
  };
  uniteEnseignement?: {
    code: string;
    intitule: string;
  };
}

interface Conflit {
  type: 'salle' | 'enseignant';
  message: string;
  seanceExistante: Seance;
}

export const EmploiDuTempsPage: React.FC = () => {
  const { user, tenant } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [parcoursList, setParcoursList] = useState<Parcours[]>([]);
  const [selectedParcours, setSelectedParcours] = useState<string>('');
  const [seances, setSeances] = useState<Seance[]>([]);
  const [salles, setSalles] = useState<Salle[]>([]);
  const [affectations, setAffectations] = useState<Affectation[]>([]);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(getWeekStart(new Date()));
  const [showModal, setShowModal] = useState(false);
  const [conflits, setConflits] = useState<Conflit[]>([]);
  const [showConflitsModal, setShowConflitsModal] = useState(false);
  const [formData, setFormData] = useState({
    affectationId: '',
    salleId: '',
    dateSeance: '',
    heureDebut: '',
    heureFin: '',
    typeSeance: 'CM',
  });

  useEffect(() => {
    loadParcours();
    loadSalles();
  }, [user, tenant]);

  useEffect(() => {
    if (selectedParcours) {
      loadAffectations();
      loadEmploiDuTemps();
    }
  }, [selectedParcours, currentWeekStart]);

  function getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }

  function formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  function addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  const loadParcours = async () => {
    try {
      const tid = tenant?.id || user?.tenantId;
      if (!tid) return;

      const response = await api.get(`/academic/${tid}/parcours`);
      const parcours = response.data || [];
      setParcoursList(parcours);
      
      if (parcours.length > 0 && !selectedParcours) {
        setSelectedParcours(parcours[0].id);
      }
    } catch (err: any) {
      toast.error('Erreur lors du chargement des parcours');
    }
  };

  const loadSalles = async () => {
    try {
      const tid = tenant?.id || user?.tenantId;
      if (!tid) return;

      const response = await api.get(`/academic/${tid}/salles`);
      setSalles(response.data || []);
    } catch (err: any) {
      toast.error('Erreur lors du chargement des salles');
    }
  };

  const loadAffectations = async () => {
    try {
      const tid = tenant?.id || user?.tenantId;
      if (!tid || !selectedParcours) return;

      const response = await api.get(`/pedagogique/${tid}/affectations`);
      // Filtrer par parcours via les UE
      const affectationsData = response.data || [];
      setAffectations(affectationsData);
    } catch (err: any) {
      toast.error('Erreur lors du chargement des affectations');
    }
  };

  const loadEmploiDuTemps = async () => {
    if (!selectedParcours) return;
    
    setLoading(true);
    try {
      const tid = tenant?.id || user?.tenantId;
      const dateDebut = formatDate(currentWeekStart);
      const dateFin = formatDate(addDays(currentWeekStart, 6));

      const response = await api.get(
        `/secretaire/${tid}/emploi-du-temps?parcoursId=${selectedParcours}&dateDebut=${dateDebut}&dateFin=${dateFin}`
      );
      setSeances(response.data || []);
    } catch (err: any) {
      toast.error('Erreur lors du chargement de l\'emploi du temps');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSeance = async (ignorerConflits = false) => {
    try {
      const tid = tenant?.id || user?.tenantId;
      
      const response = await api.post(
        `/secretaire/${tid}/emploi-du-temps?ignorerConflits=${ignorerConflits}`,
        {
          ...formData,
          anneeAcademiqueId: 'current', // Sera déterminé côté serveur
        }
      );

      toast.success('Séance créée avec succès');
      setShowModal(false);
      setConflits([]);
      setShowConflitsModal(false);
      loadEmploiDuTemps();
      setFormData({
        affectationId: '',
        salleId: '',
        dateSeance: '',
        heureDebut: '',
        heureFin: '',
        typeSeance: 'CM',
      });
    } catch (err: any) {
      if (err.response?.data?.conflits) {
        setConflits(err.response.data.conflits);
        setShowConflitsModal(true);
      } else {
        toast.error(err.response?.data?.message || 'Erreur lors de la création');
      }
    }
  };

  const verifierConflits = async () => {
    try {
      const tid = tenant?.id || user?.tenantId;
      
      const response = await api.post(
        `/secretaire/${tid}/emploi-du-temps/verifier-conflits`,
        {
          ...formData,
          anneeAcademiqueId: 'current',
        }
      );

      if (response.data.length > 0) {
        setConflits(response.data);
        setShowConflitsModal(true);
      } else {
        await handleCreateSeance(false);
      }
    } catch (err: any) {
      toast.error('Erreur lors de la vérification des conflits');
    }
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = addDays(currentWeekStart, direction === 'prev' ? -7 : 7);
    setCurrentWeekStart(newDate);
  };

  const weekDays = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

  const getSeancesForDay = (dayIndex: number) => {
    const date = formatDate(addDays(currentWeekStart, dayIndex));
    return seances.filter(s => s.dateSeance === date);
  };

  return (
    <div style={{ padding: 32 }}>
      {/* Header */}
      <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1e293b', margin: '0 0 8px' }}>
            Emploi du temps
          </h1>
          <p style={{ color: '#64748b', fontSize: 14 }}>
            Planification des séances de cours et gestion des conflits
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{
            padding: '12px 20px',
            background: '#1a5276',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          <Plus size={18} />
          Nouvelle séance
        </button>
      </div>

      {/* Filtres */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <div>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
            Parcours
          </label>
          <select
            value={selectedParcours}
            onChange={(e) => setSelectedParcours(e.target.value)}
            style={{
              padding: '10px 16px',
              borderRadius: 8,
              border: '1px solid #d1d5db',
              fontSize: 14,
              minWidth: 250
            }}
          >
            {parcoursList.map(p => (
              <option key={p.id} value={p.id}>
                {p.code} - {p.nom}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
            Semaine
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => navigateWeek('prev')}
              style={{
                padding: 10,
                border: '1px solid #d1d5db',
                borderRadius: 8,
                background: 'white',
                cursor: 'pointer'
              }}
            >
              <ChevronLeft size={18} />
            </button>
            <span style={{ padding: '10px 16px', fontSize: 14, fontWeight: 500 }}>
              {formatDate(currentWeekStart)} au {formatDate(addDays(currentWeekStart, 5))}
            </span>
            <button
              onClick={() => navigateWeek('next')}
              style={{
                padding: 10,
                border: '1px solid #d1d5db',
                borderRadius: 8,
                background: 'white',
                cursor: 'pointer'
              }}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Planning */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>Chargement...</div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: 16 
        }}>
          {weekDays.map((day, index) => {
            const daySeances = getSeancesForDay(index);
            const date = formatDate(addDays(currentWeekStart, index));
            
            return (
              <div key={day} style={{
                background: 'white',
                borderRadius: 12,
                padding: 16,
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                minHeight: 200
              }}>
                <div style={{ 
                  borderBottom: '2px solid #e5e7eb', 
                  paddingBottom: 12, 
                  marginBottom: 12 
                }}>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1e293b' }}>
                    {day}
                  </h3>
                  <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>{date}</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {daySeances.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: 13, padding: 20 }}>
                      Aucune séance
                    </p>
                  ) : (
                    daySeances.map(seance => (
                      <div
                        key={seance.id}
                        style={{
                          padding: 12,
                          background: seance.statut === 'annule' ? '#fee2e2' : '#f0f9ff',
                          borderRadius: 8,
                          borderLeft: `4px solid ${seance.statut === 'annule' ? '#ef4444' : '#1a5276'}`,
                          opacity: seance.statut === 'annule' ? 0.7 : 1,
                          position: 'relative'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                          <Clock size={14} color="#64748b" />
                          <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
                            {seance.heureDebut} - {seance.heureFin}
                          </span>
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 4 }}>
                          {seance.ue?.code} - {seance.ue?.intitule}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#64748b' }}>
                          <MapPin size={12} />
                          {seance.salle?.nom || 'Salle non assignée'}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#64748b' }}>
                          <Users size={12} />
                          {seance.enseignant?.prenom} {seance.enseignant?.nom}
                        </div>
                        {seance.statut === 'annule' && (
                          <span style={{
                            fontSize: 11,
                            color: '#dc2626',
                            fontWeight: 600,
                            marginTop: 4,
                            display: 'inline-block'
                          }}>
                            Annulé
                          </span>
                        )}
                        
                        {/* Permissions-based action buttons */}
                        {(seance.canEdit || seance.canDelete) && (
                          <div style={{
                            marginTop: 8,
                            paddingTop: 8,
                            borderTop: '1px solid #e5e7eb',
                            display: 'flex',
                            gap: 6
                          }}>
                            {seance.canEdit && (
                              <button
                                onClick={() => {
                                  // TODO: Implement edit functionality
                                  toast('Fonctionnalité de modification à implémenter', { icon: 'ℹ️' });
                                }}
                                style={{
                                  padding: '4px 8px',
                                  fontSize: 11,
                                  background: '#3b82f6',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: 4,
                                  cursor: 'pointer',
                                  fontWeight: 600
                                }}
                                title="Modifier cette séance"
                              >
                                Modifier
                              </button>
                            )}
                            {seance.canDelete && (
                              <button
                                onClick={() => {
                                  // TODO: Implement delete functionality
                                  if (confirm('Voulez-vous vraiment supprimer cette séance ?')) {
                                    toast('Fonctionnalité de suppression à implémenter', { icon: 'ℹ️' });
                                  }
                                }}
                                style={{
                                  padding: '4px 8px',
                                  fontSize: 11,
                                  background: '#ef4444',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: 4,
                                  cursor: 'pointer',
                                  fontWeight: 600
                                }}
                                title="Supprimer cette séance"
                              >
                                Supprimer
                              </button>
                            )}
                            {!seance.canEdit && !seance.canDelete && (
                              <span style={{
                                fontSize: 10,
                                color: '#9ca3af',
                                fontStyle: 'italic'
                              }}>
                                Lecture seule (créée par un autre secrétaire)
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal création séance */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: 12,
            padding: 32,
            width: '90%',
            maxWidth: 500,
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Nouvelle séance</h2>
              <button
                onClick={() => setShowModal(false)}
                style={{ padding: 8, background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X size={24} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
                  Cours (UE/Enseignant)
                </label>
                <select
                  value={formData.affectationId}
                  onChange={(e) => setFormData({ ...formData, affectationId: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid #d1d5db',
                    fontSize: 14
                  }}
                >
                  <option value="">Sélectionner un cours</option>
                  {affectations.map(aff => (
                    <option key={aff.id} value={aff.id}>
                      {aff.uniteEnseignement?.code} - {aff.uniteEnseignement?.intitule} 
                      ({aff.enseignant?.prenom} {aff.enseignant?.nom})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
                  Salle
                </label>
                <select
                  value={formData.salleId}
                  onChange={(e) => setFormData({ ...formData, salleId: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid #d1d5db',
                    fontSize: 14
                  }}
                >
                  <option value="">Sélectionner une salle</option>
                  {salles.map(salle => (
                    <option key={salle.id} value={salle.id}>
                      {salle.nom} (Capacité: {salle.capacite})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
                  Date
                </label>
                <input
                  type="date"
                  value={formData.dateSeance}
                  onChange={(e) => setFormData({ ...formData, dateSeance: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid #d1d5db',
                    fontSize: 14
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
                    Heure début
                  </label>
                  <input
                    type="time"
                    value={formData.heureDebut}
                    onChange={(e) => setFormData({ ...formData, heureDebut: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: '1px solid #d1d5db',
                      fontSize: 14
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
                    Heure fin
                  </label>
                  <input
                    type="time"
                    value={formData.heureFin}
                    onChange={(e) => setFormData({ ...formData, heureFin: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: '1px solid #d1d5db',
                      fontSize: 14
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
                  Type de séance
                </label>
                <select
                  value={formData.typeSeance}
                  onChange={(e) => setFormData({ ...formData, typeSeance: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid #d1d5db',
                    fontSize: 14
                  }}
                >
                  <option value="CM">Cours Magistral (CM)</option>
                  <option value="TD">Travaux Dirigés (TD)</option>
                  <option value="TP">Travaux Pratiques (TP)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  border: '1px solid #d1d5db',
                  borderRadius: 8,
                  background: 'white',
                  cursor: 'pointer',
                  fontSize: 14
                }}
              >
                Annuler
              </button>
              <button
                onClick={verifierConflits}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  background: '#1a5276',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 600
                }}
              >
                Vérifier et créer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal conflits */}
      {showConflitsModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100
        }}>
          <div style={{
            background: 'white',
            borderRadius: 12,
            padding: 32,
            width: '90%',
            maxWidth: 500
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <AlertTriangle size={32} color="#f59e0b" />
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Conflits détectés</h2>
            </div>

            <p style={{ color: '#64748b', marginBottom: 16 }}>
              Des conflits ont été détectés lors de la vérification :
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
              {conflits.map((conflit, index) => (
                <div
                  key={index}
                  style={{
                    padding: 12,
                    background: '#fef3c7',
                    borderRadius: 8,
                    border: '1px solid #f59e0b'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    {conflit.type === 'salle' ? <Building2 size={16} color="#f59e0b" /> : <Users size={16} color="#f59e0b" />}
                    <span style={{ fontWeight: 600, color: '#92400e' }}>
                      Conflit de {conflit.type === 'salle' ? 'salle' : 'enseignant'}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: '#a16207' }}>{conflit.message}</p>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setShowConflitsModal(false)}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  border: '1px solid #d1d5db',
                  borderRadius: 8,
                  background: 'white',
                  cursor: 'pointer',
                  fontSize: 14
                }}
              >
                Modifier
              </button>
              <button
                onClick={() => handleCreateSeance(true)}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  background: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 600
                }}
              >
                Créer malgré les conflits
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmploiDuTempsPage;

// Made with Bob
