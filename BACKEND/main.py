from fastapi import FastAPI, HTTPException, Depends, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jwt import encode as jwt_encode, decode, InvalidTokenError, ExpiredSignatureError
from datetime import datetime, timedelta, timezone
from typing import List, Tuple
import secrets
import oracledb

# Initialize FastAPI app
app = FastAPI()
app.title = "Examenes (Universidad del Qundío)"
app.version = "1.0.1"

# Configuración de CORS
origins = [
    "http://localhost",
    "http://localhost:4200",
    "https://beltximsoft.netlify.app",  # URL de tu aplicación Angular
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)

# Security
security = HTTPBearer()

# Database connection
dsn = oracledb.makedsn("localhost", 1521, service_name="xe")
connection = oracledb.connect(user="SYSTEM", password="12345", dsn=dsn)

# Print Oracle client version
print(connection.version)

clave_secreta = secrets.token_hex(16)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Examenes API"}

@app.get("/db-version")
def get_db_version():
    return {"db_version": connection.version}


# Lista de tokens inválidos
tokens_invalidos = []

# Helper function to get database cursor
def get_cursor():
    return connection.cursor()

# function to get JWT token creation
def create_jwt_token(user_id: int, is_professor: bool):
    payload = {
        'user_id': user_id,
        'is_professor': is_professor,
        'exp': datetime.utcnow() + timedelta(hours=1)  # Token expires in 1 hour
    }
    return jwt_encode(payload, clave_secreta, algorithm='HS256')

# Verificar token
def verificar_token(token: str = Depends(security)):
    try:
        payload = decode(token.credentials, clave_secreta, algorithms=["HS256"])
        usuario_id = payload["user_id"]
        is_professor = payload["is_professor"]
        expiracion_timestamp = payload["exp"]
        expiracion = datetime.fromtimestamp(expiracion_timestamp, tz=timezone.utc)
        if expiracion > datetime.now(timezone.utc) and token.credentials not in tokens_invalidos:
            return usuario_id, is_professor
        else:
            raise HTTPException(status_code=401, detail="Token expirado o inválido")
    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado")
    except InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token inválido")

# Login endpoint
@app.post("/login", tags=['Sesion'])
def login(id: int = Body(...), password: str = Body(...), is_professor: int = Body(...)):
    if is_professor not in [0, 1]:
        raise HTTPException(status_code=400, detail="is_professor must be 0 for student or 1 for professor")

    cursor = get_cursor()
    try:
        if is_professor == 1:
            result = cursor.callfunc("LOGIN_PROFESOR", int, [id, password])
        else:
            result = cursor.callfunc("LOGIN_ESTUDIANTE", int, [id, password])

        if result == 1:
            token = create_jwt_token(user_id=id, is_professor=bool(is_professor))
            return {"token": token}
        else:
            raise HTTPException(status_code=401, detail="Invalid credentials")
    finally:
        cursor.close()

# Logout endpoint
@app.post("/logout", tags=['Sesion'])
def logout(token: str = Depends(security)):
    tokens_invalidos.append(token.credentials)
    return {"message": "Logged out successfully"}

# Endpoint de prueba
@app.get("/protected", tags=['home'])
def protected_route(user_info: Tuple[int, bool] = Depends(verificar_token)):
    user_id, is_professor = user_info
    if is_professor:
        return {"message": f"Bienvenido, profesor {user_id}!"}
    else:
        return {"message": f"Bienvenido, estudiante {user_id}!"}

@app.get("/protected", tags=['home'])
def protected_route(user_id: int = Depends(verificar_token)):
    return {"message": f"¡Bienvenido, usuario {user_id}!"}

# Endpoint de Reporte de los exámenes presentados por cada estudiante con su puntaje promedio y el número total de exámenes presentados
@app.get("/consultas/estudiantes", tags=['Consultas para Profesores'])
def consultar_estudiantes(user_info: Tuple[int, bool] = Depends(verificar_token)):
    user_id, is_professor = user_info
    if not is_professor:
        raise HTTPException(status_code=403, detail="Solo los profesores pueden acceder a esta consulta.")
    with get_cursor() as cursor:
        cursor.execute("""
            SELECT e.Nombre AS Estudiante,
                AVG(pe.Puntaje) AS Puntaje_Promedio,
                COUNT(pe.ID_Presentacion_Examen) AS Total_Examenes_Presentados
            FROM Estudiante e
            JOIN Presentacion_Examen pe ON e.ID_Estudiante = pe.ID_Estudiante
            GROUP BY e.ID_Estudiante, e.Nombre
        """)
        result = cursor.fetchall()
        return result

# Endpoint de Reporte de los cursos con sus profesores asignados y el número total de exámenes disponibles para cada curso
@app.get("/consultas/cursos", tags=['Consultas para Profesores'])
def consultar_cursos():
    
    with get_cursor() as cursor:
        cursor.execute("""
            SELECT c.Nombre AS Curso,
                p.Nombre AS Profesor,
                COUNT(e.ID_Examen) AS Total_Examenes
            FROM Curso c
            JOIN Profesor p ON c.ID_Curso = p.ID_Profesor
            LEFT JOIN Examen e ON c.ID_Curso = e.ID_Curso
            GROUP BY c.ID_Curso, c.Nombre, p.Nombre
        """)
        result = cursor.fetchall()
        return result

