import React, { useState } from 'react';
import { Table, TableStatus, Order } from '@/src/shared/types';

interface TableMapProps {
  tables: Table[];
  areas: string[];
  orders: Record<string, Order>;
  onTableClick: (tableId: string) => void;
  currentShiftName: string | null;
}

export const TableMap: React.FC<TableMapProps> = ({
  tables,
  areas,
  orders,
  onTableClick,
  currentShiftName,
}) => {
  const [filterArea, setFilterArea] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');

  const displayAreas = ['All', ...areas];

  const filteredTables = tables.filter((t) => {
    const matchesArea = filterArea === 'All' || t.area === filterArea;
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesArea && matchesSearch;
  });

  const getStatusColor = (status: TableStatus) => {
    switch (status) {
      case TableStatus.AVAILABLE: return 'border-primary';
      case TableStatus.OCCUPIED: return 'border-blue-500';
      case TableStatus.PAYMENT_REQUESTED: return 'border-yellow-400';
      default: return 'border-gray-300';
    }
  };

  const getStatusBg = (status: TableStatus) => {
    switch (status) {
      case TableStatus.AVAILABLE: return 'text-primary bg-primary/10';
      case TableStatus.OCCUPIED: return 'text-blue-500 bg-blue-100';
      case TableStatus.PAYMENT_REQUESTED: return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-500 bg-gray-100';
    }
  };

  const activeTables = tables.filter((t) => t.status !== TableStatus.AVAILABLE).length;
  const ordersList = Object.values(orders) as Order[];
  const totalRevenue = ordersList.reduce(
    (acc, order) => acc + (order.paidAmount || 0),
    0
  );

  const isActive = !!currentShiftName;

  return (
    <div className="flex flex-col h-full bg-bg-light">
      {/* Header */}
      <header className="h-20 bg-white border-b border-gray-200 px-6 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <div className="bg-primary/20 p-2 rounded-lg">
            <span className="material-icons text-primary">table_restaurant</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Table Management</h1>
            <p className="text-xs text-gray-500">Main Branch &bull; {new Date().toLocaleDateString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          {isActive ? (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-full text-sm font-bold border border-green-200">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              {currentShiftName}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-gray-500 bg-gray-100 px-4 py-2 rounded-full text-sm font-bold border border-gray-200">
              <span className="material-icons text-sm">nightlight</span>
              Ngoài giờ phục vụ
            </div>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Stats */}
        <aside className="w-72 bg-white border-r border-gray-200 p-6 flex flex-col gap-6 overflow-y-auto hidden md:flex">
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Shift Analytics</h2>
            <div className="bg-bg-light p-4 rounded-xl border border-gray-100">
              <p className="text-gray-500 text-sm mb-1">Total Revenue</p>
              <h3 className="text-2xl font-bold text-primary">${totalRevenue.toFixed(2)}</h3>
            </div>
            <div className="bg-bg-light p-4 rounded-xl border border-gray-100">
              <p className="text-gray-500 text-sm mb-1">Active Tables</p>
              <div className="flex items-end gap-2">
                <h3 className="text-2xl font-bold text-gray-800">{activeTables}</h3>
                <span className="text-gray-400 text-lg mb-0.5">/ {tables.length}</span>
              </div>
              <div className="w-full bg-gray-200 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-primary h-full transition-all duration-500"
                  style={{ width: `${tables.length > 0 ? (activeTables / tables.length) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Status Legend</h2>
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-2 rounded-lg bg-primary/5">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <span className="text-sm font-medium">Available</span>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg bg-blue-50">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-sm font-medium">Occupied</span>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg bg-yellow-50">
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <span className="text-sm font-medium">Payment</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Grid */}
        <main className="flex-1 flex flex-col p-6 overflow-hidden">
          <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
            <div className="flex bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
              {displayAreas.map((area) => (
                <button
                  key={area}
                  onClick={() => setFilterArea(area)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    filterArea === area
                      ? 'bg-secondary text-white shadow-sm'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {area}
                </button>
              ))}
            </div>
            <div className="relative">
              <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">search</span>
              <input
                type="text"
                placeholder="Search table..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none w-64"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-2">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {filteredTables.map((table) => {
                const currentOrder = table.currentOrderId ? orders[table.currentOrderId] : null;
                const amount = currentOrder ? currentOrder.totalAmount : 0;

                return (
                  <div
                    key={table.id}
                    onClick={() => onTableClick(table.id)}
                    className={`
                      bg-white rounded-xl border-t-4 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer flex flex-col min-h-[160px] p-4 relative group
                      ${getStatusColor(table.status)}
                    `}
                  >
                    <div className="flex justify-between items-start mb-6">
                      <span className="text-3xl font-black text-gray-800">{table.name}</span>
                      <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${getStatusBg(table.status)}`}>
                        {table.status.replace('_', ' ')}
                      </div>
                    </div>
                    <div className="mt-auto">
                      {table.status === TableStatus.AVAILABLE ? (
                        <div className="w-full py-2 border-2 border-dashed border-gray-200 text-gray-400 text-xs font-bold rounded-lg text-center group-hover:border-primary group-hover:text-primary transition-colors">
                          START ORDER
                        </div>
                      ) : (
                        <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg">
                          <span className="text-[10px] font-bold text-gray-500 uppercase">Total</span>
                          <span className="text-base font-bold text-gray-800">${amount.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
