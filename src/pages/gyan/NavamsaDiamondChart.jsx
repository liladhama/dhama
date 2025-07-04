import React from "react";
import { SIGNS, SIGN_SHORT, PLANET_LABELS_DIAMOND, calcNakshatraPada, getPlanetHouseMap } from "./astroUtils";

// Копия структуры из NatalDiamondChart, но для D9 (Навамша)
// Ожидает проп planetsD9 (аналогично planets, но для дробной карты)
const SIZE = 320;
const PADDING = 24;
const CENTER = SIZE / 2;
const SQ = SIZE - 2 * PADDING;
const A = [PADDING, PADDING];
const B = [SIZE - PADDING, PADDING];
const C = [PADDING, SIZE - PADDING];
const D = [SIZE - PADDING, SIZE - PADDING];
const S1 = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2];
const S2 = [(B[0] + D[0]) / 2, (B[1] + D[1]) / 2];
const S3 = [(D[0] + C[0]) / 2, (D[1] + C[1]) / 2];
const S4 = [(C[0] + A[0]) / 2, (C[1] + A[1]) / 2];
const X = [CENTER, CENTER];
const M1 = [(A[0] + X[0]) / 2, (A[1] + X[1]) / 2];
const M2 = [(B[0] + X[0]) / 2, (B[1] + X[1]) / 2];
const M3 = [(D[0] + X[0]) / 2, (D[1] + X[1]) / 2];
const M4 = [(C[0] + X[0]) / 2, (C[1] + X[1]) / 2];
const housePolygons = [
  [S1, M1, X, M2], [A, S1, M1], [S4, A, M1], [M1, S4, M4, X], [S4, C, M4], [C, S3, M4],
  [M4, S3, M3, X], [D, S3, M3], [S2, D, M3], [M3, S2, M2, X], [S2, B, M2], [S1, B, M2],
];
const houseLabelVertexMap = [
  { sign: 2, signOffset: 0.15 }, { sign: 2, signOffset: 0.25 }, { sign: 2, signOffset: 0.30 },
  { sign: 3, signOffset: 0.20 }, { sign: 2, signOffset: 0.30 }, { sign: 2, signOffset: 0.35 },
  { sign: 3, signOffset: 0.25 }, { sign: 2, signOffset: 0.35 }, { sign: 2, signOffset: 0.30 },
  { sign: 3, signOffset: 0.21 }, { sign: 2, signOffset: 0.30 }, { sign: 2, signOffset: 0.25 },
];
function getHouseLabelPositionsSignOnly(points, houseIdx) {
  const vertices = points.map(([x, y]) => ({ x, y }));
  const { cx, cy } = getPolygonCenter(points);
  const signVertexIdx = houseLabelVertexMap[houseIdx]?.sign ?? 1;
  const signOffset = houseLabelVertexMap[houseIdx]?.signOffset ?? 0.22;
  let vxSign = vertices[signVertexIdx];
  if (!vxSign) { vxSign = vertices[0]; }
  const signX = vxSign.x + (cx - vxSign.x) * signOffset;
  const signY = vxSign.y + (cy - vxSign.y) * signOffset;
  return { sign: { x: signX, y: signY }, center: { x: cx, y: cy } };
}
function getPolygonCenter(points) {
  const xs = points.map(([x]) => x);
  const ys = points.map(([, y]) => y);
  return {
    cx: xs.reduce((a, b) => a + b) / xs.length,
    cy: ys.reduce((a, b) => a + b) / xs.length,
  };
}
export default function NavamsaDiamondChart({ planetsD9 }) {
  if (!planetsD9) return null;
  const ascSign = planetsD9.ascendant?.sign || SIGNS[0];
  const ascSignIndex = SIGNS.indexOf(ascSign);
  const houseMap = getPlanetHouseMap(planetsD9, ascSignIndex);
  function getHouseIndex(num) { return (num - 1 + 12) % 12; }
  // ...остальной рендеринг аналогично NatalDiamondChart...
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, marginTop: 18 }}>
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} width={SIZE} height={SIZE} style={{ display: "block" }}>
        <rect x={PADDING} y={PADDING} width={SQ} height={SQ} fill="none" stroke="#8B0000" strokeWidth={3} />
        <line x1={A[0]} y1={A[1]} x2={D[0]} y2={D[1]} stroke="#d88" strokeWidth={1.5}/>
        <line x1={B[0]} y1={B[1]} x2={C[0]} y2={C[1]} stroke="#d88" strokeWidth={1.5}/>
        {housePolygons.map((pts, i) => {
          const num = i + 1;
          const signIdx = (ascSignIndex + num - 1) % 12;
          let housePlanets = houseMap[getHouseIndex(num)] || [];
          if (i === 0) {
            housePlanets = housePlanets.filter(
              p => p !== "asc" && p !== "ascendant" && p !== "Asc" && p !== "Ascendant"
            );
          }
          const pointsAttr = pts.map(p => p.join(",")).join(" ");
          const pos = getHouseLabelPositionsSignOnly(pts, i);
          return (
            <g key={i}>
              <polygon points={pointsAttr} fill="#eef7fb" stroke="#8B0000" strokeWidth={2} />
              <text x={pos.sign.x} y={pos.sign.y} textAnchor="middle" dominantBaseline="middle" alignmentBaseline="middle" fontWeight={700} fontSize={10} fontFamily="Arial, sans-serif" fill="#1e5a8b" style={{ pointerEvents: "none", userSelect: "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 28 }}>
                <tspan style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 28, display: "inline-block" }}>
                  {SIGN_SHORT[signIdx]}
                </tspan>
              </text>
              {housePlanets.length > 0 && (
                (housePlanets.length > 2 && [2, 4, 8, 10].includes(i)) ? (
                  <text x={pos.center.x} y={pos.center.y - ((housePlanets.length - 1) * 10) / 2 + 3} textAnchor="middle" dominantBaseline="middle" alignmentBaseline="middle" fontWeight={700} fontSize={10} fontFamily="Arial, sans-serif" fill="#333" stroke="#fff" strokeWidth={1.5} paintOrder="stroke" strokeLinejoin="round" style={{ pointerEvents: "none", userSelect: "none" }}>
                    {housePlanets.map((p, idx) => (
                      <tspan x={pos.center.x} dy={idx === 0 ? 0 : 14} key={p}>
                        {PLANET_LABELS_DIAMOND[p]}
                        {planetsD9[p]?.retrograde === true && (
                          <tspan style={{ fontSize: "10px", fill: "#d2691e", fontWeight: 800, letterSpacing: 1 }}>Р</tspan>
                        )}
                      </tspan>
                    ))}
                  </text>
                ) : (
                  <text x={pos.center.x} y={pos.center.y} textAnchor="middle" dominantBaseline="middle" alignmentBaseline="middle" fontWeight={700} fontSize={housePlanets.length > 2 ? 10 : 12} fontFamily="Arial, sans-serif" fill="#333" stroke="#fff" strokeWidth={1.5} paintOrder="stroke" strokeLinejoin="round" style={{ pointerEvents: "none", userSelect: "none" }}>
                    {housePlanets.map((p, idx) => (
                      <tspan key={p}>
                        {PLANET_LABELS_DIAMOND[p]}
                        {planetsD9[p]?.retrograde === true && (
                          <tspan style={{ fontSize: "10px", fill: "#d2691e", fontWeight: 800, letterSpacing: 1 }}>Р</tspan>
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
  );
}