# Endpoint para Reporte de los estudiantes por grupo con el número total de exámenes presentados y el promedio de puntaje en los exámenes
@app.get("/reporte/examenes-grupo", tags=['Reportes'])
def reporte_examenes_grupo(user_info: Tuple[int, bool] = Depends(verificar_token)):
    user_id, is_professor = user_info
    if not is_professor:
        raise HTTPException(status_code=403, detail="No tienes permiso para acceder a esta consulta")
    with get_cursor() as cursor:
        cursor.execute("""
            SELECT g.Nombre AS Grupo,
                e.Nombre AS Estudiante,
                COUNT(pe.ID_Presentacion_Examen) AS Total_Examenes_Presentados,
                AVG(pe.Puntaje) AS Puntaje_Promedio
            FROM Estudiante_Grupo eg
            JOIN Estudiante e ON eg.ID_Estudiante = e.ID_Estudiante
            JOIN Grupo g ON eg.ID_Grupo = g.ID_Grupo
            LEFT JOIN Presentacion_Examen pe ON e.ID_Estudiante = pe.ID_Estudiante
            GROUP BY g.ID_Grupo, g.Nombre, e.ID_Estudiante, e.Nombre
            ORDER BY g.Nombre, e.Nombre
        """)
        result = cursor.fetchall()
        return result

# Endpoint para Reporte de los grupos asignados a cada estudiante, indicando el nombre del estudiante y del grupo al que pertenece
@app.get("/reporte/estudiantes-grupo", tags=['Reportes'])
def reporte_estudiantes_grupo(user_info: Tuple[int, bool] = Depends(verificar_token)):
    user_id, is_professor = user_info
    if not is_professor:
        raise HTTPException(status_code=403, detail="No tienes permiso para acceder a esta consulta")
    with get_cursor() as cursor:
        cursor.execute("""
            SELECT e.Nombre AS Estudiante,
                g.Nombre AS Grupo
            FROM Estudiante_Grupo eg
            JOIN Estudiante e ON eg.ID_Estudiante = e.ID_Estudiante
            JOIN Grupo g ON eg.ID_Grupo = g.ID_Grupo
            ORDER BY e.Nombre, g.Nombre
        """)
        result = cursor.fetchall()
        return result

# Endpoint para Reporte de los estudiantes que obtuvieron el mayor puntaje en los exámenes
@app.get("/reporte/estudiantes-mejor-puntaje", tags=['Reportes'])
def reporte_estudiantes_mejor_puntaje(user_info: Tuple[int, bool] = Depends(verificar_token)):
    user_id, is_professor = user_info
    if not is_professor:
        raise HTTPException(status_code=403, detail="No tienes permiso para acceder a esta consulta")
    with get_cursor() as cursor:
        cursor.execute("""
            SELECT pe.ID_Estudiante AS Estudiante,
                e.Nombre AS Estudiante_Nombre,
                pe.ID_Examen AS Examen,
                pe.Puntaje
            FROM Presentacion_Examen pe
            JOIN Estudiante e ON pe.ID_Estudiante = e.ID_Estudiante
            WHERE pe.Puntaje = (
                SELECT MAX(Puntaje)
                FROM Presentacion_Examen
                WHERE ID_Examen = pe.ID_Examen
            )
            ORDER BY pe.ID_Examen, pe.Puntaje DESC
        """)
        result = cursor.fetchall()
        return result

# Endpoint para Reporte de los exámenes presentados por los estudiantes en un grupo específico
@app.get("/reporte/examenes-grupo-especifico", tags=['Reportes'])
def reporte_examenes_grupo_especifico(grupo: str, user_info: Tuple[int, bool] = Depends(verificar_token)):
    user_id, is_professor = user_info
    if not is_professor:
        raise HTTPException(status_code=403, detail="No tienes permiso para acceder a esta consulta")
    with get_cursor() as cursor:
        cursor.execute("""
            SELECT g.Nombre AS Grupo,
                e.Nombre AS Estudiante,
                pe.Fecha_Presentacion,
                pe.Puntaje,
                ex.Nombre AS Examen
            FROM Estudiante_Grupo eg
            JOIN Estudiante e ON eg.ID_Estudiante = e.ID_Estudiante
            JOIN Grupo g ON eg.ID_Grupo = g.ID_Grupo
            JOIN Presentacion_Examen pe ON e.ID_Estudiante = pe.ID_Estudiante
            JOIN Examen ex ON pe.ID_Examen = ex.ID_Examen
            WHERE g.Nombre = :grupo
            ORDER BY e.Nombre, pe.Fecha_Presentacion
        """, {"grupo": grupo})
        result = cursor.fetchall()
        return result

# Endpoint para Reporte de los cursos y los exámenes programados para ellos
@app.get("/reporte/cursos-examenes-programados", tags=['Reportes'])
def reporte_cursos_examenes_programados(user_info: Tuple[int, bool] = Depends(verificar_token)):
    user_id, is_professor = user_info
    if not is_professor:
        raise HTTPException(status_code=403, detail="No tienes permiso para acceder a esta consulta")
    with get_cursor() as cursor:
        cursor.execute("""
            SELECT c.Nombre AS Curso,
                ex.Nombre AS Examen,
                COUNT(ep.ID_Examen) AS Total_Preguntas
            FROM Curso c
            JOIN Examen ex ON c.ID_Curso = ex.ID_Curso
            JOIN Examen_Pregunta ep ON ex.ID_Examen = ep.ID_Examen
            GROUP BY c.ID_Curso, c.Nombre, ex.ID_Examen, ex.Nombre
        """)
        result = cursor.fetchall()
        return result

