import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import './Header.css';
import logoPuskesmas from '../../assets/logo-puskesmas.png';

const Header: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const history = useHistory();

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const navigateTo = (path: string) => {
    closeSidebar();
    history.push(path);
  };

  return (
    <>
      <header className="app-header">
        <div className="header-left">
          <div className="menu-icon" onClick={toggleSidebar}>☰</div>
        </div>
        <div className="header-center">
          <img src={logoPuskesmas} alt="Logo Puskesmas" className="header-logo" />
          <div className="header-text">
            <span className="clinic">KLINIK</span>
            <span className="health">KESEHATAN</span>
          </div>
        </div>
        <div className="header-right">
          {/* Elemen tambahan jika diperlukan */}
        </div>
      </header>

      {/* Overlay muncul jika sidebar terbuka */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar}></div>}

      {/* Sidebar */}
      <nav className={`side-menu ${sidebarOpen ? 'open' : ''}`}>
        <ul>
          <li onClick={() => navigateTo('/dashboard')}>Beranda</li>
          <li>
            <div className="parent-item" onClick={() => navigateTo('/layanan')}>
              Layanan
            </div>
            <ul className="sub-menu">
              <li onClick={() => navigateTo('/pasien')}>Pasien</li>
              <li onClick={() => navigateTo('/dokter')}>Dokter</li>
              <li onClick={() => navigateTo('/janjitemu')}>Janji Temu</li>
              <li onClick={() => navigateTo('/rekammedis')}>Rekam Medis</li>
              <li onClick={() => navigateTo('/resepobat')}>Resep Obat</li>
            </ul>
          </li>
          <li onClick={() => navigateTo('/profil')}>Profil</li>
          <li onClick={() => navigateTo('/logout')}>Logout</li>
        </ul>
      </nav>
    </>
  );
};

export default Header;
