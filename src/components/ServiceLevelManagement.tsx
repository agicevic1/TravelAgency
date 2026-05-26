import { useEffect, useState } from 'react';
import { apiClient } from '../lib/api';
import { ServiceLevel, SLAContract, ServiceRequirement, ServiceIncident, ServiceMetric } from '../types';
import { Shield, FileText, AlertTriangle, Activity, CheckCircle, Plus, Download, Star, Send, X, ChevronDown, ChevronUp, Users } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';

type Tab = 'levels' | 'contracts' | 'ola' | 'requirements' | 'incidents' | 'metrics' | 'partners';
const today = new Date().toISOString().slice(0, 10);

const SEVERITY_COLORS: Record<string, string> = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
};
const STATUS_COLORS: Record<string, string> = {
  open: 'bg-red-100 text-red-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  resolved: 'bg-green-100 text-green-700',
  closed: 'bg-slate-100 text-slate-600',
  active: 'bg-blue-100 text-blue-700',
  draft: 'bg-slate-100 text-slate-600',
  completed: 'bg-green-100 text-green-700',
  violated: 'bg-red-100 text-red-700',
};

export default function ServiceLevelManagement() {
  const [levels, setLevels] = useState<ServiceLevel[]>([]);
  const [contracts, setContracts] = useState<SLAContract[]>([]);
  const [olaContracts, setOlaContracts] = useState<any[]>([]);
  const [requirements, setRequirements] = useState<ServiceRequirement[]>([]);
  const [incidents, setIncidents] = useState<ServiceIncident[]>([]);
  const [metrics, setMetrics] = useState<ServiceMetric[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('levels');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Record<string, any>>({});
  const [escalateModal, setEscalateModal] = useState<number | null>(null);
  const [escalateForm, setEscalateForm] = useState({ department: 'IT', comment: '', escalated_by: 'agent' });
  const [expandedContract, setExpandedContract] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const load = async () => {
    const [l, c, r, i, m] = await Promise.all([
      apiClient.slm.getServiceLevels(), apiClient.slm.getSLAContracts(),
      apiClient.slm.getRequirements(), apiClient.slm.getIncidents(), apiClient.slm.getMetrics(),
    ]);
    setLevels(l.data || []); setContracts(c.data || []);
    setRequirements(r.data || []); setIncidents(i.data || []); setMetrics(m.data || []);

    try {
      const ola = await apiClient.slm.getOLAContracts();
      setOlaContracts(ola.data || []);
    } catch {}

    try {
      const pr = await (apiClient as any).slm?.getPartnerRatings?.();
      setPartners(pr?.data || []);
    } catch {}
  };
  useEffect(() => { load(); }, []);

  const defaults: Record<Tab, any> = {
    levels: { tier_name: 'premium_plus', response_time_minutes: 20, change_policy_hours: 24, support_availability: '24/7', includes_insurance: true, includes_wifi: true, includes_medical_support: true, price_modifier: 1.25, description: 'Prioritetna podrška, brži odziv i dodatne garancije.', is_active: true },
    contracts: { contract_number: `SLA-${Date.now()}`, customer_id: 1, service_level_id: 1, start_date: today, end_date: today, status: 'draft', agreed_response_time: 30, agreed_availability: '99%', service_type: 'Turistički aranžman', responsible_person: 'Menadžer SLA', priority: 'medium', penalty_clause: 'Kazna 5% vrijednosti ugovora po incidentu', max_resolution_time: 240, validity_months: 12, terms: 'Hotel i prevoznik moraju ispuniti ugovorene standarde.' },
    ola: { agreement_number: `OLA-${Date.now()}`, service_owner: 'IT Tim', description: 'Interni operativni sporazum o nivou usluge.', start_date: today, end_date: today, status: 'draft', agreed_metrics: { response_time: '30 min', availability: '99%', resolution_time: '4h', escalation_time: '1h' } },
    requirements: { requirement_title: 'Posebni zahtjev', destination_id: 1, requested_by: 'klijent', description: 'Zahtjev za posebnim uslovima.', priority: 'medium', status: 'submitted', estimated_cost: 0, feasibility: 'needs_review', evaluation_notes: '' },
    incidents: { incident_number: `INC-${Date.now()}`, booking_id: 1, sla_contract_id: 1, incident_type: 'accommodation_issue', severity: 'medium', description: 'Opis incidenta.', response_time_minutes: 30, resolution_notes: '', status: 'open', sla_met: true },
    metrics: { metric_date: today, supplier_id: 1, destination_id: 1, metric_type: 'sla_compliance', metric_value: 96, target_value: 95, unit: 'percentage', notes: 'Mjerenje kvaliteta.' },
    partners: {},
  };

  const fields: Record<Tab, { key: string; label: string; type?: string; options?: string[] }[]> = {
    levels: [
      { key: 'tier_name', label: 'Naziv tiera' }, { key: 'response_time_minutes', label: 'Odziv (min)', type: 'number' },
      { key: 'change_policy_hours', label: 'Politika izmjena (h)', type: 'number' }, { key: 'support_availability', label: 'Dostupnost podrške' },
      { key: 'price_modifier', label: 'Modifikator cijene', type: 'number' }, { key: 'description', label: 'Opis' },
    ],
    contracts: [
      { key: 'contract_number', label: 'Broj ugovora' }, { key: 'customer_id', label: 'ID klijenta', type: 'number' },
      { key: 'service_level_id', label: 'ID nivoa usluge', type: 'number' }, { key: 'start_date', label: 'Početak', type: 'date' },
      { key: 'end_date', label: 'Kraj', type: 'date' }, { key: 'agreed_response_time', label: 'Max odziv (min)', type: 'number' },
      { key: 'agreed_availability', label: 'Cilj dostupnosti (%)' }, { key: 'service_type', label: 'Tip usluge' },
      { key: 'responsible_person', label: 'Odgovorna osoba' }, { key: 'priority', label: 'Prioritet', type: 'select', options: ['low', 'medium', 'high', 'critical'] },
      { key: 'penalty_clause', label: 'Kaznena odredba' }, { key: 'max_resolution_time', label: 'Max rješavanje (min)', type: 'number' },
      { key: 'validity_months', label: 'Valjanost (mj.)', type: 'number' }, { key: 'terms', label: 'Uslovi i odredbe' },
      { key: 'status', label: 'Status', type: 'select', options: ['draft', 'active', 'completed', 'violated'] },
    ],
    ola: [
      { key: 'agreement_number', label: 'Broj sporazuma' },
      { key: 'service_owner', label: 'Vlasnik usluge' },
      { key: 'description', label: 'Opis' },
      { key: 'start_date', label: 'Početak', type: 'date' },
      { key: 'end_date', label: 'Kraj', type: 'date' },
      { key: 'status', label: 'Status', type: 'select', options: ['draft', 'active', 'expired'] },
    ],
    requirements: [
      { key: 'requirement_title', label: 'Naziv zahtjeva' }, { key: 'destination_id', label: 'ID destinacije', type: 'number' },
      { key: 'requested_by', label: 'Zahtjeva' }, { key: 'description', label: 'Opis' },
      { key: 'priority', label: 'Prioritet', type: 'select', options: ['low', 'medium', 'high', 'critical'] },
      { key: 'estimated_cost', label: 'Procijenjena cijena', type: 'number' },
    ],
    incidents: [
      { key: 'incident_number', label: 'Broj incidenta' }, { key: 'booking_id', label: 'ID rezervacije', type: 'number' },
      { key: 'incident_type', label: 'Tip', type: 'select', options: ['flight_delay', 'accommodation_issue', 'medical', 'document_issue', 'other'] },
      { key: 'severity', label: 'Težina', type: 'select', options: ['low', 'medium', 'high', 'critical'] },
      { key: 'description', label: 'Opis' },
    ],
    metrics: [
      { key: 'metric_date', label: 'Datum', type: 'date' }, { key: 'supplier_id', label: 'ID dobavljača', type: 'number' },
      { key: 'destination_id', label: 'ID destinacije', type: 'number' },
      { key: 'metric_type', label: 'Tip', type: 'select', options: ['customer_satisfaction', 'response_time', 'incident_rate', 'sla_compliance'] },
      { key: 'metric_value', label: 'Vrijednost', type: 'number' }, { key: 'target_value', label: 'Cilj', type: 'number' },
      { key: 'unit', label: 'Jedinica', type: 'select', options: ['percentage', 'minutes', 'count', 'score'] },
      { key: 'notes', label: 'Napomena' },
    ],
    partners: [],
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...defaults[activeTab], ...form };
    if (activeTab === 'levels') await apiClient.slm.createServiceLevel(data);
    if (activeTab === 'contracts') await apiClient.slm.createSLAContract(data);
    if (activeTab === 'ola') await apiClient.slm.createOLAContract(data);
    if (activeTab === 'requirements') await apiClient.slm.createRequirement(data);
    if (activeTab === 'incidents') await apiClient.slm.createIncident(data);
    if (activeTab === 'metrics') await apiClient.slm.createMetric(data);
    setShowForm(false); setForm({}); await load();
    showToast('✅ Uspješno kreirano!');
  };

  const handleEscalate = async () => {
    if (!escalateModal) return;
    try {
      await fetch(`${(apiClient as any)._baseUrl || 'http://localhost:5000'}/api/slm/incidents/${escalateModal}/escalate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-role': 'admin' },
        body: JSON.stringify(escalateForm),
      });
      setEscalateModal(null);
      await load();
      showToast(`✅ Incident proslijeđen: ${escalateForm.department}`);
    } catch (err) {
      showToast('❌ Greška pri eskalaciji');
    }
  };

  const tabs = [
    ['levels', 'Nivoi usluga', Shield, levels.length],
    ['contracts', 'SLA Ugovori', FileText, contracts.length],
    ['ola', 'OLA Ugovori', FileText, olaContracts.length],
    ['requirements', 'Zahtjevi', CheckCircle, requirements.length],
    ['incidents', 'Incidenti', AlertTriangle, incidents.filter(i => i.status === 'open').length],
    ['metrics', 'Metrike', Activity, 0],
    ['partners', 'Monitoring Partnera', Users, partners.length],
  ] as const;

  const latestMetrics = [...metrics]
    .sort((a, b) => new Date(b.metric_date).getTime() - new Date(a.metric_date).getTime())
    .filter((m, i, arr) => arr.findIndex(x => x.metric_type === m.metric_type) === i);

  const slaCompliance = latestMetrics.length > 0
    ? (latestMetrics.filter(m => {
        const val = Number(m.metric_value);
        const target = Number(m.target_value);
        if (m.metric_type === 'response_time' || m.metric_type === 'incident_rate') {
          return val <= target;
        }
        return val >= target;
      }).length / latestMetrics.length * 100).toFixed(0)
    : '–';

  const openIncidents = incidents.filter(i => i.status === 'open').length;
  const avgResponseTime = incidents.length > 0
    ? Math.round(incidents.reduce((a, b) => a + (b.response_time_minutes || 0), 0) / incidents.length)
    : 0;

  return (
    <div className="space-y-6 pb-10">
      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-slate-800 text-white px-5 py-3 rounded-xl shadow-lg animate-bounce text-sm">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight">Service Level Management</h2>
            <p className="text-blue-200 mt-1">ITIL v4 · Monitoring partnera, SLA ugovori i eskalacija incidenata</p>
          </div>
          <button onClick={() => { setForm(defaults[activeTab]); setShowForm(!showForm); }}
            className="bg-white text-blue-700 font-bold px-5 py-2.5 rounded-xl flex gap-2 items-center hover:bg-blue-50 shadow transition">
            <Plus className="w-4 h-4" /> Dodaj novi unos
          </button>
        </div>
        {/* KPI row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
          {[
            { label: 'SLA Usklađenost', value: `${slaCompliance}%`, sub: 'Udio ispunjenih SLA', color: 'text-green-300' },
            { label: 'Otvoreni incidenti', value: openIncidents, sub: 'Zahtijevaju pažnju', color: 'text-red-300' },
            { label: 'Aktivni ugovori', value: contracts.filter(c => c.status === 'active').length, sub: 'SLA Ugovori', color: 'text-blue-300' },
            { label: 'Avg. odziv', value: `${avgResponseTime} min`, sub: 'Prosječno vrijeme', color: 'text-yellow-300' },
          ].map(k => (
            <div key={k.label} className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
              <p className="text-xs text-blue-200">{k.label}</p>
              <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
              <p className="text-xs text-blue-200 mt-1">{k.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200 overflow-x-auto pb-px">
        {tabs.map(([id, label, Icon, count]) => (
          <button key={id} onClick={() => { setActiveTab(id as Tab); setShowForm(false); }}
            className={`px-4 py-2.5 font-semibold whitespace-nowrap flex items-center gap-2 rounded-t-lg transition text-sm ${activeTab === id ? 'text-blue-700 border-b-2 border-blue-600 bg-blue-50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>
            <Icon className="w-4 h-4" />{label}
            {Number(count) > 0 && <span className={`text-xs px-1.5 py-0.5 rounded-full ${id === 'incidents' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>{count}</span>}
          </button>
        ))}
      </div>

      {/* Form */}
      {showForm && activeTab !== 'partners' && (
        <form onSubmit={submit} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <h3 className="font-bold text-slate-700 mb-4">
            {activeTab === 'levels' && '+ Novi nivo usluge'}{activeTab === 'contracts' && '+ Novi SLA ugovor'}{activeTab === 'ola' && '+ Novi OLA ugovor'}{activeTab === 'requirements' && '+ Novi zahtjev'}{activeTab === 'incidents' && '+ Novi incident'}{activeTab === 'metrics' && '+ Nova metrika'}
          </h3>
          <div className="grid md:grid-cols-3 gap-3">
            {fields[activeTab].map(f => (
              <div key={f.key} className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-500">{f.label}</label>
                {f.type === 'select' ? (
                  <select className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form[f.key] ?? ''} onChange={e => setForm({ ...form, [f.key]: e.target.value })}>
                    {f.options!.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <input type={f.type || 'text'} className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={f.label} value={form[f.key] ?? ''} onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <button type="submit" className="bg-blue-600 text-white rounded-lg px-6 py-2 font-semibold text-sm hover:bg-blue-700">Kreiraj</button>
            <button type="button" onClick={() => setShowForm(false)} className="border border-slate-300 text-slate-600 rounded-lg px-4 py-2 text-sm hover:bg-slate-50">Otkaži</button>
          </div>
        </form>
      )}

      {/* NIVOI USLUGA */}
      {activeTab === 'levels' && (
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
          {levels.map(l => (
            <div key={l.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition">
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">{l.tier_name}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${l.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{l.is_active ? 'Aktivan' : 'Neaktivan'}</span>
              </div>
              <p className="text-slate-600 text-sm mt-2 mb-4 line-clamp-2">{l.description}</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">⏱ Odziv</span><span className="font-semibold">{l.response_time_minutes} min</span></div>
                <div className="flex justify-between"><span className="text-slate-500">🕐 Dostupnost</span><span className="font-semibold">{l.support_availability}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">🔄 Izmjene</span><span className="font-semibold">{l.change_policy_hours}h</span></div>
                <div className="flex justify-between"><span className="text-slate-500">💶 Modifikator</span><span className="font-semibold text-blue-700">+{(Number(l.price_modifier) * 100).toFixed(0)}%</span></div>
              </div>
              <div className="flex gap-2 mt-4 flex-wrap">
                {l.includes_insurance && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">🛡 Osiguranje</span>}
                {l.includes_wifi && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">📶 WiFi</span>}
                {l.includes_medical_support && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">🏥 Medicinska</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SLA UGOVORI */}
      {activeTab === 'contracts' && (
        <div className="space-y-3">
          {contracts.map(c => (
            <div key={c.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50"
                onClick={() => setExpandedContract(expandedContract === Number(c.id) ? null : Number(c.id))}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{c.contract_number}</p>
                    <p className="text-sm text-slate-500">{(c as any).customer_name || `Klijent #${c.customer_id}`} · {(c as any).tier_name || 'Standard'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[c.status] || 'bg-slate-100 text-slate-600'}`}>{c.status.toUpperCase()}</span>
                  <span className="text-sm text-slate-500">{c.start_date} → {c.end_date}</span>
                  <a href={apiClient.slm.downloadSLAContract(Number(c.id))} target="_blank" onClick={e => e.stopPropagation()}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium">
                    <Download className="w-4 h-4" /> PDF
                  </a>
                  {expandedContract === Number(c.id) ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </div>
              </div>
              {expandedContract === Number(c.id) && (
                <div className="border-t border-slate-100 p-4 bg-slate-50 grid md:grid-cols-3 gap-4 text-sm">
                  <div><p className="text-xs text-slate-400 mb-1">ODZIV / DOSTUPNOST</p><p className="font-semibold">{c.agreed_response_time} min / {c.agreed_availability}</p></div>
                  <div><p className="text-xs text-slate-400 mb-1">DIGITALNI POTPIS</p><p className="font-mono text-xs text-slate-600">{c.digital_signature || 'N/A'}</p></div>
                  <div><p className="text-xs text-slate-400 mb-1">DATUM POTPISIVANJA</p><p className="font-semibold">{c.signed_at || 'Nije potpisano'}</p></div>
                  <div className="md:col-span-3"><p className="text-xs text-slate-400 mb-1">USLOVI</p><p className="text-slate-600">{c.terms || '—'}</p></div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* OLA UGOVORI */}
      {activeTab === 'ola' && (
        <div className="space-y-4">
          {olaContracts.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Nema OLA sporazuma</p>
              <p className="text-sm">Dodajte prvi OLA ugovor klikom na dugme gore.</p>
            </div>
          )}
          {olaContracts.map((ola: any) => {
            let metrics: Record<string, string> = {};
            try { metrics = typeof ola.agreed_metrics === 'string' ? JSON.parse(ola.agreed_metrics) : (ola.agreed_metrics || {}); } catch {}
            const statusColor = ola.status === 'active' ? 'bg-green-100 text-green-700' : ola.status === 'expired' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600';
            return (
              <div key={ola.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <div className="flex flex-wrap justify-between items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-mono font-bold text-slate-700">{ola.agreement_number}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${statusColor}`}>{ola.status?.toUpperCase()}</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-800 mb-1">Vlasnik: {ola.service_owner}</p>
                    <p className="text-sm text-slate-600 mb-3">{ola.description}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                      {Object.entries(metrics).map(([k, v]) => (
                        <div key={k} className="bg-green-50 rounded-lg p-2">
                          <p className="text-xs text-slate-400 capitalize">{k.replace(/_/g, ' ')}</p>
                          <p className="text-sm font-bold text-green-700">{v as string}</p>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-slate-400">
                      Važnost: <b>{ola.start_date ? new Date(ola.start_date).toLocaleDateString('bs-BA') : '—'}</b> — <b>{ola.end_date ? new Date(ola.end_date).toLocaleDateString('bs-BA') : '—'}</b>
                    </p>
                  </div>
                  <a
                    href={apiClient.slm.downloadOLAContract(ola.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-3 py-2 rounded-lg transition shrink-0"
                    title="Preuzmi OLA PDF"
                  >
                    <Download className="w-4 h-4" /> PDF
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ZAHTJEVI */}
      {activeTab === 'requirements' && (
        <div className="grid md:grid-cols-2 gap-4">
          {requirements.map(r => (
            <div key={r.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-slate-800 text-sm leading-snug pr-2">{r.requirement_title}</h4>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold whitespace-nowrap ${SEVERITY_COLORS[r.priority] || 'bg-slate-100 text-slate-600'}`}>{r.priority.toUpperCase()}</span>
              </div>
              <p className="text-slate-500 text-sm mb-3 line-clamp-2">{r.description}</p>
              <div className="flex justify-between items-center text-xs">
                <span className={`px-2 py-0.5 rounded-full ${STATUS_COLORS[r.status] || 'bg-slate-100 text-slate-600'}`}>{r.status}</span>
                <span className="text-slate-500">Procijenjena cijena: <span className="font-semibold text-slate-700">€{Number(r.estimated_cost || 0).toLocaleString()}</span></span>
              </div>
              {r.evaluation_notes && <p className="mt-2 text-xs text-slate-400 italic">{r.evaluation_notes}</p>}
            </div>
          ))}
        </div>
      )}

      {/* INCIDENTI */}
      {activeTab === 'incidents' && (
        <div className="space-y-3">
          {incidents.map(i => (
            <div key={i.id} className={`bg-white rounded-2xl border shadow-sm p-4 ${i.status === 'open' ? 'border-red-200' : 'border-slate-200'}`}>
              <div className="flex flex-wrap justify-between items-start gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-bold text-slate-700 text-sm">{i.incident_number}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${SEVERITY_COLORS[i.severity] || ''}`}>{i.severity.toUpperCase()}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[i.status] || ''}`}>{i.status}</span>
                    {i.sla_met === false && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-semibold">❌ SLA KRŠEN</span>}
                    {i.sla_met === true && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">✅ SLA OK</span>}
                  </div>
                  <p className="text-slate-700 text-sm">{i.description}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Tip: <b>{i.incident_type}</b> · Odziv: <b>{i.response_time_minutes || '—'} min</b> · Prijavljeno: {i.reported_at ? new Date(i.reported_at).toLocaleDateString('bs-BA') : '—'}
                    {i.resolved_at && ` · Riješeno: ${new Date(i.resolved_at).toLocaleDateString('bs-BA')}`}
                  </p>
                  {i.resolution_notes && <p className="text-xs text-slate-500 mt-1 italic line-clamp-2">{i.resolution_notes}</p>}
                  {i.resolution_notes && i.resolution_notes.includes('[ESKALACIJA ->') && (
                    <div className="mt-2 flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-semibold">
                        <Send className="w-3 h-3" /> Proslijeđen
                      </span>
                      {(() => {
                        const match = i.resolution_notes.match(/\[ESKALACIJA -> ([^\]]+)\]/);
                        return match ? <span className="text-xs text-slate-400">→ {match[1]}</span> : null;
                      })()}
                    </div>
                  )}
                </div>
                {(i.status === 'open' || i.status === 'in_progress') && !(i.resolution_notes && i.resolution_notes.includes('[ESKALACIJA ->')) && (
                  <button onClick={() => { setEscalateModal(Number(i.id)); setEscalateForm({ department: 'IT', comment: '', escalated_by: 'agent' }); }}
                    className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-3 py-2 rounded-lg transition">
                    <Send className="w-3.5 h-3.5" /> Proslijedi
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ESKALACIJA MODAL */}
      {escalateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setEscalateModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800">🚨 Proslijedi incident</h3>
              <button onClick={() => setEscalateModal(null)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Odjel koji rješava</label>
                <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  value={escalateForm.department} onChange={e => setEscalateForm({ ...escalateForm, department: e.target.value })}>
                  {['IT', 'Logistika', 'Prodaja', 'Pravna služba', 'Računovodstvo', 'Menadžment', 'Partnerski odnosi'].map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Komentar pri prosljeđivanju</label>
                <textarea className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm h-24 resize-none"
                  placeholder="Opis situacije i potrebnih akcija..."
                  value={escalateForm.comment} onChange={e => setEscalateForm({ ...escalateForm, comment: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Prosljeđuje</label>
                <input type="text" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="Ime agenta" value={escalateForm.escalated_by}
                  onChange={e => setEscalateForm({ ...escalateForm, escalated_by: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={handleEscalate} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-lg transition">
                <Send className="w-4 h-4 inline mr-1" /> Proslijedi incident
              </button>
              <button onClick={() => setEscalateModal(null)} className="px-4 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50">Otkaži</button>
            </div>
          </div>
        </div>
      )}

      {/* METRIKE */}
      {activeTab === 'metrics' && (
        <div className="space-y-5">
          <div className="grid md:grid-cols-4 gap-4">
            {[...metrics].sort((a, b) => new Date(b.metric_date).getTime() - new Date(a.metric_date).getTime())
              .filter((m, i, arr) => arr.findIndex(x => x.metric_type === m.metric_type) === i)
              .map(m => {
                const pct = Math.min(100, Number(m.metric_value));
                const lowerIsBetter = m.metric_type === 'response_time' || m.metric_type === 'incident_rate';
                const ok = lowerIsBetter
                  ? Number(m.metric_value) <= Number(m.target_value)
                  : Number(m.metric_value) >= Number(m.target_value);
                return (
                  <div key={m.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                    <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">{m.metric_type.replace(/_/g, ' ')}</p>
                    <p className={`text-3xl font-extrabold ${ok ? 'text-green-600' : 'text-red-500'}`}>{m.metric_value}</p>
                    <div className="mt-2 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-2 rounded-full ${ok ? 'bg-green-500' : 'bg-red-400'}`} style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-xs text-slate-400 mt-1.5">Cilj: {m.target_value} {m.unit} {ok ? '✅' : '⚠️'}</p>
                  </div>
                );
              })}
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
              <h3 className="font-bold text-slate-700 mb-3">SLA Compliance Trend</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={metrics.filter(m => m.metric_type === 'sla_compliance')}>
                  <XAxis dataKey="metric_date" tick={{ fontSize: 11 }} />
                  <YAxis domain={[80, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="metric_value" stroke="#2563eb" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="target_value" stroke="#94a3b8" strokeDasharray="4 4" strokeWidth={1.5} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
              <h3 className="font-bold text-slate-700 mb-3">Status incidenata</h3>
              <div className="flex items-center justify-center">
                <PieChart width={240} height={200}>
                  <Pie data={[
                    { name: 'Otvoreni', value: incidents.filter(i => i.status === 'open').length },
                    { name: 'U toku', value: incidents.filter(i => i.status === 'in_progress').length },
                    { name: 'Riješeni', value: incidents.filter(i => i.status === 'resolved').length },
                    { name: 'Zatvoreni', value: incidents.filter(i => i.status === 'closed').length },
                  ]} dataKey="value" outerRadius={80} label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                    <Cell fill="#ef4444" /><Cell fill="#f59e0b" /><Cell fill="#10b981" /><Cell fill="#64748b" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MONITORING PARTNERA */}
      {activeTab === 'partners' && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">Ocjena kvaliteta eksternih partnera</h3>
              <p className="text-sm text-slate-500 mt-0.5">Hoteli, prevoznici i dobavljači ocijenjeni prema SLA parametrima</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50">
                    {['Partner', 'Tip', 'Zemlja', 'Prosj. ocjena', 'Broj mjerenja', 'Zadnje mjerenje', 'Status'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {partners.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-8 text-slate-400">Nema podataka o partnerima</td></tr>
                  ) : partners.map((p: any) => {
                    const score = Number(p.avg_quality || 0);
                    const scoreColor = score >= 90 ? 'text-green-600 bg-green-50' : score >= 70 ? 'text-yellow-600 bg-yellow-50' : 'text-red-600 bg-red-50';
                    const status = score >= 90 ? '✅ Odličan' : score >= 70 ? '⚠️ Prihvatljiv' : score > 0 ? '❌ Ispod norme' : '— N/A';
                    return (
                      <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50 transition">
                        <td className="px-4 py-3 font-semibold text-slate-700">{p.supplier_name}</td>
                        <td className="px-4 py-3"><span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{p.supplier_type}</span></td>
                        <td className="px-4 py-3 text-slate-500">{p.country}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div className={`h-2 rounded-full ${score >= 90 ? 'bg-green-500' : score >= 70 ? 'bg-yellow-400' : 'bg-red-400'}`} style={{ width: `${Math.min(100, score)}%` }} />
                            </div>
                            <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${scoreColor}`}>{score > 0 ? score.toFixed(1) : '—'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-500">{p.measurement_count || 0}</td>
                        <td className="px-4 py-3 text-slate-500 text-xs">{p.last_measured ? new Date(p.last_measured).toLocaleDateString('bs-BA') : '—'}</td>
                        <td className="px-4 py-3 text-xs font-medium">{status}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          {metrics.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
              <h3 className="font-bold text-slate-700 mb-3">Usporedba metrika po tipu</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={['customer_satisfaction', 'sla_compliance', 'response_time', 'incident_rate'].map(type => ({
                  name: type.replace(/_/g, ' '),
                  vrijednost: metrics.filter(m => m.metric_type === type).reduce((a, b, _, arr) => a + Number(b.metric_value) / arr.length, 0).toFixed(1),
                  cilj: metrics.filter(m => m.metric_type === type)[0]?.target_value || 0,
                }))}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="vrijednost" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="cilj" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </div>
  );
}