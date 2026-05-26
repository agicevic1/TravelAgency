import { useEffect, useState } from 'react';
import { apiClient } from '../lib/api';
import { TrendingUp, TrendingDown, Users, Package, AlertCircle, CheckCircle, Activity, Globe, Star, ArrowUpRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface DashboardStats {
  totalRevenue: number; totalExpenses: number; activeBookings: number;
  totalCustomers: number; openIncidents: number; slaCompliance: number;
}

const mockTrend = [
  { month: 'Jan', prihodi: 18000, rashodi: 12000 },
  { month: 'Feb', prihodi: 22000, rashodi: 15000 },
  { month: 'Mar', prihodi: 28000, rashodi: 18000 },
  { month: 'Apr', prihodi: 35000, rashodi: 22000 },
  { month: 'Maj', prihodi: 41000, rashodi: 28000 },
];

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({ totalRevenue: 0, totalExpenses: 0, activeBookings: 0, totalCustomers: 0, openIncidents: 0, slaCompliance: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.dashboard.getStats()
      .then(r => setStats(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const netProfit = stats.totalRevenue - stats.totalExpenses;
  const profitMargin = stats.totalRevenue > 0 ? ((netProfit / stats.totalRevenue) * 100).toFixed(1) : '0';

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent" />
    </div>
  );

  const kpis = [
    { label: 'Ukupni prihodi', value: `€${stats.totalRevenue.toLocaleString('bs-BA')}`, sub: '+12% vs prošli mj.', icon: TrendingUp, iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600', trend: 'up' },
    { label: 'Ukupni rashodi', value: `€${stats.totalExpenses.toLocaleString('bs-BA')}`, sub: '+4% vs prošli mj.', icon: TrendingDown, iconBg: 'bg-red-100', iconColor: 'text-red-600', trend: 'down' },
    { label: 'Neto dobit', value: `€${netProfit.toLocaleString('bs-BA')}`, sub: `Marža: ${profitMargin}%`, icon: Activity, iconBg: 'bg-blue-100', iconColor: 'text-blue-600', trend: 'up' },
    { label: 'Aktivne rezervacije', value: stats.activeBookings, sub: 'Potvrđene / U toku', icon: Package, iconBg: 'bg-cyan-100', iconColor: 'text-cyan-600' },
    { label: 'Ukupno klijenata', value: stats.totalCustomers, sub: 'Individualni + Korporativni', icon: Users, iconBg: 'bg-indigo-100', iconColor: 'text-indigo-600' },
    { label: 'Otvoreni incidenti', value: stats.openIncidents, sub: 'Zahtijevaju pažnju', icon: AlertCircle, iconBg: 'bg-orange-100', iconColor: 'text-orange-600', urgent: stats.openIncidents > 0 },
    { label: 'SLA usklađenost', value: `${stats.slaCompliance}%`, sub: 'Ispunjeni SLA parametri', icon: CheckCircle, iconBg: 'bg-green-100', iconColor: 'text-green-600' },
    { label: 'Destinacije', value: '8', sub: 'Aktivnih u sistemu', icon: Globe, iconBg: 'bg-purple-100', iconColor: 'text-purple-600' },
  ];

  return (
    <div className="space-y-6 pb-10">
      {/* Hero */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-2xl">
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight">Dobrodošli u TravelPlus</h2>
            <p className="text-slate-300 mt-1">ITIL v4 · Finansijsko upravljanje & Service Level Management</p>
          </div>
          <div className="text-right">
            <p className="text-slate-400 text-sm">{new Date().toLocaleDateString('bs-BA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p className="text-emerald-400 font-semibold mt-1">Sistem operativan ✅</p>
          </div>
        </div>
        {/* Mini stats bar */}
        <div className="grid grid-cols-3 gap-4 mt-5 border-t border-slate-700 pt-5">
          <div>
            <p className="text-slate-400 text-xs uppercase tracking-wide">Prihodi (YTD)</p>
            <p className="text-2xl font-bold text-emerald-400">€{stats.totalRevenue.toLocaleString('bs-BA')}</p>
          </div>
          <div>
            <p className="text-slate-400 text-xs uppercase tracking-wide">Neto dobit</p>
            <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-blue-400' : 'text-red-400'}`}>€{netProfit.toLocaleString('bs-BA')}</p>
          </div>
          <div>
            <p className="text-slate-400 text-xs uppercase tracking-wide">SLA score</p>
            <p className="text-2xl font-bold text-yellow-400">{stats.slaCompliance}%</p>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map(k => {
          const Icon = k.icon;
          return (
            <div key={k.label} className={`bg-white rounded-2xl shadow-sm border p-4 hover:shadow-md transition-all ${k.urgent ? 'border-orange-300 ring-1 ring-orange-200' : 'border-slate-200'}`}>
              <div className="flex items-start justify-between">
                <div className={`p-2.5 rounded-xl ${k.iconBg}`}>
                  <Icon className={`w-5 h-5 ${k.iconColor}`} />
                </div>
                {k.trend && (
                  <ArrowUpRight className={`w-4 h-4 ${k.trend === 'up' ? 'text-emerald-500' : 'text-red-400 rotate-90'}`} />
                )}
              </div>
              <p className="text-2xl font-extrabold text-slate-800 mt-3">{k.value}</p>
              <p className="text-xs font-medium text-slate-400 mt-0.5">{k.label}</p>
              <p className="text-xs text-slate-400 mt-1">{k.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-700">Trend prihoda vs rashoda</h3>
            <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">2026</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={mockTrend}>
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: any) => `€${Number(v).toLocaleString('bs-BA')}`} />
              <Line type="monotone" dataKey="prihodi" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="rashodi" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-700">Pregled poslovanja</h3>
          </div>
          <div className="space-y-4">
            {[
              { label: 'Iskorištenost budžeta', value: stats.totalExpenses, total: stats.totalRevenue, color: 'bg-blue-500' },
              { label: 'SLA usklađenost', value: stats.slaCompliance, total: 100, color: 'bg-emerald-500' },
              { label: 'Incidenti riješeni', value: 75, total: 100, color: 'bg-amber-500' },
            ].map(item => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-slate-600 font-medium">{item.label}</span>
                  <span className="text-slate-500 font-semibold">{item.total === 100 ? `${item.value}%` : `€${Number(item.value).toLocaleString('bs-BA')} / €${Number(item.total).toLocaleString('bs-BA')}`}</span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-2.5 rounded-full transition-all ${item.color}`}
                    style={{ width: `${Math.min(100, item.total > 0 ? (item.value / item.total) * 100 : 0)}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 border-t border-slate-100 pt-4 grid grid-cols-2 gap-3">
            {[
              { label: 'Profit marža', value: `${profitMargin}%`, color: 'text-blue-600' },
              { label: 'Aktivni SLA', value: stats.activeBookings, color: 'text-emerald-600' },
            ].map(s => (
              <div key={s.label} className="text-center bg-slate-50 rounded-xl py-3">
                <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom info */}
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { title: '🏨 Top destinacija', value: 'Dubrovnik', sub: '3 aktivne rezervacije', color: 'blue' },
          { title: '⚠️ SLA Alert', value: `${stats.openIncidents} incidenata`, sub: 'Zahtijeva pažnju', color: 'orange' },
          { title: '💶 Godišnji plan', value: `€450,000`, sub: 'Planirani prihod 2026', color: 'emerald' },
        ].map(card => (
          <div key={card.title} className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-4 border-l-4 border-l-${card.color}-500`}>
            <p className="text-sm text-slate-500">{card.title}</p>
            <p className="text-xl font-extrabold text-slate-800 mt-1">{card.value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{card.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
