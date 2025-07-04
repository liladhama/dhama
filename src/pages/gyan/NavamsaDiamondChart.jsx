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
  // --- Формируем карту: для каждого знака d9 — список планет ---
  // d9: { planet: { navamsa_sign, navamsa_num, ... } }
  const d9SignMap = {};
  for (const planet of Object.keys(PLANET_LABELS_DIAMOND)) {
    const p = planetsD9[planet];
    if (p && p.navamsa_sign) {
      if (!d9SignMap[p.navamsa_sign]) d9SignMap[p.navamsa_sign] = [];
      d9SignMap[p.navamsa_sign].push(planet);
    }
  }
  // Для асцендента: вычисляем знак d9 по navamsa_sign, если есть
  const ascSign = planetsD9.ascendant?.navamsa_sign || SIGNS[0];
  const ascSignIndex = SIGNS.indexOf(ascSign);
  function getHouseIndex(num) { return (num - 1 + 12) % 12; }

  // Для таблицы: вычисляем накшатру и паду, если сервер не вернул
  const planetNakshMap = {};
  for (const planet of Object.keys(PLANET_LABELS_DIAMOND)) {
    const p = planetsD9[planet];
    if (p && typeof p.navamsa_deg === "number" && typeof p.navamsa_sign === "string") {
      const signIdx = SIGNS.indexOf(p.navamsa_sign);
      if (signIdx !== -1) {
        const totalDeg = signIdx * 30 + p.navamsa_deg;
        planetNakshMap[planet] = calcNakshatraPada(totalDeg);
      }
    }
  }

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
          <rect x={PADDING} y={PADDING} width={SQ} height={SQ} fill="none" stroke="#8B0000" strokeWidth={3} />
          <line x1={A[0]} y1={A[1]} x2={D[0]} y2={D[1]} stroke="#d88" strokeWidth={1.5}/>
          <line x1={B[0]} y1={B[1]} x2={C[0]} y2={C[1]} stroke="#d88" strokeWidth={1.5}/>
          {housePolygons.map((pts, i) => {
            const num = i + 1;
            const signIdx = (ascSignIndex + num - 1) % 12;
            const sign = SIGNS[signIdx];
            const housePlanets = d9SignMap[sign] || [];
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
                        </tspan>
                      ))}
                    </text>
                  ) : (
                    <text x={pos.center.x} y={pos.center.y} textAnchor="middle" dominantBaseline="middle" alignmentBaseline="middle" fontWeight={700} fontSize={housePlanets.length > 2 ? 10 : 12} fontFamily="Arial, sans-serif" fill="#333" stroke="#fff" strokeWidth={1.5} paintOrder="stroke" strokeLinejoin="round" style={{ pointerEvents: "none", userSelect: "none" }}>
                      {housePlanets.map((p, idx) => (
                        <tspan key={p}>
                          {PLANET_LABELS_DIAMOND[p]}
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
      {/* Таблица */}
      <div style={{
        width: "100%",
        background: "#fff",
        borderRadius: 12,
        boxShadow: "0 1px 8px #8B000022",
        padding: "8px 7px 8px 7px",
        marginTop: 2,
        overflowX: "auto"
      }}>
        <table style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: 14,
          tableLayout: "fixed"
        }}>
          <thead>
            <tr style={{ color: "#8B0000", fontWeight: 700 }}>
              <th style={{ textAlign: "left", padding: "2px 2px", width: "10%" }}>Пл</th>
              <th style={{ textAlign: "left", padding: "2px 2px", width: "15%" }}>Град</th>
              <th style={{ textAlign: "left", padding: "2px 2px", width: "17%" }}>Знак</th>
              <th style={{ textAlign: "left", padding: "2px 2px", width: "33%" }}>Накшатра</th>
              <th style={{ textAlign: "left", padding: "2px 2px", width: "8%" }}>ПД</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(PLANET_LABELS_DIAMOND).map((planetKey) => {
              const p = planetsD9[planetKey];
              const n = planetNakshMap[planetKey] || {};
              if (!p) return null;
              return (
                <tr key={planetKey} style={{ borderBottom: "1px solid #f1b6c1" }}>
                  <td
                    style={{
                      padding: "1px 2px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      maxWidth: 32,
                      fontWeight: 700
                    }}
                  >
                    {PLANET_LABELS_DIAMOND[planetKey]}
                  </td>
                  <td
                    style={{
                      padding: "1px 2px",
                      whiteSpace: "nowrap",
                      maxWidth: 36,
                      overflow: "hidden",
                      textOverflow: "ellipsis"
                    }}
                  >
                    {typeof p.navamsa_deg === "number" ? p.navamsa_deg.toFixed(2) : ""}
                  </td>
                  <td
                    style={{
                      padding: "1px 2px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      maxWidth: 38
                    }}
                  >
                    {p.navamsa_sign ? SIGN_SHORT[SIGNS.indexOf(p.navamsa_sign)] : ""}
                  </td>
                  <td
                    style={{
                      padding: "1px 2px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      maxWidth: 90,
                      cursor: n.nakshatra && n.nakshatra.length > 8 ? "pointer" : "default"
                    }}
                    title={n.nakshatra}
                  >
                    {p.navamsa_nakshatra || n.nakshatra || ""}
                  </td>
                  <td style={{
                    padding: "1px 2px",
                    whiteSpace: "nowrap",
                    width: 8,
                    textAlign: "center"
                  }}>{p.navamsa_pada || n.pada || ""}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
