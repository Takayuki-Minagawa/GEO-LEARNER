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

export function getDocumentTitle(locale) {
  return locale === 'ja'
    ? 'GEO LEARNER | 太陽系の地球観察シミュレーター'
    : 'GEO LEARNER | Solar System Earth View Simulator';
}
