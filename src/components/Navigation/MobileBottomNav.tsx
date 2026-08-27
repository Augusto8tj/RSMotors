import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Car, 
  Package, 
  Award, 
  Menu, 
  X, 
  Calculator, 
  Search, 
  ReceiptText, 
  Settings, 
  Building2, 
  UserCheck, 
  Clock, 
  Sparkles, 
  ShieldCheck,
  ChevronRight,
  Plus,
  AlertTriangle,
  LogOut
} from 'lucide-react';
import { NavTab } from '../Sidebar';
import { useAuthTenant } from '../../context/AuthTenantContext';
import { UserRole } from '../../types';
import { RSMotorsLogo } from '../Brand/RSMotorsLogo';

interface MobileBottomNavProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  activeAlertCount?: number;
  onOpenAddVehicle: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onSelectTab,
  activeAlertCount = 0,
  onOpenAddVehicle,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const {
    tenant,
    user,
    tenants,
    users,
    setTenantId,
    setUserRole,
    setUserUid,
    isTrial,
    trialDaysRemaining,
    isReadOnlyMode,
    openPaywallModal,
    logout,
  } = useAuthTenant();

  const handleTabClick = (tab: NavTab) => {
    onSelectTab(tab);
    setIsMenuOpen(false);
  };

  const isMoreActive = ['calculator', 'plate_query', 'cash_flow', 'settings'].includes(activeTab);

  const canAccessCashFlow = user.role === 'Admin' || user.role === 'Financeiro';
  const canAccessSettings = user.role === 'Admin';

  const roleColors: Record<UserRole, string> = {
    Admin: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    Comprador: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Vendedor: 'bg-blue-50 text-blue-700 border-blue-200',
    Financeiro: 'bg-amber-50 text-amber-700 border-amber-200',
  };

  return (
    <>
      {/* Mobile Drawer / Full Screen Menu Sheet */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative w-full max-h-[85vh] bg-[#0f172a] text-slate-200 rounded-t-3xl border-t border-slate-800 shadow-2xl flex flex-col overflow-hidden z-10 animate-in slide-in-from-bottom duration-300">
            
            {/* Header Handle */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
              <div className="flex items-center gap-3">
                <RSMotorsLogo variant="full" size="sm" showSubtitle={true} className="max-w-[170px]" />
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-full bg-slate-800 hover:bg-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-4 overflow-y-auto space-y-4 max-h-[calc(85vh-8rem)] pb-12">
              
              {/* Tenant & User Switcher Cards */}
              <div className="grid grid-cols-1 gap-2.5">
                {/* Tenant Switcher */}
                <div className="bg-slate-800/80 border border-slate-700 p-3 rounded-xl flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <Building2 className="w-4 h-4 text-amber-400" />
                    <div>
                      <div className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider">Empresa / Tenant</div>
                      <select
                        value={tenant.id}
                        onChange={(e) => setTenantId(e.target.value)}
                        className="bg-transparent font-bold text-xs text-white focus:outline-none cursor-pointer mt-0.5"
                      >
                        {tenants.map((t) => (
                          <option key={t.id} value={t.id} className="bg-slate-900 text-white">
                            {t.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {tenant.status === 'active' ? 'Plano Pro' : 'Trial'}
                  </span>
                </div>

                {/* User & Role Switcher */}
                <div className="bg-slate-800/80 border border-slate-700 p-3 rounded-xl flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-8 h-8 rounded-full border border-slate-600 object-cover"
                    />
                    <div>
                      <div className="text-xs font-bold text-white truncate max-w-[170px]">{user.name}</div>
                      <select
                        value={user.uid}
                        onChange={(e) => {
                          const selected = users.find((u) => u.uid === e.target.value);
                          if (selected) {
                            setUserUid(selected.uid);
                            setUserRole(selected.role);
                          }
                        }}
                        className="bg-transparent text-[11px] text-slate-300 focus:outline-none cursor-pointer mt-0.5"
                      >
                        {users.map((u) => (
                          <option key={u.uid} value={u.uid} className="bg-slate-900 text-white">
                            {u.name} ({u.role})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {user.role}
                  </span>
                </div>
              </div>

              {/* All Secondary Navigation Items */}
              <div className="space-y-1.5 pt-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
                  Módulos e Ferramentas
                </div>

                {/* Viability Calculator */}
                <button
                  onClick={() => handleTabClick('calculator')}
                  className={`w-full p-3 rounded-xl flex items-center justify-between transition border text-left ${
                    activeTab === 'calculator'
                      ? 'bg-indigo-600/30 border-indigo-500/50 text-white'
                      : 'bg-slate-800/50 border-slate-700/60 hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                      <Calculator className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Calculadora de Viabilidade</div>
                      <div className="text-[11px] text-slate-400">Margem alvo, proposta máxima e ROI</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>

                {/* Plate Query */}
                <button
                  onClick={() => handleTabClick('plate_query')}
                  className={`w-full p-3 rounded-xl flex items-center justify-between transition border text-left ${
                    activeTab === 'plate_query'
                      ? 'bg-indigo-600/30 border-indigo-500/50 text-white'
                      : 'bg-slate-800/50 border-slate-700/60 hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                      <Search className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Consulta de Placa & FIPE</div>
                      <div className="text-[11px] text-slate-400">Histórico de consultas ({tenant.plateQueriesUsed}/{tenant.plateQueriesLimit})</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>

                {/* Cash Flow */}
                <button
                  onClick={() => {
                    if (canAccessCashFlow) handleTabClick('cash_flow');
                  }}
                  disabled={!canAccessCashFlow}
                  className={`w-full p-3 rounded-xl flex items-center justify-between transition border text-left ${
                    !canAccessCashFlow
                      ? 'opacity-50 cursor-not-allowed bg-slate-900 border-slate-800 text-slate-500'
                      : activeTab === 'cash_flow'
                      ? 'bg-indigo-600/30 border-indigo-500/50 text-white'
                      : 'bg-slate-800/50 border-slate-700/60 hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
                      <ReceiptText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Meu Extrato & Caixa</div>
                      <div className="text-[11px] text-slate-400">Entradas, saídas e DRE geral</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>

                {/* Settings & Governance */}
                <button
                  onClick={() => {
                    if (canAccessSettings) handleTabClick('settings');
                  }}
                  disabled={!canAccessSettings}
                  className={`w-full p-3 rounded-xl flex items-center justify-between transition border text-left ${
                    !canAccessSettings
                      ? 'opacity-50 cursor-not-allowed bg-slate-900 border-slate-800 text-slate-500'
                      : activeTab === 'settings'
                      ? 'bg-indigo-600/30 border-indigo-500/50 text-white'
                      : 'bg-slate-800/50 border-slate-700/60 hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-slate-700 text-slate-300">
                      <Settings className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Configurações & Governança</div>
                      <div className="text-[11px] text-slate-400">Identidade visual, regras e RBAC</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>
              </div>

              {/* Quick Paywall / Plan Upgrade Trigger */}
              <div className="pt-2 space-y-2">
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    openPaywallModal();
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white text-xs font-bold transition flex items-center justify-center space-x-2 shadow-lg shadow-amber-900/20"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Ver Planos & Upgrade RSmotors</span>
                </button>

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    logout();
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 border border-slate-700 text-xs font-bold transition flex items-center justify-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Trocar Usuário / Sair da Conta</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button for Quick Vehicle Registration on Mobile */}
      <div className="fixed bottom-20 right-4 z-30 md:hidden animate-in zoom-in-95 duration-200">
        <button
          onClick={onOpenAddVehicle}
          className="w-13 h-13 rounded-full bg-gradient-to-tr from-indigo-700 to-indigo-500 text-white flex items-center justify-center shadow-xl shadow-indigo-950/40 border-2 border-white/20 active:scale-95 transition"
          aria-label="Cadastrar novo veículo"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>

      {/* Sticky Mobile Bottom Navigation Bar (iOS / Android Home Bar friendly) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[#0f172a]/95 backdrop-blur-md border-t border-slate-800 text-slate-400 shadow-2xl px-2 pt-1 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <div className="grid grid-cols-5 items-center justify-between max-w-md mx-auto">
          
          {/* Tab 1: Dashboard */}
          <button
            onClick={() => handleTabClick('dashboard')}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition min-h-[48px] ${
              activeTab === 'dashboard'
                ? 'text-amber-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`p-1 rounded-lg transition ${activeTab === 'dashboard' ? 'bg-amber-400/10' : ''}`}>
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight mt-0.5">Painel</span>
          </button>

          {/* Tab 2: Vehicles / Fleet */}
          <button
            onClick={() => handleTabClick('vehicles')}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition min-h-[48px] ${
              activeTab === 'vehicles'
                ? 'text-amber-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`p-1 rounded-lg transition ${activeTab === 'vehicles' ? 'bg-amber-400/10' : ''}`}>
              <Car className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight mt-0.5">Estoque</span>
          </button>

          {/* Tab 3: Inventory / Insumos (With Alert Badge) */}
          <button
            onClick={() => handleTabClick('inventory')}
            className={`relative flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition min-h-[48px] ${
              activeTab === 'inventory'
                ? 'text-amber-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`p-1 rounded-lg transition relative ${activeTab === 'inventory' ? 'bg-amber-400/10' : ''}`}>
              <Package className="w-5 h-5" />
              {activeAlertCount > 0 && (
                <span className="absolute -top-1 -right-1.5 w-4 h-4 bg-rose-500 text-white font-bold text-[9px] rounded-full flex items-center justify-center shadow-xs">
                  {activeAlertCount}
                </span>
              )}
            </div>
            <span className="text-[10px] tracking-tight mt-0.5">Peças</span>
          </button>

          {/* Tab 4: Sellers Performance */}
          <button
            onClick={() => handleTabClick('sellers')}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition min-h-[48px] ${
              activeTab === 'sellers'
                ? 'text-amber-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`p-1 rounded-lg transition ${activeTab === 'sellers' ? 'bg-amber-400/10' : ''}`}>
              <Award className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight mt-0.5">Vendas</span>
          </button>

          {/* Tab 5: More / Drawer Menu */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition min-h-[48px] ${
              isMoreActive || isMenuOpen
                ? 'text-amber-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`p-1 rounded-lg transition ${isMoreActive || isMenuOpen ? 'bg-amber-400/10' : ''}`}>
              <Menu className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight mt-0.5">Mais</span>
          </button>

        </div>
      </nav>
    </>
  );
};
