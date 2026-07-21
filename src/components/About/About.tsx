import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Heart, FileText, ChevronDown, Activity, Target, Globe, AlertCircle } from 'lucide-react';
import { cleaningStats } from '../../data/analysis';
import './About.css';

const About = () => {
  const { t } = useTranslation();
  const [expandedEdu, setExpandedEdu] = useState<string | null>(null);
  const [isMainExpanded, setIsMainExpanded] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
  };

  const toggleEdu = (id: string) => {
    setExpandedEdu(expandedEdu === id ? null : id);
  };

  return (
    <section id="about" className="about">
      <div className="container">
        <motion.h2
          className="section-title"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {t('about.title')}
        </motion.h2>

        <motion.div
          className="about-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div className="about-info" variants={itemVariants}>
            <div
              className="about-card-main cyber-card"
              onClick={() => setIsMainExpanded(!isMainExpanded)}
              style={{ cursor: 'pointer' }}
            >
              <div className="about-card-header">
                <div className="about-card-header-label">
                  <Heart size={20} color="var(--accent-color)" />
                  <span className="card-label">{t('about.data_report')}</span>
                </div>
                <div
                  style={{ transform: isMainExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}
                >
                  <ChevronDown size={20} opacity={0.5} />
                </div>
              </div>

              <div className="about-content-wrapper">
                <AnimatePresence mode="wait">
                  {!isMainExpanded ? (
                    <motion.div
                      key="preview"
                      className="about-preview"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.1 }}
                    >
                      <p className="about-description-text">
                        Atividade avaliativa de Banco de Dados que integra importação de dados em R, diagnóstico de qualidade, modelo relacional, manipulação com dplyr e o pipeline SQL→R com DBI/RSQlite.
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="details"
                      className="about-details-expanded"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.1 }}
                    >
                      <div className="profile-deep-dive">
                        <p className="deep-text">
                          <span style={{ color: 'var(--accent-color)' }}>&gt;</span> {t('about.detailed_profile')}
                        </p>

                        <div className="mission-box">
                          <div className="mission-header">
                            <Target size={16} color="var(--accent-color)" />
                            <span className="card-label">{t('about.mission_objective')}</span>
                          </div>
                          <p className="mission-body">{t('about.mission_text')}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="about-details-list">
                <div className="detail-item-modern">
                  <Activity size={16} color="var(--accent-color)" />
                  <div className="detail-info-wrap">
                    <span className="detail-label">{t('about.initial')}</span>
                    <span className="detail-value">{cleaningStats.initialRecords.toLocaleString()} {t('about.records')}</span>
                  </div>
                </div>
                <div className="detail-item-modern">
                  <Globe size={16} color="var(--accent-color)" />
                  <div className="detail-info-wrap">
                    <span className="detail-label">{t('about.final')}</span>
                    <span className="detail-value">{cleaningStats.finalRecords.toLocaleString()} {t('about.records')}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div className="about-education" variants={itemVariants}>
            <div
              className="edu-card-modern cyber-card"
              onClick={() => toggleEdu('cert1')}
              style={{ cursor: 'pointer' }}
            >
              <div className="edu-header-row">
                <div className="edu-icon-container">
                  <Heart size={24} />
                </div>
                <div className="edu-content">
                  <span className="edu-type">{t('about.graduation_label')}</span>
                  <h3 className="edu-title">{t('about.graduation_title')}</h3>
                </div>
                <div
                  style={{ transform: expandedEdu === 'cert1' ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}
                >
                  <ChevronDown size={20} opacity={0.5} />
                </div>
              </div>

              <div className="edu-content-wrapper">
                <AnimatePresence mode="wait">
                  {expandedEdu !== 'cert1' ? (
                    <motion.div
                      key="preview"
                      className="edu-badge"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.1 }}
                    >
                      6.080 ROWS
                    </motion.div>
                  ) : (
                    <motion.div
                      key="detail"
                      className="edu-details-content"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.1 }}
                    >
                      <div className="edu-institution">
                        <span className="inst-name">{t('about.status_verified')}</span>
                        <span className="inst-full">{t('about.graduation_inst')}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div
              className="edu-card-modern cyber-card"
              onClick={() => toggleEdu('cert2')}
              style={{ cursor: 'pointer' }}
            >
              <div className="edu-header-row">
                <div className="edu-icon-container">
                  <FileText size={24} />
                </div>
                <div className="edu-content">
                  <span className="edu-type">{t('about.postgrad_label')}</span>
                  <h3 className="edu-title">{t('about.postgrad_title')}</h3>
                </div>
                <div
                  style={{ transform: expandedEdu === 'cert2' ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}
                >
                  <ChevronDown size={20} opacity={0.5} />
                </div>
              </div>

              <div className="edu-content-wrapper">
                <AnimatePresence mode="wait">
                  {expandedEdu !== 'cert2' ? (
                    <motion.div
                      key="preview"
                      className="edu-badge"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.1 }}
                    >
                      SQL → R
                    </motion.div>
                  ) : (
                    <motion.div
                      key="detail"
                      className="edu-details-content"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.1 }}
                    >
                      <div className="edu-institution">
                        <span className="inst-name">{t('about.status_authorized')}</span>
                        <span className="inst-full">{t('about.postgrad_inst')}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="mission-box about-alert-box">
              <div className="about-alert-header">
                <AlertCircle size={14} />
                <span className="card-label">{t('about.pipeline_status_active')}</span>
              </div>
              <p className="about-alert-body">{t('about.pipeline_alert')}</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;
