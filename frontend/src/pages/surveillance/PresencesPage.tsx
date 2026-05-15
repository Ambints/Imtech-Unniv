import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  QrCode, UserCheck, Users, CheckCircle, XCircle, 
  Clock, ArrowLeft, Camera, Upload, List, Grid
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

interface Cours {
  id: string;
  nom: string;
  code: string;
  horaire: string;
  salle: string;
  enseignant: string;
  effectif: number;
}

interface Etudiant {
  id: string;
  nom: string;
  prenom: string;
  matricule: string;
  photo?: string;
  statut?: 'present' | 'absent' | 'retard';
}

interface AppelSession {
  coursId: string;
  date: string;
  presences: Map<string, 'present' | 'absent' | 'retard'>;
}

export const PresencesPage: React.FC = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'selection' | 'qr' | 'manuel'>('selection');
  const [coursActuel, setCoursActuel] = useState<Cours | null>(null);
  const [coursList, setCoursList] = useState<Cours[]>([]);
  const [etudiants, setEtudiants] = useState<Etudiant[]>([]);
  const [appel, setAppel] = useState<AppelSession | null>(null);
  const [scanning, setScanning] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const qrReaderRef = useRef<Html5Qrcode | null>(null);
  const [cameraError, setCameraError] = useState<string>('');

  useEffect(() => {
    loadCours();
  }, []);

  useEffect(() => {
    if (coursActuel) {
      loadEtudiants(coursActuel.id);
      initAppel(coursActuel.id);
    }
  }, [coursActuel]);

  const loadCours = async () => {
    // TODO: Appel API pour charger les cours du jour
    setCoursList([]);
  };

  const loadEtudiants = async (coursId: string) => {
    // TODO: Appel API pour charger les étudiants du cours
    setEtudiants([]);
  };

  const initAppel = (coursId: string) => {
    setAppel({
      coursId,
      date: new Date().toISOString(),
      presences: new Map()
    });
  };

  const startQRScanner = async () => {
    try {
      setScanning(true);
      setCameraError('');
      
      const html5QrCode = new Html5Qrcode("qr-reader");
      qrReaderRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        (decodedText) => {
          handleQRCodeScanned(decodedText);
        },
        (errorMessage) => {
          // Ignorer les erreurs de scan normales
        }
      );
    } catch (err) {
      console.error('Erreur démarrage scanner:', err);
      setCameraError('Impossible d\'accéder à la caméra. Vérifiez les permissions.');
      setScanning(false);
    }
  };

  const stopQRScanner = async () => {
    if (qrReaderRef.current) {
      try {
        await qrReaderRef.current.stop();
        qrReaderRef.current = null;
      } catch (err) {
        console.error('Erreur arrêt scanner:', err);
      }
    }
    setScanning(false);
  };

  const handleQRCodeScanned = (qrData: string) => {
    try {
      // Format attendu: {"etudiantId": "xxx", "matricule": "xxx"}
      const data = JSON.parse(qrData);
      marquerPresence(data.etudiantId, 'present');
      
      // Feedback visuel/sonore
      const audio = new Audio('/sounds/beep.mp3');
      audio.play().catch(() => {});
      
    } catch (err) {
      console.error('QR Code invalide:', err);
    }
  };

  const marquerPresence = (etudiantId: string, statut: 'present' | 'absent' | 'retard') => {
    if (!appel) return;

    const newPresences = new Map(appel.presences);
    newPresences.set(etudiantId, statut);
    
    setAppel({
      ...appel,
      presences: newPresences
    });

    // Mettre à jour le statut de l'étudiant dans la liste
    setEtudiants(prev => prev.map(e => 
      e.id === etudiantId ? { ...e, statut } : e
    ));
  };

  const sauvegarderAppel = async () => {
    if (!appel || !coursActuel) return;

    try {
      // TODO: Appel API pour sauvegarder
      const presencesArray = Array.from(appel.presences.entries()).map(([etudiantId, statut]) => ({
        etudiantId,
        statut,
        coursId: coursActuel.id,
        date: appel.date
      }));

      console.log('Sauvegarde appel:', presencesArray);
      
      alert('Appel sauvegardé avec succès!');
      navigate('/surveillance');
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  const getStatutStats = () => {
    if (!appel) return { presents: 0, absents: 0, retards: 0, total: etudiants.length };
    
    let presents = 0, absents = 0, retards = 0;
    appel.presences.forEach(statut => {
      if (statut === 'present') presents++;
      else if (statut === 'absent') absents++;
      else if (statut === 'retard') retards++;
    });

    return { presents, absents, retards, total: etudiants.length };
  };

  const filteredEtudiants = etudiants.filter(e =>
    e.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.matricule.includes(searchTerm)
  );

  // Mode Sélection de Cours
  if (mode === 'selection') {
    return (
      <div className="container-fluid p-4">
        <div className="row mb-4">
          <div className="col">
            <button className="btn btn-link text-decoration-none p-0 mb-2" onClick={() => navigate('/surveillance')}>
              <ArrowLeft size={20} className="me-2" />
              Retour au Dashboard
            </button>
            <h2 className="mb-1">
              <UserCheck className="me-2" size={28} />
              Faire l'Appel
            </h2>
            <p className="text-muted mb-0">Sélectionnez un cours pour commencer</p>
          </div>
        </div>

        <div className="row g-3">
          {coursList.map(cours => (
            <div key={cours.id} className="col-12 col-md-6 col-lg-4">
              <div 
                className="card border-0 shadow-sm h-100 cursor-pointer hover-shadow"
                onClick={() => {
                  setCoursActuel(cours);
                  setMode('qr');
                }}
                style={{ cursor: 'pointer', transition: 'all 0.2s' }}
              >
                <div className="card-body">
                  <div className="d-flex align-items-start justify-content-between mb-3">
                    <div>
                      <h5 className="mb-1 fw-semibold">{cours.nom}</h5>
                      <span className="badge bg-primary bg-opacity-10 text-primary">{cours.code}</span>
                    </div>
                    <Users size={24} className="text-muted" />
                  </div>
                  <div className="small text-muted">
                    <div className="mb-1">
                      <Clock size={14} className="me-2" />
                      {cours.horaire}
                    </div>
                    <div className="mb-1">
                      📍 Salle {cours.salle}
                    </div>
                    <div className="mb-1">
                      👨‍🏫 {cours.enseignant}
                    </div>
                    <div className="mt-2 fw-semibold text-dark">
                      {cours.effectif} étudiants
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

  const stats = getStatutStats();

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col">
          <button 
            className="btn btn-link text-decoration-none p-0 mb-2" 
            onClick={() => {
              if (mode === 'qr' || mode === 'manuel') {
                stopQRScanner();
                setMode('selection');
                setCoursActuel(null);
              } else {
                navigate('/surveillance');
              }
            }}
          >
            <ArrowLeft size={20} className="me-2" />
            Retour
          </button>
          <h2 className="mb-1">
            <UserCheck className="me-2" size={28} />
            Appel - {coursActuel?.nom}
          </h2>
          <p className="text-muted mb-0">
            {coursActuel?.code} • {coursActuel?.horaire} • Salle {coursActuel?.salle}
          </p>
        </div>
        <div className="col-auto">
          <div className="btn-group me-2">
            <button 
              className={`btn ${mode === 'qr' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => {
                setMode('qr');
                if (!scanning) startQRScanner();
              }}
            >
              <QrCode size={18} className="me-2" />
              QR Code
            </button>
            <button 
              className={`btn ${mode === 'manuel' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => {
                stopQRScanner();
                setMode('manuel');
              }}
            >
              <List size={18} className="me-2" />
              Manuel
            </button>
          </div>
          <button 
            className="btn btn-success"
            onClick={sauvegarderAppel}
            disabled={stats.presents === 0}
          >
            <CheckCircle size={18} className="me-2" />
            Sauvegarder
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <div className="text-success mb-2">
                <CheckCircle size={32} />
              </div>
              <h3 className="mb-0 fw-bold">{stats.presents}</h3>
              <small className="text-muted">Présents</small>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <div className="text-danger mb-2">
                <XCircle size={32} />
              </div>
              <h3 className="mb-0 fw-bold">{stats.absents}</h3>
              <small className="text-muted">Absents</small>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <div className="text-warning mb-2">
                <Clock size={32} />
              </div>
              <h3 className="mb-0 fw-bold">{stats.retards}</h3>
              <small className="text-muted">Retards</small>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <div className="text-primary mb-2">
                <Users size={32} />
              </div>
              <h3 className="mb-0 fw-bold">{stats.total}</h3>
              <small className="text-muted">Total</small>
            </div>
          </div>
        </div>
      </div>

      {/* Mode QR Scanner */}
      {mode === 'qr' && (
        <div className="row">
          <div className="col-12 col-lg-6 mb-4">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center p-4">
                <h5 className="mb-3">Scanner QR Code</h5>
                {cameraError ? (
                  <div className="alert alert-danger">
                    <Camera size={48} className="mb-3" />
                    <p>{cameraError}</p>
                    <button className="btn btn-primary" onClick={startQRScanner}>
                      Réessayer
                    </button>
                  </div>
                ) : (
                  <>
                    <div 
                      id="qr-reader" 
                      style={{ 
                        width: '100%', 
                        maxWidth: '400px', 
                        margin: '0 auto',
                        borderRadius: '12px',
                        overflow: 'hidden'
                      }}
                    />
                    {!scanning && (
                      <button className="btn btn-primary mt-3" onClick={startQRScanner}>
                        <Camera size={18} className="me-2" />
                        Démarrer le Scanner
                      </button>
                    )}
                  </>
                )}
                <p className="text-muted mt-3 mb-0 small">
                  Les étudiants doivent présenter leur QR Code pour être marqués présents
                </p>
              </div>
            </div>
          </div>
          <div className="col-12 col-lg-6">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white border-0">
                <h5 className="mb-0">Dernières Présences</h5>
              </div>
              <div className="card-body" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {etudiants.filter(e => e.statut === 'present').length === 0 ? (
                  <p className="text-muted text-center py-4">Aucune présence enregistrée</p>
                ) : (
                  <div className="list-group list-group-flush">
                    {etudiants.filter(e => e.statut === 'present').map(etudiant => (
                      <div key={etudiant.id} className="list-group-item px-0 border-0 border-bottom">
                        <div className="d-flex align-items-center">
                          <CheckCircle size={20} className="text-success me-3" />
                          <div>
                            <div className="fw-semibold">{etudiant.prenom} {etudiant.nom}</div>
                            <small className="text-muted">{etudiant.matricule}</small>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mode Manuel */}
      {mode === 'manuel' && (
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white border-0">
            <div className="row align-items-center">
              <div className="col">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Rechercher un étudiant..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="col-auto">
                <div className="btn-group">
                  <button 
                    className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setViewMode('list')}
                  >
                    <List size={16} />
                  </button>
                  <button 
                    className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="card-body" style={{ maxHeight: '600px', overflowY: 'auto' }}>
            {viewMode === 'list' ? (
              <div className="list-group list-group-flush">
                {filteredEtudiants.map(etudiant => (
                  <div key={etudiant.id} className="list-group-item px-0 border-0 border-bottom">
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center flex-grow-1">
                        <div className="me-3">
                          <div className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }}>
                            <span className="fw-bold text-primary">{etudiant.prenom[0]}{etudiant.nom[0]}</span>
                          </div>
                        </div>
                        <div>
                          <div className="fw-semibold">{etudiant.prenom} {etudiant.nom}</div>
                          <small className="text-muted">{etudiant.matricule}</small>
                        </div>
                      </div>
                      <div className="btn-group">
                        <button 
                          className={`btn btn-sm ${etudiant.statut === 'present' ? 'btn-success' : 'btn-outline-success'}`}
                          onClick={() => marquerPresence(etudiant.id, 'present')}
                        >
                          <CheckCircle size={16} />
                        </button>
                        <button 
                          className={`btn btn-sm ${etudiant.statut === 'retard' ? 'btn-warning' : 'btn-outline-warning'}`}
                          onClick={() => marquerPresence(etudiant.id, 'retard')}
                        >
                          <Clock size={16} />
                        </button>
                        <button 
                          className={`btn btn-sm ${etudiant.statut === 'absent' ? 'btn-danger' : 'btn-outline-danger'}`}
                          onClick={() => marquerPresence(etudiant.id, 'absent')}
                        >
                          <XCircle size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="row g-3">
                {filteredEtudiants.map(etudiant => (
                  <div key={etudiant.id} className="col-6 col-md-4 col-lg-3">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body text-center p-3">
                        <div className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center mx-auto mb-2" style={{ width: 60, height: 60 }}>
                          <span className="fw-bold text-primary fs-5">{etudiant.prenom[0]}{etudiant.nom[0]}</span>
                        </div>
                        <div className="fw-semibold small mb-1">{etudiant.prenom} {etudiant.nom}</div>
                        <small className="text-muted d-block mb-2">{etudiant.matricule}</small>
                        <div className="btn-group btn-group-sm w-100">
                          <button 
                            className={`btn ${etudiant.statut === 'present' ? 'btn-success' : 'btn-outline-success'}`}
                            onClick={() => marquerPresence(etudiant.id, 'present')}
                            title="Présent"
                          >
                            <CheckCircle size={14} />
                          </button>
                          <button 
                            className={`btn ${etudiant.statut === 'retard' ? 'btn-warning' : 'btn-outline-warning'}`}
                            onClick={() => marquerPresence(etudiant.id, 'retard')}
                            title="Retard"
                          >
                            <Clock size={14} />
                          </button>
                          <button 
                            className={`btn ${etudiant.statut === 'absent' ? 'btn-danger' : 'btn-outline-danger'}`}
                            onClick={() => marquerPresence(etudiant.id, 'absent')}
                            title="Absent"
                          >
                            <XCircle size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PresencesPage;

// Made with Bob
