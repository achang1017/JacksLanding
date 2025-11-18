import { Link } from 'react-router-dom';
import Logo from '../assets/logo.png';

export default function NavBar() {
  return (
    <header className="
      fixed color top-4 left-1/2 transform -translate-x-1/2
      w-[94%] sm:w-[95%] md:w-[96%] lg:w-[98%] 
      max-w-7xl z-50
    ">
      <div className="
        relative flex flex-col sm:flex-row sm:items-center sm:justify-between
        bg-neutral-800/30 backdrop-blur-lg 
        px-4 py-2         /* mobile */
        sm:px-6 sm:py-4   /* tablet */
        md:px-8 md:py-4   /* laptop */
        lg:px-10 lg:py-4  /* desktop */
        rounded-2xl shadow-lg text-white
      ">

        {/* Logo + Brand */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">

            {/* Responsive Logo Size */}
            <img
              src={Logo}
              alt="Jack's Landing Logo"
              className="
                object-contain 
                w-18 h-18        /* mobile */
                sm:w-12 sm:h-12  /* tablet */
                md:w-14 md:h-14  /* laptop */
                lg:w-16 lg:h-16  /* desktop */
              "
            />

            {/* Responsive Brand Text Size */}
            <span className="
              font-light tracking-wider 
              text-lg        /* mobile */
              sm:text-xl     /* tablet */
              md:text-2xl    /* laptop */
              lg:text-3xl    /* desktop */
            ">
              Jack's Landing
            </span>
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
          className="peer-checked:block hidden sm:block pt-3 sm:pt-0"
        >
          <ul className="flex flex-col sm:flex-row gap-y-4 sm:gap-x-10 text-base font-light tracking-wide">
            <li><Link to="/" className="hover:text-white/80 transition-colors">Home</Link></li>
            <li><Link to="/Activities" className="hover:text-white/80 transition-colors">Activities</Link></li>
            <li><Link to="/Availability" className="hover:text-white/80 transition-colors">Availability</Link></li>
            <li><Link to="/Contact" className="hover:text-white/80 transition-colors">Contact Us</Link></li>
          </ul>
        </nav>

      </div>
    </header>
  );
}
