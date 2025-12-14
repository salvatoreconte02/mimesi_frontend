import { useState, useEffect } from 'react';
import { LayoutDashboard, FileText, MessageSquare, Users, LogOut, CalendarDays, Package } from 'lucide-react'; // Aggiunto Package
import useAuthStore from '../../store/authStore';
import logoImg from '../../assets/mimesilogo.jpg'; 

export default function SidebarAdmin({ setPage, page }) {
  const { user, logout } = useAuthStore();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const updateCount = () => {
      const inbox = JSON.parse(localStorage.getItem('mimesi_admin_inbox') || '[]');
      const count = inbox.filter(m => !m.read).length;
      setUnreadCount(count);
    };

    updateCount();
    const interval = setInterval(updateCount, 1000);
    return () => clearInterval(interval);
  }, []);
  
  const menus = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'planning', icon: CalendarDays, label: 'Planning Register' },
    { id: 'lavorazioni', icon: FileText, label: 'Lavorazioni' },
    { id: 'magazzino', icon: Package, label: 'Magazzino' }, // NUOVA VOCE AGGIUNTA
    { id: 'inbox', icon: MessageSquare, label: 'Inbox', badge: unreadCount },
    { id: 'users', icon: Users, label: 'Utenti' },
  ];

  return (
    <div className="w-64 h-screen fixed left-0 top-0 glass-sidebar flex flex-col p-6 z-50">
      
      {/* HEADER CON LOGO - ORA CLICCABILE */}
      <div 
        className="flex items-center gap-3 mb-10 cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => setPage('dashboard')}
      >
        <img 
          src={logoImg} 
          alt="Mimesi Logo" 
          className="w-10 h-10 object-contain rounded-xl"
        />
        <h1 className="text-2xl font-bold tracking-tight text-primary">MIMESI</h1>
      </div>

      <div className="flex flex-col gap-2 flex-1">
        <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2 ml-2">Menu Admin</p>
        {menus.map((item) => {
          const isActive = page === item.id;

          return (
            <button 
              key={item.id} 
              onClick={() => setPage(item.id)} 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left group relative
                ${isActive 
                  ? 'bg-primary text-white shadow-md shadow-primary/20' 
                  : 'text-neutral-600 hover:bg-primary-lighter hover:text-primary'
                }
              `}
            >
              <item.icon size={20} className={isActive ? 'text-white' : ''} />
              <span className="font-medium">{item.label}</span>
              
              {item.badge > 0 && (
                <span className={`absolute right-3 text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm
                  ${isActive ? 'bg-white text-primary' : 'bg-error text-white'}
                `}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="border-t border-neutral-200 pt-6">
        <div className="flex items-center gap-3 mb-4">
          <img src={user?.avatar} alt="User" className="w-10 h-10 rounded-full border-2 border-primary" />
          <div>
            <p className="text-sm font-bold text-neutral-800">{user?.name}</p>
            <p className="text-xs text-neutral-500 capitalize">{user?.role}</p>
          </div>
        </div>
        <button onClick={logout} className="flex items-center gap-2 text-error text-sm font-medium hover:opacity-80">
          <LogOut size={16} /> Disconnetti
        </button>
      </div>
    </div>
  );
}