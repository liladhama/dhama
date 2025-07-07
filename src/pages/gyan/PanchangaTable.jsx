import React from "react";

export default function PanchangaTable() {
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
          <tr>
            <td style={{ fontWeight: 700, color: '#8B0000', width: '40%' }}>Вара</td>
            <td>тест</td>
          </tr>
          <tr>
            <td style={{ fontWeight: 700, color: '#8B0000' }}>Титха</td>
            <td>тест</td>
          </tr>
          <tr>
            <td style={{ fontWeight: 700, color: '#8B0000' }}>Карана</td>
            <td>тест</td>
          </tr>
          <tr>
            <td style={{ fontWeight: 700, color: '#8B0000' }}>Нитья-йога</td>
            <td>тест</td>
          </tr>
          <tr>
            <td style={{ fontWeight: 700, color: '#8B0000' }}>Накшатра</td>
            <td>тест</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
