import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from '../../../lib/firebase';
import { useTenantLandingHeroes, type TenantHero } from '../../../hooks/useTenantLandingHeroes';
import {
  AdminButton,
  AdminField,
  AdminIconButton,
  AdminInput,
  AdminLoadingState,
  AdminModal,
  AdminPageHeader,
  AdminSurface,
} from './AdminUi';

const EMPTY_FORM: Omit<TenantHero, 'id'> = {
  titulo: '',
  subtitulo: '',
  imageDesktop: '',
  imageMobile: '',
  ctaLabel: '',
  ctaUrl: '',
  orden: 0,
  activo: true,
};

export default function AdminLanding({ tenantId }: { tenantId: string }) {
  const { heroes, loading, addHero, updateHero, deleteHero } = useTenantLandingHeroes(tenantId);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TenantHero | null>(null);
  const [form, setForm] = useState<Omit<TenantHero, 'id'>>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const desktopInputRef = useRef<HTMLInputElement | null>(null);
  const mobileInputRef = useRef<HTMLInputElement | null>(null);

  const uploadImage = async (event: ChangeEvent<HTMLInputElement>, target: 'desktop' | 'mobile') => {
    const file = event.target.files?.[0];
    if (!file) return;
    const storageRef = ref(storage, `tenants/${tenantId}/heroes/${target}-${Date.now()}-${file.name}`);
    await uploadBytes(storageRef, file, { contentType: file.type });
    const url = await getDownloadURL(storageRef);
    setForm((current) => ({
      ...current,
      imageDesktop: target === 'desktop' ? url : current.imageDesktop,
      imageMobile: target === 'mobile' ? url : current.imageMobile,
    }));
  };

  const openNew = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (hero: TenantHero) => {
    setEditing(hero);
    setForm({ ...hero });
    setModalOpen(true);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await updateHero(editing.id, form);
      } else {
        await addHero(form);
      }
      setModalOpen(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <AdminPageHeader
        eyebrow="Visual"
        title="Landing heroes"
        description="Gestiona el slider principal de la tienda demo con imagen desktop/mobile, CTA y orden de aparicion."
        actions={<AdminButton onClick={openNew}><Plus size={14} style={{ marginRight: 8 }} />Nuevo hero</AdminButton>}
      />

      <AdminSurface padding="pad-sm">
        {loading ? (
          <AdminLoadingState>Cargando heroes...</AdminLoadingState>
        ) : (
          <div className="demo-admin-list">
            {heroes.map((hero) => (
              <div key={hero.id} className="demo-admin-list-item">
                <div style={{ display: 'flex', gap: 12, minWidth: 0, flex: 1 }}>
                  {hero.imageDesktop ? (
                    <img src={hero.imageDesktop} alt={hero.titulo} style={{ width: 120, height: 72, objectFit: 'cover' }} />
                  ) : null}
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{hero.titulo}</p>
                    <p style={{ marginTop: 4, fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
                      {hero.subtitulo || 'Sin subtitulo'}
                    </p>
                    <p style={{ marginTop: 6, fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
                      Orden {hero.orden} · {hero.activo ? 'Activo' : 'Inactivo'}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <AdminIconButton onClick={() => openEdit(hero)} aria-label="Editar hero">
                    <Pencil size={14} />
                  </AdminIconButton>
                  <AdminIconButton onClick={() => deleteHero(hero.id)} aria-label="Eliminar hero">
                    <Trash2 size={14} />
                  </AdminIconButton>
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminSurface>

      <AdminModal
        open={modalOpen}
        title={editing ? 'Editar hero' : 'Nuevo hero'}
        eyebrow="Visual"
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={handleSubmit} className="demo-admin-grid">
          <div className="demo-admin-inline-grid">
            <AdminField label="Titulo">
              <AdminInput
                value={form.titulo}
                onChange={(event) => setForm((current) => ({ ...current, titulo: event.target.value }))}
                required
              />
            </AdminField>
            <AdminField label="Subtitulo">
              <AdminInput
                value={form.subtitulo}
                onChange={(event) => setForm((current) => ({ ...current, subtitulo: event.target.value }))}
              />
            </AdminField>
            <AdminField label="CTA label">
              <AdminInput
                value={form.ctaLabel}
                onChange={(event) => setForm((current) => ({ ...current, ctaLabel: event.target.value }))}
              />
            </AdminField>
            <AdminField label="CTA URL">
              <AdminInput
                value={form.ctaUrl}
                onChange={(event) => setForm((current) => ({ ...current, ctaUrl: event.target.value }))}
              />
            </AdminField>
            <AdminField label="Orden">
              <AdminInput
                type="number"
                min={0}
                value={form.orden}
                onChange={(event) => setForm((current) => ({ ...current, orden: Number(event.target.value) }))}
              />
            </AdminField>
            <label className="demo-admin-list-item" style={{ alignItems: 'center' }}>
              <span>Activo</span>
              <input
                type="checkbox"
                checked={form.activo}
                onChange={(event) => setForm((current) => ({ ...current, activo: event.target.checked }))}
              />
            </label>
          </div>

          <div className="demo-admin-inline-grid">
            <AdminField label="Desktop image">
              <div style={{ display: 'flex', gap: 10 }}>
                <AdminInput
                  value={form.imageDesktop}
                  onChange={(event) => setForm((current) => ({ ...current, imageDesktop: event.target.value }))}
                />
                <AdminButton type="button" variant="ghost" onClick={() => desktopInputRef.current?.click()}>
                  Subir
                </AdminButton>
                <input ref={desktopInputRef} type="file" accept="image/*" hidden onChange={(event) => uploadImage(event, 'desktop')} />
              </div>
            </AdminField>
            <AdminField label="Mobile image">
              <div style={{ display: 'flex', gap: 10 }}>
                <AdminInput
                  value={form.imageMobile}
                  onChange={(event) => setForm((current) => ({ ...current, imageMobile: event.target.value }))}
                />
                <AdminButton type="button" variant="ghost" onClick={() => mobileInputRef.current?.click()}>
                  Subir
                </AdminButton>
                <input ref={mobileInputRef} type="file" accept="image/*" hidden onChange={(event) => uploadImage(event, 'mobile')} />
              </div>
            </AdminField>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <AdminButton variant="ghost" onClick={() => setModalOpen(false)}>
              Cancelar
            </AdminButton>
            <AdminButton type="submit" disabled={saving}>
              {saving ? 'Guardando...' : editing ? 'Actualizar hero' : 'Crear hero'}
            </AdminButton>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
