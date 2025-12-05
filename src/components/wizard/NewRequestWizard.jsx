import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../../store/authStore';

// IMPORT STEP WIZARD
import StepPatient from './StepPatient';
import StepElements from './StepElements';
import StepFiles from './StepFiles';
import StepSummary from './StepSummary';

export default function NewRequestWizard({ onCancel, onSubmit }) {
  const [step, setStep] = useState(1);
  const user = useAuthStore((state) => state.user);
  
  // Determina se l'utente è un Admin o un Dottore
  const isAdmin = user?.role === 'admin';
  const isDoctor = user?.role === 'dottore';

  // Stato Globale del Wizard
  const [formData, setFormData] = useState({
    // Dati Studio/Dottore (Presi dallo STORE aggiornato)
    // Se è dottore, uniamo nome e cognome per il campo "Nome Dottore", altrimenti vuoto
    nomeDottore: isDoctor ? `${user.nome} ${user.cognome}` : '',
    // Se è dottore, prendiamo lo studio dallo store
    nomeStudio: isDoctor ? (user.studio || '') : '', 
    
    // Dati Paziente
    nome: '', cognome: '', codicePaziente: '', eta: '', sesso: 'M',
    allergie: false, bruxismo: false, disfunzioni: false, dispositivi: false, handicap: false
  });

  const [configuredElements, setConfiguredElements] = useState([]); 
  const [dates, setDates] = useState({ delivery: '', tryIn1: '', tryIn2: '', tryIn3: '' });

  const next = () => setStep(s => s + 1);
  const back = () => setStep(s => s - 1);

  // Payload finale per il submit
  const handleFinalSubmit = () => {
    const fullRequestData = {
      ...formData,
      elements: configuredElements,
      dates: dates,
      createdBy: user.id,
      createdRole: user.role,
      studioReference: user.studio, // Salviamo anche il riferimento allo studio originale
      status: 'new'
    };
    
    console.log("Submitting Request:", fullRequestData);
    onSubmit(fullRequestData);
  };

  return (
    <div className="space-y-6">
      {/* HEADER WIZARD */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-100">
        <div>
           <h2 className="text-2xl font-bold text-primary">Nuova Prescrizione (MPO)</h2>
           <p className="text-sm text-neutral-500 font-medium flex items-center gap-2">
             {isAdmin ? (
               <span className="text-purple-600 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">Modalità Admin</span>
             ) : (
               // Usiamo formData.nomeStudio che ora è popolato correttamente dallo store
               <span>Studio Richiedente: <span className="text-neutral-700 font-bold">{formData.nomeStudio || 'Non specificato'}</span></span>
             )}
           </p>
        </div>
        
        {/* Step Indicator */}
        <div className="flex flex-col items-end gap-1">
            <span className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-bold shadow-sm border border-primary/20">
                Step {step} di 4
            </span>
            <div className="flex gap-1 mt-1">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i <= step ? 'w-6 bg-primary' : 'w-2 bg-neutral-200'}`}></div>
                ))}
            </div>
        </div>
      </div>

      {/* STEP CONTENT */}
      <AnimatePresence mode="wait">
        {step === 1 && (
           <StepPatient 
             key="step1" 
             formData={formData} 
             setFormData={setFormData} 
             onNext={next} 
             isAdmin={isAdmin} 
           />
        )}
        
        {step === 2 && (
           <StepElements 
             key="step2"
             configuredElements={configuredElements} 
             setConfiguredElements={setConfiguredElements}
             dates={dates}
             setDates={setDates}
             onBack={back}
             onNext={next}
           />
        )}

        {step === 3 && (
           <StepFiles key="step3" onBack={back} onNext={next} />
        )}

        {step === 4 && (
           <StepSummary 
             key="step4"
             formData={formData}
             configuredElements={configuredElements}
             dates={dates}
             onBack={back}
             onSubmit={handleFinalSubmit}
           />
        )}
      </AnimatePresence>
    </div>
  );
}