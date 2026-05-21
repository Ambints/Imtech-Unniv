import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, X, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { api } from '../../../api/client';

interface Cours {
  id: string;
  ec_nom: string;
  ec_code: string;
  parcours_nom: string;
}

export default function UploadRessourcePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [cours, setCours] = useState<Cours[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    type_ressource: 'exercice',
    affectation_id: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadMesCours();
  }, []);

  const loadMesCours = async () => {
    try {
      const response = await api.get('/portail/enseignant/mes-cours');
      setCours(response.data);
    } catch (err) {
      console.error('Erreur chargement cours:', err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Vérifier que c'est un PDF
      if (file.type !== 'application/pdf') {
        setError('Seuls les fichiers PDF sont acceptés');
        return;
      }
      // Vérifier la taille (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('Le fichier ne doit pas dépasser 10 MB');
        return;
      }
      setSelectedFile(file);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setError('Veuillez sélectionner un fichier PDF');
      return;
    }

    if (!formData.titre || !formData.affectation_id) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const uploadData = new FormData();
      uploadData.append('fichier', selectedFile);
      uploadData.append('titre', formData.titre);
      uploadData.append('description', formData.description);
      uploadData.append('type_ressource', formData.type_ressource);
      uploadData.append('affectation_id', formData.affectation_id);

      await api.post('/portail/enseignant/supports-cours', uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/portail/enseignant/ressources');
      }, 2000);
    } catch (err: any) {
      console.error('Erreur upload:', err);
      setError(err.response?.data?.message || 'Erreur lors de l\'upload du fichier');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid p-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          {/* Header */}
          <div className="d-flex align-items-center mb-4">
            <button
              onClick={() => navigate('/portail/enseignant/ressources')}
              className="btn btn-light me-3"
              style={{ borderRadius: 8 }}
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h4 className="fw-bold mb-1" style={{ color: '#1e293b' }}>
                Ajouter une ressource pédagogique
              </h4>
              <p className="text-muted mb-0" style={{ fontSize: 14 }}>
                Téléchargez un fichier PDF (exercice, sujet d'examen ou correction)
              </p>
            </div>
          </div>

          {/* Success Message */}
          {success && (
            <div className="alert alert-success d-flex align-items-center mb-4">
              <CheckCircle size={20} className="me-2" />
              Ressource ajoutée avec succès ! Redirection...
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="alert alert-danger d-flex align-items-center mb-4">
              <AlertCircle size={20} className="me-2" />
              {error}
            </div>
          )}

          {/* Form */}
          <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                {/* Type de ressource */}
                <div className="mb-4">
                  <label className="form-label fw-semibold" style={{ fontSize: 14 }}>
                    Type de ressource <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select"
                    value={formData.type_ressource}
                    onChange={(e) => setFormData({ ...formData, type_ressource: e.target.value })}
                    required
                    style={{ borderRadius: 8 }}
                  >
                    <option value="exercice">Exercice</option>
                    <option value="sujet_examen">Sujet d'examen</option>
                    <option value="correction">Correction</option>
                  </select>
                </div>

                {/* Cours */}
                <div className="mb-4">
                  <label className="form-label fw-semibold" style={{ fontSize: 14 }}>
                    Cours <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select"
                    value={formData.affectation_id}
                    onChange={(e) => setFormData({ ...formData, affectation_id: e.target.value })}
                    required
                    style={{ borderRadius: 8 }}
                  >
                    <option value="">Sélectionnez un cours</option>
                    {cours.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.ec_code} - {c.ec_nom} ({c.parcours_nom})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Titre */}
                <div className="mb-4">
                  <label className="form-label fw-semibold" style={{ fontSize: 14 }}>
                    Titre <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.titre}
                    onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                    placeholder="Ex: Exercices sur les intégrales"
                    required
                    style={{ borderRadius: 8 }}
                  />
                </div>

                {/* Description */}
                <div className="mb-4">
                  <label className="form-label fw-semibold" style={{ fontSize: 14 }}>
                    Description
                  </label>
                  <textarea
                    className="form-control"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Description de la ressource..."
                    rows={3}
                    style={{ borderRadius: 8 }}
                  />
                </div>

                {/* Upload File */}
                <div className="mb-4">
                  <label className="form-label fw-semibold" style={{ fontSize: 14 }}>
                    Fichier PDF <span className="text-danger">*</span>
                  </label>
                  
                  {!selectedFile ? (
                    <div
                      className="border-2 border-dashed rounded p-5 text-center"
                      style={{
                        borderColor: '#cbd5e1',
                        background: '#f8fafc',
                        cursor: 'pointer',
                        borderRadius: 12
                      }}
                      onClick={() => document.getElementById('fileInput')?.click()}
                    >
                      <Upload size={48} className="text-muted mb-3" />
                      <p className="mb-2 fw-medium" style={{ color: '#64748b' }}>
                        Cliquez pour sélectionner un fichier PDF
                      </p>
                      <p className="text-muted mb-0" style={{ fontSize: 12 }}>
                        Taille maximale: 10 MB
                      </p>
                      <input
                        id="fileInput"
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="d-none"
                      />
                    </div>
                  ) : (
                    <div
                      className="d-flex align-items-center justify-content-between p-3"
                      style={{
                        background: '#f0fdf4',
                        border: '1px solid #86efac',
                        borderRadius: 8
                      }}
                    >
                      <div className="d-flex align-items-center gap-3">
                        <div
                          className="d-flex align-items-center justify-content-center"
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 8,
                            background: '#dcfce7',
                            color: '#16a34a'
                          }}
                        >
                          <FileText size={20} />
                        </div>
                        <div>
                          <div className="fw-medium" style={{ fontSize: 14, color: '#166534' }}>
                            {selectedFile.name}
                          </div>
                          <div className="text-muted" style={{ fontSize: 12 }}>
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedFile(null)}
                        className="btn btn-sm btn-light"
                        style={{ borderRadius: 6 }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Buttons */}
                <div className="d-flex gap-2 justify-content-end">
                  <button
                    type="button"
                    onClick={() => navigate('/portail/enseignant/ressources')}
                    className="btn btn-light"
                    disabled={loading}
                    style={{ borderRadius: 8 }}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading || !selectedFile}
                    style={{ borderRadius: 8 }}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        Upload en cours...
                      </>
                    ) : (
                      <>
                        <Upload size={16} className="me-2" />
                        Télécharger
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Made with Bob
