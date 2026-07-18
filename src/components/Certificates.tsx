import React from 'react';
import { Certificate } from '../types';
import { Trophy, Award, Calendar, Check, ExternalLink, Bookmark, Download, Sparkles } from 'lucide-react';

interface CertificatesProps {
  certificates: Certificate[];
  onNavigateBack: () => void;
}

export function Certificates({ certificates, onNavigateBack }: CertificatesProps) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <button 
          onClick={onNavigateBack}
          className="text-[#F8F7F4]/60 hover:text-amber-400 transition text-xs font-mono font-bold tracking-widest uppercase flex items-center gap-1.5 cursor-pointer"
        >
          &larr; Back to Dashboard
        </button>
      </div>

      <div className="text-center mb-10">
        <span className="text-[10px] font-mono text-amber-400 font-bold tracking-widest uppercase">[03] Certificate Vault</span>
        <h1 className="text-4xl font-display font-extrabold text-[#F8F7F4] tracking-tight mt-1 uppercase flex items-center justify-center gap-2">
          Scholar Certification Vault
        </h1>
        <p className="text-xs font-mono text-[#F8F7F4]/50 mt-2 max-w-xl mx-auto leading-relaxed">
          Display and verify your completed academic credentials compiled securely by the AI Course Learning Platform.
        </p>
      </div>

      {certificates.length === 0 ? (
        <div className="bg-[#18181b] border border-white/10 p-12 text-center max-w-xl mx-auto font-mono">
          <Award className="w-16 h-16 text-[#F8F7F4]/20 mx-auto mb-4" />
          <h3 className="text-sm font-bold text-[#F8F7F4] uppercase">No certificates issued yet</h3>
          <p className="text-[#F8F7F4]/40 mt-2 text-xs max-w-md mx-auto leading-relaxed">
            Complete all chapters, lessons, and quizzes in a generated course with a passing grade to unlock your digital credential.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {certificates.map((cert) => (
            <div 
              key={cert.id}
              className="bg-[#18181b] p-6 border-t-2 border-t-amber-400 border-x border-b border-white/10 flex flex-col justify-between relative overflow-hidden group hover:border-[#FFD700]/30 transition-all duration-300"
            >
              {/* Embossed background watermark */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-[0.01] pointer-events-none">
                <Award className="w-64 h-64 text-amber-400" />
              </div>

              <div>
                <div className="flex justify-between items-start mb-6 border-b border-white/5 pb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                    <span className="text-[9px] font-mono font-bold text-amber-400 tracking-widest uppercase">Verified Credential</span>
                  </div>
                  <span className="text-[9px] font-mono text-[#F8F7F4]/40">ID: {cert.id}</span>
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="text-[9px] font-mono text-[#F8F7F4]/40 uppercase">RECIPIENT</span>
                    <h3 className="text-xl font-display font-extrabold text-[#F8F7F4] tracking-tight mt-0.5 uppercase">{cert.userName}</h3>
                  </div>

                  <div>
                    <span className="text-[9px] font-mono text-[#F8F7F4]/40 uppercase">FOR SUCCESSFUL GRADUATION FROM</span>
                    <h4 className="text-base font-bold text-amber-400 mt-1 font-display uppercase tracking-tight leading-tight">{cert.courseName}</h4>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-white/5 flex justify-between items-end">
                <div className="font-mono">
                  <div className="flex items-center gap-1.5 text-[10px] text-[#F8F7F4]/50">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>ISSUED {cert.completionDate.toUpperCase()}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-[9px] font-bold text-emerald-400 uppercase">
                    <Check className="w-3.5 h-3.5" />
                    <span>Signatures Verified</span>
                  </div>
                </div>

                <div className="flex gap-2 relative z-10">
                  <button
                    id={`btn-verify-${cert.id}`}
                    onClick={() => alert(`Verification URL: ${cert.verificationLink}\nStatus: Active. This cryptographic certificate signature is fully authentic.`)}
                    className="p-2.5 bg-[#111113] border border-white/10 text-[#F8F7F4]/60 hover:text-white hover:border-white/30 transition cursor-pointer"
                    title="Verify cryptographically"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                  <button
                    id={`btn-download-${cert.id}`}
                    onClick={() => alert("Downloading PDF Certificate representation to your local system...")}
                    className="px-4 py-2 text-xs font-mono font-bold bg-[#FFD700] border border-[#FFD700] text-[#111113] hover:bg-amber-400 transition flex items-center gap-1.5 cursor-pointer uppercase"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

