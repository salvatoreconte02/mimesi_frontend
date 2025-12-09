import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, FileText, Clock, CheckCircle, 
  AlertCircle, Calendar, Check, ChevronRight, Mail 
} from 'lucide-react';

import Card from '../../components/ui/Card'; 
import Button from '../../components/ui/Button'; 
import useAuthStore from '../../store/authStore';

// IMPORT COMPONENTE WIZARD RIUTILIZZABILE
import NewRequestWizard from '../../components/wizard/NewRequestWizard';

// --- DEFINIZIONE DEGLI STEP WIZARD ---
const DOCTOR_WIZARD_STEPS = [
  { id: 1, label: "Paziente" },
  { id: 2, label: "Lavorazione" },
  { id: 3, label: "File" }, 
  { id: 4, label: "Riepilogo" }
];

// --- COMPONENTE INDICATORE STEP ---
const DoctorStepIndicator = ({ currentStep }) => {
  const progressPercentage = ((currentStep - 1) / (DOCTOR_WIZARD_STEPS.length - 1)) * 100;

  return (
    <div className="relative w-[320px] h-12 flex items-center"> 
      <div className="absolute top-1/2 left-0 w-full h-[2px] bg-neutral-100 -translate-y-1/2 rounded-full z-0" />
      <motion.div 
        className="absolute top-1/2 left-0 h-[2px] bg-primary -translate-y-1/2 rounded-full z-0 origin-left"
        initial={{ width: 0 }}
        animate={{ width: `${progressPercentage}%` }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      />
      <div className="relative z-10 flex justify-between w-full">
        {DOCTOR_WIZARD_STEPS.map((step) => {
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
                className="absolute top-8 text-[10px] uppercase tracking-wide whitespace-nowrap"
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

// --- SOTTO-COMPONENTE: PREVENTIVI ---
const QuotesToSign = ({ lavorazioni }) => {
  const [showOtp, setShowOtp] = useState(null);

  const daFirmare = lavorazioni.filter(l => l.stato === 'pending' && l.progress === 10);

  const handleSign = (id) => {
    alert(`Codice OTP inviato alla tua email.`);
    setShowOtp(id);
  };

  const confirmSign = (id) => {
    alert("Documento firmato digitalmente con successo! La lavorazione è stata avviata.");
    setShowOtp(null);
  };

  if (daFirmare.length === 0) {
    return (
      <div className="text-center py-12 text-neutral-400">
        <FileText size={48} className="mx-auto mb-2 opacity-20" />
        <p>Nessun preventivo in attesa di firma.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-neutral-800 mb-4">Documenti in attesa di firma</h3>
      {daFirmare.map(lav => (
        <Card key={lav.id} className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-l-4 border-l-warning">
          <div>
            <div className="flex items-center gap-2 mb-1">
               <span className="text-xs font-bold bg-warning/10 text-warning px-2 py-1 rounded">IN ATTESA</span>
               <span className="text-xs text-neutral-400">{lav.data}</span>
            </div>
            <h4 className="font-bold text-lg">Paziente: {lav.paziente}</h4>
            <p className="text-sm text-neutral-600">{lav.tipo} - Rif. {lav.id}</p>
            <p className="text-sm font-bold text-primary mt-1">Totale: € {lav.fullData?.quote?.total?.toFixed(2) || '0.00'}</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            {showOtp !== lav.id ? (
              <>
                <Button variant="ghost" className="text-error hover:bg-error/10">Rifiuta</Button>
                <Button onClick={() => handleSign(lav.id)}>Visualizza e Firma</Button>
              </>
            ) : (
              <div className="flex flex-col gap-2 animate-fade-in-up">
                 <input type="text" placeholder="Inserisci OTP" className="p-2 border rounded text-center w-32" />
                 <Button variant="success" onClick={() => confirmSign(lav.id)}>Conferma OTP</Button>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};

// --- COMPONENTE PRINCIPALE DASHBOARD ---
export default function DashboardDottore() {
  const user = useAuthStore(state => state.user);
  const [view, setView] = useState('dashboard');
  const [wizardStep, setWizardStep] = useState(1);
  const [lavorazioni, setLavorazioni] = useState([]);
  const [messages, setMessages] = useState([]);

  // Carica dati dal localStorage
  useEffect(() => {
    // Lavorazioni del dottore
    const allLavorazioni = JSON.parse(localStorage.getItem('mimesi_all_lavorazioni') || '[]');
    const mine = allLavorazioni.filter(l => 
      l.dottore === `${user?.nome} ${user?.cognome}` || l.dottore === user?.name
    );
    setLavorazioni(mine);

    // Messaggi inbox
    const inbox = JSON.parse(localStorage.getItem('mimesi_doctor_inbox') || '[]');
    setMessages(inbox.slice(0, 3)); // Prime 3
  }, [user, view]); // Ricarica quando cambia view per aggiornare dopo submit

  const handleBackToDashboard = () => {
    setView('dashboard');
    setWizardStep(1); 
  };

  const handleRequestSubmit = (data) => {
    const newRequestMsg = {
        id: data.id, 
        from: `Dr. ${data.nomeDottore} ${data.cognomeDottore}`,
        subject: `Nuova Prescrizione: ${data.cognome} ${data.nome}`,
        preview: `${data.elements.length} Elementi • ${data.technicalInfo.material}`,
        date: new Date().toISOString(),
        read: false,
        type: 'request',
        fullData: data
    };

    const currentAdminInbox = JSON.parse(localStorage.getItem('mimesi_admin_inbox') || '[]');
    localStorage.setItem('mimesi_admin_inbox', JSON.stringify([newRequestMsg, ...currentAdminInbox]));

    const newLavorazione = {
      id: data.id,
      paziente: `${data.cognome} ${data.nome}`,
      dottore: `${data.nomeDottore} ${data.cognomeDottore}`,
      tipo: `${data.elements.length} Elem. ${data.technicalInfo.material.replace(/_/g, ' ')}`,
      data: new Date().toLocaleDateString('it-IT'),
      stato: 'pending',
      progress: 0,
      statusLabel: 'In Attesa Validazione',
      fullData: data
    };

    const currentLavorazioni = JSON.parse(localStorage.getItem('mimesi_all_lavorazioni') || '[]');
    localStorage.setItem('mimesi_all_lavorazioni', JSON.stringify([newLavorazione, ...currentLavorazioni]));

    console.log("Richiesta inviata all'Admin:", newRequestMsg);
    alert("Richiesta inviata con successo al Laboratorio!");
    handleBackToDashboard();
  };

  // Calcoli KPI
  const inLavorazione = lavorazioni.filter(l => l.stato === 'working').length;
  const inProva = lavorazioni.filter(l => l.stato === 'warning').length;
  const daFirmare = lavorazioni.filter(l => l.stato === 'pending' && l.progress === 10).length;
  const completati = lavorazioni.filter(l => l.stato === 'completed').length;

  // Lavorazioni attive per widget (prime 2)
  const lavorazioniAttive = lavorazioni.filter(l => l.stato === 'working' || l.stato === 'warning').slice(0, 2);

  return (
    <div className="p-8 max-w-[1400px] mx-auto min-h-screen">
      
      {/* HEADER PRINCIPALE */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 min-h-[60px]">
        <div>
          <h1 className="text-3xl font-bold text-neutral-800">
            {view === 'new-request' ? 'Nuova Prescrizione' : `Benvenuto, Dr. ${user?.cognome}`}
          </h1>
          <p className="text-neutral-500">
            {view === 'new-request' ? 'Compila i dettagli della lavorazione' : 'Panoramica delle tue prescrizioni attive'}
          </p>
        </div>
        
        {/* ZONA ACTION (DESTRA) */}
        <div className="flex gap-3 items-center">
           {view === 'new-request' ? (
             <motion.div 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }}
                className="mr-24"
             >
                <DoctorStepIndicator currentStep={wizardStep} />
             </motion.div>
           ) : (
             <>
               <Button 
                 variant={view === 'quotes' ? 'primary' : 'secondary'} 
                 onClick={() => setView('quotes')}
                 className="relative"
               >
                 <FileText size={18} /> Preventivi
                 {daFirmare > 0 && (
                   <span className="absolute -top-1 -right-1 w-4 h-4 bg-error text-white text-[10px] flex items-center justify-center rounded-full">
                     {daFirmare}
                   </span>
                 )}
               </Button>
               <Button 
                 variant="gradient" 
                 onClick={() => setView('new-request')}
                 className="shadow-lg hover:shadow-xl"
               >
                 <Plus size={18} /> Nuova Lavorazione
               </Button>
             </>
           )}
        </div>
      </div>

      {/* CONTENUTO DINAMICO */}
      <AnimatePresence mode="wait">
        
        {/* VISTA 1: NUOVA RICHIESTA */}
        {view === 'new-request' && (
          <motion.div 
            key="new-req"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-3xl p-8 shadow-xl border border-neutral-100"
          >
            <NewRequestWizard 
                mode="create" 
                onCancel={handleBackToDashboard} 
                onStepChange={(step) => setWizardStep(step)} 
                onSubmit={handleRequestSubmit}
            />
          </motion.div>
        )}

        {/* VISTA 2: LISTA PREVENTIVI */}
        {view === 'quotes' && (
          <motion.div key="quotes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
             <Button variant="ghost" onClick={handleBackToDashboard} className="mb-4">← Torna alla Dashboard</Button>
             <QuotesToSign lavorazioni={lavorazioni} />
          </motion.div>
        )}

        {/* VISTA 3: DASHBOARD DI RIEPILOGO (DEFAULT) */}
        {view === 'dashboard' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
            
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                  <AlertCircle size={24} />
                </div>
                <div>
                  <p className="text-sm text-neutral-500">In Prova</p>
                  <h3 className="text-2xl font-bold text-warning">{inProva}</h3>
                </div>
              </Card>
              <Card className="flex items-center gap-4 bg-orange-50 border-orange-200">
                <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center text-white">
                  <FileText size={24} />
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Da Firmare</p>
                  <h3 className="text-2xl font-bold text-orange-600">{daFirmare}</h3>
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

            {/* Layout a due colonne */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* COLONNA SX: LAVORAZIONI ATTIVE */}
              <div className="space-y-4">
                <h3 className="font-bold text-neutral-800 text-lg">Lavorazioni Attive</h3>
                
                {lavorazioniAttive.length > 0 ? lavorazioniAttive.map((lav) => (
                  <Card key={lav.id} className={`group hover:border-primary/50 transition-colors cursor-pointer ${lav.stato === 'warning' ? 'border-l-4 border-l-warning' : ''}`}>
                     <div className="flex justify-between items-start mb-3">
                        <div>
                           <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">{lav.id}</span>
                           <h4 className="font-bold text-lg mt-1">{lav.paziente}</h4>
                           <p className="text-sm text-neutral-500">{lav.tipo}</p>
                        </div>
                        
                        {lav.stato === 'warning' ? (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-warning text-white animate-pulse">IN PROVA</span>
                        ) : (
                          <div className="flex flex-col items-end min-w-[100px]">
                             <span className="text-xs font-bold text-primary mb-1">{lav.progress}%</span>
                             <div className="w-24 h-2 bg-neutral-100 rounded-full overflow-hidden">
                                <motion.div 
                                   initial={{ width: 0 }} 
                                   animate={{ width: `${lav.progress}%` }} 
                                   transition={{ duration: 1, ease: "easeOut" }}
                                   className="h-full bg-primary"
                                />
                             </div>
                          </div>
                        )}
                     </div>
                     <div className="flex items-center gap-4 text-xs text-neutral-400 border-t pt-3 mt-3">
                        <span className="flex items-center gap-1"><Calendar size={12}/> {lav.data}</span>
                        <span className="flex items-center gap-1">{lav.statusLabel}</span>
                     </div>
                  </Card>
                )) : (
                  <div className="text-center py-8 text-neutral-400">
                    <Clock size={32} className="mx-auto mb-2 opacity-20" />
                    <p className="text-sm">Nessuna lavorazione attiva al momento.</p>
                  </div>
                )}
              </div>

              {/* COLONNA DX: MESSAGGI RECENTI */}
              <div className="space-y-4">
                 <div className="flex justify-between items-center">
                    <h3 className="font-bold text-neutral-800 text-lg">Messaggi Recenti</h3>
                    <a href="#inbox" className="text-xs text-primary font-medium cursor-pointer hover:underline">Vedi tutti</a>
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
                       <p className="text-sm">Nessun messaggio</p>
                     </div>
                   )}
                   
                   <div className="p-3 bg-neutral-50 text-center border-t border-neutral-100">
                      <button className="text-xs font-bold text-primary flex items-center justify-center gap-1 w-full">
                         <Mail size={12} /> Vai alla Inbox
                      </button>
                   </div>
                 </div>
              </div>

            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}