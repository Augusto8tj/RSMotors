export type UserRole = 'Admin' | 'Comprador' | 'Vendedor' | 'Financeiro';

export type TenantPlan = 'trial' | 'pro' | 'enterprise';

export type TenantStatus = 'active' | 'trial' | 'expired' | 'suspended';

export interface Tenant {
  id: string;
  name: string;
  cnpj: string;
  plan: TenantPlan;
  status: TenantStatus;
  trialStartDate: string;
  trialEndDate: string;
  plateQueriesLimit: number;
  plateQueriesUsed: number;
  city: string;
  state: string;
  phone?: string;
  createdAt: string;
}

export interface UserProfile {
  uid: string;
  tenantId: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  active: boolean;
}

export type VehicleStatus = 'Em Operação' | 'Disponível' | 'Vendido';

export interface Vehicle {
  id: string;
  tenantId: string;
  plate: string;
  chassis: string;
  brand: string;
  model: string;
  version: string;
  yearFab: number;
  yearModel: number;
  color: string;
  fuel: string;
  mileage: number;
  fipeAtPurchase: number; // Congelado no momento da captação
  fipeCode?: string;
  fipeMonthRef?: string;
  currentFipeValue?: number; // Para acompanhar depreciação/valorização de mercado
  purchasePrice: number;
  entryDate: string; // Data de Entrada Real no Pátio (Regra de Ouro)
  status: VehicleStatus;
  buyerId: string;
  buyerName: string;
  notes?: string;
  photos: string[];
  targetSalePrice?: number;
  createdAt: string;
  updatedAt: string;
}

export type ExpenseCategory =
  | 'funilaria'
  | 'mecanica'
  | 'despachante'
  | 'higienizacao'
  | 'detail'
  | 'pneus'
  | 'eletrica'
  | 'acessorios'
  | 'laudo'
  | 'outros';

export interface VehicleExpense {
  id: string;
  tenantId: string;
  vehicleId: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  date: string;
  responsibleUser: string;
  invoiceNumber?: string;
  receiptUrl?: string;
  status: 'paid' | 'pending';
  supplier?: string;
  notes?: string;
  createdAt: string;
}

export type PaymentMethod =
  | 'pix'
  | 'financiamento'
  | 'cartao'
  | 'ted'
  | 'troca_com_troco'
  | 'misto';

export interface VehicleSale {
  id: string;
  tenantId: string;
  vehicleId: string;
  saleDate: string;
  salePrice: number;
  paymentMethod: PaymentMethod;
  commissionAmount: number;
  sellerId: string;
  sellerName: string;
  customerName: string;
  customerCpf?: string;
  customerPhone?: string;
  notes?: string;
  netProfit: number;
  roiPercentage: number;
  daysInYard: number;
  createdAt: string;
}

export type CashFlowType = 'entrada' | 'saida';

export type CashFlowCategory =
  | 'venda_veiculo'
  | 'compra_veiculo'
  | 'recondicionamento'
  | 'despachante'
  | 'comissao'
  | 'aluguel_loja'
  | 'salarios'
  | 'marketing'
  | 'impostos'
  | 'outros';

export interface CashFlowItem {
  id: string;
  tenantId: string;
  type: CashFlowType;
  category: CashFlowCategory;
  amount: number;
  date: string;
  description: string;
  vehicleId?: string;
  vehiclePlate?: string;
  status: 'confirmado' | 'previsto';
  responsible: string;
  createdAt: string;
}

export interface PlateQueryResult {
  plate: string;
  brand: string;
  model: string;
  version: string;
  yearFab: number;
  yearModel: number;
  color: string;
  fuel: string;
  chassisMasked: string;
  city: string;
  state: string;
  fipeValue: number;
  fipeCode: string;
  fipeRefMonth: string;
  historyStatus: 'Sem Sinistro' | 'Passagem por Leilão Leve' | 'Sinistro Recuperado' | 'Frota/Locadora';
  ipvaStatus: 'Em Dia' | 'Débito Pendente' | 'Parcelado';
  queryDate: string;
  source: 'Sandbox Test Data' | 'Tabela FIPE / API Brasil';
}

export interface VehicleDRE {
  vehicle: Vehicle;
  expenses: VehicleExpense[];
  sale?: VehicleSale;
  purchasePrice: number;
  totalExpenses: number;
  expensesByCategory: Record<ExpenseCategory, number>;
  totalInvestedCost: number; // purchasePrice + totalExpenses
  fipeAtPurchase: number;
  fipeComparisonDiff: number; // fipeAtPurchase - totalInvestedCost
  daysInYard: number;
  isOver30Days: boolean;
  isOver60Days: boolean;
  estimatedOrRealProfit: number;
  estimatedOrRealRoi: number;
  status: VehicleStatus;
}

