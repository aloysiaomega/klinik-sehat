import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { IonAlert } from '@ionic/react'; // 1. Impor IonAlert
import './Header.css';
import logoPuskesmas from '../../assets/logo-puskesmas.png'; // Pastikan path ini benar

const Header: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutAlert, setShowLogoutAlert] = useState(false); // 2. State untuk alert
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

  // 5. Fungsi yang menjalankan proses logout sebenarnya
  const executeLogout = async () => {
    const token = localStorage.getItem('access_token');

    // Tutup alert dan sidebar
    setShowLogoutAlert(false);
    closeSidebar();

    if (!token) {
      history.push('/login');
      return;
    }

    try {
      const response = await fetch('https://klinik.aloycantik.xyz/api/logout', {
        method: 'POST', // Sesuaikan metode API
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        console.error('Server logout failed:', response.status, await response.text());
      }
    } catch (error) {
      console.error('Error during logout API call:', error);
    } finally {
      localStorage.removeItem('access_token');
      // localStorage.removeItem('user_data'); // Contoh
      history.push('/login');
      // window.location.reload(); // Opsional
    }
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

      {sidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar}></div>}

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
          {/* 3. Tampilkan alert saat Logout diklik */}
          <li onClick={() => {
            closeSidebar(); // Tutup sidebar dulu jika terbuka
            setShowLogoutAlert(true);
          }}>Logout</li> 
        </ul>
      </nav>

      {/* 4. Definisikan IonAlert */}
      <IonAlert
        isOpen={showLogoutAlert}
        onDidDismiss={() => setShowLogoutAlert(false)} // Tutup alert jika diklik di luar atau tombol cancel
        header={'Konfirmasi Logout'}
        message={'Apakah Anda yakin ingin logout?'}
        buttons={[
          {
            text: 'Batal',
            role: 'cancel', // Peran 'cancel' akan menutup alert
            cssClass: 'secondary', // Opsional: styling
            handler: () => {
              setShowLogoutAlert(false);
            }
          },
          {
            text: 'Ya, Logout',
            handler: () => {
              executeLogout(); // Panggil fungsi logout sebenarnya
            }
          }
        ]}
      />
    </>
  );
};

export default Header;