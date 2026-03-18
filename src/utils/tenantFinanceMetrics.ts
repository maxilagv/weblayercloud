import type { TenantExpense } from '../hooks/useTenantExpenses';
import type { TenantFinanceEntry } from '../hooks/useTenantFinance';
import type { TenantOrder } from '../hooks/useTenantOrders';
import { toDate } from './firestoreDate';

export type FinancePeriod = 'today' | 'week' | 'month' | 'quarter' | 'year';

const SALE_STATUSES = new Set(['confirmado', 'despachado']);

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
}

function endOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

function toDateKey(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function toLabel(date: Date): string {
  return date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
  });
}

export function formatCurrencyArs(value: number): string {
  return value.toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function getFinanceRange(period: FinancePeriod, now = new Date()) {
  if (period === 'today') {
    return { start: startOfDay(now), end: endOfDay(now), label: 'Hoy' };
  }

  if (period === 'week') {
    const weekday = now.getDay();
    const diffToMonday = weekday === 0 ? -6 : 1 - weekday;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMonday);
    return { start: startOfDay(monday), end: endOfDay(now), label: 'Semana' };
  }

  if (period === 'month') {
    return {
      start: startOfDay(new Date(now.getFullYear(), now.getMonth(), 1)),
      end: endOfDay(now),
      label: 'Mes',
    };
  }

  if (period === 'quarter') {
    const quarterMonth = Math.floor(now.getMonth() / 3) * 3;
    return {
      start: startOfDay(new Date(now.getFullYear(), quarterMonth, 1)),
      end: endOfDay(now),
      label: 'Trimestre',
    };
  }

  return {
    start: startOfDay(new Date(now.getFullYear(), 0, 1)),
    end: endOfDay(now),
    label: 'Año',
  };
}

function isWithinRange(date: Date | null, start: Date, end: Date) {
  if (!date) return false;
  return date >= start && date <= end;
}

function buildDateKeys(start: Date, end: Date): string[] {
  const keys: string[] = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    keys.push(toDateKey(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return keys;
}

export function computeTenantFinanceMetrics({
  orders,
  entries,
  expenses,
  period,
}: {
  orders: TenantOrder[];
  entries: TenantFinanceEntry[];
  expenses: TenantExpense[];
  period: FinancePeriod;
}) {
  const { start, end, label } = getFinanceRange(period);
  const dateKeys = buildDateKeys(start, end);

  const daily = new Map<
    string,
    {
      ventas: number;
      egresos: number;
      ganancia: number;
      ingresos: number;
    }
  >();

  const statusMap = new Map<string, number>();
  const productRevenue = new Map<
    string,
    { nombre: string; revenue: number; unidades: number }
  >();

  let grossSales = 0;
  let expensesTotal = 0;
  let successfulOrders = 0;

  for (const key of dateKeys) {
    daily.set(key, {
      ventas: 0,
      egresos: 0,
      ganancia: 0,
      ingresos: 0,
    });
  }

  for (const order of orders) {
    const date = toDate(order.createdAt);
    if (!isWithinRange(date, start, end)) continue;

    const status = String(order.status || 'pendiente');
    statusMap.set(status, (statusMap.get(status) ?? 0) + 1);

    if (!SALE_STATUSES.has(status)) continue;

    successfulOrders += 1;
    grossSales += Number(order.total || 0);

    const key = toDateKey(date!);
    const row = daily.get(key);
    if (row) {
      row.ventas += Number(order.total || 0);
      row.ingresos += Number(order.total || 0);
    }

    for (const item of order.items ?? []) {
      const productId = String(item.productId || '').trim();
      if (!productId) continue;
      const revenue = Number(item.precioUnitario || item.precio || 0) * Number(item.cantidad || 0);
      const current = productRevenue.get(productId) ?? {
        nombre: item.nombre || 'Producto',
        revenue: 0,
        unidades: 0,
      };
      current.revenue += revenue;
      current.unidades += Number(item.cantidad || 0);
      productRevenue.set(productId, current);
    }
  }

  for (const entry of entries) {
    const date = toDate(entry.createdAt);
    if (!isWithinRange(date, start, end)) continue;

    const amount = Number(entry.monto || 0);
    const key = toDateKey(date!);
    const row = daily.get(key);

    if (entry.tipo === 'egreso') {
      expensesTotal += amount;
      if (row) row.egresos += amount;
    } else if (row) {
      row.ingresos += amount;
    }
  }

  for (const expense of expenses) {
    const date = toDate(expense.fecha || expense.createdAt);
    if (!isWithinRange(date, start, end)) continue;

    const amount = Number(expense.monto || 0);
    expensesTotal += amount;
    const key = toDateKey(date!);
    const row = daily.get(key);
    if (row) row.egresos += amount;
  }

  const chartData = dateKeys.map((key) => {
    const row = daily.get(key)!;
    const ganancia = row.ventas - row.egresos;
    row.ganancia = ganancia;
    return {
      key,
      label: toLabel(new Date(key)),
      ventas: Number(row.ventas.toFixed(2)),
      egresos: Number(row.egresos.toFixed(2)),
      ganancia: Number(ganancia.toFixed(2)),
      ingresos: Number(row.ingresos.toFixed(2)),
    };
  });

  let cumulativeIncome = 0;
  let cumulativeExpenses = 0;
  const cashFlowData = chartData.map((row) => {
    cumulativeIncome += row.ingresos;
    cumulativeExpenses += row.egresos;
    return {
      label: row.label,
      ingresos: row.ingresos,
      egresos: row.egresos,
      ingresosAcumulados: Number(cumulativeIncome.toFixed(2)),
      egresosAcumulados: Number(cumulativeExpenses.toFixed(2)),
      netoAcumulado: Number((cumulativeIncome - cumulativeExpenses).toFixed(2)),
    };
  });

  const netProfit = grossSales - expensesTotal;
  const averageTicket = successfulOrders > 0 ? grossSales / successfulOrders : 0;
  const marginPct = grossSales > 0 ? (netProfit / grossSales) * 100 : 0;

  const statusData = [...statusMap.entries()].map(([status, value]) => ({
    name: status,
    value,
  }));

  const topProducts = [...productRevenue.entries()]
    .map(([productId, product]) => ({ productId, ...product }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return {
    rangeLabel: label,
    kpis: {
      grossSales: Number(grossSales.toFixed(2)),
      expenses: Number(expensesTotal.toFixed(2)),
      netProfit: Number(netProfit.toFixed(2)),
      marginPct: Number(marginPct.toFixed(2)),
      averageTicket: Number(averageTicket.toFixed(2)),
    },
    chartData,
    cashFlowData,
    statusData,
    topProducts,
    orderCount: successfulOrders,
  };
}
