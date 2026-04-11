import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, Line, Stars } from '@react-three/drei';
import * as THREE from 'three';
import {
  getBodyName,
  getCopy,
  getDistanceLabel,
  getPhaseLabel,
} from '../lib/i18n.js';

function OrbitRing({ radius, color, opacity = 0.26 }) {
  const points = Array.from({ length: 129 }, (_, index) => {
    const angle = (index / 128) * Math.PI * 2;
    return [Math.cos(angle) * radius, 0, Math.sin(angle) * radius];
  });

  return <Line points={points} color={color} transparent opacity={opacity} lineWidth={1} />;
}

function BodyMarker({ body, label, isSelected, isEarth, showLabel }) {
  const color = isEarth ? '#74d1ff' : body.color;
  const emissive = isEarth ? '#347dd8' : body.glow;

  return (
    <group position={body.displayPosition}>
      <mesh>
        <sphereGeometry args={[body.renderRadius, 32, 32]} />
        <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={isSelected ? 1.5 : 0.55} />
      </mesh>

      {(isSelected || isEarth || showLabel) && (
        <Html distanceFactor={isSelected || isEarth ? 12 : 18} center position={[0, body.renderRadius + 0.35, 0]}>
          <div className={`body-label${isSelected ? ' is-selected' : ''}`}>{label}</div>
        </Html>
      )}
    </group>
  );
}

function CameraManager({ viewerDisplayPosition, earthDisplayPosition, distanceAu, isOverviewMode }) {
  const { camera } = useThree();

  useFrame(() => {
    let desiredPosition;
    let lookTarget;

    if (isOverviewMode) {
      desiredPosition = new THREE.Vector3(8, 48, 12);
      lookTarget = new THREE.Vector3(0, 0, 0);
    } else {
      const viewer = new THREE.Vector3(...viewerDisplayPosition);
      const earth = new THREE.Vector3(...earthDisplayPosition);
      lookTarget = viewer.clone().lerp(earth, 0.5);
      const offsetStrength = Math.min(Math.max(distanceAu * 1.35, 3.8), 15);
      desiredPosition = lookTarget.clone().add(new THREE.Vector3(offsetStrength * 0.9, offsetStrength * 0.7, offsetStrength * 1.1));
    }

    camera.position.lerp(desiredPosition, 0.06);
    camera.lookAt(lookTarget);
  });

  return null;
}

export default function SimulationCanvas({ simulationState, locale, theme, isOverviewMode }) {
  const copy = getCopy(locale);
  const earth = simulationState.sceneBodies.find((body) => body.id === 'Earth');
  const viewer = simulationState.sceneBodies.find((body) => body.id === simulationState.viewpoint.id);
  const viewpointName = getBodyName(simulationState.viewpoint, locale);
  const distanceLabel = getDistanceLabel(simulationState.distanceAu, locale);
  const phaseLabel = getPhaseLabel(simulationState.earthPhase, locale);

  const scenePalette =
    theme === 'light'
      ? {
          background: '#dfeaf6',
          fog: '#dfeaf6',
          orbit: '#7f9db5',
          earthOrbit: '#3b84c6',
          sightline: '#2f74b0',
          pointLight: '#ffd7a6',
        }
      : {
          background: '#06111e',
          fog: '#06111e',
          orbit: '#b9d0de',
          earthOrbit: '#64b9ff',
          sightline: '#9ee2ff',
          pointLight: '#ffd38a',
        };

  return (
    <section className="stage-panel">
      <div className="stage-panel__topline">
        <div>
          <div className="panel-kicker">{copy.stageKicker}</div>
          <h2>{copy.stageTitle(viewpointName)}</h2>
        </div>
        <div className="stage-panel__stats">
          <span>{distanceLabel}</span>
          <span>{phaseLabel}</span>
        </div>
      </div>

      <div className="stage-canvas">
        <Canvas camera={{ position: [8, 6, 10], fov: 42 }}>
          <color attach="background" args={[scenePalette.background]} />
          <fog attach="fog" args={[scenePalette.fog, isOverviewMode ? 40 : 18, isOverviewMode ? 90 : 42]} />
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
            />
          ))}

          <CameraManager
            viewerDisplayPosition={viewer.displayPosition}
            earthDisplayPosition={earth.displayPosition}
            distanceAu={simulationState.distanceAu}
            isOverviewMode={isOverviewMode}
          />
        </Canvas>
      </div>
    </section>
  );
}
