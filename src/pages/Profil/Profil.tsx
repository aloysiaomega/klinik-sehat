import React, { useState, useEffect, useRef } from 'react';
import Header from '../../components/Header/Header';
import './Profil.css';

const Profil: React.FC = () => {
  // State data user
  const [fotoProfil, setFotoProfil] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [nama, setNama] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [telepon, setTelepon] = useState<string>('');
  const [alamat, setAlamat] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Ref untuk input file tersembunyi
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Ambil data user dari API saat komponen dimuat
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    fetch('https://klinik.aloycantik.xyz/api/user', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        // Asumsikan respons API mengembalikan: { nama, email, telepon, alamat, foto }
        setNama(data.nama);
        setEmail(data.email);
        setTelepon(data.telepon);
        setAlamat(data.alamat);
        if (data.foto) {
          setFotoProfil(`https://klinik.aloycantik.xyz/storage/profile_images/${data.foto}`);
        }
      })
      .catch((err) => console.error('Gagal mengambil data user:', err));
  }, []);

  // Fungsi untuk menangani perubahan foto profil melalui input file
  const handleFotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setFotoProfil(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Fungsi untuk memicu klik pada input file tersembunyi (untuk membuka kamera)
  const handleAmbilGambar = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Fungsi menyimpan perubahan ke API
  const handleSaveChanges = () => {
    setIsProcessing(true);
    const token = localStorage.getItem('access_token');
    if (!token) return;

    const formData = new FormData();
    formData.append('nama', nama);
    formData.append('email', email);
    formData.append('telepon', telepon);
    formData.append('alamat', alamat);
    if (selectedFile) {
      formData.append('foto', selectedFile);
    }

    fetch('https://klinik.aloycantik.xyz/api/user', {
      method: 'PUT', // atau POST sesuai dengan API Anda
      headers: {
        'Authorization': `Bearer ${token}`
        // Jangan sertakan Content-Type ketika menggunakan FormData
      },
      body: formData,
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Gagal menyimpan perubahan.');
        }
        return res.json();
      })
      .then((data) => {
        if (data.foto) {
          setFotoProfil(`https://klinik.aloycantik.xyz/storage/profile_images/${data.foto}`);
        }
        setIsProcessing(false);
        setSuccessMessage('Perubahan berhasil disimpan!');
        setTimeout(() => setSuccessMessage(''), 3000);
      })
      .catch((err) => {
        console.error(err);
        setIsProcessing(false);
      });
  };

  return (
    <div className="profil-page">
      <Header />

      <div className="profil-container">
        <div className="profil-header">
          <h2>Profil Saya</h2>
        </div>

        <div className="profil-content">
          <div className="profil-image">
            {fotoProfil ? (
              <img src={fotoProfil} alt="Foto Profil" className="circle-image" />
            ) : (
              <div className="profil-icon">👤</div>
            )}
          </div>

          {/* Input file tersembunyi untuk upload dan capture */}
          <input 
            type="file" 
            accept="image/*" 
            capture="environment" 
            onChange={handleFotoChange} 
            ref={fileInputRef}
            className="upload-input"
          />

          {/* Tombol untuk membuka kamera / ambil gambar */}
          <button className="capture-button" onClick={handleAmbilGambar}>
            Ambil Gambar
          </button>

          {/* Form info profil yang bisa diedit */}
          <div className="profil-info">
            <div className="info-item">
              <label>Nama:</label>
              <input type="text" value={nama} onChange={(e) => setNama(e.target.value)} />
            </div>
            <div className="info-item">
              <label>Email:</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="info-item">
              <label>Nomor Telepon:</label>
              <input type="text" value={telepon} onChange={(e) => setTelepon(e.target.value)} />
            </div>
            <div className="info-item">
              <label>Alamat:</label>
              <textarea value={alamat} onChange={(e) => setAlamat(e.target.value)} />
            </div>
          </div>

          {isProcessing && <p className="processing-message">Memproses...</p>}
          {successMessage && <p className="success-message">{successMessage}</p>}

          <button className="edit-button" onClick={handleSaveChanges} disabled={isProcessing}>
            Simpan Perubahan
          </button>
        </div>
      </div>

      <footer className="profil-footer">
        <p>&copy; 2025 Klinik Sehat | Semua Hak Dilindungi</p>
      </footer>
    </div>
  );
};

export default Profil;
