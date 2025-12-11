import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, Clock, AlertCircle, Package, Users, 
  ChevronRight, Mail, CheckCircle, FileText
} from 'lucide-react';
import Card from '../../components/ui/Card';
import useAuthStore from '../../store/authStore';

export default function DashboardAdmin({ setPage }) {
  const user = useAuthStore((state) => state.user);
  
  const [stats, setStats] = useState({
    pending: 0,
    working: 0,
    warning: 0,
    completed: 0
  });
  const [recentJobs, setRecentJobs] = useState([]);
  const [recentMessages, setRecentMessages] = useState([]);

  useEffect(() => {
    // 1. Carica Lavorazioni
    const allJobs = JSON.parse(localStorage.getItem('mimesi_all_lavorazioni') || '[]');
    
    setStats({
      pending: allJobs.filter(j => j.stato === 'in_evaluation' || j.stato === 'pending').length,
      working: allJobs.filter(j => j.stato === 'working').length,
      warning: allJobs.filter(j => j.stato === 'warning').length,
      completed: allJobs.filter(j => j.stato === 'completed').length
    });

    // Prendi i primi 3 lavori più recenti
    setRecentJobs(allJobs.sort((a, b) => new Date(b.data) - new Date(a.data)).slice(0, 3));

    // 2. Carica Messaggi Inbox Admin
    const inbox = JSON.parse(localStorage.getItem('mimesi_admin_inbox') || '[]');
    setRecentMessages(inbox.slice(0, 4)); 

  }, []);

  // --- FUNZIONE DI NAVIGAZIONE SMART ---
  const navigateTo = (page, paramKey, paramValue) => {
      if (paramKey && paramValue) {
          sessionStorage.setItem(paramKey, paramValue);
      }
      setPage(page);
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto min-h-screen space-y-8 bg-neutral-50">
      
      {/* HEADER DI BENVENUTO */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-neutral-800">Admin Console</h1>
          <p className="text-neutral-500 mt-1">Panoramica operativa del laboratorio Mimesi.</p>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-sm font-bold text-primary">{new Date().toLocaleDateString('it-IT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p className="text-xs text-neutral-400">Operatore: {user?.name}</p>
        </div>
      </div>

      {/* STATISTICHE (LINK FILTRATI A LAVORAZIONI) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* CARD 1: DA VALUTARE */}
        <motion.div 
          whileHover={{ y: -5 }}
          onClick={() => navigateTo('lavorazioni', 'mimesi_filter_pref', 'da_valutare')}
          className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm cursor-pointer hover:border-blue-300 group"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <AlertCircle size={24} />
            </div>
            {stats.pending > 0 && (
                <span className="flex items-center text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full animate-pulse">
                Azione Richiesta
                </span>
            )}
          </div>
          <h3 className="text-4xl font-bold text-neutral-800 mb-1">{stats.pending}</h3>
          <p className="text-sm text-neutral-500 font-medium">Da Valutare</p>
        </motion.div>

        {/* CARD 2: IN LAVORAZIONE */}
        <motion.div 
          whileHover={{ y: -5 }}
          onClick={() => navigateTo('lavorazioni', 'mimesi_filter_pref', 'attivi')}
          className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm cursor-pointer hover:border-primary/30 group"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
              <Activity size={24} />
            </div>
          </div>
          <h3 className="text-4xl font-bold text-neutral-800 mb-1">{stats.working}</h3>
          <p className="text-sm text-neutral-500 font-medium">In Produzione</p>
        </motion.div>

        {/* CARD 3: IN PROVA */}
        <motion.div 
          whileHover={{ y: -5 }}
          onClick={() => navigateTo('lavorazioni', 'mimesi_filter_pref', 'in_prova')}
          className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm cursor-pointer hover:border-orange-300 group"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-colors">
              <Clock size={24} />
            </div>
          </div>
          <h3 className="text-4xl font-bold text-neutral-800 mb-1">{stats.warning}</h3>
          <p className="text-sm text-neutral-500 font-medium">In Prova / Attesa</p>
        </motion.div>

        {/* CARD 4: COMPLETATI */}
        <motion.div 
          whileHover={{ y: -5 }}
          onClick={() => navigateTo('lavorazioni', 'mimesi_filter_pref', 'completati')}
          className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm cursor-pointer hover:border-green-300 group"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-colors">
              <CheckCircle size={24} />
            </div>
          </div>
          <h3 className="text-4xl font-bold text-neutral-800 mb-1">{stats.completed}</h3>
          <p className="text-sm text-neutral-500 font-medium">Archiviate</p>
        </motion.div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLONNA SX: OPERATIVITÀ (2/3) */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* TABELLA LAVORAZIONI RECENTI */}
            <Card className="!p-0 overflow-hidden">
                <div className="p-6 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
                    <h3 className="font-bold text-lg text-neutral-800">Flusso di Lavoro Recente</h3>
                    <button onClick={() => navigateTo('lavorazioni', 'mimesi_filter_pref', 'tutti')} className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
                        Gestisci tutte <ChevronRight size={16} />
                    </button>
                </div>
                <div className="p-4">
                    {recentJobs.length > 0 ? (
                        <div className="space-y-3">
                            {recentJobs.map((job) => (
                                <div key={job.id} 
                                     className="flex items-center justify-between p-4 hover:bg-neutral-50 rounded-xl border border-transparent hover:border-neutral-100 transition-all cursor-pointer group" 
                                     onClick={() => navigateTo('lavorazioni', 'mimesi_filter_pref', 'tutti')}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs
                                            ${job.stato === 'working' ? 'bg-primary/10 text-primary' : 
                                              job.stato === 'pending' ? 'bg-orange-100 text-orange-600' : 
                                              job.stato === 'in_evaluation' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                                            {job.paziente ? job.paziente.charAt(0) : '?'}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-neutral-800 text-sm group-hover:text-primary transition-colors">{job.paziente}</h4>
                                            <div className="flex items-center gap-2 text-xs text-neutral-400">
                                                <span className="font-mono bg-neutral-100 px-1 rounded">{job.id}</span>
                                                <span>• {job.tipo}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <span className="text-xs font-mono text-neutral-400 hidden md:block">{job.data}</span>
                                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border
                                            ${job.stato === 'working' ? 'bg-white border-primary text-primary' : 
                                              job.stato === 'pending' ? 'bg-white border-orange-200 text-orange-600' : 
                                              job.stato === 'in_evaluation' ? 'bg-white border-blue-200 text-blue-600' : 
                                              'bg-neutral-100 border-neutral-200 text-neutral-500'}`}>
                                            {job.statusLabel || job.stato}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 text-neutral-400">
                            <p>Nessuna lavorazione recente</p>
                        </div>
                    )}
                </div>
            </Card>

            {/* WIDGET MAGAZZINO */}
            <div className="grid grid-cols-2 gap-6">
                <Card>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                            <Package size={20} className="text-indigo-600" />
                        </div>
                        <h4 className="font-bold text-neutral-800">Magazzino Rapido</h4>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm items-center">
                            <span className="text-neutral-600">Zirconio (Dischi)</span>
                            <div className="flex items-center gap-2">
                                <div className="w-20 h-2 bg-neutral-100 rounded-full overflow-hidden"><div className="h-full bg-green-500 w-[80%]"></div></div>
                                <span className="font-bold text-neutral-800">23</span>
                            </div>
                        </div>
                        <div className="flex justify-between text-sm items-center">
                            <span className="text-neutral-600">PMMA</span>
                            <div className="flex items-center gap-2">
                                <div className="w-20 h-2 bg-neutral-100 rounded-full overflow-hidden"><div className="h-full bg-red-500 w-[15%]"></div></div>
                                <span className="font-bold text-red-600">4 ⚠️</span>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                            <Users size={20} className="text-teal-600" />
                        </div>
                        <h4 className="font-bold text-neutral-800">Turni Operatori</h4>
                    </div>
                    <div className="space-y-2">
                        {['Marco (CAD)', 'Lucia (Ceramica)', 'Paolo (Fresatura)'].map((op, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-neutral-700">{op}</span>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>

        {/* COLONNA DX: MESSAGGI (1/3) */}
        <div className="space-y-6">
            <Card className="!p-0 h-full flex flex-col">
                <div className="p-6 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
                    <h3 className="font-bold text-lg text-neutral-800">Inbox Admin</h3>
                    <button onClick={() => setPage('inbox')} className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
                        Vedi tutti <ChevronRight size={16} />
                    </button>
                </div>
                
                <div className="flex-1 p-2">
                    {recentMessages.length > 0 ? (
                        <div className="space-y-1">
                            {recentMessages.map((msg) => (
                                <div 
                                    key={msg.id} 
                                    className="p-3 hover:bg-neutral-50 rounded-xl cursor-pointer transition-colors" 
                                    onClick={() => navigateTo('inbox', 'mimesi_msg_id', msg.id)}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className={`text-xs font-bold ${!msg.read ? 'text-primary' : 'text-neutral-600'}`}>
                                            {msg.from}
                                        </span>
                                        <span className="text-[10px] text-neutral-400">{new Date(msg.date).toLocaleDateString()}</span>
                                    </div>
                                    <p className={`text-xs mb-1 truncate ${!msg.read ? 'font-bold text-neutral-800' : 'text-neutral-500'}`}>
                                        {msg.subject}
                                    </p>
                                    
                                    <div className="flex gap-2 mt-2">
                                        <span className={`text-[9px] px-1.5 py-0.5 rounded border uppercase font-bold tracking-wider
                                            ${msg.type === 'request' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                                              'bg-neutral-50 text-neutral-500 border-neutral-100'}`}>
                                            {msg.type === 'request' ? 'Richiesta' : 'Notifica'}
                                        </span>
                                        {!msg.read && <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1"></span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-neutral-400 flex flex-col items-center">
                            <Mail size={32} className="mb-2 opacity-20"/>
                            <p className="text-xs">Nessun messaggio</p>
                        </div>
                    )}
                </div>
            </Card>
        </div>

      </div>
    </div>
  );
}