import { BODY_CONFIG, VIEWPOINT_IDS } from '../data/celestialBodies.js';

export default function ViewpointSelector({ selectedViewpointId, onSelect }) {
  return (
    <section className="panel selector-panel">
      <div className="panel-kicker">VIEWPOINT SELECTOR</div>
      <h1>GEO LEARNER</h1>
      <p className="panel-intro">
        太陽系の各視点へ移動して、地球の見え方の違いを比較します。
      </p>

      <div className="selector-list">
        {VIEWPOINT_IDS.map((bodyId) => {
          const body = BODY_CONFIG[bodyId];
          const isActive = selectedViewpointId === bodyId;

          return (
            <button
              key={bodyId}
              type="button"
              className={`selector-item${isActive ? ' is-active' : ''}`}
              onClick={() => onSelect(bodyId)}
            >
              <span
                className="selector-swatch"
                style={{ '--swatch': body.color, '--swatch-glow': body.glow }}
              />
              <span className="selector-copy">
                <strong>{body.nameJa}</strong>
                <span>{body.summary}</span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
