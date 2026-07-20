import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import './Projects.css';
import { analysisResults, regionData, summaryStats } from '../../data/analysis';
import { Lock, TrendingUp, MapPin } from 'lucide-react';

const Projects = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language.split('-')[0];
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const toggleProject = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <section id="projects" className="projects">
      <div className="container">
        <motion.h2
          className="section-title"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {t('projects.title')}
        </motion.h2>

        {/* Summary Cards */}
        <motion.div
          className="summary-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.div className="summary-card cyber-card" variants={itemVariants}>
            <div className="summary-icon"><TrendingUp size={20} /></div>
            <div className="summary-value">{summaryStats.totalBirths.toLocaleString()}</div>
            <div className="summary-label">NASCIMENTOS</div>
          </motion.div>
          <motion.div className="summary-card cyber-card" variants={itemVariants}>
            <div className="summary-icon"><MapPin size={20} /></div>
            <div className="summary-value">{summaryStats.avgWeight}g</div>
            <div className="summary-label">PESO MÉDIO</div>
          </motion.div>
          <motion.div className="summary-card cyber-card" variants={itemVariants}>
            <div className="summary-icon"><TrendingUp size={20} /></div>
            <div className="summary-value">{summaryStats.pctCesarea}%</div>
            <div className="summary-label">CESÁREAS</div>
          </motion.div>
          <motion.div className="summary-card cyber-card" variants={itemVariants}>
            <div className="summary-icon"><MapPin size={20} /></div>
            <div className="summary-value">{summaryStats.pctBaixoPeso}%</div>
            <div className="summary-label">BAIXO PESO</div>
          </motion.div>
        </motion.div>

        {/* Region Table */}
        <motion.div
          className="region-section"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="region-title">INDICADORES POR REGIÃO</h3>
          <div className="region-table-wrapper cyber-card">
            <table className="region-table">
              <thead>
                <tr>
                  <th>REGIÃO</th>
                  <th>NASCIMENTOS</th>
                  <th>% CESÁREAS</th>
                  <th>% BAIXO PESO</th>
                  <th>% PREMATUROS</th>
                </tr>
              </thead>
              <tbody>
                {regionData.map((row) => (
                  <tr key={row.region}>
                    <td className="region-name">{row.region}</td>
                    <td>{row.births}</td>
                    <td className={row.pctCesarea > 45 ? 'highlight-value' : ''}>{row.pctCesarea}%</td>
                    <td>{row.pctBaixoPeso}%</td>
                    <td>{row.pctPrematuro}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Analysis Results */}
        <motion.div
          className="projects-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {analysisResults.map((project) => (
            <div
              key={project.id}
              className={`project-card cyber-card ${expandedId === project.id ? 'expanded' : ''}`}
              onClick={() => toggleProject(project.id)}
              style={{ cursor: 'pointer' }}
            >
              <div className="project-header">
                <span className="project-category">
                  <Lock size={10} style={{ marginRight: '5px' }} />
                  {project.category[currentLang] || project.category['pt']}
                </span>
              </div>

              <h3 className="project-title">{project.title[currentLang] || project.title['pt']}</h3>
              <p className="project-desc">
                {project.description[currentLang] || project.description['pt']}
              </p>

              <div className="project-synopsis">
                <div className="project-details">
                  <div className="detail-item">
                    <strong>PROBLEMA:</strong> {project.problem[currentLang] || project.problem['pt']}
                  </div>
                  <div className="detail-item">
                    <strong>RESULTADO:</strong> <span className="highlight">{project.result[currentLang] || project.result['pt']}</span>
                  </div>
                </div>
              </div>

              <div className="project-tags">
                {project.tags.map(tag => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Projects;
