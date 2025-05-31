import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import Header from '../../components/Header/Header';
import './RekamMedis.css';

interface MedicalRecord {
  id: number;
  patientName: string;
  tanggal: string;
  diagnosis: string;
  treatment: string;
  patientId: number;
}

interface Patient {
  id: number;
  name: string;
}

const RekamMedis: React.FC = () => {
  const history = useHistory();

  // State untuk data rekam medis dan pasien
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  // State untuk modal add/edit rekam medis
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useState<number | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [tanggal, setTanggal] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  // State untuk modal konfirmasi hapus rekam medis
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<MedicalRecord | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setError('Token autentikasi tidak ditemukan. Silakan login terlebih dahulu.');
        history.push('/');
        return;
      }
      try {
        setLoading(true);

        // Ambil data pasien
        const responsePatients = await fetch('https://klinik.aloycantik.xyz/api/patients', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!responsePatients.ok) {
          throw new Error('Gagal mengambil data pasien.');
        }
        const dataPatients = await responsePatients.json();
        const fetchedPatients: Patient[] = dataPatients.map((p: any) => ({
          id: p.id,
          name: p.nama,
        }));
        setPatients(fetchedPatients);

        // Ambil data rekam medis dari API medical_records
        const responseRecords = await fetch('https://klinik.aloycantik.xyz/api/medical_records', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!responseRecords.ok) {
          const errorText = await responseRecords.text();
          throw new Error(`Gagal mengambil data rekam medis: ${errorText}`);
        }
        const dataRecords = await responseRecords.json();
        const fetchedRecords: MedicalRecord[] = dataRecords.map((r: any) => {
          const patient = fetchedPatients.find((p) => p.id.toString() === r.patient_id.toString());
          return {
            id: r.id,
            patientName: patient ? patient.name : 'N/A',
            tanggal: r.tanggal,
            diagnosis: r.diagnosis,
            treatment: r.treatment,
            patientId: r.patient_id,
          };
        });
        setRecords(fetchedRecords);
      } catch (err: any) {
        console.error('Fetch error:', err);
        setError(err.message || 'Gagal mengambil data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [history]);

  const filteredRecords = records.filter((record) =>
    record.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.tanggal.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.treatment.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Buka modal add/edit rekam medis
  const openModalHandler = (record?: MedicalRecord) => {
    setShowModal(true);
    setModalError('');
    if (record) {
      // Mode edit: isi form dengan data rekam medis yang sudah ada
      setIsEditing(true);
      setSelectedRecordId(record.id);
      setSelectedPatientId(record.patientId);
      setTanggal(record.tanggal);
      setDiagnosis(record.diagnosis);
      setTreatment(record.treatment);
    } else {
      // Mode tambah: form kosong
      setIsEditing(false);
      setSelectedRecordId(null);
      setSelectedPatientId(null);
      setTanggal('');
      setDiagnosis('');
      setTreatment('');
    }
  };

  const closeModalHandler = () => {
    setShowModal(false);
    setModalError('');
    setIsEditing(false);
    setSelectedRecordId(null);
    setSelectedPatientId(null);
    setTanggal('');
    setDiagnosis('');
    setTreatment('');
  };

  // Modal konfirmasi hapus handler
  const openDeleteConfirmModal = (record: MedicalRecord) => {
    setRecordToDelete(record);
    setShowDeleteConfirm(true);
  };

  const closeDeleteConfirmModal = () => {
    setRecordToDelete(null);
    setShowDeleteConfirm(false);
  };

  const confirmDeleteRecord = async () => {
    if (!recordToDelete) return;
    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('Token autentikasi tidak ditemukan. Silakan login terlebih dahulu.');
      history.push('/');
      return;
    }
    try {
      const response = await fetch(`https://klinik.aloycantik.xyz/api/medical_records/${recordToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      setRecords((prev) => prev.filter((r) => r.id !== recordToDelete.id));
      closeDeleteConfirmModal();
    } catch (err: any) {
      console.error('Delete error:', err);
      alert(`Gagal menghapus rekam medis: ${err.message}`);
    }
  };

  const handleSubmitRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');
    if (!token) {
      setModalError('Token autentikasi tidak ditemukan. Silakan login terlebih dahulu.');
      history.push('/');
      return;
    }
    setModalLoading(true);
    setModalError('');

    const payload = {
      patient_id: selectedPatientId,
      tanggal: tanggal,
      diagnosis: diagnosis,
      treatment: treatment,
    };

    try {
      let url = 'https://klinik.aloycantik.xyz/api/medical_records';
      let method: 'POST' | 'PUT' = 'POST';
      if (isEditing && selectedRecordId) {
        url = `https://klinik.aloycantik.xyz/api/medical_records/${selectedRecordId}`;
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
        throw new Error(`Gagal menyimpan rekam medis: ${errorText}`);
      }
      const result = await response.json();
      const patientObj = patients.find((p) => p.id.toString() === selectedPatientId?.toString()) || { name: 'N/A' };
      const newRecord: MedicalRecord = {
        id: result.id,
        patientId: result.patient_id,
        patientName: patientObj.name,
        tanggal: result.tanggal,
        diagnosis: result.diagnosis,
        treatment: result.treatment,
      };
      if (isEditing) {
        setRecords((prev) =>
          prev.map((r) => (r.id === newRecord.id ? newRecord : r))
        );
      } else {
        setRecords((prev) => [...prev, newRecord]);
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
    <div className="rekam-medis-page">
      <Header />
      <div className="rekam-medis-container">
        <div className="top-controls">
          <h2 className="rekam-medis-title">Data Rekam Medis</h2>
          <button className="add-button" onClick={() => openModalHandler()}>
            +
          </button>
        </div>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Cari rekam medis..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {loading && <p>Loading...</p>}
        {error && <p className="error">Error: {error}</p>}
        <div className="table-container">
          <table className="rekam-medis-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nama Pasien</th>
                <th>Tanggal</th>
                <th>Diagnosis</th>
                <th>Treatment</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((record, index) => (
                <tr key={record.id}>
                  <td>{`RM - ${record.id.toString().padStart(3, '0')}`}</td>
                  <td>{record.patientName}</td>
                  <td>{record.tanggal}</td>
                  <td>{record.diagnosis}</td>
                  <td>{record.treatment}</td>
                  <td className="action-buttons">
                    <button onClick={() => openModalHandler(record)} className="action-button edit">
                      ✏️
                    </button>
                    <button onClick={() => openDeleteConfirmModal(record)} className="action-button delete">
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!loading && filteredRecords.length === 0) && <p>Tidak ada data rekam medis.</p>}
        </div>
      </div>

      {/* Modal Add/Edit Rekam Medis */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{isEditing ? 'Edit Rekam Medis' : 'Tambah Rekam Medis'}</h3>
            {modalError && <p className="error-message">Error: {modalError}</p>}
            <form onSubmit={handleSubmitRecord} className="modal-form">
              <div className="form-group">
                <label>Nama Pasien</label>
                <select
                  value={selectedPatientId || ''}
                  onChange={(e) => setSelectedPatientId(Number(e.target.value))}
                  required
                >
                  <option value="" disabled>
                    Pilih Pasien
                  </option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Tanggal</label>
                <input
                  type="date"
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Diagnosis</label>
                <input
                  type="text"
                  placeholder="Masukkan diagnosis"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Perawatan</label>
                <input
                  type="text"
                  placeholder="Masukkan perawatan"
                  value={treatment}
                  onChange={(e) => setTreatment(e.target.value)}
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

      {/* Modal Konfirmasi Hapus Rekam Medis */}
      {showDeleteConfirm && recordToDelete && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Konfirmasi Hapus</h3>
            <p>
              Apakah Anda yakin ingin menghapus rekam medis untuk pasien <strong>{recordToDelete.patientName}</strong>?
            </p>
            <div className="modal-buttons">
              <button onClick={closeDeleteConfirmModal} className="modal-button cancel">
                Batal
              </button>
              <button onClick={confirmDeleteRecord} className="modal-button submit">
                Ya
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RekamMedis;
