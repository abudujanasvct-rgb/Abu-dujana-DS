import { NavLink } from 'react-router-dom';
import './Nav.css';

const links = [
  { to: '/', label: 'Home' },
  { to: '/projects', label: 'Projects' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' }
];

export default function Nav() {
  return (
    <header className="nav">
      <div className="container nav-inner">
        <NavLink to="/" className="nav-logo">
          <span className="nav-logo-mark">AD</span>
          <span className="nav-logo-cursor">_</span>
        </NavLink>

        <nav className="nav-links">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
