import React, { useState } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Gauge, 
  TrendingUp, 
  Users,
  Award,
  MapPin,
  Phone,
  Shield
} from 'lucide-react';
import { useAuthTenant } from '../../context/AuthTenantContext';
import { RSMotorsLogo } from '../Brand/RSMotorsLogo';
import { UserRole } from '../../types';

export const TenantLoginView: React.FC = () => {
  const {
    tenant,
    users,
    login,
  } = useAuthTenant();

  const [selectedUserUid, setSelectedUserUid] = useState<string>('user-admin-01');
  const [rememberMe, setRememberMe] = useState<boolean>(true);

  const selectedUser = users.find((u) => u.uid === selectedUserUid) || users[0];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(tenant.id, selectedUserUid);
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'Admin':
        return { label: 'Diretora Geral & Admin', desc: 'Acesso Irrestrito (DRE, Caixa, Configurações)', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
      case 'Comprador':
        return { label: 'Captação & Compras', desc: 'Avaliação, Compra e Estoque', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
      case 'Vendedor':
        return { label: 'Consultor(a) de Vendas', desc: 'Propostas, Vendas e Comissões', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' };
      case 'Financeiro':
        return { label: 'Controladoria & Finanças', desc: 'DRE, Caixa e Lançamentos', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40' };
      default:
        return { label: role, desc: 'Acesso Operacional', color: 'bg-slate-700 text-slate-300 border-slate-600' };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#0a0f1d] to-slate-900 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans">
      
      {/* Background Decorative Lighting & Speedometer Graphic Effect */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Branding Bar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-7 flex items-center justify-between border-b border-slate-800/60">
        <RSMotorsLogo variant="full" size="lg" showSubtitle={true} className="max-w-[220px] sm:max-w-[320px]" />
        
        <div className="hidden sm:flex items-center space-x-2 bg-slate-900/80 border border-amber-500/30 px-4 py-2 rounded-full text-xs text-amber-300/90 shadow-sm shadow-amber-950/20">
          <Award className="w-4 h-4 text-amber-400" />
          <span>Portal Corporativo Oficial • RSmotors Soluções Veiculares</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col items-center justify-center">
        
        <div className="text-center max-w-2xl mb-8 space-y-3">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Sistema Integrado de Gestão Veicular</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Acesse seu Perfil de Trabalho
          </h1>
          <p className="text-sm sm:text-base text-slate-400">
            Selecione o colaborador da equipe <span className="text-white font-semibold">RSmotors</span> para entrar no sistema com suas permissões dedicadas.
          </p>
        </div>

        {/* Login Container Box */}
        <div className="w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-md">
          
          <form onSubmit={handleLogin} className="space-y-8">
            
            {/* Empresa Header Info */}
            <div className="relative p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-amber-950/25 to-slate-900 border border-amber-500/35 shadow-inner flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">{tenant.name}</h2>
                    <span className="text-[10px] uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-extrabold">
                      Matriz
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 mt-1">
                    <span>CNPJ: <strong className="text-slate-300">{tenant.cnpj}</strong></span>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-amber-400" /> {tenant.city}/{tenant.state}</span>
                    <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-amber-400" /> {tenant.phone}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Plano Pro Ativo</span>
                </span>
              </div>
            </div>

            {/* SELEÇÃO DE COLABORADOR / USUÁRIO DA RSMOTORS */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold border border-amber-500/30">
                    <Users className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    Colaboradores & Perfis Autorizados
                  </h3>
                </div>
                <span className="text-xs text-slate-400 font-medium">
                  {users.length} usuários cadastrados
                </span>
              </div>

              {/* Grid of Users */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {users.map((u) => {
                  const isUserSelected = selectedUserUid === u.uid;
                  const badge = getRoleBadge(u.role);
                  const isDirector = u.role === 'Admin';

                  return (
                    <div
                      key={u.uid}
                      onClick={() => setSelectedUserUid(u.uid)}
                      className={`relative p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between text-left ${
                        isUserSelected
                          ? 'bg-gradient-to-br from-slate-900 via-amber-950/40 to-slate-900 border-amber-500/90 shadow-xl shadow-amber-950/30 ring-1 ring-amber-500/60'
                          : 'bg-slate-800/40 border-slate-800 hover:bg-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="relative">
                          <img
                            src={u.avatarUrl}
                            alt={u.name}
                            className={`w-12 h-12 rounded-full border-2 object-cover ${
                              isUserSelected ? 'border-amber-400 ring-2 ring-amber-500/30' : 'border-slate-700'
                            }`}
                          />
                          {isDirector && (
                            <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 p-0.5 rounded-full text-[10px]" title="Diretora Geral">
                              👑
                            </span>
                          )}
                        </div>

                        {isUserSelected ? (
                          <div className="p-1 rounded-full bg-amber-500 text-slate-950">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full border border-slate-700" />
                        )}
                      </div>

                      <div className="space-y-0.5">
                        <h4 className="font-bold text-sm text-white line-clamp-1 leading-snug">
                          {u.name}
                        </h4>
                        <p className="text-xs text-slate-400 truncate">{u.email}</p>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${badge.color}`}>
                          {badge.label}
                        </span>

                        <span className="text-[10px] text-slate-400 font-mono">
                          {u.role === 'Admin' ? 'Total' : 'Setorial'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Summary & Submit Action */}
            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <label className="flex items-center space-x-2 text-xs text-slate-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-800 text-amber-500 focus:ring-amber-500"
                />
                <span>Lembrar meu usuário neste dispositivo</span>
              </label>

              <button
                type="submit"
                id="btn-entrar-plataforma"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-sm tracking-wide transition shadow-xl shadow-amber-950/40 flex items-center justify-center space-x-2 group active:scale-98 cursor-pointer"
              >
                <span>Acessar RSmotors como {selectedUser?.name.split(' ')[0]}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </button>
            </div>

          </form>

        </div>

        {/* Feature Highlights Footer */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-5xl w-full mt-8">
          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60 flex items-center space-x-3 text-slate-400">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
              <Gauge className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <strong className="text-slate-200 block">Regra de Ouro do Pátio</strong>
              Cálculo contínuo de dias de permanência e alertas de giro de estoque.
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60 flex items-center space-x-3 text-slate-400">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <strong className="text-slate-200 block">DRE Unitário Real</strong>
              Rentabilidade individual por veículo com FIPE congelada e margem líquida.
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60 flex items-center space-x-3 text-slate-400">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <strong className="text-slate-200 block">Controle RBAC Seguro</strong>
              Permissões personalizadas para Diretoria, Vendas, Compras e Financeiro.
            </div>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 text-center text-xs text-slate-500 border-t border-slate-800/50">
        <p>
          RSmotors - Soluções Veiculares &copy; {new Date().getFullYear()} • Diretora Gerente: Samara Jéssica Moura De Seixas
        </p>
      </footer>

    </div>
  );
};
