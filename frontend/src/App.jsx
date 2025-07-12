import { Routes, Route } from 'react-router-dom';

import NavBar from './components/NavBar';
import Home from './pages/Home';
import Activities from './pages/Activities';
import Availability from './pages/Availability';
import ContactUs from './pages/ContactUs';

function App() {
  return (
    <>
      <NavBar />
      <main className="p-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/activities" element={<Activities />} />
          <Route path="/availability" element={<Availability />} />
          <Route path="/contact" element={<ContactUs />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
