import json
import os
import sys

# Agregamos la ruta raíz del backend para poder importar nuestros modelos
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app.models.exam import Exam
from app.models.question import Question

def seed_database():
    db = SessionLocal()
    
    try:
        # 1. Crear un Examen Maestro si no existe
        examen_diagnostico = db.query(Exam).filter(Exam.title == "CENEVAL Diagnóstico Global").first()
        if not examen_diagnostico:
            print("Creando Examen Maestro...")
            examen_diagnostico = Exam(title="CENEVAL Diagnóstico Global", description="Examen base para el motor de Machine Learning")
            db.add(examen_diagnostico)
            db.commit()
            db.refresh(examen_diagnostico)
        
        # 2. Leer el archivo JSON
        json_path = os.path.join(os.path.dirname(__file__), 'data', 'preguntas_ceneval.json')
        with open(json_path, 'r', encoding='utf-8') as file:
            preguntas_data = json.load(file)
            
        # 3. Inyectar las preguntas
        print(f"Inyectando {len(preguntas_data)} preguntas en la base de datos...")
        preguntas_insertadas = 0
        
        for p_data in preguntas_data:
            # Verificamos que la pregunta no exista ya (para evitar duplicados si corres el script 2 veces)
            existe = db.query(Question).filter(Question.text == p_data['text']).first()
            if not existe:
                nueva_pregunta = Question(
                    text=p_data['text'],
                    option_a=p_data['option_a'],
                    option_b=p_data['option_b'],
                    option_c=p_data['option_c'],
                    option_d=p_data['option_d'],
                    correct_answer=p_data['correct_answer'],
                    category=p_data['category'],
                    difficulty=p_data['difficulty'],
                    exam_id=examen_diagnostico.id
                )
                db.add(nueva_pregunta)
                preguntas_insertadas += 1
                
        db.commit()
        print(f"¡Éxito! Se insertaron {preguntas_insertadas} preguntas nuevas al examen con ID {examen_diagnostico.id}.")

    except Exception as e:
        print(f"Error durante la inyección de datos: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()