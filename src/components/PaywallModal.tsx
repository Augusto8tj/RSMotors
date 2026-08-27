import React from 'react';
import { 
  X, 
  ShieldCheck, 
  Check, 
  Zap, 
  Sparkles, 
  Lock, 
  Clock, 
  Building2, 
  CreditCard,
  AlertCircle
} from 'lucide-react';
import { useAuthTenant } from '../context/AuthTenantContext';

export const PaywallModal: React.FC = () => {
  const { 
    isPaywallModalOpen, 
    closePaywallModal, 
    tenant, 
    upgradePlan, 
    trialDaysRemaining,
    isReadOnlyMode 
  } = useAuthTenant();

  if (!isPaywallModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden text-slate-900 flex flex-col">
        
        {/* Header */}
        <div className="relative bg-slate-50 p-6 border-b border-slate-200 flex items-start justify-between">
          <div>
            <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AutoFleet SaaS Enterprise</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {isReadOnlyMode ? 'Período de Testes Expirado' : 'Assinatura & Planos AutoFleet'}
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-lg">
              {isReadOnlyMode 
                ? 'Seus dados e relatórios estão seguros e disponíveis em modo somente-leitura. Assine um plano para reativar cadastros, lançamentos de custos e consultas de placas.'
                : 'Aumente a rentabilidade e o giro de estoque da sua revendedora com nossa plataforma completa de captação e DRE.'}
            </p>
          </div>
          
          <button
            id="close-paywall-modal-btn"
            onClick={closePaywallModal}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Plans Comparison */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Plan PRO */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col justify-between hover:border-indigo-300 transition shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-base text-slate-900">Plano Pro</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                  Mais Popular
                </span>
              </div>
              <div className="flex items-baseline space-x-1 mb-4">
                <span className="text-2xl font-bold text-slate-900">R$ 297</span>
                <span className="text-xs text-slate-500">/mês por loja</span>
              </div>

              <ul className="space-y-2 text-xs text-slate-600 mb-6">
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                  <span>Estoque ilimitado de veículos</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                  <span>DRE individual por Chassi & Placa</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                  <span><strong>150 consultas</strong> de placa/mês incluídas</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                  <span>Calculadora de viabilidade e teto FIPE</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                  <span>Até 5 usuários com RBAC</span>
                </li>
              </ul>
            </div>

            <button
              id="btn-upgrade-pro"
              onClick={() => upgradePlan('pro')}
              className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs transition flex items-center justify-center space-x-2"
            >
              <Zap className="w-4 h-4" />
              <span>Contratar Plano Pro</span>
            </button>
          </div>

          {/* Plan ENTERPRISE */}
          <div className="rounded-xl border-2 border-indigo-600 bg-indigo-50/20 p-5 flex flex-col justify-between relative shadow-sm">
            <div className="absolute -top-3 right-4 bg-indigo-600 text-white text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full shadow-xs">
              Recomendado
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-base text-slate-900">Plano Enterprise</span>
              </div>
              <div className="flex items-baseline space-x-1 mb-4">
                <span className="text-2xl font-bold text-indigo-600">R$ 590</span>
                <span className="text-xs text-slate-500">/mês por rede</span>
              </div>

              <ul className="space-y-2 text-xs text-slate-600 mb-6">
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                  <span>Múltiplos pátios / filiais ilimitadas</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                  <span><strong>500 consultas</strong> de placa/mês incluídas</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                  <span>DRE Avançado, Alertas de Giro de Pátio</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                  <span>Usuários ilimitados e auditoria completa</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                  <span>Suporte prioritário via WhatsApp</span>
                </li>
              </ul>
            </div>

            <button
              id="btn-upgrade-enterprise"
              onClick={() => upgradePlan('enterprise')}
              className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs transition flex items-center justify-center space-x-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Contratar Enterprise</span>
            </button>
          </div>

        </div>

        {/* Guarantee Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Garantia de 7 dias ou cancelamento sem custos. Faturamento via Boleto, Cartão ou PIX.</span>
          </div>
          <button
            onClick={closePaywallModal}
            className="text-slate-500 hover:text-slate-800 underline text-xs ml-4"
          >
            Continuar Navegando
          </button>
        </div>

      </div>
    </div>
  );
};
