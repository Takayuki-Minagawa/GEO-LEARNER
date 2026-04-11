import {
  getApparentSizeLabel,
  getBodyName,
  getCopy,
  getDistanceLabel,
  getPhaseLabel,
} from './i18n.js';

export function buildTutorContent(simulationState, locale = 'ja') {
  const copy = getCopy(locale);
  const viewpointName = getBodyName(simulationState.viewpoint, locale);
  const phaseLabel = getPhaseLabel(simulationState.earthPhase, locale);
  const distanceLabel = getDistanceLabel(simulationState.distanceAu, locale);
  const apparentSizeLabel = getApparentSizeLabel(simulationState.apparentSizeArcseconds);
  const elongated = Math.round(simulationState.solarElongationDegrees);

  let summary = '';
  let relationshipDetail = '';
  let prompt = '';

  if (locale === 'ja') {
    if (simulationState.category === 'outer') {
      summary = `${viewpointName}から見る地球は **内惑星** のように振る舞い、太陽の近くを行き来しながら満ち欠けします。`;
      relationshipDetail = '外側の軌道から内側の地球を見るので、地球は真夜中の空には行かず、**最大離角**の範囲で見え方が変化します。';
      prompt = '時間を進めて、地球が太陽に最も近づく場面と最も離れる場面を比べてみましょう。明るさと位相がどう連動するかが観察のポイントです。';
    } else if (simulationState.category === 'inner') {
      summary = `${viewpointName}から見る地球は **外惑星** に近い見え方をし、満ちた地球や太陽と反対方向の配置も起こります。`;
      relationshipDetail = '地球の軌道が外側にあるため、地球は太陽から大きく離れて見えることがあり、**衝**に近い配置ではほぼ満地球になります。';
      prompt = 'タイムラインを動かして、地球が太陽の反対側へ移る場面を探してみてください。太陽からの離角が大きいほど、どんな位相になるでしょうか。';
    } else {
      summary = `${viewpointName}からは、地球が大きく見える母惑星となり、月から見た満ち欠けと地球から見た月の位相が反対になります。`;
      relationshipDetail = '月面では、地球はほぼ同じ空の位置に留まりつつ、**位相**だけがゆっくり変化します。月の満ち欠けと逆向きになる点に注目してください。';
      prompt = '時間を進めて、地球が満地球に近いときに、地球から見た月がどの位相になるか想像してみましょう。';
    }

    return {
      title: `${viewpointName}の視点へようこそ`,
      summary,
      facts: [
        {
          icon: '🔭',
          label: copy.currentAppearance,
          text: `地球は **${phaseLabel}** で、照らされている面は約 **${simulationState.earthPhase.illuminatedPercent}%** です。`,
        },
        {
          icon: '📏',
          label: copy.distanceSense,
          text: `現在の地球までの距離は **${distanceLabel}**、視直径は **${apparentSizeLabel}** です。`,
        },
        {
          icon: '☀️',
          label: copy.solarRelation,
          text: `いま地球は太陽から約 **${elongated}°** 離れて見えます。${relationshipDetail}`,
        },
      ],
      prompt,
    };
  }

  if (simulationState.category === 'outer') {
    summary = `From ${viewpointName}, Earth behaves like an **inferior planet**, staying near the Sun while its phase changes.`;
    relationshipDetail = 'Because the observer is outside Earth’s orbit, Earth never reaches the midnight sky and remains limited by its **maximum elongation**.';
    prompt = 'Advance time and compare the moments when Earth sits closest to the Sun and farthest from it. Notice how brightness and phase change together.';
  } else if (simulationState.category === 'inner') {
    summary = `From ${viewpointName}, Earth looks more like a **superior planet**, so it can appear nearly full and also move far from the Sun.`;
    relationshipDetail = 'Since Earth’s orbit lies outside the observer, Earth can move to large angular separations and appear almost full near **opposition**.';
    prompt = 'Slide the timeline until Earth moves to the far side of the sky from the Sun. What kind of phase do you expect when the elongation becomes large?';
  } else {
    summary = `From ${viewpointName}, Earth becomes the large parent world, and its phase is nearly the reverse of the Moon’s phase seen from Earth.`;
    relationshipDetail = 'On the lunar surface, Earth stays in nearly the same part of the sky while its **phase** slowly changes in the opposite sense of the Moon seen from Earth.';
    prompt = 'Advance time and compare Earth’s phase with the Moon’s phase as seen from Earth. Watch for the reversal between full Earth and new Moon.';
  }

  return {
    title: `Welcome to the ${viewpointName} viewpoint`,
    summary,
    facts: [
      {
        icon: '🔭',
        label: copy.currentAppearance,
        text: `Earth is currently **${phaseLabel}**, with about **${simulationState.earthPhase.illuminatedPercent}%** of its disk illuminated.`,
      },
      {
        icon: '📏',
        label: copy.distanceSense,
        text: `Earth is **${distanceLabel}** away right now, and its apparent diameter is **${apparentSizeLabel}**.`,
      },
      {
        icon: '☀️',
        label: copy.solarRelation,
        text: `Earth is now seen about **${elongated}°** from the Sun. ${relationshipDetail}`,
      },
    ],
    prompt,
  };
}

