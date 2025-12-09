import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, Trash2, User, FileText, CheckCircle, XCircle, ArrowLeft,
  Plus, Clock, AlertCircle, Package, Users, Check, ChevronRight
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

// IMPORT NUOVI COMPONENTI
import RiepilogoScheda from './RiepilogoScheda';
import NewRequestWizard from '../../components/wizard/NewRequestWizard';

// --- WIZARD STEPS ---
const ADMIN_WIZARD_STEPS = [
  { id: 1, label: "Paziente" },
  { id: 2, label: "Lavorazione" },
  { id: 3, label: "File" },
  { id: 4, label: "Riepilogo" },
  { id: 5, label: "Preventivo" },
  { id: 6, label: "Documento" }
];

const AdminStepIndicator = ({ currentStep }) => {
  const progressPercentage = ((currentStep - 1) / (ADMIN_WIZARD_STEPS.length - 1)) * 100;

  return (
    <div className="relative w-[400px] h-12 flex items-center"> 
      <div className="absolute top-1/2 left-0 w-full h-[2px] bg-neutral-100 -translate-y-1/2 rounded-full z-0" />
      <motion.div 
        className="absolute top-1/2 left-0 h-[2px] bg-primary -translate-y-1/2 rounded-full z-0 origin-left"
        initial={{ width: 0 }}
        animate={{ width: `${progressPercentage}%` }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      />
      <div className="relative z-10 flex justify-between w-full">
        {ADMIN_WIZARD_STEPS.map((step) => {
          const isCompleted = step.id < currentStep;
          const isActive = step.id === currentStep;
          return (
            <div key={step.id} className="flex flex-col items-center relative">
              <motion.div 
                initial={false}
                animate={{
                  backgroundColor: isActive || isCompleted ? '#2563EB' : '#FFFFFF',
                  borderColor: isActive || isCompleted ? '#2563EB' : '#E5E5E5',
                  scale: isActive ? 1.1 : 1
                }}
                className={`
                  w-6 h-6 rounded-full border flex items-center justify-center 
                  transition-colors duration-300 z-20
                  ${!isActive && !isCompleted ? 'text-neutral-300' : 'text-white shadow-md'}
                `}
              >
                {isCompleted ? <Check size={12} strokeWidth={3} /> : <span className="text-[10px] font-bold">{step.id}</span>}
              </motion.div>
              <motion.span 
                animate={{ 
                  color: isActive ? '#1E293B' : '#94A3B8', 
                  fontWeight: isActive ? 600 : 400
                }}
                className="absolute top-8 text-[9px] uppercase tracking-wide whitespace-nowrap"
              >
                {step.label}
              </motion.span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function DashboardAdmin() {
  const [view, setView] = useState('dashboard');
  const [wizardStep, setWizardStep] = useState(1);
  const [inbox, setInbox] = useState([]);
  const [selectedMsg, setSelectedMsg] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Dati dashboard
  const [lavorazioni, setLavorazioni] = useState([]);
  const [messages, setMessages] = useState([]);

  // Caricamento Dati
  useEffect(() => {
    const storedData = localStorage.getItem('mimesi_admin_inbox');
    if (storedData) setInbox(JSON.parse(storedData));

    // Tutte le lavorazioni
    const allLavorazioni = JSON.parse(localStorage.getItem('mimesi_all_lavorazioni') || '[]');
    setLavorazioni(allLavorazioni);

    // Messaggi (inbox admin)
    const adminInbox = JSON.parse(localStorage.getItem('mimesi_admin_inbox') || '[]');
    setMessages(adminInbox.slice(0, 3));
  }, [view]);

  // Gestione Selezione
  const handleSelectMessage = (msg) => {
    setSelectedMsg(msg);
    if (!msg.read) {
      const updatedInbox = inbox.map(m => m.id === msg.id ? { ...m, read: true } : m);
      setInbox(updatedInbox);
      localStorage.setItem('mimesi_admin_inbox', JSON.stringify(updatedInbox));
    }
  };

  // Gestione Cancellazione
  const handleDelete = (id, e) => {
    e?.stopPropagation(); 
    const updatedInbox = inbox.filter(m => m.id !== id);
    setInbox(updatedInbox);
    if (selectedMsg?.id === id) setSelectedMsg(null);
    localStorage.setItem('mimesi_admin_inbox', JSON.stringify(updatedInbox));
  };

  // Callback quando il Wizard finisce
  const handleWizardSubmit = (finalData) => {
    console.log("Processo Admin Completato:", finalData);
    
    // SALVATAGGIO LAVORAZIONE NEL SISTEMA
    const newLavorazione = {
      id: finalData.id,
      paziente: `${finalData.cognome} ${finalData.nome}`,
      dottore: `${finalData.nomeDottore} ${finalData.cognomeDottore}`,
      tipo: `${finalData.elements.length} Elem. ${finalData.technicalInfo.material.replace(/_/g, ' ')}`,
      data: new Date().toLocaleDateString('it-IT'),
      stato: finalData.adminAction === 'send_to_doctor' ? 'pending' : 'working',
      progress: finalData.adminAction === 'send_to_doctor' ? 10 : 20,
      statusLabel: finalData.adminAction === 'send_to_doctor' ? 'Da Firmare' : 'Avviata',
      fullData: finalData
    };

    // Salva in localStorage globale
    const currentLavorazioni = JSON.parse(localStorage.getItem('mimesi_all_lavorazioni') || '[]');
    localStorage.setItem('mimesi_all_lavorazioni', JSON.stringify([newLavorazione, ...currentLavorazioni]));
    
    if (finalData.adminAction === 'send_to_doctor') {
        const msgForDoctor = {
          id: Date.now(),
          from: 'Amministrazione',
          subject: `Preventivo da Firmare: ${finalData.cognome}`,
          preview: `Importo: € ${finalData.quote.total}. Si prega di firmare.`,
          date: new Date().toISOString(),
          read: false,
          type: 'quote',
          tag: 'Preventivo',
          fullData: finalData
        };
        const currentInbox = JSON.parse(localStorage.getItem('mimesi_doctor_inbox') || '[]');
        localStorage.setItem('mimesi_doctor_inbox', JSON.stringify([msgForDoctor, ...currentInbox]));
        alert("Preventivo inviato al Dottore!");
    } else {
        alert("Lavorazione approvata internamente!");
    }

    if (selectedMsg) handleDelete(selectedMsg.id);
    setIsProcessing(false);
    setSelectedMsg(null);
    setView('dashboard');
  };

  const unreadCount = inbox.filter(m => !m.read).length;

  // Calcoli KPI
  const daValutare = lavorazioni.filter(l => l.stato === 'pending' && l.progress === 0).length;
  const inLavorazione = lavorazioni.filter(l => l.stato === 'working').length;
  const inProva = lavorazioni.filter(l => l.stato === 'warning').length;
  const completati = lavorazioni.filter(l => l.stato === 'completed').length;

  // Lavorazioni recenti (prime 2)
  const lavorazioniRecenti = lavorazioni.slice(0, 2);

  return (
    <div className="p-8 max-w-[1600px] mx-auto min-h-screen bg-neutral-50">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-800">
            {view === 'inbox-detail' ? 'Gestione Richieste' : 
             view === 'new-request' ? 'Nuova Lavorazione' : 
             'Admin Console'}
          </h1>
          <p className="text-neutral-500">
            {view === 'inbox-detail' ? 'Valida e crea preventivi per le richieste ricevute' :
             view === 'new-request' ? 'Crea una nuova lavorazione interna' :
             'Panoramica operativa del laboratorio'}
          </p>
        </div>
        {!isProcessing && view === 'dashboard' && (
           <div className="flex gap-4">
             <Button variant="secondary" onClick={() => setView('inbox-detail')}>
               <Mail size={18} className="mr-2" />
               Richieste
               {unreadCount > 0 && (
                 <span className="ml-2 bg-error text-white text-xs px-2 py-0.5 rounded-full">{unreadCount}</span>
               )}
             </Button>
             <Button variant="gradient" onClick={() => setView('new-request')}>
               <Plus size={18} className="mr-2" /> Nuova Lavorazione
             </Button>
           </div>
        )}
        {view === 'new-request' && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="mr-24">
            <AdminStepIndicator currentStep={wizardStep} />
          </motion.div>
        )}
      </div>

      <AnimatePresence mode="wait">
        
        {/* --- VISTA 1: DASHBOARD --- */}
        {view === 'dashboard' && (
          <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
            
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="flex items-center gap-4 bg-orange-50 border-orange-200">
                <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center text-white">
                  <AlertCircle size={24} />
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Da Valutare</p>
                  <h3 className="text-2xl font-bold text-orange-600">{daValutare}</h3>
                </div>
              </Card>
              <Card className="flex items-center gap-4 bg-primary/5 border-primary/20">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white">
                  <Clock size={24} />
                </div>
                <div>
                  <p className="text-sm text-neutral-500">In Lavorazione</p>
                  <h3 className="text-2xl font-bold text-primary">{inLavorazione}</h3>
                </div>
              </Card>
              <Card className="flex items-center gap-4 bg-warning/5 border-warning/20">
                <div className="w-12 h-12 rounded-full bg-warning flex items-center justify-center text-white">
                  <FileText size={24} />
                </div>
                <div>
                  <p className="text-sm text-neutral-500">In Prova</p>
                  <h3 className="text-2xl font-bold text-warning">{inProva}</h3>
                </div>
              </Card>
              <Card className="flex items-center gap-4 bg-success/5 border-success/20">
                <div className="w-12 h-12 rounded-full bg-success flex items-center justify-center text-white">
                  <CheckCircle size={24} />
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Completati</p>
                  <h3 className="text-2xl font-bold text-success">{completati}</h3>
                </div>
              </Card>
            </div>

            {/* Grid 3 colonne */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* COL 1: Lavorazioni Recenti */}
              <div className="space-y-4">
                <h3 className="font-bold text-neutral-800 text-lg">Lavorazioni Recenti</h3>
                {lavorazioniRecenti.length > 0 ? lavorazioniRecenti.map(lav => (
                  <Card key={lav.id} className="hover:border-primary/50 transition-colors cursor-pointer">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">{lav.id}</span>
                        <h4 className="font-bold mt-1">{lav.paziente}</h4>
                        <p className="text-xs text-neutral-500">{lav.tipo}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        lav.stato === 'working' ? 'bg-primary/10 text-primary' :
                        lav.stato === 'warning' ? 'bg-warning/10 text-warning' :
                        'bg-neutral-100 text-neutral-500'
                      }`}>
                        {lav.statusLabel}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400">Dr. {lav.dottore}</p>
                  </Card>
                )) : (
                  <div className="text-center py-8 text-neutral-400">
                    <Clock size={32} className="mx-auto mb-2 opacity-20" />
                    <p className="text-sm">Nessuna lavorazione recente</p>
                  </div>
                )}
              </div>

              {/* COL 2: Richieste Recenti */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-neutral-800 text-lg">Richieste Recenti</h3>
                  <button onClick={() => setView('inbox-detail')} className="text-xs text-primary font-medium hover:underline">
                    Vedi tutte
                  </button>
                </div>
                <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden shadow-sm">
                  {messages.length > 0 ? messages.map((msg) => (
                    <div key={msg.id} className="p-4 border-b last:border-0 hover:bg-neutral-50 flex gap-3 items-start cursor-pointer transition-colors">
                      <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${!msg.read ? 'bg-primary' : 'bg-transparent'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between mb-1">
                          <p className={`text-sm ${!msg.read ? 'font-bold text-neutral-800' : 'font-medium text-neutral-600'}`}>
                            {msg.from}
                          </p>
                          <span className="text-[10px] text-neutral-400 whitespace-nowrap">
                            {new Date(msg.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className={`text-xs truncate ${!msg.read ? 'text-neutral-700' : 'text-neutral-400'}`}>
                          {msg.subject}
                        </p>
                      </div>
                      <ChevronRight size={16} className="text-neutral-300 self-center" />
                    </div>
                  )) : (
                    <div className="p-8 text-center text-neutral-400">
                      <Mail size={32} className="mx-auto mb-2 opacity-20" />
                      <p className="text-sm">Nessuna richiesta</p>
                    </div>
                  )}
                </div>
              </div>

              {/* COL 3: Widget Admin */}
              <div className="space-y-4">
                {/* Giacenze */}
                <Card>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Package size={20} className="text-blue-600" />
                    </div>
                    <h4 className="font-bold text-neutral-800">Giacenze Magazzino</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-600">Zirconio (Blocchi)</span>
                      <span className="font-bold text-neutral-800">23</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-600">Disilicato</span>
                      <span className="font-bold text-neutral-800">12</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-600">PMMA</span>
                      <span className="font-bold text-orange-600">4 ⚠️</span>
                    </div>
                  </div>
                </Card>

                {/* Turni */}
                <Card>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <Users size={20} className="text-green-600" />
                    </div>
                    <h4 className="font-bold text-neutral-800">Turno Oggi</h4>
                  </div>
                  <div className="space-y-2">
                    {['Marco CAD', 'Lucia Ceramica', 'Paolo Fresatura', 'Anna Finitura'].map((op, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-neutral-700">{op}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

            </div>
          </motion.div>
        )}

        {/* --- VISTA 2: NUOVA LAVORAZIONE --- */}
        {view === 'new-request' && (
          <motion.div 
            key="new-req"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-3xl p-8 shadow-xl border border-neutral-100"
          >
            <Button variant="ghost" onClick={() => setView('dashboard')} className="mb-4">
              <ArrowLeft size={18} className="mr-2" /> Annulla
            </Button>
            <NewRequestWizard 
              mode="admin"
              onCancel={() => setView('dashboard')}
              onStepChange={(step) => setWizardStep(step)}
              onSubmit={handleWizardSubmit}
            />
          </motion.div>
        )}

        {/* --- VISTA 3: INBOX DETAIL (FULL) --- */}
        {view === 'inbox-detail' && !isProcessing && (
           <motion.div 
             key="inbox-mode"
             initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
             className="grid grid-cols-12 gap-6 h-[calc(100vh-180px)]"
           >
              <Button variant="ghost" onClick={() => setView('dashboard')} className="col-span-12 mb-4">
                <ArrowLeft size={18} className="mr-2" /> Torna alla Dashboard
              </Button>

              {/* LISTA MESSAGGI (SX) */}
              <div className="col-span-4 bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 border-b border-neutral-100 bg-neutral-50/50">
                  <h3 className="font-bold text-neutral-700 flex items-center gap-2">
                    <Mail size={18} /> Richieste in Arrivo
                  </h3>
                </div>
                <div className="overflow-y-auto flex-1 p-2 space-y-2 custom-scrollbar">
                  {inbox.length === 0 ? (
                    <div className="text-center py-10 text-neutral-400">
                      <p>Nessuna richiesta presente.</p>
                    </div>
                  ) : (
                    inbox.map((msg) => (
                      <motion.div
                        key={msg.id}
                        onClick={() => handleSelectMessage(msg)}
                        className={`p-4 rounded-xl cursor-pointer transition-all border group relative ${
                          selectedMsg?.id === msg.id 
                            ? 'bg-primary/5 border-primary shadow-sm' 
                            : 'bg-white border-transparent hover:bg-neutral-50 hover:border-neutral-200'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex items-center gap-2">
                            {!msg.read && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                            <span className={`text-sm ${!msg.read ? 'font-bold text-neutral-800' : 'font-medium text-neutral-600'}`}>
                              {msg.from}
                            </span>
                          </div>
                          <span className="text-[10px] text-neutral-400">{new Date(msg.date).toLocaleDateString()}</span>
                        </div>
                        <p className={`text-sm mb-1 ${!msg.read ? 'text-neutral-800 font-semibold' : 'text-neutral-500'}`}>
                          {msg.subject}
                        </p>
                        
                        <button 
                          onClick={(e) => handleDelete(msg.id, e)}
                          className="absolute right-2 bottom-2 p-1.5 text-neutral-300 hover:text-error hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={14} />
                        </button>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>

              {/* DETTAGLIO MESSAGGIO (DX) */}
              <div className="col-span-8 h-full">
                 <AnimatePresence mode="wait">
                    {selectedMsg ? (
                       <motion.div 
                          key={selectedMsg.id}
                          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                          className="bg-white rounded-2xl border border-neutral-200 shadow-sm h-full flex flex-col overflow-hidden"
                       >
                          <div className="p-6 border-b border-neutral-100 flex justify-between items-start bg-white z-10">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <User size={24} />
                              </div>
                              <div>
                                <h2 className="text-xl font-bold text-neutral-800">{selectedMsg.subject}</h2>
                                <div className="flex items-center gap-2 text-sm text-neutral-500">
                                  <span>{selectedMsg.from}</span> • <span>{new Date(selectedMsg.date).toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                            <Button variant="ghost" className="text-error hover:bg-red-50" onClick={(e) => handleDelete(selectedMsg.id, e)}>
                               <Trash2 size={18} />
                            </Button>
                          </div>

                          <div className="flex-1 overflow-y-auto p-6 bg-neutral-50/50">
                             {selectedMsg.fullData && <RiepilogoScheda data={selectedMsg.fullData} />}
                          </div>

                          <div className="p-4 border-t border-neutral-100 bg-white flex justify-end gap-3">
                             <Button variant="ghost" className="text-neutral-500" onClick={(e) => handleDelete(selectedMsg.id, e)}>
                                <XCircle size={18} className="mr-2" /> Rifiuta
                             </Button>
                             <Button variant="primary" className="shadow-lg" onClick={() => setIsProcessing(true)}>
                                <CheckCircle size={18} className="mr-2" /> Valida
                             </Button>
                          </div>

                       </motion.div>
                    ) : (
                       <div className="h-full bg-neutral-50 rounded-2xl border-2 border-dashed border-neutral-200 flex flex-col items-center justify-center text-neutral-400">
                          <Mail size={64} className="mb-4 opacity-10" />
                          <p>Seleziona una richiesta</p>
                       </div>
                    )}
                 </AnimatePresence>
              </div>
           </motion.div>
        )}

        {/* --- VISTA 4: WIZARD VALIDAZIONE --- */}
        {view === 'inbox-detail' && isProcessing && selectedMsg && (
           <motion.div 
             key="wizard-mode"
             initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
             className="bg-white rounded-3xl p-8 shadow-xl border border-neutral-100"
           >
              <div className="mb-6 flex items-center justify-between border-b border-neutral-100 pb-4">
                  <Button variant="ghost" onClick={() => setIsProcessing(false)}>
                      <ArrowLeft size={18} className="mr-2"/> Annulla Validazione
                  </Button>
                  <h2 className="text-xl font-bold text-neutral-800">Validazione Tecnica & Preventivazione</h2>
              </div>
              
              <NewRequestWizard 
                 mode="admin"
                 initialData={selectedMsg.fullData} 
                 onCancel={() => setIsProcessing(false)}
                 onSubmit={handleWizardSubmit}
                 onStepChange={(step) => setWizardStep(step)}
              />
           </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}