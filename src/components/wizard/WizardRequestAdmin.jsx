import WizardCore from './WizardCore';

export default function WizardRequestAdmin({ onCancel, onSubmit, onStepChange, initialData = null }) {
  
  // SE C'È INITIAL DATA -> STIAMO VALIDANDO UNA RICHIESTA ESISTENTE
  const isValidationMode = !!initialData;

  // SEMPRE 6 STEP PER ADMIN (sia creazione che validazione)
  const stepsList = ['Paziente', 'Lavorazione', 'Files', 'Riepilogo', 'Preventivo', 'Approvazione'];

  return (
    <WizardCore 
        onCancel={onCancel}
        onSubmit={onSubmit}
        onStepChange={onStepChange}
        initialData={initialData}
        
        title={isValidationMode ? "Validazione Tecnica" : "Nuova Lavorazione"}
        
        // CONFIGURAZIONE ADMIN
        isAdmin={true}
        stepsList={stepsList}
        
        // Se validiamo, i dati dottore sono sola lettura. 
        // Se creiamo internamente, possiamo scriverli (nome dottore, studio, etc.)
        readOnlyDoctorData={isValidationMode} 
        
        // SEMPRE MOSTRA QUOTE E APPROVAL STEP
        showQuoteStep={true}
        showApprovalStep={true}
    />
  );
}