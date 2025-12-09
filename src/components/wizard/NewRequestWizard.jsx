import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../../store/authStore';

// Step Standard
import StepPatient from './StepPatient';
import StepElements from './StepElements';
import StepFiles from './StepFiles';
import StepSummary from './StepSummary';

// Step Esclusivi Admin
import StepQuote from './StepQuote'; 
import DocumentPreview from '../docs/DocumentPreview';

export default function NewRequestWizard({ onCancel, onSubmit, onStepChange, initialData = null, mode = 'create' }) {
  const user = useAuthStore((state) => state.user);
  const isAdminUser = user?.role === 'admin';
  const isAdminProcess = mode === 'admin' || isAdminUser;

  const [step, setStep] = useState(1);

  // --- LOGICA DI INIZIALIZZAZIONE ---
  // Recupera i dati iniziali se stiamo validando, altrimenti usa default
  const getInitialState = (key, defaultVal) => {
      if (!initialData) return defaultVal;
      
      // Mappatura specifica per il form anagrafica
      if (key === 'formData') {
          return {
              // Se l'admin crea da zero, questi partono vuoti. Se valida, prende quelli della richiesta.
              // Se è il Dottore a creare, prende i suoi dati dal login.
              nomeDottore: initialData.nomeDottore || (!isAdminUser ? `${user?.nome} ${user?.cognome}` : ''),
              nomeStudio: initialData.nomeStudio || (!isAdminUser ? (user?.studio || '') : ''),
              
              nome: initialData.nome || '', 
              cognome: initialData.cognome || '', 
              codicePaziente: initialData.codicePaziente || '', 
              eta: initialData.eta || '', 
              sesso: initialData.sesso || 'M',
              allergie: initialData.allergie || false, 
              bruxismo: initialData.bruxismo || false, 
              disfunzioni: initialData.disfunzioni || false, 
              dispositivi: initialData.dispositivi || false, 
              handicap: initialData.handicap || false
          };
      }
      // Per gli altri oggetti (technicalInfo, dates, elements...) se esistono usali, altrimenti default
      return initialData[key] || defaultVal;
  };

  // --- STATI (Inizializzati Lazy) ---
  const [formData, setFormData] = useState(() => getInitialState('formData', {
    nomeDottore: !isAdminUser ? `${user?.nome} ${user?.cognome}` : '',
    nomeStudio: !isAdminUser ? (user?.studio || '') : '', 
    nome: '', cognome: '', codicePaziente: '', eta: '', sesso: 'M',
    allergie: false, bruxismo: false, disfunzioni: false, dispositivi: false, handicap: false
  }));

  const [technicalInfo, setTechnicalInfo] = useState(() => getInitialState('technicalInfo', {
    material: 'zirconio', color: 'A2', description: ''
  }));

  const [configuredElements, setConfiguredElements] = useState(() => getInitialState('elements', []));
  
  const [dates, setDates] = useState(() => getInitialState('dates', { 
    delivery: '', tryIn1: '', tryIn2: '', tryIn3: '' 
  }));

  const [files, setFiles] = useState([]); 
  const [photos, setPhotos] = useState([]); 
  const [impressionParams, setImpressionParams] = useState(() => getInitialState('impressionParams', { 
    material: '', disinfection: '' 
  }));

  // Stato preventivo (Solo Admin)
  const [quote, setQuote] = useState({ total: 0, details: {} });

  // Navigazione
  const next = () => setStep(s => s + 1);
  const back = () => setStep(s => s - 1);
  useEffect(() => { if (onStepChange) onStepChange(step); }, [step, onStepChange]);

  // Submit Finale
  const handleFinalSubmit = (actionType = 'submit') => {
    const fullData = {
      id: initialData?.id || `REQ-${Date.now()}`, // Mantiene ID se esiste, o ne crea uno
      ...formData,
      technicalInfo,
      elements: configuredElements,
      dates,
      impressionParams,
      quote: isAdminProcess ? quote : null,
      adminAction: actionType,
      status: actionType === 'send_to_doctor' ? 'waiting_signature' : 'approved',
      timestamp: new Date().toISOString()
    };
    onSubmit(fullData);
  };

  return (
    <div className="space-y-6">
      
      {/* Banner Contestuale per Admin */}
      {isAdminProcess && (
         <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 mb-6 text-blue-800 text-sm flex justify-between items-center">
            <div>
                <strong>{initialData ? 'Revisione Richiesta' : 'Nuova Lavorazione (Admin)'}</strong>
                <p className="text-xs opacity-70">
                    {initialData ? 'Modifica i dati ricevuti dal Dottore.' : 'Compila tutti i campi per creare una scheda tecnica.'}
                </p>
            </div>
            {initialData && <span className="bg-white px-2 py-1 rounded border text-xs font-mono">{initialData.id}</span>}
         </div>
      )}

      <AnimatePresence mode="wait">
        {/* Step 1: Anagrafica (Con campi extra per Admin) */}
        {step === 1 && (
            <StepPatient 
                key="step1" 
                formData={formData} setFormData={setFormData} 
                onNext={next} 
                isAdmin={isAdminProcess} 
            />
        )}
        
        {/* Step 2: Denti */}
        {step === 2 && (
            <StepElements 
             key="step2"
             configuredElements={configuredElements} setConfiguredElements={setConfiguredElements}
             technicalInfo={technicalInfo} setTechnicalInfo={setTechnicalInfo} 
             dates={dates} setDates={setDates}
             onBack={back} onNext={next}
             isAdmin={isAdminProcess}
           />
        )}

        {/* Step 3: File */}
        {step === 3 && (
           <StepFiles 
             key="step3" 
             files={files} setFiles={setFiles}
             photos={photos} setPhotos={setPhotos}
             impressionParams={impressionParams} setImpressionParams={setImpressionParams}
             onBack={back} onNext={next} 
           />
        )}

        {/* Step 4: Riepilogo (Ponte verso preventivo se Admin) */}
        {step === 4 && (
           <StepSummary 
             key="step4"
             formData={formData} configuredElements={configuredElements}
             technicalInfo={technicalInfo} dates={dates}
             files={files} photos={photos} impressionParams={impressionParams}
             onBack={back}
             onSubmit={isAdminProcess ? next : handleFinalSubmit} 
             mode={mode} 
           />
        )}

        {/* Step 5: Preventivo (Solo Admin) */}
        {isAdminProcess && step === 5 && (
            <StepQuote 
                key="step5"
                data={{ formData, technicalInfo, elements: configuredElements, dates }}
                quote={quote} setQuote={setQuote}
                onBack={back} onNext={next}
            />
        )}

        {/* Step 6: Documento Finale (Solo Admin) */}
        {isAdminProcess && step === 6 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="bg-neutral-100 p-4 rounded-xl border border-neutral-200 overflow-y-auto max-h-[600px] flex justify-center custom-scrollbar">
                    <DocumentPreview 
                        data={{ ...formData, id: initialData?.id || 'BOZZA', technicalInfo, elements: configuredElements, dates, nomeDottore: formData.nomeDottore }} 
                        quote={quote} 
                    />
                </div>
                <div className="flex justify-between pt-4 border-t">
                    <button onClick={back} className="px-4 py-2 text-neutral-500 hover:bg-neutral-100 rounded-lg">Indietro</button>
                    <div className="flex gap-3">
                         <button 
                            onClick={() => handleFinalSubmit('approve_internal')}
                            className="px-6 py-2 bg-green-100 text-green-700 font-bold rounded-lg hover:bg-green-200 border border-green-200 transition-colors"
                         >
                            Approva Internamente
                         </button>
                         <button 
                            onClick={() => handleFinalSubmit('send_to_doctor')}
                            className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary-dark shadow-lg shadow-primary/20 transition-all"
                         >
                            Invia al Dottore
                         </button>
                    </div>
                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}