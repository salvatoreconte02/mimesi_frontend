import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Trash2, User, FileText, Bell, Download, CheckCircle, XCircle } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
// Importiamo il componente di visualizzazione condiviso
import NewRequestWizard from '../../components/wizard/NewRequestWizard';

export default function DashboardAdmin() {
  const [inbox, setInbox] = useState([]);
  const [selectedMsg, setSelectedMsg] = useState(null);

  // 1. CARICAMENTO DATI DAL LOCALSTORAGE
  useEffect(() => {
    const storedData = localStorage.getItem('mimesi_admin_inbox');
    if (storedData) {
      setInbox(JSON.parse(storedData));
    }
  }, []);

  // Funzione per segnare come letto
  const handleSelectMessage = (msg) => {
    setSelectedMsg(msg);
    if (!msg.read) {
      const updatedInbox = inbox.map(m => m.id === msg.id ? { ...m, read: true } : m);
      setInbox(updatedInbox);
      localStorage.setItem('mimesi_admin_inbox', JSON.stringify(updatedInbox));
    }
  };

  // Funzione per cancellare
  const handleDelete = (id, e) => {
    e.stopPropagation(); // Evita di selezionare il messaggio mentre lo cancelli
    const updatedInbox = inbox.filter(m => m.id !== id);
    setInbox(updatedInbox);
    if (selectedMsg?.id === id) setSelectedMsg(null);
    localStorage.setItem('mimesi_admin_inbox', JSON.stringify(updatedInbox));
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
        <div className="flex gap-4">
          <Card className="px-4 py-2 flex items-center gap-3 bg-white border-neutral-200 shadow-sm">
             <div className="relative">
               <Bell className="text-neutral-400" size={20} />
               {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-3 h-3 bg-error rounded-full animate-pulse" />}
             </div>
             <span className="font-bold text-neutral-700">{unreadCount} Nuove Richieste</span>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-180px)]">
        
        {/* COLONNA SINISTRA: LISTA MESSAGGI (INBOX) */}
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
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
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
                  <p className="text-xs text-neutral-400 line-clamp-1">{msg.preview}</p>
                  
                  {/* Tasto Delete rapido on hover */}
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

        {/* COLONNA DESTRA: DETTAGLIO MESSAGGIO */}
        <div className="col-span-8 h-full">
          <AnimatePresence mode="wait">
            {selectedMsg ? (
              <motion.div 
                key={selectedMsg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="bg-white rounded-2xl border border-neutral-200 shadow-sm h-full flex flex-col overflow-hidden"
              >
                {/* Intestazione Dettaglio */}
                <div className="p-6 border-b border-neutral-100 flex justify-between items-start bg-white z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <User size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-neutral-800">{selectedMsg.subject}</h2>
                      <div className="flex items-center gap-2 text-sm text-neutral-500">
                        <span>{selectedMsg.from}</span>
                        <span>•</span>
                        <span>{new Date(selectedMsg.date).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                     <Button variant="ghost" className="text-error hover:bg-red-50" onClick={(e) => handleDelete(selectedMsg.id, e)}>
                        <Trash2 size={18} />
                     </Button>
                  </div>
                </div>

                {/* Corpo Dettaglio (Scrollabile) */}
                <div className="flex-1 overflow-y-auto p-6 bg-neutral-50/50">
                  {selectedMsg.fullData ? (
                    /* CASO 1: È una richiesta completa generata dal nuovo Wizard */
                    <div className="space-y-6">
                      
                      {/* Componente visualizzazione scheda (condiviso) */}
                      <RiepilogoScheda 
                        fullData={selectedMsg.fullData} 
                        doctorInfo={selectedMsg.doctorInfo} 
                      />

                      {/* Sezione Download File (Simulata) */}
                      <div className="bg-white border border-neutral-200 rounded-xl p-4 flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                               <FileText size={20} />
                            </div>
                            <div>
                               <p className="font-bold text-sm text-neutral-800">Scansioni Intraorali.zip</p>
                               <p className="text-xs text-neutral-500">24.5 MB • Caricato dal Dottore</p>
                            </div>
                         </div>
                         <Button variant="secondary" className="text-xs">
                            <Download size={14} className="mr-2" /> Scarica
                         </Button>
                      </div>

                    </div>
                  ) : (
                    /* CASO 2: Messaggio legacy o semplice testo */
                    <div className="bg-white p-6 rounded-xl border border-neutral-200">
                      <p className="text-neutral-600 mb-4">{selectedMsg.preview}</p>
                      <div className="p-4 bg-yellow-50 rounded-lg text-yellow-800 text-sm border border-yellow-100">
                        Nota: Questa richiesta non contiene dati strutturati MPO completi.
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Azioni */}
                <div className="p-4 border-t border-neutral-100 bg-white flex justify-end gap-3">
                  <Button variant="ghost" className="text-neutral-500">
                    <XCircle size={18} className="mr-2" /> Rifiuta
                  </Button>
                  <Button variant="primary" className="shadow-lg shadow-primary/20">
                    <CheckCircle size={18} className="mr-2" /> Valida
                  </Button>
                </div>

              </motion.div>
            ) : (
              /* EMPTY STATE */
              <div className="h-full bg-neutral-50 rounded-2xl border-2 border-dashed border-neutral-200 flex flex-col items-center justify-center text-neutral-400">
                <Mail size={64} className="mb-4 opacity-10" />
                <p className="font-medium">Seleziona una richiesta dall'elenco</p>
                <p className="text-sm opacity-70">per visualizzare i dettagli completi e validare l'ordine</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}