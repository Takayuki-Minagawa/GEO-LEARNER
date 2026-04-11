function pointOnCircle(radius, angle, center = 110) {
  return {
    x: center + radius * Math.cos(angle),
    y: center + radius * Math.sin(angle),
  };
}

function OrbitDiagram({ simulationState }) {
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
        <strong>軌道の関係</strong>
        <span>{simulationState.relationshipLabel}</span>
      </div>
      <svg viewBox="0 0 220 220" role="img" aria-label="Orbit relationship diagram">
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
          太陽
        </text>
        <text x={earthPoint.x} y={earthPoint.y - 13} textAnchor="middle" className="orbit-label">
          地球
        </text>
        <text x={viewerPoint.x} y={viewerPoint.y - 13} textAnchor="middle" className="orbit-label">
          {simulationState.viewpoint.nameJa}
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
  onRequestQuiz,
  onAnswerQuiz,
}) {
  const systemInput = {
    viewpoint: simulationState.viewpoint.nameEn,
    earth_phase: simulationState.earthPhase.label,
    distance_au: Number(simulationState.distanceAu.toFixed(3)),
    apparent_size: simulationState.apparentSizeLabel,
    user_action: simulationState.userAction,
  };

  return (
    <section className="panel learning-panel">
      <div className="panel-kicker">LEARNING MODULE</div>
      <h2>地学チューターAI</h2>

      <div className="system-state">
        <div className="system-state__title">System Input</div>
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
          <span>次の観察ポイント</span>
          <p>{tutorContent.prompt}</p>
        </div>
      </article>

      <OrbitDiagram simulationState={simulationState} />

      <section className="quiz-card">
        <div className="quiz-card__header">
          <strong>理解度チェック</strong>
          <button type="button" className="pill-button pill-button--secondary" onClick={onRequestQuiz}>
            クイズを出題
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
                  {quizSession.selectedIndex === quizSession.correctIndex ? '正解です。' : 'もう一度考えてみましょう。'}
                </strong>
                <p>{renderEmphasisText(quizSession.explanation)}</p>
              </div>
            )}
          </div>
        ) : (
          <p className="quiz-placeholder">
            現在の視点に合わせて、位相・離角・内惑星/外惑星の理解を確かめるクイズを出題します。
          </p>
        )}
      </section>
    </section>
  );
}
