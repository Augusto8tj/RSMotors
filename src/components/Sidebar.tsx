import React, { useMemo } from 'react';
import { 
  LayoutDashboard, 
  Car, 
  Boxes,
  Users,
  Calculator, 
  Search, 
  ReceiptText, 
  Settings, 
  Sparkles,
  Shield,
  Layers,
  Lock,
  AlertTriangle
} from 'lucide-react';
import { useAuthTenant } from '../context/AuthTenantContext';
import { UserRole } from '../types';
import { getStockAlertsByTenant } from '../services/dbService';
import { RSMotorsLogo } from './Brand/RSMotorsLogo';

export type NavTab = 'dashboard' | 'vehicles' | 'inventory' | 'sellers' | 'calculator' | 'plate_query' | 'cash_flow' | 'settings';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  activeAlertCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab, activeAlertCount = 0 }) => {
  const { tenant, user, isReadOnlyMode } = useAuthTenant();

  // Role permissions check
  const canAccessCashFlow = user.role === 'Admin' || user.role === 'Financeiro';
  const canAccessSettings = user.role === 'Admin';

  const menuItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Painel Executivo',
      description: 'KPIs, Giro de Pátio & ROI',
      icon: LayoutDashboard,
      allowed: true,
      badge: null,
    },
    {
      id: 'vehicles' as NavTab,
      label: 'Estoque & DRE Veicular',
      description: 'DRE por chassi e histórico',
      icon: Car,
      allowed: true,
      badge: null,
    },
    {
      id: 'inventory' as NavTab,
      label: 'Almoxarifado & Insumos',
      description: 'Alertas de estoque mínimo',
      icon: Boxes,
      allowed: true,
      badge: activeAlertCount > 0 ? `${activeAlertCount} alerta${activeAlertCount > 1 ? 's' : ''}` : null,
      badgeColor: activeAlertCount > 0 ? 'bg-amber-500/20 text-amber-300' : undefined,
    },
    {
      id: 'sellers' as NavTab,
      label: 'Desempenho de Vendedores',
      description: 'Lucro médio, ROI e Giro',
      icon: Users,
      allowed: true,
      badge: 'Relatório',
    },
    {
      id: 'calculator' as NavTab,
      label: 'Calculadora de Captação',
      description: 'Margem e Proposta Máxima',
      icon: Calculator,
      allowed: true,
      badge: 'Diferencial',
    },
    {
      id: 'plate_query' as NavTab,
      label: 'Consulta de Placa & FIPE',
      description: 'Sandbox & Tabela FIPE',
      icon: Search,
      allowed: true,
      badge: `${tenant.plateQueriesUsed}/${tenant.plateQueriesLimit}`,
    },
    {
      id: 'cash_flow' as NavTab,
      label: 'Meu Extrato & Caixa',
      description: 'Entradas, saídas e DRE geral',
      icon: ReceiptText,
      allowed: canAccessCashFlow,
      lockedReason: 'Restrito para Admin e Financeiro',
    },
    {
      id: 'settings' as NavTab,
      label: 'Monetização & Multi-Tenant',
      description: 'Planos, Trial, RBAC e Regras',
      icon: Settings,
      allowed: canAccessSettings,
      lockedReason: 'Apenas Administrador',
    },
  ];

  return (
    <aside className="hidden md:flex w-64 bg-[#0f172a] text-slate-300 flex-col justify-between p-4 border-r border-slate-800 flex-shrink-0 min-h-[calc(100vh-4rem)]">
      <div>
        {/* Brand Header */}
        <div className="px-1 py-2 mb-3 bg-gradient-to-b from-slate-900/90 to-slate-950/80 rounded-xl border border-slate-800/90 shadow-sm flex flex-col items-center justify-center">
          <RSMotorsLogo variant="full" size="md" showSubtitle={true} className="w-full px-1" />
        </div>

        {/* Tenant Plan & Credit Card */}
        <div className="mb-5 bg-slate-800 rounded-xl p-3.5 border border-slate-700/80 shadow-sm">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs font-semibold uppercase text-slate-200">
              {tenant.status === 'active' ? 'Plano Pro' : tenant.status === 'expired' ? 'Expirado' : 'Período Trial'}
            </span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                tenant.status === 'active'
                  ? 'bg-green-500/20 text-green-400'
                  : tenant.status === 'expired'
                  ? 'bg-rose-500/20 text-rose-400'
                  : 'bg-amber-500/20 text-amber-400'
              }`}
            >
              {tenant.status === 'active' ? 'Ativo' : tenant.status === 'expired' ? 'Expirado' : 'Trial'}
            </span>
          </div>
          <h3 className="text-xs font-bold text-white truncate mb-1">{tenant.name}</h3>
          
          <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden mt-2">
            <div
              className="bg-indigo-500 h-full transition-all duration-300"
              style={{
                width: `${Math.min(100, Math.round((tenant.plateQueriesUsed / tenant.plateQueriesLimit) * 100))}%`,
              }}
            />
          </div>
          <p className="text-[10px] mt-1.5 text-slate-400 flex items-center justify-between">
            <span>Consultas de Placa:</span>
            <span className="font-mono font-bold text-slate-200">
              {tenant.plateQueriesUsed}/{tenant.plateQueriesLimit}
            </span>
          </p>
        </div>

        {/* Navigation Items */}
        <div className="space-y-1">
          <div className="px-2 pb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Menu do Sistema
          </div>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isRestricted = !item.allowed;

            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                disabled={isRestricted}
                onClick={() => !isRestricted && onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors text-xs ${
                  isActive
                    ? 'bg-slate-800 text-white font-semibold shadow-xs'
                    : isRestricted
                    ? 'opacity-40 cursor-not-allowed text-slate-400 hover:bg-transparent'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
                title={isRestricted ? item.lockedReason : item.description}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`p-1.5 rounded-md ${
                      isActive
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-800/80 text-slate-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium truncate">{item.label}</div>
                  </div>
                </div>

                {isRestricted ? (
                  <Lock className="w-3.5 h-3.5 text-slate-400 ml-1 flex-shrink-0" />
                ) : item.badge ? (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ml-1 flex-shrink-0 ${item.badgeColor || 'bg-indigo-500/20 text-indigo-300'}`}>
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {/* User Info & RBAC Footer */}
      <div className="pt-4 border-t border-slate-800">
        <div className="flex items-center space-x-3 p-2 rounded-xl bg-slate-800/60 border border-slate-700/60">
          <img
            src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
            alt={user.name}
            className="w-8 h-8 rounded-full object-cover ring-1 ring-indigo-500/50"
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white truncate">{user.name}</p>
            <div className="flex items-center space-x-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-medium text-indigo-300 truncate">
                {user.role}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-2.5 text-[10px] text-slate-400 text-center flex items-center justify-center space-x-1">
          <Shield className="w-3 h-3 text-indigo-400" />
          <span>Isolamento Multi-Tenant Ativo</span>
        </div>
      </div>
    </aside>
  );
};
