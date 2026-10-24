const AU_IN_KM = 149_597_870.7;

export const DEFAULT_LOCALE = 'ja';
export const DEFAULT_THEME = 'dark';

const COPY = {
  ja: {
    selectorKicker: '視点セレクター',
    selectorIntro: '太陽系の各視点へ移動して、地球の見え方の違いを比較します。',
    languageLabel: '表示言語',
    themeLabel: '表示テーマ',
    showViewpointPanel: '左パネルを表示',
    hideViewpointPanel: '左パネルを隠す',
    showLearningPanel: '右パネルを表示',
    hideLearningPanel: '右パネルを隠す',
    showOverview: '全体を表示',
    hideOverview: '通常表示に戻す',
    stageKicker: '太陽系ビューシミュレーター',
    stageTitle: (name) => `${name}から見た地球`,
    loading3d: '3Dシミュレーションを読み込み中...',
    controlsKicker: '時間コントロール',
    play: '再生',
    pause: '停止',
    simulationDay: 'シミュレーション日数',
    dayUnit: '日',
    yearUnit: '年',
    learningKicker: '学習モジュール',
    tutorTitle: '地学チューターAI',
    systemInput: 'システム入力',
    nextObservation: '次の観察ポイント',
    orbitRelationship: '軌道の関係',
    quizTitle: '理解度チェック',
    requestQuiz: 'クイズを出題',
    quizPlaceholder: '現在の視点に合わせて、位相・離角・内惑星/外惑星の理解を確かめるクイズを出題します。',
    correct: '正解です。',
    retry: 'もう一度考えてみましょう。',
    earthInset: '地球拡大ビュー',
    currentAppearance: '現在の見え方',
    distanceSense: '距離感',
    solarRelation: '太陽からの離れ方',
    relationship: {
      outer: '地球は内惑星として見える',
      inner: '地球は外惑星として見える',
      satellite: '地球は母惑星として見える',
    },
    actions: {
      viewpoint_changed: '視点変更',
      playback_paused: '再生停止',
      playback_resumed: '再生再開',
      time_accelerated: '時間加速',
      timeline_adjusted: 'タイムライン調整',
      request_quiz: 'クイズ出題',
      quiz_answered: 'クイズ回答',
    },
    systemKeys: {
      viewpoint: '視点',
      earthPhase: '地球の位相',
      distanceAu: '距離_AU',
      apparentSize: '見かけの大きさ',
      userAction: '操作',
    },
    celestial: {
      sun: '太陽',
      earth: '地球',
    },
    tagline: '太陽系のどこから見ても、地球は「惑星」になる。',
    groups: {
      inner: '地球より内側の軌道',
      satellite: '地球のすぐそば',
      outer: '地球より外側の軌道',
    },
    groupHints: {
      inner: '地球は外惑星のように見える',
      satellite: '地球は空に浮かぶ大きな母惑星',
      outer: '地球は内惑星のように見える',
    },
    fromSun: (au) => `太陽から ${au} AU`,
    visited: '観測済み',
    quizCleared: 'クイズ正解',
    progressTitle: '観測ログ',
    progressVisited: (n, total) => `観測 ${n}/${total}`,
    progressQuiz: (n, total) => `クイズ ${n}/${total}`,
    progressAria: (visited, cleared, total) =>
      `${total}視点中 ${visited}視点を観測、${cleared}視点のクイズに正解`,
    onboardingTitle: 'はじめての観測ガイド',
    onboardingSteps: [
      { icon: '🪐', title: '視点を選ぶ', text: '水星から海王星まで、どこに立って地球を見るか選びます。' },
      { icon: '⏱', title: '時間を動かす', text: '再生やスライダーで、地球の満ち欠けと位置の変化を追います。' },
      { icon: '✅', title: 'クイズで確かめる', text: '観察したことを理解度チェックで確認し、観測ログを埋めましょう。' },
    ],
    onboardingStart: '観測をはじめる',
    closeLabel: '閉じる',
    shortcutHint: 'Space で再生／停止',
    elongation: '太陽との離角',
    apparentSize: '見かけの大きさ',
    distance: '地球までの距離',
    illumination: '輝いている面',
    elongationArc: '離角',
    toastFirstVisit: (name) => `${name}から初めて地球を観測しました`,
    toastQuizCleared: (name) => `${name}のクイズに正解！観測ログに記録しました`,
    toastAllVisited: '全視点を観測しました。太陽系一周達成！',
    toastAllCleared: 'すべてのクイズに正解！地球観測マスターです',
    tryAgain: 'もう一度挑戦',
    answerCorrectLabel: '正解',
    answerWrongLabel: 'あなたの回答',
    systemInputHint: 'チューターAIに渡している観測データ',
    panelToggleLeft: '視点パネル',
    panelToggleRight: '学習パネル',
    playbackSpeed: '再生速度',
    phaseWaxing: '満ちていく',
    phaseWaning: '欠けていく',
  },
  en: {
    selectorKicker: 'VIEWPOINT SELECTOR',
    selectorIntro: 'Move through Solar System viewpoints and compare how Earth changes from each location.',
    languageLabel: 'Language',
    themeLabel: 'Theme',
    showViewpointPanel: 'Show Left Panel',
    hideViewpointPanel: 'Hide Left Panel',
    showLearningPanel: 'Show Right Panel',
    hideLearningPanel: 'Hide Right Panel',
    showOverview: 'Show Full Orbits',
    hideOverview: 'Back to Normal View',
    stageKicker: 'SOLAR SYSTEM VIEW SIMULATOR',
    stageTitle: (name) => `Earth Seen From ${name}`,
    loading3d: 'Loading 3D simulation...',
    controlsKicker: 'TIME CONTROL',
    play: 'Play',
    pause: 'Pause',
    simulationDay: 'Simulation Day',
    dayUnit: 'days',
    yearUnit: 'years',
    learningKicker: 'LEARNING MODULE',
    tutorTitle: 'Earth Science Tutor AI',
    systemInput: 'System Input',
    nextObservation: 'Next Observation',
    orbitRelationship: 'Orbital Relationship',
    quizTitle: 'Quick Check',
    requestQuiz: 'Ask Quiz',
    quizPlaceholder: 'Generate a quiz about phase, elongation, and inner-versus-outer planet viewing from the current viewpoint.',
    correct: 'Correct.',
    retry: 'Try reconsidering the geometry.',
    earthInset: 'Earth Inset',
    currentAppearance: 'Current appearance',
    distanceSense: 'Distance',
    solarRelation: 'Relation to the Sun',
    relationship: {
      outer: 'Earth appears as an inner planet',
      inner: 'Earth appears as an outer planet',
      satellite: 'Earth appears as the parent world',
    },
    actions: {
      viewpoint_changed: 'Viewpoint Changed',
      playback_paused: 'Playback Paused',
      playback_resumed: 'Playback Resumed',
      time_accelerated: 'Time Accelerated',
      timeline_adjusted: 'Timeline Adjusted',
      request_quiz: 'Request Quiz',
      quiz_answered: 'Quiz Answered',
    },
    systemKeys: {
      viewpoint: 'viewpoint',
      earthPhase: 'earth_phase',
      distanceAu: 'distance_au',
      apparentSize: 'apparent_size',
      userAction: 'user_action',
    },
    celestial: {
      sun: 'Sun',
      earth: 'Earth',
    },
    tagline: 'From anywhere in the Solar System, Earth becomes just another planet.',
    groups: {
      inner: 'Inside Earth’s orbit',
      satellite: 'Right next to Earth',
      outer: 'Outside Earth’s orbit',
    },
    groupHints: {
      inner: 'Earth looks like an outer planet',
      satellite: 'Earth hangs in the sky as the parent world',
      outer: 'Earth looks like an inner planet',
    },
    fromSun: (au) => `${au} AU from the Sun`,
    visited: 'Observed',
    quizCleared: 'Quiz cleared',
    progressTitle: 'Observation Log',
    progressVisited: (n, total) => `Observed ${n}/${total}`,
    progressQuiz: (n, total) => `Quizzes ${n}/${total}`,
    progressAria: (visited, cleared, total) =>
      `Observed ${visited} of ${total} viewpoints, cleared ${cleared} quizzes`,
    onboardingTitle: 'Your first observation',
    onboardingSteps: [
      { icon: '🪐', title: 'Pick a viewpoint', text: 'Choose where to stand, from Mercury out to Neptune.' },
      { icon: '⏱', title: 'Move through time', text: 'Play or scrub the timeline to watch Earth’s phase and position change.' },
      { icon: '✅', title: 'Check with a quiz', text: 'Confirm what you saw and fill in your observation log.' },
    ],
    onboardingStart: 'Start observing',
    closeLabel: 'Close',
    shortcutHint: 'Space to play / pause',
    elongation: 'Elongation',
    apparentSize: 'Apparent size',
    distance: 'Distance to Earth',
    illumination: 'Illuminated',
    elongationArc: 'elong.',
    toastFirstVisit: (name) => `First observation of Earth from ${name}`,
    toastQuizCleared: (name) => `${name} quiz cleared! Added to your log`,
    toastAllVisited: 'Every viewpoint observed. Grand tour complete!',
    toastAllCleared: 'All quizzes cleared. You are an Earth-watching master!',
    tryAgain: 'Try again',
    answerCorrectLabel: 'Correct answer',
    answerWrongLabel: 'Your answer',
    systemInputHint: 'Observation data passed to the tutor AI',
    panelToggleLeft: 'Viewpoints',
    panelToggleRight: 'Learning',
    playbackSpeed: 'Playback speed',
    phaseWaxing: 'waxing',
    phaseWaning: 'waning',
  },
};

