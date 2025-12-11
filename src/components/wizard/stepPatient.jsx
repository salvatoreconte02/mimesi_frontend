import { motion } from 'framer-motion';
import { User, Building } from 'lucide-react';
import Button from '../ui/Button';

export default function StepPatient({ 
  formData, setFormData, 
  onNext, 
  isAdmin, 
  originalData,
  readOnlyDoctorData = false // NUOVA PROP: Se true, i campi dottore sono disabilitati
}) {
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const getDiffClass = (fieldName) => {
      if (!isAdmin || !originalData) return 'border-neutral-200 bg-neutral-50';
      const currentVal = formData[fieldName];
      const originalVal = originalData[fieldName];
      if (currentVal != originalVal) {
          return 'border-orange-300 bg-orange-50 ring-1 ring-orange-200';
      }
      return 'border-neutral-200 bg-neutral-50';
  };

  const isCodiceValid = formData.codicePaziente && formData.codicePaziente.trim().length > 0;
  // Se è Admin in validazione, i campi dottore sono già compilati, quindi validi.
  const isDoctorValid = !isAdmin || (formData.nomeDottore?.trim() && formData.cognomeDottore?.trim() && formData.nomeStudio?.trim());
  const canProceed = isCodiceValid && isDoctorValid;

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
      
      {/* SEZIONE ADMIN (Dottore/Studio) */}
      {isAdmin && (
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-sm text-neutral-800 flex items-center gap-2">
                    <Building size={18}/> Dati Richiedente
                </h4>
                {readOnlyDoctorData && (
                    <span className="text-[10px] uppercase font-bold bg-neutral-100 text-neutral-500 px-2 py-1 rounded">
                        Sola Lettura
                    </span>
                )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="text-xs font-bold text-neutral-500 uppercase mb-1 block">Nome Dottore</label>
                    <input 
                        type="text" name="nomeDottore"
                        disabled={readOnlyDoctorData} // DISABILITA IN VALIDAZIONE
                        className={`w-full p-2.5 rounded-xl border outline-none focus:ring-2 focus:ring-primary/20 
                            ${getDiffClass('nomeDottore')} 
                            ${readOnlyDoctorData ? 'opacity-60 cursor-not-allowed bg-neutral-100' : ''}`}
                        value={formData.nomeDottore} onChange={handleChange} 
                    />
                </div>
                <div>
                    <label className="text-xs font-bold text-neutral-500 uppercase mb-1 block">Cognome Dottore</label>
                    <input 
                        type="text" name="cognomeDottore"
                        disabled={readOnlyDoctorData}
                        className={`w-full p-2.5 rounded-xl border outline-none focus:ring-2 focus:ring-primary/20 
                            ${getDiffClass('cognomeDottore')}
                            ${readOnlyDoctorData ? 'opacity-60 cursor-not-allowed bg-neutral-100' : ''}`}
                        value={formData.cognomeDottore} onChange={handleChange} 
                    />
                </div>
                <div>
                    <label className="text-xs font-bold text-neutral-500 uppercase mb-1 block">Studio</label>
                    <input 
                        type="text" name="nomeStudio"
                        disabled={readOnlyDoctorData}
                        className={`w-full p-2.5 rounded-xl border outline-none focus:ring-2 focus:ring-primary/20 
                            ${getDiffClass('nomeStudio')}
                            ${readOnlyDoctorData ? 'opacity-60 cursor-not-allowed bg-neutral-100' : ''}`}
                        value={formData.nomeStudio} onChange={handleChange} 
                    />
                </div>
            </div>
        </div>
      )}

      {/* SEZIONE PAZIENTE */}
      <div className="bg-white p-1 rounded-xl">
          <h4 className="font-bold text-sm text-neutral-800 mb-4 flex items-center gap-2 px-1">
             <User size={18} className="text-primary"/> Anagrafica Paziente
          </h4>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs font-bold text-neutral-500 uppercase mb-1 block">Nome</label>
              <input 
                type="text" name="nome"
                className={`w-full p-2.5 rounded-xl border outline-none focus:ring-2 focus:ring-primary/20 ${getDiffClass('nome')}`} 
                value={formData.nome} onChange={handleChange} 
              />
            </div>
            <div>
              <label className="text-xs font-bold text-neutral-500 uppercase mb-1 block">Cognome</label>
              <input 
                type="text" name="cognome"
                className={`w-full p-2.5 rounded-xl border outline-none focus:ring-2 focus:ring-primary/20 ${getDiffClass('cognome')}`} 
                value={formData.cognome} onChange={handleChange} 
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
             <div className="col-span-1">
               <label className="text-xs font-bold text-primary uppercase mb-1 block">Codice Paziente *</label>
               <input 
                 type="text" name="codicePaziente"
                 className={`w-full p-2.5 rounded-xl border outline-none focus:ring-2 focus:ring-primary/20 font-bold 
                    ${formData.codicePaziente != originalData?.codicePaziente && isAdmin ? 'border-orange-300 bg-orange-50' : 
                      !isCodiceValid ? 'border-red-300 bg-red-50' : 'border-primary/30 bg-primary/5 text-primary'}`}
                 value={formData.codicePaziente} onChange={handleChange} 
               />
             </div>
             <div>
               <label className="text-xs font-bold text-neutral-500 uppercase mb-1 block">Età</label>
               <input type="number" name="eta" className={`w-full p-2.5 rounded-xl border outline-none focus:ring-2 focus:ring-primary/20 ${getDiffClass('eta')}`} value={formData.eta} onChange={handleChange} />
             </div>
             <div>
               <label className="text-xs font-bold text-neutral-500 uppercase mb-1 block">Sesso</label>
               <select name="sesso" className={`w-full p-2.5 rounded-xl border outline-none focus:ring-2 focus:ring-primary/20 ${getDiffClass('sesso')}`} value={formData.sesso} onChange={handleChange}>
                  <option value="M">Maschio</option>
                  <option value="F">Femmina</option>
               </select>
             </div>
          </div>
      </div>

      <div className="bg-neutral-50 p-5 rounded-2xl border border-neutral-200 mt-4">
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
           <Button onClick={onNext} disabled={!canProceed}>
              Prosegui con Lavorazione →
           </Button>
        </div>
      </div>
    </motion.div>
  );
}