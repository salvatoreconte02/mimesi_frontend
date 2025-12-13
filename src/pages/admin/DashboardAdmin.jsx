import { useState, useEffect } from 'react';
import { 
  Activity, Clock, AlertCircle, 
  ChevronRight, Mail, CheckCircle, Plus 
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import useAuthStore from '../../store/authStore';
import StatusWorkWidget, { COLOR_PRESETS } from '../../components/ui/StatusWorkWidget';
import PlanningWidget from '../../components/widgets/PlanningWidget';

export default function DashboardAdmin({ setPage }) {
  const user = useAuthStore((state) => state.user);
  
  const [stats, setStats] = useState({ pending: 0, working: 0, warning: 0, completed: 0 });
  const [recentJobs, setRecentJobs] = useState([]);
  const [recentMessages, setRecentMessages] = useState([]);

  useEffect(() => {
    const loadData = () => {
      const allJobs = JSON.parse(localStorage.getItem('mimesi_all_lavorazioni') || '[]');
      setStats({
        pending: allJobs.filter(j => j.stato === 'in_evaluation' || j.stato === 'pending').length,
        working: allJobs.filter(j => j.stato === 'working').length,
        warning: allJobs.filter(j => j.stato === 'warning').length,
        completed: allJobs.filter(j => j.stato === 'completed').length
      });
      setRecentJobs(allJobs.sort((a, b) => new Date(b.data) - new Date(a.data)).slice(0, 3));
      const inbox = JSON.parse(localStorage.getItem('mimesi_admin_inbox') || '[]');
      setRecentMessages(inbox.slice(0, 3)); 
    };
    loadData();
    const interval = setInterval(loadData, 2000);
    return () => clearInterval(interval);
  }, []);

  const navigateTo = (page, paramKey, paramValue) => {
      if (paramKey && paramValue) sessionStorage.setItem(paramKey, paramValue);
      setPage(page);
  };

  const handleNewJob = () => {
      // Imposta il flag per aprire direttamente il wizard nella pagina Lavorazioni
      sessionStorage.setItem('mimesi_admin_new_job', 'true');
      setPage('lavorazioni');
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto min-h-screen space-y-6 bg-neutral-50">
      
      {/* HEADER MODIFICATO: Stile identico a DashboardDottore */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-800">Admin Console</h1>
          <p className="text-neutral-500 mt-1">Panoramica operativa del laboratorio Mimesi.</p>
        </div>
        
        <div className="shrink-0">
          <Button onClick={handleNewJob} className="shadow-lg shadow-primary/30">
             <Plus size={20} className="mr-2" /> Nuova Lavorazione
          </Button>
        </div>
      </div>

      {/* MAIN SECTION */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-[420px]">
        
        {/* COLONNA SINISTRA: WIDGET PLANNING (2/3 Spazio) */}
        <div className="xl:col-span-2 h-full overflow-hidden">
            <PlanningWidget onNavigate={() => setPage('planning')} />
        </div>

        {/* COLONNA DESTRA: STATISTICHE 2x2 (1/3 Spazio) */}
        <div className="xl:col-span-1 h-full">
            <div className="grid grid-cols-2 gap-4 h-full">
                <StatusWorkWidget
                    count={stats.pending}
                    icon={AlertCircle}
                    label="Da Valutare"
                    colorClasses={COLOR_PRESETS.blue}
                    badge="action"
                    onClick={() => navigateTo('lavorazioni', 'mimesi_filter_pref', 'da_valutare')}
                />
                <StatusWorkWidget
                    count={stats.working}
                    icon={Activity}
                    label="In Produzione"
                    colorClasses={COLOR_PRESETS.primary}
                    onClick={() => navigateTo('lavorazioni', 'mimesi_filter_pref', 'attivi')}
                />
                <StatusWorkWidget
                    count={stats.warning}
                    icon={Clock}
                    label="In Prova / Attesa"
                    colorClasses={COLOR_PRESETS.orange}
                    onClick={() => navigateTo('lavorazioni', 'mimesi_filter_pref', 'in_prova')}
                />
                <StatusWorkWidget
                    count={stats.completed}
                    icon={CheckCircle}
                    label="Archiviate"
                    colorClasses={COLOR_PRESETS.success}
                    onClick={() => navigateTo('lavorazioni', 'mimesi_filter_pref', 'completati')}
                />
            </div>
        </div>
      </div>

      {/* BOTTOM SECTION: RECENTI + INBOX */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* LAVORAZIONI RECENTI */}
        <Card className="!p-0 overflow-hidden h-full">
          <div className="px-5 py-4 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
            <h3 className="font-bold text-neutral-800">Lavorazioni Recenti</h3>
            <button onClick={() => navigateTo('lavorazioni', 'mimesi_filter_pref', 'tutti')} className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
              Tutte <ChevronRight size={16} />
            </button>
          </div>
          <div className="p-3">
            {recentJobs.length > 0 ? (
              <div className="space-y-2">
                {recentJobs.map((job) => (
                  <div key={job.id} onClick={() => navigateTo('lavorazioni', 'mimesi_filter_pref', 'tutti')} className="flex items-center justify-between p-3 hover:bg-neutral-50 rounded-lg border border-transparent hover:border-neutral-100 transition-all cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${job.stato === 'working' ? 'bg-primary/10 text-primary' : 'bg-neutral-100 text-neutral-600'}`}>
                        {job.paziente ? job.paziente.charAt(0) : '?'}
                      </div>
                      <div>
                        <h4 className="font-bold text-neutral-800 text-sm group-hover:text-primary transition-colors">{job.paziente}</h4>
                        <div className="flex items-center gap-2 text-[10px] text-neutral-400">
                          <span className="font-mono">{job.id}</span><span>•</span><span>{job.tipo}</span>
                        </div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase border bg-neutral-100 border-neutral-200 text-neutral-500">{job.statusLabel || job.stato}</span>
                  </div>
                ))}
              </div>
            ) : <div className="text-center py-8 text-neutral-400 text-sm">Nessuna lavorazione recente</div>}
          </div>
        </Card>

        {/* INBOX */}
        <Card className="!p-0 overflow-hidden h-full">
          <div className="px-5 py-4 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
            <h3 className="font-bold text-neutral-800">Inbox Admin</h3>
            <button onClick={() => setPage('inbox')} className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
              Tutti <ChevronRight size={16} />
            </button>
          </div>
          <div className="p-3">
            {recentMessages.length > 0 ? (
              <div className="space-y-2">
                {recentMessages.map((msg) => (
                  <div key={msg.id} onClick={() => navigateTo('inbox', 'mimesi_msg_id', msg.id)} className="p-3 hover:bg-neutral-50 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-neutral-100">
                    <div className="flex justify-between items-start mb-1">
                      <span className={`text-xs font-bold ${!msg.read ? 'text-primary' : 'text-neutral-600'}`}>{msg.from}</span>
                      <span className="text-[10px] text-neutral-400">{new Date(msg.date).toLocaleDateString()}</span>
                    </div>
                    <p className={`text-xs truncate ${!msg.read ? 'font-bold text-neutral-800' : 'text-neutral-500'}`}>{msg.subject}</p>
                  </div>
                ))}
              </div>
            ) : <div className="text-center py-8 text-neutral-400 flex flex-col items-center"><Mail size={24} className="mb-2 opacity-20"/><p className="text-sm">Nessun messaggio</p></div>}
          </div>
        </Card>

      </div>
    </div>
  );
}