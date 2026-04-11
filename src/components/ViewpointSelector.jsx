import { BODY_CONFIG, VIEWPOINT_IDS } from '../data/celestialBodies.js';
import { getBodyName, getBodySummary, getCopy } from '../lib/i18n.js';

export default function ViewpointSelector({
  selectedViewpointId,
  onSelect,
  locale,
  theme,
  onLocaleChange,
  onThemeChange,
}) {
  const copy = getCopy(locale);

  return (
    <section className="panel selector-panel">
      <div className="selector-header">
        <div>
          <div className="panel-kicker">{copy.selectorKicker}</div>
          <h1>GEO LEARNER</h1>
          <p className="panel-intro">{copy.selectorIntro}</p>
        </div>

        <div className="selector-toolbar">
          <div className="toolbar-group">
            <span className="toolbar-label">{copy.languageLabel}</span>
            <div className="mode-toggle">
              <button
                type="button"
                className={`toggle-chip${locale === 'ja' ? ' is-active' : ''}`}
                onClick={() => onLocaleChange('ja')}
                aria-pressed={locale === 'ja'}
              >
                日本語
              </button>
              <button
                type="button"
                className={`toggle-chip${locale === 'en' ? ' is-active' : ''}`}
                onClick={() => onLocaleChange('en')}
                aria-pressed={locale === 'en'}
              >
                English
              </button>
            </div>
          </div>

          <div className="toolbar-group">
            <span className="toolbar-label">{copy.themeLabel}</span>
            <div className="mode-toggle">
              <button
                type="button"
                className={`toggle-chip${theme === 'light' ? ' is-active' : ''}`}
                onClick={() => onThemeChange('light')}
                aria-pressed={theme === 'light'}
              >
                {locale === 'ja' ? 'ライト' : 'Light'}
              </button>
              <button
                type="button"
                className={`toggle-chip${theme === 'dark' ? ' is-active' : ''}`}
                onClick={() => onThemeChange('dark')}
                aria-pressed={theme === 'dark'}
              >
                {locale === 'ja' ? 'ダーク' : 'Dark'}
              </button>
            </div>
          </div>
        </div>
      </div>

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
                <strong>{getBodyName(body, locale)}</strong>
                <span>{getBodySummary(body, locale)}</span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
