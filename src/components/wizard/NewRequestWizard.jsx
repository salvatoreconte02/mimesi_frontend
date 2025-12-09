import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../../store/authStore';

import StepPatient from './StepPatient';
import StepElements from './StepElements';
import StepFiles from './StepFiles';
import StepSummary from './StepSummary';
import StepQuote from './StepQuote'; 
import DocumentPreview from '../documents/DocumentPreview';

export default function NewRequestWizard({ onCancel, onSubmit, onStepChange, initialData = null, mode = 'create' }) {
  const user = useAuthStore((state) => state.user);
  const isAdminUser = user?.role === 'admin';
  const isAdminProcess = mode === 'admin' || isAdminUser;

  const [step, setStep] = useState(1);

  // --- DEEP COPY E INIZIALIZZAZIONE ---
  // Cloniamo initialData per evitare che le modifiche in memoria "sporchino" l'oggetto originale se si annulla.
  const safeInitialData = initialData ? JSON.parse(JSON.stringify(initialData)) : null;

  const getInitialState = (key, defaultVal) => {
      if (!safeInitialData) return defaultVal;
      
      if (key === 'formData') {
          return {
              nomeDottore: safeInitialData.nomeDottore || (!isAdminUser ? user?.nome : ''),
              cognomeDottore: safeInitialData.cognomeDottore || (!isAdminUser ? user?.cognome : ''),
              nomeStudio: safeInitialData.nomeStudio || (!isAdminUser ? (user?.studio || '') : ''),
              
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
    nomeDottore: !isAdminUser ? user?.nome : '',
    cognomeDottore: !isAdminUser ? user?.cognome : '',
    nomeStudio: !isAdminUser ? (user?.studio || '') : '', 
    nome: '', cognome: '', codicePaziente: '', eta: '', sesso: 'M',
    allergie: false, bruxismo: false, disfunzioni: false, dispositivi: false, handicap: false
  }));

  const [technicalInfo, setTechnicalInfo] = useState(() => getInitialState('technicalInfo', {
    material: 'zirconio', color: 'A2', description: ''
  }));

  const [configuredElements, setConfiguredElements] = useState(() => getInitialState('elements', []));
  const [dates, setDates] = useState(() => getInitialState('dates', { delivery: '', tryIn1: '', tryIn2: '', tryIn3: '' }));
  
  // STATO FILE: Qui teniamo i file veri (Blob) per l'anteprima UI
  // Se stiamo modificando (Admin), initialData potrebbe avere solo i metadati (array di oggetti semplici).
  // Quindi inizializziamo con quelli se ci sono.
  const [files, setFiles] = useState(() => safeInitialData?.filesMetadata || []); 
  const [photos, setPhotos] = useState(() => safeInitialData?.photosMetadata || []); 

  const [impressionParams, setImpressionParams] = useState(() => getInitialState('impressionParams', { material: '', disinfection: '' }));
  const [quote, setQuote] = useState({ total: 0, details: {} });

  const next = () => setStep(s => s + 1);
  const back = () => setStep(s => s - 1);
  useEffect(() => { if (onStepChange) onStepChange(step); }, [step, onStepChange]);

  // --- SUBMIT ---
  const handleFinalSubmit = (actionType = 'submit') => {
    
    // VALIDAZIONE: Assicura che actionType sia una stringa (non un evento DOM!)
    const safeActionType = typeof actionType === 'string' ? actionType : 'submit';
    
    // TRASFORMAZIONE FILE -> METADATI
    // Simuliamo l'upload: teniamo solo nome e dimensione per salvare nel JSON
    // Se "files" contiene oggetti File (dal Dottore), li mappiamo.
    // Se contiene già oggetti (dall'Admin che non li ha toccati), restano tali.
    const filesMetadata = files.map(f => ({
        name: f.name,
        size: f.size || 0, // Fallback se è già un mock
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
      // Salviamo SOLO i metadati, non i blob!
      filesMetadata, 
      photosMetadata,
      
      quote: isAdminProcess ? quote : null,
      adminAction: safeActionType, // Usa la versione validata
      status: safeActionType === 'send_to_doctor' ? 'waiting_signature' : 'approved',
      timestamp: new Date().toISOString()
    };
    
    onSubmit(fullData);
  };

  return (
    <div className="space-y-6">
      {isAdminProcess && (
         <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 mb-6 text-blue-800 text-sm flex justify-between items-center">
            <div>
                <strong>{safeInitialData ? 'Revisione Richiesta' : 'Nuova Lavorazione (Admin)'}</strong>
                <p className="text-xs opacity-70">
                    {safeInitialData ? 'Modifica i dati. Le modifiche saranno evidenziate.' : 'Crea una nuova scheda tecnica.'}
                </p>
            </div>
            {safeInitialData && <span className="bg-white px-2 py-1 rounded border text-xs font-mono">{safeInitialData.id}</span>}
         </div>
      )}

      <AnimatePresence mode="wait">
        {step === 1 && (
            <StepPatient 
                key="step1" 
                formData={formData} setFormData={setFormData} 
                onNext={next} 
                isAdmin={isAdminProcess}
                // Passiamo i dati originali per fare il confronto (diffing)
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
             isAdmin={isAdminProcess}
           />
        )}

        {/* Step 3: Files (Ora gestisce mock e file reali) */}
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

        {isAdminProcess && step === 5 && (
            <StepQuote 
                key="step5"
                data={{ formData, technicalInfo, elements: configuredElements, dates }}
                quote={quote} setQuote={setQuote}
                onBack={back} onNext={next}
            />
        )}

        {isAdminProcess && step === 6 && (
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
  );
}