# Endpoint para Reporte de los estudiantes y su puntaje más alto obtenido en los exámenes
@app.get("/reporte/estudiantes-puntaje-maximo", tags=['Reportes'])
def reporte_estudiantes_puntaje_maximo(user_info: Tuple[int, bool] = Depends(verificar_token)):
    user_id, is_professor = user_info
    if not is_professor:
        raise HTTPException(status_code=403, detail="No tienes permiso para acceder a esta consulta")
    with get_cursor() as cursor:
        cursor.execute("""
            SELECT e.Nombre AS Estudiante,
                MAX(pe.Puntaje) AS Puntaje_Maximo
            FROM Estudiante e
            JOIN Presentacion_Examen pe ON e.ID_Estudiante = pe.ID_Estudiante
            GROUP BY e.ID_Estudiante, e.Nombre
        """)
        result = cursor.fetchall()
        return result

# Endpoint para Reporte de los grupos con el número total de estudiantes asignados
@app.get("/reporte/grupos-estudiantes", tags=['Reportes'])
def reporte_grupos_estudiantes(user_info: Tuple[int, bool] = Depends(verificar_token)):
    user_id, is_professor = user_info
    if not is_professor:
        raise HTTPException(status_code=403, detail="No tienes permiso para acceder a esta consulta")
    with get_cursor() as cursor:
        cursor.execute("""
            SELECT g.Nombre AS Grupo,
                COUNT(eg.ID_Estudiante) AS Total_Estudiantes
            FROM Grupo g
            JOIN Estudiante_Grupo eg ON g.ID_Grupo = eg.ID_Grupo
            GROUP BY g.ID_Grupo, g.Nombre
        """)
        result = cursor.fetchall()
        return result

# Endpoint para Reporte de las preguntas asignadas a cada examen con la cantidad de veces que se ha presentado cada pregunta
@app.get("/reporte/preguntas-examen", tags=['Reportes'])
def reporte_preguntas_examen(user_info: Tuple[int, bool] = Depends(verificar_token)):
    user_id, is_professor = user_info
    if not is_professor:
        raise HTTPException(status_code=403, detail="Solo los profesores pueden acceder a esta consulta.")
    with get_cursor() as cursor:
        cursor.execute("""
            SELECT e.Nombre AS Examen,
                p.texto,
                COUNT(pe.ID_Presentacion_Examen) AS Veces_Presentada
            FROM Examen e
            JOIN Examen_Pregunta ep ON e.ID_Examen = ep.ID_Examen
            JOIN Pregunta p ON ep.ID_Pregunta = p.ID_Pregunta
            LEFT JOIN Presentacion_Examen pe ON e.ID_Examen = pe.ID_Examen
            GROUP BY e.ID_Examen, e.Nombre, p.texto
        """)
        result = cursor.fetchall()
        return result

# Endpoint para obtener exámenes de un profesor específico
@app.get("/examenes", tags=['Exámenes del Profesor'])
def obtener_examenes_profesor( user_info: Tuple[int, bool] = Depends(verificar_token)):
    user_id, is_professor = user_info
    if not is_professor:
        raise HTTPException(status_code=403, detail="No tienes permiso para acceder a esta consulta")
    with get_cursor() as cursor:
        cursor.execute("""
            SELECT
                ID_EXAMEN,
                NOMBRE,
                DESCRIPCION,
                CANTIDAD_DE_PREGUNTAS,
                TIEMPO_LIMITE,
                ID_CURSO,
                ORDEN
            FROM
                EXAMEN E
            WHERE
                ID_PROFESOR = :p_id
        """, {"p_id": user_id})
        result = cursor.fetchall()
        return result

# Endpoint para obtener preguntas de un examen  específico
@app.get("/preguntas-examen/{id_examen}", tags=['Preguntas del Examen'])
def obtener_preguntas_examen(id_examen: int, user_info: Tuple[int, bool] = Depends(verificar_token)):
    with get_cursor() as cursor:
        cursor.execute("""
            SELECT
                P.*
            FROM
                PREGUNTA P
            INNER JOIN
                EXAMEN_PREGUNTA EP ON EP.ID_PREGUNTA = P.ID_PREGUNTA AND ID_EXAMEN = :p_id
        """, {"p_id": id_examen})
        result = cursor.fetchall()
        return result

# Endpoint para obtener exámenes con id específico
@app.get("/examen/{id_examen}", tags=['Exámen'])
def obtener_examen(id_examen: int, user_info: Tuple[int, bool] = Depends(verificar_token)):
    with get_cursor() as cursor:
        cursor.execute("""
            SELECT
                ID_EXAMEN,
                NOMBRE,
                DESCRIPCION,
                CANTIDAD_DE_PREGUNTAS,
                TIEMPO_LIMITE,
                ID_CURSO,
                ORDEN
            FROM
                EXAMEN E
            WHERE
                ID_EXAMEN = :p_id
        """, {"p_id": id_examen})
        result = cursor.fetchall()
        return result

