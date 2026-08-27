import React, { useState } from 'react';
import { 
  X, 
  Search, 
  Car, 
  Calendar, 
  DollarSign, 
  ShieldCheck, 
  Sparkles, 
  AlertCircle, 
  Check, 
  Lock 
} from 'lucide-react';
import { Vehicle, PlateQueryResult } from '../../types';
import { queryPlateData, isValidBrazilianPlate } from '../../services/plateFipeService';
import { useAuthTenant } from '../../context/AuthTenantContext';

interface AddVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (vehicleData: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>) => void;
  initialData?: Partial<PlateQueryResult> & { maxOffer?: number };
}

export const AddVehicleModal: React.FC<AddVehicleModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const { tenant, user, consumePlateCredit } = useAuthTenant();

  const [plate, setPlate] = useState(initialData?.plate || '');
  const [brand, setBrand] = useState(initialData?.brand || '');
  const [model, setModel] = useState(initialData?.model || '');
  const [version, setVersion] = useState(initialData?.version || '');
  const [yearFab, setYearFab] = useState<number>(initialData?.yearFab || 2022);
  const [yearModel, setYearModel] = useState<number>(initialData?.yearModel || 2023);
  const [color, setColor] = useState(initialData?.color || 'Prata');
  const [fuel, setFuel] = useState(initialData?.fuel || 'Flex');
  const [chassis, setChassis] = useState(initialData?.chassisMasked || '9BWDB41J2N8091823');
  const [mileage, setMileage] = useState<number>(35000);
  const [fipeAtPurchase, setFipeAtPurchase] = useState<number>(initialData?.fipeValue || 110000);
  const [fipeCode, setFipeCode] = useState(initialData?.fipeCode || '005517-4');
  const [fipeMonthRef, setFipeMonthRef] = useState(initialData?.fipeRefMonth || 'Março de 2026');
  const [purchasePrice, setPurchasePrice] = useState<number>(initialData?.maxOffer || 88000);
  const [entryDate, setEntryDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<Vehicle['status']>('Em Operação');
  const [buyerName, setBuyerName] = useState<string>(user.name || 'Roberto Silveira');
  const [notes, setNotes] = useState('');
  const [targetSalePrice, setTargetSalePrice] = useState<number>(initialData?.fipeValue || 108000);

  const [isSearchingPlate, setIsSearchingPlate] = useState(false);
  const [plateSearchError, setPlateSearchError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleQueryPlate = async () => {
    if (!isValidBrazilianPlate(plate)) {
      setPlateSearchError('Placa inválida. Utilize padrão Mercosul (ABC1D23) ou tradicional (ABC1234).');
      return;
    }

    setIsSearchingPlate(true);
    setPlateSearchError(null);

    try {
      const data = await queryPlateData(plate, tenant.id, () => {
        consumePlateCredit();
      });

      setBrand(data.brand);
      setModel(data.model);
      setVersion(data.version);
      setYearFab(data.yearFab);
      setYearModel(data.yearModel);
      setColor(data.color);
      setFuel(data.fuel);
      setChassis(data.chassisMasked);
      setFipeAtPurchase(data.fipeValue);
      setFipeCode(data.fipeCode);
      setFipeMonthRef(data.fipeRefMonth);
      setTargetSalePrice(data.fipeValue);
      if (purchasePrice === 0 || purchasePrice === 88000) {
        // Suggest 80% of FIPE
        setPurchasePrice(Math.round(data.fipeValue * 0.8));
      }
    } catch (err: any) {
      setPlateSearchError(err.message || 'Erro ao consultar placa');
    } finally {
      setIsSearchingPlate(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!plate || !brand || !model || purchasePrice <= 0) {
      alert('Preencha os campos obrigatórios e um preço de compra válido.');
      return;
    }

    onSave({
      tenantId: tenant.id,
      plate: plate.toUpperCase().trim(),
      chassis,
      brand,
      model,
      version,
      yearFab,
      yearModel,
      color,
      fuel,
      mileage,
      fipeAtPurchase,
      fipeCode,
      fipeMonthRef,
      purchasePrice,
      entryDate,
      status,
      buyerId: user.uid,
      buyerName,
      notes,
      photos: [
        'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80'
      ],
      targetSalePrice,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white border border-slate-200 w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden text-slate-900 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-slate-50 p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">Cadastrar Novo Veículo no Estoque</h2>
              <p className="text-xs text-slate-500">Consulte pela placa para preenchimento e congelamento da FIPE.</p>
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
          
          {/* Plate Query Box */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Placa do Veículo (Mercosul ou Antiga)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    id="add-veh-plate"
                    type="text"
                    placeholder="Ex: RKS4E29"
                    value={plate}
                    onChange={(e) => setPlate(e.target.value.toUpperCase())}
                    maxLength={8}
                    className="px-3 py-2 rounded-lg bg-white border border-slate-300 text-sm font-mono font-bold text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 uppercase tracking-widest w-40"
                  />
                  <button
                    type="button"
                    onClick={handleQueryPlate}
                    disabled={isSearchingPlate}
                    className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center space-x-1.5 transition disabled:opacity-50 shadow-xs"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>{isSearchingPlate ? 'Consultando...' : 'Buscar Dados e FIPE'}</span>
                  </button>
                </div>
              </div>

              <div className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200 shadow-xs">
                <span>Saldo de Consultas: </span>
                <strong className="text-indigo-600 font-bold">
                  {tenant.plateQueriesLimit - tenant.plateQueriesUsed} restantes
                </strong>
              </div>
            </div>

            {plateSearchError && (
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{plateSearchError}</span>
              </div>
            )}
          </div>

          {/* Vehicle Basic Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Marca *</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Ex: Volkswagen"
                required
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Modelo *</label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="Ex: T-Cross"
                required
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Versão</label>
              <input
                type="text"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="Ex: Highline 250 TSI"
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Ano Fab.</label>
              <input
                type="number"
                value={yearFab}
                onChange={(e) => setYearFab(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Ano Modelo</label>
              <input
                type="number"
                value={yearModel}
                onChange={(e) => setYearModel(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Cor</label>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Km Atual</label>
              <input
                type="number"
                value={mileage}
                onChange={(e) => setMileage(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Golden Rule: Real Entry Date & Purchase Price */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="flex items-center space-x-2 text-xs font-bold text-indigo-600 uppercase tracking-wider">
              <Calendar className="w-4 h-4" />
              <span>Regra de Ouro Temporal & Valores Financeiros</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Data de Entrada Real no Pátio */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Data de Entrada Real no Pátio *
                </label>
                <input
                  id="add-veh-entry-date"
                  type="date"
                  value={entryDate}
                  onChange={(e) => setEntryDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Inicia a contagem dos dias de capital imobilizado.
                </span>
              </div>

              {/* Preço de Compra */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Preço Pago de Compra (R$) *
                </label>
                <input
                  id="add-veh-purchase-price"
                  type="number"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* FIPE Congelada */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1 flex items-center space-x-1">
                  <Lock className="w-3 h-3 text-indigo-600" />
                  <span>FIPE Congelada (R$)</span>
                </label>
                <input
                  type="number"
                  value={fipeAtPurchase}
                  onChange={(e) => setFipeAtPurchase(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-indigo-200 text-xs font-bold text-indigo-700 focus:outline-none"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Imutável no histórico do DRE.
                </span>
              </div>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Status Operacional</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as Vehicle['status'])}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-500"
                >
                  <option value="Em Operação">Em Operação (Oficina/Detail)</option>
                  <option value="Disponível">Disponível no Showroom</option>
                  <option value="Vendido">Vendido</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Responsável pela Captação</label>
                <input
                  type="text"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Preço Alvo de Venda (R$)</label>
                <input
                  type="number"
                  value={targetSalePrice}
                  onChange={(e) => setTargetSalePrice(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Observações do Laudo / Captação</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Laudo cautelar aprovado com apontamento leve no parachoque dianteiro. Manual e chave reserva entregues."
              className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Submit Action */}
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
              className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs transition flex items-center space-x-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Salvar no Estoque</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
