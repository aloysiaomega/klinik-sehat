import React, { useState } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { IonIcon, IonLoading } from '@ionic/react';
import { personCircleOutline } from 'ionicons/icons';
import './Login.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const history = useHistory();

  const handleLogin = async () => {
    // Cek apakah email dan password sudah diisi
    if (!email || !password) {
      setErrorMessage('Email dan kata sandi harus diisi.');
      return;
    }

    // Bersihkan error message dan tampilkan indikator loading
    setErrorMessage('');
    setIsLoading(true);

    try {
      const response = await axios.post('http://klinik.aloycantik.xyz/api/login', {
        email,
        password,
      });

      console.log('Response Data:', response.data);
      // Periksa apakah respons mengandung access_token
      if (response.data.access_token) {
        // Simpan token ke localStorage
        localStorage.setItem('access_token', response.data.access_token);
        // Arahkan ke halaman Pasien (atau Dashboard)
        history.push('/dashboard'); // Sesuaikan dengan rute yang diinginkan
      } else {
        setErrorMessage('Email atau kata sandi salah.');
      }
    } catch (error) {
      console.error('Error saat proses login:', error);
      setErrorMessage('Terjadi kesalahan saat login.');
      if (axios.isAxiosError(error) && error.response) {
        // Tampilkan pesan error dari server jika ada
        setErrorMessage(`Error: ${error.response.data.message || error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">
        <div className="login-logo">
          <IonIcon className="login-user-icon" icon={personCircleOutline} />
        </div>
        <div className="login-form">
          <label></label>
          <input 
            type="email"
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
          />
        </div>
        <div className="login-form">
          <label></label>
          <input 
            type="password"
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Kata Sandi"
          />
        </div>

        {/* Tampilkan pesan alert jika ada kesalahan */}
        {errorMessage && <div className="login-alert">{errorMessage}</div>}

        <button
          className="login-button"
          onClick={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'LOGIN'}
        </button>

        {/* Indikator loading dari Ionic */}
        <IonLoading isOpen={isLoading} message="Tunggu sebentar..." />
      </div>
    </div>
  );
};

export default Login;