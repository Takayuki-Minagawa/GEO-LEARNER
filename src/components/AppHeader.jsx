import { memo } from 'react';
import { VIEWPOINT_IDS } from '../data/celestialBodies.js';
import { getCopy } from '../lib/i18n.js';
import Icon from './Icons.jsx';

function ProgressMeter({ visitedCount, clearedCount, locale }) {
  const copy = getCopy(locale);
  const total = VIEWPOINT_IDS.length;
  // Each viewpoint is worth two steps: observing it and clearing its quiz.
  const ratio = (visitedCount + clearedCount) / (total * 2);
  const circumference = 2 * Math.PI * 15;

  return (
    <div className="progress-meter" role="img" aria-label={copy.progressAria(visitedCount, clearedCount, total)}>
      <svg className="progress-meter__ring" viewBox="0 0 36 36" aria-hidden="true">
        <circle cx="18" cy="18" r="15" className="progress-meter__track" />
        <circle
          cx="18"
          cy="18"
          r="15"
          className="progress-meter__value"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - ratio)}
        />
      </svg>
      <div className="progress-meter__copy" aria-hidden="true">
        <span className="progress-meter__title">{copy.progressTitle}</span>
        <span className="progress-meter__stats">
          <span>
            <Icon name="eye" size={13} /> {copy.progressVisited(visitedCount, total)}
          </span>
          <span>
            <Icon name="star" size={13} /> {copy.progressQuiz(clearedCount, total)}
          </span>
        </span>
      </div>
    </div>
  );
}

function AppHeader({
  locale,
  theme,
  onLocaleChange,
  onThemeChange,
  visitedCount,
  clearedCount,
  isViewpointPanelOpen,
  isLearningPanelOpen,
  onToggleViewpointPanel,
  onToggleLearningPanel,
  showPanelToggles,
}) {
  const copy = getCopy(locale);

  return (
    <header className="app-header">
      <div className="brand">
        <img className="brand__mark" src="./favicon.svg" alt="" width="40" height="40" />
        <div className="brand__copy">
          <h1 className="brand__name">GEO LEARNER</h1>
          <span className="brand__tagline">{copy.tagline}</span>
        </div>
      </div>

      <ProgressMeter visitedCount={visitedCount} clearedCount={clearedCount} locale={locale} />

      <div className="header-actions">
        {showPanelToggles && (
          <div className="segmented segmented--quiet" role="group" aria-label={`${copy.panelToggleLeft} / ${copy.panelToggleRight}`}>
            <button
              type="button"
              className="segmented__item"
              onClick={onToggleViewpointPanel}
              aria-pressed={isViewpointPanelOpen}
              title={isViewpointPanelOpen ? copy.hideViewpointPanel : copy.showViewpointPanel}
            >
              <Icon name="panelLeft" size={16} />
              <span className="segmented__label">{copy.panelToggleLeft}</span>
            </button>
            <button
              type="button"
              className="segmented__item"
              onClick={onToggleLearningPanel}
              aria-pressed={isLearningPanelOpen}
              title={isLearningPanelOpen ? copy.hideLearningPanel : copy.showLearningPanel}
            >
              <Icon name="panelRight" size={16} />
              <span className="segmented__label">{copy.panelToggleRight}</span>
            </button>
          </div>
        )}

        <div className="segmented" role="group" aria-label={copy.languageLabel}>
          <button
            type="button"
            className="segmented__item"
            onClick={() => onLocaleChange('ja')}
            aria-pressed={locale === 'ja'}
            lang="ja"
          >
            日本語
          </button>
          <button
            type="button"
            className="segmented__item"
            onClick={() => onLocaleChange('en')}
            aria-pressed={locale === 'en'}
            aria-label="English"
            lang="en"
          >
            EN
          </button>
        </div>

        <div className="segmented" role="group" aria-label={copy.themeLabel}>
          <button
            type="button"
            className="segmented__item"
            onClick={() => onThemeChange('light')}
            aria-pressed={theme === 'light'}
            aria-label={locale === 'ja' ? 'ライト' : 'Light'}
            title={locale === 'ja' ? 'ライト' : 'Light'}
          >
            <Icon name="sun" size={16} />
          </button>
          <button
            type="button"
            className="segmented__item"
            onClick={() => onThemeChange('dark')}
            aria-pressed={theme === 'dark'}
            aria-label={locale === 'ja' ? 'ダーク' : 'Dark'}
            title={locale === 'ja' ? 'ダーク' : 'Dark'}
          >
            <Icon name="moon" size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}

// Memoized: the app re-renders every animation frame while playing.
export default memo(AppHeader);
