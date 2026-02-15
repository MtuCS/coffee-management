import React, { useState } from 'react';
import { Shift, Order, Category, Product, Table, User, Area, TableStatus } from '@/src/shared/types';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface AdminDashboardProps {
  shifts: Shift[];
  orders: Order[];
  onBack: () => void;
  // CRUD Props
  categories: Category[];
  onSaveCategory: (cat: Category) => void;
  onDeleteCategory: (id: string) => void;
  products: Product[];
  onSaveProduct: (prod: Product) => void;
  onDeleteProduct: (id: string) => void;
  areas: Area[];
  onSaveArea: (area: Area) => void;
  onDeleteArea: (id: string) => void;
  tables: Table[];
  onSaveTable: (table: Table) => void;
  onDeleteTable: (id: string) => void;
  users: User[];
  onSaveUser: (user: User) => void;
  onDeleteUser: (id: string) => void;
}

type Tab = 'DASHBOARD' | 'MENU' | 'TABLES' | 'STAFF';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  shifts, orders, onBack,
  categories, onSaveCategory, onDeleteCategory,
  products, onSaveProduct, onDeleteProduct,
  areas, onSaveArea, onDeleteArea,
  tables, onSaveTable, onDeleteTable,
  users, onSaveUser, onDeleteUser,
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('DASHBOARD');

  // Form states
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProdModalOpen, setIsProdModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [newAreaName, setNewAreaName] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  // Revenue data from actual orders
  const closedOrders = orders.filter((o) => o.status === 'CLOSED');
  const totalRevenue = closedOrders.reduce((acc, curr) => acc + curr.totalAmount, 0);

  // Build chart data from shifts
  const chartData = shifts
    .slice(0, 10)
    .map((s) => ({
      day: `${s.date} ${s.shiftName}`,
      revenue: s.totalRevenue,
    }));

  const openProdModal = (prod?: Product) => {
    setEditingProduct(
      prod || {
        id: '',
        name: '',
        price: 0,
        category: categories[0]?.id || '',
        description: '',
        image: 'https://picsum.photos/400/300',
      }
    );
    setIsProdModalOpen(true);
  };

  const openCatModal = (cat?: Category) => {
    setEditingCategory(cat || { id: '', name: '', icon: 'local_cafe' });
    setIsCatModalOpen(true);
  };

  const openTableModal = (table?: Table) => {
    setEditingTable(
      table || {
        id: '',
        name: '',
        areaId: areas[0]?.id || '',
        area: areas[0]?.name || '',
        status: TableStatus.AVAILABLE,
        currentOrderId: null,
      }
    );
    setIsTableModalOpen(true);
  };

  const openUserModal = (user?: User) => {
    setEditingUser(user || { id: '', name: '', role: 'STAFF', avatar: '' });
    setIsUserModalOpen(true);
  };

  return (
    <div className="flex h-screen bg-bg-light font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col z-10 hidden md:flex shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-2 text-secondary font-bold text-lg">
            <div className="p-2 bg-primary rounded text-white">
              <span className="material-icons">coffee</span>
            </div>
            Bean & Leaf
          </div>
          <p className="text-xs text-gray-400 mt-1 pl-10">Admin Console</p>
        </div>
        <nav className="p-4 space-y-2 flex-1">
          {([
            { key: 'DASHBOARD' as Tab, icon: 'analytics', label: 'Dashboard' },
            { key: 'MENU' as Tab, icon: 'restaurant_menu', label: 'Menu Mgmt' },
            { key: 'TABLES' as Tab, icon: 'table_restaurant', label: 'Tables & Areas' },
            { key: 'STAFF' as Tab, icon: 'people', label: 'Staff' },
          ]).map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${
                activeTab === item.key ? 'bg-primary/10 text-primary' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <span className="material-icons">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={onBack}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors"
          >
            <span className="material-icons">logout</span>
            Exit Admin
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8 relative">
        {/* DASHBOARD */}
        {activeTab === 'DASHBOARD' && (
          <div className="space-y-8 animate-fade-in">
            <header className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Sales Overview</h2>
                <p className="text-gray-500">Welcome back, Admin</p>
              </div>
            </header>
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-xs font-bold uppercase">Total Revenue</span>
                  <span className="material-icons text-green-500 bg-green-50 p-1 rounded">attach_money</span>
                </div>
                <h3 className="text-3xl font-bold text-gray-800">${totalRevenue.toFixed(2)}</h3>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-xs font-bold uppercase">Total Shifts</span>
                  <span className="material-icons text-blue-500 bg-blue-50 p-1 rounded">schedule</span>
                </div>
                <h3 className="text-3xl font-bold text-gray-800">{shifts.length}</h3>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-xs font-bold uppercase">Total Orders</span>
                  <span className="material-icons text-purple-500 bg-purple-50 p-1 rounded">receipt</span>
                </div>
                <h3 className="text-3xl font-bold text-gray-800">{orders.length}</h3>
              </div>
            </section>
            {chartData.length > 0 && (
              <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-80">
                <h4 className="font-bold text-lg text-gray-800 mb-6">Revenue by Shift</h4>
                <ResponsiveContainer width="100%" height="80%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                    <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px', border: 'none' }} />
                    <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                      {chartData.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#13ec6d' : '#cbd5e1'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </section>
            )}
          </div>
        )}

        {/* MENU MANAGEMENT */}
        {activeTab === 'MENU' && (
          <div className="space-y-6">
            <header><h2 className="text-2xl font-bold text-gray-800">Menu Management</h2></header>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Categories */}
              <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-fit">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-700">Categories</h3>
                  <button onClick={() => openCatModal()} className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                    <span className="material-icons text-sm">add</span>
                  </button>
                </div>
                <ul className="space-y-2">
                  {categories.map((cat) => (
                    <li key={cat.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg group">
                      <div className="flex items-center gap-3">
                        <span className="material-icons text-gray-400 text-lg">{cat.icon}</span>
                        <span className="text-sm font-medium text-gray-700">{cat.name}</span>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openCatModal(cat)} className="text-blue-500 hover:bg-blue-50 p-1 rounded"><span className="material-icons text-xs">edit</span></button>
                        <button onClick={() => onDeleteCategory(cat.id)} className="text-red-500 hover:bg-red-50 p-1 rounded"><span className="material-icons text-xs">delete</span></button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              {/* Products */}
              <div className="lg:col-span-3">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-gray-700">Products</h3>
                    <button onClick={() => openProdModal()} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-opacity-90">
                      <span className="material-icons text-sm">add</span> Add Item
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
                        <tr>
                          <th className="px-6 py-3">Product</th>
                          <th className="px-6 py-3">Category</th>
                          <th className="px-6 py-3">Price</th>
                          <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {products.map((prod) => (
                          <tr key={prod.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 flex items-center gap-3">
                              <img src={prod.image} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                              <div>
                                <div className="text-sm font-bold text-gray-800">{prod.name}</div>
                                <div className="text-xs text-gray-500 truncate w-32">{prod.description}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {categories.find((c) => c.id === prod.category)?.name || prod.category}
                            </td>
                            <td className="px-6 py-4 text-sm font-bold text-gray-800">${prod.price.toFixed(2)}</td>
                            <td className="px-6 py-4 text-right">
                              <button onClick={() => openProdModal(prod)} className="text-blue-500 hover:bg-blue-50 p-2 rounded mr-1"><span className="material-icons text-sm">edit</span></button>
                              <button onClick={() => onDeleteProduct(prod.id)} className="text-red-500 hover:bg-red-50 p-2 rounded"><span className="material-icons text-sm">delete</span></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TABLES MANAGEMENT */}
        {activeTab === 'TABLES' && (
          <div className="space-y-6">
            <header><h2 className="text-2xl font-bold text-gray-800">Tables & Areas</h2></header>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Areas */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-fit">
                <h3 className="font-bold text-gray-700 mb-4">Areas</h3>
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={newAreaName}
                    onChange={(e) => setNewAreaName(e.target.value)}
                    placeholder="New Area Name"
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                  <button
                    onClick={() => {
                      if (newAreaName) {
                        onSaveArea({ id: '', name: newAreaName });
                        setNewAreaName('');
                      }
                    }}
                    className="bg-secondary text-white px-3 rounded-lg hover:bg-opacity-90"
                  >
                    <span className="material-icons text-sm">add</span>
                  </button>
                </div>
                <ul className="space-y-2">
                  {areas.map((area) => (
                    <li key={area.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <span className="font-medium text-gray-700">{area.name}</span>
                      <button onClick={() => onDeleteArea(area.id)} className="text-gray-400 hover:text-red-500">
                        <span className="material-icons text-sm">delete</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              {/* Tables */}
              <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden h-fit">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="font-bold text-gray-700">Tables List</h3>
                  <button onClick={() => openTableModal()} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-opacity-90">
                    <span className="material-icons text-sm">add</span> Add Table
                  </button>
                </div>
                <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold sticky top-0">
                      <tr>
                        <th className="px-6 py-3">Name</th>
                        <th className="px-6 py-3">Area</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {tables.sort((a, b) => a.area.localeCompare(b.area)).map((table) => (
                        <tr key={table.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 font-bold text-gray-800">{table.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            <span className="bg-gray-100 px-2 py-1 rounded text-xs font-bold uppercase">{table.area}</span>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                              table.status === 'AVAILABLE' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                            }`}>
                              {table.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button onClick={() => openTableModal(table)} className="text-blue-500 hover:bg-blue-50 p-2 rounded mr-1"><span className="material-icons text-sm">edit</span></button>
                            <button onClick={() => onDeleteTable(table.id)} className="text-red-500 hover:bg-red-50 p-2 rounded"><span className="material-icons text-sm">delete</span></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STAFF MANAGEMENT */}
        {activeTab === 'STAFF' && (
          <div className="space-y-6">
            <header className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Staff Management</h2>
              <button onClick={() => openUserModal()} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-opacity-90">
                <span className="material-icons text-sm">person_add</span> Add User
              </button>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {users.map((user) => (
                <div key={user.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4 relative group hover:border-primary/50 transition-colors">
                  <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}`} alt={user.name} className="w-16 h-16 rounded-full bg-gray-100" />
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">{user.name}</h3>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'}`}>
                      {user.role}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openUserModal(user)} className="text-blue-400 hover:text-blue-600 p-1"><span className="material-icons text-sm">edit</span></button>
                    <button onClick={() => onDeleteUser(user.id)} className="text-gray-300 hover:text-red-500 p-1"><span className="material-icons text-sm">delete</span></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ─── MODALS ─── */}
      {/* Product Modal */}
      {isProdModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg">
            <h3 className="text-xl font-bold mb-6">{editingProduct.id ? 'Edit Product' : 'New Product'}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Name</label>
                <input type="text" className="w-full border rounded-lg p-2" value={editingProduct.name} onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Price</label>
                  <input type="number" step="0.5" className="w-full border rounded-lg p-2" value={editingProduct.price} onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
                  <select className="w-full border rounded-lg p-2" value={editingProduct.category} onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Image URL</label>
                <input type="text" className="w-full border rounded-lg p-2" value={editingProduct.image} onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                <textarea className="w-full border rounded-lg p-2 h-20" value={editingProduct.description} onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}></textarea>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <button onClick={() => setIsProdModalOpen(false)} className="px-4 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={() => { onSaveProduct(editingProduct); setIsProdModalOpen(false); }} className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-green-400 shadow-lg shadow-primary/30">Save Product</button>
            </div>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {isCatModalOpen && editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
            <h3 className="text-xl font-bold mb-6">{editingCategory.id ? 'Edit Category' : 'New Category'}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Name</label>
                <input type="text" className="w-full border rounded-lg p-2" value={editingCategory.name} onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Icon (Material Icon Name)</label>
                <input type="text" className="w-full border rounded-lg p-2" value={editingCategory.icon} onChange={(e) => setEditingCategory({ ...editingCategory, icon: e.target.value })} />
                <div className="text-xs text-gray-400 mt-1">Example: coffee, local_dining, fastfood</div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <button onClick={() => setIsCatModalOpen(false)} className="px-4 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={() => { onSaveCategory(editingCategory); setIsCatModalOpen(false); }} className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-green-400 shadow-lg shadow-primary/30">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Table Modal */}
      {isTableModalOpen && editingTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
            <h3 className="text-xl font-bold mb-6">{editingTable.id ? 'Edit Table' : 'New Table'}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Table Name/Number</label>
                <input type="text" className="w-full border rounded-lg p-2" value={editingTable.name} onChange={(e) => setEditingTable({ ...editingTable, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Area</label>
                <select className="w-full border rounded-lg p-2" value={editingTable.areaId} onChange={(e) => {
                  const selectedArea = areas.find((a) => a.id === e.target.value);
                  setEditingTable({ ...editingTable, areaId: e.target.value, area: selectedArea?.name || '' });
                }}>
                  {areas.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <button onClick={() => setIsTableModalOpen(false)} className="px-4 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={() => { onSaveTable(editingTable); setIsTableModalOpen(false); }} className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-green-400 shadow-lg shadow-primary/30">Save Table</button>
            </div>
          </div>
        </div>
      )}

      {/* User Modal */}
      {isUserModalOpen && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
            <h3 className="text-xl font-bold mb-6">{editingUser.id ? 'Edit User' : 'New User'}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
                <input type="text" className="w-full border rounded-lg p-2" value={editingUser.name} onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Role</label>
                <select className="w-full border rounded-lg p-2" value={editingUser.role} onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as 'ADMIN' | 'STAFF' })}>
                  <option value="STAFF">Staff</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <button onClick={() => setIsUserModalOpen(false)} className="px-4 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={() => { onSaveUser(editingUser); setIsUserModalOpen(false); }} className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-green-400 shadow-lg shadow-primary/30">Save User</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
