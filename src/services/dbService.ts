import { 
  Vehicle, 
  VehicleExpense, 
  VehicleSale, 
  CashFlowItem, 
  VehicleDRE, 
  ExpenseCategory, 
  VehicleStatus,
  InventoryItem,
  StockAlert,
  StockMovement,
  SellerPerformanceSummary,
  SellerVehiclePerformance
} from '../types';
import { 
  INITIAL_VEHICLES, 
  INITIAL_EXPENSES, 
  INITIAL_SALES, 
  INITIAL_CASH_FLOW,
  INITIAL_INVENTORY_ITEMS,
  INITIAL_STOCK_ALERTS,
  INITIAL_STOCK_MOVEMENTS,
  INITIAL_USERS
} from '../data/mockInitialData';

const STORAGE_KEYS = {
  VEHICLES: 'autofleet_vehicles_v1',
  EXPENSES: 'autofleet_expenses_v1',
  SALES: 'autofleet_sales_v1',
  CASH_FLOW: 'autofleet_cashflow_v1',
  INVENTORY: 'autofleet_inventory_items_v1',
  STOCK_ALERTS: 'autofleet_stock_alerts_v1',
  STOCK_MOVEMENTS: 'autofleet_stock_movements_v1',
};

// Local durable state helper with fallback
function getStoredItems<T>(key: string, defaultItems: T[]): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultItems));
      return defaultItems;
    }
    return JSON.parse(raw) as T[];
  } catch {
    return defaultItems;
  }
}

function setStoredItems<T>(key: string, items: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch (err) {
    console.error(`Failed to store items in ${key}`, err);
  }
}


// -------------------------------------------------------------
// VEHICLE SERVICES
// -------------------------------------------------------------

export function getVehiclesByTenant(tenantId: string): Vehicle[] {
  const all = getStoredItems<Vehicle>(STORAGE_KEYS.VEHICLES, INITIAL_VEHICLES);
  return all.filter((v) => v.tenantId === tenantId);
}

export function addVehicle(vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>): Vehicle {
  const all = getStoredItems<Vehicle>(STORAGE_KEYS.VEHICLES, INITIAL_VEHICLES);
  const nowStr = new Date().toISOString();
  const newVehicle: Vehicle = {
    ...vehicle,
    id: `veh-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
    createdAt: nowStr,
    updatedAt: nowStr,
  };
  
  const updated = [newVehicle, ...all];
  setStoredItems(STORAGE_KEYS.VEHICLES, updated);

  // Automatically register purchase in cash flow
  addCashFlowItem({
    tenantId: newVehicle.tenantId,
    type: 'saida',
    category: 'compra_veiculo',
    amount: newVehicle.purchasePrice,
    date: newVehicle.entryDate || new Date().toISOString().split('T')[0],
    description: `Captação: ${newVehicle.brand} ${newVehicle.model} (${newVehicle.plate})`,
    vehicleId: newVehicle.id,
    vehiclePlate: newVehicle.plate,
    status: 'confirmado',
    responsible: newVehicle.buyerName || 'Equipe de Captação',
  });

  return newVehicle;
}

export function updateVehicle(vehicleId: string, updates: Partial<Vehicle>): Vehicle | null {
  const all = getStoredItems<Vehicle>(STORAGE_KEYS.VEHICLES, INITIAL_VEHICLES);
  const index = all.findIndex((v) => v.id === vehicleId);
  if (index === -1) return null;

  const current = all[index];
  // Note: fipeAtPurchase is frozen as per rule of law
  const updatedVehicle: Vehicle = {
    ...current,
    ...updates,
    fipeAtPurchase: current.fipeAtPurchase, // Immutable
    updatedAt: new Date().toISOString(),
  };

  all[index] = updatedVehicle;
  setStoredItems(STORAGE_KEYS.VEHICLES, all);
  return updatedVehicle;
}

export function deleteVehicle(vehicleId: string): boolean {
  const all = getStoredItems<Vehicle>(STORAGE_KEYS.VEHICLES, INITIAL_VEHICLES);
  const filtered = all.filter((v) => v.id !== vehicleId);
  if (filtered.length === all.length) return false;
  setStoredItems(STORAGE_KEYS.VEHICLES, filtered);
  return true;
}

// -------------------------------------------------------------
// EXPENSE SERVICES (DRE POR CHASSI)
// -------------------------------------------------------------

export function getExpensesByTenant(tenantId: string, vehicleId?: string): VehicleExpense[] {
  const all = getStoredItems<VehicleExpense>(STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES);
  return all.filter((e) => e.tenantId === tenantId && (!vehicleId || e.vehicleId === vehicleId));
}

export function addExpense(expense: Omit<VehicleExpense, 'id' | 'createdAt'>): VehicleExpense {
  const all = getStoredItems<VehicleExpense>(STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES);
  const newExpense: VehicleExpense = {
    ...expense,
    id: `exp-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
    createdAt: new Date().toISOString(),
  };

  const updated = [newExpense, ...all];
  setStoredItems(STORAGE_KEYS.EXPENSES, updated);

  // Automatically register in cash flow
  const vehicles = getStoredItems<Vehicle>(STORAGE_KEYS.VEHICLES, INITIAL_VEHICLES);
  const vehicle = vehicles.find((v) => v.id === expense.vehicleId);

  addCashFlowItem({
    tenantId: expense.tenantId,
    type: 'saida',
    category: 'recondicionamento',
    amount: expense.amount,
    date: expense.date,
    description: `[${expense.category.toUpperCase()}] ${expense.description} ${vehicle ? `(${vehicle.plate})` : ''}`,
    vehicleId: expense.vehicleId,
    vehiclePlate: vehicle?.plate,
    status: expense.status === 'paid' ? 'confirmado' : 'previsto',
    responsible: expense.responsibleUser,
  });

  return newExpense;
}

