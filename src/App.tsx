import React, { useState, useEffect, useCallback } from 'react';
import { 
  AuthTenantProvider, 
  useAuthTenant 
} from './context/AuthTenantContext';
import { Navbar } from './components/Navbar';
import { Sidebar, NavTab } from './components/Sidebar';
import { PaywallModal } from './components/PaywallModal';
import { DashboardView } from './components/Dashboard/DashboardView';
import { VehicleListView } from './components/Vehicles/VehicleListView';
import { VehicleDetailModal } from './components/Vehicles/VehicleDetailModal';
import { AddVehicleModal } from './components/Vehicles/AddVehicleModal';
import { AddExpenseModal } from './components/Vehicles/AddExpenseModal';
import { SaleVehicleModal } from './components/Vehicles/SaleVehicleModal';
import { ViabilityCalculator } from './components/Calculator/ViabilityCalculator';
import { PlateQueryView } from './components/PlateQuery/PlateQueryView';
import { CashFlowView } from './components/CashFlow/CashFlowView';
import { InventoryView } from './components/Inventory/InventoryView';
import { SellerPerformanceView } from './components/Sellers/SellerPerformanceView';
import { 
  loadTenantData, 
  saveVehicle, 
  saveExpense, 
  recordVehicleSale, 
  deleteVehicle, 
  deleteExpense,
  saveCashFlowItem,
  getInventoryItemsByTenant,
  getStockAlertsByTenant,
  getStockMovementsByTenant
} from './services/dbService';
import { 
  Vehicle, 
  VehicleExpense, 
  VehicleSale, 
  CashFlowItem, 
  PlateQueryResult,
  InventoryItem,
  StockAlert,
  StockMovement
} from './types';