export interface ViabilitySimulationInput {
  fipeValue: number;
  projectedExpenses: {
    funilaria: number;
    mecanica: number;
    despachante: number;
    higienizacao: number;
    laudoOutros: number;
    safetyMarginPct: number; // Margem de segurança para imprevistos (ex: 3%)
  };
  desiredMarginPct: number; // Margem líquida desejada (ex: 12%)
  sellerCommissionPct: number; // Comissão do vendedor/comprador (ex: 1.5%)
  targetSellingPriceOverride?: number; // Se desejar vender acima ou abaixo da FIPE
}

export interface ViabilitySimulationResult {
  fipeValue: number;
  targetSellingPrice: number;
  totalProjectedExpenses: number;
  safetyMarginAmount: number;
  commissionAmount: number;
  desiredProfitAmount: number;
  maxRecommendedOffer: number; // Proposta Máxima Recomendada (Teto de Compra)
  offerPercentageOfFipe: number; // Proposta / FIPE em %
  projectedRoi: number;
  suggestedNegotiationRange: {
    aggressiveOffer: number; // Maior margem para a loja (80% da FIPE ajustada)
    recommendedOffer: number; // Ponto de equilíbrio com a margem desejada
    ceilingOffer: number; // Limite máximo tolerável
  };
}

// -------------------------------------------------------------
// INVENTORY & RECONDITIONING SUPPLIES (Coleção: inventory_items)
// -------------------------------------------------------------
export type InventoryCategory =
  | 'mecanica'
  | 'funilaria'
  | 'detail'
  | 'pneus'
  | 'eletrica'
  | 'higienizacao'
  | 'acessorios'
  | 'outros';

export interface InventoryItem {
  id: string;
  tenantId: string;
  name: string;
  sku: string;
  category: InventoryCategory;
  unit: string; // 'un', 'litros', 'jogo', 'kit', 'par', 'cx'
  quantity: number;
  minStockLevel: number; // Nível mínimo de estoque configurável
  unitCost: number; // Custo unitário médio em R$
  location?: string; // Prateleira / Armário
  supplier?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// -------------------------------------------------------------
// STOCK ALERTS FOR ADMINS (Coleção: stock_alerts)
// -------------------------------------------------------------
export type StockAlertSeverity = 'critical' | 'warning';
export type StockAlertStatus = 'active' | 'resolved' | 'dismissed';

export interface StockAlert {
  id: string;
  tenantId: string;
  itemId: string;
  itemName: string;
  itemSku: string;
  category: InventoryCategory;
  currentQuantity: number;
  minStockLevel: number;
  severity: StockAlertSeverity;
  status: StockAlertStatus;
  triggeredAt: string;
  resolvedAt?: string;
  adminNotified: boolean;
  notifiedAt?: string;
  notes?: string;
}

// -------------------------------------------------------------
// STOCK MOVEMENTS (Entradas e Baixas para Recondicionamento)
// -------------------------------------------------------------
export type StockMovementType = 'entrada' | 'saida' | 'ajuste';

export interface StockMovement {
  id: string;
  tenantId: string;
  itemId: string;
  itemName: string;
  type: StockMovementType;
  quantity: number;
  unitCost: number;
  totalAmount: number;
  date: string;
  responsibleUser: string;
  vehicleId?: string;
  vehiclePlate?: string;
  createVehicleExpense?: boolean;
  notes?: string;
  createdAt: string;
}

// -------------------------------------------------------------
// SELLER PERFORMANCE ANALYSIS METRICS
// -------------------------------------------------------------
export interface SellerVehiclePerformance {
  saleId: string;
  vehicleId: string;
  plate?: string;
  vehiclePlate?: string;
  vehicleName: string;
  saleDate: string;
  salePrice: number;
  purchasePrice?: number;
  totalExpenses?: number;
  totalInvested?: number;
  commissionAmount: number;
  netProfit: number;
  roiPercentage: number;
  daysInYard: number;
  paymentMethod: PaymentMethod;
  customerName: string;
}

export interface SellerPerformanceSummary {
  sellerId: string;
  sellerName: string;
  sellerEmail?: string;
  avatarUrl?: string;
  totalVehiclesSold: number;
  totalRevenue: number;
  totalInvestedCapital: number;
  totalProfit: number;
  totalNetProfit: number;
  totalCommissions: number;
  averageNetProfit: number;
  averageNetProfitPerVehicle: number;
  averageRoi: number;
  averageDaysInYard: number;
  averageSalePrice: number;
  salesCountByPaymentMethod: Record<PaymentMethod, number>;
  sales: SellerVehiclePerformance[];
  vehicles: SellerVehiclePerformance[];
}

