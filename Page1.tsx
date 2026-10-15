import React, { useEffect, useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Link } from 'react-router-dom';
import { Volume2, VolumeX } from 'lucide-react';
import { supabase, triggerHaptic } from '../lib/supabase';
import { Page1Config } from '../types/pageConfig';

const defaultConfig: Page1Config = {
  bgType: 'color',
  bgColor: '#0f172a',
  bgMediaUrl: '',
  audioUrl: '',
  title: 'Welcome to the Portal',
  titleColor: '#38bdf8',
  titleSize: 'text-5xl',
  titleEffect: 'glow',
  titleVibe: 'none',
  subtitle: 'Scan the code or proceed below',
  qrTargetUrl: '/page2',
  qrSize: 220,
  qrColor: '#38bdf8',
  qrBg: '#1e293b',
  qrVibe: 'none',
  buttonText: 'Enter Portal',
  buttonLink: '/page2',
  buttonBg: '#0284c7',
  buttonColor: '#ffffff',
  buttonVibe: 'vibe-bounce',
};

export const Page1: React.FC = () => {
  const [config, setConfig] = useState<Page1Config>(defaultConfig);
  const [muted, setMuted] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // 1. Fetch initial configuration from Supabase
    supabase
      .from('page_configurations')
      .select('config')
      .eq('id', 'page1')
      .single()
      .then(({ data }) => {
        if (data?.config) setConfig(data.config as Page1Config);
      });

    // 2. Real-time subscription so visitor view updates instantly when admin saves
    const channel = supabase
      .channel('realtime:page1')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'page_configurations', filter: 'id=eq.page1' },
        (payload) => {
          if (payload.new?.config) {
            setConfig(payload.new.config as Page1Config);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const toggleSound = () => {
    if (!audioRef.current) return;
    triggerHaptic(30);
    if (muted) {
      audioRef.current.play().catch(() => {});
      setMuted(false);
    } else {
      audioRef.current.pause();
      setMuted(true);
    }
  };

  const getEffectClass = (effect: string) => {
    if (effect === 'neon') return 'text-effect-neon';
    if (effect === 'glow') return 'text-effect-glow';
    if (effect === '3d') return 'text-effect-3d';
    return '';
  };

  const getVibeClass = (vibe: string) => {
    if (vibe === 'vibe-subtle') return 'animate-vibe-subtle';
    if (vibe === 'vibe-intense') return 'animate-vibe-intense';
    if (vibe === 'vibe-pulse') return 'vibe-pulse';
    if (vibe === 'vibe-bounce') return 'vibe-bounce';
    return '';
  };

  return (
    <div
      className="relative min-h-screen w-full flex flex-col items-center justify-center p-6 text-center overflow-hidden"
      style={{
        backgroundColor: config.bgType === 'color' ? config.bgColor : undefined,
        backgroundImage: config.bgType === 'image' && config.bgMediaUrl ? `url(${config.bgMediaUrl})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Background Video Layer */}
      {config.bgType === 'video' && config.bgMediaUrl && (
        <video
          src={config.bgMediaUrl}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover -z-10 brightness-50"
        />
      )}

      {/* Audio Player */}
      {config.audioUrl && (
        <>
          <audio ref={audioRef} src={config.audioUrl} loop />
          <button
            onClick={toggleSound}
            className="absolute top-6 right-6 p-3 rounded-full bg-slate-900/80 backdrop-blur border border-slate-700 text-white shadow-lg hover:scale-110 active:scale-95 transition"
            title="Toggle Sound"
          >
            {muted ? <VolumeX className="w-6 h-6 text-slate-400" /> : <Volume2 className="w-6 h-6 text-sky-400" />}
          </button>
        </>
      )}

      {/* Hero Header Area */}
      <div className="max-w-2xl mx-auto space-y-4 mb-8">
        <h1
          className={`font-black tracking-tight ${config.titleSize} ${getEffectClass(config.titleEffect)} ${getVibeClass(config.titleVibe)}`}
          style={{ color: config.titleColor }}
        >
          {config.title}
        </h1>
        <p className="text-lg md:text-xl text-slate-300 font-medium">{config.subtitle}</p>
      </div>

      {/* QR Code Container */}
      <div
        className={`p-5 rounded-2xl shadow-2xl backdrop-blur-md mb-8 transition transform hover:scale-105 ${getVibeClass(config.qrVibe)}`}
        style={{ backgroundColor: config.qrBg }}
        onClick={() => triggerHaptic([30, 50, 30])}
      >
        <QRCodeSVG
          value={window.location.origin + config.qrTargetUrl}
          size={config.qrSize}
          fgColor={config.qrColor}
          bgColor="transparent"
          level="H"
          includeMargin={false}
        />
        <p className="text-xs mt-3 font-semibold uppercase tracking-wider text-slate-400">Scan to Open</p>
      </div>

      {/* Action / Enter Button */}
      <div className="w-full max-w-xs">
        <Link
          to={config.buttonLink}
          onClick={() => triggerHaptic(70)}
          className={`block w-full py-4 px-8 rounded-xl font-bold text-lg shadow-xl text-center transition active:scale-95 ${getVibeClass(config.buttonVibe)}`}
          style={{
            backgroundColor: config.buttonBg,
            color: config.buttonColor,
          }}
        >
          {config.buttonText}
        </Link>
      </div>
    </div>
  );
};