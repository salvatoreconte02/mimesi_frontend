import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, CheckCircle, Clock, Search, Trash2, User, FileText, Bell } from 'lucide-react';
import Card from '../../components/ui/Card'; // Assicurati che il percorso sia corretto
import Button from '../../components/ui/Button'; // Assicurati che il percorso sia corretto

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

  // Funzione per cancellare (opzionale)
  const handleDelete = (id, e) => {
    e.stopPropagation();
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
          <Card className="px-4 py-2 flex items-center gap-3 bg-white border-neutral-200">
             <div className="relative">
               <Bell className="text-neutral-400" size={20} />
               {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />}
             </div>
             <span className="font-bold text-neutral-700">{unreadCount} Nuove Richieste</span>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-180px)]">
        
        {/* LISTA MESSAGGI (INBOX) */}
        <div className="col-span-4 bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-neutral-100 bg-neutral-50/50">
            <h3 className="font-bold text-neutral-700 flex items-center gap-2">
              <Mail size={18} /> Richieste in Arrivo
            </h3>
          </div>
          <div className="overflow-y-auto flex-1 p-2 space-y-2">
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
                  className={`p-4 rounded-xl cursor-pointer transition-all border ${
                    selectedMsg?.id === msg.id 
                      ? 'bg-primary/5 border-primary shadow-sm' 
                      : 'bg-white border-transparent hover:bg-neutral-50'
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
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* DETTAGLIO MESSAGGIO */}
        <div className="col-span-8">
          <AnimatePresence mode="wait">
            {selectedMsg ? (
              <motion.div 
                key={selectedMsg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="bg-white rounded-2xl border border-neutral-200 shadow-sm h-full p-8 flex flex-col"
              >
                <div className="flex justify-between items-start border-b border-neutral-100 pb-6 mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <User size={20} />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-neutral-800">{selectedMsg.subject}</h2>
                        <p className="text-sm text-neutral-500">Inviato da <span className="text-primary font-medium">{selectedMsg.from}</span></p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="secondary" onClick={(e) => handleDelete(selectedMsg.id, e)}>
                      <Trash2 size={18} />
                    </Button>
                    <Button variant="primary">Accetta e Genera Preventivo</Button>
                  </div>
                </div>

                <div className="prose max-w-none text-neutral-600 space-y-4">
                  <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                    <h4 className="font-bold text-sm text-neutral-800 mb-2 flex items-center gap-2">
                      <FileText size={16}/> Dettagli Rapidi
                    </h4>
                    <p className="text-sm">{selectedMsg.preview}</p>
                    <p className="text-xs text-neutral-400 mt-2">ID Transazione: #{selectedMsg.id}</p>
                  </div>
                  
                  <p>
                    Il Dottore ha completato la configurazione tramite il wizard MPO. 
                    I file STL sono pronti per il download nel cloud storage associato.
                  </p>
                </div>

              </motion.div>
            ) : (
              <div className="h-full bg-neutral-50 rounded-2xl border-2 border-dashed border-neutral-200 flex flex-col items-center justify-center text-neutral-400">
                <Mail size={48} className="mb-4 opacity-20" />
                <p>Seleziona una richiesta per visualizzare i dettagli</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}