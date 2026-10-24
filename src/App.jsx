import { Suspense, lazy, startTransition, useCallback, useEffect, useRef, useState } from 'react';
import AppHeader from './components/AppHeader.jsx';
import Icon from './components/Icons.jsx';
import LearningModule from './components/LearningModule.jsx';
import SimulationControls from './components/SimulationControls.jsx';
import ViewpointSelector from './components/ViewpointSelector.jsx';
import { BODY_CONFIG, TIMELINE_MAX_DAYS, VIEWPOINT_IDS } from './data/celestialBodies.js';
import { getSimulationState } from './lib/orbitalMath.js';
import { DEFAULT_LOCALE, DEFAULT_THEME, getBodyName, getCopy, getDocumentTitle } from './lib/i18n.js';
import { readStorage, readStoredList, writeStorage } from './lib/storage.js';
import { buildQuiz, buildTutorContent } from './lib/tutor.js';

const SimulationCanvas = lazy(() => import('./components/SimulationCanvas.jsx'));

const STORAGE_KEYS = {
  locale: 'geo-learner:locale',
  theme: 'geo-learner:theme',
  visited: 'geo-learner:visited',
  cleared: 'geo-learner:quiz-cleared',
  onboarded: 'geo-learner:onboarded',
};

const COMPACT_QUERY = '(max-width: 900px)';
const INITIAL_VIEWPOINT = 'Jupiter';

function getInitialLocale() {
  return readStorage(STORAGE_KEYS.locale) === 'en' ? 'en' : DEFAULT_LOCALE;
}

function getInitialTheme() {
  const saved = readStorage(STORAGE_KEYS.theme);
  return saved === 'light' || saved === 'dark' ? saved : DEFAULT_THEME;
}

function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const handleChange = () => setMatches(mediaQuery.matches);
    handleChange();
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [query]);

  return matches;
}

function isTypingTarget(target) {
  return target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT|BUTTON|SUMMARY|A)$/.test(target.tagName));
}

function Onboarding({ locale, onClose }) {
  const copy = getCopy(locale);

  return (
    <aside className="onboarding" aria-labelledby="onboarding-title">
      <button type="button" className="icon-button onboarding__close" onClick={onClose} aria-label={copy.closeLabel}>
        <Icon name="close" size={16} />
      </button>
      <h2 id="onboarding-title" className="onboarding__title">
        {copy.onboardingTitle}
      </h2>
      <ol className="onboarding__steps">
        {copy.onboardingSteps.map((step, index) => (
          <li key={step.title} style={{ '--step': index }}>
            <span className="onboarding__icon" aria-hidden="true">
              {step.icon}
            </span>
            <span>
              <strong>{step.title}</strong>
              <span>{step.text}</span>
            </span>
          </li>
        ))}
      </ol>
      <button type="button" className="pill-button pill-button--accent" onClick={onClose}>
        {copy.onboardingStart}
      </button>
    </aside>
  );
}

