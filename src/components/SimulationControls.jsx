import { SPEED_OPTIONS, TIMELINE_MAX_DAYS } from '../data/celestialBodies.js';

function formatElapsed(day) {
  const years = day / 365.25;
  return `${day.toFixed(0)} day / ${years.toFixed(1)} year`;
}

export default function SimulationControls({
  day,
  isPlaying,
  speed,
  onTogglePlay,
  onSpeedChange,
  onDayChange,
}) {
  return (
    <section className="panel controls-panel">
      <div className="panel-kicker">TIME CONTROL</div>
      <div className="controls-row">
        <button type="button" className="pill-button" onClick={onTogglePlay}>
          {isPlaying ? '停止' : '再生'}
        </button>

        <div className="speed-toggle">
          {SPEED_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`speed-chip${speed === option.value ? ' is-active' : ''}`}
              onClick={() => onSpeedChange(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <label className="timeline-field">
        <span>Simulation Day</span>
        <input
          type="range"
          min="0"
          max={TIMELINE_MAX_DAYS}
          step="1"
          value={day}
          onChange={(event) => onDayChange(Number(event.target.value))}
        />
      </label>

      <div className="timeline-meta">{formatElapsed(day)}</div>
    </section>
  );
}