export function deleteExpense(expenseId: string): boolean {
  const all = getStoredItems<VehicleExpense>(STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES);
  const filtered = all.filter((e) => e.id !== expenseId);
  if (filtered.length === all.length) return false;
  setStoredItems(STORAGE_KEYS.EXPENSES, filtered);
  return true;
}

// -------------------------------------------------------------
// SALES SERVICES (ROI & LUCRO LÍQUIDO)
// -------------------------------------------------------------

export function getSalesByTenant(tenantId: string): VehicleSale[] {
  const all = getStoredItems<VehicleSale>(STORAGE_KEYS.SALES, INITIAL_SALES);
  return all.filter((s) => s.tenantId === tenantId);
}

export function recordSale(params: {
  tenantId: string;
  vehicleId: string;
  saleDate: string;
  salePrice: number;
  paymentMethod: VehicleSale['paymentMethod'];
  commissionAmount: number;
  sellerId: string;
  sellerName: string;
  customerName: string;
  customerCpf?: string;
  customerPhone?: string;
  notes?: string;
}): { sale: VehicleSale; dre: VehicleDRE } {
  const vehicles = getStoredItems<Vehicle>(STORAGE_KEYS.VEHICLES, INITIAL_VEHICLES);
  const vehicle = vehicles.find((v) => v.id === params.vehicleId);
  if (!vehicle) throw new Error('Veículo não encontrado');

  const expenses = getExpensesByTenant(params.tenantId, params.vehicleId);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalInvested = vehicle.purchasePrice + totalExpenses + params.commissionAmount;

  const netProfit = params.salePrice - totalInvested;
  const roiPercentage = totalInvested > 0 ? (netProfit / totalInvested) * 100 : 0;

  // Calculate days in yard using the Golden Rule (from Entry Date to Sale Date)
  const entryTime = new Date(vehicle.entryDate).getTime();
  const saleTime = new Date(params.saleDate).getTime();
  const daysInYard = Math.max(1, Math.round((saleTime - entryTime) / (1000 * 60 * 60 * 24)));

  const newSale: VehicleSale = {
    id: `sale-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
    tenantId: params.tenantId,
    vehicleId: params.vehicleId,
    saleDate: params.saleDate,
    salePrice: params.salePrice,
    paymentMethod: params.paymentMethod,
    commissionAmount: params.commissionAmount,
    sellerId: params.sellerId,
    sellerName: params.sellerName,
    customerName: params.customerName,
    customerCpf: params.customerCpf,
    customerPhone: params.customerPhone,
    notes: params.notes,
    netProfit: Math.round(netProfit * 100) / 100,
    roiPercentage: Math.round(roiPercentage * 100) / 100,
    daysInYard,
    createdAt: new Date().toISOString(),
  };

  // Save Sale
  const sales = getStoredItems<VehicleSale>(STORAGE_KEYS.SALES, INITIAL_SALES);
  setStoredItems(STORAGE_KEYS.SALES, [newSale, ...sales]);

  // Update Vehicle Status to 'Vendido'
  updateVehicle(vehicle.id, { status: 'Vendido' });

  // Add Sale Cash Flow Entry
  addCashFlowItem({
    tenantId: params.tenantId,
    type: 'entrada',
    category: 'venda_veiculo',
    amount: params.salePrice,
    date: params.saleDate,
    description: `Venda ${vehicle.brand} ${vehicle.model} (${vehicle.plate}) - Cliente: ${params.customerName}`,
    vehicleId: vehicle.id,
    vehiclePlate: vehicle.plate,
    status: 'confirmado',
    responsible: params.sellerName,
  });

  // If commission exists, register cash flow outflow
  if (params.commissionAmount > 0) {
    addCashFlowItem({
      tenantId: params.tenantId,
      type: 'saida',
      category: 'comissao',
      amount: params.commissionAmount,
      date: params.saleDate,
      description: `Comissão de venda para ${params.sellerName} (${vehicle.plate})`,
      vehicleId: vehicle.id,
      vehiclePlate: vehicle.plate,
      status: 'confirmado',
      responsible: 'Sistema AutoFleet',
    });
  }

  const updatedVehicle = { ...vehicle, status: 'Vendido' as VehicleStatus };
  const dre = calculateVehicleDRE(updatedVehicle, expenses, newSale);

  return { sale: newSale, dre };
}

// -------------------------------------------------------------
// CASH FLOW SERVICES
// -------------------------------------------------------------

export function getCashFlowByTenant(tenantId: string): CashFlowItem[] {
  const all = getStoredItems<CashFlowItem>(STORAGE_KEYS.CASH_FLOW, INITIAL_CASH_FLOW);
  return all.filter((cf) => cf.tenantId === tenantId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function addCashFlowItem(item: Omit<CashFlowItem, 'id' | 'createdAt'>): CashFlowItem {
  const all = getStoredItems<CashFlowItem>(STORAGE_KEYS.CASH_FLOW, INITIAL_CASH_FLOW);
  const newItem: CashFlowItem = {
    ...item,
    id: `cf-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
    createdAt: new Date().toISOString(),
  };

  const updated = [newItem, ...all];
  setStoredItems(STORAGE_KEYS.CASH_FLOW, updated);
  return newItem;
}

