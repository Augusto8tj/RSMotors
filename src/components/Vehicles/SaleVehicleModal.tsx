import React, { useState, useMemo } from 'react';
import { 
  X, 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  User, 
  Phone, 
  CreditCard, 
  Check, 
  Sparkles, 
  Clock, 
  Award 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Vehicle, VehicleExpense, PaymentMethod, VehicleSale } from '../../types';
import { calculateVehicleDRE } from '../../services/dbService';
import { useAuthTenant } from '../../context/AuthTenantContext';

interface SaleVehicleModalProps {
  isOpen: boolean;
  vehicle: Vehicle | null;
  expenses: VehicleExpense[];
  onClose: () => void;
  onRecordSale: (saleData: {
    tenantId: string;
    vehicleId: string;
    saleDate: string;
    salePrice: number;
    paymentMethod: PaymentMethod;
    commissionAmount: number;
    sellerId: string;
    sellerName: string;
    customerName: string;
    customerCpf?: string;
    customerPhone?: string;
    notes?: string;
  }) => void;
}

export const SaleVehicleModal: React.FC<SaleVehicleModalProps> = ({
  isOpen,
  vehicle,
  expenses,
  onClose,
  onRecordSale,
}) => {
  const { tenant, user } = useAuthTenant();

  if (!isOpen || !vehicle) return null;

  const vehicleExpenses = expenses.filter((e) => e.vehicleId === vehicle.id);
  const totalExpenses = vehicleExpenses.reduce((sum, e) => sum + e.amount, 0);

  const [salePrice, setSalePrice] = useState<number>(
    vehicle.targetSalePrice || vehicle.fipeAtPurchase || 120000
  );
  const [saleDate, setSaleDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [commissionAmount, setCommissionAmount] = useState<number>(1500);
  const [sellerName, setSellerName] = useState<string>(user.name || 'Mariana Costa');
  const [customerName, setCustomerName] = useState('');
  const [customerCpf, setCustomerCpf] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');

  // Live calculation of net profit, ROI, and days in yard
  const preview = useMemo(() => {
    const totalInvested = vehicle.purchasePrice + totalExpenses + commissionAmount;
    const netProfit = salePrice - totalInvested;
    const roiPercentage = totalInvested > 0 ? (netProfit / totalInvested) * 100 : 0;

    const entryTime = new Date(vehicle.entryDate).getTime();
    const saleTime = new Date(saleDate).getTime();
    const daysInYard = Math.max(1, Math.round((saleTime - entryTime) / (1000 * 60 * 60 * 24)));

    return {
      totalInvested,
      netProfit,
      roiPercentage: Math.round(roiPercentage * 10) / 10,
      daysInYard,
    };
  }, [vehicle, totalExpenses, commissionAmount, salePrice, saleDate]);

  const fmt = (v: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(v || 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || salePrice <= 0) {
      alert('Informe o nome do cliente comprador e o valor de venda.');
      return;
    }

    // Trigger celebratory confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // Ignored if canvas-confetti is in test environment
    }

    onRecordSale({
      tenantId: tenant.id,
      vehicleId: vehicle.id,
      saleDate,
      salePrice,
      paymentMethod,
      commissionAmount,
      sellerId: user.uid,
      sellerName,
      customerName,
      customerCpf,
      customerPhone,
      notes,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white border border-slate-200 w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden text-slate-900 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-slate-50 p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Registrar Venda & Apuração de Lucro
              </h2>
              <p className="text-xs text-slate-500">
                {vehicle.brand} {vehicle.model} ({vehicle.plate})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          
          {/* Live Profit Preview Banner */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-3 gap-3 text-center">
            <div>
              <span className="text-[11px] text-slate-500">Tempo de Pátio:</span>
              <div className="text-sm font-bold text-slate-900 flex items-center justify-center space-x-1 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                <span>{preview.daysInYard} dias</span>
              </div>
            </div>

            <div>
              <span className="text-[11px] text-slate-500">Lucro Líquido Real:</span>
              <div className={`text-base font-bold mt-0.5 ${preview.netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {fmt(preview.netProfit)}
              </div>
            </div>

            <div>
              <span className="text-[11px] text-slate-500">ROI Apurado:</span>
              <div className="text-base font-bold text-emerald-600 mt-0.5">
                {preview.roiPercentage}%
              </div>
            </div>
          </div>

          {/* Sale Value & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Valor Final Negociado de Venda (R$) *
              </label>
              <input
                id="sale-final-price"
                type="number"
                value={salePrice}
                onChange={(e) => setSalePrice(Number(e.target.value))}
                required
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-base font-bold text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Data Efetiva da Venda *
              </label>
              <input
                type="date"
                value={saleDate}
                onChange={(e) => setSaleDate(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Payment Method & Commission */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Forma de Pagamento</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-500"
              >
                <option value="pix">PIX (À Vista)</option>
                <option value="financiamento">Financiamento Bancário</option>
                <option value="cartao">Cartão de Crédito</option>
                <option value="ted">TED / Transferência</option>
                <option value="troca_com_troco">Troca com Troco</option>
                <option value="misto">Misto (Entrada + Financiamento)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Comissão do Vendedor (R$)</label>
              <input
                type="number"
                value={commissionAmount}
                onChange={(e) => setCommissionAmount(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Customer Details */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Dados do Comprador / Cliente
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Nome Completo *</label>
                <input
                  id="sale-customer-name"
                  type="text"
                  placeholder="Ex: Rodrigo Mendonça"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                  className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">CPF ou CNPJ</label>
                <input
                  type="text"
                  placeholder="Ex: 341.982.012-99"
                  value={customerCpf}
                  onChange={(e) => setCustomerCpf(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Telefone / WhatsApp</label>
                <input
                  type="text"
                  placeholder="Ex: (11) 99123-4567"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Vendedor Responsável</label>
                <input
                  type="text"
                  value={sellerName}
                  onChange={(e) => setSellerName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Observações da Venda</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Veículo entregue com termo de garantia de motor e câmbio assinado."
              className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Submit Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition flex items-center space-x-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Concluir Venda & Registrar Caixa</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
