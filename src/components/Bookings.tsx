import { useEffect, useState } from 'react';
import { apiClient } from '../lib/api';
import { Booking } from '../types';
import { Calendar, Plus } from 'lucide-react';

type BookingWithDetails = Booking & { customer_name?: string; product_name?: string };
const today = new Date().toISOString().slice(0, 10);

export default function Bookings() {
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Record<string, any>>({ booking_number: `TP-${Date.now()}`, customer_id: 1, product_id: 1, booking_date: today, travel_date: today, status: 'pending', total_price: 1200, cost_price: 820, net_profit: 380, number_of_travelers: 2, notes: 'Nova rezervacija' });

  const load = async () => { const res = await apiClient.bookings.getAll(); setBookings(res.data || []); };
  useEffect(() => { load(); }, []);

  const filtered = filter === 'all' ? bookings : bookings.filter((b) => b.status === filter);
  const submit = async (e: React.FormEvent) => { e.preventDefault(); await apiClient.bookings.create(form); setShowForm(false); await load(); };
  const statuses = ['all', 'pending', 'confirmed', 'completed', 'cancelled'] as const;

  return <div className="space-y-6">
    <div className="flex justify-between items-start gap-4"><div><h2 className="text-3xl font-bold text-slate-800">Rezervacije</h2><p className="text-slate-600">Pregled rezervacija: klijent, proizvod, putovanje, putnici, cijena i napomena.</p></div><button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex gap-2"><Plus className="w-4" /> Dodaj rezervaciju</button></div>
    <div className="grid md:grid-cols-4 gap-4"><Card title="Ukupno" value={bookings.length}/><Card title="Na čekanju" value={bookings.filter(b=>b.status==='pending').length}/><Card title="Potvrđene" value={bookings.filter(b=>b.status==='confirmed').length}/><Card title="Profit" value={`€${bookings.reduce((s,b)=>s+Number(b.net_profit||0),0).toLocaleString()}`}/></div>
    {showForm && <form onSubmit={submit} className="bg-white rounded-xl border p-4 grid md:grid-cols-4 gap-3 shadow-sm">{Object.keys(form).map(k => <input key={k} className="border rounded-lg px-3 py-2" placeholder={k} value={form[k] ?? ''} onChange={e=>setForm({...form,[k]:e.target.value})}/>)}<button className="bg-green-600 text-white rounded-lg px-4 py-2">Sačuvaj</button></form>}
    <div className="flex gap-2 flex-wrap">{statuses.map(s => <button key={s} onClick={()=>setFilter(s)} className={`px-4 py-2 rounded-lg font-semibold ${filter===s?'bg-blue-600 text-white':'bg-white border text-slate-700'}`}>{s === 'all' ? 'Sve' : s}</button>)}</div>
    <div className="bg-white rounded-xl shadow border overflow-x-auto"><table className="w-full text-sm"><thead><tr className="bg-slate-50"><th className="p-3 text-left">ID</th><th className="p-3 text-left">Status</th><th className="p-3 text-left">Klijent</th><th className="p-3 text-left">Proizvod</th><th className="p-3 text-left">Datum putovanja</th><th className="p-3 text-left">Putnici</th><th className="p-3 text-left">Datum rezervacije</th><th className="p-3 text-left">Ukupna cijena</th><th className="p-3 text-left">Napomena</th></tr></thead><tbody>{filtered.map(b => <tr key={b.id} className="border-t hover:bg-slate-50"><td className="p-3 font-semibold">{b.booking_number || b.id}</td><td className="p-3"><span className="px-3 py-1 rounded-full bg-slate-100">{b.status}</span></td><td className="p-3">{b.customer_name || b.customer_id}</td><td className="p-3">{b.product_name || b.product_id}</td><td className="p-3">{b.travel_date}</td><td className="p-3">{b.number_of_travelers}</td><td className="p-3">{b.booking_date}</td><td className="p-3 font-semibold">€{Number(b.total_price).toLocaleString()}</td><td className="p-3">{b.notes}</td></tr>)}</tbody></table></div>
  </div>;
}

function Card({ title, value }: { title: string; value: any }) { return <div className="bg-white rounded-xl border shadow p-4"><Calendar className="w-6 h-6 text-blue-600 mb-2"/><p className="text-sm text-slate-500">{title}</p><p className="text-2xl font-bold text-slate-800">{value}</p></div>; }
