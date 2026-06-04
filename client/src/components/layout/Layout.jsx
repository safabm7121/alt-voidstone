import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = () => {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Outlet key={location.pathname} />
      </main>
      {isHome && <Footer />}
    </>
  );
};

export default Layout;