export function getCopy(locale) {
  return COPY[locale] ?? COPY.ja;
}

export function getBodyName(body, locale) {
  return locale === 'ja' ? body.nameJa : body.nameEn;
}

export function getBodySummary(body, locale) {
  return locale === 'ja'
    ? body.summaryJa ?? body.summaryEn ?? ''
    : body.summaryEn ?? body.summaryJa ?? '';
}

export function getPhaseLabel(earthPhase, locale) {
  const phaseName = locale === 'ja' ? earthPhase.japanese : earthPhase.english;
  return `${earthPhase.illuminatedPercent}% ${phaseName}`;
}

export function getDistanceLabel(distanceAu, locale) {
  if (distanceAu < 0.01) {
    const localeCode = locale === 'ja' ? 'ja-JP' : 'en-US';
    return `${Math.round(distanceAu * AU_IN_KM).toLocaleString(localeCode)} km`;
  }

  const digits = distanceAu < 1 ? 3 : 2;
  return `${distanceAu.toFixed(digits)} AU`;
}

export function getApparentSizeLabel(arcseconds) {
  if (arcseconds >= 3600) {
    return `${(arcseconds / 3600).toFixed(2)}°`;
  }

  if (arcseconds >= 60) {
    return `${(arcseconds / 60).toFixed(1)}′`;
  }

  return `${arcseconds.toFixed(1)}″`;
}