# Endpoint para obtener exámenes no presentados de un estudiante en específico
@app.get("/examenes-asignados", tags=['Exámenes Asignados no Presentados'])
def obtener_examenes_asignados(user_info: Tuple[int, bool] = Depends(verificar_token)):
    user_id, is_professor = user_info
    if is_professor:
        raise HTTPException(status_code=403, detail="No tienes permiso para acceder a esta consulta")
    with get_cursor() as cursor:
        cursor.execute("""
            SELECT
                E.ID_EXAMEN,
                E.NOMBRE,
                E.DESCRIPCION,
                E.CANTIDAD_DE_PREGUNTAS,
                E.TIEMPO_LIMITE,
                E.ID_CURSO,
                E.ORDEN
            FROM
                EXAMEN E
            INNER JOIN
                EXAMEN_HORARIO EH ON E.ID_EXAMEN = EH.ID_EXAMEN
            INNER JOIN
                GRUPO_HORARIO GH ON GH.ID_HORARIO = EH.ID_HORARIO
            INNER JOIN
                GRUPO G ON G.ID_GRUPO = GH.ID_GRUPO
            INNER JOIN
                ESTUDIANTE_GRUPO EG ON EG.ID_GRUPO = G.ID_GRUPO
            LEFT JOIN
                PRESENTACION_EXAMEN PE ON E.ID_EXAMEN = PE.ID_EXAMEN AND PE.ID_ESTUDIANTE = EG.ID_ESTUDIANTE
            WHERE
                EG.ID_ESTUDIANTE = :p_id
                AND PE.ID_EXAMEN IS NULL
        """, {"p_id": user_id})
        result = cursor.fetchall()
        return result

# Endpoint para obtener exámenes no presentados de un estudiante en específico
@app.get("/obtener-notas", tags=['Notas del estudiante'])
def obtener_notas(user_info: Tuple[int, bool] = Depends(verificar_token)):
    user_id, is_professor = user_info
    if is_professor:
        raise HTTPException(status_code=403, detail="No tienes permiso para acceder a esta consulta")
    with get_cursor() as cursor:
        cursor.execute("""
            SELECT
                PE.PUNTAJE,
                E.NOMBRE,
                E.DESCRIPCION,
                E.CANTIDAD_DE_PREGUNTAS,
                C.NOMBRE,
                P.NOMBRE
            FROM
                PRESENTACION_EXAMEN PE
            INNER JOIN
                EXAMEN E ON E.ID_EXAMEN = PE.ID_EXAMEN
            INNER JOIN
                PROFESOR P ON E.ID_PROFESOR = P.ID_PROFESOR
            LEFT JOIN
                CURSO C ON C.ID_CURSO = E.ID_CURSO
            WHERE
                ID_ESTUDIANTE = :p_id
        """, {"p_id": user_id})
        result = cursor.fetchall()
        return result

# Endpoint para obtener contenidos y unidades de un estudiante en específico
@app.get("/contenidos-estudiante-notas", tags=['Contenidos del estudiante'])
def get_contenidos_estudiante(user_info: Tuple[int, bool] = Depends(verificar_token)):
    user_id, is_professor = user_info
    if is_professor:
        raise HTTPException(status_code=403, detail="No tienes permiso para acceder a esta consulta")
    with get_cursor() as cursor:
        cursor.execute("""
            SELECT
                C.NOMBRE,
                CU.DESCRIPCIÓN,
                UC.NOMBRE,
                E.NOMBRE
            FROM
                CURSO C
            INNER JOIN
                UNIDAD_DE_CURSO UC ON UC.ID_CURSO = C.ID_CURSO
            INNER JOIN
                CONTENIDO_DE_UNIDAD CU ON CU.ID_UNIDAD = UC.ID_UNIDAD
            INNER JOIN
                EXAMEN E ON E.ID_CURSO = C.ID_CURSO
            INNER JOIN
                EXAMEN_HORARIO EH ON EH.ID_EXAMEN = E.ID_EXAMEN
            INNER JOIN
                GRUPO_HORARIO GH ON GH.ID_HORARIO = EH.ID_HORARIO
            INNER JOIN
                GRUPO G ON G.ID_GRUPO = GH.ID_GRUPO
            INNER JOIN
                ESTUDIANTE_GRUPO EG ON EG.ID_GRUPO = GH.ID_GRUPO AND EG.ID_ESTUDIANTE = :p_id
        """, {"p_id": user_id})
        result = cursor.fetchall()
        return result

# Cursos:
@app.get("/cursos", tags=['Cursos'],)
def get_cursos(user_id: int = Depends(verificar_token)):
    with get_cursor() as cursor:
        cursor.execute("""
            SELECT
                C.*
            FROM
                "CURSO" C
        """)
        result = cursor.fetchall()
        return result

# Endpoint to fetch schedules
@app.get("/horarios", tags=['Horarios disponibles'],)
def get_horarios(user_id: int = Depends(verificar_token), semana: int = None, semestre: str = None):
    with get_cursor() as cursor:
        cursor.execute("""
            SELECT
                H."ID_HORARIO",
                H."DIA",
                H."HORA",
                H."SEMANA",
                H."SEMESTRE",
                H."INDICE_DIA",
                CASE
                    WHEN MAX(CASE WHEN GH."ID_GRUPO" IS NOT NULL THEN 1 ELSE 0 END) = 1 THEN 'SI'
                    ELSE 'NO'
                END AS "GRUPO_ASOCIADO",
                CASE
                    WHEN MAX(CASE WHEN EH."ID_EXAMEN" IS NOT NULL THEN 1 ELSE 0 END) = 1 THEN 'SI'
                    ELSE 'NO'
                END AS "EXAMEN_ASOCIADO"
            FROM
                "HORARIO" H
            LEFT JOIN
                "GRUPO_HORARIO" GH ON H."ID_HORARIO" = GH."ID_HORARIO"
            LEFT JOIN
                "EXAMEN_HORARIO" EH ON H."ID_HORARIO" = EH."ID_HORARIO"
            WHERE
                H."SEMANA" = :semana
            AND
                H."SEMESTRE" = :semestre
            GROUP BY
                H."ID_HORARIO", H."DIA", H."HORA", H."SEMANA", H."SEMESTRE", H."INDICE_DIA"
            ORDER BY
                H."INDICE_DIA", H."HORA", H."SEMESTRE" ASC
        """, {"semana": semana, "semestre": semestre})
        result = cursor.fetchall()
        return result


