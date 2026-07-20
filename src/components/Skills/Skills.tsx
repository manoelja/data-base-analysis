import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Code, Database, Search, FileText, BarChart, Eye } from 'lucide-react';
import { techStack } from '../../data/analysis';
import './Skills.css';

const iconMap: Record<string, React.ReactNode> = {
  code: <Code size={18} />,
  database: <Database size={18} />,
  search: <Search size={18} />,
  'file-text': <FileText size={18} />,
  'bar-chart': <BarChart size={18} />,
  eye: <Eye size={18} />,
};

const Skills = () => {
  const { t } = useTranslation();
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null);

  const toggleSkill = (name: string) => {
    setExpandedSkill(expandedSkill === name ? null : name);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  return (
    <section id="skills" className="skills">
      <div className="container">
        <motion.h2
          className="section-title"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {t('skills.title')}
        </motion.h2>

        <motion.div
          className="skills-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {techStack.map((skill) => (
            <div
              key={skill.name}
              className={`skill-badge cyber-card ${expandedSkill === skill.name ? 'expanded' : ''}`}
              onClick={() => toggleSkill(skill.name)}
              style={{ cursor: 'pointer' }}
            >
              <div className="skill-header">
                <div className="skill-main-info">
                  <div className="skill-icon-wrapper">
                    {iconMap[skill.icon] || <Code size={18} />}
                  </div>
                  <div className="skill-text-info">
                    <span className="skill-category">{skill.category}</span>
                    <span className="skill-name">{skill.name}</span>
                  </div>
                </div>
                <div
                  className="skill-expand-icon"
                  style={{ transform: expandedSkill === skill.name ? 'rotate(180deg)' : 'rotate(0deg)' }}
                >
                  <ChevronDown size={16} opacity={0.4} />
                </div>
              </div>

              <div className="skill-detail-text">
                <p>{skill.detail}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Skills;
