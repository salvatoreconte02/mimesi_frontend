import WizardCore from './WizardCore';

export default function WizardRequestAdmin({ onCancel, onSubmit, onStepChange, initialData = null }) {
  
  // SE C'È INITIAL DATA -> STIAMO VALIDANDO UNA RICHIESTA ESISTENTE
  const isValidationMode = !!initialData;

  const stepsList = isValidationMode 
      ? ['Paziente', 'Lavorazione', 'Files', 'Riepilogo', 'Preventivo', 'Approvazione']
      : ['Paziente', 'Lavorazione', 'Files', 'Riepilogo'];

  return (
    <WizardCore 
        onCancel={onCancel}
        onSubmit={onSubmit}
        onStepChange={onStepChange}
        initialData={initialData}
        
        title={isValidationMode ? "Validazione Tecnica" : "Nuova Lavorazione Interna"}
        
        // CONFIGURAZIONE ADMIN
        isAdmin={true}
        stepsList={stepsList}
        
        // IL PUNTO CRUCIALE: Se validiamo, i dati dottore sono sola lettura. 
        // Se creiamo internamente, possiamo scriverli.
        readOnlyDoctorData={isValidationMode} 
        
        showQuoteStep={isValidationMode}
        showApprovalStep={isValidationMode}
    />
  );
}