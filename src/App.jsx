import { Suspense, lazy, startTransition, useEffect, useState } from 'react';
import LearningModule from './components/LearningModule.jsx';
import SimulationControls from './components/SimulationControls.jsx';
import ViewpointSelector from './components/ViewpointSelector.jsx';
import { TIMELINE_MAX_DAYS } from './data/celestialBodies.js';
import { getSimulationState } from './lib/orbitalMath.js';
import { buildQuiz, buildTutorContent } from './lib/tutor.js';

const SimulationCanvas = lazy(() => import('./components/SimulationCanvas.jsx'));

export default function App() {
  const [selectedViewpointId, setSelectedViewpointId] = useState('Jupiter');
  const [day, setDay] = useState(940);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(24);
  const [userAction, setUserAction] = useState('Viewpoint Changed');
  const [quizSession, setQuizSession] = useState(null);

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

  const simulationState = getSimulationState(selectedViewpointId, day, userAction);
  const tutorContent = buildTutorContent(simulationState);

  const handleSelectViewpoint = (viewpointId) => {
    if (viewpointId === selectedViewpointId) {
      return;
    }

    startTransition(() => {
      setSelectedViewpointId(viewpointId);
      setQuizSession(null);
      setUserAction('Viewpoint Changed');
    });
  };

  const handleTogglePlay = () => {
    setIsPlaying((current) => !current);
    setUserAction(isPlaying ? 'Playback Paused' : 'Playback Resumed');
  };

  const handleSpeedChange = (nextSpeed) => {
    setSpeed(nextSpeed);
    setUserAction('Time Accelerated');
  };

  const handleDayChange = (nextDay) => {
    setDay(nextDay);
    setQuizSession(null);
    setUserAction('Timeline Adjusted');
  };

  const handleRequestQuiz = () => {
    const nextQuiz = buildQuiz(simulationState);
    setQuizSession({ ...nextQuiz, selectedIndex: null });
    setUserAction('Request Quiz');
  };

  const handleAnswerQuiz = (selectedIndex) => {
    setQuizSession((currentQuiz) => {
      if (!currentQuiz) {
        return null;
      }
      return { ...currentQuiz, selectedIndex };
    });
    setUserAction('Quiz Answered');
  };

  return (
    <div className="app-shell">
      <ViewpointSelector selectedViewpointId={selectedViewpointId} onSelect={handleSelectViewpoint} />

      <main className="center-column">
        <Suspense fallback={<section className="stage-panel stage-panel--loading">3Dシミュレーションを読み込み中...</section>}>
          <SimulationCanvas simulationState={simulationState} />
        </Suspense>
        <SimulationControls
          day={day}
          isPlaying={isPlaying}
          speed={speed}
          onTogglePlay={handleTogglePlay}
          onSpeedChange={handleSpeedChange}
          onDayChange={handleDayChange}
        />
      </main>

      <LearningModule
        simulationState={simulationState}
        tutorContent={tutorContent}
        quizSession={quizSession}
        onRequestQuiz={handleRequestQuiz}
        onAnswerQuiz={handleAnswerQuiz}
      />
    </div>
  );
}
