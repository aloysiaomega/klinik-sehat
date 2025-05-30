import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import Header from '../../components/Header/Header';
import './TambahPasien.css';

interface Patient {
  id?: number;
  nama: string;
  tanggal_lahir: string;
  kontak: string;
}

const TambahPasien: React.FC = () => {
  const history = useHistory();

  // Gunakan state "nama" agar sesuai dengan field API
  const [nama, setNama] = useState('');
  const [tanggalLahir, setTanggalLahir] = useState('');
  const [kontak, setKontak] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Pastikan payload menggunakan key yang benar: "nama", "tanggal_lahir", dan "kontak"
    const newPatient: Patient = {
      nama: nama,
      tanggal_lahir: tanggalLahir,
      kontak: kontak,
    };

    console.log('Payload yang dikirim:', newPatient);

    try {
      const response = await fetch("http://klinik.aloycantik.xyz/api/patients", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        // Aktifkan credentials jika menggunakan cookie-based authentication
        credentials: 'include',
        body: JSON.stringify(newPatient)
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`Gagal menambahkan pasien: ${errorMessage}`);
      }

      history.push('/pasien');
    } catch (err: any) {
      console.error("Error:", err);
      setError(err.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tambah-pasien-page">
      <Header />
      <div className="form-container">
        <h2>Tambah Data Pasien</h2>
        {error && <p className="error-message">Error: {error}</p>}
        <form onSubmit={handleSubmit} className="pasien-form">
          <div className="form-group">
            <label>Nama</label>
            <input
              type="text"
              placeholder="Masukkan nama pasien"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Tanggal Lahir</label>
            <input
              type="date"
              value={tanggalLahir}
              onChange={(e) => setTanggalLahir(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Kontak</label>
            <input
              type="tel"
              placeholder="Masukkan nomor telepon"
              value={kontak}
              onChange={(e) => setKontak(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TambahPasien;
