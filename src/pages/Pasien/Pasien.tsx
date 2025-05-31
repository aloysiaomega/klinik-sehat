import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import './Pasien.css';
import Header from '../../components/Header/Header';

interface Patient {
  id: number;
  name: string;
  tanggalLahir: string;
  kontak: string;
}

const Pasien: React.FC = () => {
  const history = useHistory();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  // State untuk modal add/edit pasien
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [newName, setNewName] = useState('');
  const [newTanggalLahir, setNewTanggalLahir] = useState('');
  const [newKontak, setNewKontak] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  // State untuk modal konfirmasi hapus
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);

  // Mengambil data pasien dari API dengan autentikasi
  useEffect(() => {
    const fetchPatients = async () => {
      const token = localStorage.getItem('access_token');
      console.log('Token from localStorage:', token);
      if (!token) {
        setError('Token autentikasi tidak ditemukan. Silakan login terlebih dahulu.');
        history.push('/');
        return;
      }
      try {
        setLoading(true);
        const response = await fetch('https://klinik.aloycantik.xyz/api/patients', {
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
        const converted = data.map((p: any) => ({
          id: p.id,
          name: p.nama,
          tanggalLahir: p.tanggal_lahir,
          kontak: p.kontak,
        }));
        setPatients(converted);
      } catch (err: any) {
        console.error('Fetch error (GET):', err);
        setError(`Gagal mengambil data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, [history]);

  const filteredPatients = patients.filter((patient) =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Buka modal add/edit pasien
  const openModalHandler = (patient?: Patient) => {
    setShowModal(true);
    setModalError('');
    if (patient) {
      // Mode edit
      setIsEditing(true);
      setSelectedPatientId(patient.id);
      setNewName(patient.name);
      setNewTanggalLahir(patient.tanggalLahir);
      setNewKontak(patient.kontak);
    } else {
      // Mode tambah
      setIsEditing(false);
      setSelectedPatientId(null);
      setNewName('');
      setNewTanggalLahir('');
      setNewKontak('');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setModalError('');
    setNewName('');
    setNewTanggalLahir('');
    setNewKontak('');
    setIsEditing(false);
    setSelectedPatientId(null);
  };

  // Modal konfirmasi hapus
  const openDeleteConfirmModal = (patient: Patient) => {
    setPatientToDelete(patient);
    setShowDeleteConfirm(true);
  };

  const closeDeleteConfirmModal = () => {
    setShowDeleteConfirm(false);
    setPatientToDelete(null);
  };

  const confirmDeletePatient = async () => {
    if (!patientToDelete) return;
    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('Token autentikasi tidak ditemukan. Silakan login terlebih dahulu.');
      history.push('/');
      return;
    }
    try {
      const response = await fetch(`https://klinik.aloycantik.xyz/api/patients/${patientToDelete.id}`, {
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
      setPatients((prev) => prev.filter((pt) => pt.id !== patientToDelete.id));
      closeDeleteConfirmModal();
    } catch (err: any) {
      console.error('Delete error (DELETE):', err);
      alert(`Gagal menghapus pasien: ${err.message}`);
    }
  };

  // Fungsi untuk menyimpan data pasien (tambah atau edit)
  const handleSubmitPatient = async (e: React.FormEvent) => {
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
    const payload = {
      nama: newName,
      tanggal_lahir: newTanggalLahir,
      kontak: newKontak,
    };
    try {
      let url = 'https://klinik.aloycantik.xyz/api/patients';
      let method: 'POST' | 'PUT' = 'POST';
      if (isEditing && selectedPatientId) {
        url = `https://klinik.aloycantik.xyz/api/patients/${selectedPatientId}`;
        method = 'PUT';
      }
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...(method === 'POST' && { 'Accept': 'application/json' }),
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gagal menyimpan pasien: ${errorText}`);
      }
      const result = await response.json();
      const updatedPatient: Patient = {
        id: result.id,
        name: result.nama,
        tanggalLahir: result.tanggal_lahir,
        kontak: result.kontak,
      };
      if (isEditing) {
        setPatients((prev) =>
          prev.map((pt) => (pt.id === updatedPatient.id ? updatedPatient : pt))
        );
      } else {
        setPatients((prev) => [...prev, updatedPatient]);
      }
      closeModal();
    } catch (err: any) {
      console.error('Save error:', err);
      setModalError(err.message || 'Terjadi kesalahan.');
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="pasien-page">
      <Header />
      <div className="pasien-container">
        <div className="top-controls">
          <h2 className="pasien-title">Data Pasien</h2>
          <button className="add-button" onClick={() => openModalHandler()}>
            +
          </button>
        </div>

        <div className="search-bar">
          <input
            type="text"
            placeholder="Cari pasien..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading && <p>Loading...</p>}
        {error && <p>Error: {error}</p>}

        <div className="table-container">
          <table className="patients-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nama</th>
                <th>Tanggal Lahir</th>
                <th>Kontak</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((patient, index) => (
                <tr key={patient.id}>
                  <td>{index + 1}</td>
                  <td>{patient.name}</td>
                  <td>{patient.tanggalLahir}</td>
                  <td>{patient.kontak}</td>
                  <td className="action-buttons">
                    <button
                      onClick={() => openModalHandler(patient)}
                      className="action-button edit"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => openDeleteConfirmModal(patient)}
                      className="action-button delete"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!loading && filteredPatients.length === 0) && (
            <p>Tidak ada data pasien.</p>
          )}
        </div>
      </div>

      {/* Modal Add/Edit Pasien */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{isEditing ? 'Edit Pasien' : 'Tambah Pasien'}</h3>
            {modalError && <p className="error-message">Error: {modalError}</p>}
            <form onSubmit={handleSubmitPatient} className="modal-form">
              <div className="form-group">
                <label>Nama</label>
                <input
                  type="text"
                  placeholder="Masukkan nama pasien"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Tanggal Lahir</label>
                <input
                  type="date"
                  value={newTanggalLahir}
                  onChange={(e) => setNewTanggalLahir(e.target.value)}
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
                <button type="button" onClick={closeModal} className="modal-button cancel">
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

      {/* Modal Konfirmasi Hapus Pasien */}
      {showDeleteConfirm && patientToDelete && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Konfirmasi Hapus</h3>
            <p>
              Apakah Anda yakin ingin menghapus data pasien{' '}
              <strong>{patientToDelete.name}</strong>?
            </p>
            <div className="modal-buttons">
              <button onClick={closeDeleteConfirmModal} className="modal-button cancel">
                Batal
              </button>
              <button onClick={confirmDeletePatient} className="modal-button submit">
                Ya
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pasien;
