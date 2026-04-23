import sys
import os

# -----------------------------------------------------------------------------
# Ruta al módulo de inferencia dentro del contenedor Docker.
# El docker-compose monta data_science/ en /data_science dentro del contenedor.
# En local (fuera de Docker), la ruta se resuelve relativamente desde este archivo.
# -----------------------------------------------------------------------------
_DOCKER_NLP_PATH = "/data_science/src/nlp"
_LOCAL_NLP_PATH = os.path.normpath(os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "..", "..", "..", "..",
    "data_science", "src", "nlp"
))

# Priorizar la ruta Docker si existe, si no usar la ruta local
_NLP_PATH = _DOCKER_NLP_PATH if os.path.exists(_DOCKER_NLP_PATH) else _LOCAL_NLP_PATH

if _NLP_PATH not in sys.path:
    sys.path.insert(0, _NLP_PATH)

# -----------------------------------------------------------------------------
# Ruta al modelo exportado — misma lógica dual Docker/local
# -----------------------------------------------------------------------------
_DOCKER_MODELO_PATH = "/data_science/modelo_exportado"
_LOCAL_MODELO_PATH = os.path.normpath(os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "..", "..", "..", "..",
    "data_science", "modelo_exportado"
))
_MODELO_PATH = _DOCKER_MODELO_PATH if os.path.exists(_DOCKER_MODELO_PATH) else _LOCAL_MODELO_PATH

from inferencia_local import cargar_modelo, predecir_texto
from app.schemas.nlp import ClasificadorRequest, ClasificadorResponse

# -----------------------------------------------------------------------------
# CARGA ÚNICA DEL MODELO AL INICIAR EL SERVIDOR
# Se ejecuta una sola vez cuando FastAPI arranca.
# -----------------------------------------------------------------------------
print(f"🤖 Cargando modelo BERT_CNN desde: {_MODELO_PATH}")
_modelo, _tokenizador, _metadatos = cargar_modelo(_MODELO_PATH)
print("✅ Modelo listo para inferencia.")


# -----------------------------------------------------------------------------
# FUNCIÓN DE SERVICIO
# -----------------------------------------------------------------------------
def clasificar_texto(request: ClasificadorRequest) -> ClasificadorResponse:
    """
    Recibe un ClasificadorRequest, ejecuta la inferencia y
    retorna un ClasificadorResponse listo para el frontend.
    """
    resultado = predecir_texto(
        texto=request.texto,
        modelo=_modelo,
        tokenizador=_tokenizador,
        metadatos=_metadatos
    )

    if resultado["fuera_de_dominio"]:
        mensaje = (
            f"Tu pregunta no corresponde a ninguna área CENEVAL "
            f"(confianza máxima: {resultado['confianza_pct']}%). "
            f"Intenta reformularla con términos más específicos."
        )
    else:
        mensaje = (
            f"Tu pregunta corresponde al área: {resultado['etiqueta_predicha']} "
            f"con una confianza del {resultado['confianza_pct']}%."
        )

    return ClasificadorResponse(
        etiqueta_predicha=resultado["etiqueta_predicha"],
        clase_numerica=resultado["clase_numerica"],
        confianza_pct=resultado["confianza_pct"],
        fuera_de_dominio=resultado["fuera_de_dominio"],
        todas_las_probs=resultado["todas_las_probs"],
        mensaje=mensaje
    )