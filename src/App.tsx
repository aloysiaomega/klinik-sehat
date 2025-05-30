import React from 'react';
import { IonApp, IonRouterOutlet } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Route, Redirect, Switch } from 'react-router-dom';
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import Layanan from './pages/Layanan/Layanan';
import Pasien from './pages/Pasien/Pasien';
import Dokter from './pages/Dokter/Dokter';
import JanjiTemu from './pages/JanjiTemu/JanjiTemu';
import RekamMedis from './pages/RekamMedis/RekamMedis';
import ResepObat from './pages/ResepObat/ResepObat';
import Profil from './pages/Profil/Profil'; // Pastikan file Profil.tsx sudah ada

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <Switch> {/* Gunakan Switch untuk mengelompokkan routes */}
        <Route path="/login" component={Login} exact />
        <Route path="/dashboard" component={Dashboard} exact />
        <Route path="/layanan" component={Layanan} exact />
        <Route path="/pasien" component={Pasien} exact />
        <Route path="/dokter" component={Dokter} exact />
        <Route path="/janjitemu" component={JanjiTemu} exact />
        <Route path="/rekammedis" component={RekamMedis} exact />
        <Route path="/resepobat" component={ResepObat} exact />
        <Route path="/profil" component={Profil} exact /> {/* Tambahkan route Profil */}
        <Redirect from="/" to="/login" exact />
      </Switch>
    </IonReactRouter>
  </IonApp>
);

export default App;
