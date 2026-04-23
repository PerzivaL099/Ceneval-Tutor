
import { useState, useRef, useCallback } from "react";
import { clasificarTexto } from "../../services/nlpService";
import "./ClasificadorPage.css";

// ─── Constantes ───────────────────────────────────────────────────────────────
const HISTORIAL_KEY = "ceneval_clasificador_historial";
// TODO: Cuando el backend tenga el endpoint, reemplazar las funciones
// cargarHistorial/guardarHistorial por llamadas a GET/POST /historial/

const COLORES_CLASES = ["#00c896", "#6c8ef5", "#f5a623", "#e05cff"];

// ─── Helpers de localStorage ──────────────────────────────────────────────────
function cargarHistorial() {
  try {
    return JSON.parse(localStorage.getItem(HISTORIAL_KEY) || "[]");
  } catch {
    return [];
  }
}
function guardarHistorial(items) {
  localStorage.setItem(HISTORIAL_KEY, JSON.stringify(items));
}

// ─── Íconos SVG inline ────────────────────────────────────────────────────────
const IconBrain = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-1.96-3 2.5 2.5 0 0 1-1.32-4.24 3 3 0 0 1 .34-5.58 2.5 2.5 0 0 1 1.96-3A2.5 2.5 0 0 1 9.5 2Z"/>
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 1.96-3 2.5 2.5 0 0 0 1.32-4.24 3 3 0 0 0-.34-5.58 2.5 2.5 0 0 0-1.96-3A2.5 2.5 0 0 0 14.5 2Z"/>
  </svg>
);
const IconUpload = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
);
const IconTrash = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
);
const IconChevron = ({ open }) => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    style={{ transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}>
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);
const IconAlert = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
    <path d="M12 9v4"/><path d="M12 17h.01"/>
  </svg>
);
const IconCheck = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/>
  </svg>
);
const IconX = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>
  </svg>
);

