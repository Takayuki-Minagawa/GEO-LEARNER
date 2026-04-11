export function buildTutorContent(simulationState) {
  const { viewpoint, category, earthPhase, distanceLabel, apparentSizeLabel, solarElongationDegrees } =
    simulationState;
  const elongated = Math.round(solarElongationDegrees);

  let summary =
    `${viewpoint.nameJa}の視点では、地球の満ち欠けと太陽からの離れ方を同時に観察できます。`;
  let relationshipDetail = '';
  let prompt = '';

  if (category === 'outer') {
    summary =
      `${viewpoint.nameJa}から見る地球は **内惑星** のように振る舞い、太陽の近くを行き来しながら満ち欠けします。`;
    relationshipDetail =
      '外側の軌道から内側の地球を見るので、地球は真夜中の空には行かず、**最大離角**の範囲で見え方が変化します。';
    prompt =
      '時間を進めて、地球が太陽に最も近づく場面と最も離れる場面を比べてみましょう。明るさと位相がどう連動するかが観察のポイントです。';
  } else if (category === 'inner') {
    summary =
      `${viewpoint.nameJa}から見る地球は **外惑星** に近い見え方をし、満ちた地球や太陽と反対方向の配置も起こります。`;
    relationshipDetail =
      '地球の軌道が外側にあるため、地球は太陽から大きく離れて見えることがあり、**衝**に近い配置ではほぼ満地球になります。';
    prompt =
      'タイムラインを動かして、地球が太陽の反対側へ移る場面を探してみてください。太陽からの離角が大きいほど、どんな位相になるでしょうか。';
  } else {
    summary =
      `${viewpoint.nameJa}からは、地球が大きく見える母惑星となり、月から見た満ち欠けと地球から見た月の位相が反対になります。`;
    relationshipDetail =
      '月面では、地球はほぼ同じ空の位置に留まりつつ、**位相**だけがゆっくり変化します。月の満ち欠けと逆向きになる点に注目してください。';
    prompt =
      '時間を進めて、地球が満地球に近いときに、地球から見た月がどの位相になるか想像してみましょう。';
  }

  return {
    title: `${viewpoint.nameJa}の視点へようこそ`,
    summary,
    facts: [
      {
        icon: '🔭',
        label: '現在の見え方',
        text: `地球は **${earthPhase.japanese}** で、照らされている面は約 **${earthPhase.illuminatedPercent}%** です。`,
      },
      {
        icon: '📏',
        label: '距離感',
        text: `現在の地球までの距離は **${distanceLabel}**、視直径は **${apparentSizeLabel}** です。`,
      },
      {
        icon: '☀️',
        label: '太陽からの離れ方',
        text: `いま地球は太陽から約 **${elongated}°** 離れて見えます。${relationshipDetail}`,
      },
    ],
    prompt,
  };
}

export function buildQuiz(simulationState) {
  const { viewpoint, category } = simulationState;

  if (category === 'outer') {
    return {
      prompt: `現在、${viewpoint.nameJa}から地球を観察しています。${viewpoint.nameJa}から見て、地球が「真夜中の空（太陽の反対側）」に見えることはあるでしょうか？`,
      options: ['よくある', '軌道の位置によっては見える', '絶対に見えない'],
      correctIndex: 2,
      explanation:
        '地球は外側の惑星から見ると **内惑星** なので、太陽から大きく離れず、真夜中の空までは移動しません。地球から見た金星や水星と同じ考え方です。',
    };
  }

  if (category === 'inner') {
    return {
      prompt: `現在、${viewpoint.nameJa}から地球を観察しています。${viewpoint.nameJa}から見た地球が、ほぼ満ちた状態に見えることはあるでしょうか？`,
      options: ['ある', '半分までしか満ちない', '絶対にない'],
      correctIndex: 0,
      explanation:
        `地球は ${viewpoint.nameJa} より外側の軌道にあるので、**衝**に近い配置では太陽と反対方向に見え、ほぼ満地球になります。`,
    };
  }

  return {
    prompt: '月面から地球を見たとき、地球の満ち欠けは地球から見た月の満ち欠けとどのような関係になるでしょうか？',
    options: ['ほぼ同じになる', 'ほぼ反対になる', '関係はない'],
    correctIndex: 1,
    explanation:
      '月面から見える地球の位相は、地球から見える月の位相と **ほぼ反対** です。地球で新月のとき、月面では満地球に近く見えます。',
  };
}
