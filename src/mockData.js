// Mock data initialization for demo purposes
export const initializeMockData = () => {
  // Inizializza gli array vuoti se non esistono
  // NON pre-popola più con dati fittizi per evitare conflitti

  const existingLavorazioni = localStorage.getItem('mimesi_all_lavorazioni');
  const existingDoctorInbox = localStorage.getItem('mimesi_doctor_inbox');
  const existingAdminInbox = localStorage.getItem('mimesi_admin_inbox');

  // Inizializza Lavorazioni come array vuoto se non esiste
  if (!existingLavorazioni) {
    localStorage.setItem('mimesi_all_lavorazioni', JSON.stringify([]));
    console.log('✅ Lavorazioni storage initialized (empty)');
  }

  // Inizializza Doctor Inbox come array vuoto se non esiste
  if (!existingDoctorInbox) {
    localStorage.setItem('mimesi_doctor_inbox', JSON.stringify([]));
    console.log('✅ Doctor inbox storage initialized (empty)');
  }

  // Inizializza Admin Inbox come array vuoto se non esiste
  if (!existingAdminInbox) {
    localStorage.setItem('mimesi_admin_inbox', JSON.stringify([]));
    console.log('✅ Admin inbox storage initialized (empty)');
  }
};

// Utility per resettare tutti i dati (utile per debug/testing)
export const resetAllData = () => {
  localStorage.removeItem('mimesi_all_lavorazioni');
  localStorage.removeItem('mimesi_doctor_inbox');
  localStorage.removeItem('mimesi_admin_inbox');
  initializeMockData();
  console.log('🔄 All data has been reset');
};