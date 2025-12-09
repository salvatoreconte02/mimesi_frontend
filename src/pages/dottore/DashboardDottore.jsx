import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, FileSignature, Clock, ChevronRight, 
  Calendar, ArrowUpRight, MessageSquare 
} from 'lucide-react';
import Card from '../../components/ui/Card';
import useAuthStore from '../../store/authStore';

export default function DashboardDottore({ setPage }) {
  const user = useAuthStore((state) => state.user);
  
  const [stats, setStats] = useState({
    working: 0,
    pending: 0,
    evaluation: 0
  });
  const [recentJobs, setRecentJobs] = useState([]);
  const [recentMessages, setRecentMessages] = useState([]);

  useEffect(() => {
    // 1. Carica Lavorazioni
    const allJobs = JSON.parse(localStorage.getItem('mimesi_all_lavorazioni') || '[]');
    const myJobs = allJobs.filter(j => 
        j.dottore === `${user?.nome} ${user?.cognome}` || j.dottore === user?.name
    );

    setStats({
      working: myJobs.filter(j => j.stato === 'working').length,
      pending: myJobs.filter(j => j.stato === 'pending').length,
      evaluation: myJobs.filter(j => j.stato === 'in_evaluation').length
    });

    // Prendi i primi 3 lavori più recenti
    setRecentJobs(myJobs.sort((a, b) => new Date(b.data) - new Date(a.data)).slice(0, 3));

    // 2. Carica Messaggi Inbox
    const inbox = JSON.parse(localStorage.getItem('mimesi_doctor_inbox') || '[]');
    setRecentMessages(inbox.slice(0, 4)); // Mostra ultimi 4

  }, [user]);

  return (
    <div className="p-8 max-w-[1400px] mx-auto min-h-screen space-y-8">
      
      {/* HEADER DI BENVENUTO */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-neutral-800">Bentornato, Dr. {user?.cognome}</h1>
          <p className="text-neutral-500 mt-1">Ecco il riepilogo delle attività del tuo studio.</p>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-sm font-bold text-primary">{new Date().toLocaleDateString('it-IT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p className="text-xs text-neutral-400">Ultimo accesso: Oggi, 09:30</p>
        </div>
      </div>

      {/* STATISTICHE (LINK FUNZIONANTI) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* CARD 1: IN LAVORAZIONE */}
        <motion.div 
          whileHover={{ y: -5 }}
          onClick={() => setPage('lavorazioni')}
          className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm cursor-pointer hover:border-primary/30 group"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
              <Activity size={24} />
            </div>
            <span className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
               Attive
            </span>
          </div>
          <h3 className="text-4xl font-bold text-neutral-800 mb-1">{stats.working}</h3>
          <p className="text-sm text-neutral-500 font-medium">Lavorazioni in corso</p>
        </motion.div>

        {/* CARD 2: DA FIRMARE */}
        <motion.div 
          whileHover={{ y: -5 }}
          onClick={() => setPage('lavorazioni')}
          className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm cursor-pointer hover:border-orange-300 group"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-colors">
              <FileSignature size={24} />
            </div>
            {stats.pending > 0 && (
                <span className="flex items-center text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-full animate-pulse">
                Richiede Azione
                </span>
            )}
          </div>
          <h3 className="text-4xl font-bold text-neutral-800 mb-1">{stats.pending}</h3>
          <p className="text-sm text-neutral-500 font-medium">Preventivi da firmare</p>
        </motion.div>

        {/* CARD 3: IN VALUTAZIONE */}
        <motion.div 
          whileHover={{ y: -5 }}
          onClick={() => setPage('lavorazioni')}
          className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm cursor-pointer hover:border-blue-300 group"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Clock size={24} />
            </div>
            <span className="flex items-center text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
               In attesa
            </span>
          </div>
          <h3 className="text-4xl font-bold text-neutral-800 mb-1">{stats.evaluation}</h3>
          <p className="text-sm text-neutral-500 font-medium">In Valutazione Tecnica</p>
        </motion.div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLONNA SX: LAVORAZIONI RECENTI (Occupazione 2/3) */}
        <div className="lg:col-span-2 space-y-6">
            <Card className="!p-0 overflow-hidden">
                <div className="p-6 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
                    <h3 className="font-bold text-lg text-neutral-800">Lavorazioni Recenti</h3>
                    <button onClick={() => setPage('lavorazioni')} className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
                        Vedi tutti <ChevronRight size={16} />
                    </button>
                </div>
                <div className="p-4">
                    {recentJobs.length > 0 ? (
                        <div className="space-y-3">
                            {recentJobs.map((job) => (
                                <div key={job.id} className="flex items-center justify-between p-4 hover:bg-neutral-50 rounded-xl border border-transparent hover:border-neutral-100 transition-all cursor-pointer group" onClick={() => setPage('lavorazioni')}>
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs
                                            ${job.stato === 'working' ? 'bg-primary/10 text-primary' : 
                                              job.stato === 'pending' ? 'bg-orange-100 text-orange-600' : 
                                              job.stato === 'in_evaluation' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                                            {job.paziente.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-neutral-800 text-sm group-hover:text-primary transition-colors">{job.paziente}</h4>
                                            <p className="text-xs text-neutral-400">{job.tipo}</p>
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
        </div>

        {/* COLONNA DX: MESSAGGI & NOTIFICHE (Occupazione 1/3) */}
        <div className="space-y-6">
            <Card className="!p-0 h-full flex flex-col">
                <div className="p-6 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
                    <h3 className="font-bold text-lg text-neutral-800">Inbox</h3>
                    <button onClick={() => setPage('inbox')} className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
                        Vedi tutti <ChevronRight size={16} />
                    </button>
                </div>
                
                <div className="flex-1 p-2">
                    {recentMessages.length > 0 ? (
                        <div className="space-y-1">
                            {recentMessages.map((msg) => (
                                <div key={msg.id} className="p-3 hover:bg-neutral-50 rounded-xl cursor-pointer transition-colors" onClick={() => setPage('inbox')}>
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
                                        {/* LOGICA BADGE: Se è order_summary mostra "Riepilogo" */}
                                        <span className={`text-[9px] px-1.5 py-0.5 rounded border uppercase font-bold tracking-wider
                                            ${msg.type === 'request_signature' ? 'bg-orange-50 text-orange-600 border-orange-100' : 
                                              msg.type === 'order_summary' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                                              'bg-neutral-50 text-neutral-500 border-neutral-100'}`}>
                                            {msg.type === 'request_signature' ? 'Firma' : 
                                             msg.type === 'order_summary' ? 'Riepilogo' : 'Info'}
                                        </span>
                                        {!msg.read && <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1"></span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-neutral-400 flex flex-col items-center">
                            <MessageSquare size={32} className="mb-2 opacity-20"/>
                            <p className="text-xs">Nessun messaggio</p>
                        </div>
                    )}
                </div>
                {/* Rimosso pulsante "Vai alla inbox" come richiesto */}
            </Card>
        </div>

      </div>
    </div>
  );
}