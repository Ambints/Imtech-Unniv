import React, { useState, useEffect } from 'react';
import { academicApi } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import {
  Users, Plus, Edit2, Trash2, Save, X, Search, Filter, Download,
  UserPlus, Calendar, Mail, Phone, MapPin, BookOpen, CheckCircle,
  AlertCircle, GraduationCap, Eye, FileText
} from 'lucide-react';

interface Student {
  id: string;
  matricule: string;
  nom: string;
  prenom: string;
  dateNaissance: string;
  lieuNaissance: string;
  sexe: 'M' | 'F';
  email: string;
  telephone: string;
  adresse: string;
  nationalite: string;
  typeBourse: 'aucune' | 'demi' | 'entiere';
  situationFamiliale: 'celibataire' | 'marie' | 'divorce' | 'veuf';
  statut: 'actif' | 'suspendu' | 'diplome' | 'abandon';
  parcoursId: string;
  parcours: any;
  inscriptions: any[];
}

interface Inscription {
  id: string;
  etudiantId: string;
  parcoursId: string;
  anneeAcademiqueId: string;
  semestre: number;
  niveau: number;
  statut: 'en_cours' | 'valide' | 'ajourne';
  dateInscription: string;
  etudiant: Student;
  parcours: any;
}

export const StudentManagement: React.FC = () => {
  const { user } = useAuthStore();
  const tid = user?.tenantId || '';
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedParcours, setSelectedParcours] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // États pour les étudiants
  const [students, setStudents] = useState<Student[]>([]);
  const [parcours, setParcours] = useState<any[]>([]);
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [studentForm, setStudentForm] = useState({
    id: '',
    matricule: '',
    nom: '',
    prenom: '',
    dateNaissance: '',
    lieuNaissance: '',
    sexe: 'M' as const,
    email: '',
    telephone: '',
    adresse: '',
    nationalite: 'Béninoise',
    typeBourse: 'aucune' as const,
    situationFamiliale: 'celibataire' as const,
    statut: 'actif' as const,
    parcoursId: ''
  });

  // États pour les inscriptions
  const [showInscriptionModal, setShowInscriptionModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [inscriptionForm, setInscriptionForm] = useState({
    id: '',
    etudiantId: '',
    parcoursId: '',
    anneeAcademiqueId: '',
    semestre: 1,
    niveau: 1
  });

  useEffect(() => {
    loadData();
  }, [tid]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [parcoursRes, studentsRes] = await Promise.all([
        academicApi.getParcours(tid),
        academicApi.getStudents(tid)
      ]);
      setParcours(parcoursRes.data);
      setStudents(studentsRes.data);
    } catch (error) {
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveStudent = async () => {
    setLoading(true);
    try {
      if (studentForm.id) {
        await academicApi.updateStudent(tid, studentForm.id, studentForm);
        toast.success('Étudiant mis à jour avec succès');
      } else {
        await academicApi.createStudent(tid, studentForm);
        toast.success('Étudiant créé avec succès');
      }
      setShowStudentForm(false);
      resetStudentForm();
      loadData();
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde de l\'étudiant');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet étudiant ?')) return;
    
    setLoading(true);
    try {
      await academicApi.deleteStudent(tid, id);
      toast.success('Étudiant supprimé avec succès');
      loadData();
    } catch (error) {
      toast.error('Erreur lors de la suppression de l\'étudiant');
    } finally {
      setLoading(false);
    }
  };

  const handleInscription = async () => {
    if (!selectedStudent) return;
    
    setLoading(true);
    try {
      await academicApi.createInscription(tid, {
        ...inscriptionForm,
        etudiantId: selectedStudent.id
      });
      toast.success('Inscription créée avec succès');
      setShowInscriptionModal(false);
      resetInscriptionForm();
      loadData();
    } catch (error) {
      toast.error('Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  const resetStudentForm = () => {
    setStudentForm({
      id: '',
      matricule: '',
      nom: '',
      prenom: '',
      dateNaissance: '',
      lieuNaissance: '',
      sexe: 'M',
      email: '',
      telephone: '',
      adresse: '',
      nationalite: 'Béninoise',
      typeBourse: 'aucune',
      situationFamiliale: 'celibataire',
      statut: 'actif',
      parcoursId: ''
    });
  };

  const resetInscriptionForm = () => {
    setInscriptionForm({
      id: '',
      etudiantId: '',
      parcoursId: '',
      anneeAcademiqueId: '',
      semestre: 1,
      niveau: 1
    });
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.matricule.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesParcours = !selectedParcours || student.parcoursId === selectedParcours;
    const matchesStatus = !selectedStatus || student.statut === selectedStatus;
    
    return matchesSearch && matchesParcours && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'actif': return 'bg-green-100 text-green-800';
      case 'suspendu': return 'bg-yellow-100 text-yellow-800';
      case 'diplome': return 'bg-blue-100 text-blue-800';
      case 'abandon': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion des Étudiants</h2>
          <p className="text-gray-600">Gérez les étudiants et leurs inscriptions</p>
        </div>
        <button
          onClick={() => {
            resetStudentForm();
            setShowStudentForm(true);
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <UserPlus size={20} />
          Nouvel Étudiant
        </button>
      </div>

      {/* Filtres */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher un étudiant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={selectedParcours}
            onChange={(e) => setSelectedParcours(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tous les parcours</option>
            {parcours.map(p => (
              <option key={p.id} value={p.id}>{p.nom}</option>
            ))}
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tous les statuts</option>
            <option value="actif">Actif</option>
            <option value="suspendu">Suspendu</option>
            <option value="diplome">Diplômé</option>
            <option value="abandon">Abandon</option>
          </select>
          <button className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
            <Download size={20} />
            Exporter
          </button>
        </div>
      </div>

      {/* Liste des étudiants */}
      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Matricule</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom & Prénom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Parcours</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{student.matricule}</td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium">{student.nom} {student.prenom}</div>
                      <div className="text-sm text-gray-500">{student.telephone}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">{student.email}</td>
                  <td className="px-6 py-4">{student.parcours?.nom}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(student.statut)}`}>
                      {student.statut}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setStudentForm(student);
                          setShowStudentForm(true);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                        title="Modifier"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedStudent(student);
                          setInscriptionForm({...inscriptionForm, etudiantId: student.id});
                          setShowInscriptionModal(true);
                        }}
                        className="text-green-600 hover:text-green-800"
                        title="Inscrire"
                      >
                        <UserPlus size={16} />
                      </button>
                      <button
                        onClick={() => {
                          // Afficher les détails de l'étudiant
                        }}
                        className="text-purple-600 hover:text-purple-800"
                        title="Voir détails"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteStudent(student.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Supprimer"
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
      </div>

      {/* Modal Étudiant */}
      {showStudentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {studentForm.id ? 'Modifier l\'étudiant' : 'Nouvel étudiant'}
              </h3>
              <button
                onClick={() => setShowStudentForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Matricule</label>
                <input
                  type="text"
                  value={studentForm.matricule}
                  onChange={(e) => setStudentForm({...studentForm, matricule: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parcours</label>
                <select
                  value={studentForm.parcoursId}
                  onChange={(e) => setStudentForm({...studentForm, parcoursId: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionner un parcours</option>
                  {parcours.map(p => (
                    <option key={p.id} value={p.id}>{p.nom}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <input
                  type="text"
                  value={studentForm.nom}
                  onChange={(e) => setStudentForm({...studentForm, nom: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                <input
                  type="text"
                  value={studentForm.prenom}
                  onChange={(e) => setStudentForm({...studentForm, prenom: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date de naissance</label>
                <input
                  type="date"
                  value={studentForm.dateNaissance}
                  onChange={(e) => setStudentForm({...studentForm, dateNaissance: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lieu de naissance</label>
                <input
                  type="text"
                  value={studentForm.lieuNaissance}
                  onChange={(e) => setStudentForm({...studentForm, lieuNaissance: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sexe</label>
                <select
                  value={studentForm.sexe}
                  onChange={(e) => setStudentForm({...studentForm, sexe: e.target.value as 'M' | 'F'})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="M">Masculin</option>
                  <option value="F">Féminin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={studentForm.email}
                  onChange={(e) => setStudentForm({...studentForm, email: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <input
                  type="tel"
                  value={studentForm.telephone}
                  onChange={(e) => setStudentForm({...studentForm, telephone: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nationalité</label>
                <input
                  type="text"
                  value={studentForm.nationalite}
                  onChange={(e) => setStudentForm({...studentForm, nationalite: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type de bourse</label>
                <select
                  value={studentForm.typeBourse}
                  onChange={(e) => setStudentForm({...studentForm, typeBourse: e.target.value as 'aucune' | 'demi' | 'entiere'})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="aucune">Aucune</option>
                  <option value="demi">Demi-bourse</option>
                  <option value="entiere">Bourse entière</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                <input
                  type="text"
                  value={studentForm.adresse}
                  onChange={(e) => setStudentForm({...studentForm, adresse: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowStudentForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveStudent}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Inscription */}
      {showInscriptionModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Inscrire {selectedStudent.prenom} {selectedStudent.nom}
              </h3>
              <button
                onClick={() => setShowInscriptionModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parcours</label>
                <select
                  value={inscriptionForm.parcoursId}
                  onChange={(e) => setInscriptionForm({...inscriptionForm, parcoursId: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionner un parcours</option>
                  {parcours.map(p => (
                    <option key={p.id} value={p.id}>{p.nom}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Année académique</label>
                <input
                  type="text"
                  placeholder="2024-2025"
                  value={inscriptionForm.anneeAcademiqueId}
                  onChange={(e) => setInscriptionForm({...inscriptionForm, anneeAcademiqueId: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Semestre</label>
                <select
                  value={inscriptionForm.semestre}
                  onChange={(e) => setInscriptionForm({...inscriptionForm, semestre: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {[1, 2, 3, 4, 5, 6].map(s => (
                    <option key={s} value={s}>Semestre {s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Niveau</label>
                <select
                  value={inscriptionForm.niveau}
                  onChange={(e) => setInscriptionForm({...inscriptionForm, niveau: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {[1, 2, 3].map(n => (
                    <option key={n} value={n}>Niveau {n}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowInscriptionModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleInscription}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Inscription...' : 'Inscrire'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