export function buildQuiz(simulationState, locale = 'ja') {
  const viewpointName = getBodyName(simulationState.viewpoint, locale);

  if (locale === 'ja') {
    if (simulationState.category === 'outer') {
      return {
        prompt: `現在、${viewpointName}から地球を観察しています。${viewpointName}から見て、地球が「真夜中の空（太陽の反対側）」に見えることはあるでしょうか？`,
        options: ['よくある', '軌道の位置によっては見える', '絶対に見えない'],
        correctIndex: 2,
        explanation: '地球は外側の惑星から見ると **内惑星** なので、太陽から大きく離れず、真夜中の空までは移動しません。地球から見た金星や水星と同じ考え方です。',
      };
    }

    if (simulationState.category === 'inner') {
      return {
        prompt: `現在、${viewpointName}から地球を観察しています。${viewpointName}から見た地球が、ほぼ満ちた状態に見えることはあるでしょうか？`,
        options: ['ある', '半分までしか満ちない', '絶対にない'],
        correctIndex: 0,
        explanation: `地球は ${viewpointName} より外側の軌道にあるので、**衝**に近い配置では太陽と反対方向に見え、ほぼ満地球になります。`,
      };
    }

    return {
      prompt: '月面から地球を見たとき、地球の満ち欠けは地球から見た月の満ち欠けとどのような関係になるでしょうか？',
      options: ['ほぼ同じになる', 'ほぼ反対になる', '関係はない'],
      correctIndex: 1,
      explanation: '月面から見える地球の位相は、地球から見える月の位相と **ほぼ反対** です。地球で新月のとき、月面では満地球に近く見えます。',
    };
  }

  if (simulationState.category === 'outer') {
    return {
      prompt: `You are observing Earth from ${viewpointName}. Can Earth ever appear in the midnight sky, opposite the Sun, from this viewpoint?`,
      options: ['Yes, very often', 'Yes, in some orbital configurations', 'No, never'],
      correctIndex: 2,
      explanation: 'From an outer planet, Earth behaves like an **inferior planet**, so it stays relatively close to the Sun and never reaches the midnight sky. The same logic applies to Venus and Mercury as seen from Earth.',
    };
  }

  if (simulationState.category === 'inner') {
    return {
      prompt: `You are observing Earth from ${viewpointName}. Can Earth ever appear almost fully illuminated from this viewpoint?`,
      options: ['Yes', 'No, it can only reach half phase', 'No, never'],
      correctIndex: 0,
      explanation: `Because Earth orbits outside ${viewpointName}, it can lie nearly opposite the Sun in the sky and appear close to full near **opposition**.`,
    };
  }

  return {
    prompt: 'When Earth is viewed from the Moon, how does Earth’s phase compare with the Moon’s phase seen from Earth?',
    options: ['They are almost the same', 'They are almost opposite', 'There is no clear relation'],
    correctIndex: 1,
    explanation: 'Earth’s phase seen from the Moon is **almost the opposite** of the Moon’s phase seen from Earth. Near new Moon on Earth, the Moon-side observer sees a nearly full Earth.',
  };
}
