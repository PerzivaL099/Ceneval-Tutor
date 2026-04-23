// src/pages/ClasificadorPage.jsx
// Smart Component: máquina de estados para la interacción con el modelo NLP.
// Solo conoce el servicio; no sabe nada de HTTP ni de fetch.

import { useState } from "react";
import { clasificarTexto } from "../../services/nlpService";
import "./ClasificadorPage.css";

// ─── Íconos SVG inline (sin dependencia extra) ────────────────────────────────
const IconBrain = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-1.96-3 2.5 2.5 0 0 1-1.32-4.24 3 3 0 0 1 .34-5.58 2.5 2.5 0 0 1 1.96-3A2.5 2.5 0 0 1 9.5 2Z"/>
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 1.96-3 2.5 2.5 0 0 0 1.32-4.24 3 3 0 0 0-.34-5.58 2.5 2.5 0 0 0-1.96-3A2.5 2.5 0 0 0 14.5 2Z"/>
  </svg>
);

const IconAlert = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
    <path d="M12 9v4"/><path d="M12 17h.01"/>
  </svg>
);

const IconCheck = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <path d="m9 11 3 3L22 4"/>
  </svg>
);

const IconX = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="m15 9-6 6"/><path d="m9 9 6 6"/>
  </svg>
);

// ─── Subcomponente: Barra de Confianza ────────────────────────────────────────
function BarraConfianza({ valor }) {
  const pct = Math.round(valor * 100);
  const color = pct >= 80 ? "#22c55e" : pct >= 50 ? "#f59e0b" : "#ef4444";

  return (
    <div className="confianza-wrapper">
      <div className="confianza-label">
        <span>Confianza</span>
        <strong style={{ color }}>{pct}%</strong>
      </div>
      <div className="confianza-track">
        <div
          className="confianza-fill"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

// ─── Componente Principal ─────────────────────────────────────────────────────
export default function ClasificadorPage() {
  const [textoPregunta, setTextoPregunta] = useState("");
  const [estaCargando, setEstaCargando] = useState(false);
  const [resultadoIA, setResultadoIA] = useState(null);   // { etiqueta_predicha, confianza_pct, fuera_de_dominio }
  const [errorPeticion, setErrorPeticion] = useState(null);

  // ── Controlador principal ──────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();

    // Reset de estados previos
    setEstaCargando(true);
    setResultadoIA(null);
    setErrorPeticion(null);

    const resultado = await clasificarTexto(textoPregunta);

    if (!resultado.success) {
      setErrorPeticion(resultado.error);
    } else {
      setResultadoIA(resultado.data);
    }

    setEstaCargando(false);
  }

  // ── Renderizado condicional del resultado ──────────────────────────────────
  function renderResultado() {
    if (!resultadoIA) return null;

    // Estado: Fuera de dominio
    if (resultadoIA.fuera_de_dominio === true) {
      return (
        <div className="resultado-card fuera-dominio" role="status">
          <div className="card-header">
            <IconAlert />
            <span>Texto fuera de dominio</span>
          </div>
          <p className="card-desc">
            La pregunta ingresada no parece estar relacionada con temáticas
            CENEVAL. Intenta con una pregunta más específica del examen.
          </p>
        </div>
      );
    }

    // Estado: Predicción exitosa
    return (
      <div className="resultado-card exito" role="status">
        <div className="card-header">
          <IconCheck />
          <span>Clasificación exitosa</span>
        </div>
        <div className="etiqueta-predicha">
          <span className="etiqueta-label">Área temática</span>
          <strong className="etiqueta-valor">{resultadoIA.etiqueta_predicha}</strong>
        </div>
        {resultadoIA.confianza_pct !== undefined && (
          <BarraConfianza valor={resultadoIA.confianza_pct} />
        )}
      </div>
    );
  }

  // ── JSX principal ──────────────────────────────────────────────────────────
  return (
    <div className="clasificador-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-icon">
          <IconBrain />
        </div>
        <div>
          <h1 className="page-title">Clasificador IA</h1>
          <p className="page-subtitle">
            Ingresa una pregunta y el modelo identificará su área temática
            dentro del examen CENEVAL.
          </p>
        </div>
      </div>

      {/* Formulario */}
      <form className="clasificador-form" onSubmit={handleSubmit}>
        <label htmlFor="pregunta-input" className="form-label">
          Pregunta o texto a analizar
        </label>
        <textarea
          id="pregunta-input"
          className="form-textarea"
          placeholder="Escribe aquí tu pregunta del examen CENEVAL…"
          value={textoPregunta}
          onChange={(e) => setTextoPregunta(e.target.value)}
          rows={5}
          disabled={estaCargando}
        />
        <button
          type="submit"
          className={`btn-analizar ${estaCargando ? "cargando" : ""}`}
          disabled={estaCargando || !textoPregunta.trim()}
        >
          {estaCargando ? (
            <>
              <span className="spinner" aria-hidden="true" />
              Analizando…
            </>
          ) : (
            <>
              <IconBrain />
              Analizar con IA
            </>
          )}
        </button>
      </form>

      {/* Zona de resultados */}
      <div className="resultado-zona">
        {/* Error de red / validación */}
        {errorPeticion && (
          <div className="resultado-card error" role="alert">
            <div className="card-header">
              <IconX />
              <span>Error al procesar</span>
            </div>
            <p className="card-desc">{errorPeticion}</p>
          </div>
        )}

        {/* Resultado del modelo */}
        {renderResultado()}
      </div>
    </div>
  );
}