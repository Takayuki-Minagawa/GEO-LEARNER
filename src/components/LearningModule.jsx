import {
  getBodyName,
  getCopy,
  getRelationshipLabel,
  getSystemInputPayload,
} from '../lib/i18n.js';
import EarthInset from './EarthInset.jsx';

function pointOnCircle(radius, angle, center = 110) {
  return {
    x: center + radius * Math.cos(angle),
    y: center + radius * Math.sin(angle),
  };
}

function OrbitDiagram({ simulationState, locale }) {
  const copy = getCopy(locale);
  const earthOrbitRadius = 58;
  const viewerOrbitRadius =
    simulationState.category === 'outer'
      ? 88
      : simulationState.category === 'inner'
        ? 34
        : 58;
  const earthPoint = pointOnCircle(earthOrbitRadius, simulationState.earthOrbitalAngle);
  const viewerPoint =
    simulationState.category === 'satellite'
      ? { x: earthPoint.x + 14, y: earthPoint.y - 12 }
      : pointOnCircle(viewerOrbitRadius, simulationState.viewpointOrbitalAngle);

  return (
    <div className="orbit-card">
      <div className="orbit-card__header">
        <strong>{copy.orbitRelationship}</strong>
        <span>{getRelationshipLabel(simulationState.category, locale)}</span>
      </div>
      <svg viewBox="0 0 220 220" role="img" aria-label={copy.orbitRelationship}>
        <circle cx="110" cy="110" r="10" className="orbit-sun" />
        <circle cx="110" cy="110" r={earthOrbitRadius} className="orbit-ring" />
        {simulationState.category !== 'satellite' && (
          <circle cx="110" cy="110" r={viewerOrbitRadius} className="orbit-ring orbit-ring--secondary" />
        )}
        <line x1="110" y1="110" x2={earthPoint.x} y2={earthPoint.y} className="orbit-link" />
        <line x1="110" y1="110" x2={viewerPoint.x} y2={viewerPoint.y} className="orbit-link orbit-link--secondary" />
        <line x1={viewerPoint.x} y1={viewerPoint.y} x2={earthPoint.x} y2={earthPoint.y} className="orbit-sightline" />
        <circle cx={earthPoint.x} cy={earthPoint.y} r="8" className="orbit-earth" />
        <circle cx={viewerPoint.x} cy={viewerPoint.y} r="7" className="orbit-viewpoint" />
        <text x="110" y="86" textAnchor="middle" className="orbit-label">
          {copy.celestial.sun}
        </text>
        <text x={earthPoint.x} y={earthPoint.y - 13} textAnchor="middle" className="orbit-label">
          {copy.celestial.earth}
        </text>
        <text x={viewerPoint.x} y={viewerPoint.y - 13} textAnchor="middle" className="orbit-label">
          {getBodyName(simulationState.viewpoint, locale)}
        </text>
      </svg>
    </div>
  );
}

function renderEmphasisText(text) {
  return text
    .split(/(\*\*.*?\*\*)/g)
    .filter(Boolean)
    .map((part, index) =>
      part.startsWith('**') && part.endsWith('**') ? (
        <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>
      ) : (
        part
      ),
    );
}

export default function LearningModule({
  simulationState,
  tutorContent,
  quizSession,
  locale,
  onRequestQuiz,
  onAnswerQuiz,
}) {
  const copy = getCopy(locale);
  const systemInput = getSystemInputPayload(simulationState, locale);

  return (
    <section className="panel learning-panel">
      <div className="panel-kicker">{copy.learningKicker}</div>
      <h2>{copy.tutorTitle}</h2>

      <EarthInset simulationState={simulationState} locale={locale} />

      <div className="system-state">
        <div className="system-state__title">{copy.systemInput}</div>
        <pre>{JSON.stringify(systemInput, null, 2)}</pre>
      </div>

      <article className="lesson-card">
        <h3>{tutorContent.title}</h3>
        <p className="lesson-summary">{renderEmphasisText(tutorContent.summary)}</p>

        <div className="lesson-facts">
          {tutorContent.facts.map((fact) => (
            <div key={fact.label} className="lesson-fact">
              <div className="lesson-fact__icon">{fact.icon}</div>
              <div>
                <strong>{fact.label}</strong>
                <p>{renderEmphasisText(fact.text)}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="lesson-prompt">
          <span>{copy.nextObservation}</span>
          <p>{tutorContent.prompt}</p>
        </div>
      </article>

      <OrbitDiagram simulationState={simulationState} locale={locale} />

      <section className="quiz-card">
        <div className="quiz-card__header">
          <strong>{copy.quizTitle}</strong>
          <button type="button" className="pill-button pill-button--secondary" onClick={onRequestQuiz}>
            {copy.requestQuiz}
          </button>
        </div>

        {quizSession ? (
          <div className="quiz-body">
            <p className="quiz-question">{quizSession.prompt}</p>
            <div className="quiz-options">
              {quizSession.options.map((option, index) => {
                const answered = quizSession.selectedIndex !== null;
                const isSelected = quizSession.selectedIndex === index;
                const isCorrect = quizSession.correctIndex === index;

                return (
                  <button
                    key={option}
                    type="button"
                    className={`quiz-option${isSelected ? ' is-selected' : ''}${answered && isCorrect ? ' is-correct' : ''}`}
                    onClick={() => onAnswerQuiz(index)}
                    disabled={answered}
                  >
                    {index + 1}. {option}
                  </button>
                );
              })}
            </div>

            {quizSession.selectedIndex !== null && (
              <div className="quiz-feedback">
                <strong>
                  {quizSession.selectedIndex === quizSession.correctIndex ? copy.correct : copy.retry}
                </strong>
                <p>{renderEmphasisText(quizSession.explanation)}</p>
              </div>
            )}
          </div>
        ) : (
          <p className="quiz-placeholder">{copy.quizPlaceholder}</p>
        )}
      </section>
    </section>
  );
}