export function getElapsedLabel(day, locale) {
  const years = day / 365.25;
  const copy = getCopy(locale);
  return `${day.toFixed(0)} ${copy.dayUnit} / ${years.toFixed(1)} ${copy.yearUnit}`;
}

export function getRelationshipLabel(category, locale) {
  return getCopy(locale).relationship[category];
}

export function getActionLabel(action, locale) {
  return getCopy(locale).actions[action] ?? action;
}

export function getSystemInputPayload(simulationState, locale) {
  const keys = getCopy(locale).systemKeys;

  return {
    [keys.viewpoint]: getBodyName(simulationState.viewpoint, locale),
    [keys.earthPhase]: getPhaseLabel(simulationState.earthPhase, locale),
    [keys.distanceAu]: Number(simulationState.distanceAu.toFixed(3)),
    [keys.apparentSize]: getApparentSizeLabel(simulationState.apparentSizeArcseconds),
    [keys.userAction]: getActionLabel(simulationState.userAction, locale),
  };
}

export function getElongationLabel(degrees) {
  return `${Math.round(degrees)}°`;
}

export function getDocumentTitle(locale) {
  return locale === 'ja'
    ? 'GEO LEARNER | 太陽系の地球観察シミュレーター'
    : 'GEO LEARNER | Solar System Earth View Simulator';
}
