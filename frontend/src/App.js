import './App.css';
import Navbar from "./components/Navbar"
import Swap from './components/Swap';
import Footer from './components/Footer';
import Stake from './components/Stake';

function App() {
  return (
    <div className="App">
      <Navbar />
      <Stake />
      <Footer />
    </div>
  );
}

export default App;
