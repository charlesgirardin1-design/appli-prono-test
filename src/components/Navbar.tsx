import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Trophy, Calendar, Users, BarChart3, Menu, X, Star, Settings, LogOut, FlaskConical, Shield, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { isAdmin } from '../lib/auth';

type NavLink = { to: string; label: string; icon: React.ElementType };

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [open, setOpen] = React.useState(false);

  const adminUser = isAdmin(currentUser?.uid);

  const links: NavLink[] = [
    { to: '/', label: 'Matchs', icon: Calendar },
    { to: '/favoris', label: 'Favoris', icon: Star },
    { to: '/classement', label: 'Classement', icon: BarChart3 },
    { to: '/groupes', label: 'Groupes', icon: Users },
    { to: '/profil', label: 'Profil', icon: User },
    { to: '/champion', label: 'Champion', icon: Trophy },
    { to: '/parametres', label: 'Paramètres', icon: Settings },
  ];

  if (adminUser) {
    links.push({ to: '/test', label: 'Test', icon: FlaskConical });
    links.push({ to: '/admin', label: 'Admin', icon: Shield });
  }

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Trophy size={24} />
        <span>PronoFoot</span>
      </div>

      <button className="navbar-toggle" onClick={() => setOpen(!open)}>
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      <div className={`navbar-links ${open ? 'open' : ''}`}>
        {links.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className={`nav-link ${location.pathname === to ? 'active' : ''}`}
            onClick={() => setOpen(false)}
          >
            <Icon size={16} />
            {label}
          </Link>
        ))}
        {currentUser && (
          <div className="nav-user">
            <div className="nav-avatar">{currentUser.displayName.charAt(0).toUpperCase()}</div>
            <span className="nav-username">{currentUser.displayName}</span>
            <button className="btn-logout" onClick={handleLogout} title="Se déconnecter">
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
