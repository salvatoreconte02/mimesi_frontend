import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, FileText, CheckCircle, Clock, 
  AlertCircle, ChevronRight, Calendar, AlertTriangle, Plus, ArrowLeft, XCircle 
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button'; 
import WizardRequestAdmin from '../../components/wizard/WizardRequestAdmin'; 

export default function LavorazioniAdmin() {
  const [filter, setFilter] = useState('tutti');
  const [search, setSearch] = useState('');
  const [lavorazioni, setLavorazioni] = useState([]);
  
  const [editingJob, setEditingJob] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const loadData = () => {
      const stored = localStorage.getItem('mimesi_all_lavorazioni');
      const allJobs = stored ? JSON.parse(stored) : [];
      setLavorazioni(allJobs);

      const preferredFilter = sessionStorage.getItem('mimesi_filter_pref');
      if (preferredFilter) {
          setFilter(preferredFilter === 'completati' ? 'archiviate' : preferredFilter);
          sessionStorage.removeItem('mimesi_filter_pref');
      }

      const validateId = sessionStorage.getItem('mimesi_validate_id');
      if (validateId) {
          const jobToValidate = allJobs.find(j => String(j.id) === String(validateId));
          if (jobToValidate) {
              setEditingJob(jobToValidate.fullData || jobToValidate);
              setFilter('da_valutare');
          }
          sessionStorage.removeItem('mimesi_validate_id');
      }
    };
    loadData();
    const interval = setInterval(loadData, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateSubmit = (data) => {
    const existingJobs = JSON.parse(localStorage.getItem('mimesi_all_lavorazioni') || '[]');
    
    const newJob = { 
        id: data.id,
        paziente: `${data.cognome} ${data.nome}`,
        tipo: data.elements.length > 0 
          ? `${data.elements.length} Elementi in ${data.technicalInfo.material}`
          : 'Nuova Lavorazione Interna',
        dottore: data.nomeDottore ? `Dr. ${data.nomeDottore} ${data.cognomeDottore}` : 'Interno',
        data: new Date().toLocaleDateString(),
        stato: 'working',
        statusLabel: 'In Lavorazione',
        progress: 10,
        fullData: data 
    };

    const updatedJobs = [newJob, ...existingJobs];
    localStorage.setItem('mimesi_all_lavorazioni', JSON.stringify(updatedJobs));

    setLavorazioni(updatedJobs);
    setIsCreating(false);
    alert('Nuova lavorazione creata e avviata!');
  };

  const handleValidationSubmit = (updatedData) => {
    const jobs = JSON.parse(localStorage.getItem('mimesi_all_lavorazioni') || '[]');
    const doctorInbox = JSON.parse(localStorage.getItem('mimesi_doctor_inbox') || '[]');
    
    const updatedJobs = jobs.map(j => {
        if (j.id === updatedData.id) {
            let newStatus = j.stato;
            let statusLabel = j.statusLabel;

            if (updatedData.adminAction === 'approve_internal') {
                newStatus = 'working';
                statusLabel = 'In Lavorazione';
                
                doctorInbox.unshift({
                    id: Date.now(),
                    from: 'Mimesi Admin',
                    subject: `Lavorazione Avviata: ${updatedData.cognome} ${updatedData.nome}`,
                    preview: 'La tua richiesta è stata validata e messa in produzione internamente.',
                    date: new Date().toISOString(),
                    read: false,
                    unread: true,
                    type: 'info'
                });

            } else if (updatedData.adminAction === 'send_to_doctor') {
                newStatus = 'pending';
                statusLabel = 'Attesa Firma';

                doctorInbox.unshift({
                    id: Date.now(),
                    from: 'Mimesi Admin',
                    subject: `Richiesta Firma Preventivo: ${updatedData.cognome}`,
                    preview: 'È richiesta la tua approvazione sul preventivo per procedere con la lavorazione.',
                    date: new Date().toISOString(),
                    read: false,
                    unread: true,
                    type: 'request_signature',
                    linkedJobId: updatedData.id,
                    quoteData: updatedData.quote
                });
            }

            return { 
                ...updatedData, 
                stato: newStatus,
                statusLabel: statusLabel,
                progress: 15
            };
        }
        return j;
    });

    localStorage.setItem('mimesi_all_lavorazioni', JSON.stringify(updatedJobs));
    localStorage.setItem('mimesi_doctor_inbox', JSON.stringify(doctorInbox));
    
    setLavorazioni(updatedJobs);
    setEditingJob(null);
    alert('Stato lavorazione aggiornato con successo!');
  };

  const openValidation = (job) => {
     if(job.stato === 'in_evaluation' || job.stato === 'pending') {
         setEditingJob(job.fullData || job);
     }
  };

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
    if (filter === 'da_valutare') return matchesSearch && (item.stato === 'in_evaluation' || item.stato === 'pending');
    if (filter === 'attivi') return matchesSearch && (item.stato === 'working');
    if (filter === 'in_prova') return matchesSearch && item.stato === 'warning';
    
    // FILTRO ARCHIVIATE
    if (filter === 'archiviate') return matchesSearch && (item.stato === 'completed' || item.stato === 'rejected');
    
    return matchesSearch;
  });

  if (isCreating || editingJob) {
      return (
        <div className="p-8 max-w-[1400px] mx-auto min-h-screen">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div className="flex items-center gap-4 mb-6">
                    <button 
                        onClick={() => { setIsCreating(false); setEditingJob(null); }}
                        className="p-2 bg-white border border-neutral-200 rounded-xl hover:bg-neutral-50 text-neutral-500 transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-800">
                            {isCreating ? 'Nuova Lavorazione Interna' : 'Validazione Tecnica'}
                        </h1>
                        <p className="text-neutral-500 text-sm">
                            {isCreating ? 'Crea una nuova lavorazione manuale' : 'Revisiona e valida la richiesta del dottore'}
                        </p>
                    </div>
                </div>

                <div className="bg-white/50 rounded-3xl">
                     <WizardRequestAdmin
                        initialData={editingJob} 
                        onCancel={() => { setIsCreating(false); setEditingJob(null); }}
                        onSubmit={isCreating ? handleCreateSubmit : handleValidationSubmit}
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
          <h1 className="text-3xl font-bold text-neutral-800">Gestione Lavorazioni</h1>
          <p className="text-neutral-500">Monitora e valida le prescrizioni del laboratorio</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => setIsCreating(true)}>
             <Plus size={20} className="mr-2" /> Nuova Lavorazione
          </Button>
        </div>
      </div>

      <Card className="mb-8 !p-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
            <input 
              type="text" 
              placeholder="Cerca paziente, ID o dottore..." 
              className="w-full pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex p-1 bg-neutral-100 rounded-xl w-full md:w-auto overflow-x-auto custom-scrollbar">
            {[
              { id: 'tutti', label: 'Tutti' },
              { id: 'da_valutare', label: 'Da Valutare' },
              { id: 'attivi', label: 'Attivi' },
              { id: 'in_prova', label: 'In Prova' },
              { id: 'archiviate', label: 'Archiviate' }
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

      <div className="space-y-3">
        {filteredList.length > 0 ? (
          filteredList.map((item, index) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => openValidation(item)} 
            >
              <div className={`group bg-white rounded-xl p-4 border transition-all cursor-pointer flex flex-col md:flex-row items-center gap-4
                  ${item.stato === 'rejected' ? 'border-red-100 bg-red-50/10' :
                    item.stato === 'in_evaluation' ? 'border-blue-200 shadow-md ring-1 ring-blue-100' : 'border-neutral-100 hover:border-primary/30 hover:shadow-md'}
              `}>
                
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
                   item.stato === 'in_evaluation' ? <AlertTriangle size={20} /> :
                   <Clock size={20} />}
                </div>

                <div className="flex-1 min-w-0 text-center md:text-left">
                  <h4 className="font-bold text-neutral-800">{item.paziente}</h4>
                  <div className="flex items-center justify-center md:justify-start gap-2 text-xs text-neutral-500 flex-wrap">
                    <span className="font-mono bg-neutral-50 px-1.5 py-0.5 rounded border">{item.id}</span>
                    <span>• {item.tipo}</span>
                    {item.dottore && <span>• {item.dottore}</span>}
                  </div>
                </div>

                <div className="text-sm text-neutral-500 flex items-center gap-1 shrink-0">
                  <Calendar size={14} /> {item.data}
                </div>

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
                     <span className="inline-block px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded-full shadow-lg shadow-blue-500/30">
                       DA VALIDARE
                     </span>
                  ) : (
                    <div className="flex flex-col items-end w-full">
                       <span className="text-[10px] font-bold text-primary mb-1">{item.progress}%</span>
                       <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary" 
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
    </div>
  );
}