function ToastStack({ toasts }) {
  return (
    <div className="toast-stack" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast--${toast.tone}`}>
          <Icon name={toast.tone === 'quiz' ? 'star' : 'sparkle'} size={16} />
          <span>{toast.text}</span>
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const [selectedViewpointId, setSelectedViewpointId] = useState(INITIAL_VIEWPOINT);
  const [day, setDay] = useState(940);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(24);
  const [locale, setLocale] = useState(getInitialLocale);
  const [theme, setTheme] = useState(getInitialTheme);
  const [userAction, setUserAction] = useState('viewpoint_changed');
  const [quizState, setQuizState] = useState({ isOpen: false, selectedIndex: null });
  const [isViewpointPanelOpen, setIsViewpointPanelOpen] = useState(true);
  const [isLearningPanelOpen, setIsLearningPanelOpen] = useState(true);
  const [isOverviewMode, setIsOverviewMode] = useState(false);
  const [visitedIds, setVisitedIds] = useState(() => {
    const stored = readStoredList(STORAGE_KEYS.visited);
    return stored.includes(INITIAL_VIEWPOINT) ? stored : [...stored, INITIAL_VIEWPOINT];
  });
  const [clearedIds, setClearedIds] = useState(() => readStoredList(STORAGE_KEYS.cleared));
  const [showOnboarding, setShowOnboarding] = useState(() => readStorage(STORAGE_KEYS.onboarded) !== 'done');
  const [toasts, setToasts] = useState([]);
  const toastIdRef = useRef(0);
  const isCompact = useMediaQuery(COMPACT_QUERY);

  // Panels stack vertically on small screens, so they are always shown there.
  const showViewpointPanel = isCompact || isViewpointPanelOpen;
  const showLearningPanel = isCompact || isLearningPanelOpen;

  useEffect(() => {
    if (!isPlaying) {
      return undefined;
    }

    let animationFrameId;
    let previousTime = performance.now();

    const animate = (currentTime) => {
      const elapsedSeconds = (currentTime - previousTime) / 1000;
      previousTime = currentTime;

      setDay((currentDay) => {
        const nextDay = currentDay + elapsedSeconds * speed;
        return nextDay > TIMELINE_MAX_DAYS ? nextDay - TIMELINE_MAX_DAYS : nextDay;
      });

      animationFrameId = window.requestAnimationFrame(animate);
    };

    animationFrameId = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying, speed]);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dataset.theme = theme;
    document.title = getDocumentTitle(locale);
    writeStorage(STORAGE_KEYS.locale, locale);
    writeStorage(STORAGE_KEYS.theme, theme);

    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#060d18' : '#eef3f9');
    }
  }, [locale, theme]);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.visited, JSON.stringify(visitedIds));
  }, [visitedIds]);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.cleared, JSON.stringify(clearedIds));
  }, [clearedIds]);

  const pushToast = useCallback((text, tone = 'info') => {
    toastIdRef.current += 1;
    const id = toastIdRef.current;
    setToasts((current) => [...current.slice(-2), { id, text, tone }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3600);
  }, []);

  const copy = getCopy(locale);
  const simulationState = getSimulationState(selectedViewpointId, day, userAction);
  const tutorContent = buildTutorContent(simulationState, locale);
  const quizSession = quizState.isOpen
    ? { ...buildQuiz(simulationState, locale), selectedIndex: quizState.selectedIndex }
    : null;

  const resetQuiz = () => setQuizState({ isOpen: false, selectedIndex: null });

  const handleSelectViewpoint = (viewpointId) => {
    if (viewpointId === selectedViewpointId) {
      return;
    }

    if (!visitedIds.includes(viewpointId)) {
      const nextVisited = [...visitedIds, viewpointId];
      setVisitedIds(nextVisited);
      pushToast(copy.toastFirstVisit(getBodyName(BODY_CONFIG[viewpointId], locale)));
      if (nextVisited.length === VIEWPOINT_IDS.length) {
        pushToast(copy.toastAllVisited, 'quiz');
      }
    }

    startTransition(() => {
      setSelectedViewpointId(viewpointId);
      resetQuiz();
      setUserAction('viewpoint_changed');
    });
  };

  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  // Stable identity so the keyboard shortcut listener is not re-bound on every animation frame.
  const handleTogglePlay = useCallback(() => {
    const wasPlaying = isPlayingRef.current;
    setIsPlaying(!wasPlaying);
    setUserAction(wasPlaying ? 'playback_paused' : 'playback_resumed');
  }, []);

  const handleSpeedChange = (nextSpeed) => {
    setSpeed(nextSpeed);
    setUserAction('time_accelerated');
  };

  const handleDayChange = (nextDay) => {
    setDay(nextDay);
    resetQuiz();
    setUserAction('timeline_adjusted');
  };

  const handleRequestQuiz = () => {
    setQuizState({ isOpen: true, selectedIndex: null });
    setUserAction('request_quiz');
  };

  const handleAnswerQuiz = (selectedIndex) => {
    setQuizState((current) => ({ ...current, selectedIndex }));
    setUserAction('quiz_answered');

    const isCorrect = buildQuiz(simulationState, locale).correctIndex === selectedIndex;
    if (isCorrect && !clearedIds.includes(selectedViewpointId)) {
      const nextCleared = [...clearedIds, selectedViewpointId];
      setClearedIds(nextCleared);
      pushToast(copy.toastQuizCleared(getBodyName(BODY_CONFIG[selectedViewpointId], locale)), 'quiz');
      if (nextCleared.length === VIEWPOINT_IDS.length) {
        pushToast(copy.toastAllCleared, 'quiz');
      }
    }
  };

  const handleCloseOnboarding = () => {
    setShowOnboarding(false);
    writeStorage(STORAGE_KEYS.onboarded, 'done');
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.code !== 'Space' || event.repeat || event.altKey || event.ctrlKey || event.metaKey) {
        return;
      }
      if (isTypingTarget(event.target)) {
        return;
      }
      event.preventDefault();
      handleTogglePlay();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleTogglePlay]);

  const shellClassName = [
    'app-shell',
    !showViewpointPanel ? 'is-left-collapsed' : '',
    !showLearningPanel ? 'is-right-collapsed' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={shellClassName}>
      <a className="skip-link" href="#learning-title">
        {locale === 'ja' ? '学習パネルへ移動' : 'Skip to learning panel'}
      </a>

      <AppHeader
        locale={locale}
        theme={theme}
        onLocaleChange={setLocale}
        onThemeChange={setTheme}
        visitedCount={visitedIds.length}
        clearedCount={clearedIds.length}
        isViewpointPanelOpen={isViewpointPanelOpen}
        isLearningPanelOpen={isLearningPanelOpen}
        onToggleViewpointPanel={() => setIsViewpointPanelOpen((current) => !current)}
        onToggleLearningPanel={() => setIsLearningPanelOpen((current) => !current)}
        showPanelToggles={!isCompact}
      />

      {showViewpointPanel && (
        <ViewpointSelector
          selectedViewpointId={selectedViewpointId}
          onSelect={handleSelectViewpoint}
          locale={locale}
          visitedIds={visitedIds}
          clearedIds={clearedIds}
        />
      )}

      <main className="center-column">
        <div className="stage-wrap">
          <Suspense
            fallback={
              <section className="stage-panel stage-panel--loading">
                <span className="loading-orbit" aria-hidden="true" />
                {copy.loading3d}
              </section>
            }
          >
            <SimulationCanvas
              simulationState={simulationState}
              locale={locale}
              theme={theme}
              isOverviewMode={isOverviewMode}
              onToggleOverview={() => setIsOverviewMode((current) => !current)}
            />
          </Suspense>
          {showOnboarding && <Onboarding locale={locale} onClose={handleCloseOnboarding} />}
        </div>
        <SimulationControls
          day={day}
          isPlaying={isPlaying}
          speed={speed}
          locale={locale}
          onTogglePlay={handleTogglePlay}
          onSpeedChange={handleSpeedChange}
          onDayChange={handleDayChange}
        />
      </main>

      {showLearningPanel && (
        <LearningModule
          simulationState={simulationState}
          tutorContent={tutorContent}
          quizSession={quizSession}
          locale={locale}
          onRequestQuiz={handleRequestQuiz}
          onAnswerQuiz={handleAnswerQuiz}
        />
      )}

      <ToastStack toasts={toasts} />
    </div>
  );
}
