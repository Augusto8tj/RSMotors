import React, { useState } from 'react';
import { 
  X, 
  Wrench, 
  DollarSign, 
  Calendar, 
  Building, 
  Receipt, 
  Check, 
  Tag 
} from 'lucide-react';
import { Vehicle, VehicleExpense, ExpenseCategory } from '../../types';
import { useAuthTenant } from '../../context/AuthTenantContext';

interface AddExpenseModalProps {
  isOpen: boolean;
  vehicles: Vehicle[];
  selectedVehicle?: Vehicle | null;
  onClose: () => void;
  onSave: (expense: Omit<VehicleExpense, 'id' | 'createdAt'>) => void;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  vehicles,
  selectedVehicle,
  onClose,
  onSave,
}) => {
  const { tenant, user } = useAuthTenant();

  const [vehicleId, setVehicleId] = useState<string>(
    selectedVehicle?.id || vehicles[0]?.id || ''
  );
  const [category, setCategory] = useState<ExpenseCategory>('mecanica');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number>(500);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [supplier, setSupplier] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [status, setStatus] = useState<'paid' | 'pending'>('paid');
  const [responsibleUser, setResponsibleUser] = useState(user.name || 'Juliana Mendes');

  if (!isOpen) return null;

  const currentVeh = vehicles.find((v) => v.id === vehicleId) || selectedVehicle || vehicles[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleId || amount <= 0 || !description) {
      alert('Preencha os campos obrigatórios.');
      return;
    }

    onSave({
      tenantId: tenant.id,
      vehicleId,
      category,
      description,
      amount,
      date,
      responsibleUser,
      supplier,
      invoiceNumber,
      status,
    });

    onClose();
  };

  const categories: { id: ExpenseCategory; label: string }[] = [
    { id: 'funilaria', label: 'Funilaria & Pintura' },
    { id: 'mecanica', label: 'Mecânica & Revisão' },
    { id: 'despachante', label: 'Despachante & IPVA' },
    { id: 'higienizacao', label: 'Higienização & Detail' },
    { id: 'pneus', label: 'Pneus & Geometria' },
    { id: 'laudo', label: 'Laudo Cautelar' },
    { id: 'acessorios', label: 'Acessórios' },
    { id: 'outros', label: 'Outras Despesas' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 w-full max-w-lg rounded-xl shadow-2xl overflow-hidden text-slate-900 flex flex-col">
        
        {/* Header */}
        <div className="bg-slate-50 p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">Lançar Custo no DRE por Chassi</h2>
              <p className="text-xs text-slate-500">Vincula despesas de preparação diretamente ao veículo.</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Select Vehicle */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Veículo / Placa Alvo *</label>
            <select
              id="expense-vehicle-select"
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-500"
            >
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.plate} — {v.brand} {v.model} ({v.status})
                </option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Categoria do Serviço *</label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((c) => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => setCategory(c.id)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold text-left transition border ${
                    category === c.id
                      ? 'bg-amber-50 text-amber-800 border-amber-300 shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-white hover:text-slate-900'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Descrição do Serviço / Peça *</label>
            <input
              type="text"
              placeholder="Ex: Troca de óleo sintético 5W30 e pastilhas de freio"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Amount & Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Valor do Custo (R$) *</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">R$</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  required
                  min={1}
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-white border border-slate-200 text-sm font-bold text-amber-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Data do Serviço *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Supplier & Invoice */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Fornecedor / Oficina</label>
              <input
                type="text"
                placeholder="Ex: Auto Mecânica Bosch"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Nº Nota Fiscal / O.S.</label>
              <input
                type="text"
                placeholder="Ex: NF-4410"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-xs transition flex items-center space-x-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Gravar Despesa no DRE</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
