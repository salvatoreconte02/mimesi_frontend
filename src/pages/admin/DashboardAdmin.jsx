import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Trash2, User, FileText, Bell, Download, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

// IMPORT NUOVI COMPONENTI
import RiepilogoScheda from './RiepilogoScheda'; // <--- IL FILE APPENA CREATO
import NewRequestWizard from '../../components/wizard/NewRequestWizard'; // <--- IL WIZARD RIUTILIZZATO

export default function DashboardAdmin() {
  const [inbox, setInbox] = useState([]);
  const [selectedMsg, setSelectedMsg] = useState(null);
  
  // STATO MODALITÀ: false = Inbox, true = Wizard Validazione
  const [isProcessing, setIsProcessing] = useState(false);

  // Caricamento Dati
  useEffect(() => {
    const storedData = localStorage.getItem('mimesi_admin_inbox');
    if (storedData) setInbox(JSON.parse(storedData));
  }, [isProcessing]);

  // Gestione Selezione
  const handleSelectMessage = (msg) => {
    setSelectedMsg(msg);
    if (!msg.read) {
      const updatedInbox = inbox.map(m => m.id === msg.id ? { ...m, read: true } : m);
      setInbox(updatedInbox);
      localStorage.setItem('mimesi_admin_inbox', JSON.stringify(updatedInbox));
    }
  };

  // Gestione Cancellazione
  const handleDelete = (id, e) => {
    e?.stopPropagation(); 
    const updatedInbox = inbox.filter(m => m.id !== id);
    setInbox(updatedInbox);
    if (selectedMsg?.id === id) setSelectedMsg(null);
    localStorage.setItem('mimesi_admin_inbox', JSON.stringify(updatedInbox));
  };

  // Callback quando il Wizard finisce (Inviato o Approvato)
  const handleWizardSubmit = (finalData) => {
    console.log("Processo Admin Completato:", finalData);
    
    if (finalData.adminAction === 'send_to_doctor') {
        const msgForDoctor = {
          id: Date.now(),
          from: 'Amministrazione',
          subject: `Preventivo da Firmare: ${finalData.cognome}`,
          preview: `Importo: € ${finalData.quote.total}. Si prega di firmare.`,
          date: new Date().toLocaleDateString(),
          read: false,
          type: 'quote',
          tag: 'Preventivo',
          fullData: finalData
        };
        const currentInbox = JSON.parse(localStorage.getItem('mimesi_doctor_inbox') || '[]');
        localStorage.setItem('mimesi_doctor_inbox', JSON.stringify([msgForDoctor, ...currentInbox]));
        alert("Preventivo inviato al Dottore!");
    } else {
        alert("Lavorazione approvata internamente!");
    }

    handleDelete(selectedMsg.id);
    setIsProcessing(false);
    setSelectedMsg(null);
  };

  const unreadCount = inbox.filter(m => !m.read).length;

  return (
    <div className="p-8 max-w-[1600px] mx-auto min-h-screen bg-neutral-50">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-800">Admin Console</h1>
          <p className="text-neutral-500">Gestione flussi e richieste in arrivo</p>
        </div>
        {!isProcessing && (
           <div className="flex gap-4">
             <Card className="px-4 py-2 flex items-center gap-3 bg-white border-neutral-200 shadow-sm">
                <div className="relative">
                  <Bell className="text-neutral-400" size={20} />
                  {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-3 h-3 bg-error rounded-full animate-pulse" />}
                </div>
                <span className="font-bold text-neutral-700">{unreadCount} Nuove Richieste</span>
             </Card>
           </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        
        {/* --- SCENARIO 1: WIZARD DI VALIDAZIONE (Editing) --- */}
        {isProcessing && selectedMsg ? (
           <motion.div 
             key="wizard-mode"
             initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
             className="bg-white rounded-3xl p-8 shadow-xl border border-neutral-100"
           >
              <div className="mb-6 flex items-center justify-between border-b border-neutral-100 pb-4">
                  <Button variant="ghost" onClick={() => setIsProcessing(false)}>
                      <ArrowLeft size={18} className="mr-2"/> Annulla Validazione
                  </Button>
                  <h2 className="text-xl font-bold text-neutral-800">Validazione Tecnica & Preventivazione</h2>
              </div>
              
              {/* QUI USIAMO IL WIZARD RIUTILIZZATO */}
              <NewRequestWizard 
                 mode="admin"
                 initialData={selectedMsg.fullData} 
                 onCancel={() => setIsProcessing(false)}
                 onSubmit={handleWizardSubmit}
              />
           </motion.div>
        ) : (
           
           /* --- SCENARIO 2: INBOX & RIEPILOGO (Sola Lettura) --- */
           <motion.div 
             key="inbox-mode"
             initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
             className="grid grid-cols-12 gap-6 h-[calc(100vh-180px)]"
           >
              {/* LISTA MESSAGGI (SX) */}
              <div className="col-span-4 bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 border-b border-neutral-100 bg-neutral-50/50">
                  <h3 className="font-bold text-neutral-700 flex items-center gap-2">
                    <Mail size={18} /> Richieste in Arrivo
                  </h3>
                </div>
                <div className="overflow-y-auto flex-1 p-2 space-y-2 custom-scrollbar">
                  {inbox.length === 0 ? (
                    <div className="text-center py-10 text-neutral-400">
                      <p>Nessuna richiesta presente.</p>
                    </div>
                  ) : (
                    inbox.map((msg) => (
                      <motion.div
                        key={msg.id}
                        onClick={() => handleSelectMessage(msg)}
                        className={`p-4 rounded-xl cursor-pointer transition-all border group relative ${
                          selectedMsg?.id === msg.id 
                            ? 'bg-primary/5 border-primary shadow-sm' 
                            : 'bg-white border-transparent hover:bg-neutral-50 hover:border-neutral-200'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex items-center gap-2">
                            {!msg.read && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                            <span className={`text-sm ${!msg.read ? 'font-bold text-neutral-800' : 'font-medium text-neutral-600'}`}>
                              {msg.from}
                            </span>
                          </div>
                          <span className="text-[10px] text-neutral-400">{new Date(msg.date).toLocaleDateString()}</span>
                        </div>
                        <p className={`text-sm mb-1 ${!msg.read ? 'text-neutral-800 font-semibold' : 'text-neutral-500'}`}>
                          {msg.subject}
                        </p>
                        
                        <button 
                          onClick={(e) => handleDelete(msg.id, e)}
                          className="absolute right-2 bottom-2 p-1.5 text-neutral-300 hover:text-error hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={14} />
                        </button>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>

              {/* DETTAGLIO MESSAGGIO (DX) */}
              <div className="col-span-8 h-full">
                 <AnimatePresence mode="wait">
                    {selectedMsg ? (
                       <motion.div 
                          key={selectedMsg.id}
                          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                          className="bg-white rounded-2xl border border-neutral-200 shadow-sm h-full flex flex-col overflow-hidden"
                       >
                          {/* Header Dettaglio */}
                          <div className="p-6 border-b border-neutral-100 flex justify-between items-start bg-white z-10">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <User size={24} />
                              </div>
                              <div>
                                <h2 className="text-xl font-bold text-neutral-800">{selectedMsg.subject}</h2>
                                <div className="flex items-center gap-2 text-sm text-neutral-500">
                                  <span>{selectedMsg.from}</span> • <span>{new Date(selectedMsg.date).toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                            <Button variant="ghost" className="text-error hover:bg-red-50" onClick={(e) => handleDelete(selectedMsg.id, e)}>
                               <Trash2 size={18} />
                            </Button>
                          </div>

                          {/* CORPO: QUI VIENE USATO RIEPILOGO SCHEDA */}
                          <div className="flex-1 overflow-y-auto p-6 bg-neutral-50/50">
                             {selectedMsg.fullData ? (
                                <div className="space-y-6">
                                   
                                   {/* ECCO IL COMPONENTE IMPORTATO */}
                                   <RiepilogoScheda data={selectedMsg.fullData} />

                                   <div className="bg-white border border-neutral-200 rounded-xl p-4 flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                         <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><FileText size={20} /></div>
                                         <div>
                                            <p className="font-bold text-sm text-neutral-800">Allegati</p>
                                            <p className="text-xs text-neutral-500">{selectedMsg.fullData.filesMetadata?.length || 0} File</p>
                                         </div>
                                      </div>
                                      <Button variant="secondary" className="text-xs">
                                         <Download size={14} className="mr-2" /> Scarica
                                      </Button>
                                   </div>
                                </div>
                             ) : (
                                <div className="p-6"><p>{selectedMsg.preview}</p></div>
                             )}
                          </div>

                          {/* Footer Azioni */}
                          <div className="p-4 border-t border-neutral-100 bg-white flex justify-end gap-3">
                             <Button variant="ghost" className="text-neutral-500" onClick={(e) => handleDelete(selectedMsg.id, e)}>
                                <XCircle size={18} className="mr-2" /> Rifiuta
                             </Button>
                             {/* TASTO VALIDA -> Attiva Wizard */}
                             <Button variant="primary" className="shadow-lg" onClick={() => setIsProcessing(true)}>
                                <CheckCircle size={18} className="mr-2" /> Valida
                             </Button>
                          </div>

                       </motion.div>
                    ) : (
                       <div className="h-full bg-neutral-50 rounded-2xl border-2 border-dashed border-neutral-200 flex flex-col items-center justify-center text-neutral-400">
                          <Mail size={64} className="mb-4 opacity-10" />
                          <p>Seleziona una richiesta</p>
                       </div>
                    )}
                 </AnimatePresence>
              </div>
           </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}