import React, { useRef, useState } from "react";
import { fetchCoordinates, fetchTimezone, fetchPlanetsFromServer, getSign, defaultFormValues, MAIN_COLOR, BG_COLOR } from "./astroUtils";
import NatalTable from "./NatalTable";
import NavamsaTable from "./NavamsaTable";

export default function NatalCardForm({
  expanded, setExpanded,
  values, setValues,
  planets, setPlanets,
  ayanamsha, setAyanamsha,
  loading, setLoading,
  error, setError,
  geoError, setGeoError,
  geoLoading, setGeoLoading,
  onSave,
  chartIndex = 0 // 0 — D1, 1 — D9
}) {
  const latInput = useRef();
  const lonInput = useRef();
  // --- добавляем локальный state для таблицы ---
  const [tableIndex, setTableIndex] = useState(0); // 0 — D1, 1 — D9

  // Изменено: правильно учитываем летнее/зимнее время!
  async function autoFillGeo() {
    setGeoError("");
    if (!values.place || !values.date) {
      setGeoError("Введите город и дату");
      return;
    }
    setGeoLoading(true);
    try {
      const coord = await fetchCoordinates(values.place);
      if (!coord) throw new Error("Город не найден");
      setValues((prev) => ({
        ...prev,
        latitude: coord.latitude,
        longitude: coord.longitude,
        place: coord.displayName,
      }));

      const tz = await fetchTimezone(coord.latitude, coord.longitude, values.date);
      if (!tz) throw new Error("Не удалось определить временную зону");
      // Получаем offset с сервера (точно так же, как при расчёте планет)
      let offset = '';
      try {
        // Используем полдень по умолчанию, если времени нет
        const time = values.time || '12:00';
        const resp = await fetchPlanetsFromServer({
          date: values.date,
          time,
          lat: coord.latitude,
          lon: coord.longitude,
          timezone: tz.timezoneId,
        });
        offset = resp.offset;
      } catch (e) {
        offset = '';
      }
      setValues((prev) => ({
        ...prev,
        timezone: tz.timezoneId,
        tzOffset: offset,
      }));
    } catch (e) {
      setGeoError("Ошибка: " + e.message);
      setValues((prev) => ({
        ...prev,
        latitude: "",
        longitude: "",
        timezone: "",
        tzOffset: "",
      }));
      console.error("Geo error details:", e);
    }
    setGeoLoading(false);
  }

  const handleCalc = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setPlanets(null);
    setAyanamsha(null);

    if (!values.date || !values.time) {
      setError("Пожалуйста, заполните дату и время.");
      setLoading(false);
      return;
    }

    try {
      const planetsData = await fetchPlanetsFromServer({
        date: values.date,
        time: values.time,
        lat: values.latitude ? Number(values.latitude) : 55.75,
        lon: values.longitude ? Number(values.longitude) : 37.6167,
        timezone: values.timezone || "Europe/Moscow", // теперь передаем timezone
      });
      // --- ЛОГ ДЛЯ D9 ---
      // console.log("Ответ сервера (planetsData):", planetsData);
      // if (planetsData.d9) {
      //   const d9map = {};
      //   for (const planet of Object.keys(planetsData.d9)) {
      //     const p = planetsData.d9[planet];
      //     if (p && p.navamsa_sign) {
      //       if (!d9map[p.navamsa_sign]) d9map[p.navamsa_sign] = [];
      //       d9map[p.navamsa_sign].push(planet);
      //     }
      //   }
      //   console.log("D9: распределение планет по знакам:", d9map);
      // }

      const planetsObj = {};

      // Обычные планеты (как было)
      for (const p of ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn"]) {
        const lon = planetsData[p]?.longitude;
        planetsObj[p] = {
          sign: getSign(lon),
          deg_in_sign: lon % 30,
          deg_in_sign_str: `${Math.floor(lon % 30)}°${Math.round(((lon % 30) % 1) * 60)}'`,
          retrograde: planetsData[p]?.retrograde
        };
      }

      // Раху и Кету — берём поля напрямую из объекта
      for (const p of ["rahu", "ketu"]) {
        const obj = planetsData[p];
        planetsObj[p] = {
          sign: obj?.sign,
          deg_in_sign: obj?.deg_in_sign,
          deg_in_sign_str: obj?.deg_in_sign_str,
          retrograde: obj?.retrograde,
          longitude: obj?.longitude
        };
      }

      // Асцендент — не трогаем, как было раньше
      const lonAsc = planetsData["ascendant"];
      planetsObj["ascendant"] = {
        sign: getSign(lonAsc),
        deg_in_sign: lonAsc % 30,
        deg_in_sign_str: `${Math.floor(lonAsc % 30)}°${Math.round(((lonAsc % 30) % 1) * 60)}'`
      };

      // Сохраняем offset, если сервер его вернул
      if (typeof planetsData.offset !== "undefined") {
        setValues(prev => ({
          ...prev,
          tzOffset: planetsData.offset
        }));
      }

      // --- Сохраняем дробную карту D9 (навамша) из ответа сервера ---
      if (planetsData.d9) {
        planetsObj.d9 = planetsData.d9;
      }

      setPlanets(planetsObj);
      setAyanamsha(null);
    } catch (err) {
      setError("Ошибка расчёта планет: " + (err.message || err));
    }
    setLoading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!planets) {
      setError("Сначала рассчитайте положение планет");
      return;
    }
    onSave({
      ...values,
      planets,
      ayanamsha,
    });
    setExpanded(false);
  };

  const handleReset = () => {
    setValues(defaultFormValues);
    setPlanets(null);
    setAyanamsha(null);
    setError("");
    setGeoError("");
  };

  return (
    <div style={{
      transition: "box-shadow 0.2s",
      boxShadow: expanded ? "0 2px 16px #0001" : "none",
      background: "#fff",
      borderRadius: 12,
      marginBottom: 8,
      marginTop: 0,
      overflow: "hidden",
      width: "100%",
      maxWidth: 370,
      minWidth: 0,
      marginLeft: "auto",
      marginRight: "auto"
    }}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: "100%",
          background: expanded ? MAIN_COLOR : "#fff",
          color: expanded ? "#fff" : MAIN_COLOR,
          border: expanded ? "none" : `1.5px solid ${MAIN_COLOR}`,
          borderRadius: 12,
          fontSize: 17,
          fontWeight: 700,
          cursor: "pointer",
          padding: "12px 0 10px 0",
          boxShadow: expanded ? "0 2px 8px #8B000033" : "none",
          outline: "none",
          letterSpacing: "0.02em",
          transition: "background 0.2s, color 0.2s",
          marginBottom: expanded ? 0 : 8,
          display: "block"
        }}
        aria-label={expanded ? "Свернуть" : "Развернуть"}
      >
        Создать карту {expanded ? "▲" : "▼"}
      </button>
      {expanded && (
        <form onSubmit={handleSubmit} style={{
          marginTop: 2,
          background: BG_COLOR,
          padding: "12px 14px 13px 14px",
          borderRadius: 12,
          marginBottom: 0,
          display: "flex",
          flexDirection: "column",
          gap: 7
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontWeight: 500, color: "#444", fontSize: 14 }}>
              Имя/метка
              <input
                value={values.name}
                onChange={e => setValues(v => ({ ...v, name: e.target.value }))}
                required
                style={{
                  marginTop: 3,
                  padding: "6px 10px",
                  borderRadius: 6,
                  border: "1px solid #e7d6d6",
                  fontSize: 14,
                  outline: "none"
                }}
                placeholder="Моя карта"
              />
            </label>
            <label style={{ fontWeight: 500, color: "#444", fontSize: 14 }}>
              Дата рождения
              <input
                type="date"
                value={values.date}
                onChange={e => setValues(v => ({ ...v, date: e.target.value }))}
                required
                style={{
                  marginTop: 3,
                  padding: "6px 10px",
                  borderRadius: 6,
                  border: "1px solid #e7d6d6",
                  fontSize: 14,
                  outline: "none"
                }}
              />
            </label>
            <label style={{ fontWeight: 500, color: "#444", fontSize: 14 }}>
              Время рождения
              <input
                type="time"
                value={values.time}
                onChange={e => setValues(v => ({ ...v, time: e.target.value }))}
                required
                style={{
                  marginTop: 3,
                  padding: "6px 10px",
                  borderRadius: 6,
                  border: "1px solid #e7d6d6",
                  fontSize: 14,
                  outline: "none"
                }}
              />
            </label>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 7 }}>
              <label style={{ flex: 1, fontWeight: 500, color: "#444", fontSize: 14 }}>
                Город/место рождения
                <input
                  value={values.place}
                  onChange={e => setValues(v => ({ ...v, place: e.target.value }))}
                  required
                  style={{
                    marginTop: 3,
                    padding: "6px 10px",
                    borderRadius: 6,
                    border: "1px solid #e7d6d6",
                    fontSize: 14,
                    outline: "none",
                    width: "100%"
                  }}
                  placeholder="Москва"
                />
              </label>
              <button
                type="button"
                onClick={autoFillGeo}
                disabled={!values.place || !values.date || geoLoading}
                style={{
                  marginBottom: 1,
                  padding: "5px 10px",
                  border: "none",
                  borderRadius: 7,
                  background: MAIN_COLOR,
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: geoLoading ? "wait" : "pointer",
                  boxShadow: "0 1px 4px #8B000011",
                  minWidth: 44,
                  transition: "background 0.18s"
                }}
                title="Определить координаты и часовой пояс"
              >
                {geoLoading ? "..." : "Авто"}
              </button>
            </div>
            {geoError && (
              <span style={{ color: "red", marginLeft: 2, fontSize: 12 }}>{geoError}</span>
            )}
            <div style={{ display: "flex", gap: 7 }}>
              <label style={{ flex: 1, fontWeight: 500, color: "#444", fontSize: 14 }}>
                Широта
                <input
                  ref={latInput}
                  type="number"
                  step="any"
                  value={values.latitude}
                  onChange={e => setValues(v => ({ ...v, latitude: e.target.value }))}
                  placeholder="55.75"
                  required
                  style={{
                    marginTop: 3,
                    padding: "6px 10px",
                    borderRadius: 6,
                    border: "1px solid #e7d6d6",
                    fontSize: 14,
                    outline: "none",
                    width: "100%"
                  }}
                />
              </label>
              <label style={{ flex: 1, fontWeight: 500, color: "#444", fontSize: 14 }}>
                Долгота
                <input
                  ref={lonInput}
                  type="number"
                  step="any"
                  value={values.longitude}
                  onChange={e => setValues(v => ({ ...v, longitude: e.target.value }))}
                  placeholder="37.6166"
                  required
                  style={{
                    marginTop: 3,
                    padding: "6px 10px",
                    borderRadius: 6,
                    border: "1px solid #e7d6d6",
                    fontSize: 14,
                    outline: "none",
                    width: "100%"
                  }}
                />
              </label>
            </div>
            <div style={{ display: "flex", gap: 7 }}>
              <label style={{ flex: 1, fontWeight: 500, color: "#444", fontSize: 14 }}>
                Временная зона
                <input
                  value={values.timezone}
                  readOnly
                  style={{
                    marginTop: 3,
                    padding: "6px 10px",
                    borderRadius: 6,
                    border: "1px solid #eee",
                    background: "#eee",
                    fontSize: 14,
                    color: "#888",
                    outline: "none",
                    width: "100%"
                  }}
                />
              </label>
              <label style={{ flex: 1, fontWeight: 500, color: "#444", fontSize: 14 }}>
                UTC-offset
                <input
                  value={values.tzOffset}
                  readOnly
                  style={{
                    marginTop: 3,
                    padding: "6px 10px",
                    borderRadius: 6,
                    border: "1px solid #eee",
                    background: "#eee",
                    fontSize: 14,
                    color: "#888",
                    outline: "none",
                    width: "100%"
                  }}
                />
              </label>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCalc}
            disabled={loading || !values.date || !values.time}
            style={{
              width: "100%",
              padding: "7px 0",
              border: "none",
              borderRadius: 7,
              background: loading ? "#ccc" : MAIN_COLOR,
              color: "#fff",
              fontWeight: 600,
              fontSize: 14,
              cursor: loading ? "wait" : "pointer",
              boxShadow: "0 1px 4px #8B000011",
              marginTop: 0
            }}
          >
            {loading ? "Рассчитываем..." : "Рассчитать планеты"}
          </button>
          <button
            type="submit"
            disabled={!planets}
            style={{
              width: "100%",
              padding: "7px 0",
              border: "none",
              borderRadius: 7,
              background: !planets ? "#eee" : "#228B22",
              color: !planets ? "#888" : "#fff",
              fontWeight: 600,
              fontSize: 14,
              cursor: !planets ? "not-allowed" : "pointer",
              boxShadow: "0 1px 4px #8B000011"
            }}
          >
            Сохранить
          </button>
          <button
            type="button"
            onClick={handleReset}
            style={{
              marginTop: 7,
              padding: "7px 0",
              border: "none",
              borderRadius: 7,
              background: "#F7D7DB",
              color: MAIN_COLOR,
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
              boxShadow: "0 1px 4px #8B000011",
              width: "100%",
              display: "block"
            }}
          >
            Новая карта
          </button>
          {error && <div style={{ color: "red", marginTop: 7, fontSize: 13, textAlign: "center" }}>{error}</div>}
          {ayanamsha !== null && (
            <div style={{ marginTop: 6, color: "#555", fontSize: 13, textAlign: "center" }}>
              <b>Аянамша Лахири:</b> {ayanamsha.toFixed(6)}°
            </div>
          )}
        </form>
      )}
      {/* --- Кнопки для независимого переключения таблицы --- */}
      {planets && (
        <div style={{ width: "100%", marginTop: 8, marginBottom: 2, display: "flex", justifyContent: "flex-end" }}>
          <button
            onClick={() => setTableIndex(i => (i === 0 ? 1 : 0))}
            style={{
              background: tableIndex === 0 ? "#f7d7db" : "#eaf3fb",
              color: tableIndex === 0 ? "#8B0000" : "#1e5a8b",
              border: "none",
              borderRadius: 8,
              padding: "5px 10px",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
              minWidth: 70,
              width: "auto",
              boxShadow: "0 1px 4px #8B000022"
            }}
          >
            {tableIndex === 0 ? "Таблица D9" : "Таблица D1"}
          </button>
        </div>
      )}
      {/* --- Независимое отображение таблицы --- */}
      {planets && (
        tableIndex === 0 ? (
          <NatalTable planets={planets} />
        ) : (
          planets.d9 && <NavamsaTable planetsD9={planets.d9} />
        )
      )}
    </div>
  );
}
