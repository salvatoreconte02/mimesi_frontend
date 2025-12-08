import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, Mail, Paperclip, Clock, Star, 
  ChevronRight, FileText, CheckCircle, AlertCircle 
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

// DATI MOCK MESSAGGI
const MOCK_MESSAGES = [
  { 
    id: 1, 
    from: 'Amministrazione Mimesi', 
    subject: 'Preventivo Pronto: Mario Rossi', 
    preview: 'Il preventivo per il caso #LAV-2024-105 è stato elaborato. Si prega di visionare e firmare.', 
    date: '10:30', 
    unread: true,
    type: 'quote',
    tag: 'Preventivo'
  },
  { 
    id: 2, 
    from: 'Reparto CAD', 
    subject: 'Richiesta chiarimento: Luigi Bianchi', 
    preview: 'Dottore, abbiamo notato un sottosquadro importante sul 46. Procediamo con scarico o vuole riprendere l\'impronta?', 
    date: 'Ieri', 
    unread: true,
    type: 'question',
    tag: 'Urgente'
  },
  { 
    id: 3, 
    from: 'Amministrazione Mimesi', 
    subject: 'Fattura Mensile - Gennaio 2025', 
    preview: 'In allegato la fattura riepilogativa per le lavorazioni del mese scorso.', 
    date: '28 Gen', 
    unread: false,
    type: 'invoice',
    tag: 'Amministrazione'
  },
  { 
    id: 4, 
    from: 'Reparto Ceramica', 
    subject: 'Aggiornamento Consegna Verdi', 
    preview: 'La prova biscotto è pronta per la spedizione di domani.', 
    date: '25 Gen', 
    unread: false,
    type: 'info',
    tag: 'Info'
  },
];

export default function InboxDottore() {
  const [selectedMsg, setSelectedMsg] = useState(null);

  return (
    <div className="p-8 max-w-[1400px] mx-auto min-h-screen">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-800">Messaggi & Notifiche</h1>
          <p className="text-neutral-500">Comunicazioni dal laboratorio</p>
        </div>
        <div className="flex gap-2">
           <Button variant="secondary" className="text-sm">Segna tutti letti</Button>
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
              {MOCK_MESSAGES.map((msg) => (
                <div 
                  key={msg.id} 
                  onClick={() => setSelectedMsg(msg)}
                  className={`p-4 border-b border-neutral-50 cursor-pointer transition-colors hover:bg-neutral-50 ${selectedMsg?.id === msg.id ? 'bg-primary/5 border-l-4 border-l-primary' : 'border-l-4 border-l-transparent'} ${msg.unread ? 'bg-white' : 'bg-neutral-50/50'}`}
                >
                   <div className="flex justify-between items-start mb-1">
                      <h4 className={`text-sm ${msg.unread ? 'font-bold text-neutral-800' : 'font-medium text-neutral-600'}`}>{msg.from}</h4>
                      <span className="text-[10px] text-neutral-400">{msg.date}</span>
                   </div>
                   <p className={`text-xs mb-1 truncate ${msg.unread ? 'text-neutral-800 font-medium' : 'text-neutral-500'}`}>{msg.subject}</p>
                   <p className="text-[11px] text-neutral-400 line-clamp-1">{msg.preview}</p>
                   
                   <div className="mt-2 flex gap-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full 
                        ${msg.type === 'quote' ? 'bg-blue-100 text-blue-700' : 
                          msg.type === 'question' ? 'bg-orange-100 text-orange-700' : 
                          'bg-gray-100 text-gray-600'}`}>
                        {msg.tag}
                      </span>
                   </div>
                </div>
              ))}
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
                            <p className="text-xs text-neutral-400">a Me • {selectedMsg.date}</p>
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
                   <p>Gentile Dottore,</p>
                   <br />
                   <p>{selectedMsg.preview}</p>
                   <p>Restiamo in attesa di un suo gentile riscontro per procedere con la lavorazione nel più breve tempo possibile.</p>
                   <br />
                   <p>Cordiali saluti,<br/>Laboratorio Mimesi</p>

                   {/* Esempio Azione contestuale */}
                   {selectedMsg.type === 'quote' && (
                     <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-center gap-4">
                        <FileText className="text-blue-600" size={24} />
                        <div className="flex-1">
                           <p className="text-sm font-bold text-blue-900">Preventivo #2024-105.pdf</p>
                           <p className="text-xs text-blue-600">450 KB</p>
                        </div>
                        <Button className="text-xs px-3 py-1.5 h-auto">Visualizza e Firma</Button>
                     </div>
                   )}
                </div>

                {/* Footer Risposta */}
                <div className="p-4 border-t border-neutral-100 bg-neutral-50 flex gap-3">
                   <input type="text" placeholder="Scrivi una risposta rapida..." className="flex-1 px-4 py-2 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm" />
                   <Button variant="gradient" className="px-6">Invia</Button>
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