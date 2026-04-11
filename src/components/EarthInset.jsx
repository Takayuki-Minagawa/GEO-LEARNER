import {
  getApparentSizeLabel,
  getCopy,
  getDistanceLabel,
  getPhaseLabel,
} from '../lib/i18n.js';

export default function EarthInset({ simulationState, locale }) {
  const copy = getCopy(locale);
  const phaseLabel = getPhaseLabel(simulationState.earthPhase, locale);
  const distanceLabel = getDistanceLabel(simulationState.distanceAu, locale);
  const apparentSizeLabel = getApparentSizeLabel(simulationState.apparentSizeArcseconds);
  const phaseShift = (0.5 - simulationState.earthPhase.illuminatedFraction) * 110;
  const shadowDirection = simulationState.earthPhase.waxing ? 1 : -1;

  return (
    <div className="earth-inset">
      <div className="earth-inset__header">
        <div>
          <strong>{copy.earthInset}</strong>
          <span>{phaseLabel}</span>
        </div>
        <div className="earth-inset__meta">
          <span>{distanceLabel}</span>
          <span>{apparentSizeLabel}</span>
        </div>
      </div>

      <div className="earth-disc">
        <div className="earth-disc__ocean" />
        <div className="earth-disc__clouds" />
        <div
          className="earth-disc__shadow"
          style={{
            transform: `translateX(${phaseShift * shadowDirection}px)`,
            opacity: Math.min(0.96, 0.35 + (1 - simulationState.earthPhase.illuminatedFraction)),
          }}
        />
      </div>
    </div>
  );
}
