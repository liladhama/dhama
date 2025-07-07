import React from "react";
import { SIGNS, PLANET_LABELS_DIAMOND, calcNakshatraPada } from "./astroUtils";

export default function NatalTable({ planets }) {
  if (!planets) return null;
  // Для таблицы: вычисляем накшатру и паду
  const planetNakshMap = {};
  for (const [planet, pObj] of Object.entries(planets)) {
    let totalDeg = undefined;
    if ((planet === "rahu" || planet === "ketu") && typeof pObj.longitude === "number") {
      totalDeg = pObj.longitude;
    } else if (typeof pObj.deg_in_sign === "number" && typeof pObj.sign === "string") {
      const signIdx = SIGNS.indexOf(pObj.sign);
      if (signIdx !== -1) {
        totalDeg = signIdx * 30 + pObj.deg_in_sign;
      }
    }
    if (typeof totalDeg === "number" && totalDeg >= 0) {
      planetNakshMap[planet] = calcNakshatraPada(totalDeg);
    }
  }
  return (
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
            const p = planets[planetKey];
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
                  {p?.retrograde === true && (
                    <span style={{
                      color: "#d2691e",
                      fontWeight: 800,
                      fontSize: "13px",
                      marginLeft: 2,
                      letterSpacing: 1
                    }}>Р</span>
                  )}
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
                  {p.deg_in_sign_str || ""}
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
                  {p.sign ||
                    ((planetKey === "rahu" || planetKey === "ketu") && typeof p.longitude === "number"
                      ? SIGNS[Math.floor(p.longitude / 30) % 12]
                      : "")}
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
                  {n.nakshatra || ""}
                </td>
                <td style={{
                  padding: "1px 2px",
                  whiteSpace: "nowrap",
                  width: 8,
                  textAlign: "center"
                }}>{n.pada || ""}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
