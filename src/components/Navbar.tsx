import React from 'react';
import { 
  Building2, 
  UserCheck, 
  Clock, 
  Search, 
  Plus, 
  Calculator, 
  Sparkles, 
  ShieldAlert, 
  CheckCircle2, 
  Lock,
  ArrowRight
} from 'lucide-react';
import { useAuthTenant } from '../context/AuthTenantContext';
import { UserRole } from '../types';

interface NavbarProps {
  onOpenAddVehicle: () => void;
  onOpenCalculator: () => void;
  onOpenPlateQuery: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAddVehicle,
  onOpenCalculator,
  onOpenPlateQuery,
}) => {
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
    toggleSimulateExpiredTrial,
    openPaywallModal,
  } = useAuthTenant();

  const roleColors: Record<UserRole, string> = {
    Admin: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    Comprador: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Vendedor: 'bg-blue-50 text-blue-700 border-blue-200',
    Financeiro: 'bg-amber-50 text-amber-700 border-amber-200',
  };

  return (
    <header className="bg-white border-b border-slate-200 text-slate-900 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Tenant Indicator & Section Title */}
          <div className="flex items-center gap-3">
            <h1 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight hidden md:block">
              Dashboard Executivo
            </h1>
            <span className="text-slate-300 hidden md:inline">|</span>
            <div className="flex items-center space-x-1.5 bg-slate-100 text-slate-700 px-3 py-1 rounded-full border border-slate-200 text-xs">
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              <span>Tenant:</span>
              <select
                id="tenant-switcher-select"
                value={tenant.id}
                onChange={(e) => setTenantId(e.target.value)}
                className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer pr-1"
                title="Trocar Empresa (Multi-Tenant)"
              >
                {tenants.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Center Action Shortcuts */}
          <div className="flex items-center space-x-2">
            <button
              id="nav-quick-calc-btn"
              onClick={onOpenCalculator}
              className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200 text-xs font-semibold transition shadow-xs"
            >
              <Calculator className="w-3.5 h-3.5 text-indigo-600" />
              <span>Calculadora</span>
            </button>
            <button
              id="nav-quick-plate-btn"
              onClick={onOpenPlateQuery}
              className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200 text-xs font-semibold transition shadow-xs"
            >
              <Search className="w-3.5 h-3.5 text-slate-500" />
              <span>Consultar Placa</span>
            </button>
            <button
              id="nav-quick-add-vehicle-btn"
              onClick={() => {
                if (isReadOnlyMode) {
                  openPaywallModal();
                } else {
                  onOpenAddVehicle();
                }
              }}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition shadow-sm ${
                isReadOnlyMode
                  ? 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/10'
              }`}
            >
              {isReadOnlyMode ? (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Novo Veículo (Bloqueado)</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Cadastrar Veículo</span>
                </>
              )}
            </button>
          </div>

          {/* Right User & RBAC Controls */}
          <div className="flex items-center space-x-3">
            
            {/* Trial Status Pill */}
            {isTrial && (
              <div className="hidden xl:flex items-center space-x-2">
                <div
                  className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                    isReadOnlyMode
                      ? 'bg-rose-50 border-rose-200 text-rose-700'
                      : 'bg-amber-50 border-amber-200 text-amber-800'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    {isReadOnlyMode ? 'Trial Expirado' : `Trial: ${trialDaysRemaining}d`}
                  </span>
                </div>
                
                <button
                  id="btn-simulate-trial-toggle"
                  onClick={toggleSimulateExpiredTrial}
                  title="Alternar para testar bloqueio de Paywall"
                  className="text-[11px] px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 transition"
                >
                  {isReadOnlyMode ? 'Reativar' : 'Simular'}
                </button>
              </div>
            )}

            {/* RBAC Role Switcher */}
            <div className="flex items-center space-x-1 bg-slate-100 rounded-lg p-1 border border-slate-200">
              <UserCheck className="w-3.5 h-3.5 text-slate-500 ml-1" />
              <select
                id="rbac-role-switcher-select"
                value={user.role}
                onChange={(e) => setUserRole(e.target.value as UserRole)}
                className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none pr-1 cursor-pointer"
                title="Trocar Perfil RBAC"
              >
                <option value="Admin">Admin</option>
                <option value="Comprador">Comprador</option>
                <option value="Vendedor">Vendedor</option>
                <option value="Financeiro">Financeiro</option>
              </select>
            </div>

            {/* User Profile Overview */}
            <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-900 leading-tight">{user.name}</p>
                <p className="text-[10px] text-slate-500">{user.role}</p>
              </div>
              <img
                src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover border border-slate-200 shadow-xs"
              />
            </div>

          </div>

        </div>
      </div>
      
      {/* Read-only Alert Bar if trial is expired */}
      {isReadOnlyMode && (
        <div className="bg-rose-600 text-white px-4 py-1.5 text-xs font-medium flex items-center justify-between shadow-inner">
          <div className="flex items-center space-x-2 max-w-7xl mx-auto w-full">
            <Lock className="w-4 h-4 flex-shrink-0" />
            <span>
              <strong>Período de teste expirado:</strong> O sistema está operando em <strong>modo somente-leitura</strong>. Lançamentos, edições e cadastros estão bloqueados até a contratação de um plano ativo.
            </span>
            <button
              onClick={openPaywallModal}
              className="ml-auto underline font-bold hover:text-rose-100 flex items-center space-x-1 flex-shrink-0"
            >
              <span>Ver Planos & Assinar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
