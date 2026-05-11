import React, { useState, useEffect } from 'react';
import { academicApi } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import {
  Calendar, Clock, MapPin, Plus, Edit2, Trash2, Save, X, Search, Filter,
  Users, BookOpen, AlertCircle, CheckCircle, RefreshCw, Download
} from 'lucide-react';

interface Salle {
  id: string;
  code: string;
  nom: string;
  capacite: number;
  type: 'cm' | 'td' | 'tp' | 'amphi' | 'laboratoire';
  equipements: string[];
  etage: string;
  disponible: boolean;
}

interface Seance {
  id: string;
  code: string;
  intitule: string;
  type: 'cm' | 'td' | 'tp' | 'examen' | 'reunion';
  dateDebut: string;
  dateFin: string;
  salleId: string;
  salle: Salle;
  enseignantId: string;
  enseignant: any;
  ueId: string;
  ue: any;
  parcoursId: string;
  parcours: any;
  effectif: number;
  capacite: number;
}

interface EmploiDuTemps {
  id: string;
  titre: string;
  description: string;
  anneeAcademique: string;
  semestre: number;
  parcoursId: string;
  parcours: any;
  seances: Seance[];
  publie: boolean;
  datePublication: string;
}

export const ScheduleManagement: React.FC = () => {
  const { user } = useAuthStore();
  const tid = user?.tenantId || '';
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'salles' | 'seances' | 'edt'>('salles');
  const [searchTerm, setSearchTerm] = useState('');

  // États pour les salles
  const [salles, setSalles] = useState<Salle[]>([]);
  const [showSalleForm, setShowSalleForm] = useState(false);
  const [salleForm, setSalleForm] = useState({
    id: '',
    code: '',
    nom: '',
    capacite: 30,
    type: 'cm' as const,
    equipements: [] as string[],
    etage: 'RDC',
    disponible: true
  });

  // États pour les séances
  const [seances, setSeances] = useState<Seance[]>([]);
  const [enseignants, setEnseignants] = useState<any[]>([]);
  const [ues, setUes] = useState<any[]>([]);
  const [showSeanceForm, setShowSeanceForm] = useState(false);
  const [seanceForm, setSeanceForm] = useState({
    id: '',
    code: '',
    intitule: '',
    type: 'cm' as const,
    dateDebut: '',
    dateFin: '',
    salleId: '',
    enseignantId: '',
    ueId: '',
    parcoursId: '',
    effectif: 0,
    capacite: 30
  });

  // États pour l'emploi du temps
  const [edts, setEdts] = useState<EmploiDuTemps[]>([]);
  const [showEDTForm, setShowEDTForm] = useState(false);
  const [edtForm, setEDTForm] = useState({
    id: '',
    titre: '',
    description: '',
    anneeAcademique: new Date().getFullYear().toString(),
    semestre: 1,
    parcoursId: '',
    publie: false
  });

  useEffect(() => {
    loadData();
  }, [tid, activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'salles':
          await loadSalles();
          break;
        case 'seances':
          await loadSeances();
          break;
        case 'edt':
          await loadEDTs();
          break;
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const loadSalles = async () => {
    const response = await academicApi.getSalles(tid);
    setSalles(response.data);
  };

  const loadSeances = async () => {
    const [seancesRes, enseignantsRes, uesRes] = await Promise.all([
      academicApi.getSeances(tid),
      academicApi.getEnseignants(tid),
      academicApi.getCourses(tid)
    ]);
    setSeances(seancesRes.data);
    setEnseignants(enseignantsRes.data);
    setUes(uesRes.data);
  };

  const loadEDTs = async () => {
    const response = await academicApi.getEmploisDuTemps(tid);
    setEdts(response.data);
  };

  const handleSaveSalle = async () => {
    setLoading(true);
    try {
      if (salleForm.id) {
        await academicApi.updateSalle(tid, salleForm.id, salleForm);
        toast.success('Salle mise à jour avec succès');
      } else {
        await academicApi.createSalle(tid, salleForm);
        toast.success('Salle créée avec succès');
      }
      setShowSalleForm(false);
      resetSalleForm();
      loadSalles();
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde de la salle');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSeance = async () => {
    setLoading(true);
    try {
      if (seanceForm.id) {
        await academicApi.updateSeance(tid, seanceForm.id, seanceForm);
        toast.success('Séance mise à jour avec succès');
      } else {
        await academicApi.createSeance(tid, seanceForm);
        toast.success('Séance créée avec succès');
      }
      setShowSeanceForm(false);
      resetSeanceForm();
      loadSeances();
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde de la séance');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEDT = async () => {
    setLoading(true);
    try {
      if (edtForm.id) {
        await academicApi.updateEmploiDuTemps(tid, edtForm.id, edtForm);
        toast.success('Emploi du temps mis à jour');
      } else {
        await academicApi.createEmploiDuTemps(tid, edtForm);
        toast.success('Emploi du temps créé');
      }
      setShowEDTForm(false);
      resetEDTForm();
      loadEDTs();
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSalle = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette salle ?')) return;
    
    setLoading(true);
    try {
      await academicApi.deleteSalle(tid, id);
      toast.success('Salle supprimée avec succès');
      loadSalles();
    } catch (error) {
      toast.error('Erreur lors de la suppression de la salle');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSeance = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette séance ?')) return;
    
    setLoading(true);
    try {
      await academicApi.deleteSeance(tid, id);
      toast.success('Séance supprimée avec succès');
      loadSeances();
    } catch (error) {
      toast.error('Erreur lors de la suppression de la séance');
    } finally {
      setLoading(false);
    }
  };

  const handlePublishEDT = async (id: string) => {
    setLoading(true);
    try {
      await academicApi.publishEmploiDuTemps(tid, id);
      toast.success('Emploi du temps publié avec succès');
      loadEDTs();
    } catch (error) {
      toast.error('Erreur lors de la publication');
    } finally {
      setLoading(false);
    }
  };

  const resetSalleForm = () => {
    setSalleForm({
      id: '',
      code: '',
      nom: '',
      capacite: 30,
      type: 'cm',
      equipements: [],
      etage: 'RDC',
      disponible: true
    });
  };

  const resetSeanceForm = () => {
    setSeanceForm({
      id: '',
      code: '',
      intitule: '',
      type: 'cm',
      dateDebut: '',
      dateFin: '',
      salleId: '',
      enseignantId: '',
      ueId: '',
      parcoursId: '',
      effectif: 0,
      capacite: 30
    });
  };

  const resetEDTForm = () => {
    setEDTForm({
      id: '',
      titre: '',
      description: '',
      anneeAcademique: new Date().getFullYear().toString(),
      semestre: 1,
      parcoursId: '',
      publie: false
    });
  };

  const getSalleTypeColor = (type: string) => {
    switch (type) {
      case 'cm': return 'bg-blue-100 text-blue-800';
      case 'td': return 'bg-green-100 text-green-800';
      case 'tp': return 'bg-purple-100 text-purple-800';
      case 'amphi': return 'bg-yellow-100 text-yellow-800';
      case 'laboratoire': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeanceTypeColor = (type: string) => {
    switch (type) {
      case 'cm': return 'bg-blue-100 text-blue-800';
      case 'td': return 'bg-green-100 text-green-800';
      case 'tp': return 'bg-purple-100 text-purple-800';
      case 'examen': return 'bg-red-100 text-red-800';
      case 'reunion': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion des Horaires</h2>
          <p className="text-gray-600">Gérez les salles, séances et emplois du temps</p>
        </div>
        <button
          onClick={() => {
            switch (activeTab) {
              case 'salles':
                resetSalleForm();
                setShowSalleForm(true);
                break;
              case 'seances':
                resetSeanceForm();
                setShowSeanceForm(true);
                break;
              case 'edt':
                resetEDTForm();
                setShowEDTForm(true);
                break;
            }
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          {activeTab === 'salles' && 'Nouvelle Salle'}
          {activeTab === 'seances' && 'Nouvelle Séance'}
          {activeTab === 'edt' && 'Nouvel EDT'}
        </button>
      </div>

      {/* Onglets */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {[
              { id: 'salles', label: 'Salles', icon: MapPin },
              { id: 'seances', label: 'Séances', icon: Clock },
              { id: 'edt', label: 'Emplois du Temps', icon: Calendar }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4">
          {/* Barre de recherche */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder={`Rechercher ${activeTab === 'salles' ? 'une salle' : activeTab === 'seances' ? 'une séance' : 'un EDT'}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Contenu des onglets */}
          {activeTab === 'salles' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacité</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Étage</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Disponibilité</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {salles.filter(salle => 
                    salle.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    salle.code.toLowerCase().includes(searchTerm.toLowerCase())
                  ).map((salle) => (
                    <tr key={salle.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">{salle.code}</td>
                      <td className="px-6 py-4">{salle.nom}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSalleTypeColor(salle.type)}`}>
                          {salle.type.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">{salle.capacite} places</td>
                      <td className="px-6 py-4">{salle.etage}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          salle.disponible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {salle.disponible ? 'Disponible' : 'Occupée'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSalleForm(salle);
                              setShowSalleForm(true);
                            }}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteSalle(salle.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'seances' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Intitulé</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Salle</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Enseignant</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {seances.filter(seance => 
                    seance.intitule.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    seance.code.toLowerCase().includes(searchTerm.toLowerCase())
                  ).map((seance) => (
                    <tr key={seance.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">{seance.code}</td>
                      <td className="px-6 py-4">{seance.intitule}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSeanceTypeColor(seance.type)}`}>
                          {seance.type.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div>{new Date(seance.dateDebut).toLocaleDateString()}</div>
                          <div className="text-gray-500">
                            {new Date(seance.dateDebut).toLocaleTimeString()} - {new Date(seance.dateFin).toLocaleTimeString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">{seance.salle?.nom}</td>
                      <td className="px-6 py-4">{seance.enseignant?.nom}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSeanceForm(seance);
                              setShowSeanceForm(true);
                            }}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteSeance(seance.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'edt' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {edts.filter(edt => 
                edt.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                edt.description.toLowerCase().includes(searchTerm.toLowerCase())
              ).map((edt) => (
                <div key={edt.id} className="bg-white border rounded-lg p-4 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900">{edt.titre}</h3>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      edt.publie ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {edt.publie ? 'Publié' : 'Brouillon'}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{edt.description}</p>
                  <div className="text-sm text-gray-500 mb-3">
                    <div>Année: {edt.anneeAcademique}</div>
                    <div>Semestre: {edt.semestre}</div>
                    <div>Parcours: {edt.parcours?.nom}</div>
                    <div>Séances: {edt.seances?.length || 0}</div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEDTForm(edt);
                        setShowEDTForm(true);
                      }}
                      className="flex-1 text-blue-600 hover:text-blue-800 text-sm"
                    >
                      <Edit2 size={16} className="inline mr-1" />
                      Modifier
                    </button>
                    {!edt.publie && (
                      <button
                        onClick={() => handlePublishEDT(edt.id)}
                        className="flex-1 text-green-600 hover:text-green-800 text-sm"
                      >
                        <CheckCircle size={16} className="inline mr-1" />
                        Publier
                      </button>
                    )}
                    <button className="flex-1 text-purple-600 hover:text-purple-800 text-sm">
                      <Download size={16} className="inline mr-1" />
                      Exporter
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal Salle */}
      {showSalleForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {salleForm.id ? 'Modifier la salle' : 'Nouvelle salle'}
              </h3>
              <button
                onClick={() => setShowSalleForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                <input
                  type="text"
                  value={salleForm.code}
                  onChange={(e) => setSalleForm({...salleForm, code: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <input
                  type="text"
                  value={salleForm.nom}
                  onChange={(e) => setSalleForm({...salleForm, nom: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={salleForm.type}
                  onChange={(e) => setSalleForm({...salleForm, type: e.target.value as any})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="cm">CM</option>
                  <option value="td">TD</option>
                  <option value="tp">TP</option>
                  <option value="amphi">Amphi</option>
                  <option value="laboratoire">Laboratoire</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacité</label>
                <input
                  type="number"
                  value={salleForm.capacite}
                  onChange={(e) => setSalleForm({...salleForm, capacite: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Étage</label>
                <input
                  type="text"
                  value={salleForm.etage}
                  onChange={(e) => setSalleForm({...salleForm, etage: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={salleForm.disponible}
                  onChange={(e) => setSalleForm({...salleForm, disponible: e.target.checked})}
                  className="mr-2"
                />
                <label className="text-sm font-medium text-gray-700">Disponible</label>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowSalleForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveSalle}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Séance */}
      {showSeanceForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {seanceForm.id ? 'Modifier la séance' : 'Nouvelle séance'}
              </h3>
              <button
                onClick={() => setShowSeanceForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                <input
                  type="text"
                  value={seanceForm.code}
                  onChange={(e) => setSeanceForm({...seanceForm, code: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Intitulé</label>
                <input
                  type="text"
                  value={seanceForm.intitule}
                  onChange={(e) => setSeanceForm({...seanceForm, intitule: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={seanceForm.type}
                  onChange={(e) => setSeanceForm({...seanceForm, type: e.target.value as any})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="cm">CM</option>
                  <option value="td">TD</option>
                  <option value="tp">TP</option>
                  <option value="examen">Examen</option>
                  <option value="reunion">Réunion</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Salle</label>
                <select
                  value={seanceForm.salleId}
                  onChange={(e) => setSeanceForm({...seanceForm, salleId: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionner une salle</option>
                  {salles.map(salle => (
                    <option key={salle.id} value={salle.id}>{salle.nom}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Enseignant</label>
                <select
                  value={seanceForm.enseignantId}
                  onChange={(e) => setSeanceForm({...seanceForm, enseignantId: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionner un enseignant</option>
                  {enseignants.map(enseignant => (
                    <option key={enseignant.id} value={enseignant.id}>{enseignant.nom}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">UE</label>
                <select
                  value={seanceForm.ueId}
                  onChange={(e) => setSeanceForm({...seanceForm, ueId: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionner une UE</option>
                  {ues.map(ue => (
                    <option key={ue.id} value={ue.id}>{ue.intitule}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
                <input
                  type="datetime-local"
                  value={seanceForm.dateDebut}
                  onChange={(e) => setSeanceForm({...seanceForm, dateDebut: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
                <input
                  type="datetime-local"
                  value={seanceForm.dateFin}
                  onChange={(e) => setSeanceForm({...seanceForm, dateFin: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowSeanceForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveSeance}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
