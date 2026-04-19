import pandas as pd
import os

# 1. Definir la ruta relativa hacia tus datos crudos
# Asumiendo que corres el script desde la carpeta 'data_science'
RAW_DIR = "data/raw/" 

# 2. El Contrato de Datos: Mapeo de archivos exactos a Etiquetas CENEVAL
# Revisa que los nombres coincidan EXACTAMENTE con los de tu carpeta
MAPEO_ARCHIVOS = {
    # 0: Algoritmia
    "algoritmia.txt": 0,
    "algoritmia-2.txt": 0,
    
    # 1: Software de Base
    "arquitectura-computadoras.txt": 1, # Ajusta si el nombre completo es distinto
    
    # 2: Software de Aplicación
    "base-datos.txt": 2,
    "Sistema-base-datos.txt": 2,
    "ciberseguridad.txt": 2, # Ajusta el nombre completo si es necesario
    "lenguajes-programacion.txt": 2,
    "programacion-objetos.txt": 2, # Ajusta el nombre de POO
    
    # 3: Cómputo Inteligente
    "computo-distribuido.txt": 3,
    "computo-inteligente.txt": 3,
    "inteligencia-computacional.txt": 3,
    
    # Nota: 'mezcladas-1.txt' es un reto. 
    # Si tiene preguntas de todas las áreas, es mejor ignorarlo por ahora 
    # para no etiquetar incorrectamente.
}

def unificar_dataset():
    dataframes = []
    print("⚙️ Iniciando extracción y mapeo de datos...")

    for archivo, etiqueta in MAPEO_ARCHIVOS.items():
        ruta_completa = os.path.join(RAW_DIR, archivo)
        
        if not os.path.exists(ruta_completa):
            print(f"⚠️ Advertencia: No se encontró {archivo}. Revisa el nombre exacto.")
            continue
            
        try:
            datos_archivo = []
            
            # 1. Abrimos el archivo de forma nativa
            with open(ruta_completa, 'r', encoding='utf-8') as file:
                for linea in file:
                    linea = linea.strip() # Quitamos espacios y saltos de línea al inicio y fin
                    if not linea:
                        continue # Si la línea está vacía, nos la saltamos
                    
                    # 2. LA MAGIA: split(',', 1) corta SOLO en la primera coma.
                    partes = linea.split(',', 1)
                    
                    # 3. Verificamos que realmente se haya partido en dos (Pregunta y Respuesta)
                    if len(partes) == 2:
                        datos_archivo.append({
                            "texto": partes[0].strip(),
                            "respuesta": partes[1].strip()
                        })
            
            # 4. Convertimos nuestra lista limpia en un DataFrame de Pandas
            df_temp = pd.DataFrame(datos_archivo)
            
            # Verificamos que no esté vacío antes de agregarlo
            if not df_temp.empty:
                df_temp["etiqueta"] = etiqueta
                df_temp["area_origen"] = archivo.replace(".txt", "")
                
                dataframes.append(df_temp)
                print(f"✅ {archivo} cargado: {len(df_temp)} preguntas -> Etiqueta {etiqueta}")
            else:
                print(f"⚠️ {archivo} se leyó pero no contenía el formato esperado.")
                
        except Exception as e:
            print(f"❌ Error crítico al procesar {archivo}: {e}")

    if not dataframes:
        print("❌ No se pudo cargar ningún archivo. Revisa las rutas.")
        return

    df_final = pd.concat(dataframes, ignore_index=True)
    df_final = df_final.sample(frac=1).reset_index(drop=True)

    ruta_salida = "data/dataset_base.csv"
    df_final.to_csv(ruta_salida, index=False, encoding='utf-8')
    
    print("-" * 40)
    print(f"🚀 Extracción completada. Dataset guardado en: {ruta_salida}")
    print(f"📊 Total de preguntas base: {len(df_final)}")
    
    print("\nBalance de clases (0=Algoritmia, 1=SoftBase, 2=SoftApp, 3=IA):")
    print(df_final['etiqueta'].value_counts())

if __name__ == "__main__":
    unificar_dataset()