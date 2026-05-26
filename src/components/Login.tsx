import { useState } from 'react';
import { apiClient } from '../lib/api';
import { Plane, Lock } from 'lucide-react';

type User = { username: string; role: 'admin' | 'finance'; name: string };

export default function Login({ onLogin }: { onLogin: (user: User, token: string) => void }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin1234');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await apiClient.auth.login({ username, password });
      onLogin(res.data.user, res.data.token);
    } catch {
      setError('Pogrešan username ili password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-800 to-cyan-600 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-600 text-white p-3 rounded-xl"><Plane /></div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">TravelPlus</h1>
            <p className="text-slate-500">Turistička agencija</p>
          </div>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-slate-700">Username</label>
            <input className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-3" value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700">Password</label>
            <input className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-3" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{error}</p>}
          <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg py-3 flex items-center justify-center gap-2">
            <Lock className="w-4 h-4" /> {loading ? 'Prijava...' : 'Uloguj se'}
          </button>
        </form>
        <div className="mt-6 text-sm text-slate-600 bg-slate-50 rounded-lg p-4">
          <p><b>Admin:</b> admin / admin1234</p>
          <p><b>Finance:</b> finance / finance1234</p>
        </div>
      </div>
    </div>
  );
}