// -------------------------------------------------------------
// DRE & KPI CALCULATION ENGINES (Regra de Ouro Temporal)
// -------------------------------------------------------------

export function calculateVehicleDRE(
  vehicle: Vehicle, 
  expenses: VehicleExpense[], 
  sale?: VehicleSale
): VehicleDRE {
  const expensesByCategory: Record<ExpenseCategory, number> = {
    funilaria: 0,
    mecanica: 0,
    despachante: 0,
    higienizacao: 0,
    detail: 0,
    pneus: 0,
    eletrica: 0,
    acessorios: 0,
    laudo: 0,
    outros: 0,
  };

  let totalExpenses = 0;
  expenses.forEach((e) => {
    expensesByCategory[e.category] = (expensesByCategory[e.category] || 0) + e.amount;
    totalExpenses += e.amount;
  });

  const totalInvestedCost = vehicle.purchasePrice + totalExpenses + (sale?.commissionAmount || 0);

  // Golden Rule: Days in yard calculated from real entryDate
  const entryTime = new Date(vehicle.entryDate).getTime();
  const endTime = sale ? new Date(sale.saleDate).getTime() : Date.now();
  const daysInYard = Math.max(1, Math.floor((endTime - entryTime) / (1000 * 60 * 60 * 24)));

  const isOver30Days = daysInYard >= 30;
  const isOver60Days = daysInYard >= 60;

  let estimatedOrRealProfit = 0;
  let estimatedOrRealRoi = 0;

  if (sale) {
    estimatedOrRealProfit = sale.netProfit;
    estimatedOrRealRoi = sale.roiPercentage;
  } else {
    // Projection based on target sale price or FIPE
    const projectedSale = vehicle.targetSalePrice || vehicle.fipeAtPurchase;
    estimatedOrRealProfit = projectedSale - totalInvestedCost;
    estimatedOrRealRoi = totalInvestedCost > 0 ? (estimatedOrRealProfit / totalInvestedCost) * 100 : 0;
  }

  return {
    vehicle,
    expenses,
    sale,
    purchasePrice: vehicle.purchasePrice,
    totalExpenses,
    expensesByCategory,
    totalInvestedCost,
    fipeAtPurchase: vehicle.fipeAtPurchase,
    fipeComparisonDiff: vehicle.fipeAtPurchase - totalInvestedCost,
    daysInYard,
    isOver30Days,
    isOver60Days,
    estimatedOrRealProfit: Math.round(estimatedOrRealProfit * 100) / 100,
    estimatedOrRealRoi: Math.round(estimatedOrRealRoi * 100) / 100,
    status: vehicle.status,
  };
}

export interface FleetKPIs {
  totalVehiclesInYard: number; // Em Operação + Disponível
  vehiclesAvailable: number;
  vehiclesInPrep: number;
  vehiclesSold: number;
  totalActiveFleetFipe: number; // Soma do valor FIPE dos veículos ativos
  totalInvestedActiveFleet: number; // Preço de compra + custos dos veículos ativos
  totalPrepCost: number; // Custos totais de recondicionamento
  prepCostByCategory: Record<ExpenseCategory, number>;
  totalSalesRevenue: number;
  totalAbsoluteNetProfit: number;
  averageRoiPct: number;
  averageDaysInYard: number;
  turnaroundAlertCount30: number; // > 30 dias
  turnaroundAlertCount60: number; // > 60 dias
}

