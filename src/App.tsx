import { useEffect } from 'react';
import Navbar from './components/Navbar/Navbar';
import Hero from './components/Hero/Hero';
import About from './components/About/About';
import Skills from './components/Skills/Skills';
import Projects from './components/Projects/Projects';
import Dashboard from './components/Dashboard/DashboardEnhanced';
import Footer from './components/Footer/Footer';
import CyberBackground from './components/CyberBackground/CyberBackground';
import './styles/global.css';

function App() {
  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  return (
    <div className="App">
      <CyberBackground />

      <Navbar />

      <main className="container">
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Dashboard />
        <Footer />
      </main>
    </div>
  );
}
export default App;
