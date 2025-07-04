import React from "react";
import { SIGNS, PLANET_LABELS_DIAMOND, calcNakshatraPada } from "./astroUtils";

export default function NavamsaTable({ planetsD9 }) {
  if (!planetsD9) return null;
  // Для таблицы: вычисляем накшатру и паду
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
          <tr style={{ color: "#1e5a8b", fontWeight: 700 }}>
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
              <tr key={planetKey} style={{ borderBottom: "1px solid #b6d1f1" }}>
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
                  {typeof p.navamsa_deg === "number"
                    ? `${Math.floor(p.navamsa_deg)}°${Math.round(((p.navamsa_deg) % 1) * 60)}'`
                    : ""}
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
                  {p.navamsa_sign || ""}
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
