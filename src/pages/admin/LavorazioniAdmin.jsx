import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, FileText, CheckCircle, Clock, 
  AlertCircle, ChevronRight, Calendar, AlertTriangle, Plus, ArrowLeft, XCircle, FileSignature
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

  const handleWizardSubmit = (data) => {
    const existingJobs = JSON.parse(localStorage.getItem('mimesi_all_lavorazioni') || '[]');
    const doctorInbox = JSON.parse(localStorage.getItem('mimesi_doctor_inbox') || '[]');
    const adminInbox = JSON.parse(localStorage.getItem('mimesi_admin_inbox') || '[]');

    const isNewJob = isCreating;
    const actionType = data.adminAction;

    const totalElements = data.elements.reduce((acc, group) => acc + group.teeth.length, 0);
    const materialLabel = data.technicalInfo?.material?.replace('_', ' ') || 'N/D';
    const patientName = `${data.cognome} ${data.nome}`;
    const doctorName = data.nomeDottore && data.cognomeDottore 
      ? `Dr. ${data.nomeDottore} ${data.cognomeDottore}` 
      : 'Interno';
    const studioName = data.nomeStudio || 'Laboratorio Interno';
    const quoteTotal = data.quote?.total?.toFixed(2) || '0.00';
    const currentDate = new Date().toLocaleDateString('it-IT', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    let newStatus, statusLabel, progress;

    if (actionType === 'approve_internal') {
      newStatus = 'working';
      statusLabel = 'In Lavorazione';
      progress = 0;

      if (data.nomeDottore && data.cognomeDottore) {
        doctorInbox.unshift({
          id: Date.now(),
          from: 'Mimesi Lab - Amministrazione',
          subject: `✓ Lavorazione Avviata: ${data.id}`,
          preview: `Gentile ${doctorName}, La informiamo che la lavorazione per il paziente ${patientName} (Rif. ${data.id}) è stata approvata e avviata in produzione in data ${currentDate}. Tipologia: ${totalElements} elemento/i in ${materialLabel}. La lavorazione procederà secondo le specifiche tecniche concordate. Riceverà aggiornamenti sullo stato di avanzamento.`,
          date: new Date().toISOString(),
          read: false,
          unread: true,
          type: 'info',
          linkedJobId: data.id
        });
      }

      adminInbox.unshift({
        id: Date.now() + 1,
        from: 'Sistema',
        subject: `✓ Lavorazione Avviata: ${data.id}`,
        preview: `Lavorazione ${data.id} approvata internamente e avviata in produzione. Paziente: ${patientName}. ${doctorName !== 'Interno' ? `Richiedente: ${doctorName} (${studioName}).` : 'Lavorazione interna.'} Tipologia: ${totalElements} elem. in ${materialLabel}.`,
        date: new Date().toISOString(),
        read: false,
        unread: true,
        type: 'notification',
        linkedJobId: data.id
      });

    } else if (actionType === 'send_to_doctor') {
      newStatus = 'pending';
      statusLabel = 'Attesa Firma';
      progress = 0;

      doctorInbox.unshift({
        id: Date.now(),
        from: 'Mimesi Lab - Amministrazione',
        subject: `📋 Richiesta Firma Preventivo: ${data.id}`,
        preview: `Gentile ${doctorName}, il preventivo per la lavorazione relativa al paziente ${patientName} (${data.id}) è pronto per la Sua approvazione. Tipologia: ${totalElements} elemento/i in ${materialLabel}. Importo totale: € ${quoteTotal}. La preghiamo di visionare il preventivo e procedere con la firma digitale per avviare la produzione.`,
        date: new Date().toISOString(),
        read: false,
        unread: true,
        type: 'request_signature',
        linkedJobId: data.id,
        quoteData: data.quote
      });

      adminInbox.unshift({
        id: Date.now() + 1,
        from: 'Sistema',
        subject: `📤 Preventivo Inviato: ${data.id}`,
        preview: `Preventivo per lavorazione ${data.id} inviato a ${doctorName} (${studioName}) per approvazione. Paziente: ${patientName}. Tipologia: ${totalElements} elem. in ${materialLabel}. Importo: € ${quoteTotal}. In attesa di firma digitale.`,
        date: new Date().toISOString(),
        read: false,
        unread: true,
        type: 'notification',
        linkedJobId: data.id
      });
    }

    let updatedJobs;
    
    if (isNewJob) {
      const newJob = { 
        id: data.id,
        paziente: patientName,
        tipo: `${totalElements} Elem. ${materialLabel}`,
        dottore: doctorName,
        data: new Date().toLocaleDateString(),
        stato: newStatus,
        statusLabel: statusLabel,
        progress: progress,
        fullData: data 
      };
      updatedJobs = [newJob, ...existingJobs];
    } else {
      updatedJobs = existingJobs.map(j => {
        if (String(j.id) === String(data.id)) {
          return { 
            ...j,
            ...data,
            paziente: patientName,
            tipo: `${totalElements} Elem. ${materialLabel}`,
            stato: newStatus,
            statusLabel: statusLabel,
            progress: progress,
            fullData: data
          };
        }
        return j;
      });
    }

    localStorage.setItem('mimesi_all_lavorazioni', JSON.stringify(updatedJobs));
    localStorage.setItem('mimesi_doctor_inbox', JSON.stringify(doctorInbox));
    localStorage.setItem('mimesi_admin_inbox', JSON.stringify(adminInbox));

    setLavorazioni(updatedJobs);
    setIsCreating(false);
    setEditingJob(null);
    
    const message = actionType === 'approve_internal' 
      ? 'Lavorazione approvata e avviata in produzione!' 
      : 'Preventivo inviato al dottore per approvazione!';
    alert(message);
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
    if (filter === 'da_valutare') return matchesSearch && item.stato === 'in_evaluation';
    if (filter === 'attesa_firma') return matchesSearch && item.stato === 'pending';
    if (filter === 'attivi') return matchesSearch && item.stato === 'working';
    if (filter === 'in_prova') return matchesSearch && item.stato === 'warning';
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
                {isCreating ? 'Nuova Lavorazione' : 'Validazione Tecnica'}
              </h1>
              <p className="text-neutral-500 text-sm">
                {isCreating ? 'Crea una nuova lavorazione con preventivo' : 'Revisiona e valida la richiesta del dottore'}
              </p>
            </div>
          </div>

          <div className="bg-white/50 rounded-3xl">
            <WizardRequestAdmin
              initialData={editingJob} 
              onCancel={() => { setIsCreating(false); setEditingJob(null); }}
              onSubmit={handleWizardSubmit}
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
              { id: 'attesa_firma', label: 'Attesa Firma' },
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
                  item.stato === 'in_evaluation' ? 'border-blue-200 shadow-md ring-1 ring-blue-100' : 
                  item.stato === 'pending' ? 'border-orange-200 shadow-md ring-1 ring-orange-100' :
                  'border-neutral-100 hover:border-primary/30 hover:shadow-md'}
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
                   item.stato === 'pending' ? <FileSignature size={20} /> : 
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