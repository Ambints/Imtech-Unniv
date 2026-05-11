import React, { useState, useEffect } from 'react';
import { academicApi } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import {
  BookOpen, Plus, Edit2, Trash2, Save, X, Search, Filter,
  Users, Clock, Award, Calendar, CheckCircle, AlertCircle
} from 'lucide-react';

interface Course {
  id: string;
  code: string;
  intitule: string;
  creditsEcts: number;
  coefficient: number;
  volumeCm: number;
  volumeTd: number;
  volumeTp: number;
  semestre: number;
  anneeNiveau: number;
  typeUe: 'obligatoire' | 'optionnelle';
  parcoursId: string;
  parcours: any;
  elementsConstitutifs: any[];
}

interface ElementConstitutif {
  id: string;
  code: string;
  intitule: string;
  coefficient: number;
  volumeHoraire: number;
  type: 'cm' | 'td' | 'tp';
  ueId: string;
}

export const CourseManagement: React.FC = () => {
  const { user } = useAuthStore();
  const tid = user?.tenantId || '';
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedParcours, setSelectedParcours] = useState('');
  const [selectedSemestre, setSelectedSemestre] = useState('');
  const [selectedNiveau, setSelectedNiveau] = useState('');

  // États pour les cours
  const [courses, setCourses] = useState<Course[]>([]);
  const [parcours, setParcours] = useState<any[]>([]);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [courseForm, setCourseForm] = useState({
    id: '',
    code: '',
    intitule: '',
    creditsEcts: 3,
    coefficient: 1,
    volumeCm: 20,
    volumeTd: 20,
    volumeTp: 0,
    semestre: 1,
    anneeNiveau: 1,
    typeUe: 'obligatoire' as const,
    parcoursId: ''
  });

  // États pour les éléments constitutifs
  const [showECForm, setShowECForm] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [ecForm, setECForm] = useState({
    id: '',
    code: '',
    intitule: '',
    coefficient: 1,
    volumeHoraire: 20,
    type: 'cm' as const,
    ueId: ''
  });

  useEffect(() => {
    loadData();
  }, [tid]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [parcoursRes, coursesRes] = await Promise.all([
        academicApi.getParcours(tid),
        academicApi.getCourses(tid)
      ]);
      setParcours(parcoursRes.data);
      setCourses(coursesRes.data);
    } catch (error) {
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCourse = async () => {
    setLoading(true);
    try {
      if (courseForm.id) {
        await academicApi.updateCourse(tid, courseForm.id, courseForm);
        toast.success('Cours mis à jour avec succès');
      } else {
        await academicApi.createCourse(tid, courseForm);
        toast.success('Cours créé avec succès');
      }
      setShowCourseForm(false);
      resetCourseForm();
      loadData();
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde du cours');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce cours ?')) return;
    
    setLoading(true);
    try {
      await academicApi.deleteCourse(tid, id);
      toast.success('Cours supprimé avec succès');
      loadData();
    } catch (error) {
      toast.error('Erreur lors de la suppression du cours');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEC = async () => {
    setLoading(true);
    try {
      if (ecForm.id) {
        await academicApi.updateElementConstitutif(tid, ecForm.id, ecForm);
        toast.success('Élément constitutif mis à jour');
      } else {
        await academicApi.createElementConstitutif(tid, ecForm);
        toast.success('Élément constitutif créé');
      }
      setShowECForm(false);
      resetECForm();
      loadData();
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const resetCourseForm = () => {
    setCourseForm({
      id: '',
      code: '',
      intitule: '',
      creditsEcts: 3,
      coefficient: 1,
      volumeCm: 20,
      volumeTd: 20,
      volumeTp: 0,
      semestre: 1,
      anneeNiveau: 1,
      typeUe: 'obligatoire',
      parcoursId: ''
    });
  };

  const resetECForm = () => {
    setECForm({
      id: '',
      code: '',
      intitule: '',
      coefficient: 1,
      volumeHoraire: 20,
      type: 'cm',
      ueId: ''
    });
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.intitule.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesParcours = !selectedParcours || course.parcoursId === selectedParcours;
    const matchesSemestre = !selectedSemestre || course.semestre.toString() === selectedSemestre;
    const matchesNiveau = !selectedNiveau || course.anneeNiveau.toString() === selectedNiveau;
    
    return matchesSearch && matchesParcours && matchesSemestre && matchesNiveau;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion des Cours</h2>
          <p className="text-gray-600">Gérez les unités d'enseignement et leurs éléments constitutifs</p>
        </div>
        <button
          onClick={() => {
            resetCourseForm();
            setShowCourseForm(true);
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Nouveau Cours
        </button>
      </div>

      {/* Filtres */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher un cours..."
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
            value={selectedSemestre}
            onChange={(e) => setSelectedSemestre(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tous les semestres</option>
            <option value="1">Semestre 1</option>
            <option value="2">Semestre 2</option>
            <option value="3">Semestre 3</option>
            <option value="4">Semestre 4</option>
            <option value="5">Semestre 5</option>
            <option value="6">Semestre 6</option>
          </select>
          <select
            value={selectedNiveau}
            onChange={(e) => setSelectedNiveau(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tous les niveaux</option>
            <option value="1">Niveau 1</option>
            <option value="2">Niveau 2</option>
            <option value="3">Niveau 3</option>
          </select>
        </div>
      </div>

      {/* Liste des cours */}
      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Intitulé</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Parcours</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">S/N</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Crédits</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCourses.map((course) => (
                <tr key={course.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{course.code}</td>
                  <td className="px-6 py-4">{course.intitule}</td>
                  <td className="px-6 py-4">{course.parcours?.nom}</td>
                  <td className="px-6 py-4">S{course.semestre}/N{course.anneeNiveau}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {course.creditsEcts} ECTS
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      course.typeUe === 'obligatoire' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {course.typeUe}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setCourseForm(course);
                          setShowCourseForm(true);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedCourse(course);
                          setECForm({...ecForm, ueId: course.id});
                          setShowECForm(true);
                        }}
                        className="text-green-600 hover:text-green-800"
                      >
                        <Plus size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteCourse(course.id)}
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
      </div>

      {/* Modal Cours */}
      {showCourseForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {courseForm.id ? 'Modifier le cours' : 'Nouveau cours'}
              </h3>
              <button
                onClick={() => setShowCourseForm(false)}
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
                  value={courseForm.code}
                  onChange={(e) => setCourseForm({...courseForm, code: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Intitulé</label>
                <input
                  type="text"
                  value={courseForm.intitule}
                  onChange={(e) => setCourseForm({...courseForm, intitule: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parcours</label>
                <select
                  value={courseForm.parcoursId}
                  onChange={(e) => setCourseForm({...courseForm, parcoursId: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionner un parcours</option>
                  {parcours.map(p => (
                    <option key={p.id} value={p.id}>{p.nom}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type UE</label>
                <select
                  value={courseForm.typeUe}
                  onChange={(e) => setCourseForm({...courseForm, typeUe: e.target.value as 'obligatoire' | 'optionnelle'})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="obligatoire">Obligatoire</option>
                  <option value="optionnelle">Optionnelle</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Crédits ECTS</label>
                <input
                  type="number"
                  value={courseForm.creditsEcts}
                  onChange={(e) => setCourseForm({...courseForm, creditsEcts: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Coefficient</label>
                <input
                  type="number"
                  value={courseForm.coefficient}
                  onChange={(e) => setCourseForm({...courseForm, coefficient: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Semestre</label>
                <select
                  value={courseForm.semestre}
                  onChange={(e) => setCourseForm({...courseForm, semestre: parseInt(e.target.value)})}
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
                  value={courseForm.anneeNiveau}
                  onChange={(e) => setCourseForm({...courseForm, anneeNiveau: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {[1, 2, 3].map(n => (
                    <option key={n} value={n}>Niveau {n}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Volume CM</label>
                <input
                  type="number"
                  value={courseForm.volumeCm}
                  onChange={(e) => setCourseForm({...courseForm, volumeCm: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Volume TD</label>
                <input
                  type="number"
                  value={courseForm.volumeTd}
                  onChange={(e) => setCourseForm({...courseForm, volumeTd: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Volume TP</label>
                <input
                  type="number"
                  value={courseForm.volumeTp}
                  onChange={(e) => setCourseForm({...courseForm, volumeTp: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowCourseForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveCourse}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Élément Constitutif */}
      {showECForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {ecForm.id ? "Modifier l'élément" : "Nouvel élément constitutif"}
              </h3>
              <button
                onClick={() => setShowECForm(false)}
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
                  value={ecForm.code}
                  onChange={(e) => setECForm({...ecForm, code: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Intitulé</label>
                <input
                  type="text"
                  value={ecForm.intitule}
                  onChange={(e) => setECForm({...ecForm, intitule: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={ecForm.type}
                  onChange={(e) => setECForm({...ecForm, type: e.target.value as 'cm' | 'td' | 'tp'})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="cm">CM</option>
                  <option value="td">TD</option>
                  <option value="tp">TP</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Volume horaire</label>
                <input
                  type="number"
                  value={ecForm.volumeHoraire}
                  onChange={(e) => setECForm({...ecForm, volumeHoraire: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Coefficient</label>
                <input
                  type="number"
                  value={ecForm.coefficient}
                  onChange={(e) => setECForm({...ecForm, coefficient: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowECForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveEC}
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