@app.get("/semestres", tags=['Semestres disponibles'],)
def get_semestres(user_id: int = Depends(verificar_token)):
    with get_cursor() as cursor:
        cursor.execute("""
            SELECT SEMESTRE, count(DISTINCT SEMANA)
            FROM "HORARIO"
            GROUP BY SEMESTRE
            ORDER BY SEMESTRE  ASC
        """)
        result = cursor.fetchall()
        return result

# Endpoint to fetch students for a group
@app.get("/estudiantes/{id_grupo}", tags=['Ver estudiantes por grupo'])
def get_estudiantes(id_grupo: int, user_id: int = Depends(verificar_token)):
    with get_cursor() as cursor:
        cursor.execute("""
            SELECT E.*
            FROM "ESTUDIANTE" E
            JOIN "ESTUDIANTE_GRUPO" EG ON E."ID_ESTUDIANTE" = EG."ID_ESTUDIANTE"
            WHERE EG."ID_GRUPO" = :id_grupo
        """, id_grupo=id_grupo)
        result = cursor.fetchall()
        return result

# Endpoint to fetch student schedules for a group
@app.get("/estudiante_horarios", tags=['Ver el horario de estudiante'])
def get_estudiantes_horarios(user_info: Tuple[int, bool] = Depends(verificar_token), semana: int = None, semestre: str = None):
    user_id, is_professor = user_info
    if is_professor:
        raise HTTPException(status_code=403, detail="No tienes permiso para acceder a esta consulta")
    with get_cursor() as cursor:
        cursor.execute("""
            SELECT
                H."ID_HORARIO",
                H."DIA",
                H."HORA",
                H."SEMANA",
                H."SEMESTRE",
                H."INDICE_DIA",
                CASE
                    WHEN MAX(CASE WHEN GH."ID_GRUPO" IS NOT NULL THEN 1 ELSE 0 END) = 1 THEN 'SI'
                    ELSE 'NO'
                END AS "GRUPO_ASOCIADO"
            FROM
                "HORARIO" H
            INNER JOIN
                "GRUPO_HORARIO" GH ON H."ID_HORARIO" = GH."ID_HORARIO"
            INNER JOIN
                "ESTUDIANTE_GRUPO" EG ON GH."ID_GRUPO" = EG."ID_GRUPO"
            WHERE
                H."SEMANA" = :semana
            AND
                H."SEMESTRE" = :semestre
            AND
                EG.ID_ESTUDIANTE = :p_id
            GROUP BY
                H."ID_HORARIO", H."DIA", H."HORA", H."SEMANA", H."SEMESTRE", H."INDICE_DIA"
            ORDER BY
                H."INDICE_DIA", H."HORA", H."SEMESTRE" ASC
        """, {"p_id": user_id, "semana": semana, "semestre": semestre})
        result = cursor.fetchall()
        return result

#Banco de preguntas disponibles para un profesor
@app.get("/banco_preguntas/{id_profe}", tags=['Banco Preguntas'])
def get_banco_preguntas(id_profe: int, tema: str = None, user_id: int = Depends(verificar_token)):
    if tema is None:
        tema = "No definido"  # Valor predeterminado si no se proporciona un tema en la URL

    with get_cursor() as cursor:
        cursor.execute("""
            SELECT
                P.ID_PREGUNTA,
                P.TEXTO,
                P.OPCIONES,
                P.RESPUESTAS_CORRECTAS,
                P.ID_TIPO,
                P.TEMA,
                CASE
                    WHEN P.PRIVACIDAD = 0 THEN 'PUBLICA'
                    WHEN P.PRIVACIDAD = 1 THEN 'PRIVADA'
                    ELSE 'DESCONOCIDA'
                END AS PRIVACIDAD
            FROM PREGUNTA P
            INNER JOIN EXAMEN_PREGUNTA EP ON P.ID_PREGUNTA = EP.ID_PREGUNTA
            INNER JOIN EXAMEN E ON EP.ID_EXAMEN = E.ID_EXAMEN
            WHERE (P.TEMA = :tema AND P.PRIVACIDAD = 0)
            OR (P.TEMA = :tema AND E.ID_PROFESOR = :id_profe )
            ORDER BY P.TEXTO
        """, tema=tema, id_profe=id_profe)
        result = cursor.fetchall()
        return result