// ─── Subcomponente: 4 barras de probabilidad ──────────────────────────────────
function BarrasProbs({ todasLasProbs, etiquetaPredicha }) {
  const entries = Object.entries(todasLasProbs).sort((a, b) => b[1] - a[1]);
  return (
    <div className="barras-container">
      {entries.map(([clase, prob], i) => (
        <div key={clase} className={`barra-row ${clase === etiquetaPredicha ? "principal" : ""}`}>
          <div className="barra-meta">
            <span className="barra-label">{clase}</span>
            <span className="barra-pct" style={{ color: COLORES_CLASES[i] }}>
              {prob.toFixed(1)}%
            </span>
          </div>
          <div className="barra-track">
            <div className="barra-fill" style={{ width: `${prob}%`, backgroundColor: COLORES_CLASES[i] }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Subcomponente: Item expandible del historial ─────────────────────────────
function HistorialItem({ item, onEliminar }) {
  const [abierto, setAbierto] = useState(false);
  const fecha = new Date(item.timestamp).toLocaleString("es-MX", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
  });
  return (
    <div className={`historial-item ${abierto ? "abierto" : ""}`}>
      <div className="historial-header" onClick={() => setAbierto(!abierto)}>
        <div className="historial-header-left">
          <span className="historial-etiqueta">{item.resultado.etiqueta_predicha}</span>
          <span className="historial-fecha">{fecha}</span>
        </div>
        <div className="historial-header-right">
          <span className="historial-conf">{item.resultado.confianza_pct.toFixed(1)}%</span>
          <button className="btn-icon-sm" onClick={e => { e.stopPropagation(); onEliminar(item.id); }} title="Eliminar">
            <IconTrash />
          </button>
          <IconChevron open={abierto} />
        </div>
      </div>
      {abierto && (
        <div className="historial-detalle">
          <p className="historial-texto">"{item.texto}"</p>
          {item.resultado.todas_las_probs && (
            <BarrasProbs
              todasLasProbs={item.resultado.todas_las_probs}
              etiquetaPredicha={item.resultado.etiqueta_predicha}
            />
          )}
        </div>
      )}
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function ClasificadorPage() {
  const [textoPregunta, setTextoPregunta] = useState("");
  const [estaCargando, setEstaCargando]   = useState(false);
  const [resultadoIA, setResultadoIA]     = useState(null);
  const [errorPeticion, setErrorPeticion] = useState(null);
  const [historial, setHistorial]         = useState(cargarHistorial);
  const [cargandoPdf, setCargandoPdf]     = useState(false);
  const [pdfNombre, setPdfNombre]         = useState(null);
  const fileInputRef = useRef(null);

  // ── Lógica central de análisis ─────────────────────────────────────────────
  const analizar = useCallback(async (texto) => {
    setEstaCargando(true);
    setResultadoIA(null);
    setErrorPeticion(null);

    const resultado = await clasificarTexto(texto);

    if (!resultado.success) {
      setErrorPeticion(resultado.error);
    } else {
      setResultadoIA(resultado.data);
      const nuevoItem = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        texto: texto.length > 130 ? texto.slice(0, 130) + "…" : texto,
        resultado: resultado.data,
      };
      setHistorial(prev => {
        const actualizado = [nuevoItem, ...prev].slice(0, 50);
        guardarHistorial(actualizado);
        return actualizado;
      });
    }
    setEstaCargando(false);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (textoPregunta.trim()) analizar(textoPregunta);
  };

  // ── Extracción de texto desde PDF ──────────────────────────────────────────
  const handlePdfChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || file.type !== "application/pdf") return;

    setPdfNombre(file.name);
    setCargandoPdf(true);
    setErrorPeticion(null);

    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url
      ).toString();

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      let textoCompleto = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        textoCompleto += content.items.map(item => item.str).join(" ") + "\n";
      }

      // Tomar el primer párrafo con contenido suficiente
      const primerParrafo = textoCompleto
        .split(/\n+/)
        .map(p => p.trim())
        .find(p => p.length > 20) || "";

      if (!primerParrafo) {
        setErrorPeticion("No se encontró texto legible en el PDF.");
      } else {
        setTextoPregunta(primerParrafo);
      }
    } catch (err) {
      console.error(err);
      setErrorPeticion("Error al leer el PDF. Asegúrate que no esté protegido con contraseña.");
    }

    setCargandoPdf(false);
    e.target.value = "";
  };

  // ── Historial helpers ──────────────────────────────────────────────────────
  const eliminarItem = (id) => {
    setHistorial(prev => {
      const actualizado = prev.filter(i => i.id !== id);
      guardarHistorial(actualizado);
      return actualizado;
    });
  };
  const limpiarHistorial = () => { setHistorial([]); guardarHistorial([]); };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="clasificador-page">

      {/* Header */}
      <div className="page-header">
        <div className="header-icon"><IconBrain /></div>
        <div>
          <h1 className="page-title">Clasificador IA</h1>
          <p className="page-subtitle">
            Ingresa una pregunta y el modelo identificará su área temática dentro del examen CENEVAL.
          </p>
        </div>
      </div>

      {/* Formulario */}
      <form className="clasificador-form" onSubmit={handleSubmit}>
        <div className="form-label-row">
          <label htmlFor="pregunta-input" className="form-label">
            Pregunta o texto a analizar
          </label>
          <button
            type="button"
            className="btn-pdf"
            onClick={() => fileInputRef.current?.click()}
            disabled={cargandoPdf || estaCargando}
          >
            {cargandoPdf
              ? <><span className="spinner spinner-sm" /> Leyendo…</>
              : <><IconUpload /> {pdfNombre || "Subir PDF"}</>
            }
          </button>
          <input ref={fileInputRef} type="file" accept="application/pdf"
            onChange={handlePdfChange} style={{ display: "none" }} />
        </div>

        <textarea
          id="pregunta-input"
          className="form-textarea"
          placeholder="Escribe aquí tu pregunta del examen CENEVAL…"
          value={textoPregunta}
          onChange={e => setTextoPregunta(e.target.value)}
          rows={4}
          disabled={estaCargando}
        />

        <button
          type="submit"
          className={`btn-analizar ${estaCargando ? "cargando" : ""}`}
          disabled={estaCargando || !textoPregunta.trim()}
        >
          {estaCargando
            ? <><span className="spinner" /> Analizando…</>
            : <><IconBrain /> Analizar con IA</>
          }
        </button>
      </form>

      {/* Resultado */}
      {errorPeticion && (
        <div className="resultado-card error">
          <div className="card-header"><IconX /><span>Error al procesar</span></div>
          <p className="card-desc">{errorPeticion}</p>
        </div>
      )}

      {resultadoIA && !resultadoIA.fuera_de_dominio && (
        <div className="resultado-card exito">
          <div className="card-header"><IconCheck /><span>Clasificación exitosa</span></div>
          <div className="etiqueta-ganadora">
            <span className="etiqueta-label">ÁREA TEMÁTICA</span>
            <strong className="etiqueta-valor">{resultadoIA.etiqueta_predicha}</strong>
          </div>
          {resultadoIA.todas_las_probs && (
            <BarrasProbs
              todasLasProbs={resultadoIA.todas_las_probs}
              etiquetaPredicha={resultadoIA.etiqueta_predicha}
            />
          )}
        </div>
      )}

      {resultadoIA?.fuera_de_dominio && (
        <div className="resultado-card fuera-dominio">
          <div className="card-header"><IconAlert /><span>Texto fuera de dominio</span></div>
          <p className="card-desc">
            La pregunta no parece relacionada con temáticas CENEVAL.
            Intenta con una pregunta más específica del examen.
          </p>
        </div>
      )}

      {/* Historial */}
      {historial.length > 0 && (
        <section className="historial-section">
          <div className="historial-title-row">
            <h2 className="historial-title">
              Preguntas analizadas
              <span className="historial-count">{historial.length}</span>
            </h2>
            <button className="btn-limpiar" onClick={limpiarHistorial}>
              <IconTrash /> Limpiar todo
            </button>
          </div>
          <div className="historial-lista">
            {historial.map(item => (
              <HistorialItem key={item.id} item={item} onEliminar={eliminarItem} />
            ))}
          </div>
          {/* TODO: migrar a BD cuando esté el endpoint:
              GET    /historial/        → cargar al montar (useEffect)
              POST   /historial/        → guardar tras cada análisis
              DELETE /historial/{id}    → eliminar item individual       */}
        </section>
      )}

    </div>
  );
}