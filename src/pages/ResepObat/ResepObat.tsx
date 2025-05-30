import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import Header from '../../components/Header/Header';
import './ResepObat.css';

interface Prescription {
  id: number;
  medicalRecordName: string;
  obat: string;
  dosis: string;
  medicalRecordId: number;
}

interface MedicalRecord {
  id: number;
  name: string;
}

const ResepObat: React.FC = () => {
  const history = useHistory();

  // State untuk data resep obat dan rekam medis
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  // State untuk modal add/edit resep obat
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState<number | null>(null);
  const [selectedMedicalRecordId, setSelectedMedicalRecordId] = useState<number | null>(null);
  const [obat, setObat] = useState('');
  const [dosis, setDosis] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  // State untuk modal konfirmasi hapus resep obat
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [prescriptionToDelete, setPrescriptionToDelete] = useState<Prescription | null>(null);

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

        // Ambil data rekam medis
        const responseMedicalRecords = await fetch('http://klinik.aloycantik.xyz/api/medical_records', {
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        });
        if (!responseMedicalRecords.ok) {
          throw new Error('Gagal mengambil data rekam medis.');
        }
        const dataMedicalRecords = await responseMedicalRecords.json();
        const fetchedMedicalRecords: MedicalRecord[] = dataMedicalRecords.map((m: any) => ({
          id: m.id,
          name: `Rekam Medis ${m.id}`,
        }));
        setMedicalRecords(fetchedMedicalRecords);

        // Ambil data resep obat
        const responsePrescriptions = await fetch('http://klinik.aloycantik.xyz/api/prescriptions', {
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        });
        if (!responsePrescriptions.ok) {
          throw new Error(`Gagal mengambil data resep obat.`);
        }
        const dataPrescriptions = await responsePrescriptions.json();
        const fetchedPrescriptions: Prescription[] = dataPrescriptions.map((r: any) => {
          const medicalRecord = fetchedMedicalRecords.find((m) => m.id.toString() === r.medical_record_id.toString());
          return {
            id: r.id,
            medicalRecordName: medicalRecord ? medicalRecord.name : 'N/A',
            obat: r.obat,
            dosis: r.dosis,
            medicalRecordId: r.medical_record_id,
          };
        });
        setPrescriptions(fetchedPrescriptions);
      } catch (err: any) {
        console.error('Fetch error:', err);
        setError(err.message || 'Gagal mengambil data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [history]);

  const filteredPrescriptions = prescriptions.filter((item) =>
    item.medicalRecordName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.obat.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.dosis.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Modal edit handler
  const openModalHandler = (prescription?: Prescription) => {
    setShowModal(true);
    setModalError('');
    if (prescription) {
      setIsEditing(true);
      setSelectedPrescriptionId(prescription.id);
      setSelectedMedicalRecordId(prescription.medicalRecordId);
      setObat(prescription.obat);
      setDosis(prescription.dosis);
    } else {
      setIsEditing(false);
      setSelectedPrescriptionId(null);
      setSelectedMedicalRecordId(null);
      setObat('');
      setDosis('');
    }
  };

  // Modal konfirmasi hapus
  const openDeleteConfirmModal = (prescription: Prescription) => {
    setPrescriptionToDelete(prescription);
    setShowDeleteConfirm(true);
  };

  const closeDeleteConfirmModal = () => {
    setPrescriptionToDelete(null);
    setShowDeleteConfirm(false);
  };

  const confirmDeletePrescription = async () => {
    if (!prescriptionToDelete) return;
    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('Token autentikasi tidak ditemukan. Silakan login terlebih dahulu.');
      history.push('/');
      return;
    }
    try {
      const response = await fetch(`http://klinik.aloycantik.xyz/api/prescriptions/${prescriptionToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setPrescriptions((prev) => prev.filter((p) => p.id !== prescriptionToDelete.id));
      closeDeleteConfirmModal();
    } catch (err: any) {
      console.error('Delete error:', err);
      alert(`Gagal menghapus resep obat: ${err.message}`);
    }
  };

  return (
    <div className="resep-obat-page">
      <Header />
      <div className="resep-obat-container">
        <div className="top-controls">
          <h2 className="resep-obat-title">Data Resep Obat</h2>
        </div>
        <div className="search-bar">
          <input type="text" placeholder="Cari resep obat..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        {loading && <p>Loading...</p>}
        {error && <p className="error">Error: {error}</p>}
        <div className="table-container">
          <table className="resep-obat-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nama Rekam Medis</th>
                <th>Nama Obat</th>
                <th>Dosis</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredPrescriptions.map((item) => (
                <tr key={item.id}>
                  <td>{`R - ${item.id.toString().padStart(3, '0')}`}</td>
                  <td>{item.medicalRecordName}</td>
                  <td>{item.obat}</td>
                  <td>{item.dosis}</td>
                  <td className="action-buttons">
                    <button onClick={() => openModalHandler(item)} className="action-button edit">✏️</button>
                    <button onClick={() => openDeleteConfirmModal(item)} className="action-button delete">🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!loading && filteredPrescriptions.length === 0) && <p>Tidak ada data resep obat.</p>}
        </div>
      </div>
    </div>
  );
};

export default ResepObat;
