import { Suspense, lazy, startTransition, useEffect, useState } from 'react';
import LearningModule from './components/LearningModule.jsx';
import SimulationControls from './components/SimulationControls.jsx';
import ViewpointSelector from './components/ViewpointSelector.jsx';
import { TIMELINE_MAX_DAYS } from './data/celestialBodies.js';
import { getSimulationState } from './lib/orbitalMath.js';
import { DEFAULT_LOCALE, DEFAULT_THEME, getCopy, getDocumentTitle } from './lib/i18n.js';
import { buildQuiz, buildTutorContent } from './lib/tutor.js';

const SimulationCanvas = lazy(() => import('./components/SimulationCanvas.jsx'));

const STORAGE_KEYS = {
  locale: 'geo-learner:locale',
  theme: 'geo-learner:theme',
};

function getInitialLocale() {
  const saved = window.localStorage.getItem(STORAGE_KEYS.locale);
  return saved === 'en' ? 'en' : DEFAULT_LOCALE;
}

function getInitialTheme() {
  const saved = window.localStorage.getItem(STORAGE_KEYS.theme);
  return saved === 'light' || saved === 'dark' ? saved : DEFAULT_THEME;
}

export default function App() {
  const [selectedViewpointId, setSelectedViewpointId] = useState('Jupiter');
  const [day, setDay] = useState(940);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(24);
  const [locale, setLocale] = useState(getInitialLocale);
  const [theme, setTheme] = useState(getInitialTheme);
  const [userAction, setUserAction] = useState('viewpoint_changed');
  const [quizState, setQuizState] = useState({ isOpen: false, selectedIndex: null });

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
    window.localStorage.setItem(STORAGE_KEYS.locale, locale);
    window.localStorage.setItem(STORAGE_KEYS.theme, theme);

    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#07101b' : '#eef5fb');
    }
  }, [locale, theme]);

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

    startTransition(() => {
      setSelectedViewpointId(viewpointId);
      resetQuiz();
      setUserAction('viewpoint_changed');
    });
  };

  const handleTogglePlay = () => {
    setIsPlaying((current) => !current);
    setUserAction(isPlaying ? 'playback_paused' : 'playback_resumed');
  };

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
  };

  return (
    <div className="app-shell">
      <ViewpointSelector
        selectedViewpointId={selectedViewpointId}
        onSelect={handleSelectViewpoint}
        locale={locale}
        theme={theme}
        onLocaleChange={setLocale}
        onThemeChange={setTheme}
      />

      <main className="center-column">
        <Suspense fallback={<section className="stage-panel stage-panel--loading">{copy.loading3d}</section>}>
          <SimulationCanvas simulationState={simulationState} locale={locale} theme={theme} />
        </Suspense>
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

      <LearningModule
        simulationState={simulationState}
        tutorContent={tutorContent}
        quizSession={quizSession}
        locale={locale}
        onRequestQuiz={handleRequestQuiz}
        onAnswerQuiz={handleAnswerQuiz}
      />
    </div>
  );
}
