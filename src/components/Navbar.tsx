import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Trophy, Calendar, Users, BarChart3, Menu, X, Star, Settings, LogOut, FlaskConical } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [open, setOpen] = React.useState(false);

  const links = [
    { to: '/', label: 'Matchs', icon: Calendar },
    { to: '/favoris', label: 'Favoris', icon: Star },
    { to: '/classement', label: 'Classement', icon: BarChart3 },
    { to: '/groupes', label: 'Groupes', icon: Users },
    { to: '/parametres', label: 'Paramètres', icon: Settings },
    { to: '/test', label: 'Test', icon: FlaskConical },
    { to: '/retuyrraz', label: 'Retuyrraz', icon: Menu },
  ];

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
