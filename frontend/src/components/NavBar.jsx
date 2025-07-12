import { Link } from 'react-router-dom';

export default function NavBar() {
  return (
    <nav className="p-4 bg-gray-800 text-white flex gap-6">
      <Link to="/">Home</Link>
      <Link to="/activities">Activities</Link>
      <Link to="/availability">Availability</Link>
      <Link to="/contact">Contact Us</Link>
    </nav>
  );
}
