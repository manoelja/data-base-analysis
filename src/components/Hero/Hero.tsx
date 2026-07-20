import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { MousePointer2, ChevronDown, Heart, Baby, Stethoscope, Activity } from 'lucide-react';
import MagneticButton from '../Common/MagneticButton';
import { useTypewriter } from '../../hooks/useTypewriter';
import './Hero.css';

const WORDS_PT = ["Análise de Dados", "Pipeline SQL→R", "Qualidade de Dados"];
const WORDS_ES = ["Análisis de Datos", "Pipeline SQL→R", "Calidad de Datos"];
const WORDS_EN = ["Data Analysis", "SQL→R Pipeline", "Data Quality"];

const Hero = () => {
  const { t, i18n } = useTranslation();

  const words = useMemo(() => {
    switch (i18n.language) {
      case 'es': return WORDS_ES;
      case 'en': return WORDS_EN;
      default: return WORDS_PT;
    }
  }, [i18n.language]);

  const typewriterText = useTypewriter(words, 150, 2500);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <section id="hero" className="hero">
      <div className="container hero-container">
        <div className="hero-content">
          <motion.div
            className="hero-text"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div className="hero-badge" variants={itemVariants}>
              <span className="pulse-dot"></span>
              {t('hero.badge')}
            </motion.div>

            <motion.h1 className="hero-title" variants={itemVariants}>
              {t('hero.title_pre')} <br />
              <span className="highlight">
                {typewriterText}<span className="cursor">|</span>
              </span>
            </motion.h1>

            <motion.p className="hero-description" variants={itemVariants}>
              {t('hero.description')}
            </motion.p>

            <motion.div className="hero-btns" variants={itemVariants}>
              <MagneticButton href="#projects" className="btn btn-primary">
                {t('hero.view_projects')} <MousePointer2 size={18} />
              </MagneticButton>

              <div className="hero-socials">
                <motion.div
                  className="security-icon-hero"
                  whileHover={{ y: -3, color: 'var(--accent-color)' }}
                  title="Maternidade"
                >
                  <Heart size={24} />
                </motion.div>
                <motion.div
                  className="security-icon-hero"
                  whileHover={{ y: -3, color: 'var(--accent-color)' }}
                  title="Bebês"
                >
                  <Baby size={24} />
                </motion.div>
                <motion.div
                  className="security-icon-hero"
                  whileHover={{ y: -3, color: 'var(--accent-color)' }}
                  title="Saúde"
                >
                  <Stethoscope size={24} />
                </motion.div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            className="hero-visual"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <div className="system-status">
              <div className="status-header">
                <span>{t('hero.pipeline_status')}</span>
                <Activity size={14} className="pulse-icon" />
              </div>

              <div className="status-grid">
                <div className="status-item">
                  <div className="status-label">{t('hero.records_loaded')}</div>
                  <div className="status-value">6.080</div>
                  <div className="status-bar">
                    <motion.div
                      className="status-progress"
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 1.5, delay: 1 }}
                    ></motion.div>
                  </div>
                </div>

                <div className="status-item">
                  <div className="status-label">{t('hero.cleaned')}</div>
                  <div className="status-value">5.510</div>
                  <div className="status-bar">
                    <motion.div
                      className="status-progress"
                      initial={{ width: 0 }}
                      animate={{ width: '90.6%' }}
                      transition={{ duration: 1.5, delay: 1.2 }}
                    ></motion.div>
                  </div>
                </div>

                <div className="status-item">
                  <div className="status-label">{t('hero.quality_score')}</div>
                  <div className="status-value">90.6%</div>
                  <div className="status-bar">
                    <motion.div
                      className="status-progress"
                      initial={{ width: 0 }}
                      animate={{ width: '90.6%' }}
                      transition={{ duration: 1.5, delay: 1.4 }}
                    ></motion.div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="scroll-indicator">
        <span>{t('hero.scroll')}</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <ChevronDown size={24} color="var(--accent-color)" />
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