#Preguntas privadas de un profesor por tema
@app.get("/preguntas_privadas/{id_profe}", tags=['Banco Preguntas'])
def get_banco_preguntas(id_profe: int, tema: str = None, user_id: int = Depends(verificar_token)):
    if tema is None:
        tema = "No definido"  # Valor predeterminado si no se proporciona un tema en la URL

    with get_cursor() as cursor:
        cursor.execute("""
            SELECT P.ID_PREGUNTA, P.TEXTO, P.OPCIONES, P.RESPUESTAS_CORRECTAS, P.ID_TIPO, P.TEMA,
                CASE
                    WHEN P.PRIVACIDAD = 0 THEN 'PUBLICA'
                    WHEN P.PRIVACIDAD = 1 THEN 'PRIVADA'
                    ELSE 'DESCONOCIDA'
                END AS PRIVACIDAD
            FROM PREGUNTA P
            INNER JOIN EXAMEN_PREGUNTA EP ON P.ID_PREGUNTA = EP.ID_PREGUNTA
            INNER JOIN EXAMEN E ON EP.ID_EXAMEN = E.ID_EXAMEN
            WHERE (P.TEMA = :tema AND E.ID_PROFESOR = :id_profe )
            ORDER BY P.TEXTO
        """, tema=tema, id_profe=id_profe)
        result = cursor.fetchall()
        return result

#Todas las preguntas privadas de un profesor
@app.get("/mis_preguntas/{id_profe}", tags=['Banco Preguntas'])
def get_banco_preguntas(id_profe: int, user_id: int = Depends(verificar_token)):

    with get_cursor() as cursor:
        cursor.execute("""
            SELECT P.ID_PREGUNTA, P.TEXTO, P.OPCIONES, P.RESPUESTAS_CORRECTAS, P.ID_TIPO, P.TEMA,
                CASE
                    WHEN P.PRIVACIDAD = 0 THEN 'PUBLICA'
                    WHEN P.PRIVACIDAD = 1 THEN 'PRIVADA'
                    ELSE 'DESCONOCIDA'
                END AS PRIVACIDAD
            FROM PREGUNTA P
            INNER JOIN EXAMEN_PREGUNTA EP ON P.ID_PREGUNTA = EP.ID_PREGUNTA
            INNER JOIN EXAMEN E ON EP.ID_EXAMEN = E.ID_EXAMEN
            WHERE E.ID_PROFESOR = :id_profe
            ORDER BY P.TEXTO
        """, id_profe=id_profe)
        result = cursor.fetchall()
        return result

# Endpoint para almacenar la presentación del examen
@app.post("/almacenar_presentacion_examen/", tags=['Presentación del Examen'])
def almacenar_presentacion_examen(
    p_id_estudiante: int,
    p_id_examen: int,
    p_fecha_presentacion: str,
    p_tiempo_tomado: str,
    p_respuestas: str,
    p_direccion_ip: str = None,
    user_info: Tuple[int, bool] = Depends(verificar_token)
):
    user_id, is_professor = user_info
    if is_professor:
        raise HTTPException(status_code=403, detail="Solo los estudiantes pueden presentar un examen")
    try:
        cursor = get_cursor()
        v_id_presentacion_examen = cursor.callfunc('almacenar_presentacion_examen', int, [
            p_id_estudiante,
            p_id_examen,
            p_fecha_presentacion,
            p_tiempo_tomado,
            p_direccion_ip,
            p_respuestas
        ])
        connection.commit()
        return {"message": "Presentación de examen almacenada correctamente", "id_presentacion_examen": v_id_presentacion_examen}
    except cx_Oracle.Error as error:
        return {"message": f"Error al almacenar la presentación del examen: {error}"}
    finally:
        cursor.close()


# Endpoint para crear un examen
@app.post("/examen/crear", tags=['Exámenes'])
def crear_examen(
    nombre: str = Body(...),
    descripcion: str = Body(...),
    cantidad_preguntas: int = Body(...),
    tiempo_limite: int = Body(...),
    id_curso: int = Body(...),
    orden: str = Body(...),
    horario: str = Body(...),
    user_info: Tuple[int, bool] = Depends(verificar_token)
):
    user_id, is_professor = user_info
    if not is_professor:
        raise HTTPException(status_code=403, detail="Solo los profesores pueden acceder a esta consulta.")
    cursor = get_cursor()
    try:
        if is_professor:
            result = cursor.callfunc("agregar_examen", int, [nombre, descripcion, cantidad_preguntas, tiempo_limite, id_curso, user_id, orden])
            cursor.execute("INSERT INTO EXAMEN_HORARIO (ID_EXAMEN, ID_HORARIO) VALUES (:id_examen, :id_horario)", id_examen=result, id_horario=horario)
            connection.commit()
            return {"id_examen": result}
        else :
            return {"ERROR": "Debes ser un profesor"}
    finally:
        cursor.close()

# Endpoint para actualizar un examen
@app.put("/examen/actualizar", tags=['Exámenes'])
def actualizar_examen(
    id_examen: int = Body(...),
    nombre: str = Body(...),
    descripcion: str = Body(...),
    cantidad_preguntas: int = Body(...),
    tiempo_limite: int = Body(...),
    id_curso: int = Body(...),
    id_profesor: int = Body(...),
    orden: str = Body(...),
    user_id: int = Depends(verificar_token)
):
    cursor = get_cursor()
    try:
        result = cursor.callfunc("actualizar_examen", int, [id_examen, nombre, descripcion, cantidad_preguntas, tiempo_limite, id_curso, id_profesor, orden])
        return {"filas_afectadas": result}
    finally:
        cursor.close()

# Endpoint para eliminar un examen
@app.delete("/examen/eliminar", tags=['Exámenes'])
def eliminar_examen(
    id_examen: str = Body(...),
    user_id: int = Depends(verificar_token)
):
    cursor = get_cursor()
    try:
        result = cursor.callfunc("eliminar_examen", int, [id_examen])
        if result == 0:
            raise HTTPException(status_code=400, detail="El examen no se puede eliminar porque ha sido presentado por un estudiante")
        else:
            return {"mensaje": "Examen eliminado exitosamente"}
    finally:
        cursor.close()

