import { motion } from 'framer-motion';
import { User, Building, AlertCircle } from 'lucide-react';
import Button from '../ui/Button';

export default function StepPatient({ formData, setFormData, onNext, isAdmin }) {
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Validazione Condizionale
  const isCodiceValid = formData.codicePaziente && formData.codicePaziente.trim().length > 0;
  
  // Se è Admin, deve compilare anche Nome Dottore e Studio manualmente
  const isDoctorValid = !isAdmin || (formData.nomeDottore?.trim() && formData.nomeStudio?.trim());

  const canProceed = isCodiceValid && isDoctorValid;

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
      
      {/* SEZIONE ESCLUSIVA ADMIN: DATI RICHIEDENTE */}
      {isAdmin && (
        <div className="bg-orange-50 p-5 rounded-2xl border border-orange-200 shadow-sm">
            <h4 className="font-bold text-sm text-orange-800 mb-4 flex items-center gap-2">
                <Building size={18}/> Dati Richiedente (Compilazione Admin)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-bold text-neutral-500 uppercase mb-1 block">Nome e Cognome Dottore *</label>
                    <div className="relative">
                        <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"/>
                        <input 
                            type="text" 
                            name="nomeDottore"
                            className="w-full pl-9 pr-3 py-2 rounded-xl border border-orange-200 bg-white focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                            placeholder="Es. Mario Rossi"
                            value={formData.nomeDottore} 
                            onChange={handleChange} 
                        />
                    </div>
                </div>
                <div>
                    <label className="text-xs font-bold text-neutral-500 uppercase mb-1 block">Nome Studio / Clinica *</label>
                    <div className="relative">
                        <Building size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"/>
                        <input 
                            type="text" 
                            name="nomeStudio"
                            className="w-full pl-9 pr-3 py-2 rounded-xl border border-orange-200 bg-white focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                            placeholder="Es. Studio Dentistico Rossi"
                            value={formData.nomeStudio} 
                            onChange={handleChange} 
                        />
                    </div>
                </div>
            </div>
            {!isDoctorValid && (
                <p className="text-[10px] text-red-500 mt-2 font-medium flex items-center gap-1">
                    <AlertCircle size={12}/> Questi dati sono obbligatori per creare una richiesta come Admin.
                </p>
            )}
        </div>
      )}

      {/* Dati Paziente Standard */}
      <div className="bg-white p-1 rounded-xl">
          <h4 className="font-bold text-sm text-neutral-800 mb-4 flex items-center gap-2 px-1">
             <User size={18} className="text-primary"/> Anagrafica Paziente
          </h4>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs font-bold text-neutral-500 uppercase mb-1 block">Nome</label>
              <input type="text" name="nome" className="w-full p-2.5 rounded-xl border border-neutral-200 outline-none focus:ring-2 focus:ring-primary/20 bg-neutral-50" value={formData.nome} onChange={handleChange} placeholder="Opzionale" />
            </div>
            <div>
              <label className="text-xs font-bold text-neutral-500 uppercase mb-1 block">Cognome</label>
              <input type="text" name="cognome" className="w-full p-2.5 rounded-xl border border-neutral-200 outline-none focus:ring-2 focus:ring-primary/20 bg-neutral-50" value={formData.cognome} onChange={handleChange} placeholder="Opzionale" />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
             <div className="col-span-1">
               <label className="text-xs font-bold text-primary uppercase mb-1 block">Codice Paziente *</label>
               <input 
                 type="text" name="codicePaziente"
                 className={`w-full p-2.5 rounded-xl border outline-none focus:ring-2 focus:ring-primary/20 font-bold ${!isCodiceValid ? 'border-red-300 bg-red-50 text-red-900 placeholder:text-red-300' : 'border-primary/30 bg-primary/5 text-primary'}`}
                 value={formData.codicePaziente} onChange={handleChange} placeholder="Es. PZ-001" 
               />
             </div>
             <div>
               <label className="text-xs font-bold text-neutral-500 uppercase mb-1 block">Età</label>
               <input type="number" name="eta" className="w-full p-2.5 rounded-xl border border-neutral-200 outline-none focus:ring-2 focus:ring-primary/20 bg-neutral-50" value={formData.eta} onChange={handleChange} />
             </div>
             <div>
               <label className="text-xs font-bold text-neutral-500 uppercase mb-1 block">Sesso</label>
               <select name="sesso" className="w-full p-2.5 rounded-xl border border-neutral-200 outline-none bg-neutral-50 focus:ring-2 focus:ring-primary/20" value={formData.sesso} onChange={handleChange}>
                  <option value="M">Maschio</option>
                  <option value="F">Femmina</option>
               </select>
             </div>
          </div>
      </div>

      {/* Anamnesi */}
      <div className="bg-neutral-50 p-5 rounded-2xl border border-neutral-200">
        <h4 className="font-bold text-xs text-neutral-500 uppercase tracking-widest mb-3">Anamnesi e Note Cliniche</h4>
        <div className="grid grid-cols-2 gap-3">
          {[
            { key: 'allergie', label: 'Allergie Accertate' }, { key: 'bruxismo', label: 'Bruxismo' },
            { key: 'disfunzioni', label: 'Disfunzioni Articolari' }, { key: 'dispositivi', label: 'Dispositivi pre-esistenti' },
            { key: 'handicap', label: 'Handicap Psicomotori' },
          ].map(item => (
            <label key={item.key} className="flex items-center gap-2 cursor-pointer select-none group">
              <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData[item.key] ? 'bg-primary border-primary text-white' : 'bg-white border-neutral-300 group-hover:border-primary'}`}>
                 {formData[item.key] && <div className="w-2 h-2 bg-white rounded-full"/>}
              </div>
              <input type="checkbox" name={item.key} className="hidden" checked={formData[item.key]} onChange={handleChange} />
              <span className={`text-sm ${formData[item.key] ? 'font-bold text-primary' : 'text-neutral-600'}`}>{item.label}</span>
            </label>
          ))}
        </div>
      </div>
      
      <div className="flex justify-end pt-4 border-t border-neutral-100 mt-4">
        <div className={!canProceed ? 'opacity-50 pointer-events-none cursor-not-allowed' : ''}>
           <Button onClick={onNext} disabled={!canProceed}>Prosegui con Lavorazione →</Button>
        </div>
      </div>
    </motion.div>
  );
}