function MainApp() {
  const { tenant, isReadOnlyMode, openPaywallModal } = useAuthTenant();
  
  // Navigation State
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');

  // Database State
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [expenses, setExpenses] = useState<VehicleExpense[]>([]);
  const [sales, setSales] = useState<VehicleSale[]>([]);
  const [cashFlow, setCashFlow] = useState<CashFlowItem[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [stockAlerts, setStockAlerts] = useState<StockAlert[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);

  // Modals & Selection State
  const [selectedVehicleForDetail, setSelectedVehicleForDetail] = useState<Vehicle | null>(null);
  const [selectedVehicleForExpense, setSelectedVehicleForExpense] = useState<Vehicle | null>(null);
  const [selectedVehicleForSale, setSelectedVehicleForSale] = useState<Vehicle | null>(null);
  
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [initialRegistrationData, setInitialRegistrationData] = useState<(Partial<PlateQueryResult> & { maxOffer?: number }) | undefined>(undefined);

  // Reload data when tenant changes
  const reloadData = useCallback(() => {
    const data = loadTenantData(tenant.id);
    setVehicles(data.vehicles);
    setExpenses(data.expenses);
    setSales(data.sales);
    setCashFlow(data.cashFlow);
    setInventoryItems(data.inventoryItems);
    setStockAlerts(data.stockAlerts);
    setStockMovements(data.stockMovements);
  }, [tenant.id]);

  useEffect(() => {
    reloadData();
  }, [reloadData]);

  // Handlers
  const handleSaveVehicle = (vehicleData: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>) => {
    saveVehicle(vehicleData);
    reloadData();
    setActiveTab('vehicles');
  };

  const handleSaveExpense = (expenseData: Omit<VehicleExpense, 'id' | 'createdAt'>) => {
    saveExpense(expenseData);
    reloadData();
  };

  const handleRecordSale = (saleData: Parameters<typeof recordVehicleSale>[0]) => {
    recordVehicleSale(saleData);
    reloadData();
    if (selectedVehicleForDetail) {
      setSelectedVehicleForDetail(null);
    }
  };

  const handleDeleteVehicle = (vehicleId: string) => {
    deleteVehicle(vehicleId);
    reloadData();
    if (selectedVehicleForDetail?.id === vehicleId) {
      setSelectedVehicleForDetail(null);
    }
  };

  const handleDeleteExpense = (expenseId: string) => {
    deleteExpense(expenseId);
    reloadData();
  };

  const handleAddCashFlow = (item: Omit<CashFlowItem, 'id' | 'createdAt'>) => {
    saveCashFlowItem(item);
    reloadData();
  };

  // Cross-module navigations
  const handleStartRegistrationFromCalc = (initial: Partial<PlateQueryResult> & { maxOffer?: number }) => {
    setInitialRegistrationData(initial);
    setIsAddVehicleOpen(true);
  };

  const handleSendToCalculatorFromPlate = (plateResult: PlateQueryResult) => {
    setActiveTab('calculator');
  };

  const handleSendToRegistrationFromPlate = (plateResult: PlateQueryResult) => {
    setInitialRegistrationData(plateResult);
    setIsAddVehicleOpen(true);
  };

  const activeAlertCount = stockAlerts.filter((a) => a.status === 'active').length;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation Bar */}
      <Navbar
        onOpenAddVehicle={() => {
          if (isReadOnlyMode) openPaywallModal();
          else {
            setInitialRegistrationData(undefined);
            setIsAddVehicleOpen(true);
          }
        }}
        onOpenCalculator={() => setActiveTab('calculator')}
        onOpenPlateQuery={() => setActiveTab('plate_query')}
      />

      {/* Main Body with Sidebar */}
      <div className="flex-1 flex flex-col md:flex-row min-w-0">
        {/* Left Sidebar */}
        <Sidebar 
          activeTab={activeTab} 
          onSelectTab={(tab) => setActiveTab(tab)} 
          activeAlertCount={activeAlertCount}
        />

        {/* Content View Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-x-hidden min-w-0">
          {activeTab === 'dashboard' && (
            <DashboardView
              vehicles={vehicles}
              expenses={expenses}
              sales={sales}
              onSelectVehicle={(v) => setSelectedVehicleForDetail(v)}
              onOpenAddVehicle={() => {
                if (isReadOnlyMode) openPaywallModal();
                else {
                  setInitialRegistrationData(undefined);
                  setIsAddVehicleOpen(true);
                }
              }}
              onOpenCalculator={() => setActiveTab('calculator')}
            />
          )}

          {activeTab === 'vehicles' && (
            <VehicleListView
              vehicles={vehicles}
              expenses={expenses}
              sales={sales}
              onSelectVehicle={(v) => setSelectedVehicleForDetail(v)}
              onOpenAddVehicle={() => {
                if (isReadOnlyMode) openPaywallModal();
                else {
                  setInitialRegistrationData(undefined);
                  setIsAddVehicleOpen(true);
                }
              }}
              onOpenAddExpense={(v) => {
                if (isReadOnlyMode) openPaywallModal();
                else {
                  setSelectedVehicleForExpense(v || null);
                  setIsAddExpenseOpen(true);
                }
              }}
              onOpenSaleModal={(v) => {
                if (isReadOnlyMode) openPaywallModal();
                else {
                  setSelectedVehicleForSale(v);
                  setIsSaleModalOpen(true);
                }
              }}
              onDeleteVehicle={handleDeleteVehicle}
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryView
              items={inventoryItems}
              alerts={stockAlerts}
              movements={stockMovements}
              vehicles={vehicles}
              onRefreshData={reloadData}
              onOpenVehicleDetail={(v) => setSelectedVehicleForDetail(v)}
            />
          )}

          {activeTab === 'sellers' && (
            <SellerPerformanceView
              sales={sales}
              vehicles={vehicles}
              onOpenVehicleDetail={(v) => setSelectedVehicleForDetail(v)}
            />
          )}

          {activeTab === 'calculator' && (
            <ViabilityCalculator
              onStartVehicleRegistration={handleStartRegistrationFromCalc}
            />
          )}

          {activeTab === 'plate_query' && (
            <PlateQueryView
              onSendToCalculator={handleSendToCalculatorFromPlate}
              onSendToRegistration={handleSendToRegistrationFromPlate}
            />
          )}

          {activeTab === 'cash_flow' && (
            <CashFlowView
              cashFlowItems={cashFlow}
              onAddCashFlowItem={handleAddCashFlow}
            />
          )}

          {activeTab === 'settings' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Configurações & Governança Multi-Tenant</h2>
                  <p className="text-xs text-slate-500">Planos, limites de consulta, isolamento por tenantId e RBAC</p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Tenant: {tenant.name} ({tenant.id})
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">Estrutura de Coleções Firestore</h3>
                  <ul className="text-xs space-y-1.5 font-mono text-slate-700">
                    <li>📁 <strong>tenants/</strong> (Configurações e plano da empresa)</li>
                    <li>📁 <strong>vehicles/</strong> (Estoque segregado por tenantId)</li>
                    <li>📁 <strong>vehicle_expenses/</strong> (DRE por chassi)</li>
                    <li>📁 <strong>sales/</strong> (Vendas e comissões de vendedores)</li>
                    <li>📁 <strong>inventory_items/</strong> (Almoxarifado & estoque mínimo)</li>
                    <li>📁 <strong>stock_alerts/</strong> (Notificações aos administradores)</li>
                    <li>📁 <strong>stock_movements/</strong> (Auditoria de entradas e saídas)</li>
                    <li>📁 <strong>cash_flow/</strong> (Extrato financeiro do tenant)</li>
                  </ul>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">Controle de Acesso RBAC</h3>
                  <div className="text-xs space-y-2 text-slate-600">
                    <p>• <strong>Admin:</strong> Acesso irrestrito a todos os módulos, relatórios, configurações e aprovação de compras.</p>
                    <p>• <strong>Financeiro:</strong> Gestão de DRE, fluxo de caixa, comissões de vendedores e baixas financeiras.</p>
                    <p>• <strong>Gerente / Vendedor:</strong> Captação, calculadora de margem, consulta de placas e vendas.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Paywall Trial Expiration Modal */}
      <PaywallModal />

      {/* Vehicle DRE Detail Modal */}
      {selectedVehicleForDetail && (
        <VehicleDetailModal
          vehicle={selectedVehicleForDetail}
          expenses={expenses}
          sales={sales}
          onClose={() => setSelectedVehicleForDetail(null)}
          onOpenAddExpense={(v) => {
            setSelectedVehicleForExpense(v);
            setIsAddExpenseOpen(true);
          }}
          onOpenSaleModal={(v) => {
            setSelectedVehicleForSale(v);
            setIsSaleModalOpen(true);
          }}
          onDeleteExpense={handleDeleteExpense}
        />
      )}

      {/* Add Vehicle Modal */}
      {isAddVehicleOpen && (
        <AddVehicleModal
          isOpen={isAddVehicleOpen}
          onClose={() => {
            setIsAddVehicleOpen(false);
            setInitialRegistrationData(undefined);
          }}
          onSave={handleSaveVehicle}
          initialData={initialRegistrationData}
        />
      )}

      {/* Add Expense Modal */}
      {isAddExpenseOpen && (
        <AddExpenseModal
          isOpen={isAddExpenseOpen}
          vehicles={vehicles}
          selectedVehicle={selectedVehicleForExpense}
          onClose={() => {
            setIsAddExpenseOpen(false);
            setSelectedVehicleForExpense(null);
          }}
          onSave={handleSaveExpense}
        />
      )}

      {/* Sale Vehicle Modal */}
      {isSaleModalOpen && (
        <SaleVehicleModal
          isOpen={isSaleModalOpen}
          vehicle={selectedVehicleForSale}
          expenses={expenses}
          onClose={() => {
            setIsSaleModalOpen(false);
            setSelectedVehicleForSale(null);
          }}
          onRecordSale={handleRecordSale}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthTenantProvider>
      <MainApp />
    </AuthTenantProvider>
  );
}
