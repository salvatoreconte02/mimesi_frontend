import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, FileText, CheckCircle, 
  Clock, AlertCircle, ChevronRight, Calendar, Plus 
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import useAuthStore from '../../store/authStore';
import NewRequestWizard from '../../components/wizard/NewRequestWizard';

export default function LavorazioniDottore() {
  const user = useAuthStore(state => state.user);
  const [filter, setFilter] = useState('tutti');
  const [search, setSearch] = useState('');
  const [lavorazioni, setLavorazioni] = useState([]);
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  // Carica lavorazioni dal localStorage filtrando per il dottore loggato
  useEffect(() => {
    const loadData = () => {
      const stored = localStorage.getItem('mimesi_all_lavorazioni');
      if (stored) {
        const all = JSON.parse(stored);
        // Filtra solo le lavorazioni di questo dottore
        const mine = all.filter(lav => 
          lav.dottore === `${user?.nome} ${user?.cognome}` ||
          lav.dottore === user?.name
        );
        // Ordina per data decrescente (più recenti in alto)
        mine.sort((a, b) => new Date(b.data) - new Date(a.data));
        setLavorazioni(mine);
      }
    };

    loadData();
    // Aggiorna ogni 2 secondi per vedere cambiamenti di stato
    const interval = setInterval(loadData, 2000);
    return () => clearInterval(interval);
  }, [user]);

  // Gestione SUBMIT NUOVA RICHIESTA
  const handleNewRequestSubmit = (data) => {
    const existingJobs = JSON.parse(localStorage.getItem('mimesi_all_lavorazioni') || '[]');
    
    // 1. Crea il nuovo Job in stato "In Valutazione"
    const newJob = { 
        id: data.id,
        paziente: `${data.cognome} ${data.nome}`,
        tipo: data.elements.length > 0 
          ? `${data.elements.length} Elementi in ${data.technicalInfo.material}`
          : 'Nuova Richiesta',
        dottore: `${data.nomeDottore} ${data.cognomeDottore}`,
        data: new Date().toLocaleDateString(),
        stato: 'in_evaluation', // NUOVO STATO
        statusLabel: 'In Valutazione',
        progress: 10,
        fullData: data // Salviamo tutto l'oggetto dati per ripopolare il wizard
    };

    const updatedJobs = [newJob, ...existingJobs];
    localStorage.setItem('mimesi_all_lavorazioni', JSON.stringify(updatedJobs));

    // 2. Notifica RIEPILOGO al Dottore (nella sua Inbox)
    const doctorInbox = JSON.parse(localStorage.getItem('mimesi_doctor_inbox') || '[]');
    const summaryMsg = {
        id: Date.now(),
        from: 'Mimesi Lab System', // Mittente Sistema
        subject: `Riepilogo Richiesta: ${data.cognome} ${data.nome}`,
        preview: 'La tua richiesta è stata presa in carico ed è in fase di valutazione tecnica.',
        date: new Date().toISOString(),
        read: false,
        unread: true,
        type: 'order_summary', // TIPO SPECIALE per renderizzare StepSummary
        fullData: data // Alleghiamo i dati per StepSummary
    };
    localStorage.setItem('mimesi_doctor_inbox', JSON.stringify([summaryMsg, ...doctorInbox]));

    // 3. Notifica all'ADMIN (nella sua Inbox)
    const adminInbox = JSON.parse(localStorage.getItem('mimesi_admin_inbox') || '[]');
    const adminMsg = {
        id: Date.now() + 1,
        from: `Dr. ${data.nomeDottore} ${data.cognomeDottore}`,
        subject: `Nuova Lavorazione: ${data.cognome}`,
        preview: 'Richiesta validazione tecnica e preventivo.',
        date: new Date().toISOString(),
        read: false,
        unread: true, // Importante per il badge
        type: 'request',
        fullData: data
    };
    localStorage.setItem('mimesi_admin_inbox', JSON.stringify([adminMsg, ...adminInbox]));

    // Aggiorna UI locale e chiudi wizard
    setLavorazioni(prev => [newJob, ...prev]);
    setIsWizardOpen(false);
    
    alert('Richiesta inviata con successo! Troverai il riepilogo nella tua Inbox.');
  };

  // Logica di filtro DOTTORE CON FIX CRASH
  const filteredList = lavorazioni.filter(item => {
    // FIX SICUREZZA
    const pazienteSafe = String(item.paziente || '').toLowerCase();
    const idSafe = String(item.id || '').toLowerCase();
    const searchLower = search.toLowerCase();

    const matchesSearch = pazienteSafe.includes(searchLower) || idSafe.includes(searchLower);
    
    if (filter === 'tutti') return matchesSearch;
    
    if (filter === 'in_valutazione') {
      return matchesSearch && item.stato === 'in_evaluation';
    }

    if (filter === 'da_firmare') {
      return matchesSearch && item.stato === 'pending'; // pending = attesa firma preventivo
    }
    
    if (filter === 'attivi') {
        return matchesSearch && item.stato === 'working';
    }
    
    if (filter === 'in_prova') {
      return matchesSearch && item.stato === 'warning';
    }
    
    if (filter === 'completati') return matchesSearch && item.stato === 'completed';
    
    return matchesSearch;
  });

  return (
    <div className="p-8 max-w-[1400px] mx-auto min-h-screen relative">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-800">Le Mie Lavorazioni</h1>
          <p className="text-neutral-500">Consulta lo storico e lo stato delle tue prescrizioni</p>
        </div>
        <Button onClick={() => setIsWizardOpen(true)}>
            <Plus size={20} className="mr-2" /> Nuova Prescrizione
        </Button>
      </div>

      {/* TOOLBAR */}
      <Card className="mb-8 !p-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
            <input 
              type="text" 
              placeholder="Cerca paziente o ID..." 
              className="w-full pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex p-1 bg-neutral-100 rounded-xl w-full md:w-auto overflow-x-auto custom-scrollbar">
            {[
              { id: 'tutti', label: 'Tutti' },
              { id: 'in_valutazione', label: 'In Valutazione' },
              { id: 'da_firmare', label: 'Da Firmare' },
              { id: 'attivi', label: 'In Lavorazione' },
              { id: 'in_prova', label: 'In Prova' },
              { id: 'completati', label: 'Completati' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  filter === f.id ? 'bg-white text-primary shadow-sm' : 'text-neutral-500 hover:text-neutral-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* LISTA LAVORAZIONI */}
      <div className="space-y-3">
        {filteredList.length > 0 ? (
          filteredList.map((item, index) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="group bg-white rounded-xl p-4 border border-neutral-100 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer flex flex-col md:flex-row items-center gap-4">
                
                {/* Icona Stato */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  item.stato === 'completed' ? 'bg-success/10 text-success' :
                  item.stato === 'warning' ? 'bg-warning/10 text-warning' :
                  item.stato === 'pending' ? 'bg-orange-100 text-orange-500' :
                  item.stato === 'in_evaluation' ? 'bg-blue-100 text-blue-500' :
                  'bg-primary/10 text-primary'
                }`}>
                  {item.stato === 'completed' ? <CheckCircle size={20} /> : 
                   item.stato === 'warning' ? <AlertCircle size={20} /> : 
                   item.stato === 'pending' ? <FileText size={20} /> : 
                   item.stato === 'in_evaluation' ? <Clock size={20} /> :
                   <Clock size={20} />}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 text-center md:text-left">
                  <h4 className="font-bold text-neutral-800">{item.paziente}</h4>
                  <div className="flex items-center justify-center md:justify-start gap-2 text-xs text-neutral-500">
                    <span className="font-mono bg-neutral-50 px-1.5 py-0.5 rounded border">{item.id}</span>
                    <span>• {item.tipo}</span>
                  </div>
                </div>

                {/* Data */}
                <div className="text-sm text-neutral-500 flex items-center gap-1 shrink-0">
                  <Calendar size={14} /> {item.data}
                </div>

                {/* Stato / Progresso */}
                <div className="w-full md:w-36 shrink-0 flex justify-end">
                  {item.stato === 'completed' ? (
                     <span className="inline-block px-3 py-1 bg-success/10 text-success text-xs font-bold rounded-full">
                       Completato
                     </span>
                  ) : item.stato === 'warning' ? (
                     <span className="inline-block px-3 py-1 bg-warning text-white text-xs font-bold rounded-full shadow-sm animate-pulse">
                       {item.statusLabel}
                     </span>
                  ) : item.stato === 'pending' ? (
                     <span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full border border-orange-200">
                       Attesa Firma
                     </span>
                  ) : item.stato === 'in_evaluation' ? (
                     <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-200">
                       In Valutazione
                     </span>
                  ) : (
                    // Barra Percentuale per Working
                    <div className="flex flex-col items-end w-full">
                       <span className="text-[10px] font-bold text-primary mb-1">{item.progress}%</span>
                       <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${item.progress < 20 ? 'bg-neutral-400' : 'bg-primary'}`} 
                            style={{ width: `${item.progress}%` }} 
                          />
                       </div>
                    </div>
                  )}
                </div>

                <ChevronRight className="text-neutral-300 group-hover:text-primary transition-colors" size={20} />
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-12 text-neutral-400">
            <FileText className="mx-auto mb-2 opacity-20" size={48} />
            <p>Nessuna lavorazione trovata.</p>
          </div>
        )}
      </div>

      {/* MODALE WIZARD */}
      <AnimatePresence>
        {isWizardOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          >
             <motion.div 
               initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
               className="bg-white rounded-3xl w-full max-w-5xl my-8 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
             >
                <div className="p-6 border-b border-neutral-100 flex justify-between items-center bg-neutral-50 sticky top-0 z-10">
                   <h2 className="text-xl font-bold text-neutral-800">Nuova Prescrizione</h2>
                   <button onClick={() => setIsWizardOpen(false)} className="p-2 hover:bg-neutral-200 rounded-full text-neutral-500">✕</button>
                </div>
                <div className="p-8 overflow-y-auto custom-scrollbar">
                   <NewRequestWizard 
                      onCancel={() => setIsWizardOpen(false)}
                      onSubmit={handleNewRequestSubmit}
                   />
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}