# Endpoint para crear una nueva pregunta
@app.post("/preguntas/crear", tags=['Preguntas'])
def crear_pregunta(
    texto: str = Body(...),
    opciones: str = Body(...),
    respuestas_correctas: str = Body(...),
    id_tipo: int = Body(...),
    tema: str = Body(None),
    privacidad: int = Body(0),
    id_examen: int = Body(...), user_id: int = Depends(verificar_token)
):
    cursor = get_cursor()
    try:
        id_pregunta = cursor.callfunc("insertar_pregunta", int, [texto, opciones, respuestas_correctas, id_tipo, tema, privacidad])
        cursor.execute("INSERT INTO EXAMEN_PREGUNTA (ID_EXAMEN, ID_PREGUNTA) VALUES (:id_examen, :id_pregunta)", id_examen=id_examen, id_pregunta=id_pregunta)
        connection.commit()
        return {"message": "Pregunta agregada exitosamente"}
    finally:
        cursor.close()

# Endpoint para actualizar una pregunta
@app.put("/preguntas/actualizar/{id_pregunta}", tags=['Preguntas'])
def actualizar_pregunta(
    id_pregunta: int,
    texto: str = Body(...),
    opciones: str = Body(...),
    respuestas_correctas: str = Body(...),
    id_tipo: int = Body(...),
    tema: str = Body(None),
    privacidad: int = Body(0),
    id_examen: int = Body(...),
    user_id: int = Depends(verificar_token)
):
    cursor = get_cursor()
    try:
        # Actualizar la pregunta
        cursor.callfunc("actualizar_pregunta", int, [id_pregunta, texto, opciones, respuestas_correctas, id_tipo, tema, privacidad])
        connection.commit()

        # Verificar si la relación examen-pregunta ya existe
        cursor.execute("SELECT COUNT(*) FROM EXAMEN_PREGUNTA WHERE ID_EXAMEN = :id_examen AND ID_PREGUNTA = :id_pregunta", id_examen=id_examen, id_pregunta=id_pregunta)
        relacion_existente = cursor.fetchone()[0]

        # Si la relación no existe, insertarla
        if relacion_existente == 0:
            cursor.execute("INSERT INTO EXAMEN_PREGUNTA (ID_EXAMEN, ID_PREGUNTA) VALUES (:id_examen, :id_pregunta)", id_examen=id_examen, id_pregunta=id_pregunta)
            connection.commit()

        return {"message": "Pregunta actualizada exitosamente"}
    finally:
        cursor.close()

# Endpoint para actualizar la privacidad de una pregunta
@app.put("/preguntas/actualizar-privacidad/{id_pregunta}", tags=['Preguntas'])
def actualizar_privacidad_pregunta(id_pregunta: int, id_profesor: int, privacidad: int, user_id: int = Depends(verificar_token)):
    cursor = get_cursor()
    try:
        result = cursor.callfunc("actualizar_privacidad_pregunta", int, [id_pregunta, id_profesor, privacidad])
        if result == 1:
            connection.commit()
            return {"message": "Privacidad de la pregunta actualizada exitosamente"}
        else:
            return {"message": "No se puede cambiar la privacidad de la pregunta"}
    finally:
        cursor.close()

# Endpoint para eliminar una pregunta
@app.delete("/preguntas/eliminar/{id_pregunta}", tags=['Preguntas'])
def eliminar_pregunta(id_pregunta: int, user_id: int = Depends(verificar_token)):
    cursor = get_cursor()
    try:
        result = cursor.callfunc("eliminar_pregunta", int, [id_pregunta])
        if result == 1:
            connection.commit()
            return {"message": "Pregunta eliminada exitosamente"}
        else:
            return {"message": "No se puede eliminar la pregunta porque está asignada a uno o más exámenes"}
    finally:
        cursor.close()

# Endpoint para crear un estudiante
@app.post("/estudiantes/crear", tags=['Estudiantes'])
def crear_estudiante(
    cedula: int = Body(...),
    p_nombre: str = Body(...),
    clave: str = Body(...), user_id: int = Depends(verificar_token)
):
    cursor = get_cursor()
    try:
        result = cursor.callfunc("CREAR_ESTUDIANTE", bool, [cedula, p_nombre, clave])
        if result:
            connection.commit()
            return {"message": "Estudiante creado exitosamente"}
        else:
            return {"message": "Ya existe un estudiante con la cédula proporcionada"}
    finally:
        cursor.close()

# Endpoint para actualizar un estudiante
@app.put("/estudiantes/actualizar/{cedula}", tags=['Estudiantes'])
def actualizar_estudiante(
    cedula: int,
    p_nombre: str = Body(...),
    clave: str = Body(...), user_id: int = Depends(verificar_token)
):
    cursor = get_cursor()
    try:
        result = cursor.callfunc("ACTUALIZAR_ESTUDIANTE", bool, [cedula, p_nombre, clave])
        if result:
            connection.commit()
            return {"message": "Estudiante actualizado exitosamente"}
        else:
            return {"message": "No se encontró el estudiante con la cédula proporcionada"}
    finally:
        cursor.close()

