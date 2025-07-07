import React, { useState, useRef } from "react";
import NatalDiamondChart from "./NatalDiamondChart";
import NavamsaDiamondChart from "./NavamsaDiamondChart";
import NatalCardForm from "./NatalCardForm";
import SavedCardsPanel from "./SavedCardsPanel";
import SideMenuHandle from "./SideMenuHandle";
import InterpretationsSection from "./InterpretationsSection";
import ForecastsSection from "./ForecastsSection";
import NatalTable from "./NatalTable";
import { defaultFormValues, MAIN_COLOR, BG_COLOR } from "./astroUtils";

const SECTIONS = [
  { id: "natal", label: "Мои карты" },
  { id: "interpret", label: "Трактовки" },
  { id: "forecast", label: "Прогнозы" },
];

export default function GyanPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState("natal");
  const [natalCards, setNatalCards] = useState([]);
  const [selectedCardId, setSelectedCardId] = useState(null);

  const [formExpanded, setFormExpanded] = useState(false);
  const [savedPanelExpanded, setSavedPanelExpanded] = useState(false);
  const [showSavedPanel, setShowSavedPanel] = useState(false);

  const [formValues, setFormValues] = useState({ ...defaultFormValues });
  const [formPlanets, setFormPlanets] = useState(null);
  const [formAyanamsha, setFormAyanamsha] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [formGeoError, setFormGeoError] = useState("");
  const [formGeoLoading, setFormGeoLoading] = useState(false);

  const [chartIndex, setChartIndex] = useState(0); // 0 — D1, 1 — D9
  const swipeStartX = useRef(null);

  const NATAL_LIMIT = 5;

  const handleAddCard = (card) => {
    if (natalCards.length < NATAL_LIMIT) {
      const id = Date.now().toString();
      setNatalCards([
        ...natalCards,
        { ...card, id }
      ]);
      setSelectedCardId(id);
      setShowSavedPanel(true);
      setSavedPanelExpanded(true);
    }
  };

  const handleSelectCard = (id) => setSelectedCardId(id);

  const handleDeleteCard = (id) => {
    setNatalCards(cards => cards.filter(card => card.id !== id));
    if (selectedCardId === id) setSelectedCardId(null);
  };

  let mainSectionContent = null;
  if (selectedSection === "natal") {
    mainSectionContent = (
      <div style={{
        width: "100%",
        margin: "0 auto",
        marginTop: 6,
        gap: 10,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch"
      }}>
        <button
          onClick={() => { setShowSavedPanel(v => !v); setSavedPanelExpanded(true); }}
          style={{
            width: "100%",
            padding: "9px 0",
            fontSize: 15,
            fontWeight: 700,
            color: MAIN_COLOR,
            background: "#fff",
            border: `1.5px solid ${MAIN_COLOR}`,
            borderRadius: 12,
            boxShadow: "0 1px 4px #8B000011",
            cursor: "pointer",
            transition: "background 0.2s, color 0.2s",
            marginTop: 7,
            marginBottom: 7,
            display: "block"
          }}
        >
          Открыть сохранённые карты
        </button>
        {showSavedPanel && (
          <SavedCardsPanel
            cards={natalCards}
            onSelectCard={handleSelectCard}
            selectedCardId={selectedCardId}
            onClose={() => setShowSavedPanel(false)}
            expanded={savedPanelExpanded}
            setExpanded={setSavedPanelExpanded}
            onDeleteCard={handleDeleteCard}
          />
        )}
        {formPlanets && (
          <div
            style={{
              position: "relative",
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center"
            }}
            onTouchStart={e => { swipeStartX.current = e.touches[0].clientX; }}
            onTouchEnd={e => {
              if (swipeStartX.current !== null) {
                const dx = e.changedTouches[0].clientX - swipeStartX.current;
                if (Math.abs(dx) > 40) {
                  if (dx < 0 && chartIndex === 0) setChartIndex(1); // свайп влево: D1→D9
                  if (dx > 0 && chartIndex === 1) setChartIndex(0); // свайп вправо: D9→D1
                }
                swipeStartX.current = null;
              }
            }}
          >
            <div style={{ position: "absolute", top: 0, right: 0, zIndex: 2, padding: window.innerWidth < 700 ? 6 : 12 }}>
              <button
                onClick={() => setChartIndex(i => (i === 0 ? 1 : 0))}
                style={{
                  background: "#f7d7db",
                  color: "#8B0000",
                  border: "none",
                  borderRadius: 8,
                  padding: "7px 10px",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                  minWidth: 70,
                  width: "auto",
                  boxShadow: "0 1px 4px #8B000022"
                }}
              >
                {chartIndex === 0 ? "Навамша (D9) →" : "← Натальная (D1)"}
              </button>
            </div>
            <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              {chartIndex === 0 ? (
                <NatalDiamondChart planets={formPlanets} />
              ) : (
                <NavamsaDiamondChart planetsD9={formPlanets.d9 || {}} />
              )}
            </div>
          </div>
        )}
        {formPlanets && (
          <div style={{ width: "100%", marginTop: 8 }}>
            <NatalTable planets={formPlanets} />
          </div>
        )}
        <div style={{ width: "100%", marginTop: 10 }}>
          <NatalCardForm
            expanded={formExpanded}
            setExpanded={setFormExpanded}
            values={formValues}
            setValues={setFormValues}
            planets={formPlanets}
            setPlanets={setFormPlanets}
            ayanamsha={formAyanamsha}
            setAyanamsha={setFormAyanamsha}
            loading={formLoading}
            setLoading={setFormLoading}
            error={formError}
            setError={setFormError}
            geoError={formGeoError}
            setGeoError={setFormGeoError}
            geoLoading={formGeoLoading}
            setGeoLoading={setFormGeoLoading}
            onSave={handleAddCard}
          />
        </div>
      </div>
    );
  } else if (selectedSection === "interpret") {
    mainSectionContent = <InterpretationsSection />;
  } else if (selectedSection === "forecast") {
    mainSectionContent = <ForecastsSection />;
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: BG_COLOR,
      transition: "background 0.3s",
      position: "relative",
      paddingBottom: 50,
      margin: 0,
      boxSizing: "border-box"
    }}>
      <SideMenuHandle onClick={() => setMenuOpen(true)} visible={!menuOpen} />
      <div
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          width: "38vw",
          maxWidth: 220,
          height: "100vh",
          background: "#fff6f6",
          boxShadow: menuOpen ? "2px 0 10px #8B000022" : "none",
          zIndex: 1200,
          transition: "transform 0.3s",
          transform: menuOpen ? "translateX(0)" : "translateX(-100%)",
          padding: 16,
          display: "flex",
          flexDirection: "column",
          backdropFilter: "blur(3px)",
        }}
      >
        <button
          onClick={() => setMenuOpen(false)}
          style={{
            alignSelf: "flex-end",
            marginBottom: 8,
            background: "none",
            border: "none",
            fontSize: 18,
            cursor: "pointer",
            color: MAIN_COLOR,
            fontWeight: 700
          }}
          aria-label="Закрыть меню"
        >
          ×
        </button>
        {SECTIONS.map((sec) => (
          <button
            key={sec.id}
            onClick={() => {
              setSelectedSection(sec.id);
              setMenuOpen(false);
            }}
            style={{
              background: selectedSection === sec.id ? "#F7D7DB" : "transparent",
              fontWeight: selectedSection === sec.id ? 600 : 400,
              padding: "8px 0",
              textAlign: "left",
              border: "none",
              width: "100%",
              cursor: "pointer",
              fontSize: 14,
              color: MAIN_COLOR,
              borderRadius: 7,
              marginBottom: 2,
              transition: "background 0.15s"
            }}
          >
            {sec.label}
          </button>
        ))}
      </div>
      <div style={{
        width: "100%",
        maxWidth: 440,
        margin: "0 auto",
        minHeight: 0,
        marginTop: 0,
        padding: 0,
        background: "none",
        position: "relative"
      }}>
        {mainSectionContent}
      </div>
    </div>
  );
}