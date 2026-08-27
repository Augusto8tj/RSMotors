import React, { useState, useMemo } from 'react';
import { 
  Users, 
  TrendingUp, 
  Calendar, 
  Clock, 
  Award, 
  DollarSign, 
  Percent, 
  Car, 
  ChevronDown, 
  ChevronRight, 
  Filter, 
  Download, 
  Printer, 
  Sparkles, 
  CheckCircle2, 
  CreditCard, 
  ArrowUpRight,
  Shield,
  Layers
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell, 
  ComposedChart, 
  Line 
} from 'recharts';
import { 
  SellerPerformanceSummary, 
  SellerVehiclePerformance, 
  VehicleSale, 
  Vehicle 
} from '../../types';
import { calculateSellerPerformance } from '../../services/dbService';
import { useAuthTenant } from '../../context/AuthTenantContext';

interface SellerPerformanceViewProps {
  sales: VehicleSale[];
  vehicles: Vehicle[];
  onOpenVehicleDetail?: (vehicle: Vehicle) => void;
}

type PeriodPreset = 'este_mes' | 'ultimos_30' | 'ultimos_90' | 'ano' | 'todos' | 'custom';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];

export const SellerPerformanceView: React.FC<SellerPerformanceViewProps> = ({
  sales,
  vehicles,
  onOpenVehicleDetail,
}) => {
  const { tenant, user } = useAuthTenant();

  // Period Filter States
  const [periodPreset, setPeriodPreset] = useState<PeriodPreset>('todos');
  const [selectedSellerId, setSelectedSellerId] = useState<string>('all');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');

  // Expandable Seller Detail Accordion State
  const [expandedSellerId, setExpandedSellerId] = useState<string | null>(null);

  // Compute date range based on preset
  const dateRange = useMemo(() => {
    const now = new Date();
    const nowStr = now.toISOString().split('T')[0];

    if (periodPreset === 'este_mes') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      return { startDate: firstDay, endDate: nowStr };
    } else if (periodPreset === 'ultimos_30') {
      const thirtyAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      return { startDate: thirtyAgo, endDate: nowStr };
    } else if (periodPreset === 'ultimos_90') {
      const ninetyAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      return { startDate: ninetyAgo, endDate: nowStr };
    } else if (periodPreset === 'ano') {
      const firstDayOfYear = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
      return { startDate: firstDayOfYear, endDate: nowStr };
    } else if (periodPreset === 'custom') {
      return { startDate: customStartDate || undefined, endDate: customEndDate || undefined };
    }
    return { startDate: undefined, endDate: undefined };
  }, [periodPreset, customStartDate, customEndDate]);

  // Execute Calculation Engine
  const reportData = useMemo(() => {
    return calculateSellerPerformance({
      tenantId: tenant.id,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      sellerId: selectedSellerId,
    });
  }, [tenant.id, dateRange, selectedSellerId, sales, vehicles]);

  const { summaries, totals } = reportData;

  // Chart Data: Profit & Revenue by Seller
  const barChartData = useMemo(() => {
    return summaries
      .filter((s) => s.totalVehiclesSold > 0)
      .map((s) => ({
        name: s.sellerName.split(' ')[0],
        fullName: s.sellerName,
        lucroTotal: s.totalNetProfit,
        lucroMedio: s.averageNetProfitPerVehicle,
        vendas: s.totalVehiclesSold,
        faturamento: s.totalRevenue,
      }));
  }, [summaries]);

  // Chart Data: ROI (%) vs Turnaround (Days in Yard)
  const efficiencyChartData = useMemo(() => {
    return summaries
      .filter((s) => s.totalVehiclesSold > 0)
      .map((s) => ({
        name: s.sellerName.split(' ')[0],
        fullName: s.sellerName,
        roiMedio: s.averageRoi,
        diasMedioPatio: s.averageDaysInYard,
      }));
  }, [summaries]);

  // Chart Data: Sales Volume Pie
  const pieChartData = useMemo(() => {
    return summaries
      .filter((s) => s.totalVehiclesSold > 0)
      .map((s, idx) => ({
        name: s.sellerName.split(' ')[0],
        fullName: s.sellerName,
        value: s.totalVehiclesSold,
        color: COLORS[idx % COLORS.length],
      }));
  }, [summaries]);

  // Top Performing Seller
  const topSeller = summaries[0] && summaries[0].totalVehiclesSold > 0 ? summaries[0] : null;

  return (
    <div className="space-y-6">
      {/* Top Header & Context Description */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Análise de Desempenho de Vendedores
              </h1>
              <p className="text-xs text-slate-500">
                Relatório executivo de volume de vendas, lucro líquido médio, ROI e tempo médio de estoque por vendedor
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 shadow-2xs transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Imprimir / PDF</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar (Period & Seller Filter) */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Period Preset Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              <span>Período:</span>
            </span>

            <button
              onClick={() => setPeriodPreset('este_mes')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                periodPreset === 'este_mes'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Este Mês
            </button>

            <button
              onClick={() => setPeriodPreset('ultimos_30')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                periodPreset === 'ultimos_30'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Últimos 30 Dias
            </button>

            <button
              onClick={() => setPeriodPreset('ultimos_90')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                periodPreset === 'ultimos_90'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Últimos 90 Dias
            </button>

            <button
              onClick={() => setPeriodPreset('ano')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                periodPreset === 'ano'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Ano Atual
            </button>

            <button
              onClick={() => setPeriodPreset('todos')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                periodPreset === 'todos'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todo o Histórico
            </button>

            <button
              onClick={() => setPeriodPreset('custom')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                periodPreset === 'custom'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Personalizado
            </button>
          </div>

          {/* Seller Selector Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Vendedor:</span>
            <select
              value={selectedSellerId}
              onChange={(e) => setSelectedSellerId(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs rounded-lg px-3 py-1.5 text-slate-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none font-medium"
            >
              <option value="all">Todos os Vendedores</option>
              {summaries.map((s) => (
                <option key={s.sellerId} value={s.sellerId}>
                  {s.sellerName} ({s.totalVehiclesSold} vendas)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Custom Date Pickers when 'custom' is selected */}
        {periodPreset === 'custom' && (
          <div className="pt-2 border-t border-slate-100 flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">De:</span>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-mono"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Até:</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-mono"
              />
            </div>
          </div>
        )}
      </div>

      {/* Primary Key Metric Cards (The 4 Core Requirements + Revenue & Commission) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* 1. Total de Veículos Vendidos */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Veículos Vendidos</span>
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-md">
              <Car className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">
            {totals.totalVehiclesSold}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Faturamento: <strong>R$ {totals.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</strong>
          </p>
        </div>

        {/* 2. Lucro Líquido Médio por Veículo */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">Lucro Líquido Médio</span>
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-md">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-600 font-mono">
            R$ {totals.averageNetProfitPerVehicle.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-emerald-700 mt-1">
            Lucro Líquido Total: <strong>R$ {totals.totalNetProfit.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</strong>
          </p>
        </div>

        {/* 3. Retorno sobre Investimento (ROI) Médio */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-indigo-800 uppercase tracking-wider">ROI Médio Realizado</span>
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-md">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-indigo-600 font-mono">
            {totals.averageRoi}%
          </div>
          <p className="text-[11px] text-indigo-700 mt-1">
            Rentabilidade sobre o custo investido
          </p>
        </div>

        {/* 4. Tempo Médio que o Veículo Permanece no Pátio */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Giro Médio (Pátio)</span>
            <div className="p-1.5 bg-amber-50 text-amber-600 rounded-md">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">
            {totals.averageDaysInYard} <span className="text-sm font-normal text-slate-500">dias</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Entrada no estoque até a data de venda
          </p>
        </div>
      </div>

      {/* Top Seller Highlight Banner (Leader of the Period) */}
      {topSeller && (
        <div className="bg-linear-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-5 shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={topSeller.avatarUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120'}
                alt={topSeller.sellerName}
                className="w-14 h-14 rounded-full object-cover ring-2 ring-indigo-400"
              />
              <div className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-900 p-1 rounded-full text-[10px] font-bold shadow-xs">
                <Award className="w-3.5 h-3.5" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-400/20">
                  Líder de Rentabilidade no Período
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mt-0.5">{topSeller.sellerName}</h3>
              <p className="text-xs text-slate-300">
                {topSeller.totalVehiclesSold} veículos vendidos • Lucro Total: <strong className="text-emerald-400">R$ {topSeller.totalNetProfit.toLocaleString('pt-BR')}</strong> • ROI Médio: <strong className="text-indigo-300">{topSeller.averageRoi}%</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-800/80 p-3 rounded-xl border border-slate-700/80">
            <div className="text-center px-2">
              <span className="text-[10px] text-slate-400 block uppercase">Lucro Médio/Carro</span>
              <span className="text-xs font-bold text-emerald-400 font-mono">
                R$ {topSeller.averageNetProfitPerVehicle.toLocaleString('pt-BR')}
              </span>
            </div>
            <div className="w-px h-8 bg-slate-700" />
            <div className="text-center px-2">
              <span className="text-[10px] text-slate-400 block uppercase">Giro Médio</span>
              <span className="text-xs font-bold text-white font-mono">
                {topSeller.averageDaysInYard} dias
              </span>
            </div>
            <div className="w-px h-8 bg-slate-700" />
            <div className="text-center px-2">
              <span className="text-[10px] text-slate-400 block uppercase">Comissões</span>
              <span className="text-xs font-bold text-amber-300 font-mono">
                R$ {topSeller.totalCommissions.toLocaleString('pt-BR')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Visual Analytics Charts (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Lucro Líquido Médio e Total por Vendedor */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Lucro Líquido por Vendedor</h3>
              <p className="text-[11px] text-slate-500">Comparativo de Lucro Total vs Lucro Médio por Veículo (R$)</p>
            </div>
          </div>

          <div className="h-64 w-full">
            {barChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                Sem dados de vendas para o período selecionado.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis 
                    tick={{ fontSize: 10, fill: '#64748b' }} 
                    tickFormatter={(val) => `R$ ${(val / 1000).toFixed(0)}k`} 
                  />
                  <Tooltip 
                    formatter={(val: number) => `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                    labelFormatter={(label, payload) => payload[0]?.payload?.fullName || label}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="lucroTotal" name="Lucro Líquido Total" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="lucroMedio" name="Lucro Médio p/ Carro" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 2: ROI Médio (%) vs Giro Médio no Pátio (Dias) */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Eficiência: ROI (%) vs Dias no Pátio</h3>
              <p className="text-[11px] text-slate-500">Rentabilidade média obtida e tempo de estoque por vendedor</p>
            </div>
          </div>

          <div className="h-64 w-full">
            {efficiencyChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                Sem dados de vendas para o período selecionado.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={efficiencyChartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis 
                    yAxisId="left" 
                    tick={{ fontSize: 10, fill: '#64748b' }} 
                    tickFormatter={(val) => `${val}%`} 
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    tick={{ fontSize: 10, fill: '#64748b' }} 
                    tickFormatter={(val) => `${val}d`} 
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                    labelFormatter={(label, payload) => payload[0]?.payload?.fullName || label}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar yAxisId="left" dataKey="roiMedio" name="ROI Médio (%)" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="diasMedioPatio" name="Giro Médio (Dias no Pátio)" stroke="#f59e0b" strokeWidth={3} dot={{ r: 5 }} />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Ranked Performance Table with Expandable Vehicle Details */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Tabela Consolidada de Desempenho por Vendedor
            </h3>
            <p className="text-xs text-slate-500">
              Métricas detalhadas, comissões apuradas e lista de veículos vendidos por vendedor
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-400">
            {summaries.length} Vendedores no Tenant
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Vendedor</th>
                <th className="px-4 py-3 text-center">Veículos Vendidos</th>
                <th className="px-4 py-3">Faturamento Total</th>
                <th className="px-4 py-3">Lucro Líquido Médio</th>
                <th className="px-4 py-3">Lucro Líquido Total</th>
                <th className="px-4 py-3 text-center">ROI Médio</th>
                <th className="px-4 py-3 text-center">Giro Médio</th>
                <th className="px-4 py-3">Comissões</th>
                <th className="px-4 py-3 text-right">Detalhes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {summaries.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-10 text-slate-400">
                    Nenhum vendedor encontrado para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                summaries.map((seller, index) => {
                  const isExpanded = expandedSellerId === seller.sellerId;

                  return (
                    <React.Fragment key={seller.sellerId}>
                      <tr 
                        className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${
                          isExpanded ? 'bg-indigo-50/20' : ''
                        }`}
                        onClick={() => setExpandedSellerId(isExpanded ? null : seller.sellerId)}
                      >
                        {/* Seller Name & Avatar */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <img
                                src={seller.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                                alt={seller.sellerName}
                                className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
                              />
                              {index === 0 && seller.totalVehiclesSold > 0 && (
                                <span className="absolute -top-1 -right-1 bg-amber-400 text-slate-900 rounded-full w-4 h-4 flex items-center justify-center text-[9px] font-bold">
                                  1º
                                </span>
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900">{seller.sellerName}</div>
                              <div className="text-[11px] text-slate-400 truncate">{seller.sellerEmail || 'Vendedor Autorizado'}</div>
                            </div>
                          </div>
                        </td>

                        {/* Total Vehicles Sold */}
                        <td className="px-4 py-3.5 text-center font-mono font-bold text-slate-800 text-sm">
                          {seller.totalVehiclesSold}
                        </td>

                        {/* Total Revenue */}
                        <td className="px-4 py-3.5 font-mono font-medium text-slate-700">
                          R$ {seller.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>

                        {/* Avg Net Profit per Vehicle */}
                        <td className="px-4 py-3.5 font-mono font-bold text-emerald-600">
                          R$ {seller.averageNetProfitPerVehicle.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>

                        {/* Total Net Profit */}
                        <td className="px-4 py-3.5 font-mono font-bold text-slate-900">
                          R$ {seller.totalNetProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>

                        {/* Avg ROI % */}
                        <td className="px-4 py-3.5 text-center font-mono font-bold text-indigo-600">
                          {seller.averageRoi}%
                        </td>

                        {/* Avg Days in Yard */}
                        <td className="px-4 py-3.5 text-center font-mono text-slate-700">
                          <span className={`px-2 py-0.5 rounded font-bold ${
                            seller.averageDaysInYard <= 30
                              ? 'bg-emerald-50 text-emerald-700'
                              : seller.averageDaysInYard <= 60
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}>
                            {seller.averageDaysInYard} dias
                          </span>
                        </td>

                        {/* Commissions */}
                        <td className="px-4 py-3.5 font-mono text-amber-700 font-semibold">
                          R$ {seller.totalCommissions.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>

                        {/* Action Toggle */}
                        <td className="px-4 py-3.5 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedSellerId(isExpanded ? null : seller.sellerId);
                            }}
                            className="p-1 text-slate-400 hover:text-indigo-600 rounded"
                          >
                            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </button>
                        </td>
                      </tr>

                      {/* Expandable Accordion: Individual Vehicle Breakdown */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={9} className="px-4 py-3 bg-slate-50/80 border-y border-slate-200">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                  <Car className="w-4 h-4 text-indigo-600" />
                                  <span>Veículos Vendidos por {seller.sellerName} ({seller.vehicles.length})</span>
                                </h4>
                                <span className="text-[11px] text-slate-400">
                                  DRE individual por chassi com lucro líquido e ROI apurados
                                </span>
                              </div>

                              {seller.vehicles.length === 0 ? (
                                <p className="text-xs text-slate-400 italic py-2">
                                  Nenhuma venda concluída no período selecionado.
                                </p>
                              ) : (
                                <div className="overflow-x-auto bg-white rounded-lg border border-slate-200">
                                  <table className="w-full text-left text-[11px] text-slate-600">
                                    <thead className="bg-slate-100 text-slate-500 uppercase tracking-wider text-[9px] font-bold">
                                      <tr>
                                        <th className="px-3 py-2">Placa / Veículo</th>
                                        <th className="px-3 py-2">Data da Venda</th>
                                        <th className="px-3 py-2">Preço de Venda</th>
                                        <th className="px-3 py-2">Lucro Líquido</th>
                                        <th className="px-3 py-2 text-center">ROI %</th>
                                        <th className="px-3 py-2 text-center">Dias no Pátio</th>
                                        <th className="px-3 py-2">Comissão</th>
                                        <th className="px-3 py-2">Forma Pagto</th>
                                        <th className="px-3 py-2">Cliente Comprador</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                      {seller.vehicles.map((v) => (
                                        <tr key={v.saleId} className="hover:bg-slate-50">
                                          <td className="px-3 py-2">
                                            <div className="font-bold text-slate-900">{v.vehicleName}</div>
                                            <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-1 py-0.2 rounded">
                                              {v.vehiclePlate}
                                            </span>
                                          </td>
                                          <td className="px-3 py-2 font-mono text-slate-500">
                                            {new Date(v.saleDate).toLocaleDateString('pt-BR')}
                                          </td>
                                          <td className="px-3 py-2 font-mono font-medium text-slate-800">
                                            R$ {v.salePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                          </td>
                                          <td className="px-3 py-2 font-mono font-bold text-emerald-600">
                                            R$ {v.netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                          </td>
                                          <td className="px-3 py-2 text-center font-mono font-bold text-indigo-600">
                                            {v.roiPercentage}%
                                          </td>
                                          <td className="px-3 py-2 text-center font-mono">
                                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                              v.daysInYard <= 30
                                                ? 'bg-emerald-50 text-emerald-700'
                                                : v.daysInYard <= 60
                                                ? 'bg-amber-50 text-amber-700'
                                                : 'bg-rose-50 text-rose-700'
                                            }`}>
                                              {v.daysInYard} dias
                                            </span>
                                          </td>
                                          <td className="px-3 py-2 font-mono text-amber-700 font-semibold">
                                            R$ {v.commissionAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                          </td>
                                          <td className="px-3 py-2 capitalize">
                                            {v.paymentMethod.replace('_', ' ')}
                                          </td>
                                          <td className="px-3 py-2 text-slate-700 font-medium">
                                            {v.customerName}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
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
