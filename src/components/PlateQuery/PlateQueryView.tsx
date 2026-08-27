import React, { useState } from 'react';
import { 
  Search, 
  Car, 
  ShieldCheck, 
  Clock, 
  AlertCircle, 
  Calculator, 
  Plus, 
  Sparkles, 
  CheckCircle2, 
  FileText, 
  Zap,
  ArrowRight,
  Database
} from 'lucide-react';
import { queryPlateData, isValidBrazilianPlate } from '../../services/plateFipeService';
import { PlateQueryResult } from '../../types';
import { useAuthTenant } from '../../context/AuthTenantContext';

interface PlateQueryViewProps {
  onSendToCalculator: (result: PlateQueryResult) => void;
  onSendToRegistration: (result: PlateQueryResult) => void;
}

export const PlateQueryView: React.FC<PlateQueryViewProps> = ({
  onSendToCalculator,
  onSendToRegistration,
}) => {
  const { tenant, consumePlateCredit, isReadOnlyMode, openPaywallModal } = useAuthTenant();

  const [plate, setPlate] = useState('FKP3H80');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PlateQueryResult | null>(null);
  const [history, setHistory] = useState<PlateQueryResult[]>([]);

  const handleSearch = async (targetPlate?: string) => {
    const searchPlate = targetPlate || plate;
    if (!isValidBrazilianPlate(searchPlate)) {
      setError('Placa inválida. Utilize padrão Mercosul (ABC1D23) ou tradicional (ABC1234).');
      return;
    }

    if (tenant.plateQueriesUsed >= tenant.plateQueriesLimit) {
      setError('Limite mensal de consultas de placa atingido para este tenant.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await queryPlateData(searchPlate, tenant.id, () => {
        consumePlateCredit();
      });
      setResult(data);
      setHistory((prev) => [data, ...prev.filter((h) => h.plate !== data.plate)].slice(0, 8));
    } catch (err: any) {
      setError(err.message || 'Erro ao realizar consulta');
    } finally {
      setLoading(false);
    }
  };

  const fmt = (v: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(v || 0);
  };

  const sandboxPresets = [
    { plate: 'FKP3H80', label: 'Jeep Compass 2024' },
    { plate: 'RKS4E29', label: 'VW T-Cross 2023' },
    { plate: 'GKS8A12', label: 'Honda Civic 2021' },
    { plate: 'BJZ9C44', label: 'Corolla Cross Hybrid' },
    { plate: 'PLX7F90', label: 'Fiat Pulse Turbo' },
    { plate: 'BRA2E19', label: 'Hyundai HB20 2024' },
    { plate: 'BMW3A20', label: 'BMW 320i M Sport' },
  ];

  const quotaPct = Math.min(100, Math.round((tenant.plateQueriesUsed / tenant.plateQueriesLimit) * 100));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header & Quota Card */}
      <div className="bg-white border border-slate-200 p-5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Search className="w-5 h-5" />
            </div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">Consulta de Placa & Tabela FIPE</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Módulo de integração com base de dados veiculares do Brasil e precificação oficial FIPE.
          </p>
        </div>

        {/* Credit Meter */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 w-full sm:w-64 space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-600 font-medium">Consumo de Créditos:</span>
            <span className="font-bold text-indigo-600">
              {tenant.plateQueriesUsed} / {tenant.plateQueriesLimit}
            </span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                quotaPct > 85 ? 'bg-rose-500' : quotaPct > 60 ? 'bg-amber-500' : 'bg-indigo-600'
              }`}
              style={{ width: `${quotaPct}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-500 block text-right font-medium">
            Renovação mensal inclusa no {tenant.plan.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Plate Search Input Box */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          Digite a Placa para Consulta Instantânea
        </label>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-64">
            <input
              id="plate-query-input"
              type="text"
              placeholder="Ex: BRA2E19"
              value={plate}
              onChange={(e) => setPlate(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              maxLength={8}
              className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-300 rounded-xl text-lg font-mono font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-600 uppercase tracking-widest text-center shadow-xs"
            />
          </div>

          <button
            id="plate-query-btn"
            onClick={() => handleSearch()}
            disabled={loading}
            className="w-full sm:w-auto px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xs transition flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <Search className="w-4 h-4" />
            <span>{loading ? 'Consultando Bases...' : 'Consultar Veículo & FIPE'}</span>
          </button>
        </div>

        {/* Sandbox Presets */}
        <div className="pt-2">
          <span className="text-[11px] font-semibold text-slate-500 mr-2">Placas de Teste Sandbox:</span>
          <div className="inline-flex flex-wrap gap-1.5 mt-1.5">
            {sandboxPresets.map((preset) => (
              <button
                key={preset.plate}
                onClick={() => {
                  setPlate(preset.plate);
                  handleSearch(preset.plate);
                }}
                className="px-2.5 py-1 rounded-md bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 text-[11px] font-mono transition shadow-xs"
              >
                <strong>{preset.plate}</strong> <span className="text-slate-500 font-sans">({preset.label})</span>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Result Card */}
      {result && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6 animate-in fade-in">
          
          {/* Card Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-base font-bold px-3 py-1 rounded-lg bg-slate-900 text-white border border-slate-800">
                  {result.plate}
                </span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {result.historyStatus}
                </span>
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  IPVA: {result.ipvaStatus}
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mt-2">
                {result.brand} {result.model} <span className="text-slate-500 font-normal">{result.version}</span>
              </h2>
            </div>

            <div className="text-right bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-500 uppercase tracking-wider block font-semibold">Valor FIPE Oficial:</span>
              <span className="text-2xl font-bold text-indigo-700 font-mono">{fmt(result.fipeValue)}</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Ref: {result.fipeRefMonth} (Cód: {result.fipeCode})</span>
            </div>
          </div>

          {/* Technical Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block font-medium">Ano Fab / Modelo:</span>
              <strong className="text-slate-900 font-bold">{result.yearFab} / {result.yearModel}</strong>
            </div>
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block font-medium">Cor do Veículo:</span>
              <strong className="text-slate-900 font-bold">{result.color}</strong>
            </div>
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block font-medium">Combustível:</span>
              <strong className="text-slate-900 font-bold">{result.fuel}</strong>
            </div>
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block font-medium">Município / UF:</span>
              <strong className="text-slate-900 font-bold">{result.city} - {result.state}</strong>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
            <button
              id="plate-result-calc-cta"
              onClick={() => onSendToCalculator(result)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 font-bold text-xs border border-slate-200 transition flex items-center justify-center space-x-2"
            >
              <Calculator className="w-4 h-4 text-indigo-600" />
              <span>Simular Captação & Margem</span>
            </button>

            <button
              id="plate-result-reg-cta"
              onClick={() => {
                if (isReadOnlyMode) openPaywallModal();
                else onSendToRegistration(result);
              }}
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs transition flex items-center justify-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar no Estoque</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      )}

      {/* Query History */}
      {history.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
          <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            Consultas Recentes da Loja
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {history.map((h, i) => (
              <div
                key={i}
                onClick={() => setResult(h)}
                className="p-3 rounded-lg bg-slate-50 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 cursor-pointer flex items-center justify-between text-xs transition"
              >
                <div>
                  <span className="font-mono font-bold text-slate-900">{h.plate}</span>
                  <div className="text-[11px] text-slate-500 truncate max-w-[140px]">{h.brand} {h.model}</div>
                </div>
                <div className="text-right">
                  <span className="font-mono text-indigo-700 font-bold">{fmt(h.fipeValue)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
