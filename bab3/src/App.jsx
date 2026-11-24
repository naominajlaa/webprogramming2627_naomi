import './App.css';
import { Route, Routes } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import AppNavigation from './component/AppNavigation';
import Badge from './component/Badge';
import CardStatusDemo from './component/CardStatusDemo';
import HeaderBanner from './component/HeaderBanner';
import KartuRingkasan from './component/KartuRingkasan';
import LayoutGrid from './component/LayoutGrid';
import TransactionManager from './component/TransactionManager';
import TransaksiItem from './component/TransaksiItem';
import WalletSummary from './component/WalletSummary';
import PostListAxios from './component/PostListAxios';
import DaftarTugas from './component/DaftarTugas';
import PostListFetch from './component/PostListFetch';
import FormEditTransaksi from './component/FormEditTransaksi';
import FormTambahTransaksi from './component/FormTambahTransaksi';
import FormTambahTransaksiPost from './component/FormTambahTransaksiPost';
import DaftarTransaksi from './component/DaftarTransaksi';
import TabelTransaksiDinamis from './component/TabelTransaksiDinamis';
import TombolHapusDenganModal from './component/TombolHapusDenganModal';

function App() {
  const { pathname } = useLocation();
  
  return (
    <>
      {pathname !== '/AppNavigation' && (
        <AppNavigation />
      )}
      <Routes>
        <Route path='/' element={ <HeaderBanner/> } />
        <Route path='/transaksi' element={ <TransaksiItem />} />
        <Route path='/kartu' element={ <KartuRingkasan />} />
        <Route path='/badge' element={ <Badge />} />
        <Route path='/wallet' element={ <WalletSummary />} />
        <Route path='/LayoutGrid' element={ <LayoutGrid/>  } />
        <Route path='/HeaderBanner' element={ <HeaderBanner/>  } />
        <Route path='/CardStatusDemo' element={ <CardStatusDemo/> } />
        <Route path='/AppNavigation' element={ <AppNavigation/> } />
        <Route path='/TransactionManager' element={ <TransactionManager/> } />
        <Route path='/postlistaxios' element={ <PostListAxios/> } />
        <Route path='/postlistfetch' element={ <PostListFetch/> } />
        <Route path='/daftartugas' element={ <DaftarTugas/> } />
        <Route path='/formedittransaksi/:id' element={ <FormEditTransaksi/> } />
        <Route path='/formtambahtransaksi' element={ <FormTambahTransaksi/> } />
        <Route path='/formtambahtransaksipost' element={ <FormTambahTransaksiPost/> } />
        <Route path='/daftartransaksi' element={ <DaftarTransaksi/> } />
        <Route path='/tabeltransaksidinamis' element={ <TabelTransaksiDinamis/> } />
        <Route path='/tombolhapusdenganmodal' element={ <TombolHapusDenganModal/> } />
      </Routes>
    </>
  );
}

export default App;
