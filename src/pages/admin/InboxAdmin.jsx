import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, Mail, Paperclip, Star, FileText, CheckCircle, AlertCircle 
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

export default function InboxAdmin() {
  const [selectedMsg, setSelectedMsg] = useState(null);
  const [messages, setMessages] = useState([]);

  // Carica messaggi dal localStorage
  useEffect(() => {
    const stored = localStorage.getItem('mimesi_admin_inbox');
    if (stored) {
      setMessages(JSON.parse(stored));
    }
  }, []);

  // Segna come letto
  const markAsRead = (msgId) => {
    const updated = messages.map(m => m.id === msgId ? { ...m, read: true } : m);
    setMessages(updated);
    localStorage.setItem('mimesi_admin_inbox', JSON.stringify(updated));
  };

  // Segna tutti come letti
  const markAllAsRead = () => {
    const updated = messages.map(m => ({ ...m, read: true }));
    setMessages(updated);
    localStorage.setItem('mimesi_admin_inbox', JSON.stringify(updated));
  };

  const handleSelectMessage = (msg) => {
    setSelectedMsg(msg);
    if (!msg.read) {
      markAsRead(msg.id);
    }
  };

  return (
    <div className="p-8 max-w-[1400px] mx-auto min-h-screen">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-800">Messaggi & Richieste</h1>
          <p className="text-neutral-500">Comunicazioni dai dottori e notifiche di sistema</p>
        </div>
        <div className="flex gap-2">
           <Button variant="secondary" className="text-sm" onClick={markAllAsRead}>Segna tutti letti</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        
        {/* LISTA MESSAGGI (SX) */}
        <Card className="lg:col-span-1 !p-0 overflow-hidden flex flex-col h-full">
           <div className="p-4 border-b border-neutral-100 bg-neutral-50">
              <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                 <input type="text" placeholder="Cerca messaggi..." className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-neutral-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
           </div>
           
           <div className="flex-1 overflow-y-auto">
              {messages.length > 0 ? messages.map((msg) => (
                <div 
                  key={msg.id} 
                  onClick={() => handleSelectMessage(msg)}
                  className={`p-4 border-b border-neutral-50 cursor-pointer transition-colors hover:bg-neutral-50 ${selectedMsg?.id === msg.id ? 'bg-primary/5 border-l-4 border-l-primary' : 'border-l-4 border-l-transparent'} ${msg.unread ? 'bg-white' : 'bg-neutral-50/50'}`}
                >
                   <div className="flex justify-between items-start mb-1">
                      <h4 className={`text-sm ${msg.unread ? 'font-bold text-neutral-800' : 'font-medium text-neutral-600'}`}>{msg.from}</h4>
                      <span className="text-[10px] text-neutral-400">{new Date(msg.date).toLocaleDateString()}</span>
                   </div>
                   <p className={`text-xs mb-1 truncate ${msg.unread ? 'text-neutral-800 font-medium' : 'text-neutral-500'}`}>{msg.subject}</p>
                   <p className="text-[11px] text-neutral-400 line-clamp-1">{msg.preview}</p>
                   
                   <div className="mt-2 flex gap-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full 
                        ${msg.type === 'request' ? 'bg-blue-100 text-blue-700' : 
                          msg.type === 'question' ? 'bg-orange-100 text-orange-700' : 
                          'bg-gray-100 text-gray-600'}`}>
                        {msg.type === 'request' ? 'Nuova Richiesta' : 'Notifica'}
                      </span>
                   </div>
                </div>
              )) : (
                <div className="p-8 text-center text-neutral-400">
                  <Mail size={48} className="mx-auto mb-2 opacity-20" />
                  <p>Nessun messaggio</p>
                </div>
              )}
           </div>
        </Card>

        {/* DETTAGLIO MESSAGGIO (DX) */}
        <Card className="lg:col-span-2 !p-0 overflow-hidden h-full relative">
           {selectedMsg ? (
             <motion.div 
               key={selectedMsg.id}
               initial={{ opacity: 0 }} animate={{ opacity: 1 }}
               className="flex flex-col h-full"
             >
                {/* Header Messaggio */}
                <div className="p-6 border-b border-neutral-100 flex justify-between items-start">
                   <div>
                      <h2 className="text-xl font-bold text-neutral-800 mb-2">{selectedMsg.subject}</h2>
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                            {selectedMsg.from.charAt(0)}
                         </div>
                         <div>
                            <p className="text-sm font-bold text-neutral-700">{selectedMsg.from}</p>
                            <p className="text-xs text-neutral-400">Ricevuto • {new Date(selectedMsg.date).toLocaleString()}</p>
                         </div>
                      </div>
                   </div>
                   <div className="flex gap-2">
                      <button className="p-2 hover:bg-neutral-100 rounded-full text-neutral-400"><Star size={18} /></button>
                      <button className="p-2 hover:bg-neutral-100 rounded-full text-neutral-400"><Paperclip size={18} /></button>
                   </div>
                </div>

                {/* Corpo Messaggio */}
                <div className="p-8 flex-1 overflow-y-auto text-neutral-600 text-sm leading-relaxed">
                   <p>{selectedMsg.preview}</p>
                   <br />
                   
                   {selectedMsg.type === 'request' && selectedMsg.fullData && (
                     <div className="mt-6 space-y-4">
                       <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200">
                         <h4 className="font-bold text-neutral-800 mb-2">Dettagli Prescrizione</h4>
                         <div className="grid grid-cols-2 gap-3 text-xs">
                           <div>
                             <span className="text-neutral-400 block">Paziente</span>
                             <span className="font-bold">{selectedMsg.fullData.cognome} {selectedMsg.fullData.nome}</span>
                           </div>
                           <div>
                             <span className="text-neutral-400 block">Elementi</span>
                             <span className="font-bold">{selectedMsg.fullData.elements?.length || 0}</span>
                           </div>
                           <div>
                             <span className="text-neutral-400 block">Materiale</span>
                             <span className="font-bold capitalize">{selectedMsg.fullData.technicalInfo?.material?.replace(/_/g, ' ')}</span>
                           </div>
                           <div>
                             <span className="text-neutral-400 block">Colore</span>
                             <span className="font-bold">{selectedMsg.fullData.technicalInfo?.color}</span>
                           </div>
                         </div>
                       </div>

                       <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-center gap-4">
                          <FileText className="text-blue-600" size={24} />
                          <div className="flex-1">
                             <p className="text-sm font-bold text-blue-900">File Scansione Allegati</p>
                             <p className="text-xs text-blue-600">{selectedMsg.fullData.filesMetadata?.length || 0} file 3D</p>
                          </div>
                          <Button className="text-xs px-3 py-1.5 h-auto">Visualizza</Button>
                       </div>
                     </div>
                   )}
                </div>

                {/* Footer Azioni */}
                <div className="p-4 border-t border-neutral-100 bg-neutral-50 flex gap-3 justify-end">
                   {selectedMsg.type === 'request' ? (
                     <>
                       <Button variant="ghost" className="text-error">Rifiuta</Button>
                       <Button variant="gradient">Valida e Crea Preventivo</Button>
                     </>
                   ) : (
                     <>
                       <input type="text" placeholder="Scrivi una risposta..." className="flex-1 px-4 py-2 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm" />
                       <Button variant="gradient" className="px-6">Invia</Button>
                     </>
                   )}
                </div>

             </motion.div>
           ) : (
             <div className="h-full flex flex-col items-center justify-center text-neutral-300">
                <Mail size={64} className="mb-4 opacity-20" />
                <p>Seleziona un messaggio per leggerlo</p>
             </div>
           )}
        </Card>

      </div>
    </div>
  );
}