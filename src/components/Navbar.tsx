import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Trophy, Calendar, Users, BarChart3, LogOut, Menu, X, Star } from 'lucide-react';

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = React.useState(false);

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  const links = [
    { to: '/', label: 'Matchs', icon: Calendar },
    { to: '/favoris', label: 'Favoris', icon: Star },
    { to: '/classement', label: 'Classement', icon: BarChart3 },
    { to: '/groupes', label: 'Groupes', icon: Users },
  ];

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
            <span className="nav-username">{currentUser.displayName}</span>
            <button onClick={handleLogout} className="btn-logout">
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