export function calculateFleetKPIs(
  vehicles: Vehicle[], 
  expenses: VehicleExpense[], 
  sales: VehicleSale[]
): FleetKPIs {
  const activeVehicles = vehicles.filter((v) => v.status !== 'Vendido');
  const soldVehicles = vehicles.filter((v) => v.status === 'Vendido');

  const vehiclesAvailable = vehicles.filter((v) => v.status === 'Disponível').length;
  const vehiclesInPrep = vehicles.filter((v) => v.status === 'Em Operação').length;

  const totalActiveFleetFipe = activeVehicles.reduce((sum, v) => sum + (v.fipeAtPurchase || 0), 0);

  const prepCostByCategory: Record<ExpenseCategory, number> = {
    funilaria: 0,
    mecanica: 0,
    despachante: 0,
    higienizacao: 0,
    detail: 0,
    pneus: 0,
    eletrica: 0,
    acessorios: 0,
    laudo: 0,
    outros: 0,
  };

  let totalPrepCost = 0;
  expenses.forEach((e) => {
    prepCostByCategory[e.category] = (prepCostByCategory[e.category] || 0) + e.amount;
    totalPrepCost += e.amount;
  });

  // Calculate active fleet invested capital
  const activeVehiclesIds = new Set(activeVehicles.map((v) => v.id));
  const activeExpenses = expenses.filter((e) => activeVehiclesIds.has(e.vehicleId));
  const totalActiveExpenses = activeExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalInvestedActiveFleet = activeVehicles.reduce((sum, v) => sum + v.purchasePrice, 0) + totalActiveExpenses;

  // Sales metrics
  const totalSalesRevenue = sales.reduce((sum, s) => sum + s.salePrice, 0);
  const totalAbsoluteNetProfit = sales.reduce((sum, s) => sum + s.netProfit, 0);

  const averageRoiPct = sales.length > 0
    ? sales.reduce((sum, s) => sum + s.roiPercentage, 0) / sales.length
    : 0;

  // Turnaround metrics
  let turnaroundAlertCount30 = 0;
  let turnaroundAlertCount60 = 0;
  let totalDaysActive = 0;

  activeVehicles.forEach((v) => {
    const entryTime = new Date(v.entryDate).getTime();
    const days = Math.max(1, Math.floor((Date.now() - entryTime) / (1000 * 60 * 60 * 24)));
    totalDaysActive += days;
    if (days >= 60) {
      turnaroundAlertCount60++;
    } else if (days >= 30) {
      turnaroundAlertCount30++;
    }
  });

  const averageDaysInYard = activeVehicles.length > 0
    ? Math.round(totalDaysActive / activeVehicles.length)
    : 0;

  return {
    totalVehiclesInYard: activeVehicles.length,
    vehiclesAvailable,
    vehiclesInPrep,
    vehiclesSold: soldVehicles.length,
    totalActiveFleetFipe,
    totalInvestedActiveFleet,
    totalPrepCost,
    prepCostByCategory,
    totalSalesRevenue,
    totalAbsoluteNetProfit: Math.round(totalAbsoluteNetProfit),
    averageRoiPct: Math.round(averageRoiPct * 10) / 10,
    averageDaysInYard,
    turnaroundAlertCount30,
    turnaroundAlertCount60,
  };
}

// -------------------------------------------------------------
// INVENTORY SERVICES (Coleção Firestore: inventory_items)
// -------------------------------------------------------------

export function getInventoryItemsByTenant(tenantId: string): InventoryItem[] {
  const all = getStoredItems<InventoryItem>(STORAGE_KEYS.INVENTORY, INITIAL_INVENTORY_ITEMS);
  return all.filter((item) => item.tenantId === tenantId);
}

