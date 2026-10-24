import { useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Billboard, Html, Line, Stars } from '@react-three/drei';
import * as THREE from 'three';
import {
  getBodyName,
  getCopy,
  getDistanceLabel,
  getElongationLabel,
  getPhaseLabel,
} from '../lib/i18n.js';
import Icon from './Icons.jsx';

// Kept as a live MediaQueryList so a change to the OS setting applies without a reload.
const reducedMotionQuery =
  typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;

// A softly pulsing ring that always faces the camera, used to point out the observer and Earth.
function Halo({ radius, color }) {
  const ringRef = useRef();

  useFrame(({ clock }) => {
    if (!ringRef.current) {
      return;
    }
    if (reducedMotionQuery?.matches) {
      ringRef.current.scale.setScalar(1);
      ringRef.current.material.opacity = 0.6;
      return;
    }
    const wave = (Math.sin(clock.elapsedTime * 2.4) + 1) / 2;
    ringRef.current.scale.setScalar(1 + wave * 0.35);
    ringRef.current.material.opacity = 0.75 - wave * 0.5;
  });

  return (
    <Billboard>
      <mesh ref={ringRef}>
        <ringGeometry args={[radius * 1.55, radius * 1.75, 48]} />
        <meshBasicMaterial color={color} transparent opacity={0.6} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
    </Billboard>
  );
}

function OrbitRing({ radius, color, opacity = 0.26 }) {
  const points = Array.from({ length: 129 }, (_, index) => {
    const angle = (index / 128) * Math.PI * 2;
    return [Math.cos(angle) * radius, 0, Math.sin(angle) * radius];
  });

  return <Line points={points} color={color} transparent opacity={opacity} lineWidth={1} />;
}

// How far the follow camera backs off so both the observer and Earth stay in frame.
function getFramingStrength(viewerDisplayPosition, earthDisplayPosition) {
  const separation = new THREE.Vector3(...viewerDisplayPosition).distanceTo(new THREE.Vector3(...earthDisplayPosition));
  return Math.min(Math.max(separation * 1.15, 3.8), 28);
}

// Portrait stages (phones) have a narrower horizontal field of view, so the camera backs off further.
function useAspectBoost() {
  const { size } = useThree();
  const aspect = size.width / Math.max(size.height, 1);
  return Math.min(Math.max(1.4 / aspect, 1), 2.4);
}

function SceneFog({ color, framingStrength, isOverviewMode }) {
  const boost = useAspectBoost();
  const near = (isOverviewMode ? 40 : 18 + framingStrength) * boost;
  const far = (isOverviewMode ? 90 : 30 + framingStrength * 2.5) * boost;
  // near/far as props update the existing fog instead of rebuilding it (and every fogged shader) each frame.
  return <fog attach="fog" args={[color]} near={near} far={far} />;
}

function BodyMarker({ body, label, isSelected, isEarth, showLabel, haloColor }) {
  const color = isEarth ? '#74d1ff' : body.color;
  const emissive = isEarth ? '#347dd8' : body.glow;
  const isSun = body.id === 'Sun';

  return (
    <group position={body.displayPosition}>
      <mesh>
        <sphereGeometry args={[body.renderRadius, 32, 32]} />
        <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={isSelected ? 1.5 : 0.55} />
      </mesh>

      {isSun && (
        <mesh>
          <sphereGeometry args={[body.renderRadius * 1.6, 32, 32]} />
          <meshBasicMaterial color={body.glow} transparent opacity={0.16} depthWrite={false} />
        </mesh>
      )}

      {(isSelected || isEarth) && <Halo radius={Math.max(body.renderRadius, 0.14)} color={haloColor} />}

      {(isSelected || isEarth || showLabel) && (
        <Html center zIndexRange={[1, 0]} pointerEvents="none" position={[0, body.renderRadius + 0.35, 0]}>
          <div className={`body-label${isSelected ? ' is-selected' : ''}${isEarth ? ' is-earth' : ''}`}>{label}</div>
        </Html>
      )}
    </group>
  );
}

function CameraManager({ viewerDisplayPosition, earthDisplayPosition, framingStrength, isOverviewMode }) {
  const { camera } = useThree();
  const boost = useAspectBoost();

  useFrame(() => {
    let desiredPosition;
    let lookTarget;

    if (isOverviewMode) {
      desiredPosition = new THREE.Vector3(8, 48, 12).multiplyScalar(boost);
      lookTarget = new THREE.Vector3(0, 0, 0);
    } else {
      const viewer = new THREE.Vector3(...viewerDisplayPosition);
      const earth = new THREE.Vector3(...earthDisplayPosition);
      lookTarget = viewer.clone().lerp(earth, 0.5);
      const offsetStrength = framingStrength * boost;
      desiredPosition = lookTarget.clone().add(new THREE.Vector3(offsetStrength * 0.9, offsetStrength * 0.7, offsetStrength * 1.1));
    }

    camera.position.lerp(desiredPosition, 0.06);
    camera.lookAt(lookTarget);
  });

  return null;
}

