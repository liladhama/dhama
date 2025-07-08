import React from "react";

export default function PanchangaTable({ panchanga }) {
  // Показываем таблицу всегда, даже если нет данных
  // Список строк Панчанги
  const rows = [
    { label: "Вара", value: panchanga?.vara || "" },
    { label: "Титхи", value: panchanga?.tithi || "" },
    { label: "Карана", value: panchanga?.karana || "" },
    { label: "Нитья-йога", value: panchanga?.nitya_yoga || "" },
    { label: "Накшатра", value: panchanga?.nakshatra || "" },
  ];
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
        <tbody>
          {rows.map((row, idx) => (
            <tr
              key={row.label}
              style={idx !== rows.length - 1 ? { borderBottom: "1px solid #f1b6c1" } : {}}
            >
              <td style={{ fontWeight: 700, color: '#8B0000', width: '40%' }}>{row.label}</td>
              <td>{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
