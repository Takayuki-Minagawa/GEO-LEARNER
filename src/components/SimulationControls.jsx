import { SPEED_OPTIONS, TIMELINE_MAX_DAYS } from '../data/celestialBodies.js';
import { getCopy, getElapsedLabel } from '../lib/i18n.js';

export default function SimulationControls({
  day,
  isPlaying,
  speed,
  locale,
  onTogglePlay,
  onSpeedChange,
  onDayChange,
}) {
  const copy = getCopy(locale);

  return (
    <section className="panel controls-panel">
      <div className="panel-kicker">{copy.controlsKicker}</div>
      <div className="controls-row">
        <button type="button" className="pill-button" onClick={onTogglePlay}>
          {isPlaying ? copy.pause : copy.play}
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
        <span>{copy.simulationDay}</span>
        <input
          type="range"
          min="0"
          max={TIMELINE_MAX_DAYS}
          step="1"
          value={day}
          onChange={(event) => onDayChange(Number(event.target.value))}
        />
      </label>

      <div className="timeline-meta">{getElapsedLabel(day, locale)}</div>
    </section>
  );
}
