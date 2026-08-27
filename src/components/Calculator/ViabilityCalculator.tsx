import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  Search, 
  DollarSign, 
  Percent, 
  Wrench, 
  ShieldCheck, 
  Copy, 
  Check, 
  ArrowRight, 
  Sparkles, 
  TrendingUp, 
  Info,
  Car,
  FileSpreadsheet
} from 'lucide-react';
import { calculateViability, queryPlateData, isValidBrazilianPlate } from '../../services/plateFipeService';
import { ViabilitySimulationInput, PlateQueryResult } from '../../types';
import { useAuthTenant } from '../../context/AuthTenantContext';

interface ViabilityCalculatorProps {
  onStartVehicleRegistration?: (initialData: Partial<PlateQueryResult> & { maxOffer?: number }) => void;
}

export const ViabilityCalculator: React.FC<ViabilityCalculatorProps> = ({
  onStartVehicleRegistration,
}) => {
  const { tenant, consumePlateCredit, isReadOnlyMode, openPaywallModal } = useAuthTenant();

  // Search plate helper
  const [searchPlate, setSearchPlate] = useState('');
  const [isSearchingPlate, setIsSearchingPlate] = useState(false);
  const [plateError, setPlateError] = useState<string | null>(null);
  const [plateData, setPlateData] = useState<PlateQueryResult | null>(null);
  const [copied, setCopied] = useState(false);

  // Simulation inputs
  const [fipeValue, setFipeValue] = useState<number>(120000);
  const [targetSellingPriceOverride, setTargetSellingPriceOverride] = useState<number | undefined>(undefined);
  
  // Projected Expenses
  const [funilaria, setFunilaria] = useState<number>(800);
  const [mecanica, setMecanica] = useState<number>(1200);
  const [despachante, setDespachante] = useState<number>(550);
  const [higienizacao, setHigienizacao] = useState<number>(450);
  const [laudoOutros, setLaudoOutros] = useState<number>(300);
  const [safetyMarginPct, setSafetyMarginPct] = useState<number>(2.5); // 2.5% da FIPE para imprevistos
  
  // Desired Margins
  const [desiredMarginPct, setDesiredMarginPct] = useState<number>(12); // 12% de margem líquida
  const [sellerCommissionPct, setSellerCommissionPct] = useState<number>(1.5); // 1.5% comissão

  const simulationInput: ViabilitySimulationInput = useMemo(() => ({
    fipeValue,
    targetSellingPriceOverride,
    projectedExpenses: {
      funilaria,
      mecanica,
      despachante,
      higienizacao,
      laudoOutros,
      safetyMarginPct,
    },
    desiredMarginPct,
    sellerCommissionPct,
  }), [
    fipeValue,
    targetSellingPriceOverride,
    funilaria,
    mecanica,
    despachante,
    higienizacao,
    laudoOutros,
    safetyMarginPct,
    desiredMarginPct,
    sellerCommissionPct,
  ]);

  const result = useMemo(() => {
    return calculateViability(simulationInput);
  }, [simulationInput]);

  const handleQueryPlate = async () => {
    if (!isValidBrazilianPlate(searchPlate)) {
      setPlateError('Placa inválida. Utilize o padrão Mercosul (ABC1D23) ou tradicional (ABC1234).');
      return;
    }

    if (tenant.plateQueriesUsed >= tenant.plateQueriesLimit) {
      setPlateError('Limite mensal de consultas de placa atingido. Faça um upgrade no painel de planos.');
      return;
    }

    setIsSearchingPlate(true);
    setPlateError(null);

    try {
      const data = await queryPlateData(searchPlate, tenant.id, () => {
        consumePlateCredit();
      });
      setPlateData(data);
      setFipeValue(data.fipeValue);
      setTargetSellingPriceOverride(data.fipeValue);
    } catch (err: any) {
      setPlateError(err.message || 'Erro ao consultar placa');
    } finally {
      setIsSearchingPlate(false);
    }
  };

  const fmt = (v: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(v || 0);
  };

  const handleCopyProposal = () => {
    const text = `*PROPOSTA DE COMPRA - ${tenant.name}*
🚗 Veículo: ${plateData ? `${plateData.brand} ${plateData.model} (${plateData.yearModel})` : 'Veículo em Análise'}
📊 Valor FIPE Oficial: ${fmt(fipeValue)}
🔧 Deduções Técnicas (Preparação, Revisão, Laudo e Regularização): ${fmt(result.totalProjectedExpenses)}
💰 *PROPOSTA FINAL À VISTA:* ${fmt(result.maxRecommendedOffer)} (${result.offerPercentageOfFipe}% da FIPE)
⚡ Pagamento imediato via PIX com quitação de débitos e transferência simplificada.`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Title & Banner */}
      <div className="bg-white border border-slate-200 p-5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Calculator className="w-5 h-5" />
            </div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">Calculadora de Captação & Margem</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Simulador de compra inteligente: descubra a <strong>Proposta Máxima Recomendada (Teto de Compra)</strong> garantindo sua margem de lucro líquida.
          </p>
        </div>

        {/* Quick Plate Autofill Box */}
        <div className="flex items-center space-x-2 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
          <input
            id="calc-plate-input"
            type="text"
            placeholder="Placa (ex: RKS4E29)"
            value={searchPlate}
            onChange={(e) => setSearchPlate(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && handleQueryPlate()}
            maxLength={8}
            className="bg-transparent text-xs font-mono font-bold text-slate-900 px-2 py-1 focus:outline-none uppercase w-32"
          />
          <button
            id="calc-plate-search-btn"
            onClick={handleQueryPlate}
            disabled={isSearchingPlate}
            className="px-3 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center space-x-1 transition disabled:opacity-50 shadow-xs"
          >
            <Search className="w-3.5 h-3.5" />
            <span>{isSearchingPlate ? 'Buscando...' : 'Puxar FIPE'}</span>
          </button>
        </div>
      </div>

      {plateError && (
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between">
          <span>{plateError}</span>
          <button onClick={() => setPlateError(null)} className="font-bold underline ml-2">Fechar</button>
        </div>
      )}

      {plateData && (
        <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-200 flex items-center justify-between text-xs text-slate-700">
          <div className="flex items-center space-x-3">
            <span className="font-mono font-bold text-sm px-2.5 py-1 rounded bg-slate-900 text-white border border-slate-800">
              {plateData.plate}
            </span>
            <div>
              <span className="font-bold text-slate-900">{plateData.brand} {plateData.model}</span>
              <span className="text-slate-500 ml-1">({plateData.yearFab}/{plateData.yearModel}) - {plateData.version}</span>
            </div>
          </div>
          <div className="text-right font-mono">
            <span className="text-slate-500">FIPE Referência: </span>
            <span className="font-bold text-indigo-700">{fmt(plateData.fipeValue)}</span>
          </div>
        </div>
      )}

      {/* Main Grid: Inputs vs. Output (Teto de Compra) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Parameters Input (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Section 1: FIPE & Preço Alvo */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h2 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>1. Base FIPE & Preço Alvo de Venda</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Valor Tabela FIPE (R$)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">R$</span>
                  <input
                    id="calc-fipe-input"
                    type="number"
                    value={fipeValue}
                    onChange={(e) => setFipeValue(Number(e.target.value))}
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Preço Alvo de Venda no Pátio (R$)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">R$</span>
                  <input
                    id="calc-target-price-input"
                    type="number"
                    placeholder={`Padrão FIPE (${fmt(fipeValue)})`}
                    value={targetSellingPriceOverride || ''}
                    onChange={(e) => setTargetSellingPriceOverride(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Projeção de Gastos de Recondicionamento */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center space-x-2">
                <Wrench className="w-4 h-4 text-amber-600" />
                <span>2. Projeção de Gastos de Preparação (DRE)</span>
              </h2>
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                Total: {fmt(result.totalProjectedExpenses)}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">
                  Funilaria & Pintura
                </label>
                <input
                  type="number"
                  value={funilaria}
                  onChange={(e) => setFunilaria(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:bg-white focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">
                  Mecânica & Revisão
                </label>
                <input
                  type="number"
                  value={mecanica}
                  onChange={(e) => setMecanica(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:bg-white focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">
                  Despachante & IPVA
                </label>
                <input
                  type="number"
                  value={despachante}
                  onChange={(e) => setDespachante(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:bg-white focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">
                  Higienização & Detail
                </label>
                <input
                  type="number"
                  value={higienizacao}
                  onChange={(e) => setHigienizacao(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:bg-white focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">
                  Laudo & Outros
                </label>
                <input
                  type="number"
                  value={laudoOutros}
                  onChange={(e) => setLaudoOutros(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:bg-white focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">
                  Imprevistos (% FIPE)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={safetyMarginPct}
                  onChange={(e) => setSafetyMarginPct(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:bg-white focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Margens e Comissões */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h2 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center space-x-2">
              <Percent className="w-4 h-4 text-indigo-600" />
              <span>3. Metas de Rentabilidade & Comissão</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-xs text-slate-600 mb-1">
                  <span>Margem Líquida Desejada:</span>
                  <span className="font-bold text-emerald-600">{desiredMarginPct}% ({fmt(result.desiredProfitAmount)})</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="25"
                  step="0.5"
                  value={desiredMarginPct}
                  onChange={(e) => setDesiredMarginPct(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-600 mb-1">
                  <span>Comissão da Equipe:</span>
                  <span className="font-bold text-indigo-600">{sellerCommissionPct}% ({fmt(result.commissionAmount)})</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.25"
                  value={sellerCommissionPct}
                  onChange={(e) => setSellerCommissionPct(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Calculated Recommended Offer (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Main Output Box (Teto Máximo Recomendado) */}
          <div className="bg-[#1e293b] border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden text-white">
            <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Recomendação de Captação</span>
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {result.offerPercentageOfFipe}% da FIPE
              </span>
            </div>

            <div className="mt-2">
              <span className="text-xs text-slate-400">Proposta Máxima Recomendada (Teto):</span>
              <div className="text-3xl sm:text-4xl font-bold text-white tracking-tight mt-1">
                {fmt(result.maxRecommendedOffer)}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="mt-5 space-y-2 text-xs bg-[#0f172a] p-4 rounded-xl border border-slate-800">
              <div className="flex justify-between text-slate-300">
                <span>Venda Projetada:</span>
                <span className="font-bold text-white">{fmt(result.targetSellingPrice)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>(-) Proposta de Compra:</span>
                <span className="font-medium text-slate-200">{fmt(result.maxRecommendedOffer)}</span>
              </div>
              <div className="flex justify-between text-amber-400">
                <span>(-) Recondicionamento & Taxas:</span>
                <span>{fmt(result.totalProjectedExpenses)}</span>
              </div>
              <div className="flex justify-between text-indigo-400">
                <span>(-) Comissão de Venda:</span>
                <span>{fmt(result.commissionAmount)}</span>
              </div>
              <div className="border-t border-slate-800 pt-2 flex justify-between font-bold text-emerald-400 text-sm">
                <span>(=) Lucro Líquido Garantido:</span>
                <span>{fmt(result.desiredProfitAmount)}</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                <span>ROI Projetado sobre Capital:</span>
                <span className="font-bold text-emerald-400">{result.projectedRoi}%</span>
              </div>
            </div>

            {/* Negotiation Range Tiers */}
            <div className="mt-5 space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Estratégia de Negociação
              </span>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                
                {/* Agressiva */}
                <div className="p-2.5 rounded-lg bg-[#0f172a] border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-semibold">1. Abertura</div>
                  <div className="font-bold text-white text-xs mt-0.5">
                    {fmt(result.suggestedNegotiationRange.aggressiveOffer)}
                  </div>
                  <div className="text-[10px] text-emerald-400 font-medium">Margem Alta</div>
                </div>

                {/* Recomendada */}
                <div className="p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-500/40 shadow-sm">
                  <div className="text-[10px] text-indigo-400 font-bold">2. Meta</div>
                  <div className="font-bold text-white text-xs mt-0.5">
                    {fmt(result.suggestedNegotiationRange.recommendedOffer)}
                  </div>
                  <div className="text-[10px] text-indigo-300 font-medium">Equilíbrio</div>
                </div>

                {/* Teto */}
                <div className="p-2.5 rounded-lg bg-[#0f172a] border border-slate-800">
                  <div className="text-[10px] text-rose-400 font-semibold">3. Teto Limite</div>
                  <div className="font-bold text-white text-xs mt-0.5">
                    {fmt(result.suggestedNegotiationRange.ceilingOffer)}
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">Não Ultrapassar</div>
                </div>

              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 space-y-2">
              <button
                id="btn-copy-proposal-whatsapp"
                onClick={handleCopyProposal}
                className="w-full py-2.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs border border-slate-700 transition flex items-center justify-center space-x-2"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">Proposta Copiada para WhatsApp!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copiar Proposta Formatada (WhatsApp)</span>
                  </>
                )}
              </button>

              {onStartVehicleRegistration && (
                <button
                  id="btn-start-registration-from-calc"
                  onClick={() => {
                    if (isReadOnlyMode) {
                      openPaywallModal();
                    } else {
                      onStartVehicleRegistration({
                        ...plateData,
                        fipeValue,
                        maxOffer: result.maxRecommendedOffer,
                      });
                    }
                  }}
                  className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs transition flex items-center justify-center space-x-2"
                >
                  <Car className="w-4 h-4" />
                  <span>Cadastrar Este Veículo no Estoque</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
