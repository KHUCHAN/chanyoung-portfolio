import React, { useState, useEffect } from 'react';
import { User, Briefcase, BookOpen, Mail, ChevronDown, ExternalLink, Activity, Code as CodeIcon, Database, GraduationCap } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'framer-motion';
import { BrowserRouter, Routes, Route, useNavigate, Link } from 'react-router-dom';
import NotionPosts from './NotionPosts';
import ContactPage from './ContactPage';
function cn(...inputs) {
    return twMerge(clsx(inputs));
}

function Navbar() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav
            className={cn(
                'fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-5xl rounded-full transition-all duration-300',
                scrolled
                    ? 'bg-white/70 backdrop-blur-md shadow-surface border border-white/40 py-3 px-6'
                    : 'bg-transparent py-4 px-6'
            )}
        >
            <div className="flex items-center justify-between">
                <a href="#" className="flex items-center gap-2 group">
                    <div className="w-10 h-10 rounded-full border border-gray-200 overflow-hidden shadow-surface group-hover:-translate-y-0.5 transition-transform duration-300">
                        <img src="/photo.jpg" alt="Logo" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                    </div>
                </a>

                <div className="hidden md:flex items-center gap-8 text-slate-muted font-medium text-sm">
                    <a href="#personal" className="relative group hover:text-deep-blue transition-colors">
                        Personal
                        <span className="absolute -bottom-1.5 left-0 w-full h-[2px] bg-deep-blue scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-200"></span>
                    </a>
                    <a href="#projects" className="relative group hover:text-deep-blue transition-colors">
                        Professional Projects
                        <span className="absolute -bottom-1.5 left-0 w-full h-[2px] bg-deep-blue scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-200"></span>
                    </a>
                    <Link to="/posts" className="relative group hover:text-deep-blue transition-colors">
                        Technical Posts
                        <span className="absolute -bottom-1.5 left-0 w-full h-[2px] bg-deep-blue scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-200"></span>
                    </Link>
                </div>

                <div className="flex items-center gap-4">
                    <a
                        href="#contact"
                        className="flex items-center gap-2 bg-deep-blue text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-surface hover:-translate-y-px transition-transform duration-200"
                    >
                        Contact Me
                    </a>
                </div>
            </div>
        </nav>
    );
}

