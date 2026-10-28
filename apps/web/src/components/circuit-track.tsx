import { CIRCUIT_TRACKS, TRACK_VIEWBOX_SIZE } from '@/lib/circuit-tracks';

interface CircuitTrackProps {
  circuitId: string;
  className?: string;
}

/** Draws the outline of a circuit with the current text colour; renders nothing if there is no track for the id. */
export function CircuitTrack({ circuitId, className }: CircuitTrackProps) {
  const path = CIRCUIT_TRACKS[circuitId];
  if (!path) return null;

  return (
    <svg
      viewBox={`0 0 ${TRACK_VIEWBOX_SIZE} ${TRACK_VIEWBOX_SIZE}`}
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={12}
      strokeLinejoin="round"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  );
}
