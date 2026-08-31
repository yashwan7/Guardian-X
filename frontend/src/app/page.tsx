'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { InteractiveDotGrid } from '@/components/ui/InteractiveDotGrid';
import { 
  ShieldCheck, 
  Cpu, 
  ArrowRight, 
  Lock, 
  Activity, 
  RefreshCw, 
  CheckCircle2, 
  Sparkles,
  KeyRound,
  Terminal
} from 'lucide-react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signInWithGoogle, skipAuth, isAuthenticated, isLoading: authLoading } = useAuth();

  const [isSigningIn, setIsSigningIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const urlError = searchParams.get('error');

  useEffect(() => {
    setMounted(true);
    if (urlError) {
      if (urlError === 'auth_callback_failed') {
        setErrorMessage('Supabase Invalid API Key / Project URL mismatch. Please update NEXT_PUBLIC_SUPABASE_URL in frontend/.env.local or use Guest Operator mode.');
      } else if (urlError === 'auth_config_missing') {
        setErrorMessage('Supabase authentication is not configured in this deployment. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in Vercel, then redeploy.');
      } else {
        setErrorMessage(decodeURIComponent(urlError));
      }
    }
  }, [urlError]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setErrorMessage(null);

    try {
      const res = await signInWithGoogle();
      if (res?.error) {
        setErrorMessage(res.error.message || 'Unable to connect to Google OAuth. Please try again.');
        setIsSigningIn(false);
      }
    } catch {
      setErrorMessage('Unexpected error during sign-in. Please try again.');
      setIsSigningIn(false);
    }
  };

  const handleGuestAccess = () => {
    skipAuth();
    router.push('/dashboard');
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-hidden bg-[#03060a] text-white font-sans selection:bg-cyan-500/30 selection:text-cyan-100">
      
      {/* ─────────────────────────────────────────────────────────────
          CINEMATIC BACKDROP WITH macOS LIQUID VIBRANCY
         ───────────────────────────────────────────────────────────── */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover opacity-60 scale-105 filter brightness-90 contrast-125 saturate-150"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260818_072341_50851634-bbc3-4c33-9acc-7647d4db44aa.mp4"
        />

        {/* Ambient colored orbs for deep glass refraction */}
        <div className="absolute -top-32 -left-32 w-[550px] h-[550px] rounded-full bg-cyan-500/20 blur-[130px] pointer-events-none" />
        <div className="absolute top-1/2 -right-32 w-[500px] h-[500px] rounded-full bg-blue-600/15 blur-[140px] pointer-events-none" />
        <div className="absolute -bottom-32 left-1/3 w-[600px] h-[600px] rounded-full bg-emerald-500/10 blur-[150px] pointer-events-none" />

        {/* Dark Scrim Overlays */}
        <div className="absolute inset-0 bg-radial from-transparent via-[#03060a]/50 to-[#03060a]/90 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#03060a]/80 via-transparent to-[#03060a]/95 pointer-events-none" />
      </div>

      {/* Interactive Dot Grid Canvas */}
      <InteractiveDotGrid 
        dotSize={2}
        dotSpacing={19}
        repulsionRadius={120}
        repulsionStrength={38}
        className="opacity-75"
      />

      {/* ─────────────────────────────────────────────────────────────
          macOS FROSTED TOP BAR (CHANGE 1: POSITIONED FURTHER LEFT & PROPORTIONATE)
         ───────────────────────────────────────────────────────────── */}
      <header className="relative z-20 px-4 sm:px-8 py-5 flex items-center justify-between max-w-7xl w-full mx-auto bg-transparent border-0 shadow-none">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-white/[0.08] hover:bg-white/[0.12] border border-white/20 flex items-center justify-center backdrop-blur-2xl shadow-[0_4px_16px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.4)] transition-all shrink-0">
            <Cpu className="w-5 h-5 text-cyan-400 drop-shadow-[0_0_8px_rgba(0,212,255,0.6)]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-extrabold text-white tracking-[0.16em] uppercase drop-shadow">
                SECURE OTA GUARDIAN
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-semibold bg-cyan-400/15 border border-cyan-400/30 text-cyan-300 backdrop-blur-md shadow-[0_0_10px_rgba(0,212,255,0.2)]">
                v1.0.0
              </span>
            </div>
            <p className="text-[10px] text-zinc-400/80 font-mono hidden sm:block">
              NXP FRDM-MCXN236 Embedded Platform
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-black/30 border border-white/15 text-emerald-400 text-xs font-mono backdrop-blur-2xl shadow-[0_4px_16px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.15)]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
            <span className="hidden sm:inline font-medium text-emerald-300">RESILIENCE ENGINE ACTIVE</span>
            <span className="sm:hidden">ACTIVE</span>
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          ULTRA-PREMIUM macOS LIQUID GLASS CARD
         ───────────────────────────────────────────────────────────── */}
      <main className="relative z-20 flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div 
          className="w-full max-w-[440px] transition-all duration-700 ease-out"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(16px)',
          }}
        >
          {/* Main Glass Container with macOS styling */}
          <div 
            ref={cardRef}
            onMouseMove={handleMouseMove}
            className="group relative rounded-3xl overflow-hidden p-8 sm:p-9 transition-all duration-300"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.03) 45%, rgba(6, 12, 24, 0.55) 100%)',
              backdropFilter: 'blur(36px) saturate(200%)',
              WebkitBackdropFilter: 'blur(36px) saturate(200%)',
              border: '1px solid rgba(255, 255, 255, 0.22)',
              boxShadow: `
                0 32px 64px -16px rgba(0, 0, 0, 0.85),
                0 0 0 1px rgba(255, 255, 255, 0.1) inset,
                0 1px 2px 0 rgba(255, 255, 255, 0.4) inset,
                0 -1px 2px 0 rgba(0, 0, 0, 0.6) inset,
                0 0 35px 2px rgba(0, 212, 255, 0.12)
              `
            }}
          >
            {/* Dynamic Spotlight Follow on Hover */}
            <div 
              className="absolute pointer-events-none -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"
              style={{
                background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, rgba(0, 212, 255, 0.18), transparent 70%)`
              }}
            />

            {/* macOS Window Controls (Traffic Lights) */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e] shadow-[0_0_6px_rgba(255,95,86,0.5)]" />
                <span className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123] shadow-[0_0_6px_rgba(255,189,46,0.4)]" />
                <span className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29] shadow-[0_0_6px_rgba(39,201,63,0.5)]" />
              </div>

              {/* CHANGE 2: "ZERO-TRUST GATE" -> "SECURE OTA GATE" */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-[10px] font-mono tracking-wider font-semibold backdrop-blur-xl shadow-[0_0_12px_rgba(0,212,255,0.15)]">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                SECURE OTA GATE
              </div>
            </div>

            {/* CHANGE 5: Title with Distinctive "GUARDIAN X" Custom Styling */}
            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2.5 font-mono drop-shadow-[0_2px_12px_rgba(255,255,255,0.2)] flex items-center gap-2.5">
                <span>GUARDIAN</span>
                <span className="relative inline-flex items-center justify-center px-2 py-0.5 rounded-lg text-2xl sm:text-3xl font-black font-sans tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-cyan-200 via-cyan-400 to-cyan-600 border border-cyan-400/40 bg-cyan-500/10 shadow-[0_0_14px_rgba(0,229,255,0.35)]">
                  X
                </span>
              </h1>
              <p className="text-[13px] text-zinc-300/90 leading-relaxed font-sans font-normal drop-shadow">
                Protect every firmware release. Auto-rollback bad deployments and prevent fleet-wide bricking.
              </p>
            </div>

            {/* Error Notification */}
            {errorMessage && (
              <div className="mb-6 p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/35 text-amber-200 text-xs flex items-start gap-2.5 backdrop-blur-xl animate-fade-in shadow-lg">
                <KeyRound className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                <p className="leading-snug">{errorMessage}</p>
              </div>
            )}

            {/* Authentication Action Buttons */}
            <div className="space-y-3.5">
              {/* Google Sign-In Button */}
              <button
                id="google-login-btn"
                onClick={handleGoogleSignIn}
                disabled={isSigningIn}
                className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-2xl bg-white hover:bg-zinc-100 text-zinc-900 font-semibold text-sm transition-all duration-200 shadow-[0_8px_24px_rgba(0,0,0,0.4),0_1px_2px_rgba(255,255,255,0.8)_inset] hover:shadow-[0_12px_32px_rgba(0,212,255,0.25)] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed group cursor-pointer"
              >
                {isSigningIn ? (
                  <div className="w-5 h-5 border-2 border-zinc-900/30 border-t-zinc-900 rounded-full animate-spin" />
                ) : (
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
                    <path d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                  </svg>
                )}
                <span className="tracking-tight">{isSigningIn ? 'Connecting to Google...' : 'Continue with Google'}</span>
              </button>

              {/* 1-Click Guest Access */}
              <button
                id="guest-login-btn"
                onClick={handleGuestAccess}
                className="w-full flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-2xl bg-white/[0.07] hover:bg-white/[0.14] border border-white/15 hover:border-cyan-400/40 text-zinc-200 hover:text-white font-mono text-xs font-semibold transition-all duration-200 backdrop-blur-2xl shadow-[0_4px_16px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.25)] hover:shadow-[0_8px_24px_rgba(0,212,255,0.2)] active:scale-[0.99] group cursor-pointer"
              >
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                <span>Enter as Guest Operator</span>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-cyan-400 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* CHANGE 3: "Supabase OAuth 2.0" -> "SECURE AUTHENTICATION" */}
            <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
              <span className="flex items-center gap-1.5 drop-shadow">
                <Lock className="w-3 h-3 text-cyan-400" />
                SECURE AUTHENTICATION
              </span>
              <span className="flex items-center gap-1.5 drop-shadow">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                TLS 1.3 Encrypted
              </span>
            </div>
          </div>

          {/* 3 Pillar Frosted Cards (CHANGE 4: "Device Twin" -> "LIVE DEVICE MONITOR") */}
          <div className="mt-5 grid grid-cols-3 gap-3">
            <div 
              className="p-3.5 rounded-2xl text-center transition-all duration-300 hover:scale-[1.03]"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
                backdropFilter: 'blur(24px) saturate(180%)',
                WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                boxShadow: '0 12px 28px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.25)'
              }}
            >
              <ShieldCheck className="w-4 h-4 text-cyan-400 mx-auto mb-1.5 drop-shadow-[0_0_6px_rgba(0,212,255,0.6)]" />
              <p className="text-[10px] font-mono text-zinc-300 leading-tight">Dual-Bank OTA</p>
            </div>

            <div 
              className="p-3.5 rounded-2xl text-center transition-all duration-300 hover:scale-[1.03]"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
                backdropFilter: 'blur(24px) saturate(180%)',
                WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                boxShadow: '0 12px 28px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.25)'
              }}
            >
              <Activity className="w-4 h-4 text-emerald-400 mx-auto mb-1.5 drop-shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
              <p className="text-[10px] font-mono text-zinc-300 leading-tight">LIVE DEVICE MONITOR</p>
            </div>

            <div 
              className="p-3.5 rounded-2xl text-center transition-all duration-300 hover:scale-[1.03]"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
                backdropFilter: 'blur(24px) saturate(180%)',
                WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                boxShadow: '0 12px 28px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.25)'
              }}
            >
              <RefreshCw className="w-4 h-4 text-amber-400 mx-auto mb-1.5 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]" />
              <p className="text-[10px] font-mono text-zinc-300 leading-tight">Auto-Rollback</p>
            </div>
          </div>
        </div>
      </main>

      {/* ─────────────────────────────────────────────────────────────
          macOS FROSTED FOOTER
         ───────────────────────────────────────────────────────────── */}
      <footer className="relative z-20 px-6 py-4 text-center text-[10px] font-mono text-zinc-400/80 border-t border-white/10 backdrop-blur-xl bg-black/20">
        SECURE OTA GUARDIAN &bull; Physical Demonstrator on NXP FRDM-MCXN236 &bull; Production Resilience Engine
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#03060a]" />}>
      <LoginContent />
    </Suspense>
  );
}
