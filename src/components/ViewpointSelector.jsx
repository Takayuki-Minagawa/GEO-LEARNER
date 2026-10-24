import { memo } from 'react';
import { BODY_CONFIG, VIEWPOINT_IDS } from '../data/celestialBodies.js';
import { getBodyName, getBodySummary, getCopy } from '../lib/i18n.js';
import { getObservationCategory } from '../lib/orbitalMath.js';
import Icon from './Icons.jsx';

const GROUP_ORDER = ['inner', 'satellite', 'outer'];

export function PlanetSphere({ body, size = 'md' }) {
  return (
    <span
      className={`planet-sphere planet-sphere--${size}${body.id === 'Saturn' ? ' has-ring' : ''}`}
      style={{ '--swatch': body.color, '--swatch-glow': body.glow }}
      aria-hidden="true"
    />
  );
}

function ViewpointSelector({ selectedViewpointId, onSelect, locale, visitedIds, clearedIds }) {
  const copy = getCopy(locale);
  const selectedBody = BODY_CONFIG[selectedViewpointId];

  const groups = GROUP_ORDER.map((category) => ({
    category,
    ids: VIEWPOINT_IDS.filter((id) => getObservationCategory(id) === category),
  }));

  return (
    <section className="panel selector-panel" aria-labelledby="selector-title">
      <div className="panel-heading">
        <div className="panel-kicker">{copy.selectorKicker}</div>
        <h2 id="selector-title" className="panel-title">
          {locale === 'ja' ? 'どこから地球を見る？' : 'Where will you stand?'}
        </h2>
        <p className="panel-intro">{copy.selectorIntro}</p>
      </div>

      <div className="selector-groups">
        {groups.map(({ category, ids }) => (
          <div key={category} className={`selector-group selector-group--${category}`}>
            <div className="selector-group__header">
              <span className="selector-group__title">{copy.groups[category]}</span>
              <span className="selector-group__hint">{copy.groupHints[category]}</span>
            </div>

            <div className="selector-list">
              {ids.map((bodyId) => {
                const body = BODY_CONFIG[bodyId];
                const isActive = selectedViewpointId === bodyId;
                const isVisited = visitedIds.includes(bodyId);
                const isCleared = clearedIds.includes(bodyId);
                const orbitLabel =
                  body.parentId === 'Earth'
                    ? locale === 'ja'
                      ? '地球から 約38万 km'
                      : '≈384,000 km from Earth'
                    : copy.fromSun(body.orbitRadiusAu);

                return (
                  <button
                    key={bodyId}
                    type="button"
                    className={`selector-item${isActive ? ' is-active' : ''}`}
                    style={{ '--swatch': body.color, '--swatch-glow': body.glow }}
                    onClick={() => onSelect(bodyId)}
                    aria-pressed={isActive}
                  >
                    <PlanetSphere body={body} />
                    <span className="selector-copy">
                      <span className="selector-copy__top">
                        <strong>{getBodyName(body, locale)}</strong>
                        <span className="selector-badges">
                          {isVisited && (
                            <span className="badge badge--visited" title={copy.visited}>
                              <Icon name="eye" size={12} />
                              <span className="visually-hidden">{copy.visited}</span>
                            </span>
                          )}
                          {isCleared && (
                            <span className="badge badge--cleared" title={copy.quizCleared}>
                              <Icon name="star" size={12} />
                              <span className="visually-hidden">{copy.quizCleared}</span>
                            </span>
                          )}
                        </span>
                      </span>
                      <span className="selector-copy__meta">{orbitLabel}</span>
                      <span className="selector-copy__summary">{getBodySummary(body, locale)}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <p className="selector-current-summary" aria-live="polite">
        <strong>{getBodyName(selectedBody, locale)}</strong>
        {getBodySummary(selectedBody, locale)}
      </p>
    </section>
  );
}

// Memoized: the app re-renders every animation frame while playing.
export default memo(ViewpointSelector);
