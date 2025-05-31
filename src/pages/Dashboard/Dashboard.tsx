import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import Header from '../../components/Header/Header';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const Dashboard: React.FC = () => {
  // State untuk menyimpan data grafik pasien berdasarkan janji temu selesai
  const [patientChartData, setPatientChartData] = useState<{ month: string; count: number }[]>([]);
  // State untuk menyimpan data dokter
  const [doctorSchedule, setDoctorSchedule] = useState<{ id: number; name: string; scheduled: boolean }[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.error('Token tidak ditemukan. Harap login terlebih dahulu.');
      return;
    }

    // Fetch data janji temu pasien yang berstatus selesai
    fetch('https://klinik.aloycantik.xyz/api/appointments?status=selesai', {
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    })
      .then((response) => response.json())
      .then((data) => {
        const monthlyCounts: { [key: string]: number } = {};

        data.forEach((appointment: any) => {
          const month = new Date(appointment.tanggal).toLocaleString('id-ID', { month: 'short' });
          monthlyCounts[month] = (monthlyCounts[month] || 0) + 1;
        });

        const chartData = Object.entries(monthlyCounts).map(([month, count]) => ({ month, count }));
        setPatientChartData(chartData);
      })
      .catch((error) => console.error('Gagal mengambil data janji temu:', error));

    // Fetch daftar dokter
    fetch('https://klinik.aloycantik.xyz/api/doctors', {
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    })
      .then((response) => response.json())
      .then((data) => {
        const doctorsData = data.map((doctor: any) => ({
          id: doctor.id,
          name: doctor.nama,
          scheduled: true, // Default jadwal dokter tersedia
        }));
        setDoctorSchedule(doctorsData);
      })
      .catch((error) => console.error('Gagal mengambil data dokter:', error));
  }, []);

  // Toggle status jadwal dokter
  const toggleDoctorSchedule = (id: number) => {
    setDoctorSchedule((prev) =>
      prev.map((doctor) =>
        doctor.id === id ? { ...doctor, scheduled: !doctor.scheduled } : doctor
      )
    );
  };

  return (
    <div className="dashboard">
      <Header />

      {/* Konten Dashboard */}
      <div className="content">
        {/* Section Grafik Pasien dengan Recharts */}
        <div className="patient-chart-section">
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={patientChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#008cba" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-title">GRAFIK PASIEN</div>
        </div>

        {/* Section Jadwal Dokter Hari Ini */}
        <div className="doctor-schedule-section">
          <div className="schedule-wrapper">
            <div className="schedule-list">
              {doctorSchedule.map((doctor) => (
                <div key={doctor.id} className="schedule-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={doctor.scheduled}
                      onChange={() => toggleDoctorSchedule(doctor.id)}
                    />
                    <span>{doctor.name}</span>
                  </label>
                </div>
              ))}
            </div>
          </div>
          <div className="schedule-title">JADWAL DOKTER HARI INI</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
