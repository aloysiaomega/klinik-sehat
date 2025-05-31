import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import Header from '../../components/Header/Header';
import './Dokter.css';

interface Dokter {
  id: number;
  name: string;
  spesialisasi: string;
  kontak: string;
}

const Dokter: React.FC = () => {
  const history = useHistory();
  const [doctors, setDoctors] = useState<Dokter[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  // State untuk modal tambah/edit dokter
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(null);
  const [newName, setNewName] = useState('');
  const [newspesialisasi, setNewspesialisasi] = useState('');
  const [newKontak, setNewKontak] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  // State untuk konfirmasi hapus
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState<Dokter | null>(null);

  // Mengambil data dokter dari API
  useEffect(() => {
    const fetchDoctors = async () => {
      const token = localStorage.getItem('access_token');
      console.log('Token from localStorage:', token);

      if (!token) {
        setError('Token autentikasi tidak ditemukan. Silakan login terlebih dahulu.');
        history.push('/');
        return;
      }

      try {
        setLoading(true);
        const response = await fetch('https://klinik.aloycantik.xyz/api/doctors', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        console.log('GET Response status:', response.status);
        console.log('GET Response headers:', [...response.headers.entries()]);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const data = await response.json();
        console.log('Data fetched from API:', data);

        if (!Array.isArray(data)) {
          throw new Error('Data tidak dalam format array yang diharapkan: ' + JSON.stringify(data));
        }

        const converted = data.map((d: any) => ({
          id: d.id,
          name: d.nama,
          spesialisasi: d.spesialisasi,
          kontak: d.kontak,
        }));
        setDoctors(converted);
      } catch (err: any) {
        console.error('Fetch error (GET):', err);
        setError(`Gagal mengambil data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [history]);

  const filteredDoctors = doctors.filter((doctor) =>
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Fungsi untuk membuka modal tambah/edit dokter
  const openModalHandler = (doctor?: Dokter) => {
    setShowModal(true);
    setModalError('');
    if (doctor) {
      // Mode edit
      setIsEditing(true);
      setSelectedDoctorId(doctor.id);
      setNewName(doctor.name);
      setNewspesialisasi(doctor.spesialisasi);
      setNewKontak(doctor.kontak);
    } else {
      // Mode tambah
      setIsEditing(false);
      setSelectedDoctorId(null);
      setNewName('');
      setNewspesialisasi('');
      setNewKontak('');
    }
  };

  const closeModalHandler = () => {
    setShowModal(false);
    setModalError('');
    setNewName('');
    setNewspesialisasi('');
    setNewKontak('');
    setIsEditing(false);
    setSelectedDoctorId(null);
  };

  // Fungsi membuka modal konfirmasi hapus
  const openDeleteConfirmModal = (doctor: Dokter) => {
    setDoctorToDelete(doctor);
    setShowDeleteConfirm(true);
  };

  const closeDeleteConfirmModal = () => {
    setShowDeleteConfirm(false);
    setDoctorToDelete(null);
  };

  // Fungsi konfirmasi hapus dokter
  const confirmDeleteDoctor = async () => {
    if (!doctorToDelete) return;
    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('Token autentikasi tidak ditemukan. Silakan login terlebih dahulu.');
      history.push('/');
      return;
    }
    try {
      const response = await fetch(`https://klinik.aloycantik.xyz/api/doctors/${doctorToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('DELETE Response status:', response.status);
      console.log('DELETE Response headers:', [...response.headers.entries()]);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      setDoctors((prev) => prev.filter((doc) => doc.id !== doctorToDelete.id));
      closeDeleteConfirmModal();
    } catch (err: any) {
      console.error('Delete error (DELETE):', err);
      alert(`Gagal menghapus dokter: ${err.message}`);
    }
  };

  // Fungsi untuk menyimpan data dokter (tambah atau edit)
  const handleSubmitDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');
    console.log('Token for submit:', token);

    if (!token) {
      setModalError('Token autentikasi tidak ditemukan. Silakan login terlebih dahulu.');
      history.push('/');
      return;
    }

    setModalLoading(true);
    setModalError('');

    const doctorPayload = {
      nama: newName,
      spesialisasi: newspesialisasi,
      kontak: newKontak,
    };

    try {
      let url = 'https://klinik.aloycantik.xyz/api/doctors';
      let method: 'POST' | 'PUT' = 'POST';

      if (isEditing && selectedDoctorId) {
        url = `https://klinik.aloycantik.xyz/api/doctors/${selectedDoctorId}`;
        method = 'PUT';
      }

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...(method === 'POST' && { 'Accept': 'application/json' }),
        },
        body: JSON.stringify(doctorPayload),
      });

      console.log(`${method} Response status:`, response.status);
      console.log(`${method} Response headers:`, [...response.headers.entries()]);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gagal menyimpan dokter: ${errorText}`);
      }

      const result = await response.json();
      const updatedDoctor: Dokter = {
        id: result.id,
        name: result.nama,
        spesialisasi: result.spesialisasi,
        kontak: result.kontak,
      };

      if (isEditing) {
        setDoctors((prev) =>
          prev.map((doc) => (doc.id === updatedDoctor.id ? updatedDoctor : doc))
        );
      } else {
        setDoctors((prev) => [...prev, updatedDoctor]);
      }

      closeModalHandler();
    } catch (err: any) {
      console.error('Save error:', err);
      setModalError(err.message || 'Terjadi kesalahan.');
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="dokter-page">
      <Header />
      <div className="dokter-container">
        <div className="top-controls">
          <h2 className="dokter-title">Data Dokter</h2>
          <button className="add-button" onClick={() => openModalHandler()}>
            +
          </button>
        </div>

        <div className="search-bar">
          <input
            type="text"
            placeholder="Cari dokter..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading && <p>Loading...</p>}
        {error && <p className="error">Error: {error}</p>}

        <div className="table-container">
          <table className="dokter-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nama</th>
                <th>Spesialisasi</th>
                <th>Kontak</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredDoctors.map((doctor, index) => (
                <tr key={doctor.id}>
                  <td>{index + 1}</td>
                  <td>{doctor.name}</td>
                  <td>{doctor.spesialisasi}</td>
                  <td>{doctor.kontak}</td>
                  <td className="action-buttons">
                    <button onClick={() => openModalHandler(doctor)} className="action-button edit">
                      ✏️
                    </button>
                    <button onClick={() => openDeleteConfirmModal(doctor)} className="action-button delete">
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!loading && filteredDoctors.length === 0) && <p>Tidak ada data dokter.</p>}
        </div>
      </div>

      {/* Modal Add/Edit Dokter */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{isEditing ? 'Edit Dokter' : 'Tambah Dokter'}</h3>
            {modalError && <p className="error-message">Error: {modalError}</p>}
            <form onSubmit={handleSubmitDoctor} className="modal-form">
              <div className="form-group">
                <label>Nama</label>
                <input
                  type="text"
                  placeholder="Masukkan nama dokter"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Spesialisasi</label>
                <input
                  type="text"
                  placeholder="Masukkan spesialisasi dokter"
                  value={newspesialisasi}
                  onChange={(e) => setNewspesialisasi(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Kontak</label>
                <input
                  type="tel"
                  placeholder="Masukkan nomor telepon"
                  value={newKontak}
                  onChange={(e) => setNewKontak(e.target.value)}
                  required
                />
              </div>
              <div className="modal-buttons">
                <button type="button" onClick={closeModalHandler} className="modal-button cancel">
                  Batal
                </button>
                <button type="submit" className="modal-button submit" disabled={modalLoading}>
                  {modalLoading ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus */}
      {showDeleteConfirm && doctorToDelete && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Konfirmasi Hapus</h3>
            <p>
              Apakah Anda yakin ingin menghapus data dokter{' '}
              <strong>{doctorToDelete.name}</strong>?
            </p>
            <div className="modal-buttons">
              <button onClick={closeDeleteConfirmModal} className="modal-button cancel">
                Batal
              </button>
              <button onClick={confirmDeleteDoctor} className="modal-button submit">
                Ya
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dokter;
