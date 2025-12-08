import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, FileText, Clock, CheckCircle, 
  AlertCircle, Calendar, Save, Eye, Check
} from 'lucide-react';

import Card from '../../components/ui/Card'; 
import Button from '../../components/ui/Button'; 

// IMPORT COMPONENTE WIZARD RIUTILIZZABILE
import NewRequestWizard from '../../components/wizard/NewRequestWizard';

// --- DEFINIZIONE DEGLI STEP ---
const WIZARD_STEPS = [
  { id: 1, label: "Paziente" },
  { id: 2, label: "Lavorazione" },
  { id: 3, label: "File" }, // Corretto
  { id: 4, label: "Riepilogo" }
];

// --- COMPONENTE INDICATORE (Stile Filling + Label, Allineato a Destra) ---
const StepIndicatorRight = ({ currentStep }) => {
  // Calcolo percentuale
  const progressPercentage = ((currentStep - 1) / (WIZARD_STEPS.length - 1)) * 100;

  return (
    <div className="relative w-[320px] h-12 flex items-center"> 
      
      {/* 1. BARRA DI SFONDO (Grigia Sottile) */}
      <div className="absolute top-1/2 left-0 w-full h-[2px] bg-neutral-100 -translate-y-1/2 rounded-full z-0" />

      {/* 2. BARRA DI PROGRESSO (Blu Animata) */}
      <motion.div 
        className="absolute top-1/2 left-0 h-[2px] bg-primary -translate-y-1/2 rounded-full z-0 origin-left"
        initial={{ width: 0 }}
        animate={{ width: `${progressPercentage}%` }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      />

      {/* 3. CERCHI E LABEL */}
      <div className="relative z-10 flex justify-between w-full">
        {WIZARD_STEPS.map((step) => {
          const isCompleted = step.id < currentStep;
          const isActive = step.id === currentStep;

          return (
            <div key={step.id} className="flex flex-col items-center relative">
              {/* Cerchio */}
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
                {isCompleted ? (
                  <Check size={12} strokeWidth={3} />
                ) : (
                  <span className="text-[10px] font-bold">{step.id}</span>
                )}
              </motion.div>

              {/* LABEL (Posizionata sotto in modo assoluto per non rompere il layout) */}
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

// --- SOTTO-COMPONENTE: PREVENTIVI (Invariato) ---
const PreventiviDaFirmare = () => {
  const [showOtp, setShowOtp] = useState(null);

  const handleSign = (id) => {
    alert(`Codice OTP inviato alla tua email.`);
    setShowOtp(id);
  };

  const confirmSign = (id) => {
    alert("Documento firmato digitalmente con successo! La lavorazione è stata avviata.");
    setShowOtp(null);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-neutral-800 mb-4">Documenti in attesa di firma</h3>
      <Card className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-l-4 border-l-warning">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <span className="text-xs font-bold bg-warning/10 text-warning px-2 py-1 rounded">IN ATTESA</span>
             <span className="text-xs text-neutral-400">Emesso il 29/11/2025</span>
          </div>
          <h4 className="font-bold text-lg">Paziente: Giuseppe Verdi</h4>
          <p className="text-sm text-neutral-600">Ponte in Zirconio (3 elementi) - Rif. Prev #2024-88</p>
          <p className="text-sm font-bold text-primary mt-1">Totale: € 450,00</p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          {!showOtp ? (
            <>
              <Button variant="ghost" className="text-error hover:bg-error/10">Rifiuta</Button>
              <Button onClick={() => handleSign(1)}>Visualizza e Firma</Button>
            </>
          ) : (
            <div className="flex flex-col gap-2 animate-fade-in-up">
               <input type="text" placeholder="Inserisci OTP" className="p-2 border rounded text-center w-32" />
               <Button variant="success" onClick={() => confirmSign(1)}>Conferma OTP</Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

// --- COMPONENTE PRINCIPALE DASHBOARD ---
export default function DashboardDottore() {
  const [view, setView] = useState('dashboard');
  const [wizardStep, setWizardStep] = useState(1);

  const handleBackToDashboard = () => {
    setView('dashboard');
    setWizardStep(1); 
  };

  return (
    <div className="p-8 max-w-[1400px] mx-auto min-h-screen">
      
      {/* HEADER PRINCIPALE */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 min-h-[60px]">
        
        {/* TITOLO (SINISTRA) - Sempre visibile, cambia solo il testo */}
        <div>
          <h1 className="text-3xl font-bold text-neutral-800">
            {view === 'new-request' ? 'Nuova Prescrizione' : 'Studio Odontoiatrico Albanese'}
          </h1>
          <p className="text-neutral-500">
            {view === 'new-request' ? 'Compila i dettagli della lavorazione' : 'Gestione prescrizioni e avanzamento lavori'}
          </p>
        </div>
        
        {/* ZONA ACTION (DESTRA) */}
        <div className="flex gap-3 items-center">
           
           {/* Se siamo in 'new-request', mostra lo STEPPER a DESTRA */}
           {view === 'new-request' ? (
             <motion.div 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }}
                className="mr-24" /* <--- MODIFICA QUI: Aggiunto margine destro abbondante per spostarlo a sinistra */
             >
                <StepIndicatorRight currentStep={wizardStep} />
             </motion.div>
           ) : (
             // Altrimenti mostra i bottoni normali
             <>
               <Button 
                 variant={view === 'quotes' ? 'primary' : 'secondary'} 
                 onClick={() => setView('quotes')}
                 className="relative"
               >
                 <FileText size={18} /> Preventivi
                 <span className="absolute -top-1 -right-1 w-4 h-4 bg-error text-white text-[10px] flex items-center justify-center rounded-full">1</span>
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
                onCancel={handleBackToDashboard} 
                onStepChange={(step) => setWizardStep(step)} 
                onSubmit={(data) => {
                    console.log("Dati ricevuti dal Wizard:", data);
                    alert("Richiesta creata con successo!");
                    handleBackToDashboard();
                }} 
            />
          </motion.div>
        )}

        {/* VISTA 2: LISTA PREVENTIVI */}
        {view === 'quotes' && (
          <motion.div key="quotes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
             <Button variant="ghost" onClick={handleBackToDashboard} className="mb-4">← Torna alla Dashboard</Button>
             <PreventiviDaFirmare />
          </motion.div>
        )}

        {/* VISTA 3: DASHBOARD DI RIEPILOGO (DEFAULT) */}
        {view === 'dashboard' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="flex items-center gap-4 bg-primary/5 border-primary/20">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white">
                  <Clock size={24} />
                </div>
                <div>
                  <p className="text-sm text-neutral-500">In Lavorazione</p>
                  <h3 className="text-2xl font-bold text-primary">4 Casi</h3>
                </div>
              </Card>
              <Card className="flex items-center gap-4 bg-warning/5 border-warning/20">
                <div className="w-12 h-12 rounded-full bg-warning flex items-center justify-center text-white">
                  <AlertCircle size={24} />
                </div>
                <div>
                  <p className="text-sm text-neutral-500">In Attesa (Prova)</p>
                  <h3 className="text-2xl font-bold text-warning">1 Caso</h3>
                </div>
              </Card>
              <Card className="flex items-center gap-4 bg-success/5 border-success/20">
                <div className="w-12 h-12 rounded-full bg-success flex items-center justify-center text-white">
                  <CheckCircle size={24} />
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Consegnati (Mese)</p>
                  <h3 className="text-2xl font-bold text-success">12 Casi</h3>
                </div>
              </Card>
            </div>

            {/* Lista Lavorazioni Attive */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-bold text-neutral-800 text-lg">Lavorazioni Attive</h3>
                
                <Card className="group hover:border-primary/50 transition-colors cursor-pointer">
                   <div className="flex justify-between items-start mb-3">
                      <div>
                         <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">#LAV-2024-105</span>
                         <h4 className="font-bold text-lg mt-1">Mario Rossi</h4>
                         <p className="text-sm text-neutral-500">Corona Singola - Zirconio A3</p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">In Ceramizzazione</span>
                   </div>
                   <div className="flex items-center gap-4 text-xs text-neutral-400 border-t pt-3 mt-3">
                      <span className="flex items-center gap-1"><Calendar size={12}/> Consegna: 12/02/2025</span>
                      <span className="flex items-center gap-1"><Save size={12}/> Impronta: Digitale</span>
                   </div>
                </Card>

                <Card className="group hover:border-primary/50 transition-colors cursor-pointer border-l-4 border-l-warning">
                   <div className="flex justify-between items-start mb-3">
                      <div>
                         <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">#LAV-2024-102</span>
                         <h4 className="font-bold text-lg mt-1">Luigi Bianchi</h4>
                         <p className="text-sm text-neutral-500">Ponte (3 Elementi)</p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-warning text-white">IN PROVA</span>
                   </div>
                   <div className="text-xs text-neutral-500 bg-neutral-50 p-2 rounded">
                      ⚠️ Dispositivo spedito allo studio. In attesa di esito prova.
                   </div>
                </Card>
              </div>

              {/* Storico / Recenti */}
              <div className="space-y-4">
                 <h3 className="font-bold text-neutral-800 text-lg">Storico Recente</h3>
                 <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
                   {[1,2,3].map((i) => (
                      <div key={i} className="p-4 border-b last:border-0 hover:bg-neutral-50 flex justify-between items-center">
                         <div>
                            <p className="font-medium text-sm">Paziente Test {i}</p>
                            <p className="text-xs text-neutral-400">Completato il 20/01/2025</p>
                         </div>
                         <Button variant="ghost" className="h-8 w-8 p-0 rounded-full"><Eye size={16}/></Button>
                      </div>
                   ))}
                 </div>
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}