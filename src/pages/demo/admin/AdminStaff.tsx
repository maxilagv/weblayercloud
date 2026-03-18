import { useMemo, useState, type FormEvent } from 'react';
import { httpsCallable, getFunctions } from 'firebase/functions';
import app from '../../../lib/firebase';
import { useTenantStaff } from '../../../hooks/useTenantStaff';
import {
  ADMIN_NAV_ITEMS,
  STAFF_MANAGEABLE_MODULES,
  type AdminModuleId,
} from './adminModules';
import {
  AdminButton,
  AdminField,
  AdminIconButton,
  AdminMessage,
  AdminPageHeader,
  AdminSurface,
} from './AdminUi';
import { Trash2 } from 'lucide-react';

const functions = getFunctions(app, 'us-central1');

const moduleLabels = Object.fromEntries(
  ADMIN_NAV_ITEMS.map((item) => [item.id, item.label]),
) as Record<AdminModuleId, string>;

export default function AdminStaff({ tenantId }: { tenantId: string }) {
  const { staff } = useTenantStaff(tenantId);
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    modulos: [...STAFF_MANAGEABLE_MODULES],
  });
  const [saving, setSaving] = useState(false);
  const [tempPassword, setTempPassword] = useState('');
  const [message, setMessage] = useState('');

  const inviteTenantStaff = useMemo(
    () => httpsCallable(functions, 'inviteTenantStaff'),
    [],
  );
  const updateTenantStaffAccess = useMemo(
    () => httpsCallable(functions, 'updateTenantStaffAccess'),
    [],
  );
  const removeTenantStaff = useMemo(
    () => httpsCallable(functions, 'deleteTenantStaff'),
    [],
  );

  const toggleModule = (moduleId: AdminModuleId) => {
    setForm((current) => ({
      ...current,
      modulos: current.modulos.includes(moduleId)
        ? current.modulos.filter((item) => item !== moduleId)
        : [...current.modulos, moduleId],
    }));
  };

  const handleInvite = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    setTempPassword('');
    try {
      const result = await inviteTenantStaff({
        tenantId,
        nombre: form.nombre,
        email: form.email,
        modulos: form.modulos,
      });
      const data = result.data as { tempPassword: string };
      setTempPassword(data.tempPassword);
      setMessage('Empleado creado con acceso limitado.');
      setForm({ nombre: '', email: '', modulos: [...STAFF_MANAGEABLE_MODULES] });
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (staffMember: (typeof staff)[number]) => {
    await updateTenantStaffAccess({
      tenantId,
      staffUid: staffMember.uid,
      nombre: staffMember.nombre,
      modulos: staffMember.modulos,
      activo: !staffMember.activo,
    });
  };

  const removeStaffMember = async (staffUid: string) => {
    if (!window.confirm('¿Eliminar este empleado?')) return;
    await removeTenantStaff({ tenantId, staffUid });
  };

  return (
    <div className="demo-admin-grid columns-sidebar">
      <div>
        <AdminPageHeader
          eyebrow="Equipo"
          title="Empleados"
          description="Invita usuarios internos con modulos limitados y contraseña temporal para la demo."
        />
        <AdminSurface padding="pad-md">
          <form onSubmit={handleInvite} className="demo-admin-grid">
            <div className="demo-admin-inline-grid">
              <AdminField label="Nombre">
                <input
                  className="demo-admin-input"
                  value={form.nombre}
                  onChange={(event) => setForm((current) => ({ ...current, nombre: event.target.value }))}
                  required
                />
              </AdminField>
              <AdminField label="Email">
                <input
                  className="demo-admin-input"
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                  required
                />
              </AdminField>
            </div>
            <div>
              <p className="demo-admin-page-eyebrow" style={{ marginBottom: 10 }}>
                Modulos permitidos
              </p>
              <div className="demo-admin-grid columns-2">
                {STAFF_MANAGEABLE_MODULES.map((moduleId) => (
                  <label key={moduleId} className="demo-admin-list-item" style={{ alignItems: 'center' }}>
                    <span>{moduleLabels[moduleId]}</span>
                    <input
                      type="checkbox"
                      checked={form.modulos.includes(moduleId)}
                      onChange={() => toggleModule(moduleId)}
                    />
                  </label>
                ))}
              </div>
            </div>
            {message ? <AdminMessage kind="success">{message}</AdminMessage> : null}
            {tempPassword ? (
              <AdminMessage kind="success">
                Contraseña temporal generada: <strong>{tempPassword}</strong>
              </AdminMessage>
            ) : null}
            <AdminButton type="submit" disabled={saving}>
              {saving ? 'Creando...' : 'Invitar empleado'}
            </AdminButton>
          </form>
        </AdminSurface>
      </div>

      <AdminSurface padding="pad-md">
        <p className="demo-admin-page-eyebrow">Accesos</p>
        <h2 className="demo-admin-page-title" style={{ fontSize: 22, marginBottom: 14 }}>
          Empleados registrados
        </h2>
        <div className="demo-admin-list">
          {staff.map((staffMember) => (
            <div key={staffMember.id} className="demo-admin-list-item">
              <div style={{ minWidth: 0, flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{staffMember.nombre}</p>
                <p style={{ marginTop: 4, fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
                  {staffMember.email}
                </p>
                <p style={{ marginTop: 6, fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
                  {staffMember.modulos.map((moduleId) => moduleLabels[moduleId as AdminModuleId]).join(', ')}
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <AdminButton variant={staffMember.activo ? 'ghost' : 'primary'} onClick={() => toggleActive(staffMember)}>
                  {staffMember.activo ? 'Desactivar' : 'Activar'}
                </AdminButton>
                <AdminIconButton onClick={() => removeStaffMember(staffMember.uid)} aria-label="Eliminar empleado">
                  <Trash2 size={14} />
                </AdminIconButton>
              </div>
            </div>
          ))}
        </div>
      </AdminSurface>
    </div>
  );
}
