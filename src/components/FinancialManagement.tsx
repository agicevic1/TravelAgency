import { useEffect, useState } from 'react';
import { TrendingDown, TrendingUp, Wallet, BarChart2, FileSpreadsheet, Plus, CheckCircle, ChevronDown, ChevronUp, X, Send, Globe, Eye } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';

const API = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000';
const headers = () => ({ 'Content-Type': 'application/json', 'x-user-role': 'finance' });

const fmt = (n: number) => `€${Number(n || 0).toLocaleString('bs-BA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtN = (n: number) => Number(n || 0).toLocaleString('bs-BA', { minimumFractionDigits: 2 });
const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
const CAT_LABELS: Record<string, string> = {
  accommodation: '🏨 Smještaj', transport: '🚌 Prevoz', marketing: '📢 Marketing',
  operations: '⚙️ Operacije', staff: '👥 Osoblje', other: '📦 Ostalo',
};
const STATUS_MAP: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700', paid: 'bg-green-100 text-green-700', overdue: 'bg-red-100 text-red-700',
};

type Tab = 'expenses' | 'revenues' | 'budgets' | 'allocations' | 'profitability' | 'invoices' | 'approvals';

export default function FinancialManagement() {
  const [activeTab, setActiveTab] = useState<Tab>('expenses');
  const [data, setData] = useState<any[]>([]);
  const [drilldown, setDrilldown] = useState<any[]>([]);
  const [profitability, setProfitability] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [filters, setFilters] = useState({ from: '', to: '' });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<any>({});
  const [approvalModal, setApprovalModal] = useState<any>(null);
  const [approvalAction, setApprovalAction] = useState({ action: 'approve', forwarded_to: '', comment: '' });
  const [toast, setToast] = useState<string | null>(null);
  const [expandDrilldown, setExpandDrilldown] = useState(false);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3500); };

  const fetchData = async () => {
    try {
      const noFilterTabs = ['budgets', 'allocations', 'profitability', 'invoices', 'approvals'];
      const params = noFilterTabs.includes(activeTab) ? '' : new URLSearchParams(Object.fromEntries(Object.entries(filters).filter(([, v]) => v))).toString();
      let url = `${API}/api/financial/${activeTab}${params ? '?' + params : ''}`;
      if (activeTab === 'approvals') url = `${API}/api/financial/approvals`;
      if (activeTab === 'invoices') url = `${API}/api/financial/vendor-invoices`;
      if (activeTab === 'profitability') url = `${API}/api/financial/profitability`;
      const res = await fetch(url, { headers: headers() });
      const result = await res.json();
      setData(Array.isArray(result) ? result : []);
    } catch (err) { console.error(err); setData([]); }
  };

  const fetchExtras = async () => {
    try {
      const [dd, pr, inv] = await Promise.all([
        fetch(`${API}/api/financial/expenses/drilldown`, { headers: headers() }).then(r => r.json()).catch(() => []),
        fetch(`${API}/api/financial/profitability`, { headers: headers() }).then(r => r.json()).catch(() => []),
        fetch(`${API}/api/financial/vendor-invoices`, { headers: headers() }).then(r => r.json()).catch(() => []),
      ]);
      setDrilldown(Array.isArray(dd) ? dd : []);
      setProfitability(Array.isArray(pr) ? pr : []);
      setInvoices(Array.isArray(inv) ? inv : []);
    } catch {}
  };

  useEffect(() => { fetchData(); }, [activeTab, filters]);
  useEffect(() => { fetchExtras(); }, []);

  const totalIn = activeTab === 'revenues' ? data.reduce((a, b) => a + Number(b.amount || 0), 0) : 0;
  const totalOut = activeTab === 'expenses' ? data.reduce((a, b) => a + Number(b.amount || 0), 0) : 0;

  const postData = async () => {
    try {
      const endpoint = activeTab === 'invoices' ? 'vendor-invoices' : activeTab === 'approvals' ? 'expenses' : activeTab;
      const res = await fetch(`${API}/api/financial/${endpoint}`, {
        method: 'POST', headers: headers(), body: JSON.stringify(form),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Greška'); }
      setShowForm(false); setForm({});
      await fetchData(); await fetchExtras();
      showToast('✅ Uspješno dodano!');
    } catch (err: any) { showToast(`❌ ${err.message}`); }
  };

  const handleApproval = async () => {
    try {
      const res = await fetch(`${API}/api/financial/expenses/${approvalModal.id}/approve`, {
        method: 'POST', headers: headers(), body: JSON.stringify(approvalAction),
      });
      if (!res.ok) throw new Error('Greška');
      setApprovalModal(null);
      await fetchData(); await fetchExtras();
      showToast(approvalAction.action === 'approve' ? '✅ Trošak odobren!' : approvalAction.action === 'reject' ? '❌ Trošak odbijen.' : `📤 Proslijeđeno: ${approvalAction.forwarded_to}`);
    } catch { showToast('❌ Greška pri obradi'); }
  };

  const downloadReport = () => {
    const params = new URLSearchParams({ type: activeTab, ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) }).toString();
    window.open(`${API}/api/financial/report?${params}`);
  };

  const tabConfig = [
    { id: 'expenses', label: 'Rashodi', icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-50', activeBg: 'bg-red-600' },
    { id: 'revenues', label: 'Prihodi', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', activeBg: 'bg-emerald-600' },
    { id: 'budgets', label: 'Budžeti', icon: Wallet, color: 'text-blue-600', bg: 'bg-blue-50', activeBg: 'bg-blue-600' },
    { id: 'allocations', label: 'Alokacije', icon: BarChart2, color: 'text-purple-600', bg: 'bg-purple-50', activeBg: 'bg-purple-600' },
    { id: 'profitability', label: 'Profitabilnost', icon: Globe, color: 'text-indigo-600', bg: 'bg-indigo-50', activeBg: 'bg-indigo-600' },
    { id: 'invoices', label: 'Fakture', icon: FileSpreadsheet, color: 'text-orange-600', bg: 'bg-orange-50', activeBg: 'bg-orange-600' },
    { id: 'approvals', label: 'Odobravanje', icon: CheckCircle, color: 'text-teal-600', bg: 'bg-teal-50', activeBg: 'bg-teal-600' },
  ] as const;

  const formFields: Record<Tab, { key: string; label: string; type?: string; options?: string[] }[]> = {
    expenses: [
      { key: 'category', label: 'Kategorija', type: 'select', options: ['accommodation', 'transport', 'marketing', 'operations', 'staff', 'other'] },
      { key: 'description', label: 'Opis' }, { key: 'amount', label: 'Iznos (€)', type: 'number' },
      { key: 'expense_date', label: 'Datum', type: 'date' }, { key: 'supplier_id', label: 'ID dobavljača', type: 'number' },
      { key: 'payment_status', label: 'Status', type: 'select', options: ['pending', 'paid', 'overdue'] },
      { key: 'accommodation_cost', label: 'Smještaj (€)', type: 'number' }, { key: 'transport_cost', label: 'Prevoz (€)', type: 'number' },
      { key: 'insurance_cost', label: 'Osiguranje (€)', type: 'number' }, { key: 'commission', label: 'Provizija (€)', type: 'number' },
    ],
    revenues: [
      { key: 'amount', label: 'Iznos (€)', type: 'number' }, { key: 'payment_method', label: 'Metoda', type: 'select', options: ['cash', 'card', 'bank_transfer'] },
      { key: 'payment_date', label: 'Datum', type: 'date' }, { key: 'revenue_type', label: 'Tip', type: 'select', options: ['booking', 'service_fee', 'insurance', 'other'] },
      { key: 'customer_id', label: 'ID klijenta', type: 'number' }, { key: 'booking_id', label: 'ID rezervacije', type: 'number' },
    ],
    budgets: [
      { key: 'season', label: 'Sezona' }, { key: 'year', label: 'Godina', type: 'number' },
      { key: 'planned_revenue', label: 'Plan prihoda (€)', type: 'number' }, { key: 'planned_expenses', label: 'Plan rashoda (€)', type: 'number' },
      { key: 'marketing_budget', label: 'Marketing (€)', type: 'number' }, { key: 'operations_budget', label: 'Operacije (€)', type: 'number' },
      { key: 'status', label: 'Status', type: 'select', options: ['draft', 'approved', 'active', 'closed'] }, { key: 'notes', label: 'Napomena' },
    ],
    allocations: [
      { key: 'branch_name', label: 'Podružnica' }, { key: 'expense_id', label: 'ID rashoda', type: 'number' },
      { key: 'allocated_amount', label: 'Alocirani iznos (€)', type: 'number' }, { key: 'allocation_percentage', label: 'Postotak (%)', type: 'number' },
      { key: 'period', label: 'Period' },
    ],
    profitability: [],
    invoices: [
      { key: 'invoice_number', label: 'Broj fakture' }, { key: 'supplier_id', label: 'ID dobavljača', type: 'number' },
      { key: 'invoice_date', label: 'Datum fakture', type: 'date' }, { key: 'due_date', label: 'Rok plaćanja', type: 'date' },
      { key: 'amount', label: 'Iznos (€)', type: 'number' }, { key: 'description', label: 'Opis' },
      { key: 'status', label: 'Status', type: 'select', options: ['unpaid', 'paid', 'overdue', 'disputed'] },
    ],
    approvals: [],
  };

  const INVOICE_STATUS: Record<string, string> = {
    unpaid: 'bg-yellow-100 text-yellow-700', paid: 'bg-green-100 text-green-700',
    overdue: 'bg-red-100 text-red-700', disputed: 'bg-purple-100 text-purple-700',
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-slate-800 text-white px-5 py-3 rounded-xl shadow-xl text-sm">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-700 to-teal-800 rounded-2xl p-6 text-white shadow-xl mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight">Finance Management</h2>
            <p className="text-emerald-200 mt-1">ITIL v4 · Prihodi, rashodi, budžeti, fakture i odobravanje troškova</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={downloadReport}
              className="flex items-center gap-2 bg-white text-emerald-700 font-bold px-4 py-2.5 rounded-xl hover:bg-emerald-50 shadow transition text-sm">
              <FileSpreadsheet className="w-4 h-4" /> Excel izvještaj
            </button>
            {activeTab !== 'profitability' && activeTab !== 'approvals' && (
              <button onClick={() => { setForm({}); setShowForm(!showForm); }}
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-4 py-2.5 rounded-xl shadow transition text-sm">
                <Plus className="w-4 h-4" /> Dodaj
              </button>
            )}
          </div>
        </div>

        {/* Summary KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
          {[
            { label: 'Ukupni prihodi', value: fmt(data.filter((_, i) => activeTab === 'revenues' || i < 0).reduce((a, b) => a + Number(b.amount || 0), 0)), color: 'text-emerald-300' },
            { label: 'Ukupni rashodi', value: fmt(data.filter((_, i) => activeTab === 'expenses' || i < 0).reduce((a, b) => a + Number(b.amount || 0), 0)), color: 'text-red-300' },
            { label: 'Na čekanju', value: data.filter(d => d.payment_status === 'pending' || d.status === 'unpaid').length, color: 'text-yellow-300' },
            { label: 'Ukupno stavki', value: data.length, color: 'text-blue-300' },
          ].map(k => (
            <div key={k.label} className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
              <p className="text-xs text-emerald-200">{k.label}</p>
              <p className={`text-xl font-bold ${k.color}`}>{k.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 flex-wrap mb-4">
        {tabConfig.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id as Tab); setShowForm(false); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition ${isActive ? `${tab.activeBg} text-white shadow-md` : `${tab.bg} ${tab.color} hover:opacity-80`}`}>
              <Icon className="w-4 h-4" />{tab.label}
            </button>
          );
        })}
      </div>

      {/* Filters */}
      {['expenses', 'revenues'].includes(activeTab) && (
        <div className="bg-white rounded-xl border border-slate-200 p-3 mb-4 flex gap-3 items-center flex-wrap">
          <span className="text-sm font-medium text-slate-500">Filter:</span>
          <input type="date" className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm"
            value={filters.from} onChange={e => setFilters({ ...filters, from: e.target.value })} />
          <span className="text-slate-400 text-sm">→</span>
          <input type="date" className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm"
            value={filters.to} onChange={e => setFilters({ ...filters, to: e.target.value })} />
          <button onClick={fetchData} className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-slate-200">Primijeni</button>
          {(filters.from || filters.to) && (
            <button onClick={() => setFilters({ from: '', to: '' })} className="text-slate-400 text-sm hover:text-slate-600">✕ Reset</button>
          )}
        </div>
      )}

      {/* Add Form */}
      {showForm && formFields[activeTab].length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm mb-4">
          <h3 className="font-bold text-slate-700 mb-4">+ Dodaj novu stavku</h3>
          {activeTab === 'expenses' && (
            <div className="mb-4 p-3 bg-blue-50 rounded-xl border border-blue-100">
              <p className="text-xs font-semibold text-blue-700 mb-2">💡 Detaljan obračun troška aranžmana (opcionalno)</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {['accommodation_cost', 'transport_cost', 'insurance_cost', 'commission'].map(k => (
                  <div key={k}>
                    <label className="text-xs text-blue-500">{CAT_LABELS[k.replace('_cost', '')] || k}</label>
                    <input type="number" className="w-full border border-blue-200 rounded px-2 py-1 text-sm mt-0.5"
                      placeholder="€0.00" value={form[k] || ''} onChange={e => setForm({ ...form, [k]: e.target.value })} />
                  </div>
                ))}
              </div>
              {(form.accommodation_cost || form.transport_cost || form.insurance_cost || form.commission) && (
                <p className="text-xs text-blue-600 mt-2 font-semibold">
                  Ukupno: {fmt((+form.accommodation_cost||0)+(+form.transport_cost||0)+(+form.insurance_cost||0)+(+form.commission||0))}
                </p>
              )}
            </div>
          )}
          <div className="grid md:grid-cols-3 gap-3">
            {formFields[activeTab].filter(f => !['accommodation_cost','transport_cost','insurance_cost','commission'].includes(f.key)).map(f => (
              <div key={f.key}>
                <label className="text-xs font-medium text-slate-500 mb-1 block">{f.label}</label>
                {f.type === 'select' ? (
                  <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={form[f.key] || ''} onChange={e => setForm({ ...form, [f.key]: e.target.value })}>
                    <option value="">-- Odaberi --</option>
                    {f.options!.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <input type={f.type || 'text'} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder={f.label} value={form[f.key] || ''} onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={postData} className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-semibold text-sm hover:bg-emerald-700">Spremi</button>
            <button onClick={() => setShowForm(false)} className="border border-slate-300 text-slate-600 px-4 py-2 rounded-lg text-sm hover:bg-slate-50">Otkaži</button>
          </div>
        </div>
      )}

      {/* EXPENSES */}
      {activeTab === 'expenses' && (
        <div className="space-y-4">
          {/* Drilldown chart */}
          {drilldown.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-slate-700">Drill-down: Rashodi po kategorijama</h3>
                <button onClick={() => setExpandDrilldown(!expandDrilldown)} className="text-slate-400 hover:text-slate-600">
                  {expandDrilldown ? <ChevronUp /> : <ChevronDown />}
                </button>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={drilldown.map(d => ({ name: CAT_LABELS[d.category] || d.category, ukupno: Number(d.total).toFixed(2), plaćeno: Number(d.paid).toFixed(2), na_čekanju: Number(d.pending).toFixed(2) }))}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v: any) => `€${Number(v).toLocaleString('bs-BA', { minimumFractionDigits: 2 })}`} />
                  <Legend />
                  <Bar dataKey="ukupno" fill="#2563eb" radius={[4,4,0,0]} />
                  <Bar dataKey="plaćeno" fill="#10b981" radius={[4,4,0,0]} />
                  <Bar dataKey="na_čekanju" fill="#f59e0b" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
              {expandDrilldown && (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="bg-slate-50 text-xs text-slate-500 uppercase">
                      {['Kategorija','Ukupno','Broj','Prosj.','Plaćeno','Na čekanju','Dospjelo'].map(h => <th key={h} className="text-left px-3 py-2">{h}</th>)}
                    </tr></thead>
                    <tbody>{drilldown.map((d: any) => (
                      <tr key={d.category} className="border-t border-slate-100 hover:bg-slate-50">
                        <td className="px-3 py-2 font-medium">{CAT_LABELS[d.category] || d.category}</td>
                        <td className="px-3 py-2 font-bold text-red-600">{fmt(d.total)}</td>
                        <td className="px-3 py-2 text-slate-500">{d.count}</td>
                        <td className="px-3 py-2 text-slate-500">{fmt(d.avg_amount)}</td>
                        <td className="px-3 py-2 text-green-600">{fmt(d.paid)}</td>
                        <td className="px-3 py-2 text-yellow-600">{fmt(d.pending)}</td>
                        <td className="px-3 py-2 text-red-600">{fmt(d.overdue)}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              )}
            </div>
          )}
          <DataTable data={data} statusField="payment_status" statusMap={STATUS_MAP}
            columns={[
              { key: 'expense_date', label: 'Datum', render: v => new Date(v).toLocaleDateString('bs-BA') },
              { key: 'category', label: 'Kategorija', render: v => CAT_LABELS[v] || v },
              { key: 'description', label: 'Opis' },
              { key: 'supplier_name', label: 'Dobavljač' },
              { key: 'amount', label: 'Iznos', render: v => <span className="font-bold text-red-600">{fmt(v)}</span> },
              { key: 'payment_status', label: 'Status' },
            ]} />
          <div className="bg-white rounded-xl p-3 border border-slate-200 text-right">
            <span className="text-sm text-slate-500">Ukupni rashodi: </span>
            <span className="text-xl font-extrabold text-red-600">{fmt(data.reduce((a, b) => a + Number(b.amount || 0), 0))}</span>
          </div>
        </div>
      )}

      {/* REVENUES */}
      {activeTab === 'revenues' && (
        <div className="space-y-4">
          <DataTable data={data} statusField="revenue_type" statusMap={{}}
            columns={[
              { key: 'payment_date', label: 'Datum', render: v => new Date(v).toLocaleDateString('bs-BA') },
              { key: 'revenue_type', label: 'Tip' },
              { key: 'customer_name', label: 'Klijent' },
              { key: 'payment_method', label: 'Metoda' },
              { key: 'amount', label: 'Iznos', render: v => <span className="font-bold text-emerald-600">{fmt(v)}</span> },
            ]} />
          <div className="bg-white rounded-xl p-3 border border-slate-200 text-right">
            <span className="text-sm text-slate-500">Ukupni prihodi: </span>
            <span className="text-xl font-extrabold text-emerald-600">{fmt(data.reduce((a, b) => a + Number(b.amount || 0), 0))}</span>
          </div>
        </div>
      )}

      {/* BUDGETS */}
      {activeTab === 'budgets' && (
        <div className="grid md:grid-cols-2 gap-4">
          {data.map((b: any) => {
            const pct = b.planned_revenue > 0 ? Math.min(100, (b.planned_expenses / b.planned_revenue) * 100) : 0;
            return (
              <div key={b.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <div className="flex justify-between items-start mb-3">
                  <div><h4 className="font-bold text-slate-800">{b.season}</h4><p className="text-xs text-slate-400">{b.year}</p></div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${b.status === 'active' ? 'bg-blue-100 text-blue-700' : b.status === 'approved' ? 'bg-green-100 text-green-700' : b.status === 'closed' ? 'bg-slate-100 text-slate-500' : 'bg-yellow-100 text-yellow-700'}`}>{(b.status || 'draft').toUpperCase()}</span>
                </div>
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between"><span className="text-slate-500">Plan prihoda</span><span className="font-semibold text-emerald-600">{fmt(b.planned_revenue)}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Plan rashoda</span><span className="font-semibold text-red-600">{fmt(b.planned_expenses)}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Marketing</span><span>{fmt(b.marketing_budget)}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Operacije</span><span>{fmt(b.operations_budget)}</span></div>
                </div>
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-slate-400 mb-1"><span>Rashodi vs Plan prihoda</span><span>{pct.toFixed(1)}%</span></div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-2.5 rounded-full transition-all ${pct > 90 ? 'bg-red-500' : pct > 70 ? 'bg-yellow-400' : 'bg-emerald-500'}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
                {b.notes && <p className="text-xs text-slate-400 mt-3 italic">{b.notes}</p>}
              </div>
            );
          })}
        </div>
      )}

      {/* ALLOCATIONS */}
      {activeTab === 'allocations' && (
        <DataTable data={data} columns={[
          { key: 'branch_name', label: 'Podružnica' },
          { key: 'period', label: 'Period' },
          { key: 'allocated_amount', label: 'Alociran iznos', render: v => fmt(v) },
          { key: 'allocation_percentage', label: '%', render: v => `${Number(v).toFixed(1)}%` },
        ]} />
      )}

      {/* PROFITABILITY */}
      {activeTab === 'profitability' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
            <h3 className="font-bold text-slate-700 mb-3">Profitabilnost po destinacijama</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={profitability.map(d => ({ name: d.destination, prihod: Number(d.total_revenue), troškovi: Number(d.total_cost), profit: Number(d.net_profit) }))}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: any) => fmt(v)} />
                <Legend />
                <Bar dataKey="prihod" fill="#10b981" radius={[4,4,0,0]} />
                <Bar dataKey="troškovi" fill="#ef4444" radius={[4,4,0,0]} />
                <Bar dataKey="profit" fill="#2563eb" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="bg-slate-50 text-xs text-slate-500 uppercase">
                  {['Destinacija','Zemlja','Prihod','Troškovi','Neto profit','Rezervacije','Avg profit/res.','Margina'].map(h =>
                    <th key={h} className="text-left px-4 py-3 font-semibold">{h}</th>)}
                </tr></thead>
                <tbody>
                  {profitability.map((d: any) => {
                    const margin = d.total_revenue > 0 ? (d.net_profit / d.total_revenue * 100) : 0;
                    return (
                      <tr key={d.destination} className="border-t border-slate-100 hover:bg-slate-50">
                        <td className="px-4 py-3 font-semibold text-slate-800">{d.destination}</td>
                        <td className="px-4 py-3 text-slate-500">{d.country}</td>
                        <td className="px-4 py-3 text-emerald-600 font-semibold">{fmt(d.total_revenue)}</td>
                        <td className="px-4 py-3 text-red-600">{fmt(d.total_cost)}</td>
                        <td className="px-4 py-3 font-bold text-blue-600">{fmt(d.net_profit)}</td>
                        <td className="px-4 py-3 text-slate-500 text-center">{d.booking_count || 0}</td>
                        <td className="px-4 py-3 text-slate-500">{fmt(d.avg_profit_per_booking)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-slate-100 rounded-full"><div className={`h-1.5 rounded-full ${margin > 20 ? 'bg-emerald-500' : 'bg-yellow-400'}`} style={{ width: `${Math.min(100, Math.max(0, margin))}%` }} /></div>
                            <span className={`text-xs font-semibold ${margin > 20 ? 'text-emerald-600' : 'text-yellow-600'}`}>{margin.toFixed(1)}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VENDOR INVOICES */}
      {activeTab === 'invoices' && (
        <div className="space-y-3">
          {data.map((inv: any) => (
            <div key={inv.id} className={`bg-white rounded-2xl border shadow-sm p-4 ${inv.status === 'overdue' ? 'border-red-200' : 'border-slate-200'}`}>
              <div className="flex flex-wrap justify-between items-start gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-bold text-slate-700 text-sm">{inv.invoice_number}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${INVOICE_STATUS[inv.status] || 'bg-slate-100 text-slate-600'}`}>{inv.status?.toUpperCase()}</span>
                  </div>
                  <p className="text-slate-500 text-sm">{inv.supplier_name || `Dobavljač #${inv.supplier_id}`} · {inv.description}</p>
                  <p className="text-xs text-slate-400 mt-1">Datum: {inv.invoice_date ? new Date(inv.invoice_date).toLocaleDateString('bs-BA') : '—'} · Rok: {inv.due_date ? new Date(inv.due_date).toLocaleDateString('bs-BA') : '—'}</p>
                </div>
                <span className={`text-xl font-extrabold ${inv.status === 'paid' ? 'text-emerald-600' : inv.status === 'overdue' ? 'text-red-600' : 'text-slate-700'}`}>{fmt(inv.amount)}</span>
              </div>
            </div>
          ))}
          {data.length === 0 && <div className="text-center py-12 text-slate-400">Nema faktura dobavljača.</div>}
        </div>
      )}

      {/* APPROVALS */}
      {activeTab === 'approvals' && (
        <div className="space-y-3">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-700">
            ⚠️ Prikazani su troškovi koji čekaju odobrenje. Menadžer može odobriti, odbiti ili proslijediti računovodstvu.
          </div>
          {data.map((exp: any) => (
            <div key={exp.id} className="bg-white rounded-2xl border border-yellow-200 shadow-sm p-4">
              <div className="flex flex-wrap justify-between items-start gap-2">
                <div>
                  <p className="font-semibold text-slate-800">{CAT_LABELS[exp.category] || exp.category} · {exp.description}</p>
                  <p className="text-sm text-slate-500 mt-1">{exp.supplier_name || 'Bez dobavljača'} · {exp.expense_date ? new Date(exp.expense_date).toLocaleDateString('bs-BA') : '—'}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xl font-extrabold text-red-600">{fmt(exp.amount)}</span>
                  <button onClick={() => { setApprovalModal(exp); setApprovalAction({ action: 'approve', forwarded_to: '', comment: '' }); }}
                    className="flex items-center gap-1 bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold px-3 py-2 rounded-lg transition">
                    <Eye className="w-3.5 h-3.5" /> Pregledaj
                  </button>
                </div>
              </div>
            </div>
          ))}
          {data.length === 0 && <div className="text-center py-12 text-slate-400">Nema troškova koji čekaju odobrenje.</div>}
        </div>
      )}

      {/* Approval Modal */}
      {approvalModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setApprovalModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800">Odobravanje troška</h3>
              <button onClick={() => setApprovalModal(null)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 mb-4 text-sm">
              <p><span className="text-slate-400">Opis:</span> <b>{approvalModal.description}</b></p>
              <p><span className="text-slate-400">Iznos:</span> <b className="text-red-600">{fmt(approvalModal.amount)}</b></p>
              <p><span className="text-slate-400">Kategorija:</span> {CAT_LABELS[approvalModal.category]}</p>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Akcija</label>
                <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  value={approvalAction.action} onChange={e => setApprovalAction({ ...approvalAction, action: e.target.value })}>
                  <option value="approve">✅ Odobri trošak</option>
                  <option value="forward">📤 Proslijedi računovodstvu</option>
                  <option value="reject">❌ Odbij trošak</option>
                </select>
              </div>
              {approvalAction.action === 'forward' && (
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Proslijedi na odjel</label>
                  <input type="text" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                    placeholder="Računovodstvo / Menadžment..." value={approvalAction.forwarded_to}
                    onChange={e => setApprovalAction({ ...approvalAction, forwarded_to: e.target.value })} />
                </div>
              )}
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Komentar</label>
                <textarea className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm h-20 resize-none"
                  placeholder="Napomena..." value={approvalAction.comment}
                  onChange={e => setApprovalAction({ ...approvalAction, comment: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={handleApproval}
                className={`flex-1 font-bold py-2.5 rounded-lg transition text-white ${approvalAction.action === 'approve' ? 'bg-teal-600 hover:bg-teal-700' : approvalAction.action === 'reject' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
                {approvalAction.action === 'approve' ? '✅ Odobri' : approvalAction.action === 'reject' ? '❌ Odbij' : <><Send className="w-4 h-4 inline mr-1" />Proslijedi</>}
              </button>
              <button onClick={() => setApprovalModal(null)} className="px-4 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50">Otkaži</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DataTable({ data, columns, statusField, statusMap }: {
  data: any[]; statusField?: string; statusMap?: Record<string, string>;
  columns: { key: string; label: string; render?: (v: any, row: any) => any }[];
}) {
  if (data.length === 0) return <div className="text-center py-12 text-slate-400 bg-white rounded-2xl border border-slate-200">Nema podataka za prikaz.</div>;
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="bg-slate-50">
            {columns.map(c => <th key={c.key} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{c.label}</th>)}
          </tr></thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} className="border-t border-slate-100 hover:bg-slate-50 transition">
                {columns.map(c => (
                  <td key={c.key} className="px-4 py-3 text-slate-700">
                    {c.key === statusField && statusMap && statusMap[row[c.key]]
                      ? <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusMap[row[c.key]]}`}>{row[c.key]}</span>
                      : c.render ? c.render(row[c.key], row) : row[c.key] ?? '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
