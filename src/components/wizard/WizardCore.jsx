import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import useAuthStore from '../../store/authStore';

import StepPatient from './StepPatient';
import StepElements from './StepElements';
import StepFiles from './StepFiles';
import StepSummary from './StepSummary';
import StepQuote from './StepQuote'; 
import DocumentPreview from '../documents/DocumentPreview';

// COMPONENTE "MOTORE" - Gestisce stato e navigazione, ma è configurato dall'esterno
export default function WizardCore({ 
    onCancel, 
    onSubmit, 
    onStepChange, 
    initialData = null, 
    
    // Props di configurazione
    stepsList = ['Paziente', 'Lavorazione', 'Files', 'Riepilogo'],
    isAdmin = false,
    readOnlyDoctorData = false,
    showQuoteStep = false,
    showApprovalStep = false,
    title = "Nuova Prescrizione"
}) {
  const user = useAuthStore((state) => state.user);
  const [step, setStep] = useState(1);
  const currentStepLabel = stepsList[step - 1];

  // --- STATO ---
  // Cloniamo i dati iniziali per averli come riferimento "originale" per il confronto (Diff)
  const safeInitialData = initialData ? JSON.parse(JSON.stringify(initialData)) : null;

  const getInitialState = (key, defaultVal) => {
      if (!safeInitialData) return defaultVal;
      
      if (key === 'formData') {
          return {
              nomeDottore: safeInitialData.nomeDottore || (!isAdmin ? user?.nome : ''),
              cognomeDottore: safeInitialData.cognomeDottore || (!isAdmin ? user?.cognome : ''),
              nomeStudio: safeInitialData.nomeStudio || (!isAdmin ? (user?.studio || '') : ''),
              
              nome: safeInitialData.nome || '', 
              cognome: safeInitialData.cognome || '', 
              codicePaziente: safeInitialData.codicePaziente || '', 
              eta: safeInitialData.eta || '', 
              sesso: safeInitialData.sesso || 'M',
              allergie: safeInitialData.allergie || false, 
              bruxismo: safeInitialData.bruxismo || false, 
              disfunzioni: safeInitialData.disfunzioni || false, 
              dispositivi: safeInitialData.dispositivi || false, 
              handicap: safeInitialData.handicap || false
          };
      }
      return safeInitialData[key] || defaultVal;
  };

  const [formData, setFormData] = useState(() => getInitialState('formData', {
    nomeDottore: !isAdmin ? user?.nome : '',
    cognomeDottore: !isAdmin ? user?.cognome : '',
    nomeStudio: !isAdmin ? (user?.studio || '') : '', 
    nome: '', cognome: '', codicePaziente: '', eta: '', sesso: 'M',
    allergie: false, bruxismo: false, disfunzioni: false, dispositivi: false, handicap: false
  }));

  const [technicalInfo, setTechnicalInfo] = useState(() => getInitialState('technicalInfo', {
    material: 'zirconio', color: 'A2', description: ''
  }));

  const [configuredElements, setConfiguredElements] = useState(() => getInitialState('elements', []));
  const [dates, setDates] = useState(() => getInitialState('dates', { delivery: '', tryIn1: '', tryIn2: '', tryIn3: '' }));
  const [files, setFiles] = useState(() => safeInitialData?.filesMetadata || []); 
  const [photos, setPhotos] = useState(() => safeInitialData?.photosMetadata || []); 
  const [impressionParams, setImpressionParams] = useState(() => getInitialState('impressionParams', { material: '', disinfection: '' }));
  const [quote, setQuote] = useState({ total: 0, details: {} });

  const next = () => setStep(s => s + 1);
  const back = () => setStep(s => s - 1);
  useEffect(() => { if (onStepChange) onStepChange(step); }, [step, onStepChange]);

  // --- SUBMIT ---
  const handleFinalSubmit = (actionType = 'submit') => {
    const safeActionType = typeof actionType === 'string' ? actionType : 'submit';
    
    const filesMetadata = files.map(f => ({
        name: f.name,
        size: f.size || 0,
        type: f.type || 'application/unknown'
    }));

    const photosMetadata = photos.map(p => ({
        name: p.name,
        size: p.size || 0
    }));

    const fullData = {
      id: safeInitialData?.id || `REQ-${Date.now()}`,
      ...formData,
      technicalInfo,
      elements: configuredElements,
      dates,
      impressionParams,
      filesMetadata, 
      photosMetadata,
      quote: showQuoteStep ? quote : null, 
      adminAction: safeActionType,
      status: safeActionType === 'send_to_doctor' ? 'waiting_signature' : 'approved',
      timestamp: new Date().toISOString()
    };
    
    onSubmit(fullData);
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-neutral-200 overflow-hidden flex flex-col min-h-[600px]">
      
      {/* HEADER WIZARD */}
      <div className="px-8 py-6 border-b border-neutral-100 flex justify-between items-center bg-white sticky top-0 z-20">
        <div>
           <h2 className="text-2xl font-bold text-neutral-800">{title}</h2>
           <p className="text-sm text-neutral-500 mt-1">
             Step {step} di {stepsList.length}: <span className="font-bold text-primary">{currentStepLabel}</span>
           </p>
        </div>

        <div className="flex items-center gap-6">
           <div className="flex items-center gap-2">
              {stepsList.map((_, idx) => {
                 const stepNum = idx + 1;
                 const isActive = stepNum === step;
                 const isCompleted = stepNum < step;

                 return (
                   <div key={idx} className="flex items-center">
                      <div className={`
                         w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
                         ${isActive ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/30' : 
                           isCompleted ? 'bg-green-100 text-green-600' : 'bg-neutral-100 text-neutral-400'}
                      `}>
                         {isCompleted ? <Check size={14}/> : stepNum}
                      </div>
                      {idx < stepsList.length - 1 && (
                        <div className={`w-6 h-0.5 mx-1 ${isCompleted ? 'bg-green-100' : 'bg-neutral-100'}`} />
                      )}
                   </div>
                 );
              })}
           </div>

           <button onClick={onCancel} className="p-2 hover:bg-neutral-100 rounded-full text-neutral-400 transition-colors">
              <X size={24} />
           </button>
        </div>
      </div>

      {/* BODY WIZARD */}
      <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">
        {isAdmin && safeInitialData && (
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 mb-6 text-blue-800 text-sm flex justify-between items-center">
                <div>
                    <strong>Revisione Richiesta {safeInitialData.id}</strong>
                    <p className="text-xs opacity-70">Le modifiche rispetto ai dati originali verranno evidenziate in arancione.</p>
                </div>
            </div>
        )}

        <AnimatePresence mode="wait">
            {step === 1 && (
                <StepPatient 
                    key="step1" 
                    formData={formData} setFormData={setFormData} 
                    onNext={next} 
                    isAdmin={isAdmin}
                    readOnlyDoctorData={readOnlyDoctorData} 
                    originalData={safeInitialData} 
                />
            )}
            
            {step === 2 && (
                <StepElements 
                    key="step2"
                    configuredElements={configuredElements} setConfiguredElements={setConfiguredElements}
                    technicalInfo={technicalInfo} setTechnicalInfo={setTechnicalInfo} 
                    dates={dates} setDates={setDates}
                    onBack={back} onNext={next}
                    isAdmin={isAdmin}
                    originalData={safeInitialData} // PASSATO
                />
            )}

            {step === 3 && (
                <StepFiles 
                    key="step3" 
                    files={files} setFiles={setFiles}
                    photos={photos} setPhotos={setPhotos}
                    impressionParams={impressionParams} setImpressionParams={setImpressionParams}
                    onBack={back} onNext={next} 
                    isAdmin={isAdmin} // PASSATO
                    originalData={safeInitialData} // PASSATO
                />
            )}

            {step === 4 && (
                <StepSummary 
                    key="step4"
                    formData={formData} configuredElements={configuredElements}
                    technicalInfo={technicalInfo} dates={dates}
                    files={files} photos={photos} impressionParams={impressionParams}
                    onBack={back}
                    onSubmit={showQuoteStep ? next : handleFinalSubmit} 
                    originalData={safeInitialData} // PASSATO
                />
            )}

            {showQuoteStep && step === 5 && (
                <StepQuote 
                    key="step5"
                    data={{ formData, technicalInfo, elements: configuredElements, dates }}
                    quote={quote} setQuote={setQuote}
                    onBack={back} onNext={next}
                />
            )}

            {showApprovalStep && step === 6 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    <div className="bg-neutral-100 p-4 rounded-xl border border-neutral-200 overflow-y-auto max-h-[600px] flex justify-center custom-scrollbar">
                        <DocumentPreview 
                            data={{ ...formData, id: safeInitialData?.id || 'BOZZA', technicalInfo, elements: configuredElements, dates, nomeDottore: formData.nomeDottore }} 
                            quote={quote} 
                        />
                    </div>
                    <div className="flex justify-between pt-4 border-t">
                        <button onClick={back} className="px-4 py-2 text-neutral-500 hover:bg-neutral-100 rounded-lg">Indietro</button>
                        <div className="flex gap-3">
                            <button onClick={() => handleFinalSubmit('approve_internal')} className="px-6 py-2 bg-green-100 text-green-700 font-bold rounded-lg hover:bg-green-200 border border-green-200">Approva Internamente</button>
                            <button onClick={() => handleFinalSubmit('send_to_doctor')} className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary-dark shadow-lg shadow-primary/20">Invia al Dottore</button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
      </div>
    </div>
  );
}