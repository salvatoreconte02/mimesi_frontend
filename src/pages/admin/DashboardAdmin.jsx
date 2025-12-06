import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Trash2, User, FileText, Bell, Download, CheckCircle, XCircle, Info, Calendar, Layers, Box, Image as ImageIcon } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

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

                {/* Corpo Dettaglio */}
                <div className="flex-1 overflow-y-auto p-6 bg-neutral-50/50">
                  {selectedMsg.fullData ? (
                    <div className="space-y-6">
                      
                      {/* Componente visualizzazione scheda (Definito sotto) */}
                      <RiepilogoScheda 
                        data={selectedMsg.fullData} 
                      />

                      {/* Sezione Download File */}
                      <div className="bg-white border border-neutral-200 rounded-xl p-4 flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                               <FileText size={20} />
                            </div>
                            <div>
                               <p className="font-bold text-sm text-neutral-800">Scansioni & Allegati</p>
                               <p className="text-xs text-neutral-500">
                                  {selectedMsg.fullData.filesMetadata?.length || 0} File • {selectedMsg.fullData.photosMetadata?.length || 0} Foto
                               </p>
                            </div>
                         </div>
                         <Button variant="secondary" className="text-xs">
                            <Download size={14} className="mr-2" /> Scarica ZIP
                         </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white p-6 rounded-xl border border-neutral-200">
                      <p className="text-neutral-600">{selectedMsg.preview}</p>
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
              <div className="h-full bg-neutral-50 rounded-2xl border-2 border-dashed border-neutral-200 flex flex-col items-center justify-center text-neutral-400">
                <Mail size={64} className="mb-4 opacity-10" />
                <p className="font-medium">Seleziona una richiesta</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// --- COMPONENTE INTERNO PER VISUALIZZARE LA SCHEDA (READ-ONLY) ---
function RiepilogoScheda({ data }) {
    if(!data) return null;

    // Per sicurezza, se i metadati non esistono, usiamo array vuoti
    const filesMeta = data.filesMetadata || [];
    const photosMeta = data.photosMetadata || [];
    const configuredElements = data.elements || [];

    return (
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
            {/* Header Scheda Interno (opzionale se già c'è fuori) */}
            <div className="bg-neutral-50 px-6 py-4 border-b border-neutral-200">
                <h3 className="font-bold text-neutral-700">Dettaglio Prescrizione</h3>
            </div>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* CELLA 1: Anagrafica + Materiali */}
                <div className="space-y-6">
                    <div>
                        <h4 className="flex items-center gap-2 text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3">
                            <User size={14}/> Dati Paziente
                        </h4>
                        <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                            <div className="flex justify-between mb-2">
                                <span className="text-xs text-neutral-500">Paziente</span>
                                <span className="font-bold text-sm text-neutral-800">{data.nome} {data.cognome}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-xs text-neutral-500">Codice</span>
                                <span className="font-mono text-xs bg-white px-2 rounded border">{data.codicePaziente}</span>
                            </div>
                            {(data.allergie || data.bruxismo) && (
                                <div className="mt-3 pt-2 border-t border-neutral-200 text-xs text-red-500 font-medium">
                                    ⚠ Note: {[data.allergie && 'Allergie', data.bruxismo && 'Bruxismo'].filter(Boolean).join(', ')}
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <h4 className="flex items-center gap-2 text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3">
                            <Layers size={14}/> Materiali
                        </h4>
                        <div className="flex gap-3">
                            <div className="flex-1 bg-blue-50 px-3 py-2 rounded-lg border border-blue-100">
                                <span className="block text-[9px] text-blue-400 uppercase font-bold">Materiale</span>
                                <span className="text-sm font-bold text-blue-800 capitalize">{data.technicalInfo?.material?.replace('_', ' ')}</span>
                            </div>
                            <div className="flex-1 bg-purple-50 px-3 py-2 rounded-lg border border-purple-100">
                                <span className="block text-[9px] text-purple-400 uppercase font-bold">Colore</span>
                                <span className="text-sm font-bold text-purple-800">{data.technicalInfo?.color}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CELLA 2: Elementi */}
                <div className="flex flex-col">
                    <h4 className="flex items-center gap-2 text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3">
                        <Info size={14}/> Configurazione Elementi
                    </h4>
                    <div className="bg-neutral-50 rounded-xl p-2 border border-neutral-200 flex-1 min-h-[150px] space-y-2">
                        {configuredElements.map((el, idx) => (
                            <div key={idx} className="flex justify-between items-center p-3 bg-white rounded-lg border border-neutral-100 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-neutral-100 flex items-center justify-center text-[10px] font-bold">
                                        {el.teeth.length}
                                    </div>
                                    <div>
                                        <p className="font-bold text-xs text-neutral-700">{el.isBridge ? 'Ponte' : 'Singolo'}</p>
                                        <p className="text-[10px] text-neutral-400">{el.teeth.join('-')}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CELLA 3: File */}
                <div>
                     <h4 className="flex items-center gap-2 text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3">
                        <FileText size={14}/> File & Impronta
                     </h4>
                     <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-100 space-y-2">
                        {filesMeta.length > 0 ? (
                            <ul className="space-y-1">
                                {filesMeta.map((f, i) => (
                                    <li key={i} className="flex items-center gap-2 text-xs text-neutral-600">
                                        <Box size={12} className="text-blue-500"/> <span className="truncate">{f.name}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : <span className="text-xs text-neutral-400 italic">Nessun file 3D</span>}
                        
                        {photosMeta.length > 0 && (
                            <div className="pt-2 border-t border-neutral-200 text-xs font-medium text-neutral-600 flex items-center gap-1">
                                <ImageIcon size={12}/> {photosMeta.length} Foto allegate
                            </div>
                        )}
                        
                        <div className="pt-2 border-t border-neutral-200 grid grid-cols-2 gap-2">
                            <div>
                                <span className="text-[9px] text-neutral-400 block uppercase">Rilevazione</span>
                                <span className="text-xs font-medium capitalize">{data.impressionParams?.material?.replace('_', ' ') || '-'}</span>
                            </div>
                            <div>
                                <span className="text-[9px] text-neutral-400 block uppercase">Disinfezione</span>
                                <span className="text-xs font-medium capitalize">{data.impressionParams?.disinfection?.replace('_', ' ') || '-'}</span>
                            </div>
                        </div>
                     </div>
                </div>

                {/* CELLA 4: Date */}
                <div>
                    <h4 className="flex items-center gap-2 text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3">
                        <Calendar size={14}/> Pianificazione
                    </h4>
                    <div className="space-y-2">
                        <div className="bg-green-50 p-3 rounded-xl border border-green-100 flex justify-between items-center">
                            <span className="text-xs font-bold text-green-700">Consegna</span>
                            <span className="font-bold text-green-800">{data.dates?.delivery ? new Date(data.dates.delivery).toLocaleDateString() : '-'}</span>
                        </div>
                        <div className="flex gap-2">
                            {[1,2,3].map(i => data.dates?.[`tryIn${i}`] && (
                                <div key={i} className="flex-1 bg-white border border-dashed border-neutral-300 p-2 rounded-lg text-center">
                                    <span className="block text-[9px] text-neutral-400 uppercase font-bold">Prova {i}</span>
                                    <span className="text-xs font-medium text-neutral-700">{new Date(data.dates[`tryIn${i}`]).toLocaleDateString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}