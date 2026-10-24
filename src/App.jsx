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

const NON_TEXT_INPUT_TYPES = ['range', 'checkbox', 'radio', 'button', 'submit', 'reset'];

function isTextEntryTarget(target) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  if (target.isContentEditable || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
    return true;
  }
  return target.tagName === 'INPUT' && !NON_TEXT_INPUT_TYPES.includes(target.type);
}

function isControlTarget(target) {
  return target instanceof HTMLElement && target.matches('button, a[href], summary, input');
}

function sanitizeViewpointIds(ids) {
  return [...new Set(ids)].filter((id) => VIEWPOINT_IDS.includes(id));
}

function shuffledOrder(length, previous) {
  const order = Array.from({ length }, (_, index) => index);
  for (let attempt = 0; attempt < 5; attempt += 1) {
    for (let index = length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [order[index], order[swapIndex]] = [order[swapIndex], order[index]];
    }
    if (!previous || order.some((value, index) => value !== previous[index])) {
      break;
    }
  }
  return order;
}

const CLOSED_QUIZ = { isOpen: false, selectedIndex: null, order: null };

function getQuizSession(quiz, quizState) {
  const order = quizState.order ?? quiz.options.map((_, index) => index);
  return {
    ...quiz,
    options: order.map((index) => quiz.options[index]),
    correctIndex: order.indexOf(quiz.correctIndex),
    selectedIndex: quizState.selectedIndex,
  };
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
  const [quizState, setQuizState] = useState(CLOSED_QUIZ);
  const [isViewpointPanelOpen, setIsViewpointPanelOpen] = useState(true);
  const [isLearningPanelOpen, setIsLearningPanelOpen] = useState(true);
  const [isOverviewMode, setIsOverviewMode] = useState(false);
  const [visitedIds, setVisitedIds] = useState(() =>
    sanitizeViewpointIds([...readStoredList(STORAGE_KEYS.visited), INITIAL_VIEWPOINT]),
  );
  const [clearedIds, setClearedIds] = useState(() => sanitizeViewpointIds(readStoredList(STORAGE_KEYS.cleared)));
  // Viewpoints whose quiz was answered wrong this session; they can't be cleared until the next visit to the site.
  const [failedIds, setFailedIds] = useState([]);
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
    ? {
        ...getQuizSession(buildQuiz(simulationState, locale), quizState),
        showRetryNote: failedIds.includes(selectedViewpointId) && !clearedIds.includes(selectedViewpointId),
      }
    : null;

  const resetQuiz = () => setQuizState(CLOSED_QUIZ);

  const handleSelectViewpoint = useCallback(
    (viewpointId) => {
      if (viewpointId === selectedViewpointId) {
        return;
      }

      if (!visitedIds.includes(viewpointId)) {
        const nextVisited = [...visitedIds, viewpointId];
        const localeCopy = getCopy(locale);
        setVisitedIds(nextVisited);
        pushToast(localeCopy.toastFirstVisit(getBodyName(BODY_CONFIG[viewpointId], locale)));
        if (nextVisited.length === VIEWPOINT_IDS.length) {
          pushToast(localeCopy.toastAllVisited, 'quiz');
        }
      }

      startTransition(() => {
        setSelectedViewpointId(viewpointId);
        setQuizState(CLOSED_QUIZ);
        setUserAction('viewpoint_changed');
      });
    },
    [selectedViewpointId, visitedIds, locale, pushToast],
  );

  const handleToggleViewpointPanel = useCallback(() => setIsViewpointPanelOpen((current) => !current), []);
  const handleToggleLearningPanel = useCallback(() => setIsLearningPanelOpen((current) => !current), []);

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

  // Options are shuffled on every request so a retry can't be solved by position alone.
  const handleRequestQuiz = () => {
    const optionCount = buildQuiz(simulationState, locale).options.length;
    setQuizState((current) => ({
      isOpen: true,
      selectedIndex: null,
      order: shuffledOrder(optionCount, current.order),
    }));
    setUserAction('request_quiz');
  };

  const handleAnswerQuiz = (selectedIndex) => {
    setQuizState((current) => ({ ...current, selectedIndex }));
    setUserAction('quiz_answered');

    // Only a correct answer with no earlier wrong one at this viewpoint counts toward the observation log.
    const isCorrect = quizSession?.correctIndex === selectedIndex;
    if (!isCorrect) {
      setFailedIds((current) => (current.includes(selectedViewpointId) ? current : [...current, selectedViewpointId]));
      return;
    }
    if (!failedIds.includes(selectedViewpointId) && !clearedIds.includes(selectedViewpointId)) {
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
    let handledKeyDown = false;
    // A control reached with the keyboard keeps its native Space behaviour; one focused by a click does not.
    let lastInput = 'pointer';

    const handlePointerDown = () => {
      lastInput = 'pointer';
    };

    const handleKeyDown = (event) => {
      if (event.code !== 'Space') {
        lastInput = 'keyboard';
        handledKeyDown = false;
        return;
      }
      if (event.altKey || event.ctrlKey || event.metaKey) {
        return;
      }
      if (isTextEntryTarget(event.target) || (lastInput === 'keyboard' && isControlTarget(event.target))) {
        return;
      }
      event.preventDefault();
      if (!event.repeat) {
        handledKeyDown = true;
        handleTogglePlay();
      }
    };

    // A clicked button would otherwise also activate on keyup.
    const handleKeyUp = (event) => {
      if (event.code === 'Space' && handledKeyDown) {
        handledKeyDown = false;
        event.preventDefault();
      }
    };

    // A keyup lost to another window must not swallow the next Space.
    const handleBlur = () => {
      handledKeyDown = false;
    };

    window.addEventListener('pointerdown', handlePointerDown, true);
    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('keyup', handleKeyUp, true);
    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('pointerdown', handlePointerDown, true);
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('keyup', handleKeyUp, true);
    };
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
      {showLearningPanel && (
        <a className="skip-link" href="#learning-title">
          {locale === 'ja' ? '学習パネルへ移動' : 'Skip to learning panel'}
        </a>
      )}

      <AppHeader
        locale={locale}
        theme={theme}
        onLocaleChange={setLocale}
        onThemeChange={setTheme}
        visitedCount={visitedIds.length}
        clearedCount={clearedIds.length}
        isViewpointPanelOpen={isViewpointPanelOpen}
        isLearningPanelOpen={isLearningPanelOpen}
        onToggleViewpointPanel={handleToggleViewpointPanel}
        onToggleLearningPanel={handleToggleLearningPanel}
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
          onRetryQuiz={handleRequestQuiz}
          onAnswerQuiz={handleAnswerQuiz}
        />
      )}

      <ToastStack toasts={toasts} />
    </div>
  );
}
