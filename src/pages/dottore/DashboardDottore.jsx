import { useState, useEffect } from 'react';
import { ChevronRight, MessageSquare, Plus, Activity, FileSignature, Clock } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import useAuthStore from '../../store/authStore';
import StatusWorkWidget, { COLOR_PRESETS } from '../../components/ui/StatusWorkWidget';

export default function DashboardDottore({ setPage }) {
  const user = useAuthStore((state) => state.user);
  
  // Stati per le statistiche
  const [stats, setStats] = useState({
    working: 0,
    pending: 0,
    evaluation: 0
  });
  const [recentJobs, setRecentJobs] = useState([]);
  const [recentMessages, setRecentMessages] = useState([]);

  useEffect(() => {
    const loadData = () => {
      // 1. Carica Lavorazioni
      const allJobs = JSON.parse(localStorage.getItem('mimesi_all_lavorazioni') || '[]');
      
      // Filtra le lavorazioni del dottore corrente
      const myJobs = allJobs.filter(j => {
        const doctorField = j.dottore || '';
        // Controlla vari formati possibili del nome dottore
        return doctorField === `Dr. ${user?.nome} ${user?.cognome}` || 
               doctorField === user?.name ||
               (user?.nome && user?.cognome && doctorField.includes(`${user.nome} ${user.cognome}`));
      });

      // Calcola le statistiche
      setStats({
        working: myJobs.filter(j => j.stato === 'working').length,
        pending: myJobs.filter(j => j.stato === 'pending').length,
        evaluation: myJobs.filter(j => j.stato === 'in_evaluation').length
      });

      // Prendi i 3 lavori più recenti
      setRecentJobs(myJobs.sort((a, b) => new Date(b.data) - new Date(a.data)).slice(0, 3));

      // 2. Carica Messaggi Inbox
      const inbox = JSON.parse(localStorage.getItem('mimesi_doctor_inbox') || '[]');
      setRecentMessages(inbox.slice(0, 4));
    };

    // Carica subito i dati
    loadData();
    
    // Polling ogni 2 secondi per aggiornare automaticamente
    const interval = setInterval(loadData, 2000);
    
    return () => clearInterval(interval);
  }, [user?.nome, user?.cognome, user?.name]);

  const navigateTo = (page, paramKey, paramValue) => {
      if (paramKey && paramValue) {
          sessionStorage.setItem(paramKey, paramValue);
      }
      setPage(page);
  };

  const handleNewPrescription = () => {
    sessionStorage.setItem('mimesi_open_wizard', 'true');
    setPage('lavorazioni');
  };

  return (
    <div className="p-8 max-w-[1400px] mx-auto min-h-screen space-y-8">
      
      {/* HEADER DI BENVENUTO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-800">Bentornato, Dr. {user?.cognome}</h1>
          <p className="text-neutral-500 mt-1">Ecco il riepilogo delle attività del tuo studio.</p>
        </div>
        
        <div className="shrink-0">
          <Button onClick={handleNewPrescription} className="shadow-lg shadow-primary/30">
             <Plus size={20} className="mr-2" /> Nuova Prescrizione
          </Button>
        </div>
      </div>

      {/* STATISTICHE CON STATUS WORK WIDGET */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* CARD 1: IN LAVORAZIONE */}
        <StatusWorkWidget
          count={stats.working}
          icon={Activity}
          label="Lavorazioni in corso"
          colorClasses={COLOR_PRESETS.primary}
          badge="active"
          onClick={() => navigateTo('lavorazioni', 'mimesi_filter_pref', 'attivi')}
        />

        {/* CARD 2: DA FIRMARE */}
        <StatusWorkWidget
          count={stats.pending}
          icon={FileSignature}
          label="Preventivi da firmare"
          colorClasses={COLOR_PRESETS.orange}
          badge="action"
          onClick={() => navigateTo('lavorazioni', 'mimesi_filter_pref', 'da_firmare')}
        />

        {/* CARD 3: IN VALUTAZIONE */}
        <StatusWorkWidget
          count={stats.evaluation}
          icon={Clock}
          label="In Valutazione Tecnica"
          colorClasses={COLOR_PRESETS.blue}
          badge="In attesa"
          onClick={() => navigateTo('lavorazioni', 'mimesi_filter_pref', 'in_valutazione')}
        />

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLONNA SX: LAVORAZIONI RECENTI */}
        <div className="lg:col-span-2 space-y-6">
            <Card className="!p-0 overflow-hidden">
                <div className="p-6 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
                    <h3 className="font-bold text-lg text-neutral-800">Lavorazioni Recenti</h3>
                    <button onClick={() => navigateTo('lavorazioni', 'mimesi_filter_pref', 'tutti')} className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
                        Vedi tutti <ChevronRight size={16} />
                    </button>
                </div>
                <div className="p-4">
                    {recentJobs.length > 0 ? (
                        <div className="space-y-3">
                            {recentJobs.map((job) => (
                                <div 
                                    key={job.id} 
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

        {/* COLONNA DX: MESSAGGI & NOTIFICHE */}
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
            </Card>
        </div>

      </div>
    </div>
  );
}