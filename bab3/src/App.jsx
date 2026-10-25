import './App.css';
import { Route, Routes } from 'react-router-dom';
import Badge from './component/Badge';
import CardStatusDemo from './component/CardStatusDemo';
import HeaderBanner from './component/HeaderBanner';
import KartuRingkasan from './component/KartuRingkasan';
import LayoutGrid from './component/LayoutGrid';
import TransaksiItem from './component/TransaksiItem';
import WalletSummary from './component/WalletSummary';

function App() {
  return (
    <Routes>
      <Route path='/transaksi' element={ <TransaksiItem />} />
      <Route path='/kartu' element={ <KartuRingkasan />} />
      <Route path='/badge' element={ <Badge />} />
      <Route path='/wallet' element={ <WalletSummary />} />
      <Route path='/LayoutGrid' element={ <LayoutGrid/>  } />
      <Route path='/HeaderBanner' element={ <HeaderBanner/>  } />
      <Route path='/CardStatusDemo' element={ <CardStatusDemo/> } />
    </Routes>
  );
}

export default App;
