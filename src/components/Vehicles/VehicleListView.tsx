import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Car, 
  Clock, 
  Wrench, 
  TrendingUp, 
  AlertTriangle, 
  DollarSign, 
  Eye, 
  BadgeCheck, 
  Trash2, 
  ChevronRight,
  Sparkles,
  Lock,
  Tag
} from 'lucide-react';
import { Vehicle, VehicleExpense, VehicleSale, VehicleStatus, VehicleDRE } from '../../types';
import { calculateVehicleDRE } from '../../services/dbService';
import { useAuthTenant } from '../../context/AuthTenantContext';

interface VehicleListViewProps {
  vehicles: Vehicle[];
  expenses: VehicleExpense[];
  sales: VehicleSale[];
  onSelectVehicle: (vehicle: Vehicle) => void;
  onOpenAddVehicle: () => void;
  onOpenAddExpense: (vehicle?: Vehicle) => void;
  onOpenSaleModal: (vehicle: Vehicle) => void;
  onDeleteVehicle: (vehicleId: string) => void;
}

export const VehicleListView: React.FC<VehicleListViewProps> = ({
  vehicles,
  expenses,
  sales,
  onSelectVehicle,
  onOpenAddVehicle,
  onOpenAddExpense,
  onOpenSaleModal,
  onDeleteVehicle,
}) => {
  const { user, isReadOnlyMode, openPaywallModal } = useAuthTenant();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Todos' | VehicleStatus>('Todos');
  const [turnaroundFilter, setTurnaroundFilter] = useState<'all' | 'over30' | 'over60'>('all');

  // Compute DRE for all vehicles
  const vehicleDREs: VehicleDRE[] = useMemo(() => {
    return vehicles.map((v) => {
      const vExpenses = expenses.filter((e) => e.vehicleId === v.id);
      const vSale = sales.find((s) => s.vehicleId === v.id);
      return calculateVehicleDRE(v, vExpenses, vSale);
    });
  }, [vehicles, expenses, sales]);

  // Filtered list
  const filteredDREs = useMemo(() => {
    return vehicleDREs.filter((item) => {
      const v = item.vehicle;
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        v.plate.toLowerCase().includes(term) ||
        v.brand.toLowerCase().includes(term) ||
        v.model.toLowerCase().includes(term) ||
        v.chassis.toLowerCase().includes(term);

      const matchesStatus = statusFilter === 'Todos' || v.status === statusFilter;

      let matchesTurnaround = true;
      if (turnaroundFilter === 'over30') {
        matchesTurnaround = item.daysInYard >= 30 && item.daysInYard < 60 && v.status !== 'Vendido';
      } else if (turnaroundFilter === 'over60') {
        matchesTurnaround = item.daysInYard >= 60 && v.status !== 'Vendido';
      }

      return matchesSearch && matchesStatus && matchesTurnaround;
    });
  }, [vehicleDREs, searchTerm, statusFilter, turnaroundFilter]);

  const fmt = (v: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(v || 0);
  };

  const canMutate = !isReadOnlyMode && (user.role === 'Admin' || user.role === 'Comprador');
  const canSell = !isReadOnlyMode && (user.role === 'Admin' || user.role === 'Vendedor');
  const canAddExpense = !isReadOnlyMode && (user.role === 'Admin' || user.role === 'Financeiro' || user.role === 'Comprador');

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">Estoque de Veículos & DRE por Chassi</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              {filteredDREs.length} de {vehicles.length} veículos
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Apuração temporal calculada pela <strong>Data de Entrada Real no Pátio</strong> com <strong>FIPE Congelada</strong>.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            id="btn-add-expense-quick"
            onClick={() => {
              if (isReadOnlyMode) openPaywallModal();
              else onOpenAddExpense();
            }}
            className="px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold transition flex items-center space-x-1.5 shadow-xs"
          >
            <Wrench className="w-3.5 h-3.5 text-amber-600" />
            <span>Lançar Despesa</span>
          </button>

          <button
            id="btn-add-vehicle-main"
            onClick={() => {
              if (isReadOnlyMode) openPaywallModal();
              else onOpenAddVehicle();
            }}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Veículo (Placa)</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 p-3.5 sm:p-4 rounded-xl space-y-3 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              id="vehicle-search-input"
              type="text"
              placeholder="Buscar por placa, modelo, marca ou chassi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 sm:py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm sm:text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
            />
          </div>

          {/* Filter Pills with Horizontal Scroll on Mobile */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {/* Status Buttons */}
            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs shrink-0">
              {(['Todos', 'Disponível', 'Em Operação', 'Vendido'] as const).map((status) => (
                <button
                  key={status}
                  id={`filter-status-${status.toLowerCase().replace(' ', '-')}`}
                  onClick={() => setStatusFilter(status)}
                  className={`px-2.5 sm:px-3 py-1 rounded-md font-medium transition whitespace-nowrap min-h-[32px] ${
                    statusFilter === status
                      ? 'bg-white text-slate-900 font-bold shadow-xs border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* Turnaround Alert Filter */}
            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs shrink-0">
              <button
                onClick={() => setTurnaroundFilter('all')}
                className={`px-2.5 py-1 rounded-md font-medium transition whitespace-nowrap min-h-[32px] ${
                  turnaroundFilter === 'all'
                    ? 'bg-white text-slate-900 font-bold shadow-xs border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Giro Normal
              </button>
              <button
                onClick={() => setTurnaroundFilter('over30')}
                className={`px-2.5 py-1 rounded-md font-semibold flex items-center space-x-1 transition whitespace-nowrap min-h-[32px] ${
                  turnaroundFilter === 'over30'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-amber-700 hover:bg-amber-100/50'
                }`}
              >
                <Clock className="w-3 h-3" />
                <span>&gt;30d</span>
              </button>
              <button
                onClick={() => setTurnaroundFilter('over60')}
                className={`px-2.5 py-1 rounded-md font-semibold flex items-center space-x-1 transition whitespace-nowrap min-h-[32px] ${
                  turnaroundFilter === 'over60'
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'text-rose-700 hover:bg-rose-100/50'
                }`}
              >
                <AlertTriangle className="w-3 h-3" />
                <span>&gt;60d</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Mobile Card View (< lg screens: iPhones, smartphones, tablets) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 lg:hidden">
        {filteredDREs.length === 0 ? (
          <div className="col-span-full bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-400">
            <Car className="w-10 h-10 mx-auto mb-2 opacity-50 text-slate-300" />
            <p className="text-sm font-semibold text-slate-700">Nenhum veículo encontrado</p>
            <p className="text-xs text-slate-400 mt-0.5">Tente ajustar seus filtros de busca.</p>
          </div>
        ) : (
          filteredDREs.map((dre) => {
            const v = dre.vehicle;
            const isSold = v.status === 'Vendido';
            const isPrep = v.status === 'Em Operação';
            const isCritical60 = dre.daysInYard >= 60 && !isSold;
            const isWarning30 = dre.daysInYard >= 30 && dre.daysInYard < 60 && !isSold;

            return (
              <div
                key={v.id}
                onClick={() => onSelectVehicle(v)}
                className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:border-indigo-200 transition space-y-3 cursor-pointer"
              >
                {/* Card Top: Photo, Plate, Name, Status */}
                <div className="flex items-start gap-3">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200">
                    <img
                      src={v.photos[0] || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=200'}
                      alt={v.model}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-900 text-white tracking-wider">
                        {v.plate}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          isSold
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : isPrep
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        {v.status}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm truncate">
                      {v.brand} {v.model}
                    </h3>
                    <p className="text-[11px] text-slate-400 truncate">
                      {v.version} • {v.yearFab}/{v.yearModel}
                    </p>
                  </div>
                </div>

                {/* Turnaround Badge & FIPE Row */}
                <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl text-xs border border-slate-100">
                  <div className="flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[11px] text-slate-500">Pátio:</span>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                        isSold
                          ? 'bg-slate-100 text-slate-600 border-slate-200'
                          : isCritical60
                          ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                          : isWarning30
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      {dre.daysInYard} dias
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">FIPE Congelada</span>
                    <span className="font-bold text-indigo-600 text-xs">{fmt(v.fipeAtPurchase)}</span>
                  </div>
                </div>

                {/* Financial Summary Grid */}
                <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-slate-100">
                  <div className="bg-slate-50/70 p-2 rounded-lg">
                    <span className="text-[10px] text-slate-400 block uppercase">Compra</span>
                    <span className="text-xs font-bold text-slate-800">{fmt(v.purchasePrice)}</span>
                  </div>
                  <div className="bg-slate-50/70 p-2 rounded-lg">
                    <span className="text-[10px] text-slate-400 block uppercase">Despesas</span>
                    <span className="text-xs font-bold text-amber-600">{fmt(dre.totalExpenses)}</span>
                  </div>
                  <div className="bg-emerald-50/60 p-2 rounded-lg border border-emerald-100">
                    <span className="text-[10px] text-emerald-700 block uppercase font-bold">Lucro Est.</span>
                    <span className="text-xs font-bold text-emerald-700">{fmt(dre.estimatedOrRealProfit)}</span>
                  </div>
                </div>

                {/* Action Buttons for Mobile */}
                <div className="flex items-center gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => {
                      if (isReadOnlyMode) openPaywallModal();
                      else onOpenAddExpense(v);
                    }}
                    className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-amber-50 text-slate-700 hover:text-amber-800 border border-slate-200 text-xs font-bold transition flex items-center justify-center space-x-1 min-h-[40px]"
                  >
                    <Wrench className="w-3.5 h-3.5 text-amber-600" />
                    <span>Despesa</span>
                  </button>

                  {!isSold && (
                    <button
                      onClick={() => {
                        if (isReadOnlyMode) openPaywallModal();
                        else onOpenSaleModal(v);
                      }}
                      className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center justify-center space-x-1 min-h-[40px] shadow-xs"
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>Vender</span>
                    </button>
                  )}

                  <button
                    onClick={() => onSelectVehicle(v)}
                    className="px-3 py-2 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 text-xs font-bold transition flex items-center justify-center min-h-[40px]"
                    title="Ver DRE Completo"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Desktop Vehicles Table (hidden on mobile, visible on lg screens) */}
      <div className="hidden lg:block bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-slate-500 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Veículo / Placa</th>
                <th className="py-3.5 px-4">Data Entrada & Dias</th>
                <th className="py-3.5 px-4">FIPE Congelada</th>
                <th className="py-3.5 px-4">Preço Pago</th>
                <th className="py-3.5 px-4">Gastos Prep.</th>
                <th className="py-3.5 px-4">Custo Total</th>
                <th className="py-3.5 px-4">Lucro & ROI</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Ações DRE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDREs.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <Car className="w-8 h-8 mx-auto mb-2 opacity-50 text-slate-300" />
                    <p className="text-sm font-semibold text-slate-700">Nenhum veículo encontrado</p>
                    <p className="text-xs text-slate-400 mt-0.5">Tente ajustar seus filtros de busca.</p>
                  </td>
                </tr>
              ) : (
                filteredDREs.map((dre) => {
                  const v = dre.vehicle;
                  const isSold = v.status === 'Vendido';
                  const isPrep = v.status === 'Em Operação';
                  const isAvailable = v.status === 'Disponível';

                  // Turnaround indicators
                  const isCritical60 = dre.daysInYard >= 60 && !isSold;
                  const isWarning30 = dre.daysInYard >= 30 && dre.daysInYard < 60 && !isSold;

                  return (
                    <tr 
                      key={v.id} 
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => onSelectVehicle(v)}
                    >
                      
                      {/* Vehicle & Plate */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200">
                            <img
                              src={v.photos[0] || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=100'}
                              alt={v.model}
                              className="w-full h-full object-cover group-hover:scale-105 transition"
                            />
                          </div>
                          <div>
                            <div className="flex items-center space-x-1.5">
                              <span className="font-mono text-xs font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-900 text-white border border-slate-800">
                                {v.plate}
                              </span>
                              <span className="text-[11px] font-semibold text-slate-500">
                                {v.yearFab}/{v.yearModel}
                              </span>
                            </div>
                            <div className="font-bold text-slate-900 mt-0.5 truncate max-w-[160px]">
                              {v.brand} {v.model}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate max-w-[160px]">
                              {v.version}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Entry Date & Days in Yard (Golden Rule) */}
                      <td className="py-3.5 px-4">
                        <div className="text-slate-900 font-medium">{v.entryDate}</div>
                        <div className="mt-1">
                          <span
                            className={`inline-flex items-center space-x-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                              isSold
                                ? 'bg-slate-100 text-slate-600 border-slate-200'
                                : isCritical60
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : isWarning30
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}
                          >
                            <Clock className="w-3 h-3" />
                            <span>
                              {isSold ? `${dre.daysInYard}d (vendido)` : `${dre.daysInYard} dias`}
                            </span>
                          </span>
                        </div>
                      </td>

                      {/* FIPE Congelada */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-indigo-600">{fmt(v.fipeAtPurchase)}</div>
                        <div className="text-[10px] text-slate-400 flex items-center space-x-1">
                          <Lock className="w-2.5 h-2.5 text-slate-400" />
                          <span>FIPE Congelada</span>
                        </div>
                      </td>

                      {/* Purchase Price */}
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {fmt(v.purchasePrice)}
                      </td>

                      {/* Reconditioning Expenses */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`font-semibold ${
                            dre.totalExpenses > 0 ? 'text-amber-600' : 'text-slate-400'
                          }`}
                        >
                          {fmt(dre.totalExpenses)}
                        </span>
                        <div className="text-[10px] text-slate-400">
                          {dre.expenses.length} lançamentos
                        </div>
                      </td>

                      {/* Total Invested */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{fmt(dre.totalInvestedCost)}</div>
                        <div className="text-[10px] text-slate-400">Compra + Gastos</div>
                      </td>

                      {/* Profit & ROI */}
                      <td className="py-3.5 px-4">
                        <div
                          className={`font-bold ${
                            dre.estimatedOrRealProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {fmt(dre.estimatedOrRealProfit)}
                        </div>
                        <div className="text-[11px] font-semibold text-slate-500">
                          ROI: <strong className="text-emerald-600">{dre.estimatedOrRealRoi}%</strong>
                          {isSold && <span className="text-slate-400 ml-1">(Real)</span>}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                            isSold
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : isPrep
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {v.status}
                        </span>
                      </td>

                      {/* Action buttons */}
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end space-x-1.5">
                          
                          {/* Add Expense Shortcut */}
                          <button
                            id={`btn-table-exp-${v.id}`}
                            onClick={() => {
                              if (isReadOnlyMode) openPaywallModal();
                              else onOpenAddExpense(v);
                            }}
                            title="Lançar Despesa neste Chassi"
                            className="p-1.5 rounded-lg bg-slate-50 hover:bg-amber-50 text-slate-600 hover:text-amber-700 border border-slate-200 transition"
                          >
                            <Wrench className="w-3.5 h-3.5" />
                          </button>

                          {/* Record Sale Button */}
                          {!isSold && (
                            <button
                              id={`btn-table-sale-${v.id}`}
                              onClick={() => {
                                if (isReadOnlyMode) openPaywallModal();
                                else onOpenSaleModal(v);
                              }}
                              title="Registrar Venda do Veículo"
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 hover:border-emerald-600 text-[11px] font-bold transition flex items-center space-x-1 shadow-xs"
                            >
                              <DollarSign className="w-3 h-3" />
                              <span>Vender</span>
                            </button>
                          )}

                          {/* Open Full DRE Modal */}
                          <button
                            id={`btn-table-dre-${v.id}`}
                            onClick={() => onSelectVehicle(v)}
                            title="Abrir DRE Completo do Veículo"
                            className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 transition"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>

                          {/* Delete Vehicle (Admin only) */}
                          {user.role === 'Admin' && (
                            <button
                              id={`btn-table-del-${v.id}`}
                              onClick={() => {
                                if (isReadOnlyMode) {
                                  openPaywallModal();
                                } else if (confirm(`Deseja realmente remover o veículo ${v.plate} do estoque?`)) {
                                  onDeleteVehicle(v.id);
                                }
                              }}
                              title="Excluir Veículo"
                              className="p-1.5 rounded-lg bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}

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

    </div>
  );
};
