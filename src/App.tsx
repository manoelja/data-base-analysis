import { useEffect, lazy, Suspense } from 'react';
import Navbar from './components/Navbar/Navbar';
import Hero from './components/Hero/Hero';
import About from './components/About/About';
import CyberBackground from './components/CyberBackground/CyberBackground';
import './styles/global.css';

const Skills = lazy(() => import('./components/Skills/Skills'));
const Projects = lazy(() => import('./components/Projects/Projects'));
const Dashboard = lazy(() => import('./components/Dashboard/DashboardEnhanced'));
const Footer = lazy(() => import('./components/Footer/Footer'));

function App() {
  // Aggressive scroll reset - multiple attempts
  useEffect(() => {
    // Disable browser scroll restoration
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    // Force scroll to top immediately
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    // Multiple attempts to ensure scroll stays at top
    const timers = [
      setTimeout(() => {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }, 50),
      setTimeout(() => {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }, 100),
      setTimeout(() => {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }, 200),
      setTimeout(() => {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }, 500),
    ];

    return () => timers.forEach(clearTimeout);
  }, []);

  // Prevent any scroll to bottom on load
  useEffect(() => {
    const preventScrollToBottom = () => {
      const scrollPosition = window.scrollY + window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // If scrolled near the bottom, force back to top
      if (scrollPosition > documentHeight - 100) {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }
    };

    // Check periodically for the first 2 seconds
    const intervals = [
      setInterval(preventScrollToBottom, 100),
      setInterval(preventScrollToBottom, 200),
      setInterval(preventScrollToBottom, 500),
    ];

    // Stop checking after 2 seconds
    setTimeout(() => {
      intervals.forEach(clearInterval);
    }, 2000);

    return () => intervals.forEach(clearInterval);
  }, []);

  return (
    <div className="App">
      <CyberBackground />

      <Navbar />

      <main className="container">
        <Hero />
        <About />
        <Suspense fallback={<div className="loading">Carregando...</div>}>
          <Skills />
          <Projects />
          <Dashboard />
          <Footer />
        </Suspense>
      </main>
    </div>
  );
}
export default App;
