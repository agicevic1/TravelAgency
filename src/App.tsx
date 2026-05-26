import { useEffect, useState } from 'react';
import Dashboard from './components/Dashboard';
import FinancialManagement from './components/FinancialManagement';
import ServiceLevelManagement from './components/ServiceLevelManagement';
import Bookings from './components/Bookings';
import Login from './components/Login';
import { LayoutDashboard, DollarSign, ShieldCheck, Calendar, LogOut, Plane } from 'lucide-react';

type View = 'dashboard' | 'financial' | 'slm' | 'bookings';
type User = { username: string; role: 'admin' | 'finance'; name: string };

function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('travelplusnovo_user');
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const login = (loggedUser: User, token: string) => {
    localStorage.setItem('travelplusnovo_user', JSON.stringify(loggedUser));
    localStorage.setItem('travelplusnovo_token', token);
    setUser(loggedUser);
    setCurrentView('dashboard');
  };

  const logout = () => {
    localStorage.removeItem('travelplusnovo_user');
    localStorage.removeItem('travelplusnovo_token');
    setUser(null);
    setCurrentView('dashboard');
  };

  if (!user) return <Login onLogin={login} />;

  const canFinance = user.role === 'finance';
  const canSlm = user.role === 'admin';

  const go = (view: View) => {
    if (view === 'financial' && !canFinance) return;
    if (view === 'slm' && !canSlm) return;
    setCurrentView(view);
  };

  const navItems = [
    { view: 'dashboard' as View, label: 'Dashboard', icon: LayoutDashboard, always: true },
    { view: 'financial' as View, label: 'Finansije', icon: DollarSign, always: false, allowed: canFinance },
    { view: 'slm' as View, label: 'SLM', icon: ShieldCheck, always: false, allowed: canSlm },
    { view: 'bookings' as View, label: 'Rezervacije', icon: Calendar, always: true },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      <nav className="bg-white/95 backdrop-blur-sm shadow-sm border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-2 rounded-xl shadow-md">
                <Plane className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">TravelPlus</h1>
                <p className="text-xs text-slate-400 leading-none">{user.name} · <span className="uppercase font-semibold text-blue-600">{user.role}</span></p>
              </div>
            </div>

            {/* Nav */}
            <div className="flex items-center gap-1 flex-wrap">
              {navItems.map(item => {
                if (!item.always && !item.allowed) return null;
                const Icon = item.icon;
                const isActive = currentView === item.view;
                return (
                  <button key={item.view} onClick={() => go(item.view)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all ${isActive ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'}`}>
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </button>
                );
              })}
              <button onClick={logout}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition ml-2">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Odjava</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {currentView === 'dashboard' && <Dashboard />}
        {currentView === 'financial' && canFinance && <FinancialManagement />}
        {currentView === 'slm' && canSlm && <ServiceLevelManagement />}
        {currentView === 'bookings' && <Bookings />}
      </main>
    </div>
  );
}

export default App;
