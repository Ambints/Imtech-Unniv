import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { tenantsApi } from '../../api/client';
import toast from 'react-hot-toast';
import { Building2, Save, Palette, Mail, X, Check, FileText, Upload, Image as ImageIcon } from 'lucide-react';

interface SectionCardProps {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  title: string;
  children: React.ReactNode;
}

const SectionCard: React.FC<SectionCardProps> = ({ icon, iconBg, iconColor, title, children }) => (
  <div style={{ background: '#FAFAF7', border: '1px solid rgba(15,25,35,0.10)', borderRadius: '14px', padding: '24px', marginBottom: '16px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </div>
      <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#0F1923' }}>{title}</h2>
    </div>
    {children}
  </div>
);

const inputStyle = { width: '100%', padding: '10px 14px', fontSize: '13px', border: '1px solid rgba(15,25,35,0.15)', borderRadius: '10px', background: '#F5F5F0', color: '#0F1923' };
const labelStyle = { display: 'block', fontSize: '12px', fontWeight: 500, color: '#5A6472', marginBottom: '6px' };

export const EditUniversity: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [formData, setFormData] = useState({
    nom: '',
    slug: '',
    slogan: '',
    typeEtablissement: 'catholique' as 'catholique' | 'prive' | 'public',
    emailContact: '',
    telephone: '',
    adresse: '',
    pays: 'Madagascar',
    siteWeb: '',
    couleurPrincipale: '#1a7a4a',
    couleurSecondaire: '#1565c0',
    couleurAccent: '#e65100',
    couleurTexte: '#ffffff',
    logoUrl: '',
    enteteDocument: '',
    actif: true,
  });

  useEffect(() => {
    if (id) {
      loadTenant();
    }
  }, [id]);

  const loadTenant = async () => {
    try {
      setLoadingData(true);
      const tenant = await tenantsApi.getOne(id!);
      setFormData({
        nom: tenant.nom || '',
        slug: tenant.slug || '',
        slogan: tenant.slogan || '',
        typeEtablissement: tenant.typeEtablissement || 'catholique',
        emailContact: tenant.emailContact || '',
        telephone: tenant.telephone || '',
        adresse: tenant.adresse || '',
        pays: tenant.pays || 'Madagascar',
        siteWeb: tenant.siteWeb || '',
        couleurPrincipale: tenant.couleurPrincipale || '#1a7a4a',
        couleurSecondaire: tenant.couleurSecondaire || '#1565c0',
        couleurAccent: tenant.couleurAccent || '#e65100',
        couleurTexte: tenant.couleurTexte || '#ffffff',
        logoUrl: tenant.logoUrl || '',
        enteteDocument: tenant.enteteDocument || '',
        actif: tenant.actif !== undefined ? tenant.actif : true,
      });
      if (tenant.logoUrl) {
        setLogoPreview(tenant.logoUrl);
      }
    } catch (err: any) {
      toast.error('Erreur lors du chargement des données');
      navigate('/super-admin');
    } finally {
      setLoadingData(false);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Veuillez sélectionner une image valide');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        toast.error('L\'image ne doit pas dépasser 2MB');
        return;
      }
      
      setLogoFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let dataToSend = { ...formData };
      if (logoFile && logoPreview) {
        dataToSend.logoUrl = logoPreview;
      }
      
      await tenantsApi.update(id!, dataToSend);
      toast.success('Université modifiée avec succès!');
      navigate('/super-admin');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur lors de la modification');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F5F5F0' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#F5F5F0' }}>
      {/* Topbar */}
      <header style={{ background: '#FAFAF7', borderBottom: '1px solid rgba(15,25,35,0.10)', padding: '0 28px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
        <h1 style={{ fontSize: '18px', fontWeight: 600, color: '#0F1923', letterSpacing: '-0.01em' }}>Modifier l'Université</h1>
        <button onClick={() => navigate('/super-admin')} style={{ padding: '8px 16px', fontSize: '12px', fontWeight: 500, color: '#5A6472', background: '#F5F5F0', border: '1px solid rgba(15,25,35,0.10)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
          <X style={{ width: 14, height: 14 }} /> Annuler
        </button>
      </header>

      {/* Form */}
      <div style={{ padding: '24px 28px' }}>
        <form onSubmit={handleSubmit}>
          {/* Informations générales */}
          <SectionCard icon={<Building2 style={{ width: 16, height: 16, color: '#2563eb' }} />} iconBg="#DBEAFE" iconColor="#2563eb" title="Informations Générales">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Nom de l'Université <span style={{ color: '#DC2626' }}>*</span></label>
                <input type="text" name="nom" value={formData.nom} onChange={handleChange} required style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Slug (URL) <span style={{ color: '#DC2626' }}>*</span></label>
                <input type="text" name="slug" value={formData.slug} onChange={handleChange} required pattern="[a-z0-9\-]+" style={inputStyle} disabled />
                <p style={{ fontSize: '11px', color: '#9AA3AE', marginTop: '4px' }}>Le slug ne peut pas être modifié</p>
              </div>
              <div>
                <label style={labelStyle}>Type d'Établissement <span style={{ color: '#DC2626' }}>*</span></label>
                <select name="typeEtablissement" value={formData.typeEtablissement} onChange={handleChange} required style={inputStyle}>
                  <option value="catholique">Catholique</option>
                  <option value="prive">Privé</option>
                  <option value="public">Public</option>
                </select>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Slogan / Devise</label>
                <input type="text" name="slogan" value={formData.slogan} onChange={handleChange} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Statut</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" name="actif" checked={formData.actif} onChange={handleChange} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                  <span style={{ fontSize: '13px', color: '#0F1923' }}>Université active</span>
                </label>
              </div>
            </div>
          </SectionCard>

          {/* Contact */}
          <SectionCard icon={<Mail style={{ width: 16, height: 16, color: '#4F46E5' }} />} iconBg="#E0E7FF" iconColor="#4F46E5" title="Coordonnées">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Email de Contact <span style={{ color: '#DC2626' }}>*</span></label>
                <input type="email" name="emailContact" value={formData.emailContact} onChange={handleChange} required style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Téléphone <span style={{ color: '#DC2626' }}>*</span></label>
                <input type="tel" name="telephone" value={formData.telephone} onChange={handleChange} required style={inputStyle} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Adresse</label>
                <input type="text" name="adresse" value={formData.adresse} onChange={handleChange} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Pays</label>
                <input type="text" name="pays" value={formData.pays} onChange={handleChange} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Site Web <span style={{ color: '#9AA3AE', fontWeight: 400 }}>(facultatif)</span></label>
                <input type="url" name="siteWeb" value={formData.siteWeb} onChange={handleChange} style={inputStyle} />
              </div>
            </div>
          </SectionCard>

          {/* White Label */}
          <SectionCard icon={<Palette style={{ width: 16, height: 16, color: '#7C3AED' }} />} iconBg="#EDE9FE" iconColor="#7C3AED" title="Personnalisation (White Label)">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Couleur Principale</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="color" name="couleurPrincipale" value={formData.couleurPrincipale} onChange={handleChange} style={{ width: '40px', height: '40px', borderRadius: '8px', border: '1px solid rgba(15,25,35,0.15)', cursor: 'pointer', padding: '2px' }} />
                  <input type="text" value={formData.couleurPrincipale} onChange={(e) => setFormData(prev => ({ ...prev, couleurPrincipale: e.target.value }))} style={{ ...inputStyle, flex: 1 }} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Couleur Secondaire</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="color" name="couleurSecondaire" value={formData.couleurSecondaire} onChange={handleChange} style={{ width: '40px', height: '40px', borderRadius: '8px', border: '1px solid rgba(15,25,35,0.15)', cursor: 'pointer', padding: '2px' }} />
                  <input type="text" value={formData.couleurSecondaire} onChange={(e) => setFormData(prev => ({ ...prev, couleurSecondaire: e.target.value }))} style={{ ...inputStyle, flex: 1 }} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Couleur Accent</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="color" name="couleurAccent" value={formData.couleurAccent} onChange={handleChange} style={{ width: '40px', height: '40px', borderRadius: '8px', border: '1px solid rgba(15,25,35,0.15)', cursor: 'pointer', padding: '2px' }} />
                  <input type="text" value={formData.couleurAccent} onChange={(e) => setFormData(prev => ({ ...prev, couleurAccent: e.target.value }))} style={{ ...inputStyle, flex: 1 }} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Couleur du Texte</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="color" name="couleurTexte" value={formData.couleurTexte} onChange={handleChange} style={{ width: '40px', height: '40px', borderRadius: '8px', border: '1px solid rgba(15,25,35,0.15)', cursor: 'pointer', padding: '2px' }} />
                  <input type="text" value={formData.couleurTexte} onChange={(e) => setFormData(prev => ({ ...prev, couleurTexte: e.target.value }))} style={{ ...inputStyle, flex: 1 }} />
                </div>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Logo de l'Université</label>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={{ width: '120px', height: '120px', borderRadius: '12px', border: '2px dashed rgba(15,25,35,0.15)', background: '#F5F5F0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    ) : (
                      <ImageIcon style={{ width: 32, height: 32, color: '#9AA3AE' }} />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <input type="file" id="logo-upload" accept="image/*" onChange={handleLogoChange} style={{ display: 'none' }} />
                    <label htmlFor="logo-upload" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 16px', fontSize: '13px', fontWeight: 500, color: '#2563eb', background: '#DBEAFE', border: '1px solid rgba(37,99,235,0.2)', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s' }}>
                      <Upload style={{ width: 16, height: 16 }} />
                      {logoFile ? 'Changer le logo' : 'Télécharger un nouveau logo'}
                    </label>
                    {logoFile && (
                      <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Check style={{ width: 14, height: 14, color: '#059669' }} />
                        <span style={{ fontSize: '12px', color: '#059669', fontWeight: 500 }}>{logoFile.name}</span>
                        <button type="button" onClick={() => { setLogoFile(null); setLogoPreview(formData.logoUrl); }} style={{ padding: '4px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#DC2626', display: 'flex', alignItems: 'center' }}>
                          <X style={{ width: 14, height: 14 }} />
                        </button>
                      </div>
                    )}
                    <p style={{ fontSize: '11px', color: '#9AA3AE', marginTop: '8px' }}>
                      Format: PNG, JPG, SVG • Taille max: 2MB • Recommandé: 200x200px
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* En-tête Document */}
          <SectionCard icon={<FileText style={{ width: 16, height: 16, color: '#059669' }} />} iconBg="#D1FAE5" iconColor="#059669" title="En-tête des Documents Officiels">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>HTML de l'En-tête <span style={{ color: '#9AA3AE', fontWeight: 400 }}>(facultatif)</span></label>
                <textarea name="enteteDocument" value={formData.enteteDocument} onChange={handleTextareaChange} style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }} />
                <p style={{ fontSize: '11px', color: '#9AA3AE', marginTop: '4px' }}>HTML utilisé pour l'en-tête des documents officiels (PV, attestations, diplômes)</p>
              </div>
            </div>
          </SectionCard>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '8px' }}>
            <button type="button" onClick={() => navigate('/super-admin')} style={{ padding: '10px 20px', fontSize: '13px', fontWeight: 500, color: '#5A6472', background: '#F5F5F0', border: '1px solid rgba(15,25,35,0.15)', borderRadius: '10px', cursor: 'pointer' }}>
              Annuler
            </button>
            <button type="submit" disabled={loading} style={{ padding: '10px 20px', fontSize: '13px', fontWeight: 600, color: '#fff', background: '#2563eb', border: 'none', borderRadius: '10px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Save style={{ width: 16, height: 16 }} />
              {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Made with Bob
