import { Link } from 'react-router-dom';
import Logo from '../assets/logo.png';

export default function NavBar() {
  return (
    <header className="fixed color top-4 left-1/2 transform -translate-x-1/2 w-[95%] max-w-6xl z-50">
      <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white/10 backdrop-blur-lg px-6 py-4 rounded-2xl shadow-lg text-white">

        {/* Logo + Brand */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img src={Logo} alt="Jack's Landing Logo" className="w-12 h-12 object-contain" />
            <span className="font-light text-xl tracking-wider">JACK'S LANDING</span>
          </div>

          {/* Hamburger icon (mobile only) */}
          <label htmlFor="nav-toggle" className="sm:hidden cursor-pointer">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </label>
        </div>

        {/* Hidden checkbox toggle */}
        <input type="checkbox" id="nav-toggle" className="peer hidden" />

        {/* Navigation Links */}
        <nav
          aria-label="Main Navigation"
          className="peer-checked:block hidden sm:block pt-4 sm:pt-0"
        >
          <ul className="flex flex-col sm:flex-row gap-y-4 sm:gap-x-10 text-base font-light tracking-wide">
            <li><Link to="/" className="hover:text-white/80 transition-colors">Home</Link></li>
            <li><Link to="/activities" className="hover:text-white/80 transition-colors">Activities</Link></li>
            <li><Link to="/availability" className="hover:text-white/80 transition-colors">Availability</Link></li>
            <li><Link to="/contact" className="hover:text-white/80 transition-colors">Contact Us</Link></li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
