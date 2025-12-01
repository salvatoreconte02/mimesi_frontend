import { useState } from 'react';
import useAuthStore from './store/authStore';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/dottore/DashboardDottore';
import Button from './components/ui/Button';
import { motion } from 'framer-motion';

function Login() {
  const login = useAuthStore(s => s.login);
  
  return (
    <div className="h-screen w-full flex items-center justify-center bg-neutral-50 relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary via-secondary to-transparent"></div>
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl w-full max-w-md border border-white/50 z-10"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-mimesi-gradient mb-2">MIMESI</h1>
          <p className="text-neutral-500">Sistema Gestionale Laboratorio</p>
        </div>

        <div className="space-y-4">
          <p className="text-sm font-medium text-neutral-400 uppercase text-center">Seleziona Demo Persona</p>
          <Button variant="primary" className="w-full justify-between group" onClick={() => login('dottore')}>
            <span>Entra come Dottore</span> <span className="opacity-70 text-xs">Cliente</span>
          </Button>
          <Button variant="secondary" className="w-full justify-between" onClick={() => login('operatore')}>
            <span>Entra come Operatore</span> <span className="opacity-70 text-xs">Dipendente</span>
          </Button>
          <Button variant="ghost" className="w-full justify-between border border-neutral-200" onClick={() => login('admin')}>
            <span>Entra come Admin</span> <span className="opacity-70 text-xs">Gestore</span>
          </Button>
        </div>
        
        <p className="mt-8 text-xs text-center text-neutral-400">MVP Demo Build v0.1</p>
      </motion.div>
    </div>
  );
}

function App() {
  const { isAuthenticated } = useAuthStore();
  const [page, setPage] = useState('dashboard');

  if (!isAuthenticated) return <Login />;

  return (
    <div className="bg-neutral-50 min-h-screen pl-64">
      <Sidebar setPage={setPage} />
      <main className="min-h-screen">
        {page === 'dashboard' && <Dashboard />}
        {page !== 'dashboard' && (
          <div className="p-8 flex items-center justify-center h-screen opacity-50">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-neutral-300">Modulo in Sviluppo</h2>
              <p className="text-neutral-400">Questa sezione sarà disponibile nella prossima release.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;