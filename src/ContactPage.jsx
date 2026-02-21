import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, MapPin, Linkedin, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ContactPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#FBFBFA] flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 z-0">
                <div className="absolute -top-[10%] -right-[10%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-sky-50 to-indigo-50/50 blur-3xl opacity-70 animate-pulse" />
                <div className="absolute -bottom-[10%] -left-[10%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-blue-50 to-purple-50/50 blur-3xl opacity-70" />
            </div>

            <button
                onClick={() => navigate('/')}
                className="absolute top-8 left-8 flex items-center gap-2 text-slate-muted hover:text-deep-blue transition-colors font-bold group z-20"
            >
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                Back to Portfolio
            </button>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="max-w-xl w-full bg-white/80 backdrop-blur-md rounded-3xl border border-gray-100 shadow-[0_20px_40px_rgba(10,37,64,0.06)] p-8 md:p-12 z-10 relative overflow-hidden"
            >
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-deep-blue via-sky-400 to-indigo-500" />

                <div className="text-center mb-10">
                    <h1 className="text-4xl md:text-5xl font-bold text-ink-black tracking-tight mb-4">Let's Connect</h1>
                    <p className="text-lg text-slate-muted font-medium">Looking for data engineering roles or collaboration opportunities. My inbox is always open.</p>
                </div>

                <div className="space-y-4">
                    <a
                        href="mailto:kimchany@usc.edu"
                        className="flex items-center gap-4 w-full p-4 rounded-2xl border border-gray-100 bg-white hover:border-sky-300 hover:shadow-md transition-all group"
                    >
                        <div className="w-12 h-12 rounded-full bg-sky-50 flex items-center justify-center text-deep-blue group-hover:bg-deep-blue group-hover:text-white transition-colors shrink-0">
                            <Mail size={24} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-bold text-slate-muted mb-0.5">Direct Email</h3>
                            <p className="text-lg font-bold text-ink-black group-hover:text-deep-blue transition-colors">kimchany@usc.edu</p>
                        </div>
                        <Send size={20} className="text-gray-300 group-hover:text-deep-blue transition-colors group-hover:translate-x-1" />
                    </a>

                    <a
                        href="https://www.linkedin.com/in/chanyoung-kim-84bb88299/"
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-4 w-full p-4 rounded-2xl border border-gray-100 bg-white hover:border-sky-300 hover:shadow-md transition-all group"
                    >
                        <div className="w-12 h-12 rounded-full bg-sky-50 flex items-center justify-center text-deep-blue group-hover:bg-[#0A66C2] group-hover:text-white transition-colors shrink-0">
                            <Linkedin size={24} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-bold text-slate-muted mb-0.5">LinkedIn</h3>
                            <p className="text-lg font-bold text-ink-black group-hover:text-[#0A66C2] transition-colors">Chanyoung Kim</p>
                        </div>
                        <Send size={20} className="text-gray-300 group-hover:text-[#0A66C2] transition-colors group-hover:translate-x-1" />
                    </a>

                    <div className="flex items-center gap-4 w-full p-4 rounded-2xl border border-transparent bg-slate-50">
                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-slate-muted shadow-sm shrink-0">
                            <MapPin size={24} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-bold text-slate-muted mb-0.5">Location</h3>
                            <p className="text-lg font-bold text-ink-black">Los Angeles, CA</p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
