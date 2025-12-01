import { create } from 'zustand';

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  
  login: (role) => set({
    isAuthenticated: true,
    user: {
      id: 1,
      name: role === 'dottore' ? 'Dr. Mario Rossi' : (role === 'admin' ? 'Amministrazione' : 'Luca Operatore'),
      role: role,
      avatar: `https://ui-avatars.com/api/?name=${role}&background=2D5BA6&color=fff`
    }
  }),
  
  logout: () => set({ user: null, isAuthenticated: false }),
}));

export default useAuthStore;