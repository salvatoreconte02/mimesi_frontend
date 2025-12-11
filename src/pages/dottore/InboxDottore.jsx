import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, Mail, Paperclip, Star, FileText, CheckCircle, Download
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

  // --- CARICAMENTO DATI ---
  useEffect(() => {
    const loadMessages = () => {
       const stored = localStorage.getItem('mimesi_doctor_inbox');
       if (stored) {
         const parsedMsgs = JSON.parse(stored);
         setMessages(parsedMsgs);

         const targetId = sessionStorage.getItem('mimesi_msg_id');
         if (targetId) {
             const found = parsedMsgs.find(m => String(m.id) === String(targetId));
             if (found) {
                 handleSelectMessage(found); 
             }
             sessionStorage.removeItem('mimesi_msg_id');
         }
       }
    };
    loadMessages();
    const interval = setInterval(loadMessages, 2000);
    return () => clearInterval(interval);
  }, []);

  // --- AZIONI ---
  const markAsRead = (msgId) => {
    const msg = messages.find(m => m.id === msgId);
    if (msg && msg.read) return;

    const updated = messages.map(m => m.id === msgId ? { ...m, read: true, unread: false } : m);
    setMessages(updated);
    localStorage.setItem('mimesi_doctor_inbox', JSON.stringify(updated));
  };

  const markAllAsRead = () => {
    const updated = messages.map(m => ({ ...m, read: true, unread: false }));
    setMessages(updated);
    localStorage.setItem('mimesi_doctor_inbox', JSON.stringify(updated));
  };

  const handleSelectMessage = (msg) => {
    setSelectedMsg(msg);
    setShowOtp(false);
    setOtpCode('');
    markAsRead(msg.id);
  };

  const handleRequestOtp = () => {
    alert(`Codice OTP inviato all'indirizzo email associato a Dr. ${user?.cognome || 'Utente'}!`);
    setShowOtp(true);
  };

  // --- FIRMA PREVENTIVO CON OTP ---
  const handleConfirmSignature = () => {
    if (otpCode.length !== 6) {
      alert('Inserisci un codice OTP valido (6 cifre)');
      return;
    }

    const allLavorazioni = JSON.parse(localStorage.getItem('mimesi_all_lavorazioni') || '[]');
    const doctorInbox = JSON.parse(localStorage.getItem('mimesi_doctor_inbox') || '[]');
    const adminInbox = JSON.parse(localStorage.getItem('mimesi_admin_inbox') || '[]');

    const targetId = selectedMsg.linkedJobId || selectedMsg.fullData?.id;
    let jobData = null;

    // Trova e aggiorna la lavorazione
    const updatedJobs = allLavorazioni.map(lav => {
      if (String(lav.id) === String(targetId)) {
        jobData = lav;
        return { 
            ...lav, 
            stato: 'working', 
            progress: 0, 
            statusLabel: 'In Lavorazione',
            signedAt: new Date().toISOString(),
            signedBy: user ? `Dr. ${user.nome} ${user.cognome}` : 'Dottore'
        };
      }
      return lav;
    });

    // Dati per le notifiche
    const patientName = jobData?.paziente || 'Paziente';
    const doctorName = user ? `Dr. ${user.nome} ${user.cognome}` : 'Dottore';
    const studioName = jobData?.fullData?.nomeStudio || user?.nomeStudio || 'Studio';
    const materialInfo = jobData?.fullData?.technicalInfo?.material?.replace('_', ' ') || jobData?.tipo || 'N/D';
    const quoteTotal = selectedMsg.quoteData?.total?.toFixed(2) || 'N/D';
    const currentDate = new Date().toLocaleDateString('it-IT', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Notifica al Dottore - Conferma Firma
    doctorInbox.unshift({
        id: Date.now(),
        from: 'Mimesi Lab - Amministrazione',
        subject: `✓ Preventivo Approvato: ${patientName}`,
        preview: `Gentile ${doctorName}, confermiamo la ricezione della Sua firma digitale per il preventivo relativo al paziente ${patientName}. La lavorazione (Rif. ${targetId}) è stata ufficialmente avviata in data ${currentDate}. Materiale selezionato: ${materialInfo}. Importo totale confermato: € ${quoteTotal}. Riceverà aggiornamenti sullo stato di avanzamento direttamente in questa sezione. Per qualsiasi necessità, il nostro team tecnico è a Sua disposizione.`,
        date: new Date().toISOString(),
        read: false,
        unread: true,
        type: 'info',
        linkedJobId: targetId
    });

    // Notifica all'Admin - Preventivo Firmato
    adminInbox.unshift({
        id: Date.now() + 1,
        from: doctorName,
        subject: `✓ Preventivo Firmato: ${patientName}`,
        preview: `${doctorName} (${studioName}) ha approvato e firmato digitalmente il preventivo per la lavorazione ${targetId}. Paziente: ${patientName}. Tipologia: ${materialInfo}. Importo confermato: € ${quoteTotal}. Firma apposta in data ${currentDate} tramite verifica OTP. La lavorazione è ora attiva e può procedere con la produzione.`,
        date: new Date().toISOString(),
        read: false,
        unread: true,
        type: 'notification',
        linkedJobId: targetId
    });

    localStorage.setItem('mimesi_all_lavorazioni', JSON.stringify(updatedJobs));
    localStorage.setItem('mimesi_doctor_inbox', JSON.stringify(doctorInbox));
    localStorage.setItem('mimesi_admin_inbox', JSON.stringify(adminInbox));
    setMessages(doctorInbox);

    alert('✅ Preventivo firmato con successo!\n\nLa lavorazione è stata avviata e troverà conferma nella Sua Inbox.');
    setSelectedMsg(null);
    setShowOtp(false);
    setOtpCode('');
  };

  // --- RIFIUTO PREVENTIVO ---
  const handleReject = () => {
    if (window.confirm('Sei sicuro di voler rifiutare questo preventivo?\n\nLa lavorazione verrà archiviata come "Rifiutata" e sia tu che il laboratorio riceverete notifica.')) {
      
      const allLavorazioni = JSON.parse(localStorage.getItem('mimesi_all_lavorazioni') || '[]');
      const doctorInbox = JSON.parse(localStorage.getItem('mimesi_doctor_inbox') || '[]');
      const adminInbox = JSON.parse(localStorage.getItem('mimesi_admin_inbox') || '[]');

      const targetId = selectedMsg.linkedJobId || selectedMsg.fullData?.id;
      let jobData = null;

      // Aggiorna la lavorazione a stato REJECTED
      const updatedJobs = allLavorazioni.map(lav => {
        if (String(lav.id) === String(targetId)) {
            jobData = lav;
            return {
                ...lav,
                stato: 'rejected',
                statusLabel: 'Rifiutata',
                progress: 0,
                rejectedAt: new Date().toISOString(),
                rejectedBy: user ? `Dr. ${user.nome} ${user.cognome}` : 'Dottore'
            };
        }
        return lav;
      });

      // Dati per le notifiche
      const patientName = jobData?.paziente || 'Paziente';
      const doctorName = user ? `Dr. ${user.nome} ${user.cognome}` : 'Dottore';
      const studioName = jobData?.fullData?.nomeStudio || user?.nomeStudio || 'Studio';
      const materialInfo = jobData?.fullData?.technicalInfo?.material?.replace('_', ' ') || jobData?.tipo || 'N/D';
      const quoteTotal = selectedMsg.quoteData?.total?.toFixed(2) || 'N/D';
      const currentDate = new Date().toLocaleDateString('it-IT', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      // Notifica al Dottore - Conferma Rifiuto
      doctorInbox.unshift({
        id: Date.now(),
        from: 'Mimesi Lab - Amministrazione',
        subject: `✗ Preventivo Rifiutato: ${patientName}`,
        preview: `Gentile ${doctorName}, confermiamo che il preventivo per il paziente ${patientName} (Rif. ${targetId}) è stato rifiutato in data ${currentDate}. La richiesta è stata archiviata nel sistema. Tipologia richiesta: ${materialInfo}. Importo preventivato: € ${quoteTotal}. Se desidera procedere con una nuova richiesta o necessita di modifiche al preventivo, può creare una nuova prescrizione in qualsiasi momento. Il nostro team resta a disposizione per eventuali chiarimenti.`,
        date: new Date().toISOString(),
        read: false,
        unread: true,
        type: 'info',
        linkedJobId: targetId
      });

      // Notifica all'Admin - Preventivo Rifiutato
      adminInbox.unshift({
        id: Date.now() + 1,
        from: doctorName,
        subject: `✗ Preventivo RIFIUTATO: ${patientName}`,
        preview: `ATTENZIONE: ${doctorName} (${studioName}) ha rifiutato il preventivo per la lavorazione ${targetId}. Paziente: ${patientName}. Tipologia: ${materialInfo}. Importo proposto: € ${quoteTotal}. Data rifiuto: ${currentDate}. La pratica è stata automaticamente spostata nell'archivio con stato "Rifiutata". Si consiglia di contattare lo studio per comprendere le motivazioni del rifiuto e valutare eventuali proposte alternative.`,
        date: new Date().toISOString(),
        read: false,
        unread: true,
        type: 'notification', 
        linkedJobId: targetId
      });

      localStorage.setItem('mimesi_all_lavorazioni', JSON.stringify(updatedJobs));
      localStorage.setItem('mimesi_doctor_inbox', JSON.stringify(doctorInbox));
      localStorage.setItem('mimesi_admin_inbox', JSON.stringify(adminInbox));
      
      setMessages(doctorInbox);

      alert('Preventivo rifiutato.\n\nLa richiesta è stata archiviata e il laboratorio è stato notificato.');
      setSelectedMsg(null);
    }
  };

  const isSignatureRequest = selectedMsg?.type === 'request_signature';

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
        <Card className="lg:col-span-1 !p-0 overflow-hidden flex flex-col h-full">
           <div className="p-4 border-b border-neutral-100 bg-neutral-50">
              <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                 <input type="text" placeholder="Cerca..." className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-neutral-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
           </div>
           
           <div className="flex-1 overflow-y-auto">
              {messages.length > 0 ? messages.map((msg) => (
                <div 
                  key={msg.id} 
                  onClick={() => handleSelectMessage(msg)}
                  className={`p-4 border-b border-neutral-50 cursor-pointer transition-colors hover:bg-neutral-50 
                      ${selectedMsg?.id === msg.id ? 'bg-primary/5 border-l-4 border-l-primary' : 'border-l-4 border-l-transparent'} 
                      ${!msg.read ? 'bg-white' : 'bg-neutral-50/50'}`}
                >
                   <div className="flex justify-between items-start mb-1">
                      <h4 className={`text-sm ${!msg.read ? 'font-bold text-neutral-800' : 'font-medium text-neutral-600'}`}>{msg.from}</h4>
                      <span className="text-[10px] text-neutral-400">{new Date(msg.date).toLocaleDateString()}</span>
                   </div>
                   <p className={`text-xs mb-1 truncate ${!msg.read ? 'text-neutral-800 font-bold' : 'text-neutral-500'}`}>{msg.subject}</p>
                   
                   <div className="mt-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full 
                        ${msg.type === 'request_signature' ? 'bg-orange-100 text-orange-700' : 
                          msg.type === 'order_summary' ? 'bg-indigo-100 text-indigo-700' : 
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

        <Card className="lg:col-span-2 !p-0 overflow-hidden h-full relative">
           {selectedMsg ? (
             <motion.div 
               key={selectedMsg.id}
               initial={{ opacity: 0 }} animate={{ opacity: 1 }}
               className="flex flex-col h-full"
             >
                <div className="p-6 border-b border-neutral-100 flex justify-between items-start">
                   <div>
                      <h2 className="text-xl font-bold text-neutral-800 mb-2">{selectedMsg.subject}</h2>
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                            {selectedMsg.from.charAt(0)}
                         </div>
                         <div>
                            <p className="text-sm font-bold text-neutral-700">{selectedMsg.from}</p>
                            <p className="text-xs text-neutral-400">{new Date(selectedMsg.date).toLocaleString()}</p>
                         </div>
                      </div>
                   </div>
                   <div className="flex gap-2">
                      <button className="p-2 hover:bg-neutral-100 rounded-full text-neutral-400"><Star size={18} /></button>
                      <button className="p-2 hover:bg-neutral-100 rounded-full text-neutral-400"><Paperclip size={18} /></button>
                   </div>
                </div>

                <div className="p-8 flex-1 overflow-y-auto text-neutral-600 text-sm leading-relaxed custom-scrollbar">
                   <p className="mb-4 whitespace-pre-wrap">{selectedMsg.preview}</p>
                   
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
                           readOnly={true} 
                        />
                     </div>
                   )}

                   {isSignatureRequest && selectedMsg.quoteData && (
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

                {isSignatureRequest && (
                    <div className="p-4 border-t border-neutral-100 bg-neutral-50">
                        {!showOtp ? (
                            <div className="flex gap-3 justify-end">
                                <Button variant="ghost" className="text-error" onClick={handleReject}>Rifiuta Preventivo</Button>
                                <Button variant="gradient" onClick={handleRequestOtp}>Firma Digitalmente</Button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="bg-white p-3 rounded-xl border border-primary/30 shadow-sm flex items-center gap-3">
                                    <CheckCircle className="text-primary" size={20} />
                                    <div className="flex-1">
                                        <p className="text-xs text-neutral-500 mb-1">Codice OTP inviato alla tua email</p>
                                        <input 
                                            type="text" 
                                            placeholder="Inserisci 6 cifre..." 
                                            value={otpCode}
                                            onChange={(e) => setOtpCode(e.target.value)}
                                            maxLength={6}
                                            className="w-full bg-transparent font-mono text-lg font-bold outline-none tracking-widest text-neutral-800 placeholder:text-neutral-300"
                                            autoFocus
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-3 justify-end">
                                    <Button variant="ghost" onClick={() => setShowOtp(false)}>Annulla</Button>
                                    <Button variant="success" onClick={handleConfirmSignature}>Conferma Firma</Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

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