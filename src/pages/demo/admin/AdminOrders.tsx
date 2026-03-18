import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { useTenantCustomers, type TenantCustomer } from '../../../hooks/useTenantCustomers';
import { useTenantOrders, type OrderStatus } from '../../../hooks/useTenantOrders';
import { useTenantProducts } from '../../../hooks/useTenantProducts';
import {
  AdminButton,
  AdminEmptyState,
  AdminField,
  AdminInput,
  AdminLoadingState,
  AdminModal,
  AdminPageHeader,
  AdminSelect,
  AdminStatusBadge,
  AdminSurface,
} from './AdminUi';
import { formatCurrency, formatDate } from './adminHelpers';

type ManualOrderItem = {
  productId: string;
  quantity: number;
};

const EMPTY_CUSTOMER: Omit<TenantCustomer, 'id'> = {
  nombre: '',
  apellido: '',
  dni: '',
  email: '',
  telefono: '',
  direccion: '',
  tipo: 'manual',
};

export default function AdminOrders({ tenantId }: { tenantId: string }) {
  const { orders, loading, updateOrderStatus, createOrder } = useTenantOrders(tenantId);
  const { customers, addCustomer } = useTenantCustomers(tenantId);
  const { products } = useTenantProducts(tenantId);

  const [modalOpen, setModalOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [customerQuery, setCustomerQuery] = useState('');
  const [productQuery, setProductQuery] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [newCustomer, setNewCustomer] = useState(EMPTY_CUSTOMER);
  const [creatingCustomer, setCreatingCustomer] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [selectedItems, setSelectedItems] = useState<ManualOrderItem[]>([]);
  const [saving, setSaving] = useState(false);

  const filteredCustomers = useMemo(() => {
    const term = customerQuery.trim().toLowerCase();
    if (!term) return customers;
    return customers.filter((customer) => {
      const text = `${customer.nombre} ${customer.apellido} ${customer.email} ${customer.telefono}`.toLowerCase();
      return text.includes(term);
    });
  }, [customerQuery, customers]);

  const filteredProducts = useMemo(() => {
    const term = productQuery.trim().toLowerCase();
    return products
      .filter((product) => product.activo)
      .filter((product) => {
        if (!term) return true;
        return `${product.nombre} ${product.marca}`.toLowerCase().includes(term);
      });
  }, [productQuery, products]);

  const selectedCustomer = customers.find((customer) => customer.id === selectedCustomerId) ?? null;

  const selectedProducts = selectedItems
    .map((item) => ({
      item,
      product: products.find((product) => product.id === item.productId),
    }))
    .filter((entry): entry is { item: ManualOrderItem; product: (typeof products)[number] } => Boolean(entry.product));

  const subtotal = selectedProducts.reduce(
    (sum, entry) => sum + Number(entry.product.precio || 0) * entry.item.quantity,
    0,
  );
  const total = Math.max(0, subtotal - discount);

  const resetManualOrder = () => {
    setStep(1);
    setCustomerQuery('');
    setProductQuery('');
    setSelectedCustomerId('');
    setNewCustomer(EMPTY_CUSTOMER);
    setCreatingCustomer(false);
    setDiscount(0);
    setSelectedItems([]);
  };

  const openModal = () => {
    resetManualOrder();
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const addProduct = (productId: string) => {
    setSelectedItems((current) => {
      const existing = current.find((item) => item.productId === productId);
      if (existing) {
        return current.map((item) =>
          item.productId === productId
            ? { ...item, quantity: Math.min(item.quantity + 1, 99) }
            : item,
        );
      }
      return [...current, { productId, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setSelectedItems((current) =>
      quantity <= 0
        ? current.filter((item) => item.productId !== productId)
        : current.map((item) => (item.productId === productId ? { ...item, quantity } : item)),
    );
  };

  const saveManualOrder = async () => {
    setSaving(true);
    try {
      let customerId = selectedCustomerId;
      let customerSnapshot: TenantCustomer;

      if (creatingCustomer) {
        const ref = await addCustomer(newCustomer);
        customerId = ref.id;
        customerSnapshot = { ...newCustomer, id: ref.id };
      } else if (selectedCustomer) {
        customerSnapshot = selectedCustomer;
      } else {
        return;
      }

      await createOrder({
        customerId,
        customerSnapshot: {
          nombre: customerSnapshot.nombre,
          apellido: customerSnapshot.apellido,
          email: customerSnapshot.email,
          telefono: customerSnapshot.telefono,
          direccion: customerSnapshot.direccion,
          dni: customerSnapshot.dni,
        },
        items: selectedProducts.map(({ item, product }) => ({
          productId: product.id,
          nombre: product.nombre,
          cantidad: item.quantity,
          precioUnitario: Number(product.precio || 0),
        })),
        status: 'pendiente',
        total,
        descuentoMonto: discount,
        source: 'manual',
        stockApplied: false,
      });

      closeModal();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <AdminPageHeader
        eyebrow="Ventas"
        title="Pedidos"
        description="Gestiona el flujo operativo, cambia estados y carga pedidos manuales para simular venta asistida."
        actions={<AdminButton onClick={openModal}><Plus size={14} style={{ marginRight: 8 }} />Nuevo pedido</AdminButton>}
      />

      <AdminSurface padding="pad-sm">
        <div className="demo-admin-table-wrap">
          <table className="demo-admin-table">
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Cliente</th>
                <th>Items</th>
                <th>Total</th>
                <th>Fuente</th>
                <th>Estado</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7}>
                    <AdminLoadingState>Cargando pedidos...</AdminLoadingState>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <AdminEmptyState>No hay pedidos registrados.</AdminEmptyState>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <p style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>
                        #{order.id.slice(-6).toUpperCase()}
                      </p>
                    </td>
                    <td>
                      {order.customerSnapshot.nombre} {order.customerSnapshot.apellido}
                      <div style={{ marginTop: 4, fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
                        {order.customerSnapshot.email || 'Sin email'}
                      </div>
                    </td>
                    <td>{order.items.reduce((sum, item) => sum + Number(item.cantidad || 0), 0)}</td>
                    <td style={{ color: 'var(--tk-primary)', fontWeight: 800 }}>
                      {formatCurrency(Number(order.total || 0))}
                    </td>
                    <td>{order.source || 'web'}</td>
                    <td>
                      <AdminSelect
                        value={order.status}
                        onChange={(event) => updateOrderStatus(order.id, event.target.value as OrderStatus)}
                      >
                        <option value="pendiente">Pendiente</option>
                        <option value="confirmado">Confirmado</option>
                        <option value="despachado">Despachado</option>
                        <option value="cancelado">Cancelado</option>
                      </AdminSelect>
                    </td>
                    <td>
                      <AdminStatusBadge status={order.status} />
                      <div style={{ marginTop: 8, fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
                        {formatDate(order.createdAt)}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </AdminSurface>

      <AdminModal open={modalOpen} title="Nuevo pedido manual" eyebrow="Ventas" onClose={closeModal}>
        <div className="demo-admin-pill-group" style={{ marginBottom: 18 }}>
          {[1, 2, 3].map((value) => (
            <button
              key={value}
              type="button"
              className={`demo-admin-pill ${step === value ? 'is-active' : ''}`}
              onClick={() => setStep(value)}
            >
              Paso {value}
            </button>
          ))}
        </div>

        {step === 1 ? (
          <div className="demo-admin-grid columns-2">
            <div>
              <div className="demo-admin-toolbar">
                <AdminField label="Buscar cliente">
                  <AdminInput
                    value={customerQuery}
                    onChange={(event) => setCustomerQuery(event.target.value)}
                    placeholder="Nombre, email o telefono"
                  />
                </AdminField>
              </div>
              <div className="demo-admin-list" style={{ maxHeight: 360, overflow: 'auto' }}>
                {filteredCustomers.map((customer) => (
                  <button
                    key={customer.id}
                    type="button"
                    className="demo-admin-list-item"
                    style={{
                      cursor: 'pointer',
                      borderColor: selectedCustomerId === customer.id ? 'var(--tk-primary)' : undefined,
                    }}
                    onClick={() => {
                      setCreatingCustomer(false);
                      setSelectedCustomerId(customer.id);
                    }}
                  >
                    <div style={{ textAlign: 'left' }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>
                        {customer.nombre} {customer.apellido}
                      </p>
                      <p style={{ marginTop: 4, fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
                        {customer.email || 'Sin email'} · {customer.telefono || 'Sin telefono'}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="demo-admin-toolbar" style={{ justifyContent: 'space-between' }}>
                <h3 className="demo-admin-page-title" style={{ fontSize: 22 }}>
                  Nuevo cliente
                </h3>
                <AdminButton variant={creatingCustomer ? 'primary' : 'ghost'} onClick={() => setCreatingCustomer((current) => !current)}>
                  {creatingCustomer ? 'Usando alta manual' : 'Crear manual'}
                </AdminButton>
              </div>
              {creatingCustomer ? (
                <div className="demo-admin-grid">
                  <div className="demo-admin-inline-grid">
                    <AdminField label="Nombre">
                      <AdminInput
                        value={newCustomer.nombre}
                        onChange={(event) => setNewCustomer((current) => ({ ...current, nombre: event.target.value }))}
                      />
                    </AdminField>
                    <AdminField label="Apellido">
                      <AdminInput
                        value={newCustomer.apellido}
                        onChange={(event) =>
                          setNewCustomer((current) => ({ ...current, apellido: event.target.value }))
                        }
                      />
                    </AdminField>
                  </div>
                  <AdminField label="Email">
                    <AdminInput
                      type="email"
                      value={newCustomer.email}
                      onChange={(event) => setNewCustomer((current) => ({ ...current, email: event.target.value }))}
                    />
                  </AdminField>
                  <AdminField label="Telefono">
                    <AdminInput
                      value={newCustomer.telefono}
                      onChange={(event) =>
                        setNewCustomer((current) => ({ ...current, telefono: event.target.value }))
                      }
                    />
                  </AdminField>
                  <AdminField label="Direccion">
                    <AdminInput
                      value={newCustomer.direccion}
                      onChange={(event) =>
                        setNewCustomer((current) => ({ ...current, direccion: event.target.value }))
                      }
                    />
                  </AdminField>
                </div>
              ) : (
                <AdminEmptyState>Selecciona un cliente existente o activa la carga manual.</AdminEmptyState>
              )}
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="demo-admin-grid columns-2">
            <div>
              <AdminField label="Buscar producto">
                <AdminInput
                  value={productQuery}
                  onChange={(event) => setProductQuery(event.target.value)}
                  placeholder="Nombre o marca"
                />
              </AdminField>
              <div className="demo-admin-list" style={{ marginTop: 14, maxHeight: 360, overflow: 'auto' }}>
                {filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    className="demo-admin-list-item"
                    style={{ cursor: 'pointer' }}
                    onClick={() => addProduct(product.id)}
                  >
                    <div style={{ textAlign: 'left' }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{product.nombre}</p>
                      <p style={{ marginTop: 4, fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
                        {product.marca || 'Sin marca'} · stock {product.stockActual}
                      </p>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--tk-primary)' }}>
                      {formatCurrency(Number(product.precio || 0))}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="demo-admin-page-title" style={{ fontSize: 22, marginBottom: 14 }}>
                Seleccionados
              </h3>
              {selectedProducts.length === 0 ? (
                <AdminEmptyState>Aun no agregaste productos.</AdminEmptyState>
              ) : (
                <div className="demo-admin-list">
                  {selectedProducts.map(({ item, product }) => (
                    <div key={product.id} className="demo-admin-list-item">
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{product.nombre}</p>
                        <p style={{ marginTop: 4, fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
                          {formatCurrency(Number(product.precio || 0))}
                        </p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <AdminButton variant="ghost" onClick={() => updateQuantity(product.id, item.quantity - 1)}>
                          -
                        </AdminButton>
                        <span>{item.quantity}</span>
                        <AdminButton variant="ghost" onClick={() => updateQuantity(product.id, item.quantity + 1)}>
                          +
                        </AdminButton>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="demo-admin-grid columns-2">
            <AdminSurface padding="pad-sm">
              <h3 className="demo-admin-page-title" style={{ fontSize: 22, marginBottom: 14 }}>
                Resumen
              </h3>
              <div className="demo-admin-list">
                {selectedProducts.map(({ item, product }) => (
                  <div key={product.id} className="demo-admin-list-item">
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{product.nombre}</p>
                      <p style={{ marginTop: 4, fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
                        {item.quantity} × {formatCurrency(Number(product.precio || 0))}
                      </p>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--tk-primary)' }}>
                      {formatCurrency(Number(product.precio || 0) * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
            </AdminSurface>

            <AdminSurface padding="pad-sm">
              <AdminField label="Descuento manual">
                <AdminInput
                  type="number"
                  min={0}
                  value={discount}
                  onChange={(event) => setDiscount(Number(event.target.value))}
                />
              </AdminField>
              <div className="demo-admin-list" style={{ marginTop: 18 }}>
                <div className="demo-admin-list-item">
                  <span>Subtotal</span>
                  <strong>{formatCurrency(subtotal)}</strong>
                </div>
                <div className="demo-admin-list-item">
                  <span>Descuento</span>
                  <strong>{formatCurrency(discount)}</strong>
                </div>
                <div className="demo-admin-list-item">
                  <span>Total</span>
                  <strong style={{ color: 'var(--tk-primary)' }}>{formatCurrency(total)}</strong>
                </div>
              </div>
              <div style={{ marginTop: 16, fontSize: 13, color: 'rgba(255,255,255,0.54)' }}>
                El pedido se crea con <strong>source: manual</strong> y <strong>stockApplied: false</strong>.
              </div>
            </AdminSurface>
          </div>
        ) : null}

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginTop: 18 }}>
          <AdminButton variant="ghost" onClick={() => setStep((current) => Math.max(1, current - 1))}>
            Atras
          </AdminButton>
          {step < 3 ? (
            <AdminButton
              onClick={() => setStep((current) => Math.min(3, current + 1))}
              disabled={
                (step === 1 && !creatingCustomer && !selectedCustomerId) ||
                (step === 1 && creatingCustomer && (!newCustomer.nombre || !newCustomer.apellido)) ||
                (step === 2 && selectedProducts.length === 0)
              }
            >
              Continuar
            </AdminButton>
          ) : (
            <AdminButton onClick={saveManualOrder} disabled={saving || total <= 0}>
              {saving ? 'Creando pedido...' : 'Confirmar pedido'}
            </AdminButton>
          )}
        </div>
      </AdminModal>
    </div>
  );
}