export function addInventoryItem(item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>): InventoryItem {
  const all = getStoredItems<InventoryItem>(STORAGE_KEYS.INVENTORY, INITIAL_INVENTORY_ITEMS);
  const nowStr = new Date().toISOString();
  const newItem: InventoryItem = {
    ...item,
    id: `inv-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
    createdAt: nowStr,
    updatedAt: nowStr,
  };

  const updated = [newItem, ...all];
  setStoredItems(STORAGE_KEYS.INVENTORY, updated);

  // Check alert condition immediately
  evaluateStockAlertForItem(newItem);

  return newItem;
}

export function updateInventoryItem(itemId: string, updates: Partial<InventoryItem>): InventoryItem | null {
  const all = getStoredItems<InventoryItem>(STORAGE_KEYS.INVENTORY, INITIAL_INVENTORY_ITEMS);
  const index = all.findIndex((i) => i.id === itemId);
  if (index === -1) return null;

  const current = all[index];
  const updatedItem: InventoryItem = {
    ...current,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  all[index] = updatedItem;
  setStoredItems(STORAGE_KEYS.INVENTORY, all);

  // Re-evaluate stock alert state
  evaluateStockAlertForItem(updatedItem);

  return updatedItem;
}

export function deleteInventoryItem(itemId: string): boolean {
  const all = getStoredItems<InventoryItem>(STORAGE_KEYS.INVENTORY, INITIAL_INVENTORY_ITEMS);
  const filtered = all.filter((i) => i.id !== itemId);
  if (filtered.length === all.length) return false;
  setStoredItems(STORAGE_KEYS.INVENTORY, filtered);

  // Also clean up alerts associated with this item
  const alerts = getStoredItems<StockAlert>(STORAGE_KEYS.STOCK_ALERTS, INITIAL_STOCK_ALERTS);
  setStoredItems(STORAGE_KEYS.STOCK_ALERTS, alerts.filter((a) => a.itemId !== itemId));
  return true;
}

// -------------------------------------------------------------
// STOCK MOVEMENTS & ALERT EVALUATION
// -------------------------------------------------------------

export function getStockMovementsByTenant(tenantId: string, itemId?: string): StockMovement[] {
  const all = getStoredItems<StockMovement>(STORAGE_KEYS.STOCK_MOVEMENTS, INITIAL_STOCK_MOVEMENTS);
  return all
    .filter((m) => m.tenantId === tenantId && (!itemId || m.itemId === itemId))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function recordStockMovement(params: {
  tenantId: string;
  itemId: string;
  type: 'entrada' | 'saida' | 'ajuste';
  quantity: number;
  unitCost?: number;
  date: string;
  responsibleUser: string;
  vehicleId?: string;
  vehiclePlate?: string;
  createVehicleExpense?: boolean;
  notes?: string;
}): { movement: StockMovement; updatedItem: InventoryItem | null; alertTriggered: boolean } {
  const items = getStoredItems<InventoryItem>(STORAGE_KEYS.INVENTORY, INITIAL_INVENTORY_ITEMS);
  const itemIndex = items.findIndex((i) => i.id === params.itemId);
  if (itemIndex === -1) throw new Error('Item de estoque não encontrado');

  const currentItem = items[itemIndex];
  const cost = params.unitCost ?? currentItem.unitCost;
  const totalAmount = Math.round(cost * params.quantity * 100) / 100;

  // Calculate new quantity
  let newQuantity = currentItem.quantity;
  if (params.type === 'entrada') {
    newQuantity += params.quantity;
  } else if (params.type === 'saida') {
    newQuantity = Math.max(0, currentItem.quantity - params.quantity);
  } else if (params.type === 'ajuste') {
    newQuantity = params.quantity;
  }

  // Update Inventory Item
  const updatedItem: InventoryItem = {
    ...currentItem,
    quantity: newQuantity,
    unitCost: cost,
    updatedAt: new Date().toISOString(),
  };
  items[itemIndex] = updatedItem;
  setStoredItems(STORAGE_KEYS.INVENTORY, items);

  // Save Movement Record
  const newMovement: StockMovement = {
    id: `mov-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
    tenantId: params.tenantId,
    itemId: params.itemId,
    itemName: currentItem.name,
    type: params.type,
    quantity: params.quantity,
    unitCost: cost,
    totalAmount,
    date: params.date,
    responsibleUser: params.responsibleUser,
    vehicleId: params.vehicleId,
    vehiclePlate: params.vehiclePlate,
    createVehicleExpense: params.createVehicleExpense,
    notes: params.notes,
    createdAt: new Date().toISOString(),
  };

  const movements = getStoredItems<StockMovement>(STORAGE_KEYS.STOCK_MOVEMENTS, INITIAL_STOCK_MOVEMENTS);
  setStoredItems(STORAGE_KEYS.STOCK_MOVEMENTS, [newMovement, ...movements]);

  // If this is a vehicle part application (saída vinculada a veículo com createVehicleExpense = true)
  if (params.type === 'saida' && params.createVehicleExpense && params.vehicleId) {
    addExpense({
      tenantId: params.tenantId,
      vehicleId: params.vehicleId,
      category: (currentItem.category as ExpenseCategory) || 'outros',
      description: `[Peça/Estoque] ${currentItem.name} (${params.quantity} ${currentItem.unit})`,
      amount: totalAmount,
      date: params.date,
      responsibleUser: params.responsibleUser,
      supplier: currentItem.supplier || 'Almoxarifado Interno',
      status: 'paid',
      notes: `Baixa de estoque SKU: ${currentItem.sku}. ${params.notes || ''}`,
    });
  }

  // If entrada, optionally add cash outflow for purchase of parts
  if (params.type === 'entrada' && totalAmount > 0) {
    addCashFlowItem({
      tenantId: params.tenantId,
      type: 'saida',
      category: 'recondicionamento',
      amount: totalAmount,
      date: params.date,
      description: `Compra de estoque: ${currentItem.name} (${params.quantity} ${currentItem.unit})`,
      status: 'confirmado',
      responsible: params.responsibleUser,
    });
  }

  // Evaluate & trigger alert
  const alertTriggered = evaluateStockAlertForItem(updatedItem);

  return { movement: newMovement, updatedItem, alertTriggered };
}

