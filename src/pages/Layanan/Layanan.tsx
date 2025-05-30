import React from 'react';
import { Link } from 'react-router-dom';
import './Layanan.css';
import Header from '../../components/Header/Header';
import pasienImg from '../../assets/pasien.png';
import dokterImg from '../../assets/dokter.png';
import janjiTemuImg from '../../assets/janji-temu.png';
import rekamMedisImg from '../../assets/rekam-medis.png';
import resepObatImg from '../../assets/resep-obat.png';

const Layanan: React.FC = () => {
  return (
    <div className="layanan-page">
      <Header />
      <div className="layanan-container">
        <div className="layanan-grid">
          <Link to="/pasien" className="layanan-card-link">
            <div className="layanan-card">
              <img src={pasienImg} alt="Pasien" />
              <div className="layanan-card-label">PASIEN</div>
            </div>
          </Link>
          <Link to="/dokter" className="layanan-card-link">
            <div className="layanan-card">
              <img src={dokterImg} alt="Dokter" />
              <div className="layanan-card-label">DOKTER</div>
            </div>
          </Link>
          <Link to="/janjitemu" className="layanan-card-link">
            <div className="layanan-card">
              <img src={janjiTemuImg} alt="Janji Temu" />
              <div className="layanan-card-label">JANJI TEMU</div>
            </div>
          </Link>
          <Link to="/rekam-medis" className="layanan-card-link">
            <div className="layanan-card">
              <img src={rekamMedisImg} alt="Rekam Medis" />
              <div className="layanan-card-label">REKAM MEDIS</div>
            </div>
          </Link>
          <Link to="/resep-obat" className="layanan-card-link">
            <div className="layanan-card">
              <img src={resepObatImg} alt="Resep Obat" />
              <div className="layanan-card-label">RESEP OBAT</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Layanan;