function Hero() {
    return (
        <section className="relative min-h-[90vh] flex items-center pt-24 pb-16 px-6 overflow-hidden">
            <div className="max-w-6xl mx-auto w-full grid lg:grid-cols-[1.2fr_0.8fr] gap-12 items-center">

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="space-y-6 relative z-10"
                >
                    <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-surface text-sm font-bold text-deep-blue uppercase tracking-wider">
                        <Activity size={16} />
                        System Operational
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-ink-black leading-[1.1]">
                        Hey, I'm <br />
                        <span className="text-deep-blue">Chanyoung Kim.</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-slate-muted font-medium max-w-xl">
                        AI/Data Engineer specializing in AML & Risk Analytics.
                    </p>

                    <div className="flex flex-wrap items-center gap-4 pt-4">
                        <a href="https://www.linkedin.com/in/chanyoung-kim-84bb88299/" target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-deep-blue text-white px-7 py-3.5 rounded-2xl font-bold hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                            View LinkedIn
                        </a>
                        <a href="#projects" className="flex items-center gap-2 bg-white text-ink-black border border-gray-200 px-7 py-3.5 rounded-2xl font-bold hover:-translate-y-1 hover:shadow-lg transition-all duration-300 shadow-surface">
                            View Projects
                        </a>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    className="relative h-[480px] hidden lg:block"
                >
                    <div className="absolute inset-0 flex items-center justify-center">
                        {/* Soft geometric gradient rings */}
                        <div className="w-[380px] h-[380px] rounded-full bg-gradient-to-tr from-white to-sky-50 shadow-surface absolute animate-[spin_40s_linear_infinite]" />
                        <div className="w-[280px] h-[280px] rounded-full bg-gradient-to-tr from-sky-50 to-indigo-50 shadow-surface absolute animate-[spin_30s_linear_infinite_reverse]" />

                        {/* Center Avatar / Image Wrapper */}
                        <motion.div
                            animate={{ y: [0, -8, 0] }}
                            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                            className="w-40 h-40 rounded-full bg-gradient-to-br from-deep-blue to-indigo-900 border-4 border-white shadow-xl flex items-center justify-center z-10 overflow-hidden relative group"
                        >
                            <img src="/photo.jpg" alt="Chanyoung Kim" className="w-full h-full object-cover relative z-10" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

const SKILLS = [
    { category: 'Languages', items: ['Python', 'R', 'SAP ABAP', 'SQL', 'JavaScript'] },
    { category: 'AI / Machine Learning', items: ['NLP (KoNLPy, NLTK)', 'Word2Vec / FastText', 'K-Means Clustering', 'Time Series Forecasting'] },
    { category: 'Data Engineering', items: ['Knowledge Graph (Neo4j, Cypher)', 'Data Pre-processing', 'Feature Engineering'] }
];

const EDUCATION = [
    {
        degree: "Master of Science in Applied Data Science",
        school: "University of Southern California",
        location: "Los Angeles, CA",
        date: "Jan 2026 - Dec 2027",
        logo: "/usc_logo.svg",
        details: []
    },
    {
        degree: "Bachelor of Business Administration",
        school: "Kyung Hee University",
        location: "Seoul, South Korea",
        date: "Jan 2016 - Feb 2023",
        logo: "/kyunghee_logo.png",
        details: [
            "Concentration: AI Business & Data Analysis",
            "GPA: 3.89 / 4.5",
            "Awards: Merit-based Scholarship"
        ]
    }
];

function EducationSection() {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.15, delayChildren: 0.2 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30, scale: 0.95 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 100, damping: 15 } }
    };

    return (
        <section id="education" className="py-24 px-6 relative overflow-hidden">
            <div className="max-w-6xl mx-auto relative z-10">
                <div className="mb-16 text-center md:text-left">
                    <h2 className="text-sm font-bold text-deep-blue uppercase tracking-widest mb-3">Academic Background</h2>
                    <h3 className="text-3xl md:text-5xl font-bold tracking-tight text-ink-black">Education</h3>
                </div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    className="grid md:grid-cols-2 gap-6"
                >
                    {EDUCATION.map((edu, idx) => (
                        <motion.div
                            key={idx}
                            variants={itemVariants}
                            whileHover={{ scale: 1.02, transition: { type: "spring", stiffness: 400 } }}
                            className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 lg:p-10 border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(10,37,64,0.12)] transition-all duration-500 relative group overflow-hidden flex flex-col justify-between gap-6"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-sky-50/0 to-indigo-50/0 group-hover:from-sky-50 group-hover:to-indigo-50/50 transition-colors duration-500 -z-10" />

                            <div className="flex flex-col gap-6">
                                <div className="flex items-center justify-between">
                                    <div className="w-16 h-16 shrink-0 rounded-2xl bg-white flex items-center justify-center shadow-sm overflow-hidden border border-gray-100 p-2">
                                        <img src={edu.logo} alt={`${edu.school} Logo`} className="w-full h-full object-contain" onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
                                        <GraduationCap size={28} className="text-deep-blue hidden" />
                                    </div>
                                    <div className="text-right">
                                        <span className="inline-block text-xs font-bold text-deep-blue bg-sky-50 px-3 py-1 rounded-full uppercase tracking-wider mb-1">
                                            {edu.date}
                                        </span>
                                        <p className="text-xs font-bold text-slate-muted">
                                            {edu.location}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-xl md:text-2xl font-bold text-ink-black mb-2 leading-tight">{edu.school}</h4>
                                    <h5 className="text-md font-bold text-deep-blue mb-1">{edu.degree}</h5>

                                    {edu.details.length > 0 && (
                                        <div className="flex flex-wrap gap-x-3 gap-y-2 mt-4">
                                            {edu.details.map((detail, dIdx) => (
                                                <span key={dIdx} className="px-3 py-1 bg-slate-50 border border-sky-100 text-deep-blue text-xs font-bold rounded-lg font-mono tracking-tight">
                                                    {detail}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}

function FeaturedWork() {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.15, delayChildren: 0.2 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20, scale: 0.95 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 100, damping: 15 } }
    };

    const chipVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: (custom) => ({
            opacity: 1,
            scale: 1,
            y: [0, -5, 0],
            transition: {
                opacity: { delay: custom.delay, duration: 0.5 },
                scale: { delay: custom.delay, type: "spring", stiffness: 200, damping: 20 },
                y: {
                    repeat: Infinity,
                    duration: 3,
                    ease: "easeInOut",
                    delay: custom.delay + 0.5 // Start the wave after the entrance animation
                }
            }
        }),
        hover: {
            scale: 1.05,
            backgroundColor: '#0A2540',
            color: '#ffffff',
            boxShadow: '0 10px 15px -3px rgba(10, 37, 64, 0.3)',
            y: -2,
            transition: { duration: 0.2 }
        }
    };

    return (
        <section id="personal" className="py-24 px-6 relative overflow-hidden">
            <div className="max-w-6xl mx-auto relative z-10">
                <div className="mb-16">
                    <h2 className="text-sm font-bold text-deep-blue uppercase tracking-widest mb-3">Core Competencies</h2>
                    <h3 className="text-3xl md:text-5xl font-bold tracking-tight text-ink-black">Technical Skills</h3>
                </div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.1 }}
                    className="grid md:grid-cols-3 gap-8"
                >
                    {SKILLS.map((skillGroup, groupIdx) => (
                        <motion.div
                            key={skillGroup.category}
                            variants={itemVariants}
                            whileHover={{ y: -8, transition: { type: "spring", stiffness: 300 } }}
                            className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(10,37,64,0.12)] transition-shadow duration-500 relative group overflow-hidden"
                        >
                            {/* Decorative background glow on hover */}
                            <div className="absolute inset-0 bg-gradient-to-br from-sky-50/0 to-indigo-50/0 group-hover:from-sky-50 group-hover:to-indigo-50/50 transition-colors duration-500 -z-10" />

                            <h4 className="text-lg font-bold text-ink-black mb-6 flex items-center gap-3">
                                <motion.div
                                    whileHover={{ rotate: 15, scale: 1.1 }}
                                    className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-100 to-blue-50 flex items-center justify-center text-deep-blue shadow-sm"
                                >
                                    {groupIdx === 0 ? <CodeIcon size={18} /> : groupIdx === 1 ? <Activity size={18} /> : <Database size={18} />}
                                </motion.div>
                                {skillGroup.category}
                            </h4>

                            <div className="flex flex-wrap gap-2.5">
                                {skillGroup.items.map((skill, idx) => (
                                    <motion.span
                                        key={skill}
                                        custom={{ delay: (groupIdx * 0.1) + (idx * 0.05), idx }}
                                        variants={chipVariants}
                                        initial="hidden"
                                        whileInView="visible"
                                        viewport={{ once: true }}
                                        whileHover="hover"
                                        whileTap={{ scale: 0.95 }}
                                        className="px-4 py-2 bg-white border border-gray-100/80 text-slate-muted text-sm font-bold rounded-xl cursor-pointer transition-colors shadow-sm inline-block"
                                    >
                                        {skill}
                                    </motion.span>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}

function ProjectAccordion({ title, subtitle, date, role, stack, achievements, isOpen, onClick }) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-surface overflow-hidden transition-all duration-300 mb-4">
            <button
                onClick={onClick}
                className="w-full text-left px-6 py-5 flex items-center justify-between hover:bg-slate-50 transition-colors"
            >
                <div>
                    <h4 className="text-xl font-bold text-ink-black">{title}</h4>
                    <p className="text-sm text-slate-muted font-medium mt-1">{subtitle}</p>
                </div>
                <div className="flex items-center gap-4">
                    <span className="hidden sm:inline-block text-xs font-bold text-deep-blue bg-sky-50 px-3 py-1 rounded-full uppercase tracking-wider">
                        {date}
                    </span>
                    <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
                        <ChevronDown className="text-slate-muted" size={20} />
                    </motion.div>
                </div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div className="px-6 pb-6 pt-2">
                            <div className="w-full h-px bg-gray-100 mb-6"></div>

                            <div className="grid md:grid-cols-[1fr_2fr] gap-8">
                                <div className="space-y-6">
                                    <div>
                                        <h5 className="text-xs font-bold text-slate-muted uppercase tracking-wider mb-2">Role</h5>
                                        <p className="font-bold text-ink-black">{role}</p>
                                    </div>
                                    <div>
                                        <h5 className="text-xs font-bold text-slate-muted uppercase tracking-wider mb-2">Tech Stack</h5>
                                        <div className="flex flex-wrap gap-2">
                                            {stack.map(tech => (
                                                <span key={tech} className="px-3 py-1 bg-sky-50 border border-sky-100 text-deep-blue text-xs font-bold rounded-lg font-mono">
                                                    {tech}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h5 className="text-xs font-bold text-slate-muted uppercase tracking-wider mb-3">Key Achievements</h5>
                                    <ul className="space-y-3">
                                        {achievements.map((item, i) => (
                                            <li key={i} className="flex gap-3 text-slate-muted">
                                                <span className="text-deep-blue mt-1">•</span>
                                                <span className="leading-relaxed font-medium">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

const projects = [
    {
        id: 1,
        title: "Global Compliance RegTech AI Solution",
        subtitle: "Built an AI RegTech solution mapping internal controls to international statutes (26 countries).",
        date: "Oct 2025 - Dec 2025",
        role: "Senior Consultant | Data Scientist",
        stack: ["Python", "NLP", "RAG", "Knowledge Graph", "Agentic AI"],
        achievements: [
            "Engineered an end-to-end NLP pipeline leveraging Semantic Chunking for PDF document ingestion.",
            "Constructed a Graph DB to structure relationships between legal clauses and compliance items.",
            "Implemented semantic matching algorithms identifying regulatory gaps, vastly reducing manual review."
        ]
    },
    {
        id: 2,
        title: "Global Maritime Supply Chain Risk Prediction",
        subtitle: "Architected an AI-driven Early Warning System for supply chain disruptions.",
        date: "Aug 2025 - Oct 2025",
        role: "Data Scientist",
        stack: ["Python", "Machine Learning", "Random Forest", "Web Crawling"],
        achievements: [
            "Designed Random Forest models utilizing dynamic feature weighting with superior interpretability over Deep Learning.",
            "Built a hybrid pipeline combining structured (API) and unstructured text processing (LLM summarization).",
            "Automated complete end-to-end monitoring alerts and DQ checks."
        ]
    },
    {
        id: 3,
        title: "Samsung Fire & Marine AML System Enhancement",
        subtitle: "Enhancement of KYC, RBA, and Transaction Reporting systems.",
        date: "Apr 2025 - Oct 2025",
        role: "PMO & Technical Lead",
        stack: ["SQL", "Python", "Machine Learning", "K-Means"],
        achievements: [
            "Applied K-Means Clustering for dynamic threshold optimization by customer/transaction segments.",
            "Prevented thousands of false AML alerts triggered solely by absolute volume criteria.",
            "Guided the team through complex SQL domain tuning for superior transaction speed."
        ]
    },
    {
        id: 4,
        title: "Yuanta Securities AML System Enhancement",
        subtitle: "Risk modeling and strategy implementation for financial transactions.",
        date: "Nov 2024 - Mar 2025",
        role: "Data Engineering Analyst",
        stack: ["Python", "SQL", "Anti-Money Laundering"],
        achievements: [
            "Upgraded Global/Product Risk Rating (GRR/PRR) models mapping advanced transaction patterns.",
            "Defined and validated new Suspicious Transaction Report (STR) rules querying billions of transaction rows."
        ]
    },
    {
        id: 5,
        title: "IBK AML Overseas Branch System Reconstruction",
        subtitle: "Data integrity verification and mart pipeline rebuilds globally.",
        date: "May 2023 - Nov 2024",
        role: "Data Engineer",
        stack: ["Python", "SQL", "ETL Design", "Oracle OFSAA"],
        achievements: [
            "Developed Python automation replacing manual validation of banking compliance datasets.",
            "Rebuilt AML Data Mart mapping for 9 full overseas branches.",
            "Replicated native Oracle OFSAA calculations in custom ETL to guarantee consistency."
        ]
    },
    {
        id: 6,
        title: "Forensic Data Analysis & Special Investigations",
        subtitle: "Applying data science to discover hidden accounting/corporate fraud.",
        date: "Jan 2023 - Mar 2024",
        role: "Forensic Data Specialist",
        stack: ["Python", "OpenCV", "Tableau", "SAP ABAP", "NetworkX"],
        achievements: [
            "Detected kickbacks using OpenCV to automatically parse vehicle license plates from factory CCTV.",
            "Hunted shell-company M&A Fraud by graphically analyzing web-scraped shareholder nodes.",
            "Uncovered 3 billion KRW accounting window-dressing by tracing SAP ABAP inventory paths."
        ]
    },
    {
        id: 7,
        title: "Barrier-Free Route Recommendation Service",
        subtitle: "Navigation service algorithm for mobility-impaired transportation.",
        date: "Jul 2022 - Dec 2022",
        role: "Project Leader (SMART LAB)",
        stack: ["Python", "JavaScript", "HTML", "QGIS"],
        achievements: [
            "Architected real-time routing logic handling elevator paths, subway stations, and low-floor bus arrivals.",
            "Led end-to-end development bridging complex geographic variables with accessible UX."
        ]
    },
    {
        id: 8,
        title: "Optimization of Express Train Stops (Seoul Line 1)",
        subtitle: "Data-backed rebalancing of public transportation efficiency.",
        date: "Apr 2022 - Jul 2022",
        role: "Lead Analyst",
        stack: ["Python", "SmartPLS", "Tableau", "Data Mining"],
        achievements: [
            "Aggregated 17 unstructured urban variables (e.g. Starbucks density) via GIS web crawling.",
            "Executed Multiple Regression/PCA achieving R-squared of 0.92, winning 1st place in Business Analytics cohort."
        ]
    }
];

function ProjectsPreview() {
    const [openId, setOpenId] = useState(projects[0].id);

    return (
        <section id="projects" className="py-24 px-6 bg-white/50 border-y border-white/40 shadow-[0_0_20px_rgba(49,59,172,0.03)]">
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="mb-12 text-center"
                >
                    <h2 className="text-sm font-bold text-deep-blue uppercase tracking-widest mb-3">Professional Projects</h2>
                    <h3 className="text-3xl md:text-5xl font-bold tracking-tight text-ink-black">Deep Dive</h3>
                </motion.div>

                <div className="space-y-4">
                    {projects.map((proj, idx) => (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.2 }}
                            transition={{ delay: idx * 0.08 }}
                            key={proj.id}
                        >
                            <ProjectAccordion
                                {...proj}
                                isOpen={openId === proj.id}
                                onClick={() => setOpenId(openId === proj.id ? null : proj.id)}
                            />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function Extras() {
    const navigate = useNavigate();

    return (
        <section id="extras" className="py-24 px-6">
            <div className="max-w-6xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="mb-12"
                >
                    <h2 className="text-sm font-bold text-deep-blue uppercase tracking-widest mb-3">Extras</h2>
                    <h3 className="text-3xl md:text-4xl font-bold tracking-tight text-ink-black">Quick Access</h3>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-6">
                    <motion.button
                        onClick={() => navigate('/contact')}
                        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
                        className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-surface hover:-translate-y-1 transition-all duration-300 text-left w-full block"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <Mail className="text-deep-blue" size={24} />
                            <ExternalLink className="text-gray-300 group-hover:text-deep-blue transition-colors" size={20} />
                        </div>
                        <h4 className="text-lg font-bold text-ink-black mb-1">Contact Page</h4>
                        <p className="text-sm text-slate-muted font-medium">Direct messaging and email routing.</p>
                    </motion.button>

                    <motion.button
                        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
                        onClick={() => navigate('/posts')}
                        className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-surface hover:-translate-y-1 transition-all duration-300 text-left w-full block"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <BookOpen className="text-deep-blue" size={24} />
                            <ExternalLink className="text-gray-300 group-hover:text-deep-blue transition-colors" size={20} />
                        </div>
                        <h4 className="text-lg font-bold text-ink-black mb-1">Open Posts Workspace</h4>
                        <p className="text-sm text-slate-muted font-medium">Notion-style rich text editor and knowledge base.</p>
                    </motion.button>

                    <motion.a
                        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
                        href="https://www.linkedin.com/in/chanyoung-kim-84bb88299/" target="_blank" rel="noreferrer" className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-surface hover:-translate-y-1 transition-all duration-300"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <User className="text-deep-blue" size={24} />
                            <ExternalLink className="text-gray-300 group-hover:text-deep-blue transition-colors" size={20} />
                        </div>
                        <h4 className="text-lg font-bold text-ink-black mb-1">LinkedIn Profile</h4>
                        <p className="text-sm text-slate-muted font-medium">Full professional history and credentials.</p>
                    </motion.a>
                </div>
            </div>
        </section>
    );
}

function Footer() {
    return (
        <footer id="contact" className="py-12 px-6 border-t border-white/50 bg-white/30 backdrop-blur-sm mt-12">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-deep-blue text-white flex items-center justify-center font-bold text-xs">
                        CK
                    </div>
                    <span className="font-bold text-ink-black text-sm">&copy; {new Date().getFullYear()} Chanyoung Kim</span>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-xs font-bold font-mono uppercase text-slate-muted px-3 py-1.5 bg-white rounded-full shadow-sm border border-gray-100">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        System Online
                    </div>
                </div>
            </div>
        </footer>
    );
}

function PortfolioPage() {
    return (
        <div className="relative isolate min-h-screen">
            {/* Background Effects */}
            <div className="fixed inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem]">
                <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_800px_at_100%_200px,#d5c5ff,transparent)]"></div>
            </div>

            <Navbar />
            <main>
                <Hero />
                <EducationSection />
                <FeaturedWork />
                <ProjectsPreview />
                <Extras />
            </main>
            <Footer />
        </div>
    );
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<PortfolioPage />} />
                <Route path="/posts" element={<NotionPosts />} />
                <Route path="/contact" element={<ContactPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
