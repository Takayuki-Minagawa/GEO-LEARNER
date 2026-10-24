import { BODY_CONFIG, SCENE_BODY_IDS } from '../data/celestialBodies.js';

const AU_IN_KM = 149_597_870.7;
const EARTH_DIAMETER_KM = 12_742;

function degToRad(degrees) {
  return (degrees * Math.PI) / 180;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function add(a, b) {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

function subtract(a, b) {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function scale(vector, factor) {
  return [vector[0] * factor, vector[1] * factor, vector[2] * factor];
}

function length(vector) {
  return Math.hypot(vector[0], vector[1], vector[2]);
}

function normalize(vector) {
  const size = length(vector);
  if (!size) {
    return [0, 0, 0];
  }
  return scale(vector, 1 / size);
}

function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function angleBetween(a, b) {
  const normalizedA = normalize(a);
  const normalizedB = normalize(b);
  return Math.acos(clamp(dot(normalizedA, normalizedB), -1, 1));
}

function getOrbitalAngle(body, day) {
  if (!body.orbitalPeriodDays) {
    return 0;
  }
  return degToRad(body.initialAngleDeg) + (day / body.orbitalPeriodDays) * Math.PI * 2;
}

// +y is ecliptic north; orbits run counter-clockwise seen from +y (prograde), so z = -r·sin.
function getPlanetPosition(body, day) {
  const angle = getOrbitalAngle(body, day);
  const x = body.orbitRadiusAu * Math.cos(angle);
  const z = -body.orbitRadiusAu * Math.sin(angle);
  const y = Math.sin(angle * 0.65) * body.inclination;
  return [x, y, z];
}

export function getBodyPosition(bodyId, day) {
  if (bodyId === 'Sun') {
    return [0, 0, 0];
  }

  const body = BODY_CONFIG[bodyId];

  if (body.parentId === 'Earth') {
    const earthPosition = getBodyPosition('Earth', day);
    const angle = getOrbitalAngle(body, day);
    // Tilt the orbital plane instead of adding a vertical offset, so the distance to Earth stays constant.
    const tilt = degToRad(body.orbitTiltDeg);
    const localOffset = [
      body.orbitRadiusAu * Math.cos(angle),
      body.orbitRadiusAu * Math.sin(angle) * Math.sin(tilt),
      -body.orbitRadiusAu * Math.sin(angle) * Math.cos(tilt),
    ];
    return add(earthPosition, localOffset);
  }

  return getPlanetPosition(body, day);
}

function mapRadialDistanceToDisplay(radiusAu) {
  if (radiusAu <= 0) {
    return 0;
  }
  return Math.log2(radiusAu + 1) * 4.4;
}

function mapVectorToDisplay(vectorAu) {
  const [x, y, z] = vectorAu;
  const radius = Math.hypot(x, z);

  if (!radius) {
    return [0, 0, 0];
  }

  const displayRadius = mapRadialDistanceToDisplay(radius);
  const scaleFactor = displayRadius / radius;
  return [x * scaleFactor, y * 5.8, z * scaleFactor];
}

function getMoonDisplayPosition(day, displayPositions) {
  const earthDisplayPosition = displayPositions.Earth;
  const moonBody = BODY_CONFIG.Moon;
  const angle = getOrbitalAngle(moonBody, day);
  const tilt = degToRad(moonBody.orbitTiltDeg);
  const offset = [
    Math.cos(angle) * 0.92,
    Math.sin(angle) * 0.92 * Math.sin(tilt),
    -Math.sin(angle) * 0.92 * Math.cos(tilt),
  ];
  return add(earthDisplayPosition, offset);
}

function formatDistance(distanceAu) {
  if (distanceAu < 0.01) {
    return `${Math.round(distanceAu * AU_IN_KM).toLocaleString('ja-JP')} km`;
  }

  const digits = distanceAu < 1 ? 3 : 2;
  return `${distanceAu.toFixed(digits)} AU`;
}

function getAngularDiameterArcseconds(distanceAu) {
  const angularDiameterRadians = EARTH_DIAMETER_KM / (distanceAu * AU_IN_KM);
  return (angularDiameterRadians * 180 * 3600) / Math.PI;
}

function formatAngularSize(arcseconds) {
  if (arcseconds >= 3600) {
    return `${(arcseconds / 3600).toFixed(2)}°`;
  }

  if (arcseconds >= 60) {
    return `${(arcseconds / 60).toFixed(1)}′`;
  }

  return `${arcseconds.toFixed(1)}″`;
}

function getPhaseName(illuminatedFraction, waxing) {
  const percent = illuminatedFraction * 100;

  if (percent < 3) {
    return { english: 'New', japanese: '新地球' };
  }
  if (percent < 35) {
    return waxing
      ? { english: 'Waxing Crescent', japanese: '満ちていく三日月' }
      : { english: 'Waning Crescent', japanese: '欠けていく三日月' };
  }
  if (percent < 65) {
    return waxing
      ? { english: 'First Quarter', japanese: '上弦に近い半地球' }
      : { english: 'Last Quarter', japanese: '下弦に近い半地球' };
  }
  if (percent < 97) {
    return waxing
      ? { english: 'Waxing Gibbous', japanese: '満ちていく凸地球' }
      : { english: 'Waning Gibbous', japanese: '欠けていく凸地球' };
  }

  return { english: 'Full', japanese: '満地球' };
}

export function getObservationCategory(viewpointId) {
  if (viewpointId === 'Moon') {
    return 'satellite';
  }

  return BODY_CONFIG[viewpointId].orbitRadiusAu < BODY_CONFIG.Earth.orbitRadiusAu
    ? 'inner'
    : 'outer';
}

function getPhaseState(viewerPosition, earthPosition, day, viewpointId) {
  const toSun = subtract([0, 0, 0], earthPosition);
  const toViewer = subtract(viewerPosition, earthPosition);
  const phaseAngle = angleBetween(toSun, toViewer);
  const illuminatedFraction = (1 + Math.cos(phaseAngle)) / 2;

  const nextViewerPosition = getBodyPosition(viewpointId, day + 1.5);
  const nextEarthPosition = getBodyPosition('Earth', day + 1.5);
  const nextToSun = subtract([0, 0, 0], nextEarthPosition);
  const nextToViewer = subtract(nextViewerPosition, nextEarthPosition);
  const nextPhaseAngle = angleBetween(nextToSun, nextToViewer);
  const nextIlluminatedFraction = (1 + Math.cos(nextPhaseAngle)) / 2;
  const waxing = nextIlluminatedFraction >= illuminatedFraction;
  const phaseName = getPhaseName(illuminatedFraction, waxing);
  const illuminatedPercent = Math.round(illuminatedFraction * 100);

  return {
    illuminatedFraction,
    illuminatedPercent,
    waxing,
    phaseAngleDegrees: (phaseAngle * 180) / Math.PI,
    label: `${illuminatedPercent}% ${phaseName.english}`,
    english: phaseName.english,
    japanese: phaseName.japanese,
  };
}

export function buildScene(day) {
  const actualPositions = {};
  const displayPositions = {};

  for (const bodyId of SCENE_BODY_IDS) {
    if (bodyId !== 'Moon') {
      actualPositions[bodyId] = getBodyPosition(bodyId, day);
      displayPositions[bodyId] = mapVectorToDisplay(actualPositions[bodyId]);
    }
  }

  actualPositions.Moon = getBodyPosition('Moon', day);
  displayPositions.Moon = getMoonDisplayPosition(day, displayPositions);

  return SCENE_BODY_IDS.map((bodyId) => {
    const body = BODY_CONFIG[bodyId];
    const actualPosition = actualPositions[bodyId];
    const displayPosition = displayPositions[bodyId];
    const orbitRadiusDisplay =
      bodyId === 'Moon' ? 0.92 : mapRadialDistanceToDisplay(body.orbitRadiusAu);

    return {
      ...body,
      actualPosition,
      displayPosition,
      orbitRadiusDisplay,
      orbitAngle: Math.atan2(actualPosition[2], actualPosition[0]),
    };
  });
}

export function getSimulationState(viewpointId, day, userAction) {
  const sceneBodies = buildScene(day);
  const byId = Object.fromEntries(sceneBodies.map((body) => [body.id, body]));
  const viewpoint = BODY_CONFIG[viewpointId];
  const viewerPosition = byId[viewpointId].actualPosition;
  const earthPosition = byId.Earth.actualPosition;
  const sunPosition = byId.Sun.actualPosition;
  const distanceAu = length(subtract(earthPosition, viewerPosition));
  const angularDiameterArcseconds = getAngularDiameterArcseconds(distanceAu);
  const phase = getPhaseState(viewerPosition, earthPosition, day, viewpointId);
  const solarElongationDegrees =
    (angleBetween(subtract(sunPosition, viewerPosition), subtract(earthPosition, viewerPosition)) *
      180) /
    Math.PI;
  const category = getObservationCategory(viewpointId);

  return {
    sceneBodies,
    viewpoint,
    viewerPosition,
    earthPosition,
    sunPosition,
    category,
    day,
    userAction,
    distanceAu,
    distanceLabel: formatDistance(distanceAu),
    apparentSizeArcseconds: angularDiameterArcseconds,
    apparentSizeLabel: formatAngularSize(angularDiameterArcseconds),
    solarElongationDegrees,
    earthPhase: phase,
    earthOrbitalAngle: byId.Earth.orbitAngle,
    viewpointOrbitalAngle: byId[viewpointId].orbitAngle,
    relationshipLabel:
      category === 'outer'
        ? '地球は内惑星として見える'
        : category === 'inner'
          ? '地球は外惑星として見える'
          : '地球は母惑星として見える',
  };
}
