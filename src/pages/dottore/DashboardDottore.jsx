import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, FileText, Upload, Clock, CheckCircle, 
  XCircle, AlertCircle, Calendar, Save, Eye 
} from 'lucide-react';
import Card from '../../components/ui/Card'; // Assicurati che il percorso sia corretto
import Button from '../../components/ui/Button'; // Assicurati che il percorso sia corretto

// --- SOTTO-COMPONENTI SPECIFICI PER IL DOTTORE ---

// 1. FORM NUOVA RICHIESTA (MPO Digitale)
const NuovaRichiesta = ({ onCancel, onSubmit }) => {
  const [step, setStep] = useState(1);
  
  return (
    <div className="space-y-6">
      {/* HEADER WIZARD CON PROGRESSO */}
      <div className="flex items-center justify-between mb-6">
        <div>
           <h2 className="text-2xl font-bold text-primary">Nuova Prescrizione (MPO)</h2>
           <p className="text-sm text-neutral-500">Compila i dati per inviare la richiesta</p>
        </div>
        <div className="flex gap-2">
          <span className={`px-3 py-1 rounded-full text-sm transition-colors ${step === 1 ? 'bg-primary text-white font-medium' : 'bg-neutral-100 text-neutral-500'}`}>1. Paziente</span>
          <span className={`px-3 py-1 rounded-full text-sm transition-colors ${step === 2 ? 'bg-primary text-white font-medium' : 'bg-neutral-100 text-neutral-500'}`}>2. Dispositivo</span>
          <span className={`px-3 py-1 rounded-full text-sm transition-colors ${step === 3 ? 'bg-primary text-white font-medium' : 'bg-neutral-100 text-neutral-500'}`}>3. File</span>
        </div>
      </div>

      {/* STEP 1: Dati Paziente */}
      {step === 1 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-600 mb-1">Nome Paziente *</label>
              <input type="text" className="w-full p-2 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-primary/20 outline-none" placeholder="Nome" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-600 mb-1">Cognome Paziente *</label>
              <input type="text" className="w-full p-2 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-primary/20 outline-none" placeholder="Cognome" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-600 mb-1">Codice Fiscale / ID</label>
              <input type="text" className="w-full p-2 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-primary/20 outline-none" placeholder="Codice univoco" />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-neutral-600 mb-1">Età</label>
                  <input type="number" className="w-full p-2 rounded-lg border border-neutral-200 outline-none" />
               </div>
               <div>
                  <label className="block text-sm font-medium text-neutral-600 mb-1">Sesso</label>
                  <select className="w-full p-2 rounded-lg border border-neutral-200 outline-none bg-white">
                    <option>M</option>
                    <option>F</option>
                  </select>
               </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-600 mb-1">Condizioni Cliniche Rilevanti</label>
            <textarea className="w-full p-2 rounded-lg border border-neutral-200 h-20 outline-none" placeholder="Es. Bruxismo, allergie, disfunzioni articolari..." />
          </div>
          
          {/* FOOTER STEP 1: Solo Annulla e Avanti */}
          <div className="flex justify-between mt-6 pt-4 border-t border-neutral-100">
            <Button variant="ghost" onClick={onCancel} className="text-neutral-500">Annulla</Button>
            <Button onClick={() => setStep(2)}>Avanti →</Button>
          </div>
        </motion.div>
      )}

      {/* STEP 2: Specifiche Dispositivo */}
      {step === 2 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            
            {/* TIPO DISPOSITIVO */}
            <div>
              <label className="block text-sm font-medium text-neutral-600 mb-1">Tipo Dispositivo *</label>
              <select className="w-full p-2 rounded-lg border border-neutral-200 outline-none bg-white">
                <option value="">Seleziona tipo...</option>
                <option value="corona">Corona Singola</option>
                <option value="ponte">Ponte</option>
                <option value="protesi_mobile">Protesi Mobile</option>
                <option value="faccetta">Faccetta</option>
                <option value="bite">Bite</option>
                <option value="altro">Altro</option>
              </select>
            </div>

            {/* MATERIALE */}
            <div>
              <label className="block text-sm font-medium text-neutral-600 mb-1">Materiale *</label>
              <select className="w-full p-2 rounded-lg border border-neutral-200 outline-none bg-white">
                <option value="">Seleziona materiale...</option>
                <option value="zirconio">Zirconio</option>
                <option value="disilicato">Disilicato di Litio</option>
                <option value="metallo_ceramica">Metallo-Ceramica</option>
                <option value="pmma">PMMA (Provvisorio)</option>
                <option value="resina">Resina</option>
                <option value="composito">Composito</option>
              </select>
            </div>

            {/* COLORE (SCALA VITA) */}
            <div>
              <label className="block text-sm font-medium text-neutral-600 mb-1">Colore (Scala Vita) *</label>
              <select className="w-full p-2 rounded-lg border border-neutral-200 outline-none bg-white">
                <option value="">Seleziona colore...</option>
                <optgroup label="Gruppo A (Marrone-Rossiccio)">
                  <option value="A1">A1</option>
                  <option value="A2">A2</option>
                  <option value="A3">A3</option>
                  <option value="A3.5">A3.5</option>
                  <option value="A4">A4</option>
                </optgroup>
                <optgroup label="Gruppo B (Giallo-Rossiccio)">
                  <option value="B1">B1</option>
                  <option value="B2">B2</option>
                  <option value="B3">B3</option>
                  <option value="B4">B4</option>
                </optgroup>
                <optgroup label="Gruppo C (Grigio)">
                  <option value="C1">C1</option>
                  <option value="C2">C2</option>
                  <option value="C3">C3</option>
                  <option value="C4">C4</option>
                </optgroup>
                <optgroup label="Gruppo D (Grigio-Rossiccio)">
                  <option value="D2">D2</option>
                  <option value="D3">D3</option>
                  <option value="D4">D4</option>
                </optgroup>
                <optgroup label="Bleach (Sbiancati)">
                  <option value="BL1">BL1</option>
                  <option value="BL2">BL2</option>
                  <option value="BL3">BL3</option>
                  <option value="BL4">BL4</option>
                </optgroup>
              </select>
            </div>

            {/* DATA CONSEGNA */}
            <div>
              <label className="block text-sm font-medium text-neutral-600 mb-1">Data Consegna Richiesta *</label>
              <input type="date" className="w-full p-2 rounded-lg border border-neutral-200 outline-none" />
            </div>
          </div>
          
          {/* SEZIONE PROVE INTERMEDIE */}
          <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200">
             <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-sm text-primary">Prove Intermedie (Facoltativo)</h4>
                <span className="text-xs text-neutral-400">Pianifica le date se necessarie</span>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                   <label className="text-xs text-neutral-500 mb-1 block">Prima Prova</label>
                   <input type="date" className="w-full p-2 text-sm border border-neutral-200 rounded outline-none" />
                </div>
                <div>
                   <label className="text-xs text-neutral-500 mb-1 block">Seconda Prova</label>
                   <input type="date" className="w-full p-2 text-sm border border-neutral-200 rounded outline-none" />
                </div>
                <div>
                   <label className="text-xs text-neutral-500 mb-1 block">Terza Prova</label>
                   <input type="date" className="w-full p-2 text-sm border border-neutral-200 rounded outline-none" />
                </div>
             </div>
          </div>

          {/* FOOTER STEP 2: Indietro e Avanti */}
          <div className="flex justify-between mt-6 pt-4 border-t border-neutral-100">
            <Button variant="ghost" onClick={() => setStep(1)}>← Indietro</Button>
            <Button onClick={() => setStep(3)}>Avanti →</Button>
          </div>
        </motion.div>
      )}

      {/* STEP 3: Upload File */}
      {step === 3 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
          <div className="border-2 border-dashed border-primary/30 rounded-2xl p-8 text-center bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer group">
            <Upload className="mx-auto h-12 w-12 text-primary mb-4 group-hover:scale-110 transition-transform" />
            <p className="font-medium text-neutral-700">Trascina qui i file STL/PLY delle impronte</p>
            <p className="text-sm text-neutral-500 mt-2">o clicca per selezionare dal dispositivo</p>
          </div>

          <div className="border-2 border-dashed border-neutral-200 rounded-2xl p-6 text-center hover:bg-neutral-50 transition-colors cursor-pointer">
            <p className="text-sm text-neutral-500">Allegati fotografici (JPG, PNG) [Facoltativo]</p>
          </div>
          
          <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100 flex gap-3 items-start">
             <div className="mt-1 min-w-[20px]"><span className="text-yellow-600">ℹ️</span></div>
             <p className="text-sm text-yellow-800">
               Cliccando "Invia" confermi che i dati inseriti sono corretti. L'amministrazione validerà la richiesta e genererà il preventivo.
             </p>
          </div>

          {/* FOOTER STEP 3: Indietro e Invia */}
          <div className="flex justify-between mt-6 pt-4 border-t border-neutral-100">
            <Button variant="ghost" onClick={() => setStep(2)}>← Indietro</Button>
            <Button variant="gradient" onClick={onSubmit} className="shadow-lg shadow-primary/20">
               Invia Richiesta al Laboratorio
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

// 2. LISTA PREVENTIVI DA FIRMARE [cite: 79, 558]
const PreventiviDaFirmare = () => {
  const [showOtp, setShowOtp] = useState(null); // ID del preventivo in firma

  const handleSign = (id) => {
    // Simulazione invio OTP [cite: 577]
    alert(`Codice OTP inviato alla tua email.`);
    setShowOtp(id);
  };

  const confirmSign = (id) => {
    // Simulazione verifica OTP e Firma [cite: 579]
    alert("Documento firmato digitalmente con successo! La lavorazione è stata avviata.");
    setShowOtp(null);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-neutral-800 mb-4">Documenti in attesa di firma</h3>
      
      {/* Card Preventivo Esempio */}
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

// 3. DASHBOARD PRINCIPALE
export default function DashboardDottore() {
  const [view, setView] = useState('dashboard'); // 'dashboard', 'new-request', 'quotes'

  return (
    <div className="p-8 max-w-[1400px] mx-auto min-h-screen">
      
      {/* HEADER E AZIONI RAPIDE */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-800">Il mio Studio</h1>
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
             <Button variant="ghost" onClick={() => setView('dashboard')} className="mb-4">← Torna alla Dashboard</Button>
             <PreventiviDaFirmare />
          </motion.div>
        )}

        {/* VISTA: DASHBOARD (Default) */}
        {view === 'dashboard' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
            
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

            {/* Lista Lavorazioni Attive  */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-bold text-neutral-800 text-lg">Lavorazioni Attive</h3>
                
                {/* Esempio Card Lavorazione */}
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