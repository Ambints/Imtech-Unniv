import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../api/client';
import toast from 'react-hot-toast';
import {
  Settings, Users, BookOpen, DollarSign, Activity, Palette, Mail, Phone, MapPin,
  CheckCircle, Loader, Building2, GraduationCap, CreditCard, AlertTriangle,
  Globe, Calendar, TrendingUp, UserCog, Scale, MessageSquare,
  Briefcase, Package, Wrench, FileText, Shield, Eye, Upload,
  Award, UserPlus, ClipboardList, Plus, Edit2, Trash2, Save, Search, X,
  Mail as MailIcon, Phone as PhoneIcon
} from 'lucide-react';
import GestionRHPage from './GestionRHPage';
import GestionCommunicationPage from './GestionCommunicationPage';
import GestionDisciplinePage from './GestionDisciplinePage';
import GestionLogistiquePage from './GestionLogistiquePage';

interface AdminDashboardProps {
  defaultTab?: string;
}

// Alias pour les icônes utilisées dans les formulaires académiques
const PlusIcon = Plus;
const EditIcon = Edit2;
const TrashIcon = Trash2;
const SaveIcon = Save;
const XIcon = X;
const MailIconAlias = MailIcon;
const PhoneIconAlias = PhoneIcon;

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ defaultTab = 'overview' }) => {
  const { user, tenant: authTenant } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);

  // États pour la configuration
  const [configFormData, setConfigFormData] = useState({
    nom: '',
    slogan: '',
    email: '',
    telephone: '',
    adresse: '',
    couleurPrincipale: '#1a5276',
    couleurSecondaire: '#148f77',
    couleurAccent: '#f39c12'
  });
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // États pour les portails
  const [permissions, setPermissions] = useState<any>({
    etudiant: [],
    parent: [],
    enseignant: []
  });
  const [savingPermissions, setSavingPermissions] = useState(false);

  // États pour la gestion des utilisateurs
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [userFormData, setUserFormData] = useState({
    email: '',
    password: '',
    nom: '',
    prenom: '',
    telephone: '',
    role: 'etudiant'
  });
  const [savingUser, setSavingUser] = useState(false);

  // === ÉTATS POUR LA GESTION ACADÉMIQUE ===
  // Sous-onglet actif dans la section académique
  const [academicSubTab, setAcademicSubTab] = useState<'departements' | 'parcours' | 'ue' | 'niveaux' | 'etudiants'>('departements');
  const [loadingAcademic, setLoadingAcademic] = useState(false);

  // Données académiques
  const [departements, setDepartements] = useState<any[]>([]);
  const [parcours, setParcours] = useState<any[]>([]);
  const [ues, setUes] = useState<any[]>([]);
  const [niveauxEtude, setNiveauxEtude] = useState<any[]>([]);
  const [etudiants, setEtudiants] = useState<any[]>([]);
  const [rpUsers, setRpUsers] = useState<any[]>([]);

  // Formulaire Département
  const [showDepartementForm, setShowDepartementForm] = useState(false);
  const [editingDepartement, setEditingDepartement] = useState<any>(null);
  const [departementForm, setDepartementForm] = useState({
    code: '',
    nom: '',
    description: '',
    responsableId: ''
  });

  // Formulaire Parcours
  const [showParcoursForm, setShowParcoursForm] = useState(false);
  const [editingParcours, setEditingParcours] = useState<any>(null);
  const [parcoursForm, setParcoursForm] = useState({
    code: '',
    nom: '',
    departementId: '',
    niveau: 'Licence',
    dureeAnnees: 3,
    description: '',
    totalCredits: 60,
    responsableId: ''
  });

  // Assignation rapide RP
  const [showAssignRPModal, setShowAssignRPModal] = useState(false);
  const [assigningParcours, setAssigningParcours] = useState<any>(null);
  const [selectedRPId, setSelectedRPId] = useState('');

  // Assignation rapide Secrétaire
  const [showAssignSecretaireModal, setShowAssignSecretaireModal] = useState(false);
  const [selectedSecretaireId, setSelectedSecretaireId] = useState('');
  const [secretaireUsers, setSecretaireUsers] = useState<any[]>([]);

  // Formulaire UE
  const [showUEForm, setShowUEForm] = useState(false);
  const [editingUE, setEditingUE] = useState<any>(null);
  const [selectedParcoursForUE, setSelectedParcoursForUE] = useState('');
  const [ueForm, setUeForm] = useState({
    code: '',
    intitule: '',
    parcoursId: '',
    creditsEcts: 3,
    coefficient: 1,
    semestre: 1,
    anneeNiveau: 1,
    typeUe: 'obligatoire',
    volumeCm: 20,
    volumeTd: 20,
    volumeTp: 0
  });

  // Formulaire Étudiant
  const [showEtudiantForm, setShowEtudiantForm] = useState(false);
  const [editingEtudiant, setEditingEtudiant] = useState<any>(null);
  const [etudiantForm, setEtudiantForm] = useState({
    matricule: '',
    nom: '',
    prenom: '',
    dateNaissance: '',
    lieuNaissance: '',
    sexe: 'M',
    nationalite: 'Malagasy',
    email: '',
    telephone: '',
    adresse: '',
    nomParent: '',
    telephoneParent: '',
    emailParent: ''
  });

  // États de recherche pour chaque section (doivent être au niveau du composant)
  const [searchTermDepartements, setSearchTermDepartements] = useState('');
  const [searchTermParcours, setSearchTermParcours] = useState('');
  const [searchTermUE, setSearchTermUE] = useState('');
  const [searchTermEtudiants, setSearchTermEtudiants] = useState('');

  // Données filtrées (computed values, pas des états)
  const filteredDepartements = departements.filter(d =>
    d.code?.toLowerCase().includes(searchTermDepartements.toLowerCase()) ||
    d.nom?.toLowerCase().includes(searchTermDepartements.toLowerCase())
  );
  const filteredParcours = parcours.filter(p =>
    p.code?.toLowerCase().includes(searchTermParcours.toLowerCase()) ||
    p.nom?.toLowerCase().includes(searchTermParcours.toLowerCase())
  );
  const filteredUEs = ues.filter(u =>
    u.code?.toLowerCase().includes(searchTermUE.toLowerCase()) ||
    u.intitule?.toLowerCase().includes(searchTermUE.toLowerCase())
  );
  const filteredEtudiants = etudiants.filter(e =>
    e.matricule?.toLowerCase().includes(searchTermEtudiants.toLowerCase()) ||
    e.nom?.toLowerCase().includes(searchTermEtudiants.toLowerCase()) ||
    e.prenom?.toLowerCase().includes(searchTermEtudiants.toLowerCase())
  );

  // Chargement des données académiques quand on accède à l'onglet
  useEffect(() => {
    if (activeTab === 'academic') {
      loadAcademicData();
    }
  }, [activeTab, academicSubTab]);

  const loadAcademicData = async () => {
    try {
      setLoadingAcademic(true);
      const tid = authTenant?.id || user?.tenantId;
      if (!tid) {
        setLoadingAcademic(false);
        return;
      }

      console.log('[DEBUG Frontend] Loading academic data for tenant:', tid);
      
      // Load data with individual error handling to prevent blocking
      const loadWithFallback = async (promise: Promise<any>, fallback: any = []) => {
        try {
          const result = await promise;
          return result.data || fallback;
        } catch (error) {
          console.warn('Failed to load data:', error);
          return fallback;
        }
      };

      const [deptData, parcData, ueData, niveauxData, etuData, rpData] = await Promise.all([
        loadWithFallback(api.get(`/academic/${tid}/departements`)),
        loadWithFallback(api.get(`/academic/${tid}/parcours`)),
        loadWithFallback(api.get(`/academic/${tid}/ue${selectedParcoursForUE ? `?parcoursId=${selectedParcoursForUE}` : ''}`)),
        loadWithFallback(api.get(`/admin/${tid}/niveaux-etude`)),
        loadWithFallback(api.get(`/academic/${tid}/etudiants`)),
        loadWithFallback(api.get(`/users?role=resp_pedagogique&tenantId=${tid}`))
      ]);

      console.log('[DEBUG Frontend] Etudiants loaded:', etuData?.length || 0);
      setDepartements(deptData || []);
      setParcours(parcData || []);
      setUes(ueData || []);
      setNiveauxEtude(niveauxData || []);
      setEtudiants(etuData || []);
      setRpUsers(rpData || []);
    } catch (error) {
      console.error('Erreur chargement données académiques:', error);
      // Set empty arrays to prevent undefined errors
      setDepartements([]);
      setParcours([]);
      setUes([]);
      setNiveauxEtude([]);
      setEtudiants([]);
      setRpUsers([]);
    } finally {
      setLoadingAcademic(false);
    }
  };

  // === GESTION DÉPARTEMENTS ===
  const handleSaveDepartement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const tid = authTenant?.id || user?.tenantId;
      if (editingDepartement) {
        await api.patch(`/academic/${tid}/departements/${editingDepartement.id}`, departementForm);
        toast.success('Département modifié');
      } else {
        await api.post(`/academic/${tid}/departements`, departementForm);
        toast.success('Département créé');
      }
      setShowDepartementForm(false);
      setEditingDepartement(null);
      resetDepartementForm();
      loadAcademicData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur');
    }
  };

  const resetDepartementForm = () => {
    setDepartementForm({ code: '', nom: '', description: '', responsableId: '' });
  };

  const handleEditDepartement = (dept: any) => {
    setEditingDepartement(dept);
    setDepartementForm({
      code: dept.code,
      nom: dept.nom,
      description: dept.description || '',
      responsableId: dept.responsableId || ''
    });
    setShowDepartementForm(true);
  };

  const handleDeleteDepartement = async (id: string) => {
    if (!confirm('Supprimer ce département ?')) return;
    try {
      const tid = authTenant?.id || user?.tenantId;
      if (!tid) return;
      await api.delete(`/academic/${tid}/departements/${id}`);
      toast.success('Département supprimé');
      loadAcademicData();
    } catch (err) {
      toast.error('Erreur lors de la suppression');
    }
  };

  // === GESTION PARCOURS ===
  const handleSaveParcours = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const tid = authTenant?.id || user?.tenantId;
      if (editingParcours) {
        await api.patch(`/academic/${tid}/parcours/${editingParcours.id}`, parcoursForm);
        toast.success('Parcours modifié');
      } else {
        await api.post(`/academic/${tid}/parcours`, parcoursForm);
        toast.success('Parcours créé');
      }
      setShowParcoursForm(false);
      setEditingParcours(null);
      resetParcoursForm();
      loadAcademicData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur');
    }
  };

  const resetParcoursForm = () => {
    setParcoursForm({
      code: '', nom: '', departementId: '', niveau: 'Licence',
      dureeAnnees: 3, description: '', totalCredits: 60, responsableId: ''
    });
  };

  const handleEditParcours = (p: any) => {
    setEditingParcours(p);
    setParcoursForm({
      code: p.code, nom: p.nom, departementId: p.departementId,
      niveau: p.niveau, dureeAnnees: p.dureeAnnees,
      description: p.description || '', totalCredits: p.totalCredits || 60,
      responsableId: p.responsableId || ''
    });
    setShowParcoursForm(true);
  };

  const handleDeleteParcours = async (id: string) => {
    if (!confirm('Supprimer ce parcours ?')) return;
    try {
      const tid = authTenant?.id || user?.tenantId;
      if (!tid) return;
      await api.delete(`/academic/${tid}/parcours/${id}`);
      toast.success('Parcours supprimé');
      loadAcademicData();
    } catch (err) {
      toast.error('Erreur lors de la suppression');
    }
  };

  // === ASSIGNATION RAPIDE RP ===
  const openAssignRPModal = (p: any) => {
    setAssigningParcours(p);
    setSelectedRPId(p.responsableId || '');
    setShowAssignRPModal(true);
  };

  const handleAssignRP = async () => {
    if (!assigningParcours) return;
    try {
      const tid = authTenant?.id || user?.tenantId;
      if (!tid) return;

      await api.patch(`/academic/${tid}/parcours/${assigningParcours.id}`, {
        responsableId: selectedRPId || null
      });

      toast.success(selectedRPId ? 'Responsable Pédagogique assigné' : 'Responsable Pédagogique retiré');
      setShowAssignRPModal(false);
      setAssigningParcours(null);
      setSelectedRPId('');
      loadAcademicData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur lors de l\'assignation');
    }
  };

  // === ASSIGNATION RAPIDE SECRETAIRE ===
  const openAssignSecretaireModal = async (p: any) => {
    setAssigningParcours(p);
    setSelectedSecretaireId(p.secretaireId || '');
    setShowAssignSecretaireModal(true);
    
    // Charger les utilisateurs secrétaires
    try {
      const tid = authTenant?.id || user?.tenantId;
      if (!tid) return;
      
      console.log('[DEBUG] Chargement des secrétaires pour tenant:', tid);
      const { data } = await api.get(`/users?role=secretaire&tenantId=${tid}`);
      console.log('[DEBUG] Secrétaires reçus:', data);
      
      // Si aucun secrétaire trouvé, essayer de charger tous les utilisateurs et filtrer côté client
      if (!data || data.length === 0) {
        console.log('[DEBUG] Aucun secrétaire trouvé avec role=secretaire, essai avec tous les utilisateurs...');
        const { data: allUsers } = await api.get(`/users?tenantId=${tid}`);
        console.log('[DEBUG] Tous les utilisateurs:', allUsers);
        
        // Chercher les rôles qui contiennent 'sec', 'secrétaire', 'secretariat', etc.
        const secretaires = allUsers?.filter((u: any) => {
          const role = u.role?.toLowerCase() || '';
          return role.includes('sec') || 
                 role.includes('secretaire') || 
                 role.includes('secretariat') ||
                 role === 'sp' ||
                 role === 'secretaire_parcours';
        }) || [];
        console.log('[DEBUG] Utilisateurs filtrés (contenant sec):', secretaires);
        setSecretaireUsers(secretaires);
      } else {
        setSecretaireUsers(data);
      }
    } catch (err) {
      console.error('Erreur chargement secrétaires:', err);
      setSecretaireUsers([]);
    }
  };

  const handleAssignSecretaire = async () => {
    if (!assigningParcours) return;
    try {
      const tid = authTenant?.id || user?.tenantId;
      if (!tid) return;

      await api.post(`/secretaire/${tid}/parcours/${assigningParcours.id}/assigner-secretaire`, {
        secretaireId: selectedSecretaireId
      });

      toast.success(selectedSecretaireId ? 'Secrétaire assigné avec succès' : 'Secrétaire retiré');
      setShowAssignSecretaireModal(false);
      setAssigningParcours(null);
      setSelectedSecretaireId('');
      loadAcademicData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur lors de l\'assignation');
    }
  };

  // === GESTION UE ===
  const handleSaveUE = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const tid = authTenant?.id || user?.tenantId;
      const data = { ...ueForm, parcoursId: selectedParcoursForUE, tenantId: tid };
      if (editingUE) {
        await api.patch(`/academic/${tid}/ue/${editingUE.id}`, data);
        toast.success('UE modifiée');
      } else {
        await api.post(`/academic/${tid}/ue`, data);
        toast.success('UE créée');
      }
      setShowUEForm(false);
      setEditingUE(null);
      resetUEForm();
      loadAcademicData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur');
    }
  };

  const resetUEForm = () => {
    setUeForm({
      code: '', intitule: '', parcoursId: '', creditsEcts: 3, coefficient: 1,
      semestre: 1, anneeNiveau: 1, typeUe: 'obligatoire', volumeCm: 20, volumeTd: 20, volumeTp: 0
    });
  };

  const handleEditUE = (ue: any) => {
    setEditingUE(ue);
    setUeForm({
      code: ue.code, intitule: ue.intitule, parcoursId: ue.parcoursId,
      creditsEcts: ue.creditsEcts, coefficient: ue.coefficient,
      semestre: ue.semestre, anneeNiveau: ue.anneeNiveau,
      typeUe: ue.typeUe, volumeCm: ue.volumeCm, volumeTd: ue.volumeTd, volumeTp: ue.volumeTp
    });
    setShowUEForm(true);
  };

  const handleDeleteUE = async (id: string) => {
    if (!confirm('Supprimer cette UE ?')) return;
    try {
      const tid = authTenant?.id || user?.tenantId;
      if (!tid) return;
      await api.delete(`/academic/${tid}/ue/${id}`);
      toast.success('UE supprimée');
      loadAcademicData();
    } catch (err) {
      toast.error('Erreur lors de la suppression');
    }
  };

  // === GESTION ÉTUDIANTS ===
  const [createdAccount, setCreatedAccount] = useState<any>(null);

  const handleSaveEtudiant = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const tid = authTenant?.id || user?.tenantId;
      if (editingEtudiant) {
        await api.patch(`/academic/${tid}/etudiants/${editingEtudiant.id}`, etudiantForm);
        toast.success('Étudiant modifié');
      } else {
        const response = await api.post(`/academic/${tid}/etudiants`, etudiantForm);
        console.log('[Frontend] Student created:', response.data);

        if (response.data.compteCreé || response.data.utilisateurId) {
          setCreatedAccount({
            etudiantId: response.data.id,
            utilisateurId: response.data.utilisateurId,
            email: response.data.email || `${response.data.matricule}@etudiant.local`,
            matricule: response.data.matricule,
            nom: response.data.nom,
            prenom: response.data.prenom,
            message: response.data.message
          });
          toast.success(response.data.message || 'Étudiant et compte créés avec succès');
        } else {
          toast.success('Étudiant créé');
        }
      }
      setShowEtudiantForm(false);
      setEditingEtudiant(null);
      resetEtudiantForm();
      // Petit délai pour laisser la transaction se terminer
      setTimeout(() => loadAcademicData(), 300);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur');
    }
  };

  const resetEtudiantForm = () => {
    setEtudiantForm({
      matricule: '', nom: '', prenom: '', dateNaissance: '', lieuNaissance: '',
      sexe: 'M', nationalite: 'Malagasy', email: '', telephone: '',
      adresse: '', nomParent: '', telephoneParent: '', emailParent: ''
    });
  };

  const handleEditEtudiant = (etu: any) => {
    setEditingEtudiant(etu);
    setEtudiantForm({
      matricule: etu.matricule, nom: etu.nom, prenom: etu.prenom,
      dateNaissance: etu.dateNaissance?.split('T')[0] || '',
      lieuNaissance: etu.lieuNaissance || '',
      sexe: etu.sexe, nationalite: etu.nationalite,
      email: etu.email || '', telephone: etu.telephone || '',
      adresse: etu.adresse || '', nomParent: etu.nomParent || '',
      telephoneParent: etu.telephoneParent || '', emailParent: etu.emailParent || ''
    });
    setShowEtudiantForm(true);
  };

  const handleDeleteEtudiant = async (id: string) => {
    if (!confirm('Supprimer cet étudiant ?')) return;
    try {
      const tid = authTenant?.id || user?.tenantId;
      if (!tid) return;
      await api.delete(`/academic/${tid}/etudiants/${id}`);
      toast.success('Étudiant supprimé');
      loadAcademicData();
    } catch (err) {
      toast.error('Erreur lors de la suppression');
    }
  };

  // Synchroniser activeTab avec defaultTab
  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  // Synchroniser configFormData avec config
  useEffect(() => {
    if (config) {
      setConfigFormData({
        nom: config.nom || '',
        slogan: config.slogan || '',
        email: config.email || '',
        telephone: config.telephone || '',
        adresse: config.adresse || '',
        couleurPrincipale: config.couleurPrincipale || '#1a5276',
        couleurSecondaire: config.couleurSecondaire || '#148f77',
        couleurAccent: config.couleurAccent || '#f39c12'
      });
      setLogoPreview(config.logoUrl || null);
    }
  }, [config]);

  useEffect(() => {
    if (user?.tenantId || authTenant?.id) {
      loadData();
    }
  }, [user, authTenant]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [configRes, statsRes, permissionsRes] = await Promise.all([
        api.get('/tenants/my-tenant/config'),
        api.get('/tenants/my-tenant/stats'),
        api.get('/admin/portals/permissions')
      ]);
      setConfig(configRes.data);
      setStats(statsRes.data);
      setPermissions(permissionsRes.data);
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  // Gestion des permissions portails
  const handlePermissionToggle = async (type: string, key: string, currentValue: boolean) => {
    try {
      setSavingPermissions(true);
      await api.patch(`/admin/portals/permissions/${type}/${key}`, {
        actif: !currentValue
      });
      
      // Mettre à jour l'état local
      setPermissions((prev: any) => ({
        ...prev,
        [type]: prev[type].map((perm: any) =>
          perm.key === key ? { ...perm, actif: !currentValue } : perm
        )
      }));
      
      toast.success('Permission mise à jour');
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setSavingPermissions(false);
    }
  };

  // Gestion des utilisateurs
  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await api.get(`/users?tenantId=${authTenant?.id || user?.tenantId}`);
      setUsers(response.data);
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleUserFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUserFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateUser = () => {
    setEditingUser(null);
    setUserFormData({
      email: '',
      password: '',
      nom: '',
      prenom: '',
      telephone: '',
      role: 'etudiant'
    });
    setShowUserModal(true);
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setUserFormData({
      email: user.email,
      password: '',
      nom: user.nom,
      prenom: user.prenom,
      telephone: user.telephone || '',
      role: user.role
    });
    setShowUserModal(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingUser(true);
      
      const userData = {
        ...userFormData,
        tenantId: authTenant?.id || user?.tenantId
      };

      if (editingUser) {
        // Mise à jour
        if (!userFormData.password) {
          delete (userData as any).password;
        }
        await api.patch(`/users/${editingUser.id}`, userData);
        toast.success('Utilisateur modifié avec succès');
      } else {
        // Création
        await api.post('/users', userData);
        toast.success('Utilisateur créé avec succès');
      }

      setShowUserModal(false);
      loadUsers();
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSavingUser(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      return;
    }

    try {
      await api.delete(`/users/${userId}`);
      toast.success('Utilisateur supprimé');
      loadUsers();
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  // Charger les utilisateurs quand on accède à l'onglet users
  useEffect(() => {
    if (activeTab === 'users' && users.length === 0) {
      loadUsers();
    }
  }, [activeTab]);

  // Définition des onglets principaux
  const mainTabs = [
    { key: 'dashboard', label: 'Dashboard', icon: <Activity size={16} /> },
    { key: 'config', label: 'Configuration', icon: <Settings size={16} /> },
    { key: 'portals', label: 'Comptes Portails', icon: <Users size={16} /> },
    { key: 'users', label: 'Gestion Utilisateurs', icon: <UserCog size={16} /> },
    { key: 'academic', label: 'Académique', icon: <BookOpen size={16} /> },
    { key: 'finance', label: 'Finance', icon: <DollarSign size={16} /> },
    { key: 'rh', label: 'RH', icon: <Briefcase size={16} /> },
    { key: 'communication', label: 'Communication', icon: <MessageSquare size={16} /> },
    { key: 'discipline', label: 'Discipline', icon: <Scale size={16} /> },
    { key: 'logistics', label: 'Logistique', icon: <Package size={16} /> }
  ];

  // Rendu du dashboard principal
  const renderDashboard = () => (
    <div className="row g-4">
      <div className="col-12">
        <h4 className="mb-4">Dashboard - Vue d'Ensemble</h4>
      </div>

      {/* Statistiques principales */}
      <div className="col-md-3">
        <div className="card border-0 shadow-sm h-100">
          <div className="card-body">
            <div className="d-flex align-items-center mb-3">
              <div className="p-2 bg-primary bg-opacity-10 rounded me-3">
                <Users size={24} className="text-primary" />
              </div>
              <div>
                <h6 className="mb-0 text-muted">Utilisateurs</h6>
                <h3 className="mb-0">{stats?.users?.total || 0}</h3>
              </div>
            </div>
            <small className="text-success">
              <CheckCircle size={14} className="me-1" />
              {stats?.users?.active || 0} actifs
            </small>
          </div>
        </div>
      </div>

      <div className="col-md-3">
        <div className="card border-0 shadow-sm h-100">
          <div className="card-body">
            <div className="d-flex align-items-center mb-3">
              <div className="p-2 bg-success bg-opacity-10 rounded me-3">
                <GraduationCap size={24} className="text-success" />
              </div>
              <div>
                <h6 className="mb-0 text-muted">Étudiants</h6>
                <h3 className="mb-0">{stats?.academic?.students || 0}</h3>
              </div>
            </div>
            <small className="text-muted">
              {stats?.academic?.parcours || 0} parcours
            </small>
          </div>
        </div>
      </div>

      <div className="col-md-3">
        <div className="card border-0 shadow-sm h-100">
          <div className="card-body">
            <div className="d-flex align-items-center mb-3">
              <div className="p-2 bg-warning bg-opacity-10 rounded me-3">
                <DollarSign size={24} className="text-warning" />
              </div>
              <div>
                <h6 className="mb-0 text-muted">Revenus Mois</h6>
                <h3 className="mb-0">{stats?.finance?.monthlyRevenue?.toLocaleString() || 0} Ar</h3>
              </div>
            </div>
            <small className="text-warning">
              <AlertTriangle size={14} className="me-1" />
              {stats?.finance?.pendingPayments || 0} en attente
            </small>
          </div>
        </div>
      </div>

      <div className="col-md-3">
        <div className="card border-0 shadow-sm h-100">
          <div className="card-body">
            <div className="d-flex align-items-center mb-3">
              <div className="p-2 bg-info bg-opacity-10 rounded me-3">
                <Calendar size={24} className="text-info" />
              </div>
              <div>
                <h6 className="mb-0 text-muted">Abonnement</h6>
                <h3 className="mb-0">{config?.planAbonnement || 'N/A'}</h3>
              </div>
            </div>
            <small className="text-muted">
              Expire: {config?.dateFinAbonnement ? new Date(config.dateFinAbonnement).toLocaleDateString('fr-FR') : 'N/A'}
            </small>
          </div>
        </div>
      </div>

      {/* Informations de l'université */}
      <div className="col-md-8">
        <div className="card border-0 shadow-sm">
          <div className="card-body">
            <h5 className="card-title mb-4">Informations de l'Université</h5>
            <div className="row g-3">
              <div className="col-md-6">
                <div className="d-flex align-items-start">
                  <Building2 size={20} className="text-muted me-2 mt-1" />
                  <div>
                    <small className="text-muted d-block">Nom</small>
                    <strong>{config?.nom || 'N/A'}</strong>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="d-flex align-items-start">
                  <Mail size={20} className="text-muted me-2 mt-1" />
                  <div>
                    <small className="text-muted d-block">Email</small>
                    <strong>{config?.email || 'N/A'}</strong>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="d-flex align-items-start">
                  <Phone size={20} className="text-muted me-2 mt-1" />
                  <div>
                    <small className="text-muted d-block">Téléphone</small>
                    <strong>{config?.telephone || 'N/A'}</strong>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="d-flex align-items-start">
                  <MapPin size={20} className="text-muted me-2 mt-1" />
                  <div>
                    <small className="text-muted d-block">Adresse</small>
                    <strong>{config?.adresse || 'N/A'}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activités récentes */}
      <div className="col-md-4">
        <div className="card border-0 shadow-sm">
          <div className="card-body">
            <h5 className="card-title mb-4">Activités Récentes</h5>
            <div className="list-group list-group-flush">
              <div className="list-group-item px-0 border-0">
                <small className="text-muted">Aucune activité récente</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Handlers pour la configuration
  const handleConfigInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setConfigFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfigSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // Préparer les données à envoyer
      const updateData = new FormData();
      Object.entries(configFormData).forEach(([key, value]) => {
        updateData.append(key, value);
      });
      
      if (logoFile) {
        updateData.append('logo', logoFile);
      }

      // Envoyer la mise à jour
      await api.put('/tenants/my-tenant/config', updateData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Configuration mise à jour avec succès!');
      
      // Recharger les données
      await loadData();
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  // Rendu de la configuration
  const renderConfig = () => (
    <form onSubmit={handleConfigSubmit}>
      <div className="row g-4">
        {/* Informations Générales */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h5 className="card-title mb-4">
                <Building2 size={20} className="me-2" />
                Informations Générales
              </h5>
              
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Nom de l'Université *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="nom"
                    value={configFormData.nom}
                    onChange={handleConfigInputChange}
                    required
                  />
                </div>
                
                <div className="col-md-6">
                  <label className="form-label">Slogan</label>
                  <input
                    type="text"
                    className="form-control"
                    name="slogan"
                    value={configFormData.slogan}
                    onChange={handleConfigInputChange}
                    placeholder="Ex: Excellence et Innovation"
                  />
                </div>
                  
                  <div className="col-md-6">
                    <label className="form-label">Email *</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <Mail size={16} />
                      </span>
                <input
                  type="email"
                  className="form-control"
                  name="email"
                  value={configFormData.email}
                  onChange={handleConfigInputChange}
                  required
                />
              </div>
            </div>
            
            <div className="col-md-6">
              <label className="form-label">Téléphone *</label>
              <div className="input-group">
                <span className="input-group-text">
                  <Phone size={16} />
                </span>
                <input
                  type="tel"
                  className="form-control"
                  name="telephone"
                  value={configFormData.telephone}
                  onChange={handleConfigInputChange}
                  required
                />
              </div>
            </div>
            
            <div className="col-12">
              <label className="form-label">Adresse *</label>
              <div className="input-group">
                <span className="input-group-text">
                  <MapPin size={16} />
                </span>
                <textarea
                  className="form-control"
                  name="adresse"
                  value={configFormData.adresse}
                  onChange={handleConfigInputChange}
                  rows={2}
                  required
                />
              </div>
            </div>
                </div>
              </div>
            </div>
          </div>

          {/* Logo */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h5 className="card-title mb-4">Logo</h5>
                
                <div className="text-center mb-3">
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Logo"
                      className="img-fluid rounded"
                      style={{ maxHeight: '150px', objectFit: 'contain' }}
                    />
                  ) : (
                    <div
                      className="d-flex align-items-center justify-content-center bg-light rounded"
                      style={{ height: '150px' }}
                    >
                      <Building2 size={48} className="text-muted" />
                    </div>
                  )}
                </div>
                
                <input
                  type="file"
                  className="form-control"
                  accept="image/*"
                  onChange={handleLogoChange}
                />
                <small className="text-muted d-block mt-2">
                  Format: PNG, JPG (max 2MB)
                </small>
              </div>
            </div>
          </div>

          {/* Couleurs */}
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h5 className="card-title mb-4">
                  <Palette size={20} className="me-2" />
                  Personnalisation des Couleurs
                </h5>
                
                <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">Couleur Principale</label>
                  <div className="d-flex gap-2 align-items-center">
                    <input
                      type="color"
                      className="form-control form-control-color"
                      name="couleurPrincipale"
                      value={configFormData.couleurPrincipale}
                      onChange={handleConfigInputChange}
                      style={{ width: '60px' }}
                    />
                    <input
                      type="text"
                      className="form-control"
                      value={configFormData.couleurPrincipale}
                      onChange={handleConfigInputChange}
                      name="couleurPrincipale"
                    />
                  </div>
                </div>
                
                <div className="col-md-4">
                  <label className="form-label">Couleur Secondaire</label>
                  <div className="d-flex gap-2 align-items-center">
                    <input
                      type="color"
                      className="form-control form-control-color"
                      name="couleurSecondaire"
                      value={configFormData.couleurSecondaire}
                      onChange={handleConfigInputChange}
                      style={{ width: '60px' }}
                    />
                    <input
                      type="text"
                      className="form-control"
                      value={configFormData.couleurSecondaire}
                      onChange={handleConfigInputChange}
                      name="couleurSecondaire"
                    />
                  </div>
                </div>
                
                <div className="col-md-4">
                  <label className="form-label">Couleur Accent</label>
                  <div className="d-flex gap-2 align-items-center">
                    <input
                      type="color"
                      className="form-control form-control-color"
                      name="couleurAccent"
                      value={configFormData.couleurAccent}
                      onChange={handleConfigInputChange}
                      style={{ width: '60px' }}
                    />
                    <input
                      type="text"
                      className="form-control"
                      value={configFormData.couleurAccent}
                      onChange={handleConfigInputChange}
                      name="couleurAccent"
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-3 p-3 bg-light rounded">
                <small className="text-muted d-block mb-2">Aperçu:</small>
                <div className="d-flex gap-2">
                  <div
                    className="rounded"
                    style={{
                      width: '60px',
                      height: '40px',
                      backgroundColor: configFormData.couleurPrincipale
                    }}
                  />
                  <div
                    className="rounded"
                    style={{
                      width: '60px',
                      height: '40px',
                      backgroundColor: configFormData.couleurSecondaire
                    }}
                  />
                  <div
                    className="rounded"
                    style={{
                      width: '60px',
                      height: '40px',
                      backgroundColor: configFormData.couleurAccent
                    }}
                  />
                </div>
              </div>
              </div>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="col-12">
            <div className="d-flex gap-2 justify-content-end">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => loadData()}
                disabled={saving}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader className="spinner-border spinner-border-sm me-2" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} className="me-2" />
                    Enregistrer
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    );

  // Rendu des comptes portails
  const renderPortals = () => {
    const portailsConfig = [
      { type: 'etudiant', label: 'Portail Étudiant', icon: GraduationCap, color: 'primary' },
      { type: 'parent', label: 'Portail Parent', icon: Users, color: 'success' },
      { type: 'enseignant', label: 'Portail Enseignant', icon: UserCog, color: 'warning' }
    ];

    return (
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <h5 className="card-title mb-4">
            <Users size={20} className="me-2" />
            Gestion des Comptes Portails
          </h5>
          
          <div className="row g-4">
            {portailsConfig.map(({ type, label, icon: Icon, color }) => (
              <div key={type} className="col-md-4">
                <div className={`card border-${color}`}>
                  <div className={`card-header bg-${color} ${color === 'warning' ? 'text-dark' : 'text-white'}`}>
                    <h6 className="mb-0">
                      <Icon size={18} className="me-2" />
                      {label}
                    </h6>
                  </div>
                  <div className="card-body">
                    <h6 className="text-muted mb-3">Droits d'accès:</h6>
                    {permissions[type] && permissions[type].length > 0 ? (
                      <div className="list-group list-group-flush">
                        {permissions[type].map((perm: any) => (
                          <div key={perm.key} className="list-group-item px-0 py-2 border-0">
                            <div className="form-check">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id={`${type}-${perm.key}`}
                                checked={perm.actif}
                                onChange={() => handlePermissionToggle(type, perm.key, perm.actif)}
                                disabled={savingPermissions}
                              />
                              <label
                                className="form-check-label small"
                                htmlFor={`${type}-${perm.key}`}
                                style={{ cursor: 'pointer' }}
                              >
                                {perm.label}
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted small">Chargement des permissions...</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Rendu de la gestion des utilisateurs
  const renderUsers = () => {
    const roleLabels: Record<string, string> = {
      president: 'Président',
      admin: 'Administrateur',
      resp_pedagogique: 'Resp. Pédagogique',
      secretaire_parcours: 'Secrétaire Parcours',
      surveillant_general: 'Surveillant Général',
      scolarite: 'Scolarité',
      rh: 'RH',
      economat: 'Économat',
      caissier: 'Caissier',
      communication: 'Communication',
      logistique: 'Logistique',
      entretien: 'Entretien',
      etudiant: 'Étudiant',
      parent: 'Parent',
      enseignant: 'Enseignant'
    };

    const getRoleBadgeColor = (role: string) => {
      const colors: Record<string, string> = {
        president: 'danger',
        admin: 'primary',
        resp_pedagogique: 'info',
        etudiant: 'success',
        parent: 'warning',
        enseignant: 'secondary'
      };
      return colors[role] || 'secondary';
    };

    return (
      <>
        <div className="card border-0 shadow-sm">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="card-title mb-0">
                <UserCog size={20} className="me-2" />
                Gestion des Utilisateurs
              </h5>
              <button
                className="btn btn-primary"
                onClick={handleCreateUser}
              >
                <Users size={16} className="me-2" />
                Nouvel Utilisateur
              </button>
            </div>

            {loadingUsers ? (
              <div className="text-center py-5">
                <Loader className="spinner-border text-primary" />
                <p className="text-muted mt-2">Chargement...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-5">
                <Users size={48} className="text-muted mb-3" />
                <p className="text-muted">Aucun utilisateur trouvé</p>
                <button className="btn btn-primary mt-2" onClick={handleCreateUser}>
                  Créer le premier utilisateur
                </button>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Nom & Prénom</th>
                      <th>Email</th>
                      <th>Téléphone</th>
                      <th>Rôle</th>
                      <th>Statut</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u: any) => (
                      <tr key={u.id}>
                        <td>
                          <strong>{u.nom} {u.prenom}</strong>
                        </td>
                        <td>{u.email}</td>
                        <td>{u.telephone || '-'}</td>
                        <td>
                          <span className={`badge bg-${getRoleBadgeColor(u.role)}`}>
                            {roleLabels[u.role] || u.role}
                          </span>
                        </td>
                        <td>
                          {u.actif ? (
                            <span className="badge bg-success">Actif</span>
                          ) : (
                            <span className="badge bg-secondary">Inactif</span>
                          )}
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-primary me-2"
                            onClick={() => handleEditUser(u)}
                            title="Modifier"
                          >
                            <Settings size={14} />
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDeleteUser(u.id)}
                            title="Supprimer"
                          >
                            <AlertTriangle size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Modal de formulaire */}
        {showUserModal && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {editingUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowUserModal(false)}
                    disabled={savingUser}
                  />
                </div>
                <form onSubmit={handleSaveUser}>
                  <div className="modal-body">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">Nom *</label>
                        <input
                          type="text"
                          className="form-control"
                          name="nom"
                          value={userFormData.nom}
                          onChange={handleUserFormChange}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Prénom *</label>
                        <input
                          type="text"
                          className="form-control"
                          name="prenom"
                          value={userFormData.prenom}
                          onChange={handleUserFormChange}
                          required
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-label">Email *</label>
                        <input
                          type="email"
                          className="form-control"
                          name="email"
                          value={userFormData.email}
                          onChange={handleUserFormChange}
                          required
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-label">
                          Mot de passe {editingUser ? '(laisser vide pour ne pas changer)' : '*'}
                        </label>
                        <input
                          type="password"
                          className="form-control"
                          name="password"
                          value={userFormData.password}
                          onChange={handleUserFormChange}
                          required={!editingUser}
                          minLength={6}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Téléphone</label>
                        <input
                          type="tel"
                          className="form-control"
                          name="telephone"
                          value={userFormData.telephone}
                          onChange={handleUserFormChange}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Rôle *</label>
                        <select
                          className="form-select"
                          name="role"
                          value={userFormData.role}
                          onChange={handleUserFormChange}
                          required
                        >
                          <optgroup label="Administration">
                            <option value="admin">Administrateur</option>
                            <option value="president">Président</option>
                            <option value="resp_pedagogique">Resp. Pédagogique</option>
                            <option value="secretaire_parcours">Secrétaire Parcours</option>
                            <option value="surveillant_general">Surveillant Général</option>
                          </optgroup>
                          <optgroup label="Services">
                            <option value="scolarite">Scolarité</option>
                            <option value="rh">RH</option>
                            <option value="economat">Économat</option>
                            <option value="caissier">Caissier</option>
                            <option value="communication">Communication</option>
                            <option value="logistique">Logistique</option>
                            <option value="entretien">Entretien</option>
                          </optgroup>
                          <optgroup label="Portails">
                            <option value="etudiant">Étudiant</option>
                            <option value="parent">Parent</option>
                            <option value="enseignant">Enseignant</option>
                          </optgroup>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowUserModal(false)}
                      disabled={savingUser}
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={savingUser}
                    >
                      {savingUser ? (
                        <>
                          <Loader className="spinner-border spinner-border-sm me-2" />
                          Enregistrement...
                        </>
                      ) : (
                        <>
                          <CheckCircle size={16} className="me-2" />
                          {editingUser ? 'Modifier' : 'Créer'}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  // Rendu de la gestion académique avec sous-onglets et formulaires
  const renderAcademic = () => {
    const academicTabs = [
      { key: 'departements', label: 'Départements', icon: Building2, count: departements.length, color: 'primary' },
      { key: 'parcours', label: 'Parcours', icon: GraduationCap, count: parcours.length, color: 'success' },
      { key: 'ue', label: 'UE', icon: BookOpen, count: ues.length, color: 'warning' },
      { key: 'niveaux', label: 'Niveaux', icon: Award, count: niveauxEtude.length, color: 'secondary' },
      { key: 'etudiants', label: 'Étudiants', icon: Users, count: etudiants.length, color: 'info' }
    ];

    return (
      <div>
        {/* En-tête avec stats rapides */}
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div>
              <h5 className="mb-1 d-flex align-items-center gap-2">
                <div className="p-2 bg-primary bg-opacity-10 rounded">
                  <BookOpen size={20} className="text-primary" />
                </div>
                Gestion Académique
              </h5>
              <p className="text-muted mb-0 small ms-5">Configuration des structures pédagogiques et étudiants</p>
            </div>
          </div>

          {/* Cartes stats rapides */}
          <div className="row g-2 ms-0">
            {academicTabs.map((tab) => (
              <div key={tab.key} className="col-auto">
                <button
                  onClick={() => setAcademicSubTab(tab.key as any)}
                  className={`btn btn-sm d-flex align-items-center gap-2 ${
                    academicSubTab === tab.key
                      ? `btn-${tab.color}`
                      : 'btn-outline-light text-dark border'
                  }`}
                  style={{ 
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s ease',
                    transform: academicSubTab === tab.key ? 'scale(1.02)' : 'scale(1)'
                  }}
                >
                  <tab.icon size={16} />
                  <span className="fw-medium">{tab.label}</span>
                  <span className={`badge ${academicSubTab === tab.key ? 'bg-white' : `bg-${tab.color}`} ${academicSubTab === tab.key ? `text-${tab.color}` : ''}`}>
                    {tab.count}
                  </span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Contenu selon le sous-onglet */}
        {loadingAcademic ? (
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center py-5">
              <div className="mb-3">
                <Loader size={40} className="spinner-border text-primary" />
              </div>
              <h6 className="text-muted">Chargement des données...</h6>
              <p className="text-muted small mb-0">Veuillez patienter</p>
            </div>
          </div>
        ) : (
          <>
            {academicSubTab === 'departements' && renderDepartementsSection()}
            {academicSubTab === 'parcours' && renderParcoursSection()}
            {academicSubTab === 'ue' && renderUESection()}
            {academicSubTab === 'niveaux' && renderNiveauxSection()}
            {academicSubTab === 'etudiants' && renderEtudiantsSection()}
          </>
        )}
      </div>
    );
  };

  // === SECTION DÉPARTEMENTS ===
  const renderDepartementsSection = () => (
    <div className="card border-0 shadow-sm">
      <div className="card-body">
        {/* En-tête avec recherche */}
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <div className="d-flex align-items-center gap-2">
            <h6 className="card-title mb-0 text-primary">
              <Building2 size={18} className="me-2" />
              Liste des Départements
            </h6>
            <span className="badge bg-primary bg-opacity-10 text-primary">
              {departements.length}
            </span>
          </div>
          <div className="d-flex gap-2">
            {departements.length > 0 && (
              <div className="input-group input-group-sm" style={{ width: '250px' }}>
                <span className="input-group-text bg-light border-end-0">
                  <Search size={14} className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control bg-light border-start-0"
                  placeholder="Rechercher..."
                  value={searchTermDepartements}
                  onChange={(e) => setSearchTermDepartements(e.target.value)}
                />
                {searchTermDepartements && (
                  <button
                    className="btn btn-outline-secondary border-start-0"
                    type="button"
                    onClick={() => setSearchTermDepartements('')}
                  >
                    <XIcon size={14} />
                  </button>
                )}
              </div>
            )}
            <button
              className="btn btn-primary btn-sm"
              onClick={() => { resetDepartementForm(); setShowDepartementForm(true); }}
            >
              <PlusIcon size={16} className="me-1" />
              Nouveau
            </button>
          </div>
        </div>

        {/* Formulaire */}
        {showDepartementForm && (
          <form onSubmit={handleSaveDepartement} className="card border-primary border-0 border-start border-4 mb-4 bg-light">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0 text-primary fw-semibold">
                  {editingDepartement ? '✏️ Modifier' : '➕ Nouveau'} Département
                </h6>
                <button
                  type="button"
                  className="btn btn-sm btn-link text-muted p-0"
                  onClick={() => { setShowDepartementForm(false); setEditingDepartement(null); }}
                >
                  <XIcon size={20} />
                </button>
              </div>
              <div className="row g-3">
                <div className="col-md-2">
                  <label className="form-label small fw-medium">Code *</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={departementForm.code}
                    onChange={(e) => setDepartementForm({ ...departementForm, code: e.target.value.toUpperCase() })}
                    required
                    placeholder="INFO"
                    maxLength={10}
                  />
                  <small className="text-muted">Ex: INFO, MATH, PHYS</small>
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-medium">Nom *</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={departementForm.nom}
                    onChange={(e) => setDepartementForm({ ...departementForm, nom: e.target.value })}
                    required
                    placeholder="Informatique"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-medium">Description</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={departementForm.description}
                    onChange={(e) => setDepartementForm({ ...departementForm, description: e.target.value })}
                    placeholder="Description facultative..."
                  />
                </div>
              </div>
              <div className="d-flex gap-2 mt-3">
                <button type="submit" className="btn btn-primary btn-sm">
                  <SaveIcon size={14} className="me-1" />
                  Enregistrer
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => { setShowDepartementForm(false); setEditingDepartement(null); }}
                >
                  Annuler
                </button>
              </div>
            </div>
          </form>
        )}

        {/* État vide amélioré */}
        {departements.length === 0 ? (
          <div className="text-center py-5">
            <div className="mb-4">
              <div className="d-inline-flex align-items-center justify-content-center bg-light rounded-circle" style={{ width: '80px', height: '80px' }}>
                <Building2 size={40} className="text-primary opacity-50" />
              </div>
            </div>
            <h5 className="text-muted mb-2">Aucun département créé</h5>
            <p className="text-muted small mb-4 max-w-md mx-auto" style={{ maxWidth: '400px' }}>
              Les départements sont la première étape de la structure académique. 
              Créez un département pour commencer à organiser vos parcours.
            </p>
            <button
              className="btn btn-primary"
              onClick={() => { resetDepartementForm(); setShowDepartementForm(true); }}
            >
              <PlusIcon size={18} className="me-2" />
              Créer mon premier département
            </button>
          </div>
        ) : filteredDepartements.length === 0 ? (
          <div className="text-center py-4">
            <Search size={32} className="text-muted mb-2 opacity-50" />
            <p className="text-muted mb-0">Aucun département ne correspond à votre recherche</p>
            <button className="btn btn-link btn-sm" onClick={() => setSearchTermDepartements('')}>
              Effacer la recherche
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th className="small fw-semibold text-uppercase">Code</th>
                  <th className="small fw-semibold text-uppercase">Nom</th>
                  <th className="small fw-semibold text-uppercase">Description</th>
                  <th className="small fw-semibold text-uppercase text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDepartements.map((dept) => (
                  <tr key={dept.id} className="border-top">
                    <td>
                      <span className="badge bg-primary fs-6 fw-bold px-3">{dept.code}</span>
                    </td>
                    <td className="fw-semibold">{dept.nom}</td>
                    <td className="text-muted small">{dept.description || <em className="text-muted opacity-50">Aucune description</em>}</td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        <button
                          className="btn btn-outline-primary"
                          onClick={() => handleEditDepartement(dept)}
                          title="Modifier"
                        >
                          <EditIcon size={14} />
                        </button>
                        <button
                          className="btn btn-outline-danger"
                          onClick={() => handleDeleteDepartement(dept.id)}
                          title="Supprimer"
                        >
                          <TrashIcon size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  // === SECTION PARCOURS ===
  const renderParcoursSection = () => (
    <div className="card border-0 shadow-sm">
      <div className="card-body">
        {/* En-tête avec recherche */}
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <div className="d-flex align-items-center gap-2">
            <h6 className="card-title mb-0 text-success">
              <GraduationCap size={18} className="me-2" />
              Liste des Parcours
            </h6>
            <span className="badge bg-success bg-opacity-10 text-success">
              {parcours.length}
            </span>
          </div>
          <div className="d-flex gap-2">
            {parcours.length > 0 && (
              <div className="input-group input-group-sm" style={{ width: '250px' }}>
                <span className="input-group-text bg-light border-end-0">
                  <Search size={14} className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control bg-light border-start-0"
                  placeholder="Rechercher..."
                  value={searchTermParcours}
                  onChange={(e) => setSearchTermParcours(e.target.value)}
                />
                {searchTermParcours && (
                  <button
                    className="btn btn-outline-secondary border-start-0"
                    type="button"
                    onClick={() => setSearchTermParcours('')}
                  >
                    <XIcon size={14} />
                  </button>
                )}
              </div>
            )}
            <button
              className="btn btn-success btn-sm"
              onClick={() => { resetParcoursForm(); setShowParcoursForm(true); }}
              disabled={departements.length === 0}
              title={departements.length === 0 ? "Créez d'abord un département" : ""}
            >
              <PlusIcon size={16} className="me-1" />
              Nouveau
            </button>
          </div>
        </div>

        {/* Formulaire */}
        {showParcoursForm && (
          <form onSubmit={handleSaveParcours} className="card border-success border-0 border-start border-4 mb-4 bg-light">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0 text-success fw-semibold">
                  {editingParcours ? '✏️ Modifier' : '➕ Nouveau'} Parcours
                </h6>
                <button
                  type="button"
                  className="btn btn-sm btn-link text-muted p-0"
                  onClick={() => { setShowParcoursForm(false); setEditingParcours(null); }}
                >
                  <XIcon size={20} />
                </button>
              </div>
              <div className="row g-3">
                <div className="col-md-2">
                  <label className="form-label small fw-medium">Code *</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={parcoursForm.code}
                    onChange={(e) => setParcoursForm({ ...parcoursForm, code: e.target.value.toUpperCase() })}
                    required
                    placeholder="L1-INFO"
                    maxLength={15}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-medium">Nom *</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={parcoursForm.nom}
                    onChange={(e) => setParcoursForm({ ...parcoursForm, nom: e.target.value })}
                    required
                    placeholder="Licence 1 Informatique"
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label small fw-medium">Département *</label>
                  <select
                    className="form-select form-select-sm"
                    value={parcoursForm.departementId}
                    onChange={(e) => setParcoursForm({ ...parcoursForm, departementId: e.target.value })}
                    required
                  >
                    <option value="">Choisir...</option>
                    {departements.map((d) => (
                      <option key={d.id} value={d.id}>{d.code} - {d.nom}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-2">
                  <label className="form-label small fw-medium">Niveau</label>
                  <select
                    className="form-select form-select-sm"
                    value={parcoursForm.niveau}
                    onChange={(e) => setParcoursForm({ ...parcoursForm, niveau: e.target.value })}
                  >
                    <option value="Licence">Licence</option>
                    <option value="Master">Master</option>
                    <option value="Doctorat">Doctorat</option>
                    <option value="BTS">BTS</option>
                    <option value="DUT">DUT</option>
                  </select>
                </div>
                <div className="col-md-1">
                  <label className="form-label small fw-medium">Durée</label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    value={parcoursForm.dureeAnnees}
                    onChange={(e) => setParcoursForm({ ...parcoursForm, dureeAnnees: parseInt(e.target.value) })}
                    min={1}
                    max={8}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-medium">Description</label>
                  <textarea
                    className="form-control form-control-sm"
                    rows={2}
                    value={parcoursForm.description}
                    onChange={(e) => setParcoursForm({ ...parcoursForm, description: e.target.value })}
                    placeholder="Description facultative du parcours..."
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-medium">Responsable Pédagogique</label>
                  <select
                    className="form-select form-select-sm"
                    value={parcoursForm.responsableId}
                    onChange={(e) => setParcoursForm({ ...parcoursForm, responsableId: e.target.value })}
                  >
                    <option value="">-- Aucun --</option>
                    {rpUsers.map((rp) => (
                      <option key={rp.id} value={rp.id}>{rp.prenom} {rp.nom}</option>
                    ))}
                  </select>
                  {rpUsers.length === 0 && (
                    <small className="text-muted">Aucun utilisateur RP disponible. Créez un utilisateur avec le rôle "Resp. Pédagogique".</small>
                  )}
                </div>
              </div>
              <div className="d-flex gap-2 mt-3">
                <button type="submit" className="btn btn-success btn-sm">
                  <SaveIcon size={14} className="me-1" />
                  Enregistrer
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => { setShowParcoursForm(false); setEditingParcours(null); }}
                >
                  Annuler
                </button>
              </div>
            </div>
          </form>
        )}

        {/* État vide */}
        {parcours.length === 0 ? (
          <div className="text-center py-5">
            <div className="mb-4">
              <div className="d-inline-flex align-items-center justify-content-center bg-light rounded-circle" style={{ width: '80px', height: '80px' }}>
                <GraduationCap size={40} className="text-success opacity-50" />
              </div>
            </div>
            <h5 className="text-muted mb-2">Aucun parcours créé</h5>
            <p className="text-muted small mb-4" style={{ maxWidth: '400px' }}>
              {departements.length === 0 ? (
                <>
                  <span className="d-block mb-2">⚠️ Vous devez d'abord créer un département.</span>
                  <span className="text-muted">Rendez-vous sur l'onglet "Départements" pour commencer.</span>
                </>
              ) : (
                "Créez un parcours pour organiser vos formations."
              )}
            </p>
            {departements.length > 0 && (
              <button
                className="btn btn-success"
                onClick={() => { resetParcoursForm(); setShowParcoursForm(true); }}
              >
                <PlusIcon size={18} className="me-2" />
                Créer mon premier parcours
              </button>
            )}
          </div>
        ) : filteredParcours.length === 0 ? (
          <div className="text-center py-4">
            <Search size={32} className="text-muted mb-2 opacity-50" />
            <p className="text-muted mb-0">Aucun parcours ne correspond à votre recherche</p>
            <button className="btn btn-link btn-sm" onClick={() => setSearchTermParcours('')}>
              Effacer la recherche
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th className="small fw-semibold text-uppercase">Code</th>
                  <th className="small fw-semibold text-uppercase">Nom</th>
                  <th className="small fw-semibold text-uppercase">Département</th>
                  <th className="small fw-semibold text-uppercase">Niveau</th>
                  <th className="small fw-semibold text-uppercase">Durée</th>
                  <th className="small fw-semibold text-uppercase">Responsable Pédagogique</th>
                  <th className="small fw-semibold text-uppercase">Secrétaire</th>
                  <th className="small fw-semibold text-uppercase text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredParcours.map((p) => {
                  const dept = departements.find((d) => d.id === p.departementId);
                  // Utiliser les données du responsable retournées par le backend
                  const rp = p.responsable || rpUsers.find((r) => r.id === p.responsableId);
                  // Utiliser secretaireAssigne du backend (via secretaire_parcours)
                  const sec = p.secretaireAssigne || secretaireUsers.find((s) => s.id === p.secretaireId);
                  return (
                    <tr key={p.id} className="border-top">
                      <td>
                        <span className="badge bg-success fs-6 fw-bold px-3">{p.code}</span>
                      </td>
                      <td className="fw-semibold">{p.nom}</td>
                      <td>
                        {dept ? (
                          <span className="badge bg-primary bg-opacity-10 text-primary">
                            {dept.code}
                          </span>
                        ) : (
                          <em className="text-muted">-</em>
                        )}
                      </td>
                      <td><span className="badge bg-info">{p.niveau}</span></td>
                      <td>{p.dureeAnnees} ans</td>
                      <td>
                        {rp ? (
                          <span className="badge bg-info bg-opacity-10 text-info">
                            <UserCog size={12} className="me-1" />
                            {rp.prenom} {rp.nom}
                          </span>
                        ) : (
                          <em className="text-muted small">Non assigné</em>
                        )}
                      </td>
                      <td>
                        {sec ? (
                          <span className="badge bg-success bg-opacity-10 text-success">
                            <UserPlus size={12} className="me-1" />
                            {sec.prenom} {sec.nom}
                          </span>
                        ) : (
                          <em className="text-muted small">Non assigné</em>
                        )}
                      </td>
                      <td className="text-end">
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-outline-info"
                            onClick={() => openAssignRPModal(p)}
                            title={p.responsableId ? "Changer le Responsable Pédagogique" : "Assigner un Responsable Pédagogique"}
                          >
                            <UserCog size={14} />
                          </button>
                          <button
                            className="btn btn-outline-success"
                            onClick={() => openAssignSecretaireModal(p)}
                            title={p.secretaireId ? "Changer le Secrétaire" : "Assigner un Secrétaire"}
                          >
                            <UserPlus size={14} />
                          </button>
                          <button
                            className="btn btn-outline-primary"
                            onClick={() => handleEditParcours(p)}
                            title="Modifier"
                          >
                            <EditIcon size={14} />
                          </button>
                          <button
                            className="btn btn-outline-danger"
                            onClick={() => handleDeleteParcours(p.id)}
                            title="Supprimer"
                          >
                            <TrashIcon size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Modal Assignation Rapide Secrétaire */}
            {showAssignSecretaireModal && assigningParcours && (
              <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <div className="modal-dialog modal-dialog-centered">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">
                        <UserPlus size={18} className="me-2 text-success" />
                        Assigner un Secrétaire
                      </h5>
                      <button
                        type="button"
                        className="btn-close"
                        onClick={() => { setShowAssignSecretaireModal(false); setAssigningParcours(null); setSelectedSecretaireId(''); }}
                      />
                    </div>
                    <div className="modal-body">
                      <div className="alert alert-light border mb-3">
                        <strong>Parcours :</strong> {assigningParcours.code} - {assigningParcours.nom}
                      </div>
                      
                      {assigningParcours.secretaireId && (
                        <div className="alert alert-warning py-2 mb-3">
                          <small>⚠️ Ce parcours a déjà un secrétaire assigné. La nouvelle assignation remplacera l'ancienne.</small>
                        </div>
                      )}
                      
                      <div className="mb-3">
                        <label className="form-label fw-semibold">Sélectionner un Secrétaire</label>
                        <select
                          className="form-select"
                          value={selectedSecretaireId}
                          onChange={(e) => setSelectedSecretaireId(e.target.value)}
                        >
                          <option value="">-- Non assigné --</option>
                          {secretaireUsers.map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.prenom} {u.nom} ({u.email})
                            </option>
                          ))}
                        </select>
                        {secretaireUsers.length === 0 && (
                          <div className="alert alert-warning py-2 mt-2">
                            <strong>Aucun utilisateur trouvé avec le rôle "secretaire".</strong><br/>
                            <small>Vérifiez la console (F12) pour voir les rôles disponibles.<br/>
                            Les rôles possibles sont : secretaire, secretaire_parcours, etc.</small>
                          </div>
                        )}
                      </div>
                      
                      <div className="alert alert-info py-2">
                        <small>💡 <strong>Règle :</strong> Un secrétaire peut gérer plusieurs parcours, mais un parcours ne peut avoir qu'un seul secrétaire.</small>
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => { setShowAssignSecretaireModal(false); setAssigningParcours(null); setSelectedSecretaireId(''); }}
                      >
                        Annuler
                      </button>
                      <button
                        type="button"
                        className="btn btn-success"
                        onClick={handleAssignSecretaire}
                        disabled={!selectedSecretaireId || secretaireUsers.length === 0}
                      >
                        <UserPlus size={16} className="me-2" />
                        Assigner
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Assignation Rapide RP */}
            {showAssignRPModal && assigningParcours && (
              <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <div className="modal-dialog modal-dialog-centered">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">
                        <UserCog size={18} className="me-2 text-info" />
                        Assigner un Responsable Pédagogique
                      </h5>
                      <button
                        type="button"
                        className="btn-close"
                        onClick={() => { setShowAssignRPModal(false); setAssigningParcours(null); setSelectedRPId(''); }}
                      />
                    </div>
                    <div className="modal-body">
                      <div className="mb-3">
                        <label className="form-label fw-medium">Parcours</label>
                        <div className="p-2 bg-light rounded">
                          <span className="badge bg-success me-2">{assigningParcours.code}</span>
                          <span className="fw-semibold">{assigningParcours.nom}</span>
                        </div>
                      </div>
                      <div className="mb-3">
                        <label className="form-label fw-medium">Responsable Pédagogique</label>
                        <select
                          className="form-select"
                          value={selectedRPId}
                          onChange={(e) => setSelectedRPId(e.target.value)}
                        >
                          <option value="">-- Aucun --</option>
                          {rpUsers.map((rp) => (
                            <option key={rp.id} value={rp.id}>
                              {rp.prenom} {rp.nom} ({rp.email})
                            </option>
                          ))}
                        </select>
                        {rpUsers.length === 0 && (
                          <div className="alert alert-warning mt-2 mb-0">
                            <small>Aucun utilisateur RP disponible. Créez un utilisateur avec le rôle "Resp. Pédagogique" dans la section Gestion Utilisateurs.</small>
                          </div>
                        )}
                      </div>
                      <div className="alert alert-info">
                        <small><strong>Règle :</strong> Un RP peut gérer plusieurs parcours, mais un parcours ne peut avoir qu'un seul RP.</small>
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => { setShowAssignRPModal(false); setAssigningParcours(null); setSelectedRPId(''); }}
                      >
                        Annuler
                      </button>
                      <button
                        type="button"
                        className="btn btn-info text-white"
                        onClick={handleAssignRP}
                        disabled={rpUsers.length === 0}
                      >
                        <CheckCircle size={16} className="me-1" />
                        {selectedRPId ? 'Assigner' : 'Retirer l\'assignation'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        </div>
      </div>
    );

  // === SECTION UE ===
  const renderUESection = () => {
    const selectedParcoursName = parcours.find(p => p.id === selectedParcoursForUE);

    return (
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          {/* En-tête */}
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
            <div className="d-flex align-items-center gap-2">
              <h6 className="card-title mb-0 text-warning">
                <BookOpen size={18} className="me-2" />
                Unités d'Enseignement
              </h6>
              <span className="badge bg-warning bg-opacity-10 text-warning">
                {ues.length}
              </span>
            </div>
          </div>

          {/* Sélection du parcours */}
          <div className="mb-4 p-3 bg-light rounded">
            <label className="form-label small fw-medium mb-2">
              📚 Sélectionner un parcours pour voir ses UE
            </label>
            <div className="d-flex gap-2 flex-wrap">
              <select
                className="form-select form-select-sm"
                style={{ width: '350px' }}
                value={selectedParcoursForUE}
                onChange={(e) => setSelectedParcoursForUE(e.target.value)}
              >
                <option value="">-- Choisir un parcours --</option>
                {parcours.map((p) => (
                  <option key={p.id} value={p.id}>{p.code} - {p.nom}</option>
                ))}
              </select>
              {selectedParcoursForUE && (
                <button
                  className="btn btn-warning btn-sm text-dark"
                  onClick={() => { resetUEForm(); setShowUEForm(true); }}
                >
                  <PlusIcon size={14} className="me-1" />
                  Nouvelle UE
                </button>
              )}
            </div>
            {parcours.length === 0 && (
              <small className="text-muted d-block mt-2">
                ⚠️ Créez d'abord un parcours dans l'onglet "Parcours"
              </small>
            )}
          </div>

          {!selectedParcoursForUE ? (
            <div className="text-center py-5">
              <div className="mb-4">
                <div className="d-inline-flex align-items-center justify-content-center bg-light rounded-circle" style={{ width: '80px', height: '80px' }}>
                  <BookOpen size={40} className="text-warning opacity-50" />
                </div>
              </div>
              <h5 className="text-muted mb-2">Aucun parcours sélectionné</h5>
              <p className="text-muted small mb-0" style={{ maxWidth: '400px' }}>
                Sélectionnez un parcours dans la liste ci-dessus pour voir et gérer ses unités d'enseignement.
              </p>
            </div>
          ) : (
            <>
              {/* Formulaire UE */}
              {showUEForm && (
                <form onSubmit={handleSaveUE} className="card border-warning border-0 border-start border-4 mb-4 bg-light">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h6 className="mb-0 text-warning fw-semibold">
                        {editingUE ? '✏️ Modifier' : '➕ Nouvelle'} UE
                        {selectedParcoursName && (
                          <small className="text-muted d-block fw-normal mt-1">
                            pour {selectedParcoursName.code} - {selectedParcoursName.nom}
                          </small>
                        )}
                      </h6>
                      <button
                        type="button"
                        className="btn btn-sm btn-link text-muted p-0"
                        onClick={() => { setShowUEForm(false); setEditingUE(null); }}
                      >
                        <XIcon size={20} />
                      </button>
                    </div>
                    <div className="row g-3">
                      <div className="col-md-2">
                        <label className="form-label small fw-medium">Code *</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={ueForm.code}
                          onChange={(e) => setUeForm({ ...ueForm, code: e.target.value.toUpperCase() })}
                          required
                          placeholder="UE11"
                          maxLength={10}
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label small fw-medium">Intitulé *</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={ueForm.intitule}
                          onChange={(e) => setUeForm({ ...ueForm, intitule: e.target.value })}
                          required
                          placeholder="Intitulé de l'UE"
                        />
                      </div>
                      <div className="col-md-2">
                        <label className="form-label small fw-medium">Crédits ECTS</label>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          value={ueForm.creditsEcts}
                          onChange={(e) => setUeForm({ ...ueForm, creditsEcts: parseInt(e.target.value) })}
                          min={1}
                          max={30}
                        />
                      </div>
                      <div className="col-md-2">
                        <label className="form-label small fw-medium">Coefficient</label>
                        <input
                          type="number"
                          step="0.5"
                          className="form-control form-control-sm"
                          value={ueForm.coefficient}
                          onChange={(e) => setUeForm({ ...ueForm, coefficient: parseFloat(e.target.value) })}
                          min={0.5}
                        />
                      </div>
                      <div className="col-md-2">
                        <label className="form-label small fw-medium">Semestre</label>
                        <select
                          className="form-select form-select-sm"
                          value={ueForm.semestre}
                          onChange={(e) => setUeForm({ ...ueForm, semestre: parseInt(e.target.value) })}
                        >
                          {[1, 2, 3, 4, 5, 6].map((s) => (
                            <option key={s} value={s}>S{s}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-3">
                        <label className="form-label small fw-medium">Année niveau</label>
                        <select
                          className="form-select form-select-sm"
                          value={ueForm.anneeNiveau}
                          onChange={(e) => setUeForm({ ...ueForm, anneeNiveau: parseInt(e.target.value) })}
                        >
                          <option value={1}>Année 1</option>
                          <option value={2}>Année 2</option>
                          <option value={3}>Année 3</option>
                          <option value={4}>Année 4</option>
                          <option value={5}>Année 5</option>
                        </select>
                      </div>
                      <div className="col-md-3">
                        <label className="form-label small fw-medium">Type UE</label>
                        <select
                          className="form-select form-select-sm"
                          value={ueForm.typeUe}
                          onChange={(e) => setUeForm({ ...ueForm, typeUe: e.target.value })}
                        >
                          <option value="obligatoire">Obligatoire</option>
                          <option value="optionnelle">Optionnelle</option>
                          <option value="fondamentale">Fondamentale</option>
                          <option value="transversale">Transversale</option>
                        </select>
                      </div>
                      <div className="col-md-2">
                        <label className="form-label small fw-medium">CM (h)</label>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          value={ueForm.volumeCm}
                          onChange={(e) => setUeForm({ ...ueForm, volumeCm: parseInt(e.target.value) })}
                          min={0}
                        />
                      </div>
                      <div className="col-md-2">
                        <label className="form-label small fw-medium">TD (h)</label>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          value={ueForm.volumeTd}
                          onChange={(e) => setUeForm({ ...ueForm, volumeTd: parseInt(e.target.value) })}
                          min={0}
                        />
                      </div>
                      <div className="col-md-2">
                        <label className="form-label small fw-medium">TP (h)</label>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          value={ueForm.volumeTp}
                          onChange={(e) => setUeForm({ ...ueForm, volumeTp: parseInt(e.target.value) })}
                          min={0}
                        />
                      </div>
                    </div>
                    <div className="d-flex gap-2 mt-3">
                      <button type="submit" className="btn btn-warning btn-sm text-dark">
                        <SaveIcon size={14} className="me-1" />
                        Enregistrer
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => { setShowUEForm(false); setEditingUE(null); }}
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* En-tête de la liste avec recherche */}
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="d-flex align-items-center gap-2">
                  <span className="badge bg-dark">
                    {selectedParcoursName?.code}
                  </span>
                  <small className="text-muted">
                    {filteredUEs.length} UE{filteredUEs.length > 1 ? 's' : ''}
                  </small>
                </div>
                {ues.length > 0 && (
                  <div className="input-group input-group-sm" style={{ width: '250px' }}>
                    <span className="input-group-text bg-light border-end-0">
                      <Search size={14} className="text-muted" />
                    </span>
                    <input
                      type="text"
                      className="form-control bg-light border-start-0"
                      placeholder="Rechercher une UE..."
                      value={searchTermUE}
                      onChange={(e) => setSearchTermUE(e.target.value)}
                    />
                    {searchTermUE && (
                      <button
                        className="btn btn-outline-secondary border-start-0"
                        type="button"
                        onClick={() => setSearchTermUE('')}
                      >
                        <XIcon size={14} />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Liste des UE */}
              {ues.length === 0 ? (
                <div className="text-center py-5">
                  <div className="mb-4">
                    <div className="d-inline-flex align-items-center justify-content-center bg-light rounded-circle" style={{ width: '80px', height: '80px' }}>
                      <BookOpen size={40} className="text-warning opacity-50" />
                    </div>
                  </div>
                  <h5 className="text-muted mb-2">Aucune UE pour ce parcours</h5>
                  <p className="text-muted small mb-4">
                    Ce parcours n'a pas encore d'unités d'enseignement.<br />
                    Créez votre première UE pour commencer.
                  </p>
                  <button
                    className="btn btn-warning text-dark"
                    onClick={() => { resetUEForm(); setShowUEForm(true); }}
                  >
                    <PlusIcon size={18} className="me-2" />
                    Créer ma première UE
                  </button>
                </div>
              ) : filteredUEs.length === 0 ? (
                <div className="text-center py-4">
                  <Search size={32} className="text-muted mb-2 opacity-50" />
                  <p className="text-muted mb-0">Aucune UE ne correspond à votre recherche</p>
                  <button className="btn btn-link btn-sm" onClick={() => setSearchTermUE('')}>
                    Effacer la recherche
                  </button>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead className="table-light">
                      <tr>
                        <th className="small fw-semibold text-uppercase">Code</th>
                        <th className="small fw-semibold text-uppercase">Intitulé</th>
                        <th className="small fw-semibold text-uppercase">Semestre</th>
                        <th className="small fw-semibold text-uppercase">Crédits</th>
                        <th className="small fw-semibold text-uppercase">Coef.</th>
                        <th className="small fw-semibold text-uppercase">Type</th>
                        <th className="small fw-semibold text-uppercase">Volume H.</th>
                        <th className="small fw-semibold text-uppercase text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUEs.map((ue) => (
                        <tr key={ue.id} className="border-top">
                          <td>
                            <span className="badge bg-warning text-dark fs-6 fw-bold px-3">{ue.code}</span>
                          </td>
                          <td className="fw-semibold">{ue.intitule}</td>
                          <td><span className="badge bg-secondary">S{ue.semestre}</span></td>
                          <td><strong>{ue.creditsEcts}</strong> <small className="text-muted">ECTS</small></td>
                          <td>{ue.coefficient}</td>
                          <td>
                            <span className={`badge bg-${ue.typeUe === 'obligatoire' ? 'primary' : ue.typeUe === 'optionnelle' ? 'secondary' : 'info'}`}>
                              {ue.typeUe}
                            </span>
                          </td>
                          <td className="small text-muted">
                            {ue.volumeCm > 0 && <span className="me-2">{ue.volumeCm}h CM</span>}
                            {ue.volumeTd > 0 && <span className="me-2">{ue.volumeTd}h TD</span>}
                            {ue.volumeTp > 0 && <span>{ue.volumeTp}h TP</span>}
                          </td>
                          <td className="text-end">
                            <div className="btn-group btn-group-sm">
                              <button
                                className="btn btn-outline-primary"
                                onClick={() => handleEditUE(ue)}
                                title="Modifier"
                              >
                                <EditIcon size={14} />
                              </button>
                              <button
                                className="btn btn-outline-danger"
                                onClick={() => handleDeleteUE(ue.id)}
                                title="Supprimer"
                              >
                                <TrashIcon size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  // === SECTION NIVEAUX D'ÉTUDES ===
  const renderNiveauxSection = () => (
    <div className="card border-0 shadow-sm">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="d-flex align-items-center gap-2">
            <h6 className="card-title mb-0 text-secondary">
              <Award size={18} className="me-2" />
              Niveaux d'Études
            </h6>
            <span className="badge bg-secondary bg-opacity-10 text-secondary">
              {niveauxEtude.length}
            </span>
          </div>
          <button
            className="btn btn-sm btn-secondary"
            onClick={() => navigate('/admin/niveaux')}
          >
            <Award size={16} className="me-2" />
            Gérer les Niveaux
          </button>
        </div>

        {niveauxEtude.length === 0 ? (
          <div className="text-center py-5">
            <Award size={48} className="text-muted mb-3" />
            <h6 className="text-muted">Aucun niveau configuré</h6>
            <p className="text-muted small mb-3">
              Configurez les niveaux d'études disponibles pour les inscriptions
            </p>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => navigate('/admin/niveaux')}
            >
              <Plus size={16} className="me-2" />
              Configurer les niveaux
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th style={{ width: '80px' }}>Ordre</th>
                  <th style={{ width: '100px' }}>Code</th>
                  <th>Libellé</th>
                  <th style={{ width: '150px' }}>Type Diplôme</th>
                  <th style={{ width: '100px' }} className="text-center">Statut</th>
                </tr>
              </thead>
              <tbody>
                {niveauxEtude.map((niveau) => (
                  <tr key={niveau.id}>
                    <td>
                      <span className="badge bg-secondary">{niveau.ordre}</span>
                    </td>
                    <td>
                      <code className="text-secondary">{niveau.code}</code>
                    </td>
                    <td>
                      <div>
                        <div className="fw-medium">{niveau.libelle}</div>
                        {niveau.description && (
                          <small className="text-muted">{niveau.description}</small>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-info bg-opacity-10 text-info">
                        {niveau.type_diplome || 'N/A'}
                      </span>
                    </td>
                    <td className="text-center">
                      {niveau.actif ? (
                        <span className="badge bg-success">Actif</span>
                      ) : (
                        <span className="badge bg-secondary">Inactif</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-3 pt-3 border-top">
          <small className="text-muted">
            <Award size={14} className="me-1" />
            Les niveaux d'études sont utilisés dans le formulaire d'inscription des étudiants.
            Cliquez sur "Gérer les Niveaux" pour ajouter, modifier ou supprimer des niveaux.
          </small>
        </div>
      </div>
    </div>
  );

  // === SECTION ÉTUDIANTS ===
  const renderEtudiantsSection = () => (
    <div className="card border-0 shadow-sm">
      <div className="card-body">
        {/* En-tête avec recherche */}
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <div className="d-flex align-items-center gap-2">
            <h6 className="card-title mb-0 text-info">
              <Users size={18} className="me-2" />
              Liste des Étudiants
            </h6>
            <span className="badge bg-info bg-opacity-10 text-info">
              {etudiants.length}
            </span>
          </div>
          <div className="d-flex gap-2">
            {etudiants.length > 0 && (
              <div className="input-group input-group-sm" style={{ width: '250px' }}>
                <span className="input-group-text bg-light border-end-0">
                  <Search size={14} className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control bg-light border-start-0"
                  placeholder="Rechercher..."
                  value={searchTermEtudiants}
                  onChange={(e) => setSearchTermEtudiants(e.target.value)}
                />
                {searchTermEtudiants && (
                  <button
                    className="btn btn-outline-secondary border-start-0"
                    type="button"
                    onClick={() => setSearchTermEtudiants('')}
                  >
                    <XIcon size={14} />
                  </button>
                )}
              </div>
            )}
            <button
              className="btn btn-info btn-sm text-white"
              onClick={() => { resetEtudiantForm(); setShowEtudiantForm(true); }}
            >
              <PlusIcon size={16} className="me-1" />
              Nouveau
            </button>
          </div>
        </div>

        {/* Formulaire Étudiant */}
          {showEtudiantForm && (
            <form onSubmit={handleSaveEtudiant} className="card border-info border-0 border-start border-4 mb-4 bg-light">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="mb-0 text-info fw-semibold">
                    {editingEtudiant ? '✏️ Modifier' : '➕ Nouvel'} Étudiant
                  </h6>
                  <button
                    type="button"
                    className="btn btn-sm btn-link text-muted p-0"
                    onClick={() => { setShowEtudiantForm(false); setEditingEtudiant(null); }}
                  >
                    <XIcon size={20} />
                  </button>
                </div>
                
                {/* Section: Informations principales */}
                <div className="mb-3">
                  <small className="text-muted text-uppercase fw-bold">📋 Informations principales</small>
                  <hr className="my-2" />
                </div>
                <div className="row g-3 mb-4">
                  <div className="col-md-2">
                    <label className="form-label small fw-medium">Matricule *</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={etudiantForm.matricule}
                      onChange={(e) => setEtudiantForm({ ...etudiantForm, matricule: e.target.value.toUpperCase() })}
                      required
                      placeholder="20240001"
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label small fw-medium">Nom *</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={etudiantForm.nom}
                      onChange={(e) => setEtudiantForm({ ...etudiantForm, nom: e.target.value })}
                      required
                      placeholder="RANDRIAN"
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label small fw-medium">Prénom *</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={etudiantForm.prenom}
                      onChange={(e) => setEtudiantForm({ ...etudiantForm, prenom: e.target.value })}
                      required
                      placeholder="Jean"
                    />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label small fw-medium">Date naissance *</label>
                    <input
                      type="date"
                      className="form-control form-control-sm"
                      value={etudiantForm.dateNaissance}
                      onChange={(e) => setEtudiantForm({ ...etudiantForm, dateNaissance: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label small fw-medium">Lieu naissance</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={etudiantForm.lieuNaissance}
                      onChange={(e) => setEtudiantForm({ ...etudiantForm, lieuNaissance: e.target.value })}
                      placeholder="Antananarivo"
                    />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label small fw-medium">Sexe</label>
                    <select
                      className="form-select form-select-sm"
                      value={etudiantForm.sexe}
                      onChange={(e) => setEtudiantForm({ ...etudiantForm, sexe: e.target.value })}
                    >
                      <option value="M">Masculin</option>
                      <option value="F">Féminin</option>
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label small fw-medium">Nationalité</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={etudiantForm.nationalite}
                      onChange={(e) => setEtudiantForm({ ...etudiantForm, nationalite: e.target.value })}
                      placeholder="Malagasy"
                    />
                  </div>
                </div>

                {/* Section: Contact */}
                <div className="mb-3">
                  <small className="text-muted text-uppercase fw-bold">📞 Coordonnées</small>
                  <hr className="my-2" />
                </div>
                <div className="row g-3 mb-4">
                  <div className="col-md-4">
                    <label className="form-label small fw-medium">Email</label>
                    <input
                      type="email"
                      className="form-control form-control-sm"
                      value={etudiantForm.email}
                      onChange={(e) => setEtudiantForm({ ...etudiantForm, email: e.target.value })}
                      placeholder="etudiant@email.com"
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-medium">Téléphone</label>
                    <input
                      type="tel"
                      className="form-control form-control-sm"
                      value={etudiantForm.telephone}
                      onChange={(e) => setEtudiantForm({ ...etudiantForm, telephone: e.target.value })}
                      placeholder="034 00 000 00"
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-medium">Adresse</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={etudiantForm.adresse}
                      onChange={(e) => setEtudiantForm({ ...etudiantForm, adresse: e.target.value })}
                      placeholder="Antananarivo, Madagascar"
                    />
                  </div>
                </div>

                {/* Section: Contact parent */}
                <div className="mb-3">
                  <small className="text-muted text-uppercase fw-bold">👨‍👩‍👧 Contact Parent/Tuteur</small>
                  <hr className="my-2" />
                </div>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-medium">Nom du parent/tuteur</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={etudiantForm.nomParent}
                      onChange={(e) => setEtudiantForm({ ...etudiantForm, nomParent: e.target.value })}
                      placeholder="Nom complet du parent ou tuteur"
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label small fw-medium">Téléphone parent</label>
                    <input
                      type="tel"
                      className="form-control form-control-sm"
                      value={etudiantForm.telephoneParent}
                      onChange={(e) => setEtudiantForm({ ...etudiantForm, telephoneParent: e.target.value })}
                      placeholder="034 00 000 00"
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label small fw-medium">Email parent</label>
                    <input
                      type="email"
                      className="form-control form-control-sm"
                      value={etudiantForm.emailParent}
                      onChange={(e) => setEtudiantForm({ ...etudiantForm, emailParent: e.target.value })}
                      placeholder="parent@email.com"
                    />
                  </div>
                </div>

                <div className="d-flex gap-2 mt-4">
                  <button type="submit" className="btn btn-info btn-sm text-white">
                    <SaveIcon size={14} className="me-1" />
                    Enregistrer
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => { setShowEtudiantForm(false); setEditingEtudiant(null); }}
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Notification compte créé */}
          {createdAccount && (
            <div className="alert alert-success alert-dismissible fade show mb-4" role="alert">
              <div className="d-flex align-items-start gap-3">
                <div className="bg-white bg-opacity-25 rounded-circle p-2">
                  <UserPlus size={24} />
                </div>
                <div className="flex-grow-1">
                  <h6 className="alert-heading mb-2">Compte étudiant créé avec succès !</h6>
                  <p className="mb-2 small">{createdAccount.message}</p>
                  <div className="bg-white bg-opacity-50 rounded p-2 mb-2">
                    <div className="small"><strong>Email:</strong> {createdAccount.email}</div>
                    <div className="small"><strong>Matricule:</strong> {createdAccount.matricule}</div>
                    <div className="small"><strong>Nom:</strong> {createdAccount.nom} {createdAccount.prenom}</div>
                  </div>
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-sm btn-success"
                      onClick={() => {
                        setActiveTab('users');
                        setCreatedAccount(null);
                      }}
                    >
                      <UserCog size={14} className="me-1" />
                      Modifier le compte
                    </button>
                    <button
                      className="btn btn-sm btn-outline-success"
                      onClick={() => setCreatedAccount(null)}
                    >
                      Fermer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* État vide */}
          {etudiants.length === 0 ? (
            <div className="text-center py-5">
              <div className="mb-4">
                <div className="d-inline-flex align-items-center justify-content-center bg-light rounded-circle" style={{ width: '80px', height: '80px' }}>
                  <Users size={40} className="text-info opacity-50" />
                </div>
              </div>
              <h5 className="text-muted mb-2">Aucun étudiant enregistré</h5>
              <p className="text-muted small mb-4" style={{ maxWidth: '400px' }}>
                Commencez par créer un étudiant pour gérer vos inscriptions et suivre leur parcours académique.
              </p>
              <button
                className="btn btn-info text-white"
                onClick={() => { resetEtudiantForm(); setShowEtudiantForm(true); }}
              >
                <PlusIcon size={18} className="me-2" />
                Ajouter mon premier étudiant
              </button>
            </div>
          ) : filteredEtudiants.length === 0 ? (
            <div className="text-center py-4">
              <Search size={32} className="text-muted mb-2 opacity-50" />
              <p className="text-muted mb-0">Aucun étudiant ne correspond à votre recherche</p>
              <button className="btn btn-link btn-sm" onClick={() => setSearchTermEtudiants('')}>
                Effacer la recherche
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th className="small fw-semibold text-uppercase">Matricule</th>
                    <th className="small fw-semibold text-uppercase">Étudiant</th>
                    <th className="small fw-semibold text-uppercase">Naissance</th>
                    <th className="small fw-semibold text-uppercase">Contact</th>
                    <th className="small fw-semibold text-uppercase text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEtudiants.map((etu) => (
                    <tr key={etu.id} className="border-top">
                      <td>
                        <span className="badge bg-dark fs-6 px-3">{etu.matricule}</span>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className="bg-info bg-opacity-10 text-info rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                            <span className="fw-bold">{etu.nom?.[0]}{etu.prenom?.[0]}</span>
                          </div>
                          <div>
                            <div className="fw-semibold">{etu.nom} {etu.prenom}</div>
                            <small className="text-muted">{etu.sexe === 'M' ? 'Masculin' : 'Féminin'} • {etu.nationalite}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        {etu.dateNaissance ? (
                          <div>
                            <div>{new Date(etu.dateNaissance).toLocaleDateString('fr-FR')}</div>
                            <small className="text-muted">
                              {Math.floor((new Date().getTime() - new Date(etu.dateNaissance).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} ans
                            </small>
                          </div>
                        ) : '-'}
                      </td>
                      <td>
                        {etu.email && <div className="small"><MailIconAlias size={12} className="me-1" /> {etu.email}</div>}
                        {etu.telephone && <div className="small"><PhoneIconAlias size={12} className="me-1" /> {etu.telephone}</div>}
                      </td>
                      <td className="text-end">
                        <div className="d-flex align-items-center justify-content-end gap-2">
                          {etu.utilisateurId && (
                            <span className="badge bg-success" title="Compte utilisateur lié">
                              <UserCog size={12} className="me-1" />
                              Compte actif
                            </span>
                          )}
                          <div className="btn-group btn-group-sm">
                            <button
                              className="btn btn-outline-primary"
                              onClick={() => handleEditEtudiant(etu)}
                              title="Modifier étudiant"
                            >
                              <EditIcon size={14} />
                            </button>
                            {etu.utilisateurId && (
                              <button
                                className="btn btn-outline-success"
                                onClick={() => {
                                  setActiveTab('users');
                                  // TODO: Pass utilisateurId to user edit
                                }}
                                title="Modifier compte"
                              >
                                <UserCog size={14} />
                              </button>
                            )}
                            <button
                              className="btn btn-outline-danger"
                              onClick={() => handleDeleteEtudiant(etu.id)}
                              title="Supprimer"
                            >
                              <TrashIcon size={14} />
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );

  // Rendu de la gestion financière
  const renderFinance = () => (
    <div className="card border-0 shadow-sm">
      <div className="card-body">
        <h5 className="card-title mb-4">
          <DollarSign size={20} className="me-2" />
          Gestion Financière
        </h5>
        <div className="row g-3">
          <div className="col-md-4">
            <button
              className="card bg-light border-0 w-100 text-start"
              style={{ cursor: 'pointer' }}
              onClick={() => navigate('/finance/budgets')}
            >
              <div className="card-body">
                <h6>Budget & Dépenses</h6>
                <small className="text-muted">Suivi budgétaire, dépenses, fournisseurs</small>
              </div>
            </button>
          </div>
          <div className="col-md-4">
            <button
              className="card bg-light border-0 w-100 text-start"
              style={{ cursor: 'pointer' }}
              onClick={() => navigate('/caisse')}
            >
              <div className="card-body">
                <h6>Caisse & Encaissements</h6>
                <small className="text-muted">Gestion caisse, reçus, quittances</small>
              </div>
            </button>
          </div>
          <div className="col-md-4">
            <button
              className="card bg-light border-0 w-100 text-start"
              style={{ cursor: 'pointer' }}
              onClick={() => navigate('/finance/paiements')}
            >
              <div className="card-body">
                <h6>Paiements</h6>
                <small className="text-muted">Historique, suivi des paiements</small>
              </div>
            </button>
          </div>
        </div>
        <div className="mt-3">
          <button
            className="btn btn-primary w-100"
            onClick={() => navigate('/finance/gestion')}
          >
            <DollarSign size={16} className="me-2" />
            Accéder à la Gestion Financière Complète
          </button>
        </div>
      </div>
    </div>
  );

  // Rendu de la gestion RH
  const renderRH = () => <GestionRHPage />;

  // Rendu de la communication
  const renderCommunication = () => <GestionCommunicationPage />;

  // Rendu de la discipline
  const renderDiscipline = () => <GestionDisciplinePage />;

  // Rendu de la logistique
  const renderLogistics = () => <GestionLogistiquePage />;

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <Loader className="spinner-border text-primary" />
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {/* En-tête */}
      <div className="row mb-4">
        <div className="col">
          <h2 className="mb-1">Administration</h2>
          <p className="text-muted mb-0">Gestion complète de l'université</p>
        </div>
      </div>

      {/* Contenu selon l'onglet actif */}
      <div className="row">
        <div className="col">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'config' && renderConfig()}
          {activeTab === 'portals' && renderPortals()}
          {activeTab === 'users' && renderUsers()}
          {activeTab === 'academic' && renderAcademic()}
          {activeTab === 'finance' && renderFinance()}
          {activeTab === 'rh' && renderRH()}
          {activeTab === 'communication' && renderCommunication()}
          {activeTab === 'discipline' && renderDiscipline()}
          {activeTab === 'logistics' && renderLogistics()}
        </div>
      </div>
    </div>
  );
};

// Made with Bob
