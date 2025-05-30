import React, { useState, useEffect } from 'react';
import Header from '../../components/Header/Header';
import './Profil.css';

const Profil: React.FC = () => {
  const [fotoProfil, setFotoProfil] = useState<string | null>(null);
  const [nama, setNama] = useState<string>('Aloysia Omega');
  const [email, setEmail] = useState<string>('aloysia@gmail.com');
  const [telepon, setTelepon] = useState<string>('088745698510');
  const [alamat, setAlamat] = useState<string>('Jl. Jalan No.10, Banjarsari, Jawa Tengah');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Ambil foto profil dari localStorage saat halaman dimuat
  useEffect(() => {
    const storedFoto = localStorage.getItem('fotoProfil');
    if (storedFoto) {
      setFotoProfil(storedFoto);
    }
  }, []);

  // Fungsi untuk menangani perubahan foto profil
  const handleFotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const imageData = reader.result as string;
        setFotoProfil(imageData);
        localStorage.setItem('fotoProfil', imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  // Fungsi menyimpan perubahan profil
  const handleSaveChanges = () => {
    setIsProcessing(true); // Menampilkan "Memproses..."

    setTimeout(() => {
      localStorage.setItem('nama', nama);
      localStorage.setItem('email', email);
      localStorage.setItem('telepon', telepon);
      localStorage.setItem('alamat', alamat);

      setIsProcessing(false); // Sembunyikan "Memproses..."
      setSuccessMessage('Perubahan berhasil disimpan!'); // Tampilkan notifikasi sukses

      setTimeout(() => setSuccessMessage(''), 3000); // Hapus notifikasi setelah 3 detik
    }, 2000); // Simulasi proses penyimpanan selama 2 detik
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

          {/* Input Upload Foto */}
          <label className="upload-label">
            Pilih Foto
            <input type="file" accept="image/*" onChange={handleFotoChange} className="upload-input" />
          </label>

          {/* Info Profil yang Bisa Diedit */}
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

          {/* Tampilan "Memproses..." */}
          {isProcessing && <p className="processing-message">Memproses...</p>}

          {/* Tampilan notifikasi sukses */}
          {successMessage && <p className="success-message">{successMessage}</p>}

          <button className="edit-button" onClick={handleSaveChanges} disabled={isProcessing}>
            Simpan Perubahan
          </button>
        </div>
      </div>

      {/* Footer di bagian bawah halaman */}
      <footer className="profil-footer">
        <p>&copy; 2025 Klinik Sehat | Semua Hak Dilindungi</p>
      </footer>
    </div>
  );
};

export default Profil;
