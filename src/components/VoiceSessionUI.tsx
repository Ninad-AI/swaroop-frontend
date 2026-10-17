'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Ripple from '@/components/ui/ripple';

export type SessionStatus = 'connecting' | 'listening' | 'speaking';

const STATUS_STYLES: Record<SessionStatus, { label: string; dot: string }> = {
    connecting: { label: 'Connecting', dot: 'bg-yellow-400' },
    listening: { label: 'Listening', dot: 'bg-red-500' },
    speaking: { label: 'Speaking', dot: 'bg-green-400' },
};

interface VoiceSessionUIProps {
    status: SessionStatus;
    timeLeft: number;
    totalTime: number;
    onEndCall: () => void;
    creatorName: string;
    creatorImage: string;
}

export default function VoiceSessionUI({
    status,
    timeLeft,
    totalTime,
    onEndCall,
    creatorName,
    creatorImage,
}: VoiceSessionUIProps) {
    // Timer ring dimensions — shrink on small/short (e.g. landscape phone) screens
    const [IMG_SIZE, setImgSize] = useState(216);   // image diameter px
    useEffect(() => {
        const fit = () => {
            // leave room below the circle for the timer, and side padding
            const byHeight = window.innerHeight - 250;
            const byWidth = window.innerWidth - 104;
            setImgSize(Math.round(Math.max(120, Math.min(216, byHeight, byWidth))));
        };
        fit();
        window.addEventListener('resize', fit);
        return () => window.removeEventListener('resize', fit);
    }, []);
    const RING_SIZE = IMG_SIZE + 64;   // container px
    const compact = IMG_SIZE < 180;
    const cx = RING_SIZE / 2;
    const cy = RING_SIZE / 2;
    const radius = IMG_SIZE / 2 + 10;  // small gap between image edge and ring
    const circumference = 2 * Math.PI * radius;
    const progress = totalTime > 0 ? timeLeft / totalTime : 0;
    const dashOffset = circumference * (1 - progress);
    const isSpeaking = status === 'speaking';
    const statusStyle = STATUS_STYLES[status];

    const formatTime = (s: number) => {
        const t = Math.max(0, s);
        const m = Math.floor(t / 60);
        const sec = t % 60;
        return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    };

    return (
        <Ripple
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            color="rgba(255, 255, 255, 0.15)"
            mainCircleSize={IMG_SIZE}
            numCircles={8}
        >


            {/* Close button */}
            <div className="fixed right-4 top-4 z-100 sm:right-8 sm:top-8">
                <button
                    onClick={onEndCall}
                    title="End Session"
                    className="group p-2 transition-all"
                >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/40 shadow-xl backdrop-blur-md transition-all group-hover:border-red-500/60 group-hover:bg-red-500/40 sm:h-12 sm:w-12">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-white/70 transition-all duration-300 group-hover:rotate-90 group-hover:text-white sm:h-6 sm:w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                </button>
            </div>

            {/* Main layout — image stays at true viewport center so ripples align */}
            <div className="relative flex h-full w-full items-center justify-center">
                <div
                    className="relative flex items-center justify-center"
                    style={{ width: RING_SIZE, height: RING_SIZE }}
                >
                    {/* Progress ring SVG */}
                    <svg
                        className="absolute inset-0 -rotate-90 overflow-visible"
                        width={RING_SIZE}
                        height={RING_SIZE}
                    >
                        <circle
                            cx={cx}
                            cy={cy}
                            r={radius}
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth="3"
                            fill="transparent"
                        />
                        <circle
                            cx={cx}
                            cy={cy}
                            r={radius}
                            stroke="rgba(255,255,255,0.85)"
                            strokeWidth="3"
                            fill="transparent"
                            strokeDasharray={circumference}
                            strokeDashoffset={dashOffset}
                            strokeLinecap="round"
                            className="transition-[stroke-dashoffset] duration-1000 ease-linear"
                        />
                    </svg>

                    {/* Influencer image */}
                    <div
                        className="relative overflow-hidden rounded-full border-2 border-white/10 bg-slate-900 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
                        style={{ width: IMG_SIZE, height: IMG_SIZE }}
                    >
                        <Image
                            src={creatorImage}
                            alt={creatorName}
                            fill
                            sizes={`${IMG_SIZE}px`}
                            className="object-cover"
                            priority
                        />
                        {/* Speaking overlay */}
                        <div
                            className={`absolute inset-0 bg-rose-500/20 transition-opacity duration-700 ${isSpeaking ? 'opacity-30' : 'opacity-0'}`}
                        />
                    </div>

                    {/* Controls - absolutely below the circle, so they don't shift the image */}
                    <div
                        className={`absolute left-1/2 top-1/2 flex flex-col items-center ${compact ? 'gap-3' : 'gap-5'}`}
                        style={{ transform: `translate(-50%, ${IMG_SIZE / 2 + (compact ? 30 : 47)}px)` }}
                    >
                        {/* Status */}
                        <span
                            role="status"
                            aria-live="polite"
                            className="flex items-center gap-2.5 whitespace-nowrap text-[11px] font-medium uppercase tracking-[0.3em] text-white/70"
                        >
                            <span className="relative flex h-2 w-2">
                                <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${statusStyle.dot}`} />
                                <span className={`relative inline-flex h-2 w-2 rounded-full ${statusStyle.dot}`} />
                            </span>
                            {statusStyle.label}
                        </span>

                        {/* Timer */}
                        <span className={`tabular-nums font-extralight tracking-tight text-white/95 drop-shadow-[0_0_20px_rgba(255,255,255,0.2)] ${compact ? 'text-4xl' : 'text-5xl sm:text-6xl'}`}>
                            {formatTime(timeLeft)}
                        </span>
                    </div>
                </div>
            </div>
        </Ripple>
    );
}
