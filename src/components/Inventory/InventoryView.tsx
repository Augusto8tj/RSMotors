import React, { useState, useMemo } from 'react';
import { 
  Boxes, 
  AlertTriangle, 
  Plus, 
  ArrowDownRight, 
  ArrowUpRight, 
  SlidersHorizontal, 
  Search, 
  ShieldAlert, 
  CheckCircle2, 
  Bell, 
  History, 
  PackageCheck, 
  PackageX, 
  Car, 
  Wrench, 
  Sparkles, 
  Trash2, 
  Edit3, 
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Filter,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { 
  InventoryItem, 
  StockAlert, 
  StockMovement, 
  InventoryCategory, 
  Vehicle 
} from '../../types';
import { 
  addInventoryItem, 
  updateInventoryItem, 
  deleteInventoryItem, 
  recordStockMovement, 
  dismissStockAlert, 
  resolveStockAlert, 
  calculateInventoryKPIs,
  getStockAlertsByTenant,
  getStockMovementsByTenant
} from '../../services/dbService';
import { useAuthTenant } from '../../context/AuthTenantContext';

interface InventoryViewProps {
  items: InventoryItem[];
  alerts: StockAlert[];
  movements: StockMovement[];
  vehicles: Vehicle[];
  onRefreshData: () => void;
  onOpenVehicleDetail?: (vehicle: Vehicle) => void;
}

const CATEGORY_CONFIG: Record<InventoryCategory, { label: string; color: string; bg: string }> = {
  mecanica: { label: 'Mecânica & Filtros', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  funilaria: { label: 'Funilaria & Pintura', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  higienizacao: { label: 'Higienização & Oxi', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  detail: { label: 'Estética & Vitrificação', color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
  eletrica: { label: 'Elétrica & Iluminação', color: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-200' },
  pneus: { label: 'Pneus & Rodas', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200' },
  acessorios: { label: 'Acessórios', color: 'text-cyan-700', bg: 'bg-cyan-50 border-cyan-200' },
  outros: { label: 'Outros Suprimentos', color: 'text-slate-700', bg: 'bg-slate-50 border-slate-200' },
};

export const InventoryView: React.FC<InventoryViewProps> = ({
  items,
  alerts,
  movements,
  vehicles,
  onRefreshData,
  onOpenVehicleDetail,
}) => {
  const { tenant, user, isReadOnlyMode, openPaywallModal } = useAuthTenant();

  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [stockStatusFilter, setStockStatusFilter] = useState<'all' | 'alert' | 'out_of_stock' | 'safe'>('all');
  const [activeTab, setActiveTab] = useState<'items' | 'alerts' | 'history'>('items');

  // Modals
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [movementModalItem, setMovementModalItem] = useState<InventoryItem | null>(null);
  const [movementType, setMovementType] = useState<'entrada' | 'saida'>('saida');

  // Movement Form States
  const [movementQuantity, setMovementQuantity] = useState<number>(1);
  const [movementDate, setMovementDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [movementVehicleId, setMovementVehicleId] = useState<string>('');
  const [movementCreateExpense, setMovementCreateExpense] = useState<boolean>(true);
  const [movementNotes, setMovementNotes] = useState<string>('');
  const [customUnitCost, setCustomUnitCost] = useState<string>('');

  // New/Edit Item Form States
  const [formName, setFormName] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formCategory, setFormCategory] = useState<InventoryCategory>('mecanica');
  const [formUnit, setFormUnit] = useState('un');
  const [formQuantity, setFormQuantity] = useState<number>(0);
  const [formMinStock, setFormMinStock] = useState<number>(5);
  const [formUnitCost, setFormUnitCost] = useState<number>(0);
  const [formLocation, setFormLocation] = useState('');
  const [formSupplier, setFormSupplier] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // KPIs
  const kpis = useMemo(() => {
    return calculateInventoryKPIs(tenant.id);
  }, [tenant.id, items, alerts]);

  // Active Alerts
  const activeAlerts = useMemo(() => {
    return alerts.filter((a) => a.status === 'active');
  }, [alerts]);

  // Filtered Items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.supplier && item.supplier.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.location && item.location.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;

      let matchesStockStatus = true;
      if (stockStatusFilter === 'alert') {
        matchesStockStatus = item.quantity <= item.minStockLevel;
      } else if (stockStatusFilter === 'out_of_stock') {
        matchesStockStatus = item.quantity <= 0;
      } else if (stockStatusFilter === 'safe') {
        matchesStockStatus = item.quantity > item.minStockLevel;
      }

      return matchesSearch && matchesCategory && matchesStockStatus;
    });
  }, [items, searchTerm, selectedCategory, stockStatusFilter]);

  // Open Edit Modal
  const handleOpenEdit = (item: InventoryItem) => {
    if (isReadOnlyMode) {
      openPaywallModal();
      return;
    }
    setEditingItem(item);
    setFormName(item.name);
    setFormSku(item.sku);
    setFormCategory(item.category);
    setFormUnit(item.unit);
    setFormQuantity(item.quantity);
    setFormMinStock(item.minStockLevel);
    setFormUnitCost(item.unitCost);
    setFormLocation(item.location || '');
    setFormSupplier(item.supplier || '');
    setFormNotes(item.notes || '');
    setIsAddItemModalOpen(true);
  };

  // Open New Item Modal
  const handleOpenNew = () => {
    if (isReadOnlyMode) {
      openPaywallModal();
      return;
    }
    setEditingItem(null);
    setFormName('');
    setFormSku(`SKU-${Math.random().toString(36).substring(2, 7).toUpperCase()}`);
    setFormCategory('mecanica');
    setFormUnit('un');
    setFormQuantity(10);
    setFormMinStock(3);
    setFormUnitCost(50);
    setFormLocation('Armário Principal');
    setFormSupplier('');
    setFormNotes('');
    setIsAddItemModalOpen(true);
  };

  // Save Item (Create or Update)
  const handleSaveItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (editingItem) {
      updateInventoryItem(editingItem.id, {
        name: formName,
        sku: formSku,
        category: formCategory,
        unit: formUnit,
        quantity: Number(formQuantity),
        minStockLevel: Number(formMinStock),
        unitCost: Number(formUnitCost),
        location: formLocation,
        supplier: formSupplier,
        notes: formNotes,
      });
    } else {
      addInventoryItem({
        tenantId: tenant.id,
        name: formName,
        sku: formSku,
        category: formCategory,
        unit: formUnit,
        quantity: Number(formQuantity),
        minStockLevel: Number(formMinStock),
        unitCost: Number(formUnitCost),
        location: formLocation,
        supplier: formSupplier,
        notes: formNotes,
      });
    }

    setIsAddItemModalOpen(false);
    setEditingItem(null);
    onRefreshData();
  };

  // Open Movement Modal
  const handleOpenMovement = (item: InventoryItem, type: 'entrada' | 'saida') => {
    if (isReadOnlyMode) {
      openPaywallModal();
      return;
    }
    setMovementModalItem(item);
    setMovementType(type);
    setMovementQuantity(1);
    setMovementDate(new Date().toISOString().split('T')[0]);
    setMovementVehicleId('');
    setMovementCreateExpense(true);
    setMovementNotes('');
    setCustomUnitCost(item.unitCost.toString());
  };

  // Submit Movement
  const handleMovementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!movementModalItem || movementQuantity <= 0) return;

    const selectedVehicle = vehicles.find((v) => v.id === movementVehicleId);

    recordStockMovement({
      tenantId: tenant.id,
      itemId: movementModalItem.id,
      type: movementType,
      quantity: Number(movementQuantity),
      unitCost: customUnitCost ? Number(customUnitCost) : movementModalItem.unitCost,
      date: movementDate,
      responsibleUser: user.name,
      vehicleId: movementVehicleId || undefined,
      vehiclePlate: selectedVehicle?.plate,
      createVehicleExpense: movementType === 'saida' ? movementCreateExpense : false,
      notes: movementNotes,
    });

    setMovementModalItem(null);
    onRefreshData();
  };

  // Quick Dismiss / Resolve Alert
  const handleDismissAlert = (alertId: string) => {
    dismissStockAlert(alertId);
    onRefreshData();
  };

  const handleResolveAlert = (alertId: string) => {
    resolveStockAlert(alertId);
    onRefreshData();
  };

  const handleDeleteItem = (item: InventoryItem) => {
    if (isReadOnlyMode) {
      openPaywallModal();
      return;
    }
    if (window.confirm(`Tem certeza que deseja excluir "${item.name}" do almoxarifado?`)) {
      deleteInventoryItem(item.id);
      onRefreshData();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Almoxarifado & Alertas de Estoque
              </h1>
              <p className="text-xs text-slate-500">
                Gestão de peças, insumos de recondicionamento e alertas automáticos de reposição
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-inventory-new-item"
            onClick={handleOpenNew}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-3.5 py-2 rounded-lg text-xs shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Peça / Insumo</span>
          </button>
        </div>
      </div>

      {/* Admin Notification Banner for Active Low Stock Alerts */}
      {activeAlerts.length > 0 && (
        <div id="stock-alerts-banner" className="bg-amber-50 border border-amber-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-100 text-amber-800 rounded-lg mt-0.5 flex-shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-amber-950">
                    {activeAlerts.length} {activeAlerts.length === 1 ? 'Alerta Ativo de Estoque Mínimo' : 'Alertas Ativos de Estoque Mínimo'}
                  </h3>
                  <span className="bg-amber-200/80 text-amber-900 font-bold text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Notificação aos Administradores
                  </span>
                </div>
                <p className="text-xs text-amber-900 mt-1 leading-relaxed">
                  Os seguintes itens atingiram ou estão abaixo do nível mínimo de segurança cadastrado. Providencie a reposição para evitar paralisação nos processos de funilaria, mecânica e estética.
                </p>

                {/* List of active alert items */}
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {activeAlerts.map((alert) => (
                    <div 
                      key={alert.id} 
                      className={`p-2.5 rounded-lg border text-xs flex flex-col justify-between ${
                        alert.severity === 'critical'
                          ? 'bg-rose-50 border-rose-200 text-rose-950'
                          : 'bg-white border-amber-200 text-amber-950 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5 font-bold">
                            {alert.severity === 'critical' && (
                              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                            )}
                            <span className="truncate">{alert.itemName}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Saldo: <strong className={alert.currentQuantity === 0 ? 'text-rose-600 font-extrabold' : 'text-amber-700'}>
                              {alert.currentQuantity}
                            </strong> / Mínimo: <strong>{alert.minStockLevel}</strong>
                          </p>
                        </div>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          alert.severity === 'critical' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {alert.severity === 'critical' ? 'Esgotado' : 'Repor'}
                        </span>
                      </div>

                      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                        <button
                          onClick={() => {
                            const found = items.find((i) => i.id === alert.itemId);
                            if (found) handleOpenMovement(found, 'entrada');
                          }}
                          className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                        >
                          <ArrowDownRight className="w-3.5 h-3.5" />
                          <span>Dar Entrada</span>
                        </button>

                        <button
                          onClick={() => handleDismissAlert(alert.id)}
                          className="text-[11px] text-slate-400 hover:text-slate-600"
                        >
                          Ocultar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Items */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Itens Cadastrados</span>
            <div className="p-1.5 bg-slate-100 text-slate-600 rounded-md">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">
            {kpis.totalItemsCount}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {kpis.totalStockUnits} unidades físicas em saldo
          </p>
        </div>

        {/* Total Valuation */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Valor em Estoque</span>
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-md">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">
            R$ {kpis.totalInventoryValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Custo total de reposição acumulado
          </p>
        </div>

        {/* Low Stock Items */}
        <div className={`rounded-xl p-4 border shadow-2xs ${
          kpis.lowStockCount > 0 ? 'bg-amber-50/70 border-amber-200' : 'bg-white border-slate-200/80'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">Abaixo do Mínimo</span>
            <div className="p-1.5 bg-amber-100 text-amber-700 rounded-md">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-900 font-mono">
            {kpis.lowStockCount}
          </div>
          <p className="text-[11px] text-amber-700 mt-1">
            {kpis.lowStockCount === 0 ? 'Todos itens com estoque seguro' : 'Itens necessitam pedido de compra'}
          </p>
        </div>

        {/* Out of Stock Items */}
        <div className={`rounded-xl p-4 border shadow-2xs ${
          kpis.outOfStockCount > 0 ? 'bg-rose-50/70 border-rose-200' : 'bg-white border-slate-200/80'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-rose-800 uppercase tracking-wider">Itens Esgotados</span>
            <div className="p-1.5 bg-rose-100 text-rose-700 rounded-md">
              <PackageX className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-rose-900 font-mono">
            {kpis.outOfStockCount}
          </div>
          <p className="text-[11px] text-rose-700 mt-1">
            {kpis.outOfStockCount === 0 ? 'Nenhum insumo zerado' : 'Estoque esgotado (saldo 0)'}
          </p>
        </div>
      </div>

      {/* Main Tab Navigation & Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="border-b border-slate-200 px-4 pt-3 flex flex-wrap items-center justify-between gap-4">
          {/* Sub-tabs */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('items')}
              className={`px-3 py-2 text-xs font-bold rounded-t-lg border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'items'
                  ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Boxes className="w-4 h-4" />
              <span>Peças & Suprimentos ({items.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('alerts')}
              className={`px-3 py-2 text-xs font-bold rounded-t-lg border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'alerts'
                  ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>Painel de Alertas ({activeAlerts.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-2 text-xs font-bold rounded-t-lg border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'history'
                  ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Histórico de Movimentações ({movements.length})</span>
            </button>
          </div>

          {/* Quick Stats Pill */}
          <div className="text-[11px] text-slate-500 py-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Coleções: <strong>inventory_items</strong> e <strong>stock_alerts</strong></span>
          </div>
        </div>

        {/* Tab 1: Inventory Items Table */}
        {activeTab === 'items' && (
          <div>
            {/* Filter Bar */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex flex-1 items-center gap-2 max-w-md">
                <div className="relative w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por nome, SKU, fornecedor ou armário..."
                    className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Category selector */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-white border border-slate-200 text-xs rounded-lg px-2.5 py-1.5 text-slate-700 focus:ring-1 focus:ring-indigo-500 focus:outline-none font-medium"
                >
                  <option value="all">Todas as Categorias</option>
                  {Object.entries(CATEGORY_CONFIG).map(([key, cat]) => (
                    <option key={key} value={key}>{cat.label}</option>
                  ))}
                </select>

                {/* Stock status filter */}
                <select
                  value={stockStatusFilter}
                  onChange={(e) => setStockStatusFilter(e.target.value as any)}
                  className="bg-white border border-slate-200 text-xs rounded-lg px-2.5 py-1.5 text-slate-700 focus:ring-1 focus:ring-indigo-500 focus:outline-none font-medium"
                >
                  <option value="all">Status: Todos</option>
                  <option value="alert">⚠️ Abaixo do Mínimo</option>
                  <option value="out_of_stock">🚫 Zerado (Esgotado)</option>
                  <option value="safe">✅ Estoque Saudável</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Peça / Insumo</th>
                    <th className="px-4 py-3">Categoria</th>
                    <th className="px-4 py-3 text-center">Saldo Atual</th>
                    <th className="px-4 py-3 text-center">Estoque Mínimo</th>
                    <th className="px-4 py-3">Custo Unitário</th>
                    <th className="px-4 py-3">Valor Total</th>
                    <th className="px-4 py-3">Localização</th>
                    <th className="px-4 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-slate-400">
                        <Boxes className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        <p className="font-medium text-slate-600">Nenhum item encontrado no almoxarifado</p>
                        <p className="text-xs text-slate-400 mt-1">Ajuste os filtros ou cadastre um novo insumo.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((item) => {
                      const isLowStock = item.quantity <= item.minStockLevel && item.quantity > 0;
                      const isOutOfStock = item.quantity <= 0;
                      const categoryInfo = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.outros;

                      return (
                        <tr 
                          key={item.id} 
                          className={`hover:bg-slate-50/80 transition-colors ${
                            isOutOfStock ? 'bg-rose-50/30' : isLowStock ? 'bg-amber-50/20' : ''
                          }`}
                        >
                          {/* Item Name & SKU */}
                          <td className="px-4 py-3">
                            <div className="font-bold text-slate-900">{item.name}</div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded">
                                {item.sku}
                              </span>
                              {item.supplier && (
                                <span className="text-[11px] text-slate-400 truncate max-w-[160px]">
                                  {item.supplier}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Category */}
                          <td className="px-4 py-3">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${categoryInfo.bg} ${categoryInfo.color}`}>
                              {categoryInfo.label}
                            </span>
                          </td>

                          {/* Quantity and Safety Badge */}
                          <td className="px-4 py-3 text-center">
                            <div className="inline-flex flex-col items-center">
                              <span className={`font-mono font-extrabold text-sm ${
                                isOutOfStock
                                  ? 'text-rose-600'
                                  : isLowStock
                                  ? 'text-amber-600'
                                  : 'text-slate-800'
                              }`}>
                                {item.quantity} {item.unit}
                              </span>
                              
                              {isOutOfStock ? (
                                <span className="text-[9px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.2 rounded mt-0.5">
                                  ZERADO
                                </span>
                              ) : isLowStock ? (
                                <span className="text-[9px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded mt-0.5">
                                  BAIXO
                                </span>
                              ) : (
                                <span className="text-[9px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded mt-0.5">
                                  OK
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Min Stock Level */}
                          <td className="px-4 py-3 text-center font-mono text-xs text-slate-600">
                            <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded font-bold">
                              {item.minStockLevel} {item.unit}
                            </span>
                          </td>

                          {/* Unit Cost */}
                          <td className="px-4 py-3 font-mono font-medium text-slate-700">
                            R$ {item.unitCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>

                          {/* Total Value */}
                          <td className="px-4 py-3 font-mono font-bold text-slate-900">
                            R$ {(item.quantity * item.unitCost).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>

                          {/* Location */}
                          <td className="px-4 py-3 text-slate-500 text-xs">
                            {item.location || '---'}
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {/* Give Output / Application */}
                              <button
                                title="Dar Baixa / Aplicar em Veículo"
                                onClick={() => handleOpenMovement(item, 'saida')}
                                className="p-1.5 text-amber-700 hover:bg-amber-50 rounded-md border border-amber-200 transition-colors"
                              >
                                <ArrowUpRight className="w-3.5 h-3.5" />
                              </button>

                              {/* Give Input / Buy */}
                              <button
                                title="Dar Entrada de Estoque (Compra)"
                                onClick={() => handleOpenMovement(item, 'entrada')}
                                className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-md border border-emerald-200 transition-colors"
                              >
                                <ArrowDownRight className="w-3.5 h-3.5" />
                              </button>

                              {/* Edit */}
                              <button
                                title="Editar Configurações de Estoque Mínimo"
                                onClick={() => handleOpenEdit(item)}
                                className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete */}
                              <button
                                title="Excluir Item"
                                onClick={() => handleDeleteItem(item)}
                                className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-md transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Stock Alerts Panel */}
        {activeTab === 'alerts' && (
          <div className="p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Regras de Alerta & Notificações de Estoque
                </h3>
                <p className="text-xs text-slate-500">
                  Monitoramento em tempo real dos itens que atingiram os limites mínimos de segurança
                </p>
              </div>
            </div>

            {alerts.length === 0 ? (
              <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
                <p className="font-bold text-slate-700">Nenhum alerta gerado</p>
                <p className="text-xs text-slate-400">Todos os insumos estão acima dos níveis mínimos cadastrados.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-xl border transition-all ${
                      alert.status === 'active'
                        ? alert.severity === 'critical'
                          ? 'bg-rose-50/70 border-rose-200 shadow-2xs'
                          : 'bg-amber-50/70 border-amber-200 shadow-2xs'
                        : 'bg-slate-50/60 border-slate-200 opacity-70'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                          alert.severity === 'critical' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-slate-900 text-sm">{alert.itemName}</h4>
                            <span className="font-mono text-[10px] bg-white text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                              {alert.itemSku}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              alert.severity === 'critical' ? 'bg-rose-600 text-white' : 'bg-amber-600 text-white'
                            }`}>
                              {alert.severity === 'critical' ? 'ESTOQUE ZERADO' : 'ESTOQUE BAIXO'}
                            </span>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                              alert.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                            }`}>
                              {alert.status === 'active' ? 'Status: Pendente' : alert.status === 'resolved' ? 'Resolvido' : 'Ignorado'}
                            </span>
                          </div>

                          <p className="text-xs text-slate-600 mt-1">
                            {alert.notes}
                          </p>

                          <div className="flex items-center gap-4 mt-2 text-[11px] text-slate-500">
                            <span>Quantidade Atual: <strong className="text-slate-900">{alert.currentQuantity}</strong></span>
                            <span>Nível Mínimo Configurado: <strong className="text-slate-900">{alert.minStockLevel}</strong></span>
                            <span>Data do Disparo: {new Date(alert.triggeredAt).toLocaleDateString('pt-BR')}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        {alert.status === 'active' && (
                          <>
                            <button
                              onClick={() => {
                                const item = items.find((i) => i.id === alert.itemId);
                                if (item) handleOpenMovement(item, 'entrada');
                              }}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-1"
                            >
                              <ArrowDownRight className="w-3.5 h-3.5" />
                              <span>Repor Estoque</span>
                            </button>

                            <button
                              onClick={() => handleResolveAlert(alert.id)}
                              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold px-3 py-1.5 rounded-lg text-xs border border-emerald-200 transition-colors"
                            >
                              Marcar Resolvido
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Movement History */}
        {activeTab === 'history' && (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Data</th>
                    <th className="px-4 py-3">Tipo</th>
                    <th className="px-4 py-3">Peça / Insumo</th>
                    <th className="px-4 py-3 text-center">Quantidade</th>
                    <th className="px-4 py-3">Custo Unitário</th>
                    <th className="px-4 py-3">Valor Total</th>
                    <th className="px-4 py-3">Veículo Vinculado</th>
                    <th className="px-4 py-3">Responsável</th>
                    <th className="px-4 py-3">Observações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {movements.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-10 text-slate-400">
                        Nenhuma movimentação de estoque registrada até o momento.
                      </td>
                    </tr>
                  ) : (
                    movements.map((mov) => (
                      <tr key={mov.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3 font-mono text-slate-500 whitespace-nowrap">
                          {new Date(mov.date).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                            mov.type === 'entrada'
                              ? 'bg-emerald-100 text-emerald-800'
                              : mov.type === 'saida'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {mov.type === 'entrada' ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                            {mov.type === 'entrada' ? 'Entrada' : mov.type === 'saida' ? 'Saída' : 'Ajuste'}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-900">
                          {mov.itemName}
                        </td>
                        <td className="px-4 py-3 text-center font-mono font-bold text-slate-800">
                          {mov.quantity}
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-600">
                          R$ {mov.unitCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-slate-900">
                          R$ {mov.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3">
                          {mov.vehiclePlate ? (
                            <span className="font-mono text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-1.5 py-0.5 rounded font-bold">
                              {mov.vehiclePlate}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs">Geral / Reposição</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {mov.responsibleUser}
                        </td>
                        <td className="px-4 py-3 text-slate-400 text-xs truncate max-w-xs">
                          {mov.notes || '---'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: Cadastrar / Editar Peça e Configurar Nível Mínimo */}
      {isAddItemModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <Boxes className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {editingItem ? 'Editar Insumo & Nível Mínimo' : 'Cadastrar Peça / Insumo no Almoxarifado'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Defina a quantidade inicial e o limite para disparo de alerta aos administradores
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddItemModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveItemSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nome da Peça / Insumo *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Ex: Óleo Sintético 5W30, Pastilha de Freio..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Código SKU / Referência
                  </label>
                  <input
                    type="text"
                    value={formSku}
                    onChange={(e) => setFormSku(e.target.value)}
                    placeholder="Ex: OLE-5W30"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Categoria *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  >
                    {Object.entries(CATEGORY_CONFIG).map(([key, cat]) => (
                      <option key={key} value={key}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Unidade de Medida
                  </label>
                  <select
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="un">un (Unidades)</option>
                    <option value="litros">litros (L)</option>
                    <option value="jogo">jogo (Jogos/Kits)</option>
                    <option value="par">par (Pares)</option>
                    <option value="kg">kg (Quilogramas)</option>
                    <option value="kit">kit (Kits)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Custo Unitário Médio (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formUnitCost}
                    onChange={(e) => setFormUnitCost(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Stock Levels & Alert Threshold Box */}
              <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-bold text-indigo-950">
                    Configuração de Nível Mínimo e Alerta de Reposição
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Saldo em Estoque Atual
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formQuantity}
                      onChange={(e) => setFormQuantity(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Estoque Mínimo (Gatilho de Alerta) *
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={formMinStock}
                      onChange={(e) => setFormMinStock(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg text-xs font-mono font-bold text-amber-900 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 leading-normal">
                  💡 Quando o saldo for ≤ <strong className="text-amber-800">{formMinStock} {formUnit}</strong>, o sistema criará um alerta na coleção <strong>stock_alerts</strong> e exibirá o aviso no topo do painel.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Localização no Pátio / Almoxarifado
                  </label>
                  <input
                    type="text"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder="Ex: Armário A - Prateleira 2"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Fornecedor Principal
                  </label>
                  <input
                    type="text"
                    value={formSupplier}
                    onChange={(e) => setFormSupplier(e.target.value)}
                    placeholder="Ex: Distribuidora Auto Peças SP"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Observações Técnicas
                </label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Compatibilidade com motores, especificações de torque, etc..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddItemModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-xs transition-colors"
                >
                  {editingItem ? 'Salvar Alterações' : 'Cadastrar Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Movimentação de Estoque (Entrada ou Saída / Aplicação em Veículo) */}
      {movementModalItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${
                  movementType === 'entrada' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                }`}>
                  {movementType === 'entrada' ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {movementType === 'entrada' ? 'Entrada / Compra de Estoque' : 'Baixa de Estoque / Aplicação em Veículo'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Item: <strong>{movementModalItem.name}</strong> (Saldo Atual: {movementModalItem.quantity} {movementModalItem.unit})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setMovementModalItem(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleMovementSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tipo de Movimento
                  </label>
                  <div className="flex rounded-lg bg-slate-100 p-1">
                    <button
                      type="button"
                      onClick={() => setMovementType('saida')}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${
                        movementType === 'saida' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      Saída / Uso
                    </button>
                    <button
                      type="button"
                      onClick={() => setMovementType('entrada')}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${
                        movementType === 'entrada' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      Entrada
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Data da Movimentação *
                  </label>
                  <input
                    type="date"
                    required
                    value={movementDate}
                    onChange={(e) => setMovementDate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Quantidade ({movementModalItem.unit}) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={movementQuantity}
                    onChange={(e) => setMovementQuantity(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Custo Unitário (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={customUnitCost}
                    onChange={(e) => setCustomUnitCost(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Total Calculation Preview */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <span className="text-xs text-slate-600 font-medium">Valor Total da Movimentação:</span>
                <span className="font-mono font-bold text-sm text-slate-900">
                  R$ {(movementQuantity * (customUnitCost ? parseFloat(customUnitCost) || 0 : movementModalItem.unitCost)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* If Saída: Option to link with vehicle in fleet */}
              {movementType === 'saida' && (
                <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-3.5 space-y-2">
                  <label className="block text-xs font-bold text-amber-950">
                    Vincular a Veículo em Estoque (DRE Automático)
                  </label>
                  <select
                    value={movementVehicleId}
                    onChange={(e) => setMovementVehicleId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="">Nenhum (Uso geral na oficina / Sem vínculo)</option>
                    {vehicles
                      .filter((v) => v.status !== 'Vendido')
                      .map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.plate} - {v.brand} {v.model} ({v.status})
                        </option>
                      ))}
                  </select>

                  {movementVehicleId && (
                    <label className="flex items-center gap-2 pt-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={movementCreateExpense}
                        onChange={(e) => setMovementCreateExpense(e.target.checked)}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-xs text-amber-900 font-medium">
                        Lançar despesa de recondicionamento no DRE por chassi deste veículo
                      </span>
                    </label>
                  )}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Observações do Lançamento
                </label>
                <input
                  type="text"
                  value={movementNotes}
                  onChange={(e) => setMovementNotes(e.target.value)}
                  placeholder="Ex: Troca preventiva, reparo pré-entrega..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setMovementModalItem(null)}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 text-xs font-bold rounded-lg text-white shadow-xs transition-colors ${
                    movementType === 'entrada' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-amber-600 hover:bg-amber-700'
                  }`}
                >
                  Confirmar {movementType === 'entrada' ? 'Entrada' : 'Baixa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
