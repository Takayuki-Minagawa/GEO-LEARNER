import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, Line, Stars } from '@react-three/drei';
import * as THREE from 'three';

function OrbitRing({ radius, color, opacity = 0.26 }) {
  const points = Array.from({ length: 129 }, (_, index) => {
    const angle = (index / 128) * Math.PI * 2;
    return [Math.cos(angle) * radius, 0, Math.sin(angle) * radius];
  });

  return <Line points={points} color={color} transparent opacity={opacity} lineWidth={1} />;
}

function BodyMarker({ body, isSelected, isEarth }) {
  const color = isEarth ? '#74d1ff' : body.color;
  const emissive = isEarth ? '#347dd8' : body.glow;

  return (
    <group position={body.displayPosition}>
      <mesh>
        <sphereGeometry args={[body.renderRadius, 32, 32]} />
        <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={isSelected ? 1.5 : 0.55} />
      </mesh>

      {(isSelected || isEarth) && (
        <Html distanceFactor={12} center position={[0, body.renderRadius + 0.35, 0]}>
          <div className={`body-label${isSelected ? ' is-selected' : ''}`}>{body.nameJa}</div>
        </Html>
      )}
    </group>
  );
}

function CameraManager({ viewerDisplayPosition, earthDisplayPosition, distanceAu }) {
  const { camera } = useThree();

  useFrame(() => {
    const viewer = new THREE.Vector3(...viewerDisplayPosition);
    const earth = new THREE.Vector3(...earthDisplayPosition);
    const midpoint = viewer.clone().lerp(earth, 0.5);
    const offsetStrength = Math.min(Math.max(distanceAu * 1.35, 3.8), 15);
    const desiredPosition = midpoint.clone().add(new THREE.Vector3(offsetStrength * 0.9, offsetStrength * 0.7, offsetStrength * 1.1));

    camera.position.lerp(desiredPosition, 0.06);
    camera.lookAt(midpoint);
  });

  return null;
}

function EarthInset({ simulationState }) {
  const { earthPhase, distanceLabel, apparentSizeLabel } = simulationState;
  const phaseShift = (0.5 - earthPhase.illuminatedFraction) * 110;
  const shadowDirection = earthPhase.waxing ? 1 : -1;

  return (
    <div className="earth-inset">
      <div className="earth-inset__header">
        <div>
          <strong>Earth Inset</strong>
          <span>{earthPhase.label}</span>
        </div>
        <div className="earth-inset__meta">
          <span>{distanceLabel}</span>
          <span>{apparentSizeLabel}</span>
        </div>
      </div>

      <div className="earth-disc">
        <div className="earth-disc__ocean" />
        <div className="earth-disc__clouds" />
        <div
          className="earth-disc__shadow"
          style={{
            transform: `translateX(${phaseShift * shadowDirection}px)`,
            opacity: Math.min(0.96, 0.35 + (1 - earthPhase.illuminatedFraction)),
          }}
        />
      </div>
    </div>
  );
}

export default function SimulationCanvas({ simulationState }) {
  const earth = simulationState.sceneBodies.find((body) => body.id === 'Earth');
  const viewer = simulationState.sceneBodies.find((body) => body.id === simulationState.viewpoint.id);

  return (
    <section className="stage-panel">
      <div className="stage-panel__topline">
        <div>
          <div className="panel-kicker">SOLAR SYSTEM VIEW SIMULATOR</div>
          <h2>{simulationState.viewpoint.nameJa}から見た地球</h2>
        </div>
        <div className="stage-panel__stats">
          <span>{simulationState.distanceLabel}</span>
          <span>{simulationState.earthPhase.label}</span>
        </div>
      </div>

      <div className="stage-canvas">
        <Canvas camera={{ position: [8, 6, 10], fov: 42 }}>
          <color attach="background" args={['#06111e']} />
          <fog attach="fog" args={['#06111e', 18, 42]} />
          <ambientLight intensity={0.72} />
          <pointLight position={[0, 0, 0]} intensity={220} decay={2} distance={50} color="#ffd38a" />
          <Stars radius={100} depth={60} count={3500} factor={4} saturation={0} fade />

          {simulationState.sceneBodies
            .filter((body) => !['Sun', 'Moon'].includes(body.id))
            .map((body) => (
              <OrbitRing key={body.id} radius={body.orbitRadiusDisplay} color={body.id === 'Earth' ? '#64b9ff' : '#b9d0de'} />
            ))}

          <Line
            points={[viewer.displayPosition, earth.displayPosition]}
            color="#9ee2ff"
            transparent
            opacity={0.75}
            dashed
            dashScale={2.4}
            lineWidth={1.25}
          />

          {simulationState.sceneBodies.map((body) => (
            <BodyMarker
              key={body.id}
              body={body}
              isSelected={body.id === simulationState.viewpoint.id}
              isEarth={body.id === 'Earth'}
            />
          ))}

          <CameraManager
            viewerDisplayPosition={viewer.displayPosition}
            earthDisplayPosition={earth.displayPosition}
            distanceAu={simulationState.distanceAu}
          />
        </Canvas>

        <EarthInset simulationState={simulationState} />
      </div>
    </section>
  );
}