# Endpoint para eliminar un estudiante
@app.delete("/estudiantes/eliminar/{cedula}", tags=['Estudiantes'])
def eliminar_estudiante(
    cedula: int,
    user_id: int = Depends(verificar_token)
):
    cursor = get_cursor()
    try:
        result = cursor.callfunc("ELIMINAR_ESTUDIANTE", bool, [cedula])
        if result:
            connection.commit()
            return {"message": "Estudiante eliminado exitosamente"}
        else:
            return {"message": "No se encontró el estudiante con la cédula proporcionada"}
    finally:
        cursor.close()

# Endpoint para crear un grupo
@app.post("/grupos/crear", tags=['Grupos'])
def crear_grupo(
    grupo: int = Body(...),
    nombre_grupo: str = Body(...),
    user_id: int = Depends(verificar_token)
):
    cursor = get_cursor()
    try:
        result = cursor.callfunc("CREAR_GRUPO", bool, [grupo, nombre_grupo])
        if result:
            connection.commit()
            return {"message": "Grupo creado exitosamente"}
        else:
            return {"message": "Ya existe un grupo con el ID proporcionado"}
    finally:
        cursor.close()

# Endpoint para crear estudiantes a un grupo
@app.post("/grupos/crear_estudiantes", tags=['Grupos'])
def crear_estudiantes_a_grupo(
    grupo_id: int,
    estudiante_ids: List[int],
    user_id: int = Depends(verificar_token)
):
    cursor = get_cursor()
    try:
        estudiantes_no_agregados = []
        for estudiante_id in estudiante_ids:
            result = cursor.callfunc("crear_ESTUDIANTES_GRUPO", str, [estudiante_id, grupo_id])
            if result != 'Estudiante Agregado':
                estudiantes_no_agregados.append(f"ID Estudiante: {estudiante_id} - {result}")

        if len(estudiantes_no_agregados) == 0:
            connection.commit()
            return {"message": "Todos los estudiantes fueron agregados correctamente"}
        else:
            return {"message": "Algunos estudiantes no pudieron ser agregados", "estudiantes_no_agregados": estudiantes_no_agregados}
    finally:
        cursor.close()

# Endpoint para crear estudiante a un grupo
@app.post("/grupos/crear-estudiante", tags=['Grupos'])
def crear_estudiantes_grupo(
    estudiante_id: int = Body(...),
    grupo_id: int = Body(...), user_id: int = Depends(verificar_token)
):
    cursor = get_cursor()
    try:
        message = cursor.callfunc("crear_ESTUDIANTES_GRUPO", str, [estudiante_id, grupo_id])
        connection.commit()
        return {"message": message}
    finally:
        cursor.close()

# Endpoint para actualizar un grupo
@app.put("/grupos/actualizar/{grupo}", tags=['Grupos'])
def actualizar_grupo(
    grupo: int,
    nombre_grupo: str = Body(...), user_id: int = Depends(verificar_token)
):
    cursor = get_cursor()
    try:
        result = cursor.callfunc("ACTUALIZAR_GRUPO", bool, [grupo, nombre_grupo])
        if result:
            connection.commit()
            return {"message": "Grupo actualizado exitosamente"}
        else:
            return {"message": "No se encontró el grupo con el ID proporcionado"}
    finally:
        cursor.close()

# Endpoint para eliminar un grupo
@app.delete("/grupos/eliminar/{grupo}", tags=['Grupos'])
def eliminar_grupo(
    grupo: int,
    user_id: int = Depends(verificar_token)
):
    cursor = get_cursor()
    try:
        result = cursor.callfunc("ELIMINAR_GRUPO", bool, [grupo])
        if result:
            connection.commit()
            return {"message": "Grupo eliminado exitosamente"}
        else:
            return {"message": "No se encontró el grupo con el ID proporcionado"}
    finally:
        cursor.close()

# Endpoint para crear un profesor
@app.post("/profesores/crear", tags=['Profesores'])
def crear_profesor(
    cedula: int = Body(...),
    p_nombre: str = Body(...),
    clave: str = Body(...),
    user_id: int = Depends(verificar_token)
):
    cursor = get_cursor()
    try:
        result = cursor.callfunc("CREAR_PROFESOR", bool, [cedula, p_nombre, clave])
        if result:
            connection.commit()
            return {"message": "Profesor creado exitosamente"}
        else:
            return {"message": "Ya existe un profesor con la cédula proporcionada"}
    finally:
        cursor.close()

# Endpoint para actualizar un profesor
@app.put("/profesores/actualizar/{cedula}", tags=['Profesores'])
def actualizar_profesor(
    cedula: int,
    p_nombre: str = Body(...),
    clave: str = Body(...), user_id: int = Depends(verificar_token)
):
    cursor = get_cursor()
    try:
        result = cursor.callfunc("ACTUALIZAR_PROFESOR", bool, [cedula, p_nombre, clave])
        if result:
            connection.commit()
            return {"message": "Profesor actualizado exitosamente"}
        else:
            return {"message": "No se encontró el profesor con la cédula proporcionada"}
    finally:
        cursor.close()

# Endpoint para eliminar un profesor
@app.delete("/profesores/eliminar/{cedula}", tags=['Profesores'])
def eliminar_profesor(
    cedula: int,
    user_id: int = Depends(verificar_token)
):
    cursor = get_cursor()
    try:
        result = cursor.callfunc("ELIMINAR_PROFESOR", bool, [cedula])
        if result:
            connection.commit()
            return {"message": "Profesor eliminado exitosamente"}
        else:
            return {"message": "No se encontró el profesor con la cédula proporcionada"}
    finally:
        cursor.close()