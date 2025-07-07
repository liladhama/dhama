import React from "react";

// Ожидается объект вида: { vara, karana, tithi, nitya_yoga, nakshatra }
export default function PanchangaTable({ panchanga }) {
  if (!panchanga) return null;
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
            <th style={{ textAlign: "left", padding: "2px 2px", width: "20%" }}>Вара</th>
            <th style={{ textAlign: "left", padding: "2px 2px", width: "20%" }}>Карана</th>
            <th style={{ textAlign: "left", padding: "2px 2px", width: "20%" }}>Титха</th>
            <th style={{ textAlign: "left", padding: "2px 2px", width: "20%" }}>Нитья-йога</th>
            <th style={{ textAlign: "left", padding: "2px 2px", width: "20%" }}>Накшатра</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{panchanga.vara || ""}</td>
            <td>{panchanga.karana || ""}</td>
            <td>{panchanga.tithi || ""}</td>
            <td>{panchanga.nitya_yoga || ""}</td>
            <td>{panchanga.nakshatra || ""}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
