'use client';

import { Pause as PauseIcon, PlayArrow as PlayIcon } from '@mui/icons-material';
// import dayjs from 'dayjs';
// import durationPlugin from 'dayjs/plugin/duration';
import { useEffect, useRef, useState } from 'react';
import { IconButton } from '@mui/material';
import WaveSurfer from 'wavesurfer.js';

const formatTime = (timeSec: number) => {
  const total = Math.max(0, Math.floor(timeSec));
  const mm = String(Math.floor(total / 60) % 60).padStart(2, '0');
  const ss = String(total % 60).padStart(2, '0');
  return `${mm}:${ss}`;
};

const formWaveSurferOptions = (ref: HTMLDivElement | null) => ({
  container: ref!,
  waveColor: '#756D71',
  progressColor: '#4F4A85',
  cursorColor: '#4F4A85',
  barWidth: 1,
  barRadius: 1,
  height: 28,
  barMinHeight: 2,
  autoCenter: true,
  hideScrollbar: true,
  normalize: true,
  partialRender: true,
  responsive: true,
});

type VoiceWaveformProps = {
  url: string;
  onPlayStateChange?: (playing: boolean) => void;
};

export default function VoiceWaveform({
  url,
  onPlayStateChange,
}: VoiceWaveformProps) {
  const waveformRef = useRef<HTMLDivElement | null>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [playing, setPlaying] = useState(false);
  const [timeLabel, setTimeLabel] = useState('00:00');
  const [totalLabel, setTotalLabel] = useState('00:00');

  useEffect(() => {
    if (!url || !waveformRef.current) return;

    // evita múltiplas instâncias
    if (wavesurferRef.current) {
      wavesurferRef.current.destroy();
      wavesurferRef.current = null;
    }
    waveformRef.current.innerHTML = '';

    const ws = WaveSurfer.create(formWaveSurferOptions(waveformRef.current));
    wavesurferRef.current = ws;

    ws.load(url);

    const onReady = () => {
      const dur = ws.getDuration();
      setTotalLabel(formatTime(dur));
      setTimeLabel('00:00');
    };

    const onProcess = () => {
      if (ws.isPlaying()) setTimeLabel(formatTime(ws.getCurrentTime()));
    };

    const onFinish = () => {
      setPlaying(false);
      onPlayStateChange?.(false);
      setTimeLabel(totalLabel);
    };

    ws.on('ready', onReady);
    ws.on('audioprocess', onProcess);
    ws.on('finish', onFinish);

    return () => {
      ws.un('ready', onReady);
      ws.un('audioprocess', onProcess);
      ws.un('finish', onFinish);
      ws.destroy();
      wavesurferRef.current = null;
    };
  }, [url, totalLabel, onPlayStateChange]);

  const handlePlayPause = () => {
    const ws = wavesurferRef.current;
    if (!ws) return;
    ws.playPause();
    const nowPlaying = ws.isPlaying();
    setPlaying(nowPlaying);
    onPlayStateChange?.(nowPlaying);
  };

  return (
    <>
      <IconButton
        onClick={handlePlayPause}
        size="small"
        title={playing ? 'Pausar' : 'Play'}
      >
        {playing ? <PauseIcon /> : <PlayIcon />}
      </IconButton>

      <div
        id="waveform-audio"
        ref={waveformRef}
        style={{ width: '100%', height: 28 }}
      />

      <div style={{ minWidth: 58, opacity: 0.85 }}>{timeLabel}</div>
    </>
  );
}
