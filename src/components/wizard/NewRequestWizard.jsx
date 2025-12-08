// AGGIUNTO: useEffect nell'import
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../../store/authStore';

// IMPORT STEP WIZARD
import StepPatient from './StepPatient';
import StepElements from './StepElements';
import StepFiles from './StepFiles';
import StepSummary from './StepSummary';

// AGGIUNTO: onStepChange nelle props
export default function NewRequestWizard({ onCancel, onSubmit, onStepChange }) {
  const [step, setStep] = useState(1);
  const user = useAuthStore((state) => state.user);
  
  const isAdmin = user?.role === 'admin';
  const isDoctor = user?.role === 'dottore';

  // --- NUOVO: Sincronizzazione Step con la Dashboard ---
  useEffect(() => {
    // Se la dashboard ci ha passato la funzione, la chiamiamo
    if (onStepChange) {
      onStepChange(step);
    }
    // Opzionale: Scrolla in alto quando si cambia step per una UX migliore
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step, onStepChange]);

  // Stato Dati Anagrafici
  const [formData, setFormData] = useState({
    nomeDottore: isDoctor ? `${user.nome} ${user.cognome}` : '',
    nomeStudio: isDoctor ? (user.studio || '') : '', 
    nome: '', cognome: '', codicePaziente: '', eta: '', sesso: 'M',
    allergie: false, bruxismo: false, disfunzioni: false, dispositivi: false, handicap: false
  });

  // Stato Dati Tecnici
  const [technicalInfo, setTechnicalInfo] = useState({
    material: 'zirconio',
    color: 'A2',
    description: ''
  });

  // Stato Elementi Protesici
  const [configuredElements, setConfiguredElements] = useState([]); 
  
  // Stato Date
  const [dates, setDates] = useState({ delivery: '', tryIn1: '', tryIn2: '', tryIn3: '' });

  // Stato File e Parametri Impronta
  const [files, setFiles] = useState([]); 
  const [photos, setPhotos] = useState([]); 
  const [impressionParams, setImpressionParams] = useState({
    material: '',
    disinfection: ''
  });

  const next = () => setStep(s => s + 1);
  const back = () => setStep(s => s - 1);

  // --- LOGICA DI INVIO ---
  const handleFinalSubmit = () => {
    
    // 1. Costruiamo l'oggetto completo
    const fullRequestData = {
      id: Date.now(),
      ...formData,
      technicalInfo: technicalInfo, 
      elements: configuredElements,
      dates: dates,
      impressionParams: impressionParams,
      filesMetadata: files.map(f => ({ name: f.name, size: f.size })),
      photosMetadata: photos.map(f => ({ name: f.name, size: f.size })),
      createdBy: user.id,
      createdRole: user.role,
      studioReference: user.studio,
      status: 'new',
      timestamp: new Date().toISOString()
    };

    // 2. Creiamo il messaggio per la Inbox Admin (Simulazione)
    const adminMessage = {
      id: fullRequestData.id,
      from: `${formData.nomeDottore}`,
      subject: `Nuova Prescrizione: ${formData.cognome} ${formData.nome}`,
      date: new Date().toISOString(),
      read: false,
      preview: `Paziente: ${formData.cognome} • ${technicalInfo.material} • ${configuredElements.length} elementi`,
      fullData: fullRequestData,
      doctorInfo: {
        name: user.nome,
        surname: user.cognome,
        studio: user.studio
      }
    };

    // 3. Salvataggio in LocalStorage
    const existingInbox = JSON.parse(localStorage.getItem('mimesi_admin_inbox') || '[]');
    const updatedInbox = [adminMessage, ...existingInbox];
    localStorage.setItem('mimesi_admin_inbox', JSON.stringify(updatedInbox));

    // 4. Feedback e Chiusura
    console.log("Richiesta Inviata:", fullRequestData);
    onSubmit(fullRequestData); 
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER RIMOSSO QUI: Ora è gestito dalla Dashboard in alto a destra */}
      
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
             technicalInfo={technicalInfo} 
             setTechnicalInfo={setTechnicalInfo} 
             dates={dates}
             setDates={setDates}
             onBack={back}
             onNext={next}
             isAdmin={isAdmin}
           />
        )}

        {step === 3 && (
           <StepFiles 
             key="step3" 
             files={files} setFiles={setFiles}
             photos={photos} setPhotos={setPhotos}
             impressionParams={impressionParams} setImpressionParams={setImpressionParams}
             onBack={back} 
             onNext={next} 
           />
        )}

        {step === 4 && (
           <StepSummary 
             key="step4"
             formData={formData}
             configuredElements={configuredElements}
             technicalInfo={technicalInfo} 
             dates={dates}
             files={files}
             photos={photos}
             impressionParams={impressionParams}
             onBack={back}
             onSubmit={handleFinalSubmit}
           />
        )}
      </AnimatePresence>
    </div>
  );
}