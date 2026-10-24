import { useId } from 'react';
import {
  getApparentSizeLabel,
  getCopy,
  getDistanceLabel,
  getElongationLabel,
  getPhaseLabel,
} from '../lib/i18n.js';

const RADIUS = 46;
const GAUGE_RADIUS = 56;
const GAUGE_CIRCUMFERENCE = 2 * Math.PI * GAUGE_RADIUS;

// True when, from the observer's point of view (ecliptic north up), the Sun lies to the right of Earth.
function isSunOnRight(viewerPosition, earthPosition) {
  const forward = [earthPosition[0] - viewerPosition[0], earthPosition[2] - viewerPosition[2]];
  const toSun = [-viewerPosition[0], -viewerPosition[2]];
  return -forward[1] * toSun[0] + forward[0] * toSun[1] > 0;
}

// Lit region for a Sun on the right: the right half-disc plus (gibbous) or minus (crescent) a terminator ellipse.
function getLitPath(illuminatedFraction) {
  const terminatorRadius = Math.abs(2 * illuminatedFraction - 1) * RADIUS;
  const sweep = illuminatedFraction >= 0.5 ? 1 : 0;
  return `M0 ${-RADIUS} A${RADIUS} ${RADIUS} 0 0 1 0 ${RADIUS} A${terminatorRadius} ${RADIUS} 0 0 ${sweep} 0 ${-RADIUS}Z`;
}

function EarthArt({ idPrefix, night = false }) {
  return (
    <g className={night ? 'earth-art earth-art--night' : 'earth-art'}>
      <circle r={RADIUS} fill={night ? '#0b1729' : `url(#${idPrefix}-ocean)`} />
      <g className="earth-art__land" fill={night ? '#13233a' : '#7fd39a'}>
        <path d="M-30 -20C-22 -32-6-30-2-20C2-10-8-4-14 2C-20 8-28 4-32-4C-36-10-34-14-30-20Z" />
        <path d="M6 4C14-2 26 2 28 12C30 22 20 30 12 28C4 26 0 14 6 4Z" />
        <path d="M10-36C18-40 30-34 32-26C28-22 18-24 12-28C8-30 6-34 10-36Z" />
        <path d="M-18 18C-10 16-4 24-8 32C-12 38-22 36-24 28C-26 22-24 19-18 18Z" />
      </g>
      {night ? (
        <g fill="#ffd98a" opacity="0.55">
          <circle cx="-20" cy="-14" r="0.9" />
          <circle cx="-12" cy="-6" r="0.8" />
          <circle cx="16" cy="10" r="0.9" />
          <circle cx="20" cy="18" r="0.7" />
          <circle cx="-14" cy="26" r="0.8" />
        </g>
      ) : (
        <g className="earth-art__clouds" fill="none" stroke="#ffffff" strokeLinecap="round" opacity="0.8">
          <path d="M-40-6C-30-10-18-8-8-12" strokeWidth="3.2" />
          <path d="M2-18C12-22 24-18 36-20" strokeWidth="2.6" />
          <path d="M-34 14C-24 10-10 14 0 10" strokeWidth="2.4" />
          <path d="M8 34C16 30 26 32 34 26" strokeWidth="2.8" />
        </g>
      )}
    </g>
  );
}

export default function EarthInset({ simulationState, locale }) {
  const copy = getCopy(locale);
  const idPrefix = useId().replace(/:/g, '');
  const { earthPhase } = simulationState;
  const phaseName = locale === 'ja' ? earthPhase.japanese : earthPhase.english;
  const sunOnRight = isSunOnRight(simulationState.viewerPosition, simulationState.earthPosition);
  const sunSide = sunOnRight ? 1 : -1;
  const litPath = getLitPath(earthPhase.illuminatedFraction);

  const metrics = [
    {
      key: 'illumination',
      label: copy.illumination,
      value: `${earthPhase.illuminatedPercent}%`,
      note: earthPhase.waxing ? copy.phaseWaxing : copy.phaseWaning,
    },
    { key: 'distance', label: copy.distance, value: getDistanceLabel(simulationState.distanceAu, locale) },
    { key: 'size', label: copy.apparentSize, value: getApparentSizeLabel(simulationState.apparentSizeArcseconds) },
    { key: 'elongation', label: copy.elongation, value: getElongationLabel(simulationState.solarElongationDegrees) },
  ];

  return (
    <div className="earth-inset">
      <div className="earth-inset__header">
        <span className="earth-inset__title">{copy.earthInset}</span>
        <span className="earth-inset__phase">{phaseName}</span>
      </div>

      <div className="earth-stage">
        <svg
          className="earth-svg"
          viewBox="-90 -64 180 128"
          role="img"
          aria-label={`${copy.earthInset}: ${getPhaseLabel(earthPhase, locale)}`}
        >
          <defs>
            <radialGradient id={`${idPrefix}-ocean`} cx="35%" cy="32%" r="80%">
              <stop offset="0%" stopColor="#7ce0ff" />
              <stop offset="45%" stopColor="#2a74cc" />
              <stop offset="100%" stopColor="#123d80" />
            </radialGradient>
            <radialGradient id={`${idPrefix}-glow`} r="50%">
              <stop offset="70%" stopColor="#6cc6ff" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#6cc6ff" stopOpacity="0" />
            </radialGradient>
            <clipPath id={`${idPrefix}-lit`}>
              <path d={litPath} transform={`scale(${sunSide} 1)`} />
            </clipPath>
            <filter id={`${idPrefix}-soft`} x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation="0.9" />
            </filter>
          </defs>

          <circle
            r={GAUGE_RADIUS}
            className="earth-gauge__track"
          />
          <circle
            r={GAUGE_RADIUS}
            className="earth-gauge__value"
            strokeDasharray={GAUGE_CIRCUMFERENCE}
            strokeDashoffset={GAUGE_CIRCUMFERENCE * (1 - earthPhase.illuminatedFraction)}
            transform="rotate(-90)"
          />

          <circle r={RADIUS + 9} fill={`url(#${idPrefix}-glow)`} opacity={0.4 + earthPhase.illuminatedFraction * 0.6} />
          <EarthArt idPrefix={idPrefix} night />
          <g clipPath={`url(#${idPrefix}-lit)`} filter={`url(#${idPrefix}-soft)`}>
            <EarthArt idPrefix={idPrefix} />
          </g>

          <g className="earth-sun-cue" transform={`translate(${sunSide * 76} 0)`}>
            <circle r="7" className="earth-sun-cue__core" />
            {Array.from({ length: 8 }, (_, index) => {
              const angle = (index / 8) * Math.PI * 2;
              return (
                <line
                  key={index}
                  x1={Math.cos(angle) * 10}
                  y1={Math.sin(angle) * 10}
                  x2={Math.cos(angle) * 13}
                  y2={Math.sin(angle) * 13}
                />
              );
            })}
            <text y="26" textAnchor="middle">
              {copy.celestial.sun}
            </text>
          </g>
        </svg>
      </div>

      <dl className="metric-grid">
        {metrics.map((metric) => (
          <div key={metric.key} className={`metric metric--${metric.key}`}>
            <dt>{metric.label}</dt>
            <dd>
              {metric.value}
              {metric.note && <small>{metric.note}</small>}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
