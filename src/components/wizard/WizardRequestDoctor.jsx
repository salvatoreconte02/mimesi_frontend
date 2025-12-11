import WizardCore from './WizardCore';

export default function WizardRequestDoctor({ onCancel, onSubmit, onStepChange }) {
  return (
    <WizardCore 
        onCancel={onCancel}
        onSubmit={onSubmit}
        onStepChange={onStepChange}
        title="Nuova Prescrizione"
        // CONFIGURAZIONE DOTTORE
        isAdmin={false}
        stepsList={['Paziente', 'Lavorazione', 'Files', 'Riepilogo']}
        readOnlyDoctorData={false} // Il dottore non vede proprio i campi input admin, ma per sicurezza false
        showQuoteStep={false}
        showApprovalStep={false}
    />
  );
}