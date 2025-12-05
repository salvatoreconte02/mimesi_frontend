import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Plus, Clock, AlertCircle, CheckCircle, 
  Calendar, Save, Eye, Send 
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
// Importiamo i nuovi step modulari
import { StepPaziente, StepElementi, StepAllegati, RiepilogoScheda } from '../../components/wizard/WizardSteps';

// --- COMPONENTE WIZARD NUOVA RICHIESTA ---
function NuovaRichiesta({ onCancel, onSubmit }) {
  const { user } = useAuthStore();
  const [step, setStep] = useState(1);
  
  // Stato Globale del Wizard diviso per sezioni
  const [wizData, setWizData] = useState({
    paziente: { codicePaziente: '', sesso: 'M' },
    // AGGIORNATO QUI: Aggiungi 'groups: []' e 'currentSelection: []'
    elementi: { groups: [], currentSelection: [], config: { material: 'zirconio', color: 'A2' }, dates: {} },
    // AGGIORNATO QUI: Aggiungi 'files: []'
    allegati: { impression: {}, files: [] }
  });

  // Helper per aggiornare le sezioni
  const updateSection = (section, newData) => {
    setWizData(prev => ({ ...prev, [section]: newData }));
  };

  const submitFullRequest = () => {
    const newMsg = {
      id: Date.now(),
      from: `Dott. ${user?.name || 'Utente'}`,
      subject: `Nuova Lavorazione - Pz. ${wizData.paziente.codicePaziente}`,
      preview: `${wizData.elementi.selectedTeeth.length} Elementi in ${wizData.elementi.config.material}. Consegna: ${wizData.elementi.dates.delivery || 'ND'}`,
      date: new Date().toISOString(),
      read: false,
      type: 'request',
      // Salviamo l'intero oggetto dati per la validazione Admin
      fullData: wizData,
      doctorInfo: { name: user?.name, studio: user?.studio || 'Studio Principale' }
    };
    
    const existingInbox = JSON.parse(localStorage.getItem('mimesi_admin_inbox') || '[]');
    localStorage.setItem('mimesi_admin_inbox', JSON.stringify([newMsg, ...existingInbox]));
    
    onSubmit();
  };

  const canProceedStep1 = wizData.paziente.codicePaziente?.trim().length > 0;
  const canProceedStep2 = wizData.elementi.groups && wizData.elementi.groups.length > 0;

  return (
    <div className="space-y-6">
      {/* Header Wizard */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b">
        <div>
           <h2 className="text-2xl font-bold text-primary">Nuova Prescrizione (MPO)</h2>
           <p className="text-sm text-neutral-500">Studio: {user?.studio || 'Mio Studio'}</p>
        </div>
        <div className="flex gap-2">
           {[1, 2, 3, 4].map(s => (
             <div key={s} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors 
               ${step === s ? 'bg-primary text-white' : step > s ? 'bg-success text-white' : 'bg-neutral-100 text-neutral-400'}`}>
               {step > s ? <CheckCircle size={16}/> : s}
             </div>
           ))}
        </div>
      </div>

      {/* Steps Content */}
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} key={step} transition={{ duration: 0.2 }}>
        
        {step === 1 && (
          <StepPaziente data={wizData.paziente} onChange={(d) => updateSection('paziente', d)} />
        )}

        {step === 2 && (
          <StepElementi data={wizData.elementi} onChange={(d) => updateSection('elementi', d)} />
        )}

        {step === 3 && (
          <StepAllegati data={wizData.allegati} onChange={(d) => updateSection('allegati', d)} />
        )}

        {step === 4 && (
          <div className="space-y-4">
             <RiepilogoScheda fullData={wizData} doctorInfo={{ name: user?.name, studio: user?.studio }} />
             <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100 text-sm text-yellow-800">
                Confermando, la richiesta verrà inviata per la validazione tecnica.
             </div>
          </div>
        )}

      </motion.div>

      {/* Footer Navigation */}
      <div className="flex justify-between mt-8 pt-4 border-t border-neutral-100">
        <Button variant="ghost" onClick={() => step > 1 ? setStep(step - 1) : onCancel()}>
           {step === 1 ? 'Annulla' : '← Indietro'}
        </Button>
        
        {step < 4 ? (
          <Button onClick={() => setStep(step + 1)} 
             disabled={(step === 1 && !canProceedStep1) || (step === 2 && !canProceedStep2)}>
             Avanti →
          </Button>
        ) : (
          <Button variant="gradient" onClick={submitFullRequest} className="pl-6 pr-6">
             <Send size={18} className="mr-2" /> Conferma e Invia
          </Button>
        )}
      </div>
    </div>
  );
}

// --- COMPONENTE PREVENTIVI DA FIRMARE ---
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

// --- DASHBOARD PRINCIPALE ---
export default function DashboardDottore() {
  const [view, setView] = useState('dashboard');

  return (
    <div className="p-8 max-w-[1400px] mx-auto min-h-screen">
      
      {/* HEADER E AZIONI RAPIDE */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-800">Studio Odontoiatrico Albanese</h1>
          <p className="text-neutral-500">Gestione prescrizioni e avanzamento lavori</p>
        </div>
        
        <div className="flex gap-3">
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
        </div>
      </div>

      {/* CONTENUTO DINAMICO */}
      <AnimatePresence mode="wait">
        
        {/* VISTA: NUOVA RICHIESTA */}
        {view === 'new-request' && (
          <motion.div 
            key="new-req"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-3xl p-8 shadow-xl border border-neutral-100"
          >
            <NuovaRichiesta onCancel={() => setView('dashboard')} onSubmit={() => {
               alert("Richiesta inviata all'Amministrazione per validazione!");
               setView('dashboard');
            }} />
          </motion.div>
        )}

        {/* VISTA: PREVENTIVI */}
        {view === 'quotes' && (
          <motion.div key="quotes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
             <Button variant="ghost" onClick={() => setView('dashboard')} className="mb-4">← Torna alla Dashboard</Button>
             <PreventiviDaFirmare />
          </motion.div>
        )}

        {/* VISTA: DASHBOARD (Default) */}
        {view === 'dashboard' && (
          <motion.div key="dash" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
            
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