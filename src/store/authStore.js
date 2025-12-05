import { create } from 'zustand';

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  
  login: (role) => {
    let userData = {};

    // Simulazione dati basata sul ruolo
    if (role === 'dottore') {
        userData = {
            id: 1,
            nome: 'Mario',
            cognome: 'Rossi',
            studio: 'Studio Dentistico Rossi', // Campo Studio aggiunto
            role: 'dottore',
            // Campo 'name' mantenuto per compatibilità con UI esistenti (Sidebar, Header)
            name: 'Dr. Mario Rossi', 
            avatar: `https://ui-avatars.com/api/?name=Mario+Rossi&background=2D5BA6&color=fff`
        };
    } else if (role === 'admin') {
        userData = {
            id: 2,
            nome: 'Admin',
            cognome: 'System',
            studio: 'Mimesi Lab',
            role: 'admin',
            name: 'Amministrazione',
            avatar: `https://ui-avatars.com/api/?name=Admin&background=purple&color=fff`
        };
    } else {
        userData = {
            id: 3,
            nome: 'Luca',
            cognome: 'Verdi',
            studio: null,
            role: 'operatore',
            name: 'Luca Operatore',
            avatar: `https://ui-avatars.com/api/?name=Luca+Verdi&background=orange&color=fff`
        };
    }

    set({
      isAuthenticated: true,
      user: userData
    });
  },
  
  logout: () => set({ user: null, isAuthenticated: false }),
}));

export default useAuthStore;