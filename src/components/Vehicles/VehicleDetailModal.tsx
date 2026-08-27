import React, { useMemo } from 'react';
import { 
  X, 
  Car, 
  Clock, 
  ShieldCheck, 
  Wrench, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  Plus, 
  Trash2, 
  Calendar, 
  User, 
  Tag, 
  Lock, 
  CheckCircle2,
  Receipt
} from 'lucide-react';
import { Vehicle, VehicleExpense, VehicleSale, VehicleDRE } from '../../types';
import { calculateVehicleDRE } from '../../services/dbService';
import { useAuthTenant } from '../../context/AuthTenantContext';

interface VehicleDetailModalProps {
  vehicle: Vehicle | null;
  expenses: VehicleExpense[];
  sales: VehicleSale[];
  onClose: () => void;
  onOpenAddExpense: (vehicle: Vehicle) => void;
  onOpenSaleModal: (vehicle: Vehicle) => void;
  onDeleteExpense: (expenseId: string) => void;
}

export const VehicleDetailModal: React.FC<VehicleDetailModalProps> = ({
  vehicle,
  expenses,
  sales,
  onClose,
  onOpenAddExpense,
  onOpenSaleModal,
  onDeleteExpense,
}) => {
  const { user, isReadOnlyMode, openPaywallModal } = useAuthTenant();

  if (!vehicle) return null;

  const vehicleExpenses = expenses.filter((e) => e.vehicleId === vehicle.id);
  const vehicleSale = sales.find((s) => s.vehicleId === vehicle.id);

  const dre: VehicleDRE = useMemo(() => {
    return calculateVehicleDRE(vehicle, vehicleExpenses, vehicleSale);
  }, [vehicle, vehicleExpenses, vehicleSale]);

  const fmt = (v: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(v || 0);
  };

  const isSold = vehicle.status === 'Vendido';
  const isCritical60 = dre.daysInYard >= 60 && !isSold;
  const isWarning30 = dre.daysInYard >= 30 && dre.daysInYard < 60 && !isSold;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white border border-slate-200 w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden text-slate-900 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-slate-50 p-5 border-b border-slate-200 flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
              <img
                src={vehicle.photos[0] || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=200'}
                alt={vehicle.model}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-bold tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-300">
                  {vehicle.plate}
                </span>
                <span
                  className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                    isSold
                      ? 'bg-purple-50 text-purple-700 border-purple-200'
                      : vehicle.status === 'Em Operação'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                >
                  {vehicle.status}
                </span>
                {isSold && (
                  <span className="text-xs font-semibold text-emerald-600 flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Venda Concluída</span>
                  </span>
                )}
              </div>

              <h2 className="text-base font-bold text-slate-900 mt-1">
                {vehicle.brand} {vehicle.model} <span className="text-slate-500 font-normal">{vehicle.version}</span>
              </h2>
              <p className="text-xs text-slate-500">
                Ano: {vehicle.yearFab}/{vehicle.yearModel} • Chassi: <span className="font-mono">{vehicle.chassis}</span> • Cor: {vehicle.color} • Km: {vehicle.mileage.toLocaleString('pt-BR')} km
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {!isSold && (
              <button
                id="modal-btn-sell"
                onClick={() => {
                  if (isReadOnlyMode) openPaywallModal();
                  else onOpenSaleModal(vehicle);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition flex items-center space-x-1"
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Registrar Venda</span>
              </button>
            )}

            <button
              id="close-vehicle-detail-modal-btn"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Regra de Ouro Temporal & Dias de Pátio */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-lg bg-white text-indigo-600 border border-slate-200 shadow-xs">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Regra de Ouro Temporal
                </span>
                <div className="text-xs text-slate-700 mt-0.5">
                  Entrada Real no Pátio: <strong>{vehicle.entryDate}</strong>
                  {vehicleSale && <> • Vendido em: <strong>{vehicleSale.saleDate}</strong></>}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span
                className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center space-x-1.5 ${
                  isSold
                    ? 'bg-slate-100 text-slate-700 border border-slate-200'
                    : isCritical60
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : isWarning30
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>{dre.daysInYard} DIAS NO PÁTIO</span>
              </span>
              {isCritical60 && (
                <span className="text-[11px] font-bold text-rose-600 flex items-center space-x-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Alerta Crítico &gt;60d</span>
                </span>
              )}
            </div>
          </div>

          {/* DRE Cards Grid */}
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Demonstrativo de Resultado do Exercício (DRE por Chassi)
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              
              {/* Preço de Compra */}
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                <span className="text-xs text-slate-500">Preço de Compra:</span>
                <div className="text-lg font-bold text-slate-900 mt-1">{fmt(vehicle.purchasePrice)}</div>
                <div className="text-[10px] text-slate-400">Comprador: {vehicle.buyerName}</div>
              </div>

              {/* Gastos de Recondicionamento */}
              <div className="p-3.5 rounded-xl bg-white border border-amber-200 shadow-xs">
                <span className="text-xs text-amber-700 font-semibold">(+) Gastos de Preparo:</span>
                <div className="text-lg font-bold text-amber-700 mt-1">{fmt(dre.totalExpenses)}</div>
                <div className="text-[10px] text-slate-400">{vehicleExpenses.length} notas lançadas</div>
              </div>

              {/* Custo Total Investido */}
              <div className="p-3.5 rounded-xl bg-white border border-slate-300 shadow-xs">
                <span className="text-xs text-slate-600 font-semibold">(=) Custo Total:</span>
                <div className="text-lg font-bold text-slate-900 mt-1">{fmt(dre.totalInvestedCost)}</div>
                <div className="text-[10px] text-slate-400">Compra + Gastos</div>
              </div>

              {/* FIPE Congelada */}
              <div className="p-3.5 rounded-xl bg-white border border-indigo-200 shadow-xs">
                <div className="flex items-center space-x-1 text-xs text-indigo-600 font-semibold">
                  <Lock className="w-3 h-3" />
                  <span>FIPE da Compra:</span>
                </div>
                <div className="text-lg font-bold text-indigo-700 mt-1">{fmt(vehicle.fipeAtPurchase)}</div>
                <div className="text-[10px] text-slate-400">{vehicle.fipeMonthRef || 'Referência congelada'}</div>
              </div>

            </div>
          </div>

          {/* Venda & Rentabilidade Real ou Projetada */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  {isSold ? 'Apuração Final de Venda' : 'Projeção de Rentabilidade'}
                </span>
                <div className="text-xs text-slate-600 mt-1">
                  {isSold ? (
                    <>
                      Valor de Venda: <strong className="text-slate-900">{fmt(vehicleSale?.salePrice || 0)}</strong> • Forma: <span className="uppercase font-semibold">{vehicleSale?.paymentMethod}</span> • Comissão: <strong>{fmt(vehicleSale?.commissionAmount || 0)}</strong>
                    </>
                  ) : (
                    <>
                      Preço Alvo de Venda: <strong className="text-slate-900">{fmt(vehicle.targetSalePrice || vehicle.fipeAtPurchase)}</strong>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-4 font-mono">
                <div>
                  <span className="text-xs text-slate-500">Lucro Líquido:</span>
                  <div className="text-xl font-bold text-emerald-600">{fmt(dre.estimatedOrRealProfit)}</div>
                </div>
                <div className="border-l border-slate-200 pl-4">
                  <span className="text-xs text-slate-500">ROI:</span>
                  <div className="text-xl font-bold text-emerald-600">{dre.estimatedOrRealRoi}%</div>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Expenses Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Wrench className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Lançamento de Custos & Notas Fiscais ({vehicleExpenses.length})
                </h3>
              </div>

              <button
                id="btn-modal-add-expense"
                onClick={() => {
                  if (isReadOnlyMode) openPaywallModal();
                  else onOpenAddExpense(vehicle);
                }}
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold shadow-xs transition flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5 text-indigo-600" />
                <span>Adicionar Despesa</span>
              </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-600 text-[10px] font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Data</th>
                    <th className="py-2.5 px-3">Categoria</th>
                    <th className="py-2.5 px-3">Descrição / Fornecedor</th>
                    <th className="py-2.5 px-3">Responsável</th>
                    <th className="py-2.5 px-3">Valor</th>
                    <th className="py-2.5 px-3 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {vehicleExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-400">
                        Nenhum custo lançado para este veículo até o momento.
                      </td>
                    </tr>
                  ) : (
                    vehicleExpenses.map((exp) => (
                      <tr key={exp.id} className="hover:bg-slate-50/80">
                        <td className="py-2.5 px-3 font-medium text-slate-600">{exp.date}</td>
                        <td className="py-2.5 px-3">
                          <span className="capitalize px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            {exp.category}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-slate-900">{exp.description}</div>
                          {exp.supplier && <div className="text-[10px] text-slate-400">{exp.supplier} {exp.invoiceNumber && `• ${exp.invoiceNumber}`}</div>}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500">{exp.responsibleUser}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">{fmt(exp.amount)}</td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => {
                              if (isReadOnlyMode) openPaywallModal();
                              else onDeleteExpense(exp.id);
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 transition"
                            title="Remover Despesa"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>FIPE congelada na data da captação garante a precisão do DRE.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs transition"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
