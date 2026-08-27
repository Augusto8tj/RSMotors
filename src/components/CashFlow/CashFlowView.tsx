import React, { useState, useMemo } from 'react';
import { 
  ReceiptText, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Tag, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Building,
  CheckCircle2,
  Lock,
  X
} from 'lucide-react';
import { CashFlowItem, CashFlowType, CashFlowCategory } from '../../types';
import { useAuthTenant } from '../../context/AuthTenantContext';

interface CashFlowViewProps {
  cashFlowItems: CashFlowItem[];
  onAddCashFlowItem: (item: Omit<CashFlowItem, 'id' | 'createdAt'>) => void;
}

export const CashFlowView: React.FC<CashFlowViewProps> = ({
  cashFlowItems,
  onAddCashFlowItem,
}) => {
  const { tenant, user, isReadOnlyMode, openPaywallModal } = useAuthTenant();

  const [typeFilter, setTypeFilter] = useState<'todos' | CashFlowType>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New item state
  const [newType, setNewType] = useState<CashFlowType>('saida');
  const [newCategory, setNewCategory] = useState<CashFlowCategory>('aluguel_loja');
  const [newAmount, setNewAmount] = useState<number>(3500);
  const [newDate, setNewDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [newDescription, setNewDescription] = useState('');

  // Metrics
  const summary = useMemo(() => {
    let totalEntradas = 0;
    let totalSaidas = 0;

    cashFlowItems.forEach((item) => {
      if (item.type === 'entrada') {
        totalEntradas += item.amount;
      } else {
        totalSaidas += item.amount;
      }
    });

    return {
      totalEntradas,
      totalSaidas,
      saldoLiquido: totalEntradas - totalSaidas,
    };
  }, [cashFlowItems]);

  // Filtered items
  const filteredItems = useMemo(() => {
    return cashFlowItems.filter((item) => {
      const matchesType = typeFilter === 'todos' || item.type === typeFilter;
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        !term ||
        item.description.toLowerCase().includes(term) ||
        (item.vehiclePlate && item.vehiclePlate.toLowerCase().includes(term));
      return matchesType && matchesSearch;
    });
  }, [cashFlowItems, typeFilter, searchTerm]);

  const fmt = (v: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(v || 0);
  };

  const handleSaveNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAmount <= 0 || !newDescription) {
      alert('Preencha a descrição e um valor válido.');
      return;
    }

    onAddCashFlowItem({
      tenantId: tenant.id,
      type: newType,
      category: newCategory,
      amount: newAmount,
      date: newDate,
      description: newDescription,
      status: 'confirmado',
      responsible: user.name || 'Financeiro',
    });

    setIsAddModalOpen(false);
    setNewDescription('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
              <ReceiptText className="w-5 h-5" />
            </div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">Meu Extrato & Fluxo de Caixa</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Controle consolidado de receitas de vendas de veículos e despesas operacionais da loja.
          </p>
        </div>

        <button
          id="btn-add-cashflow-item"
          onClick={() => {
            if (isReadOnlyMode) openPaywallModal();
            else setIsAddModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs transition flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Lançamento</span>
        </button>
      </div>

      {/* 3 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Entradas */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total de Entradas</span>
            <div className="text-2xl font-bold text-emerald-600 mt-1">{fmt(summary.totalEntradas)}</div>
            <span className="text-[11px] text-slate-400">Receitas de vendas de veículos</span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <ArrowUpRight className="w-6 h-6" />
          </div>
        </div>

        {/* Saídas */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total de Saídas</span>
            <div className="text-2xl font-bold text-rose-600 mt-1">{fmt(summary.totalSaidas)}</div>
            <span className="text-[11px] text-slate-400">Captação, oficinas e despesas fixas</span>
          </div>
          <div className="p-3 rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
            <ArrowDownLeft className="w-6 h-6" />
          </div>
        </div>

        {/* Saldo Líquido */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Saldo Líquido Acumulado</span>
            <div className={`text-2xl font-bold mt-1 ${summary.saldoLiquido >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {fmt(summary.saldoLiquido)}
            </div>
            <span className="text-[11px] text-slate-400">Resultado operacional do período</span>
          </div>
          <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            id="cashflow-search-input"
            type="text"
            placeholder="Buscar por descrição, placa ou fornecedor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
          <button
            onClick={() => setTypeFilter('todos')}
            className={`px-3 py-1 rounded-md font-medium transition ${
              typeFilter === 'todos' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Todos ({cashFlowItems.length})
          </button>
          <button
            onClick={() => setTypeFilter('entrada')}
            className={`px-3 py-1 rounded-md font-semibold transition ${
              typeFilter === 'entrada'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            Entradas
          </button>
          <button
            onClick={() => setTypeFilter('saida')}
            className={`px-3 py-1 rounded-md font-semibold transition ${
              typeFilter === 'saida'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-rose-700 hover:bg-rose-50'
            }`}
          >
            Saídas
          </button>
        </div>
      </div>

      {/* Cash Flow Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Data</th>
                <th className="py-3.5 px-4">Tipo</th>
                <th className="py-3.5 px-4">Categoria</th>
                <th className="py-3.5 px-4">Descrição do Lançamento</th>
                <th className="py-3.5 px-4">Responsável</th>
                <th className="py-3.5 px-4 text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    Nenhum lançamento financeiro encontrado.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isEntrada = item.type === 'entrada';
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 font-medium text-slate-600">{item.date}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isEntrada
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {isEntrada ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownLeft className="w-3 h-3" />}
                          <span>{item.type}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="capitalize text-slate-600 font-medium">
                          {item.category.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{item.description}</div>
                        {item.vehiclePlate && (
                          <span className="font-mono text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 mt-0.5 inline-block">
                            Placa: {item.vehiclePlate}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">{item.responsible}</td>
                      <td className="py-3.5 px-4 text-right font-bold font-mono text-sm">
                        <span className={isEntrada ? 'text-emerald-600' : 'text-rose-600'}>
                          {isEntrada ? '+' : '-'} {fmt(item.amount)}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-xl shadow-xl overflow-hidden text-slate-900 flex flex-col">
            <div className="bg-slate-50 p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">Novo Lançamento de Caixa</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNewItem} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setNewType('saida')}
                  className={`py-2 rounded-lg font-bold border transition ${
                    newType === 'saida'
                      ? 'bg-rose-50 text-rose-700 border-rose-300'
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  Saída (Despesa)
                </button>
                <button
                  type="button"
                  onClick={() => setNewType('entrada')}
                  className={`py-2 rounded-lg font-bold border transition ${
                    newType === 'entrada'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  Entrada (Receita)
                </button>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">Categoria Contábil</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as CashFlowCategory)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500"
                >
                  <option value="aluguel_loja">Aluguel do Showroom / Pátio</option>
                  <option value="marketing">Marketing & Anúncios (Webmotors/Ads)</option>
                  <option value="salarios">Salários & Pró-Labore</option>
                  <option value="impostos">Impostos & Taxas</option>
                  <option value="recondicionamento">Serviço de Oficina Avulso</option>
                  <option value="outros">Outras Despesas</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">Descrição</label>
                <input
                  type="text"
                  placeholder="Ex: Pagamento mensal de internet e energia"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Valor (R$)</label>
                  <input
                    type="number"
                    value={newAmount}
                    onChange={(e) => setNewAmount(Number(e.target.value))}
                    required
                    min={1}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:outline-none focus:bg-white focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Data</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-xs"
                >
                  Confirmar Lançamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
