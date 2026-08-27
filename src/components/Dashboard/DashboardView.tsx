import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Clock, 
  Car, 
  CheckCircle, 
  DollarSign, 
  Percent, 
  Wrench, 
  ShieldCheck, 
  ArrowUpRight, 
  Calendar, 
  Sparkles,
  ChevronRight,
  Flame,
  AlertCircle
} from 'lucide-react';
import { Vehicle, VehicleExpense, VehicleSale, VehicleDRE } from '../../types';
import { calculateFleetKPIs, calculateVehicleDRE } from '../../services/dbService';

interface DashboardViewProps {
  vehicles: Vehicle[];
  expenses: VehicleExpense[];
  sales: VehicleSale[];
  onSelectVehicle: (vehicle: Vehicle) => void;
  onOpenAddVehicle: () => void;
  onOpenCalculator: () => void;
}

type PeriodFilter = 'este_mes' | 'mes_passado' | 'ultimos_90' | 'ano' | 'todos';

export const DashboardView: React.FC<DashboardViewProps> = ({
  vehicles,
  expenses,
  sales,
  onSelectVehicle,
  onOpenAddVehicle,
  onOpenCalculator,
}) => {
  const [period, setPeriod] = useState<PeriodFilter>('este_mes');

  // Filter items by period
  const filteredData = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const isDateInPeriod = (dateStr: string) => {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return true;
      
      switch (period) {
        case 'este_mes':
          return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        case 'mes_passado': {
          const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
          const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
          return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
        }
        case 'ultimos_90': {
          const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          return d >= ninetyDaysAgo;
        }
        case 'ano':
          return d.getFullYear() === currentYear;
        case 'todos':
        default:
          return true;
      }
    };

    // For active vehicles we consider active stock, but for sales and expenses we filter by date
    const pSales = sales.filter((s) => isDateInPeriod(s.saleDate));
    const pExpenses = expenses.filter((e) => isDateInPeriod(e.date));

    return {
      vehicles,
      expenses: pExpenses,
      sales: pSales,
    };
  }, [vehicles, expenses, sales, period]);

  const kpis = useMemo(() => {
    return calculateFleetKPIs(filteredData.vehicles, filteredData.expenses, filteredData.sales);
  }, [filteredData]);

  // Turnaround list (Vehicles in yard over 30 or 60 days)
  const turnaroundAlerts = useMemo(() => {
    const active = vehicles.filter((v) => v.status !== 'Vendido');
    return active
      .map((v) => {
        const vExp = expenses.filter((e) => e.vehicleId === v.id);
        return calculateVehicleDRE(v, vExp);
      })
      .filter((dre) => dre.daysInYard >= 30)
      .sort((a, b) => b.daysInYard - a.daysInYard);
  }, [vehicles, expenses]);

  // Format currency helper
  const fmt = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header with Title and Period Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">Painel de Rentabilidade & Giro</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/80">
              Tempo Real
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            DRE apurado por Chassi com base na <strong>Data de Entrada Real no Pátio</strong> (Regra de Ouro).
          </p>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
          <Calendar className="w-3.5 h-3.5 text-slate-400 ml-2" />
          <button
            id="period-este-mes"
            onClick={() => setPeriod('este_mes')}
            className={`px-3 py-1 rounded-md font-medium transition ${
              period === 'este_mes'
                ? 'bg-white text-slate-900 font-bold shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Este Mês
          </button>
          <button
            id="period-mes-passado"
            onClick={() => setPeriod('mes_passado')}
            className={`px-3 py-1 rounded-md font-medium transition ${
              period === 'mes_passado'
                ? 'bg-white text-slate-900 font-bold shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Mês Passado
          </button>
          <button
            id="period-90-dias"
            onClick={() => setPeriod('ultimos_90')}
            className={`px-3 py-1 rounded-md font-medium transition ${
              period === 'ultimos_90'
                ? 'bg-white text-slate-900 font-bold shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            90 Dias
          </button>
          <button
            id="period-ano"
            onClick={() => setPeriod('ano')}
            className={`px-3 py-1 rounded-md font-medium transition ${
              period === 'ano'
                ? 'bg-white text-slate-900 font-bold shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Ano
          </button>
          <button
            id="period-todos"
            onClick={() => setPeriod('todos')}
            className={`px-3 py-1 rounded-md font-medium transition ${
              period === 'todos'
                ? 'bg-white text-slate-900 font-bold shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Todos
          </button>
        </div>
      </div>

      {/* KPI Cards Grid (4 Executive Metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Frota no Pátio vs Vendidos */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Veículos no Pátio</span>
            <div className="p-2 rounded-lg bg-slate-100 text-slate-600">
              <Car className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{kpis.totalVehiclesInYard}</span>
              <span className="text-xs text-slate-500 font-medium">ativos em estoque</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-2 font-medium">
              <span>{kpis.vehiclesAvailable} disponíveis</span>
              <span className="text-amber-600 font-semibold">{kpis.vehiclesInPrep} em preparação</span>
            </div>
          </div>
        </div>

        {/* KPI 2: FIPE Total Acumulada vs Custo Investido */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">FIPE da Frota Ativa</span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold text-indigo-600 tracking-tight">{fmt(kpis.totalActiveFleetFipe)}</div>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-2 font-medium">
              <span>Investido:</span>
              <span className="font-bold text-slate-900">{fmt(kpis.totalInvestedActiveFleet)}</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Recondicionamento & Preparação */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Custos de Preparação</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{fmt(kpis.totalPrepCost)}</div>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-2 font-medium">
              <span>Média por veículo:</span>
              <span className="font-semibold text-slate-800">
                {fmt(kpis.totalVehiclesInYard > 0 ? kpis.totalPrepCost / (kpis.totalVehiclesInYard + kpis.vehiclesSold) : 0)}
              </span>
            </div>
          </div>
        </div>

        {/* KPI 4: Lucro Líquido & ROI Médio */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Lucro Líquido & ROI</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl sm:text-3xl font-bold text-emerald-600 tracking-tight">{fmt(kpis.totalAbsoluteNetProfit)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-2 font-medium">
              <span>ROI Médio Apurado:</span>
              <span className="font-bold text-emerald-600">{kpis.averageRoiPct}%</span>
            </div>
          </div>
        </div>

      </div>

      {/* Alerta de Giro de Pátio (Section Critical Requirement) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-rose-50 text-rose-600 border border-rose-100">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-slate-900">Alerta de Giro de Pátio & Imobilização</h2>
                {turnaroundAlerts.length > 0 && (
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200/80">
                    {turnaroundAlerts.length} em atenção
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Veículos com mais de 30 dias (Atenção) ou 60 dias (Crítico) de capital retido no estoque.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs font-semibold">
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>{kpis.turnaroundAlertCount30} entre 30 e 59 dias</span>
            </div>
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800">
              <Flame className="w-3.5 h-3.5 text-rose-600" />
              <span>{kpis.turnaroundAlertCount60} acima de 60 dias</span>
            </div>
          </div>
        </div>

        {/* Turnaround Vehicle Cards / Rows */}
        {turnaroundAlerts.length === 0 ? (
          <div className="py-8 text-center text-slate-500">
            <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
            <p className="text-sm font-semibold text-slate-800">Giro de Pátio Excelente!</p>
            <p className="text-xs text-slate-500 mt-0.5">Nenhum veículo ativo ultrapassou a marca de 30 dias em estoque.</p>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {turnaroundAlerts.map((item) => {
              const isCrit = item.daysInYard >= 60;
              return (
                <div
                  key={item.vehicle.id}
                  onClick={() => onSelectVehicle(item.vehicle)}
                  className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between hover:shadow-md ${
                    isCrit
                      ? 'bg-rose-50/60 border-rose-200 hover:border-rose-300 hover:bg-rose-50'
                      : 'bg-amber-50/60 border-amber-200 hover:border-amber-300 hover:bg-amber-50'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-900 text-white border border-slate-800">
                        {item.vehicle.plate}
                      </span>
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center space-x-1 border ${
                          isCrit
                            ? 'bg-rose-100 text-rose-800 border-rose-200'
                            : 'bg-amber-100 text-amber-800 border-amber-200'
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        <span>{item.daysInYard} dias de pátio</span>
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 line-clamp-1">
                      {item.vehicle.brand} {item.vehicle.model}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-1">{item.vehicle.version}</p>
                    
                    <div className="mt-3 space-y-1 text-xs text-slate-700 bg-white/80 p-2.5 rounded-lg border border-slate-200/80">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Entrada no Pátio:</span>
                        <span className="font-medium">{item.vehicle.entryDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Capital Imobilizado:</span>
                        <span className="font-bold text-slate-900">{fmt(item.totalInvestedCost)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">FIPE na Captação:</span>
                        <span className="text-indigo-600 font-semibold">{fmt(item.fipeAtPurchase)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-200/60">
                    <span className="text-rose-700 font-semibold text-[11px]">
                      {isCrit ? '⚠️ Ação: Promoção / Repasse' : '⚡ Ação: Impulsionar Anúncio'}
                    </span>
                    <span className="text-slate-600 flex items-center hover:text-slate-900 font-medium">
                      <span>Ver DRE</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Two Column Grid: Cost Breakdown by Category & Quick Simulation Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Cost Breakdown by Category */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Composição dos Custos de Recondicionamento
              </h2>
              <p className="text-xs text-slate-500">Detalhamento dos gastos investidos para preparar os veículos para venda.</p>
            </div>
            <div className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
              Total: {fmt(kpis.totalPrepCost)}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { cat: 'Mecânica / Revisão', val: kpis.prepCostByCategory.mecanica, border: 'border-slate-200' },
              { cat: 'Funilaria / Pintura', val: kpis.prepCostByCategory.funilaria, border: 'border-slate-200' },
              { cat: 'Despachante & IPVA', val: kpis.prepCostByCategory.despachante, border: 'border-slate-200' },
              { cat: 'Higienização & Detail', val: kpis.prepCostByCategory.higienizacao, border: 'border-slate-200' },
              { cat: 'Pneus Novos', val: kpis.prepCostByCategory.pneus, border: 'border-slate-200' },
              { cat: 'Laudos Cautelares', val: kpis.prepCostByCategory.laudo, border: 'border-slate-200' },
              { cat: 'Acessórios', val: kpis.prepCostByCategory.acessorios, border: 'border-slate-200' },
              { cat: 'Outras Despesas', val: kpis.prepCostByCategory.outros, border: 'border-slate-200' },
            ].map((item, idx) => (
              <div key={idx} className={`p-3 rounded-lg bg-slate-50 border ${item.border} flex flex-col justify-between`}>
                <span className="text-xs text-slate-500 font-medium">{item.cat}</span>
                <span className="text-sm font-bold text-slate-900 mt-1">{fmt(item.val)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Viability Action Card (Dark executive container from theme) */}
        <div className="bg-[#1e293b] text-white p-5 rounded-xl border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-[11px] font-bold mb-3 border border-indigo-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Diferencial Competitivo</span>
            </div>
            <h3 className="text-base font-bold text-white leading-snug">
              Calculadora de Captação & Teto de Compra
            </h3>
            <p className="text-xs text-slate-300 mt-1.5">
              Simule a viabilidade antes de fechar a compra. Calcule a <strong>Proposta Máxima Recomendada</strong> descontando FIPE, recondicionamento e margem garantida.
            </p>
          </div>

          <div className="mt-5 space-y-2">
            <button
              id="dash-open-calc-btn"
              onClick={onOpenCalculator}
              className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center space-x-2"
            >
              <span>Abrir Calculadora de Margem</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
            <button
              id="dash-open-add-veh-btn"
              onClick={onOpenAddVehicle}
              className="w-full py-2 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition"
            >
              + Cadastrar Veículo por Placa
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
