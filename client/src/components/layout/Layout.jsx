// client/src/components/layout/Layout.jsx
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = () => {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      {isHome && <Footer />}
    </div>
  );
};

export default Layout;