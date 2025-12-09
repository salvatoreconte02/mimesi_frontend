import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, Mail, Paperclip, Star, FileText, CheckCircle, Download, Clock 
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import useAuthStore from '../../store/authStore';
import StepSummary from '../../components/wizard/StepSummary'; 

export default function InboxDottore() {
  const user = useAuthStore(state => state.user);
  const [selectedMsg, setSelectedMsg] = useState(null);
  const [messages, setMessages] = useState([]);
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  // Carica messaggi dal localStorage
  useEffect(() => {
    const stored = localStorage.getItem('mimesi_doctor_inbox');
    if (stored) {
      setMessages(JSON.parse(stored));
    }
  }, []);

  // Segna come letto
  const markAsRead = (msgId) => {
    const updated = messages.map(m => m.id === msgId ? { ...m, read: true, unread: false } : m);
    setMessages(updated);
    localStorage.setItem('mimesi_doctor_inbox', JSON.stringify(updated));
  };

  // Segna tutti come letti
  const markAllAsRead = () => {
    const updated = messages.map(m => ({ ...m, read: true, unread: false }));
    setMessages(updated);
    localStorage.setItem('mimesi_doctor_inbox', JSON.stringify(updated));
  };

  const handleSelectMessage = (msg) => {
    setSelectedMsg(msg);
    setShowOtp(false);
    setOtpCode('');
    if (!msg.read) {
      markAsRead(msg.id);
    }
  };

  // Firma digitale
  const handleRequestOtp = () => {
    alert('Codice OTP inviato via email!');
    setShowOtp(true);
  };

  const handleConfirmSignature = () => {
    if (otpCode.length !== 6) {
      alert('Inserisci un codice OTP valido (6 cifre)');
      return;
    }

    // Aggiorna lo stato della lavorazione
    const allLavorazioni = JSON.parse(localStorage.getItem('mimesi_all_lavorazioni') || '[]');
    const updated = allLavorazioni.map(lav => {
      if (lav.id === selectedMsg.linkedJobId || lav.id === selectedMsg.fullData?.id) {
        return {
          ...lav,
          stato: 'working',
          progress: 20,
          statusLabel: 'In Lavorazione'
        };
      }
      return lav;
    });
    localStorage.setItem('mimesi_all_lavorazioni', JSON.stringify(updated));

    // Rimuovi o aggiorna messaggio nell'inbox (opzionale: lo teniamo come storico)
    alert('✅ Documento firmato digitalmente! La lavorazione è stata avviata.');
    setSelectedMsg(null);
    setShowOtp(false);
  };

  const handleReject = () => {
    if (window.confirm('Sei sicuro di voler rifiutare questo preventivo?')) {
      alert('Preventivo rifiutato. Contatta l\'amministrazione per modifiche.');
      setSelectedMsg(null);
    }
  };

  return (
    <div className="p-8 max-w-[1400px] mx-auto min-h-screen">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-800">Messaggi & Preventivi</h1>
          <p className="text-neutral-500">Comunicazioni dal laboratorio e documenti da firmare</p>
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
                  className={`p-4 border-b border-neutral-50 cursor-pointer transition-colors hover:bg-neutral-50 ${selectedMsg?.id === msg.id ? 'bg-primary/5 border-l-4 border-l-primary' : 'border-l-4 border-l-transparent'} ${!msg.read ? 'bg-white' : 'bg-neutral-50/50'}`}
                >
                   <div className="flex justify-between items-start mb-1">
                      <h4 className={`text-sm ${!msg.read ? 'font-bold text-neutral-800' : 'font-medium text-neutral-600'}`}>{msg.from}</h4>
                      <span className="text-[10px] text-neutral-400">{new Date(msg.date).toLocaleDateString()}</span>
                   </div>
                   <p className={`text-xs mb-1 truncate ${!msg.read ? 'text-neutral-800 font-bold' : 'text-neutral-500'}`}>{msg.subject}</p>
                   <p className="text-[11px] text-neutral-400 line-clamp-1">{msg.preview}</p>
                   
                   <div className="mt-2 flex gap-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full 
                        ${msg.type === 'request_signature' ? 'bg-orange-100 text-orange-700' : 
                          msg.type === 'order_summary' ? 'bg-blue-100 text-blue-700' : 
                          'bg-gray-100 text-gray-600'}`}>
                        {msg.type === 'request_signature' ? 'Da Firmare' : 
                         msg.type === 'order_summary' ? 'Riepilogo' : 'Info'}
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
                <div className="p-8 flex-1 overflow-y-auto text-neutral-600 text-sm leading-relaxed custom-scrollbar">
                   <p className="mb-4">{selectedMsg.preview}</p>
                   
                   {/* CASO 1: RIEPILOGO ORDINE (SOLA LETTURA, SENZA CONTAINER BRUTTO) */}
                   {selectedMsg.type === 'order_summary' && selectedMsg.fullData && (
                     <div className="mt-4">
                        <StepSummary 
                           formData={selectedMsg.fullData}
                           configuredElements={selectedMsg.fullData.elements}
                           technicalInfo={selectedMsg.fullData.technicalInfo}
                           dates={selectedMsg.fullData.dates}
                           files={selectedMsg.fullData.filesMetadata || []} 
                           photos={selectedMsg.fullData.photosMetadata || []} 
                           impressionParams={selectedMsg.fullData.impressionParams}
                           readOnly={true} // Nasconde bottoni
                        />
                     </div>
                   )}

                   {/* CASO 2: RICHIESTA FIRMA (CON PREVENTIVO) */}
                   {selectedMsg.type === 'request_signature' && selectedMsg.quoteData && (
                     <div className="mt-6 space-y-4">
                        <div className="bg-primary/5 p-6 rounded-xl border border-primary/20">
                            <h4 className="font-bold text-primary mb-4 flex items-center gap-2">
                              <FileText size={20} /> Preventivo da Approvare
                            </h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-neutral-600">Totale Elementi:</span>
                                <span className="font-bold">{selectedMsg.quoteData.elementCount}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-neutral-600">Spedizioni:</span>
                                <span className="font-bold">€ {selectedMsg.quoteData.shipmentTotal?.toFixed(2)}</span>
                              </div>
                              {selectedMsg.quoteData.manualAdjustment !== 0 && (
                                <div className="flex justify-between text-neutral-500 italic">
                                    <span>Variazione / Sconto:</span>
                                    <span>€ {Number(selectedMsg.quoteData.manualAdjustment).toFixed(2)}</span>
                                </div>
                              )}
                              <div className="border-t border-primary/20 pt-2 mt-2 flex justify-between text-lg">
                                <span className="text-primary font-bold">TOTALE ORDINE:</span>
                                <span className="text-primary font-bold">€ {selectedMsg.quoteData.total?.toFixed(2)}</span>
                              </div>
                            </div>
                         </div>
                         <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-center gap-4">
                            <Download className="text-blue-600" size={24} />
                            <div className="flex-1">
                                <p className="text-sm font-bold text-blue-900">Scarica PDF Preventivo</p>
                                <p className="text-xs text-blue-600">Documento ufficiale valido ai fini fiscali</p>
                            </div>
                            <Button className="text-xs px-3 py-1.5 h-auto">Scarica</Button>
                         </div>
                     </div>
                   )}
                </div>

                {/* Footer Azioni */}
                <div className="p-4 border-t border-neutral-100 bg-neutral-50">
                   {selectedMsg.type === 'request_signature' && !showOtp ? (
                     <div className="flex gap-3 justify-end">
                       <Button variant="ghost" className="text-error" onClick={handleReject}>Rifiuta Preventivo</Button>
                       <Button variant="gradient" onClick={handleRequestOtp}>Firma Digitalmente</Button>
                     </div>
                   ) : selectedMsg.type === 'request_signature' && showOtp ? (
                     <div className="space-y-3">
                       <div className="bg-primary/5 p-4 rounded-xl border border-primary/20">
                         <p className="text-sm text-neutral-700 mb-3">
                           <CheckCircle className="inline mr-2 text-primary" size={16} />
                           Codice OTP inviato alla tua email
                         </p>
                         <input 
                           type="text" 
                           placeholder="Inserisci codice a 6 cifre" 
                           value={otpCode}
                           onChange={(e) => setOtpCode(e.target.value)}
                           maxLength={6}
                           className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-center text-xl font-mono tracking-widest"
                         />
                       </div>
                       <div className="flex gap-3 justify-end">
                         <Button variant="ghost" onClick={() => setShowOtp(false)}>Annulla</Button>
                         <Button variant="success" onClick={handleConfirmSignature}>Conferma Firma</Button>
                       </div>
                     </div>
                   ) : (
                     <div className="flex gap-3 justify-end">
                       <input type="text" placeholder="Scrivi una risposta..." className="flex-1 px-4 py-2 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm" />
                       <Button variant="gradient" className="px-6">Invia</Button>
                     </div>
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