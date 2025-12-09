import { LayoutDashboard, FileText, Users, LogOut } from 'lucide-react'; 
import useAuthStore from '../../store/authStore';
import logoImg from '../../assets/mimesilogo.jpg'; 

export default function SidebarAdmin({ setPage }) {
  const { user, logout } = useAuthStore();
  
  const menus = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'lavorazioni', icon: FileText, label: 'Lavorazioni' },
    { id: 'users', icon: Users, label: 'Utenti' },
  ];

  return (
    <div className="w-64 h-screen fixed left-0 top-0 glass-sidebar flex flex-col p-6 z-50">
      
      {/* HEADER CON LOGO */}
      <div className="flex items-center gap-3 mb-10">
        <img 
          src={logoImg} 
          alt="Mimesi Logo" 
          className="w-10 h-10 object-contain rounded-xl"
        />
        <h1 className="text-2xl font-bold tracking-tight text-primary">MIMESI</h1>
      </div>

      <div className="flex flex-col gap-2 flex-1">
        <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2 ml-2">Menu Admin</p>
        {menus.map((item) => (
          <button key={item.id} onClick={() => setPage(item.id)} 
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-600 hover:bg-primary-lighter hover:text-primary transition-colors text-left group relative">
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
            
            {item.badge && (
              <span className="absolute right-3 bg-error text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                {item.badge}
              </span>
            )}
          </button>
        ))}
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