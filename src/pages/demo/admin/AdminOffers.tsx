import { useMemo, useState, type FormEvent } from 'react';
import { Pencil, Power, Trash2 } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';
import { useTenantOffers, type TenantOffer } from '../../../hooks/useTenantOffers';
import { useTenantProducts } from '../../../hooks/useTenantProducts';
import { getActiveOffersForTenant, getProductOfferPrice } from '../../../utils/tenantOfferPrice';
import {
  AdminButton,
  AdminField,
  AdminIconButton,
  AdminInput,
  AdminMessage,
  AdminPageHeader,
  AdminSelect,
  AdminTextarea,
  AdminSurface,
} from './AdminUi';
import { formatCurrency, formatDateTime } from './adminHelpers';

const EMPTY_FORM = {
  titulo: '',
  descripcion: '',
  tipo: 'fecha' as 'fecha' | 'volumen',
  activa: true,
  prioridad: 0,
  productIds: [] as string[],
  bannerImageUrl: '',
  descuentoPct: '',
  precioOferta: '',
  minUnidades: '',
  startsAt: '',
  endsAt: '',
};

function dateToInput(value: unknown) {
  if (!value) return '';
  const date =
    typeof (value as { toDate?: () => Date }).toDate === 'function'
      ? (value as { toDate: () => Date }).toDate()
      : new Date(value as string);
  if (Number.isNaN(date.getTime())) return '';
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

export default function AdminOffers({ tenantId }: { tenantId: string }) {
  const { offers, addOffer, updateOffer, deleteOffer } = useTenantOffers(tenantId);
  const { products } = useTenantProducts(tenantId);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editing, setEditing] = useState<TenantOffer | null>(null);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState('');
  const [message, setMessage] = useState('');

  const activeOffers = useMemo(() => getActiveOffersForTenant(offers), [offers]);
  const filteredProducts = useMemo(() => {
    const term = query.trim().toLowerCase();
    return products.filter((product) => {
      if (!term) return true;
      return `${product.nombre} ${product.marca}`.toLowerCase().includes(term);
    });
  }, [products, query]);

  const selectedProducts = products.filter((product) => form.productIds.includes(product.id));

  const previews = selectedProducts.map((product) => ({
    product,
    pricing: getProductOfferPrice(
      product,
      [
        {
          id: editing?.id ?? 'preview',
          titulo: form.titulo,
          descripcion: form.descripcion,
          tipo: form.tipo,
          activa: form.activa,
          prioridad: Number(form.prioridad || 0),
          productIds: form.productIds,
          bannerImageUrl: form.bannerImageUrl || undefined,
          descuentoPct: form.descuentoPct ? Number(form.descuentoPct) : undefined,
          precioOferta: form.precioOferta ? Number(form.precioOferta) : undefined,
          minUnidades: form.minUnidades ? Number(form.minUnidades) : undefined,
          startsAt: form.startsAt || undefined,
          endsAt: form.endsAt || undefined,
        },
      ],
      1,
    ),
  }));

  const toggleProduct = (productId: string) => {
    setForm((current) => ({
      ...current,
      productIds: current.productIds.includes(productId)
        ? current.productIds.filter((id) => id !== productId)
        : [...current.productIds, productId],
    }));
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditing(null);
  };

  const handleEdit = (offer: TenantOffer) => {
    setEditing(offer);
    setForm({
      titulo: offer.titulo || '',
      descripcion: offer.descripcion || '',
      tipo: offer.tipo,
      activa: offer.activa !== false,
      prioridad: Number(offer.prioridad || 0),
      productIds: offer.productIds || [],
      bannerImageUrl: offer.bannerImageUrl || '',
      descuentoPct: offer.descuentoPct?.toString() || '',
      precioOferta: offer.precioOferta?.toString() || '',
      minUnidades: offer.minUnidades?.toString() || '',
      startsAt: dateToInput(offer.startsAt),
      endsAt: dateToInput(offer.endsAt),
    });
    setMessage('');
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = {
        titulo: form.titulo.trim(),
        descripcion: form.descripcion.trim(),
        tipo: form.tipo,
        activa: form.activa,
        prioridad: Number(form.prioridad || 0),
        productIds: form.productIds,
        bannerImageUrl: form.bannerImageUrl.trim() || undefined,
        descuentoPct: form.descuentoPct ? Number(form.descuentoPct) : undefined,
        precioOferta: form.precioOferta ? Number(form.precioOferta) : undefined,
        minUnidades: form.minUnidades ? Number(form.minUnidades) : undefined,
        startsAt: form.startsAt ? Timestamp.fromDate(new Date(form.startsAt)) : undefined,
        endsAt: form.endsAt ? Timestamp.fromDate(new Date(form.endsAt)) : undefined,
      };

      if (editing) {
        await updateOffer(editing.id, payload);
        setMessage('Oferta actualizada.');
      } else {
        await addOffer(payload);
        setMessage('Oferta creada.');
      }
      resetForm();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="demo-admin-grid columns-sidebar">
      <div>
        <AdminPageHeader
          eyebrow="Promociones"
          title="Ofertas"
          description="Descuentos por fecha o volumen, prioridad comercial y vista previa inmediata del precio final."
        />
        <AdminSurface padding="pad-md">
          <form onSubmit={handleSubmit} className="demo-admin-grid">
            <div className="demo-admin-inline-grid">
              <AdminField label="Titulo">
                <AdminInput
                  value={form.titulo}
                  onChange={(event) => setForm((current) => ({ ...current, titulo: event.target.value }))}
                  required
                />
              </AdminField>
              <AdminField label="Tipo">
                <AdminSelect
                  value={form.tipo}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      tipo: event.target.value as 'fecha' | 'volumen',
                    }))
                  }
                >
                  <option value="fecha">Fecha</option>
                  <option value="volumen">Volumen</option>
                </AdminSelect>
              </AdminField>
            </div>
            <AdminField label="Descripcion">
              <AdminTextarea
                value={form.descripcion}
                onChange={(event) => setForm((current) => ({ ...current, descripcion: event.target.value }))}
              />
            </AdminField>
            <div className="demo-admin-inline-grid">
              <AdminField label="Descuento %">
                <AdminInput
                  type="number"
                  min={0}
                  max={100}
                  value={form.descuentoPct}
                  onChange={(event) => setForm((current) => ({ ...current, descuentoPct: event.target.value }))}
                />
              </AdminField>
              <AdminField label="Precio oferta">
                <AdminInput
                  type="number"
                  min={0}
                  value={form.precioOferta}
                  onChange={(event) => setForm((current) => ({ ...current, precioOferta: event.target.value }))}
                />
              </AdminField>
              <AdminField label="Prioridad">
                <AdminInput
                  type="number"
                  min={0}
                  value={form.prioridad}
                  onChange={(event) => setForm((current) => ({ ...current, prioridad: Number(event.target.value) }))}
                />
              </AdminField>
              <label className="demo-admin-list-item" style={{ alignItems: 'center' }}>
                <span>Activa</span>
                <input
                  type="checkbox"
                  checked={form.activa}
                  onChange={(event) => setForm((current) => ({ ...current, activa: event.target.checked }))}
                />
              </label>
            </div>
            {form.tipo === 'fecha' ? (
              <div className="demo-admin-inline-grid">
                <AdminField label="Inicio">
                  <AdminInput
                    type="datetime-local"
                    value={form.startsAt}
                    onChange={(event) => setForm((current) => ({ ...current, startsAt: event.target.value }))}
                  />
                </AdminField>
                <AdminField label="Fin">
                  <AdminInput
                    type="datetime-local"
                    value={form.endsAt}
                    onChange={(event) => setForm((current) => ({ ...current, endsAt: event.target.value }))}
                  />
                </AdminField>
              </div>
            ) : (
              <AdminField label="Minimo de unidades">
                <AdminInput
                  type="number"
                  min={1}
                  value={form.minUnidades}
                  onChange={(event) => setForm((current) => ({ ...current, minUnidades: event.target.value }))}
                />
              </AdminField>
            )}
            <AdminField label="Banner image URL">
              <AdminInput
                value={form.bannerImageUrl}
                onChange={(event) => setForm((current) => ({ ...current, bannerImageUrl: event.target.value }))}
              />
            </AdminField>
            <AdminField label="Buscar productos">
              <AdminInput
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Filtrar por nombre o marca"
              />
            </AdminField>
            <div className="demo-admin-list" style={{ maxHeight: 280, overflow: 'auto' }}>
              {filteredProducts.map((product) => (
                <label key={product.id} className="demo-admin-list-item" style={{ alignItems: 'center' }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{product.nombre}</p>
                    <p style={{ marginTop: 4, fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
                      {formatCurrency(Number(product.precio || 0))}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.productIds.includes(product.id)}
                    onChange={() => toggleProduct(product.id)}
                  />
                </label>
              ))}
            </div>
            {message ? <AdminMessage kind="success">{message}</AdminMessage> : null}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
              <AdminButton variant="ghost" onClick={resetForm}>
                {editing ? 'Cancelar edicion' : 'Limpiar'}
              </AdminButton>
              <AdminButton type="submit" disabled={saving}>
                {saving ? 'Guardando...' : editing ? 'Actualizar oferta' : 'Crear oferta'}
              </AdminButton>
            </div>
          </form>
        </AdminSurface>
      </div>

      <div className="demo-admin-grid">
        <AdminSurface padding="pad-md">
          <p className="demo-admin-page-eyebrow">Preview</p>
          <h2 className="demo-admin-page-title" style={{ fontSize: 22, marginBottom: 14 }}>
            Precio resultante
          </h2>
          <div className="demo-admin-list">
            {previews.length === 0 ? (
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>
                Selecciona productos para ver el impacto comercial.
              </p>
            ) : (
              previews.map(({ product, pricing }) => (
                <div key={product.id} className="demo-admin-list-item">
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{product.nombre}</p>
                    <p style={{ marginTop: 4, fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
                      {formatCurrency(pricing.originalPrice)} → {formatCurrency(pricing.finalPrice)}
                    </p>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--tk-primary)' }}>
                    {pricing.hasOffer ? `-${pricing.discountPct.toFixed(0)}%` : 'Sin oferta'}
                  </div>
                </div>
              ))
            )}
          </div>
        </AdminSurface>

        <AdminSurface padding="pad-md">
          <p className="demo-admin-page-eyebrow">Listado</p>
          <h2 className="demo-admin-page-title" style={{ fontSize: 22, marginBottom: 14 }}>
            Ofertas activas ({activeOffers.length})
          </h2>
          <div className="demo-admin-list">
            {offers.map((offer) => (
              <div key={offer.id} className="demo-admin-list-item">
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{offer.titulo}</p>
                  <p style={{ marginTop: 4, fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
                    {offer.tipo} · prioridad {offer.prioridad}
                  </p>
                  <p style={{ marginTop: 4, fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
                    {offer.startsAt ? formatDateTime(offer.startsAt) : 'Sin inicio'} →{' '}
                    {offer.endsAt ? formatDateTime(offer.endsAt) : 'Sin fin'}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <AdminIconButton onClick={() => updateOffer(offer.id, { activa: !offer.activa })} aria-label="Activar o pausar">
                    <Power size={14} />
                  </AdminIconButton>
                  <AdminIconButton onClick={() => handleEdit(offer)} aria-label="Editar oferta">
                    <Pencil size={14} />
                  </AdminIconButton>
                  <AdminIconButton onClick={() => deleteOffer(offer.id)} aria-label="Eliminar oferta">
                    <Trash2 size={14} />
                  </AdminIconButton>
                </div>
              </div>
            ))}
          </div>
        </AdminSurface>
      </div>
    </div>
  );
}
