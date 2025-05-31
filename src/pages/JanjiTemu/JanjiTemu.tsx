import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import Header from '../../components/Header/Header';
import './JanjiTemu.css';

interface Appointment {
  id: number;
  patientName: string;
  doctorName: string;
  tanggal: string;
  status: string;
  patientId: number;
  doctorId: number;
}

interface Patient {
  id: number;
  name: string;
}

interface Doctor {
  id: number;
  name: string;
}

const JanjiTemu: React.FC = () => {
  const history = useHistory();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  // State untuk modal add/edit appointment
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(null);
  const [tanggal, setTanggal] = useState('');
  const [status, setStatus] = useState('terjadwal'); // default untuk tambah
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  // State untuk modal konfirmasi hapus appointment
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<Appointment | null>(null);

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
            'Authorization': `Bearer ${token}`
          }
        });
        if (!responsePatients.ok) {
          throw new Error('Gagal mengambil data pasien.');
        }
        const dataPatients = await responsePatients.json();
        const fetchedPatients: Patient[] = dataPatients.map((p: any) => ({
          id: p.id,
          name: p.nama
        }));
        setPatients(fetchedPatients);

        // Ambil data dokter
        const responseDoctors = await fetch('https://klinik.aloycantik.xyz/api/doctors', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        if (!responseDoctors.ok) {
          throw new Error('Gagal mengambil data dokter.');
        }
        const dataDoctors = await responseDoctors.json();
        const fetchedDoctors: Doctor[] = dataDoctors.map((d: any) => ({
          id: d.id,
          name: d.nama
        }));
        setDoctors(fetchedDoctors);

        // Ambil data appointment
        const responseAppointments = await fetch('https://klinik.aloycantik.xyz/api/appointments', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        if (!responseAppointments.ok) {
          const errorText = await responseAppointments.text();
          throw new Error(`Gagal mengambil data janji temu: ${errorText}`);
        }
        const dataAppointments = await responseAppointments.json();
        const fetchedAppointments: Appointment[] = dataAppointments.map((a: any) => {
          // Pastikan perbandingan dilakukan dengan tipe data yang sama
          const patient = fetchedPatients.find((p) => p.id.toString() === a.patient_id.toString());
          const doctor  = fetchedDoctors.find((d) => d.id.toString() === a.doctor_id.toString());
          return {
            id: a.id,
            patientName: patient ? patient.name : 'N/A',
            doctorName: doctor ? doctor.name : 'N/A',
            tanggal: a.tanggal,
            status: a.status,
            patientId: a.patient_id,
            doctorId: a.doctor_id
          };
        });
        setAppointments(fetchedAppointments);
      } catch (err: any) {
        console.error('Fetch error:', err);
        setError(err.message || 'Gagal mengambil data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [history]);

  const filteredAppointments = appointments.filter((appointment) =>
    appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.tanggal.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Buka modal add/edit appointment
  const openModalHandler = (appointment?: Appointment) => {
    setShowModal(true);
    setModalError('');
    if (appointment) {
      // Mode edit: isi form dengan data yang ada
      setIsEditing(true);
      setSelectedAppointmentId(appointment.id);
      setSelectedPatientId(appointment.patientId);
      setSelectedDoctorId(appointment.doctorId);
      setTanggal(appointment.tanggal);
      setStatus(appointment.status);
    } else {
      // Mode tambah: default status "terjadwal"
      setIsEditing(false);
      setSelectedAppointmentId(null);
      setSelectedPatientId(null);
      setSelectedDoctorId(null);
      setTanggal('');
      setStatus('Terjadwal');
    }
  };

  const closeModalHandler = () => {
    setShowModal(false);
    setModalError('');
    setIsEditing(false);
    setSelectedAppointmentId(null);
    setSelectedPatientId(null);
    setSelectedDoctorId(null);
    setTanggal('');
    setStatus('Terjadwal');
  };

  // Modal konfirmasi hapus appointment
  const openDeleteConfirmModal = (appointment: Appointment) => {
    setAppointmentToDelete(appointment);
    setShowDeleteConfirm(true);
  };

  const closeDeleteConfirmModal = () => {
    setAppointmentToDelete(null);
    setShowDeleteConfirm(false);
  };

  const confirmDeleteAppointment = async () => {
    if (!appointmentToDelete) return;
    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('Token autentikasi tidak ditemukan. Silakan login terlebih dahulu.');
      history.push('/');
      return;
    }
    try {
      const response = await fetch(`https://klinik.aloycantik.xyz/api/appointments/${appointmentToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      setAppointments(prev => prev.filter(a => a.id !== appointmentToDelete.id));
      closeDeleteConfirmModal();
    } catch (err: any) {
      console.error('Delete error:', err);
      alert(`Gagal menghapus janji temu: ${err.message}`);
    }
  };

  const handleSubmitAppointment = async (e: React.FormEvent) => {
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
      doctor_id: selectedDoctorId,
      tanggal: tanggal,
      status: status
    };

    try {
      let url = 'https://klinik.aloycantik.xyz/api/appointments';
      let method: 'POST' | 'PUT' = 'POST';
      if (isEditing && selectedAppointmentId) {
        url = `https://klinik.aloycantik.xyz/api/appointments/${selectedAppointmentId}`;
        method = 'PUT';
      }
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...(method === 'POST' && { 'Accept': 'application/json' })
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gagal menyimpan janji temu: ${errorText}`);
      }
      const result = await response.json();
      // Saat mengedit, gunakan state pilihan untuk mapping nama
      const patientObj = patients.find(p => p.id.toString() === selectedPatientId?.toString()) || { name: 'N/A' };
      const doctorObj  = doctors.find(d => d.id.toString() === selectedDoctorId?.toString()) || { name: 'N/A' };
      const newAppointment: Appointment = {
        id: result.id,
        patientId: result.patient_id,
        doctorId: result.doctor_id,
        patientName: patientObj.name,
        doctorName: doctorObj.name,
        tanggal: result.tanggal,
        status: result.status
      };
      if (isEditing) {
        setAppointments(prev =>
          prev.map(a => a.id === newAppointment.id ? newAppointment : a)
        );
      } else {
        setAppointments(prev => [...prev, newAppointment]);
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
    <div className="janji-temu-page">
      <Header />
      <div className="janji-temu-container">
        <div className="top-controls">
          <h2 className="janji-temu-title">Data Janji Temu</h2>
          <button className="add-button" onClick={() => openModalHandler()}>+</button>
        </div>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Cari janji temu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {loading && <p>Loading...</p>}
        {error && <p className="error">Error: {error}</p>}
        <div className="table-container">
          <table className="appointments-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nama Pasien</th>
                <th>Nama Dokter</th>
                <th>Tanggal</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map((appointment, index) => (
                <tr key={appointment.id}>
                  <td>{`J - ${appointment.id.toString().padStart(3, '0')}`}</td>
                  <td>{appointment.patientName}</td>
                  <td>{appointment.doctorName}</td>
                  <td>{appointment.tanggal}</td>
                  <td>{appointment.status}</td>
                  <td className="action-buttons">
                    <button
                      onClick={() => openModalHandler(appointment)}
                      className="action-button edit"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => openDeleteConfirmModal(appointment)}
                      className="action-button delete"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!loading && filteredAppointments.length === 0) && (
            <p>Tidak ada data janji temu.</p>
          )}
        </div>
      </div>

      {/* Modal Add/Edit Janji Temu */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{isEditing ? 'Edit Janji Temu' : 'Tambah Janji Temu'}</h3>
            {modalError && <p className="error-message">Error: {modalError}</p>}
            <form onSubmit={handleSubmitAppointment} className="modal-form">
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
                <label>Nama Dokter</label>
                <select
                  value={selectedDoctorId || ''}
                  onChange={(e) => setSelectedDoctorId(Number(e.target.value))}
                  required
                >
                  <option value="" disabled>
                    Pilih Dokter
                  </option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
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
                <label>Status</label>
                {isEditing ? (
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    required
                  >
                    <option value="Terjadwal">Terjadwal</option>
                    <option value="Selesai">Selesai</option>
                    <option value="Batal">Batal</option>
                  </select>
                ) : (
                  <input type="text" value="Terjadwal" disabled />
                )}
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

      {/* Modal Konfirmasi Hapus Janji Temu */}
      {showDeleteConfirm && appointmentToDelete && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Konfirmasi Hapus</h3>
            <p>
              Apakah Anda yakin ingin menghapus janji temu untuk pasien{' '}
              <strong>{appointmentToDelete.patientName}</strong> dengan dokter{' '}
              <strong>{appointmentToDelete.doctorName}</strong>?
            </p>
            <div className="modal-buttons">
              <button onClick={closeDeleteConfirmModal} className="modal-button cancel">
                Batal
              </button>
              <button onClick={confirmDeleteAppointment} className="modal-button submit">
                Ya
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JanjiTemu;
