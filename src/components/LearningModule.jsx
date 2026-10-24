import {
  getBodyName,
  getCopy,
  getElongationLabel,
  getRelationshipLabel,
  getSystemInputPayload,
} from '../lib/i18n.js';
import EarthInset from './EarthInset.jsx';
import Icon from './Icons.jsx';

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

function pointOnCircle(radius, angle, center = 110) {
  return {
    x: center + radius * Math.cos(angle),
    y: center + radius * Math.sin(angle),
  };
}

function ElongationArc({ viewerPoint, earthPoint, degrees, label }) {
  const radius = 22;
  const toSun = Math.atan2(110 - viewerPoint.y, 110 - viewerPoint.x);
  const toEarth = Math.atan2(earthPoint.y - viewerPoint.y, earthPoint.x - viewerPoint.x);
  let delta = toEarth - toSun;
  while (delta > Math.PI) delta -= Math.PI * 2;
  while (delta <= -Math.PI) delta += Math.PI * 2;

  const start = pointOnCircle(radius, toSun, 0);
  const end = pointOnCircle(radius, toSun + delta, 0);
  const middle = pointOnCircle(radius + 14, toSun + delta / 2, 0);

  return (
    <g className="orbit-elongation" transform={`translate(${viewerPoint.x} ${viewerPoint.y})`}>
      <path
        d={`M0 0L${start.x} ${start.y}A${radius} ${radius} 0 0 ${delta > 0 ? 1 : 0} ${end.x} ${end.y}Z`}
        className="orbit-elongation__wedge"
      />
      <text x={middle.x} y={middle.y + 3} textAnchor="middle" className="orbit-elongation__label">
        {label} {getElongationLabel(degrees)}
      </text>
    </g>
  );
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
    <div className="card orbit-card">
      <div className="card__header">
        <h3 className="card__title">{copy.orbitRelationship}</h3>
        <span className={`relation-badge relation-badge--${simulationState.category}`}>
          {getRelationshipLabel(simulationState.category, locale)}
        </span>
      </div>
      <svg viewBox="0 0 220 220" role="img" aria-label={`${copy.orbitRelationship}: ${getRelationshipLabel(simulationState.category, locale)}`}>
        <circle cx="110" cy="110" r="18" className="orbit-sun-glow" />
        <circle cx="110" cy="110" r="10" className="orbit-sun" />
        <circle cx="110" cy="110" r={earthOrbitRadius} className="orbit-ring" />
        {simulationState.category !== 'satellite' && (
          <circle cx="110" cy="110" r={viewerOrbitRadius} className="orbit-ring orbit-ring--secondary" />
        )}
        <line x1="110" y1="110" x2={earthPoint.x} y2={earthPoint.y} className="orbit-link" />
        <line x1="110" y1="110" x2={viewerPoint.x} y2={viewerPoint.y} className="orbit-link orbit-link--secondary" />
        {simulationState.category !== 'satellite' && (
          <ElongationArc
            viewerPoint={viewerPoint}
            earthPoint={earthPoint}
            degrees={simulationState.solarElongationDegrees}
            label={copy.elongationArc}
          />
        )}
        <line x1={viewerPoint.x} y1={viewerPoint.y} x2={earthPoint.x} y2={earthPoint.y} className="orbit-sightline" />
        <circle cx={earthPoint.x} cy={earthPoint.y} r="12" className="orbit-earth-pulse" />
        <circle cx={earthPoint.x} cy={earthPoint.y} r="7" className="orbit-earth" />
        <circle cx={viewerPoint.x} cy={viewerPoint.y} r="6.5" className="orbit-viewpoint" />
        <text x="110" y="84" textAnchor="middle" className="orbit-label">
          {copy.celestial.sun}
        </text>
        <text x={earthPoint.x} y={earthPoint.y - 13} textAnchor="middle" className="orbit-label orbit-label--earth">
          {copy.celestial.earth}
        </text>
        <text x={viewerPoint.x} y={viewerPoint.y - 12} textAnchor="middle" className="orbit-label orbit-label--viewer">
          {getBodyName(simulationState.viewpoint, locale)}
        </text>
      </svg>
      <p className="card__footnote">
        {locale === 'ja'
          ? '点線は観測者から地球への視線。距離は縮尺どおりではない模式図です。'
          : 'The dashed line is the sightline to Earth. Distances are schematic, not to scale.'}
      </p>
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

function Celebration() {
  return (
    <div className="celebration" aria-hidden="true">
      {Array.from({ length: 12 }, (_, index) => (
        <span key={index} style={{ '--i': index }} />
      ))}
    </div>
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
  const answered = quizSession ? quizSession.selectedIndex !== null : false;
  const isCorrect = answered && quizSession.selectedIndex === quizSession.correctIndex;

  return (
    <section className="panel learning-panel" aria-labelledby="learning-title">
      <div className="panel-heading">
        <div className="panel-kicker">{copy.learningKicker}</div>
        <h2 id="learning-title" className="panel-title">
          {copy.tutorTitle}
        </h2>
      </div>

      <EarthInset simulationState={simulationState} locale={locale} />

      <article className="card lesson-card">
        <h3 className="lesson-card__title">{tutorContent.title}</h3>
        <p className="lesson-summary">{renderEmphasisText(tutorContent.summary)}</p>

        <ul className="lesson-facts">
          {tutorContent.facts.map((fact) => (
            <li key={fact.label} className="lesson-fact">
              <span className="lesson-fact__icon" aria-hidden="true">
                {fact.icon}
              </span>
              <div>
                <strong>{fact.label}</strong>
                <p>{renderEmphasisText(fact.text)}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="lesson-prompt">
          <span className="lesson-prompt__label">
            <Icon name="sparkle" size={14} /> {copy.nextObservation}
          </span>
          <p>{tutorContent.prompt}</p>
        </div>
      </article>

      <OrbitDiagram simulationState={simulationState} locale={locale} />

      <section className={`card quiz-card${isCorrect ? ' is-correct' : ''}`} aria-labelledby="quiz-title">
        {isCorrect && <Celebration />}
        <div className="card__header">
          <h3 id="quiz-title" className="card__title">
            {copy.quizTitle}
          </h3>
          {(!quizSession || isCorrect) && (
            <button type="button" className="pill-button pill-button--accent" onClick={onRequestQuiz}>
              {copy.requestQuiz}
            </button>
          )}
        </div>

        {quizSession ? (
          <div className="quiz-body">
            <p className="quiz-question">{quizSession.prompt}</p>
            <div className="quiz-options">
              {quizSession.options.map((option, index) => {
                const isSelected = quizSession.selectedIndex === index;
                const isAnswer = quizSession.correctIndex === index;
                const stateClass = answered
                  ? isAnswer
                    ? ' is-correct'
                    : isSelected
                      ? ' is-wrong'
                      : ' is-muted'
                  : '';

                return (
                  <button
                    key={option}
                    type="button"
                    className={`quiz-option${stateClass}`}
                    onClick={() => onAnswerQuiz(index)}
                    disabled={answered}
                  >
                    <span className="quiz-option__letter" aria-hidden="true">
                      {answered && isAnswer ? (
                        <Icon name="check" size={14} />
                      ) : answered && isSelected ? (
                        <Icon name="cross" size={14} />
                      ) : (
                        OPTION_LETTERS[index]
                      )}
                    </span>
                    <span className="quiz-option__text">{option}</span>
                    {answered && (isAnswer || isSelected) && (
                      <span className="visually-hidden">
                        {isAnswer ? copy.answerCorrectLabel : copy.answerWrongLabel}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div aria-live="polite">
              {answered && (
                <div className={`quiz-feedback${isCorrect ? '' : ' is-wrong'}`}>
                  <strong>{isCorrect ? copy.correct : copy.retry}</strong>
                  <p>{renderEmphasisText(quizSession.explanation)}</p>
                  {!isCorrect && (
                    <button type="button" className="pill-button pill-button--ghost" onClick={onRequestQuiz}>
                      <Icon name="retry" size={15} /> {copy.tryAgain}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="quiz-placeholder">{copy.quizPlaceholder}</p>
        )}
      </section>

      <details className="card system-state">
        <summary>
          <span className="system-state__title">{copy.systemInput}</span>
          <span className="system-state__hint">{copy.systemInputHint}</span>
        </summary>
        <pre>{JSON.stringify(systemInput, null, 2)}</pre>
      </details>
    </section>
  );
}
