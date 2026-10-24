import { SPEED_OPTIONS, TIMELINE_MAX_DAYS } from '../data/celestialBodies.js';
import { getCopy, getElapsedLabel } from '../lib/i18n.js';
import Icon from './Icons.jsx';

const DAYS_PER_YEAR = 365.25;
const YEAR_TICKS = Array.from({ length: Math.floor(TIMELINE_MAX_DAYS / DAYS_PER_YEAR) }, (_, index) => index + 1);

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
  const progress = (day / TIMELINE_MAX_DAYS) * 100;
  const years = day / DAYS_PER_YEAR;

  return (
    <section className="panel controls-panel" aria-label={copy.controlsKicker}>
      <button
        type="button"
        className={`play-button${isPlaying ? ' is-playing' : ''}`}
        onClick={onTogglePlay}
        aria-label={isPlaying ? copy.pause : copy.play}
        title={copy.shortcutHint}
      >
        <Icon name={isPlaying ? 'pause' : 'play'} size={22} />
      </button>

      <div className="timeline">
        <div className="timeline__readout">
          <span className="timeline__label">{copy.simulationDay}</span>
          <span className="timeline__value" aria-hidden="true">
            <strong>{years.toFixed(1)}</strong>
            <small>{copy.yearUnit}</small>
            <span className="timeline__days">
              {day.toFixed(0)} {copy.dayUnit}
            </span>
          </span>
        </div>

        <div className="timeline__track" style={{ '--progress': `${progress}%` }}>
          <input
            type="range"
            min="0"
            max={TIMELINE_MAX_DAYS}
            step="1"
            value={Math.round(day)}
            onChange={(event) => onDayChange(Number(event.target.value))}
            aria-label={copy.simulationDay}
            aria-valuetext={getElapsedLabel(day, locale)}
          />
          <div className="timeline__ticks" aria-hidden="true">
            {YEAR_TICKS.map((year) => (
              <span key={year} style={{ left: `${((year * DAYS_PER_YEAR) / TIMELINE_MAX_DAYS) * 100}%` }}>
                {year}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="speed-control">
        <span className="speed-control__label">{copy.playbackSpeed}</span>
        <div className="segmented segmented--compact" role="group" aria-label={copy.playbackSpeed}>
          {SPEED_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className="segmented__item"
              onClick={() => onSpeedChange(option.value)}
              aria-pressed={speed === option.value}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