// -------------------------------------------------------------
// STOCK ALERTS SERVICES (Coleção Firestore: stock_alerts)
// -------------------------------------------------------------

export function getStockAlertsByTenant(tenantId: string, statusFilter?: 'active' | 'resolved' | 'dismissed'): StockAlert[] {
  const all = getStoredItems<StockAlert>(STORAGE_KEYS.STOCK_ALERTS, INITIAL_STOCK_ALERTS);
  return all
    .filter((a) => a.tenantId === tenantId && (!statusFilter || a.status === statusFilter))
    .sort((a, b) => new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime());
}

export function evaluateStockAlertForItem(item: InventoryItem): boolean {
  const alerts = getStoredItems<StockAlert>(STORAGE_KEYS.STOCK_ALERTS, INITIAL_STOCK_ALERTS);
  const existingAlertIndex = alerts.findIndex((a) => a.itemId === item.id && a.status === 'active');

  const isLowStock = item.quantity <= item.minStockLevel;
  const isOutOfStock = item.quantity <= 0;

  if (isLowStock) {
    const severity: 'warning' | 'critical' = isOutOfStock ? 'critical' : 'warning';
    const notes = isOutOfStock
      ? `ESTOQUE ESGOTADO (0 ${item.unit})! Nível mínimo de segurança configurado: ${item.minStockLevel} ${item.unit}. Reposição urgente para não paralisar o recondicionamento.`
      : `Estoque baixo (${item.quantity} ${item.unit} restantes). Limiar mínimo de alerta: ${item.minStockLevel} ${item.unit}.`;

    if (existingAlertIndex >= 0) {
      // Update existing active alert
      alerts[existingAlertIndex] = {
        ...alerts[existingAlertIndex],
        currentQuantity: item.quantity,
        minStockLevel: item.minStockLevel,
        severity,
        notes,
        triggeredAt: new Date().toISOString(),
      };
    } else {
      // Create new active alert and notify admins
      const newAlert: StockAlert = {
        id: `alt-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
        tenantId: item.tenantId,
        itemId: item.id,
        itemName: item.name,
        itemSku: item.sku,
        category: item.category,
        currentQuantity: item.quantity,
        minStockLevel: item.minStockLevel,
        severity,
        status: 'active',
        triggeredAt: new Date().toISOString(),
        adminNotified: true,
        notifiedAt: new Date().toISOString(),
        notes,
      };
      alerts.unshift(newAlert);
    }
    setStoredItems(STORAGE_KEYS.STOCK_ALERTS, alerts);
    return true;
  } else {
    // Stock is now above minimum level -> automatically resolve active alert
    if (existingAlertIndex >= 0) {
      alerts[existingAlertIndex] = {
        ...alerts[existingAlertIndex],
        status: 'resolved',
        notes: `Alerta resolvido automaticamente. Novo saldo em estoque: ${item.quantity} ${item.unit}.`,
      };
      setStoredItems(STORAGE_KEYS.STOCK_ALERTS, alerts);
    }
    return false;
  }
}

export function dismissStockAlert(alertId: string): boolean {
  const alerts = getStoredItems<StockAlert>(STORAGE_KEYS.STOCK_ALERTS, INITIAL_STOCK_ALERTS);
  const index = alerts.findIndex((a) => a.id === alertId);
  if (index === -1) return false;

  alerts[index].status = 'dismissed';
  setStoredItems(STORAGE_KEYS.STOCK_ALERTS, alerts);
  return true;
}

export function resolveStockAlert(alertId: string): boolean {
  const alerts = getStoredItems<StockAlert>(STORAGE_KEYS.STOCK_ALERTS, INITIAL_STOCK_ALERTS);
  const index = alerts.findIndex((a) => a.id === alertId);
  if (index === -1) return false;

  alerts[index].status = 'resolved';
  setStoredItems(STORAGE_KEYS.STOCK_ALERTS, alerts);
  return true;
}

export function calculateInventoryKPIs(tenantId: string) {
  const items = getInventoryItemsByTenant(tenantId);
  const alerts = getStockAlertsByTenant(tenantId, 'active');

  const totalItemsCount = items.length;
  const totalStockUnits = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalInventoryValue = items.reduce((sum, i) => sum + i.quantity * i.unitCost, 0);
  
  const lowStockItems = items.filter((i) => i.quantity <= i.minStockLevel && i.quantity > 0);
  const outOfStockItems = items.filter((i) => i.quantity <= 0);

  return {
    totalItemsCount,
    totalStockUnits,
    totalInventoryValue: Math.round(totalInventoryValue * 100) / 100,
    lowStockCount: lowStockItems.length,
    outOfStockCount: outOfStockItems.length,
    activeAlertsCount: alerts.length,
    criticalAlertsCount: alerts.filter((a) => a.severity === 'critical').length,
    warningAlertsCount: alerts.filter((a) => a.severity === 'warning').length,
  };
}

// -------------------------------------------------------------
// SELLER PERFORMANCE REPORT ENGINE (Análise de Desempenho de Vendedores)
// -------------------------------------------------------------

export interface SellerPerformanceFilterParams {
  tenantId: string;
  startDate?: string;
  endDate?: string;
  sellerId?: string;
}

export interface SellerPerformanceReportResult {
  summaries: SellerPerformanceSummary[];
  totals: {
    totalVehiclesSold: number;
    totalRevenue: number;
    totalNetProfit: number;
    averageNetProfitPerVehicle: number;
    averageRoi: number;
    averageDaysInYard: number;
    totalCommissionAmount: number;
    averageTicket: number;
  };
  periodFiltered: {
    startDate?: string;
    endDate?: string;
    sellerId?: string;
  };
}

export function calculateSellerPerformance(params: SellerPerformanceFilterParams): SellerPerformanceReportResult {
  const allSales = getSalesByTenant(params.tenantId);
  const allVehicles = getVehiclesByTenant(params.tenantId);
  const vehiclesMap = new Map<string, Vehicle>(allVehicles.map((v) => [v.id, v]));

  // Filter sales by date range and optional sellerId
  const filteredSales = allSales.filter((sale) => {
    if (params.sellerId && params.sellerId !== 'all' && sale.sellerId !== params.sellerId) {
      return false;
    }
    if (params.startDate && new Date(sale.saleDate) < new Date(params.startDate)) {
      return false;
    }
    if (params.endDate && new Date(sale.saleDate) > new Date(params.endDate)) {
      return false;
    }
    return true;
  });

  // Group sales by sellerId
  const salesBySeller = new Map<string, VehicleSale[]>();
  filteredSales.forEach((sale) => {
    const list = salesBySeller.get(sale.sellerId) || [];
    list.push(sale);
    salesBySeller.set(sale.sellerId, list);
  });

  // Also include sellers from INITIAL_USERS who have role 'Vendedor' even if 0 sales in period
  const tenantUsers = INITIAL_USERS.filter((u) => u.tenantId === params.tenantId && u.role === 'Vendedor');
  tenantUsers.forEach((user) => {
    if (!salesBySeller.has(user.uid) && (!params.sellerId || params.sellerId === 'all' || params.sellerId === user.uid)) {
      salesBySeller.set(user.uid, []);
    }
  });

  const summaries: SellerPerformanceSummary[] = [];

  salesBySeller.forEach((sales, sellerId) => {
    const userProfile = INITIAL_USERS.find((u) => u.uid === sellerId);
    const sellerName = userProfile?.name || sales[0]?.sellerName || 'Vendedor';
    const sellerEmail = userProfile?.email || '';
    const avatarUrl = userProfile?.avatarUrl;

    const vehiclesList: SellerVehiclePerformance[] = sales.map((sale) => {
      const v = vehiclesMap.get(sale.vehicleId);
      const vehicleName = v ? `${v.brand} ${v.model} ${v.version}` : 'Veículo Desconhecido';
      const vehiclePlate = v ? v.plate : '---';

      return {
        saleId: sale.id,
        vehicleId: sale.vehicleId,
        vehiclePlate,
        vehicleName,
        saleDate: sale.saleDate,
        salePrice: sale.salePrice,
        netProfit: sale.netProfit,
        roiPercentage: sale.roiPercentage,
        daysInYard: sale.daysInYard,
        commissionAmount: sale.commissionAmount,
        paymentMethod: sale.paymentMethod,
        customerName: sale.customerName,
      };
    });

    const totalVehiclesSold = sales.length;
    const totalRevenue = sales.reduce((sum, s) => sum + s.salePrice, 0);
    const totalNetProfit = sales.reduce((sum, s) => sum + s.netProfit, 0);
    const totalCommissions = sales.reduce((sum, s) => sum + s.commissionAmount, 0);

    const averageNetProfitPerVehicle = totalVehiclesSold > 0 ? totalNetProfit / totalVehiclesSold : 0;
    const averageRoi = totalVehiclesSold > 0
      ? sales.reduce((sum, s) => sum + s.roiPercentage, 0) / totalVehiclesSold
      : 0;
    const averageDaysInYard = totalVehiclesSold > 0
      ? sales.reduce((sum, s) => sum + s.daysInYard, 0) / totalVehiclesSold
      : 0;

    // Payment methods breakdown
    const paymentMethodsBreakdown: Record<string, number> = {};
    sales.forEach((s) => {
      paymentMethodsBreakdown[s.paymentMethod] = (paymentMethodsBreakdown[s.paymentMethod] || 0) + 1;
    });

    // Best and fastest sale
    let bestSaleNetProfit: SellerVehiclePerformance | undefined;
    let fastestTurnaroundSale: SellerVehiclePerformance | undefined;

    if (vehiclesList.length > 0) {
      bestSaleNetProfit = [...vehiclesList].sort((a, b) => b.netProfit - a.netProfit)[0];
      fastestTurnaroundSale = [...vehiclesList].sort((a, b) => a.daysInYard - b.daysInYard)[0];
    }

    summaries.push({
      sellerId,
      sellerName,
      sellerEmail,
      avatarUrl,
      totalVehiclesSold,
      totalRevenue,
      totalInvestedCapital: totalRevenue - totalNetProfit,
      totalProfit: Math.round(totalNetProfit * 100) / 100,
      totalNetProfit: Math.round(totalNetProfit * 100) / 100,
      averageNetProfit: Math.round(averageNetProfitPerVehicle * 100) / 100,
      averageNetProfitPerVehicle: Math.round(averageNetProfitPerVehicle * 100) / 100,
      averageRoi: Math.round(averageRoi * 10) / 10,
      averageDaysInYard: Math.round(averageDaysInYard * 10) / 10,
      averageSalePrice: totalVehiclesSold > 0 ? Math.round(totalRevenue / totalVehiclesSold) : 0,
      totalCommissions: Math.round(totalCommissions * 100) / 100,
      salesCountByPaymentMethod: paymentMethodsBreakdown as any,
      sales: vehiclesList,
      vehicles: vehiclesList,
    });
  });

  // Sort summaries by totalNetProfit descending
  summaries.sort((a, b) => b.totalNetProfit - a.totalNetProfit);

  // Overall totals across all sellers in period
  const totalVehiclesSold = filteredSales.length;
  const totalRevenue = filteredSales.reduce((sum, s) => sum + s.salePrice, 0);
  const totalNetProfit = filteredSales.reduce((sum, s) => sum + s.netProfit, 0);
  const totalCommissionAmount = filteredSales.reduce((sum, s) => sum + s.commissionAmount, 0);

  const averageNetProfitPerVehicle = totalVehiclesSold > 0 ? totalNetProfit / totalVehiclesSold : 0;
  const averageRoi = totalVehiclesSold > 0
    ? filteredSales.reduce((sum, s) => sum + s.roiPercentage, 0) / totalVehiclesSold
    : 0;
  const averageDaysInYard = totalVehiclesSold > 0
    ? filteredSales.reduce((sum, s) => sum + s.daysInYard, 0) / totalVehiclesSold
    : 0;
  const averageTicket = totalVehiclesSold > 0 ? totalRevenue / totalVehiclesSold : 0;

  return {
    summaries,
    totals: {
      totalVehiclesSold,
      totalRevenue,
      totalNetProfit: Math.round(totalNetProfit * 100) / 100,
      averageNetProfitPerVehicle: Math.round(averageNetProfitPerVehicle * 100) / 100,
      averageRoi: Math.round(averageRoi * 10) / 10,
      averageDaysInYard: Math.round(averageDaysInYard * 10) / 10,
      totalCommissionAmount: Math.round(totalCommissionAmount * 100) / 100,
      averageTicket: Math.round(averageTicket * 100) / 100,
    },
    periodFiltered: {
      startDate: params.startDate,
      endDate: params.endDate,
      sellerId: params.sellerId,
    },
  };
}

// Reset database helper for testing
export function resetToDefaultMockData(): void {
  setStoredItems(STORAGE_KEYS.VEHICLES, INITIAL_VEHICLES);
  setStoredItems(STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES);
  setStoredItems(STORAGE_KEYS.SALES, INITIAL_SALES);
  setStoredItems(STORAGE_KEYS.CASH_FLOW, INITIAL_CASH_FLOW);
  setStoredItems(STORAGE_KEYS.INVENTORY, INITIAL_INVENTORY_ITEMS);
  setStoredItems(STORAGE_KEYS.STOCK_ALERTS, INITIAL_STOCK_ALERTS);
  setStoredItems(STORAGE_KEYS.STOCK_MOVEMENTS, INITIAL_STOCK_MOVEMENTS);
}

// -------------------------------------------------------------
// CONVENIENCE DATA BATCH LOADERS & WRAPPERS
// -------------------------------------------------------------

export function loadTenantData(tenantId: string) {
  return {
    vehicles: getVehiclesByTenant(tenantId),
    expenses: getExpensesByTenant(tenantId),
    sales: getSalesByTenant(tenantId),
    cashFlow: getCashFlowByTenant(tenantId),
    inventoryItems: getInventoryItemsByTenant(tenantId),
    stockAlerts: getStockAlertsByTenant(tenantId),
    stockMovements: getStockMovementsByTenant(tenantId),
  };
}

export const saveVehicle = addVehicle;
export const saveExpense = addExpense;
export const recordVehicleSale = recordSale;
export const saveCashFlowItem = addCashFlowItem;


