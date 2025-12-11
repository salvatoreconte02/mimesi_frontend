import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, FileText, CheckCircle, 
  Clock, AlertCircle, ChevronRight, Calendar, Plus, ArrowLeft, XCircle
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import useAuthStore from '../../store/authStore';
import WizardRequestDoctor from '../../components/wizard/WizardRequestDoctor';

export default function LavorazioniDottore() {
  const user = useAuthStore(state => state.user);
  const [filter, setFilter] = useState('tutti');
  const [search, setSearch] = useState('');
  const [lavorazioni, setLavorazioni] = useState([]);
  
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  // Carica lavorazioni - STESSA LOGICA DI ADMIN
  useEffect(() => {
    const loadData = () => {
      const stored = localStorage.getItem('mimesi_all_lavorazioni');
      const allJobs = stored ? JSON.parse(stored) : [];
      
      // Per ora carichiamo TUTTE le lavorazioni come fa Admin
      // In produzione filtrare per dottore
      setLavorazioni(allJobs);

      // CONTROLLO FILTRO DALLA DASHBOARD
      const preferredFilter = sessionStorage.getItem('mimesi_filter_pref');
      if (preferredFilter) {
          setFilter(preferredFilter === 'completati' ? 'archiviate' : preferredFilter);
          sessionStorage.removeItem('mimesi_filter_pref');
      }

      const shouldOpenWizard = sessionStorage.getItem('mimesi_open_wizard');
      if (shouldOpenWizard) {
          setIsWizardOpen(true);
          sessionStorage.removeItem('mimesi_open_wizard');
      }
    };
    loadData();
    const interval = setInterval(loadData, 2000);
    return () => clearInterval(interval);
  }, [user]);

  // Submit Wizard
  const handleNewRequestSubmit = (data) => {
    const existingJobs = JSON.parse(localStorage.getItem('mimesi_all_lavorazioni') || '[]');
    
    const newJob = { 
        id: data.id,
        paziente: `${data.cognome} ${data.nome}`,
        tipo: data.elements.length > 0 
          ? `${data.elements.length} Elementi in ${data.technicalInfo.material}`
          : 'Nuova Richiesta',
        dottore: `Dr. ${data.nomeDottore} ${data.cognomeDottore}`,
        data: new Date().toLocaleDateString(),
        stato: 'in_evaluation',
        statusLabel: 'In Valutazione',
        progress: 0,
        fullData: data 
    };

    const updatedJobs = [newJob, ...existingJobs];
    localStorage.setItem('mimesi_all_lavorazioni', JSON.stringify(updatedJobs));

    // Notifiche
    const doctorInbox = JSON.parse(localStorage.getItem('mimesi_doctor_inbox') || '[]');
    doctorInbox.unshift({
        id: Date.now(),
        from: 'Mimesi Lab System',
        subject: `Riepilogo Richiesta: ${data.cognome} ${data.nome}`,
        preview: `Gentile Dr. ${data.cognomeDottore}, confermiamo la ricezione della Sua prescrizione per il paziente ${data.cognome} ${data.nome} (Rif. ${data.id}). La richiesta è ora in fase di valutazione tecnica presso il nostro laboratorio. Riceverà notifica non appena l'esito sarà disponibile.`,
        date: new Date().toISOString(),
        read: false,
        unread: true,
        type: 'order_summary',
        fullData: data
    });
    localStorage.setItem('mimesi_doctor_inbox', JSON.stringify(doctorInbox));

    const adminInbox = JSON.parse(localStorage.getItem('mimesi_admin_inbox') || '[]');
    adminInbox.unshift({
        id: Date.now() + 1,
        from: `Dr. ${data.nomeDottore} ${data.cognomeDottore}`,
        subject: `Nuova Prescrizione: ${data.cognome} ${data.nome}`,
        preview: `Nuova richiesta di lavorazione ricevuta. Paziente: ${data.cognome} ${data.nome}. Tipologia: ${data.elements?.length || 0} elemento/i in ${data.technicalInfo?.material || 'N/D'}. Studio: ${data.nomeStudio || 'N/D'}. In attesa di validazione tecnica e preventivo.`,
        date: new Date().toISOString(),
        read: false,
        unread: true,
        type: 'request',
        fullData: data
    });
    localStorage.setItem('mimesi_admin_inbox', JSON.stringify(adminInbox));

    setLavorazioni(updatedJobs);
    setIsWizardOpen(false);
    alert('Richiesta inviata con successo!\n\nTroverai il riepilogo nella tua Inbox.');
  };

  // FILTRO - STESSA LOGICA DI ADMIN
  const filteredList = lavorazioni.filter(item => {
    const pazienteSafe = String(item.paziente || '').toLowerCase();
    const idSafe = String(item.id || '').toLowerCase();
    const dottoreSafe = String(item.dottore || '').toLowerCase();
    const searchLower = search.toLowerCase();

    const matchesSearch = 
      pazienteSafe.includes(searchLower) || 
      idSafe.includes(searchLower) ||
      dottoreSafe.includes(searchLower);
    
    if (filter === 'tutti') return matchesSearch;
    if (filter === 'in_valutazione') return matchesSearch && item.stato === 'in_evaluation';
    if (filter === 'da_firmare') return matchesSearch && item.stato === 'pending';
    if (filter === 'attivi') return matchesSearch && item.stato === 'working';
    if (filter === 'in_prova') return matchesSearch && item.stato === 'warning';
    
    // FILTRO ARCHIVIATE - STESSO DI ADMIN
    if (filter === 'archiviate') return matchesSearch && (item.stato === 'completed' || item.stato === 'rejected');
    
    return matchesSearch;
  });

  if (isWizardOpen) {
    return (
      <div className="p-8 max-w-[1400px] mx-auto min-h-screen">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
             <div className="flex items-center gap-4 mb-6">
                <button 
                    onClick={() => setIsWizardOpen(false)}
                    className="p-2 bg-white border border-neutral-200 rounded-xl hover:bg-neutral-50 text-neutral-500 transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-neutral-800">Nuova Prescrizione</h1>
                    <p className="text-neutral-500 text-sm">Compila i dati per inviare una nuova lavorazione</p>
                </div>
             </div>

             <div className="bg-white/50 rounded-3xl">
                <WizardRequestDoctor 
                    onCancel={() => setIsWizardOpen(false)}
                    onSubmit={handleNewRequestSubmit}
                />
             </div>
          </motion.div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[1400px] mx-auto min-h-screen relative">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
            <div>
                <h1 className="text-3xl font-bold text-neutral-800">Le Mie Lavorazioni</h1>
                <p className="text-neutral-500">Consulta lo storico e lo stato delle tue prescrizioni</p>
            </div>
            <Button onClick={() => setIsWizardOpen(true)}>
                <Plus size={20} className="mr-2" /> Nuova Prescrizione
            </Button>
        </div>

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
                    { id: 'archiviate', label: 'Archiviate' }
                ].map((f) => (
                <button key={f.id} onClick={() => setFilter(f.id)} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${filter === f.id ? 'bg-white text-primary shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}>
                    {f.label}
                </button>
                ))}
            </div>
            </div>
        </Card>

        <div className="space-y-3">
            {filteredList.length > 0 ? (
                filteredList.map((item, index) => (
                <motion.div 
                  key={item.id} 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: index * 0.05 }}
                >
                    <div className={`group bg-white rounded-xl p-4 border transition-all cursor-pointer flex flex-col md:flex-row items-center gap-4
                         ${item.stato === 'rejected' ? 'border-red-100 bg-red-50/10' : 
                           item.stato === 'in_evaluation' ? 'border-blue-200 shadow-md ring-1 ring-blue-100' :
                           'border-neutral-100 hover:border-primary/30 hover:shadow-md'}`}>
                        
                        {/* ICONA STATO - STESSA DI ADMIN */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                            item.stato === 'completed' ? 'bg-success/10 text-success' : 
                            item.stato === 'rejected' ? 'bg-red-100 text-red-500' :
                            item.stato === 'warning' ? 'bg-warning/10 text-warning' : 
                            item.stato === 'pending' ? 'bg-orange-100 text-orange-500' : 
                            item.stato === 'in_evaluation' ? 'bg-blue-100 text-blue-600 animate-pulse' : 
                            'bg-primary/10 text-primary'
                        }`}>
                            {item.stato === 'completed' ? <CheckCircle size={20} /> : 
                             item.stato === 'rejected' ? <XCircle size={20} /> :
                             item.stato === 'warning' ? <AlertCircle size={20} /> : 
                             item.stato === 'pending' ? <Clock size={20} /> : 
                             item.stato === 'in_evaluation' ? <Clock size={20} /> : 
                             <Clock size={20} />}
                        </div>
                        
                        {/* INFO LAVORAZIONE */}
                        <div className="flex-1 min-w-0 text-center md:text-left">
                            <h4 className="font-bold text-neutral-800">{item.paziente}</h4>
                            <div className="flex items-center justify-center md:justify-start gap-2 text-xs text-neutral-500 flex-wrap">
                                <span className="font-mono bg-neutral-50 px-1.5 py-0.5 rounded border">{item.id}</span>
                                <span>• {item.tipo}</span>
                                {item.dottore && <span>• {item.dottore}</span>}
                            </div>
                        </div>

                        {/* DATA */}
                        <div className="text-sm text-neutral-500 flex items-center gap-1 shrink-0">
                            <Calendar size={14} /> {item.data}
                        </div>
                        
                        {/* BADGE STATO - STESSA LOGICA DI ADMIN */}
                        <div className="w-full md:w-36 shrink-0 flex justify-end">
                            {item.stato === 'completed' ? (
                                <span className="inline-block px-3 py-1 bg-success/10 text-success text-xs font-bold rounded-full">
                                    Completato
                                </span>
                            ) : item.stato === 'rejected' ? (
                                <span className="inline-block px-3 py-1 bg-red-100 text-red-600 text-xs font-bold rounded-full border border-red-200">
                                    Rifiutata
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
                                <div className="flex flex-col items-end w-full">
                                    <span className="text-[10px] font-bold text-primary mb-1">{item.progress || 0}%</span>
                                    <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-primary" 
                                            style={{ width: `${item.progress || 0}%` }} 
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
    </div>
  );
}