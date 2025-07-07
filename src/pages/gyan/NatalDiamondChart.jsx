import React from "react";
import { SIGNS, SIGN_SHORT, PLANET_LABELS_DIAMOND, calcNakshatraPada, getPlanetHouseMap } from "./astroUtils";
import NatalTable from "./NatalTable";

// Размер SVG и отступы
const SIZE = 320;
const PADDING = 24;
const CENTER = SIZE / 2;
const SQ = SIZE - 2 * PADDING;

// Углы квадрата: A — левый верхний, B — правый верхний, D — правый нижний, C — левый нижний
const A = [PADDING, PADDING];
const B = [SIZE - PADDING, PADDING];
const C = [PADDING, SIZE - PADDING];
const D = [SIZE - PADDING, SIZE - PADDING];

// Середины сторон
const S1 = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2];
const S2 = [(B[0] + D[0]) / 2, (B[1] + D[1]) / 2];
const S3 = [(D[0] + C[0]) / 2, (D[1] + C[1]) / 2];
const S4 = [(C[0] + A[0]) / 2, (C[1] + A[1]) / 2];

// Центр
const X = [CENTER, CENTER];

// Точки между углом и центром
const M1 = [(A[0] + X[0]) / 2, (A[1] + X[1]) / 2];
const M2 = [(B[0] + X[0]) / 2, (B[1] + X[1]) / 2];
const M3 = [(D[0] + X[0]) / 2, (D[1] + X[1]) / 2];
const M4 = [(C[0] + X[0]) / 2, (C[1] + X[1]) / 2];

// Пронумерованные полигоны домов против часовой стрелки
const housePolygons = [
  [S1, M1, X, M2],            // 1 верх (ромб — 4 угла)
  [A, S1, M1],                // 2 верх-лево (треугольник — 3 угла)
  [S4, A, M1],                // 3 лево-верх (треугольник — 3 угла)
  [M1, S4, M4, X],            // 4 лево (ромб — 4 угла)
  [S4, C, M4],                // 5 лево-низ (треугольник — 3 угла)
  [C, S3, M4],                // 6 низ-лево (треугольник — 3 угла)
  [M4, S3, M3, X],            // 7 низ (ромб — 4 угла)
  [D, S3, M3],                // 8 низ-право (треугольник — 3 угла)
  [S2, D, M3],                // 9 право-низ (треугольник — 3 угла)
  [M3, S2, M2, X],            // 10 право (ромб — 4 угла)
  [S2, B, M2],                // 11 право-верх (треугольник — 3 угла)
  [S1, B, M2],                // 12 верх-право (треугольник — 3 угла)
];

// Только один коэффициент для смещения: signOffset (от 0 до 1)
const houseLabelVertexMap = [
  { sign: 2, signOffset: 0.15 }, // 1 (ромб)
  { sign: 2, signOffset: 0.25 }, // 2 (треуг)
  { sign: 2, signOffset: 0.30 }, // 3 (треуг)
  { sign: 3, signOffset: 0.20 }, // 4 (ромб)
  { sign: 2, signOffset: 0.30 }, // 5 (треуг)
  { sign: 2, signOffset: 0.35 }, // 6 (треуг)
  { sign: 3, signOffset: 0.25 }, // 7 (ромб)
  { sign: 2, signOffset: 0.35 }, // 8 (треуг)
  { sign: 2, signOffset: 0.30 }, // 9 (треуг)
  { sign: 3, signOffset: 0.21 }, // 10 (ромб)
  { sign: 2, signOffset: 0.30 }, // 11 (треуг)
  { sign: 2, signOffset: 0.25 }, // 12 (треуг)
];

// Функция для расчета положения знака по одному смещению
function getHouseLabelPositionsSignOnly(points, houseIdx) {
  const vertices = points.map(([x, y]) => ({ x, y }));
  const { cx, cy } = getPolygonCenter(points);

  const signVertexIdx = houseLabelVertexMap[houseIdx]?.sign ?? 1;
  const signOffset = houseLabelVertexMap[houseIdx]?.signOffset ?? 0.22;

  let vxSign = vertices[signVertexIdx];
  // Safety check for invalid index
  if (!vxSign) {
    vxSign = vertices[0];
  }
  const signX = vxSign.x + (cx - vxSign.x) * signOffset;
  const signY = vxSign.y + (cy - vxSign.y) * signOffset;

  return {
    sign: { x: signX, y: signY },
    center: { x: cx, y: cy },
  };
}

// Центр полигона
function getPolygonCenter(points) {
  const xs = points.map(([x]) => x);
  const ys = points.map(([, y]) => y);
  return {
    cx: xs.reduce((a, b) => a + b) / xs.length,
    cy: ys.reduce((a, b) => a + b) / xs.length,
  };
}

