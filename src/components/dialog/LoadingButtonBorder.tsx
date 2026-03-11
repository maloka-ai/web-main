import * as React from 'react';
import { Box, Button, type ButtonProps } from '@mui/material';

type LoadingBorderButtonProps = ButtonProps & {
  loading?: boolean;
  duration?: number;
  loadingLabel?: React.ReactNode;
  borderWidth?: number;
  progressColor?: string;
  trackColor?: string;
  isComplete?: boolean;
};

export function LoadingBorderButton({
  children,
  loading = false,
  duration = 2000,
  borderWidth = 3,
  progressColor = '#1976d2',
  trackColor = 'rgba(25, 118, 210, 0.2)',
  isComplete = false,
  disabled,
  sx,
  ...props
}: LoadingBorderButtonProps) {
  const buttonRef = React.useRef<HTMLButtonElement | null>(null);
  const [size, setSize] = React.useState({ width: 0, height: 0 });

  // 100 = vazio, 0 = completo
  const [progress, setProgress] = React.useState(100);
  const [transitionMs, setTransitionMs] = React.useState(0);
  const startedRef = React.useRef(false);
  const completedRef = React.useRef(false);

  React.useLayoutEffect(() => {
    if (!buttonRef.current) return;

    const updateSize = () => {
      const rect = buttonRef.current!.getBoundingClientRect();
      setSize({
        width: rect.width,
        height: rect.height,
      });
    };

    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(buttonRef.current);

    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    const active = loading || isComplete;

    if (!active) {
      startedRef.current = false;
      completedRef.current = false;
      setTransitionMs(0);
      setProgress(100);
      return;
    }

    if (loading && !startedRef.current) {
      startedRef.current = true;
      completedRef.current = false;

      setTransitionMs(0);
      setProgress(100);

      const raf = requestAnimationFrame(() => {
        setTransitionMs(duration);
        setProgress(5); // para em 95%
      });

      return () => cancelAnimationFrame(raf);
    }

    if (isComplete && !completedRef.current) {
      completedRef.current = true;

      const remainingFraction = progress / 100;
      const completeDuration = Math.max(
        120,
        duration * remainingFraction * 0.35,
      );

      const raf = requestAnimationFrame(() => {
        setTransitionMs(completeDuration);
        setProgress(0);
      });

      return () => cancelAnimationFrame(raf);
    }
  }, [loading, isComplete, duration, progress]);

  const width = size.width + borderWidth * 2 - 1;
  const height = size.height + borderWidth * 2;
  const radius = 6;

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'inline-flex',
        overflow: 'visible',
      }}
    >
      {size.width > 0 && size.height > 0 && (loading || isComplete) && (
        <Box
          component="svg"
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          sx={{
            position: 'absolute',
            top: -borderWidth,
            left: -borderWidth + 2,
            pointerEvents: 'none',
            overflow: 'visible',
            zIndex: 3,
          }}
        >
          <rect
            x={borderWidth / 2}
            y={borderWidth / 2}
            width={width - borderWidth}
            height={height - borderWidth}
            rx={radius}
            ry={radius}
            fill="none"
            stroke={trackColor}
            strokeWidth={borderWidth}
          />

          <rect
            x={borderWidth / 2}
            y={borderWidth / 2}
            width={width - borderWidth}
            height={height - borderWidth}
            rx={radius}
            ry={radius}
            fill="none"
            stroke={progressColor}
            strokeWidth={borderWidth}
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray={100}
            strokeDashoffset={progress}
            style={{
              transition: `stroke-dashoffset ${transitionMs}ms linear`,
            }}
          />
        </Box>
      )}

      <Button
        {...props}
        ref={buttonRef}
        disabled={disabled || loading || isComplete}
        sx={{
          position: 'relative',
          zIndex: 2,
          borderRadius: '6px',
          ...sx,
        }}
      >
        {children}
      </Button>
    </Box>
  );
}