export default function SimulationCanvas({ simulationState, locale, theme, isOverviewMode, onToggleOverview }) {
  const copy = getCopy(locale);
  const earth = simulationState.sceneBodies.find((body) => body.id === 'Earth');
  const viewer = simulationState.sceneBodies.find((body) => body.id === simulationState.viewpoint.id);
  const viewpointName = getBodyName(simulationState.viewpoint, locale);
  const distanceLabel = getDistanceLabel(simulationState.distanceAu, locale);
  const phaseLabel = getPhaseLabel(simulationState.earthPhase, locale);
  const elongationLabel = getElongationLabel(simulationState.solarElongationDegrees);
  const framingStrength = getFramingStrength(viewer.displayPosition, earth.displayPosition);

  const scenePalette =
    theme === 'light'
      ? {
          background: '#dfeaf6',
          fog: '#dfeaf6',
          orbit: '#7f9db5',
          earthOrbit: '#3b84c6',
          sightline: '#2f74b0',
          pointLight: '#ffd7a6',
          viewerHalo: '#c9822a',
          earthHalo: '#2c86d6',
        }
      : {
          background: '#06111e',
          fog: '#06111e',
          orbit: '#b9d0de',
          earthOrbit: '#64b9ff',
          sightline: '#9ee2ff',
          pointLight: '#ffd38a',
          viewerHalo: '#ffd689',
          earthHalo: '#7fd0ff',
        };

  return (
    <section className="stage-panel" aria-label={copy.stageTitle(viewpointName)}>
      <div className="stage-hud stage-hud--top">
        <div className="stage-title">
          <div className="panel-kicker">{copy.stageKicker}</div>
          <h2 key={viewpointName} className="stage-title__heading">
            {copy.stageTitle(viewpointName)}
          </h2>
        </div>
        <button
          type="button"
          className={`hud-button${isOverviewMode ? ' is-active' : ''}`}
          onClick={onToggleOverview}
          aria-pressed={isOverviewMode}
          aria-label={isOverviewMode ? copy.hideOverview : copy.showOverview}
        >
          <Icon name={isOverviewMode ? 'focus' : 'orbit'} size={16} />
          <span>{isOverviewMode ? copy.hideOverview : copy.showOverview}</span>
        </button>
      </div>

      <div className="stage-hud stage-hud--bottom">
        <dl className="stage-stats">
          <div>
            <dt>{copy.distance}</dt>
            <dd>{distanceLabel}</dd>
          </div>
          <div>
            <dt>{copy.currentAppearance}</dt>
            <dd>{phaseLabel}</dd>
          </div>
          <div>
            <dt>{copy.elongation}</dt>
            <dd>{elongationLabel}</dd>
          </div>
        </dl>
        <ul className="stage-legend" aria-hidden="true">
          <li>
            <span className="legend-dot legend-dot--viewer" />
            {viewpointName}
          </li>
          <li>
            <span className="legend-dot legend-dot--earth" />
            {copy.celestial.earth}
          </li>
          <li>
            <span className="legend-line" />
            {locale === 'ja' ? '視線' : 'Sightline'}
          </li>
        </ul>
      </div>

      <div className="stage-canvas">
        <Canvas camera={{ position: [8, 6, 10], fov: 42 }} dpr={[1, 2]} aria-hidden="true">
          <color attach="background" args={[scenePalette.background]} />
          <SceneFog color={scenePalette.fog} framingStrength={framingStrength} isOverviewMode={isOverviewMode} />
          <ambientLight intensity={theme === 'light' ? 0.92 : 0.72} />
          <pointLight position={[0, 0, 0]} intensity={220} decay={2} distance={50} color={scenePalette.pointLight} />
          {theme === 'dark' && <Stars radius={100} depth={60} count={3500} factor={4} saturation={0} fade />}

          {simulationState.sceneBodies
            .filter((body) => !['Sun', 'Moon'].includes(body.id))
            .map((body) => (
              <OrbitRing key={body.id} radius={body.orbitRadiusDisplay} color={body.id === 'Earth' ? scenePalette.earthOrbit : scenePalette.orbit} />
            ))}

          <Line
            points={[viewer.displayPosition, earth.displayPosition]}
            color={scenePalette.sightline}
            transparent
            opacity={0.78}
            dashed
            dashScale={2.4}
            lineWidth={1.25}
          />

          {simulationState.sceneBodies.map((body) => (
            <BodyMarker
              key={body.id}
              body={body}
              label={getBodyName(body, locale)}
              isSelected={body.id === simulationState.viewpoint.id}
              isEarth={body.id === 'Earth'}
              showLabel={isOverviewMode && body.id !== 'Moon'}
              haloColor={body.id === 'Earth' ? scenePalette.earthHalo : scenePalette.viewerHalo}
            />
          ))}

          <CameraManager
            viewerDisplayPosition={viewer.displayPosition}
            earthDisplayPosition={earth.displayPosition}
            framingStrength={framingStrength}
            isOverviewMode={isOverviewMode}
          />
        </Canvas>
      </div>
    </section>
  );
}