export default function NatalDiamondChart({ planets }) {
  if (!planets) return null;
  const ascSign = planets.ascendant?.sign || SIGNS[0];
  const ascSignIndex = SIGNS.indexOf(ascSign);
  const houseMap = getPlanetHouseMap(planets, ascSignIndex);

  function getHouseIndex(num) {
    return (num - 1 + 12) % 12;
  }

  // Индивидуальные вертикальные сдвиги знаков для проблемных домов (визуальное выравнивание)
  const customSignYShift = {
    2: 3,   // 3 дом (Во)
    3: 3, 
    4: 3,   // 4 дом (Ры)
    8: 3,   // 9 дом (Ле)
    9: 3,   // 10 дом
    10: 3,
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      gap: 20,
      marginTop: 18,
      minHeight: 0,
      flex: 1
    }}>
      <div style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} width="100%" height="auto" style={{ display: "block", height: "auto", width: "100%" }}>
          {/* Внешний квадрат */}
          <rect x={PADDING} y={PADDING} width={SQ} height={SQ}
            fill="none"
            stroke="#8B0000"
            strokeWidth={3}
          />
          {/* Диагонали */}
          <line x1={A[0]} y1={A[1]} x2={D[0]} y2={D[1]} stroke="#d88" strokeWidth={1.5}/>
          <line x1={B[0]} y1={B[1]} x2={C[0]} y2={C[1]} stroke="#d88" strokeWidth={1.5}/>
          {/* Дома */}
          {housePolygons.map((pts, i) => {
            const num = i + 1;
            const signIdx = (ascSignIndex + num - 1) % 12;
            let housePlanets = houseMap[getHouseIndex(num)] || [];

            // Убираем асцендент из первого дома (верхний ромб)
            if (i === 0) {
              housePlanets = housePlanets.filter(
                p => p !== "asc" && p !== "ascendant" && p !== "Asc" && p !== "Ascendant"
              );
            }

            const pointsAttr = pts.map(p => p.join(",")).join(" ");
            const pos = getHouseLabelPositionsSignOnly(pts, i);

            return (
              <g key={i}>
                <polygon
                  points={pointsAttr}
                  fill="#fbeeee"
                  stroke="#8B0000"
                  strokeWidth={2}
                />
                {/* Знак — выбранный угол */}
                <text
                  x={pos.sign.x}
                  y={pos.sign.y + (customSignYShift[i] || 0)}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  alignmentBaseline="middle"
                  fontWeight={700}
                  fontSize={10}
                  fontFamily="Arial, sans-serif"
                  fill="#8B0000"
                  style={{
                    pointerEvents: "none",
                    userSelect: "none",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    maxWidth: 28,
                  }}
                >
                  <tspan
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      maxWidth: 28,
                      display: "inline-block"
                    }}
                  >
                    {SIGN_SHORT[signIdx]}
                  </tspan>
                </text>
                {housePlanets.length > 0 && (
                  (housePlanets.length > 2 && [2, 4, 8, 10].includes(i)) ? (
                    // 3,5,9,11 дом — столбик
                    <text
                      x={pos.center.x}
                      y={pos.center.y - ((housePlanets.length - 1) * 10) / 2 + 3}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      alignmentBaseline="middle"
                      fontWeight={700}
                      fontSize={10}
                      fontFamily="Arial, sans-serif"
                      fill="#333"
                      stroke="#fff"
                      strokeWidth={1.5}
                      paintOrder="stroke"
                      strokeLinejoin="round"
                      style={{ pointerEvents: "none", userSelect: "none" }}
                    >
                      {housePlanets.map((p, idx) => (
                        <tspan
                          x={pos.center.x}
                          dy={idx === 0 ? 0 : 14}
                          key={p}
                        >
                          {PLANET_LABELS_DIAMOND[p]}
                          {planets[p]?.retrograde === true && (
                            <tspan
                              style={{
                                fontSize: "10px",
                                fill: "#d2691e",
                                fontWeight: 800,
                                letterSpacing: 1
                              }}
                            >Р</tspan>
                          )}
                        </tspan>
                      ))}
                    </text>
                  ) : (
                    // остальные дома — в строку
                    <text
                      x={pos.center.x}
                      y={pos.center.y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      alignmentBaseline="middle"
                      fontWeight={700}
                      fontSize={housePlanets.length > 2 ? 10 : 12}
                      fontFamily="Arial, sans-serif"
                      fill="#333"
                      stroke="#fff"
                      strokeWidth={1.5}
                      paintOrder="stroke"
                      strokeLinejoin="round"
                      style={{ pointerEvents: "none", userSelect: "none" }}
                    >
                      {housePlanets.map((p, idx) => (
                        <tspan key={p}>
                          {PLANET_LABELS_DIAMOND[p]}
                          {planets[p]?.retrograde === true && (
                            <tspan
                              style={{
                                fontSize: "10px",
                                fill: "#d2691e",
                                fontWeight: 800,
                                letterSpacing: 1
                              }}
                            >Р</tspan>
                          )}
                          {idx < housePlanets.length - 1 ? " " : ""}
                        </tspan>
                      ))}
                    </text>
                  )
                )}
              </g>
            );
          })}
        </svg>
      </div>
      {/* Таблица под натальной картой — всегда статична */}
      <NatalTable planets={planets} />
    </div>
  );
}
