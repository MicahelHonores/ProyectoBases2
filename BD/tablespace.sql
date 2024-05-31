--Creación Tablespace de exámenes
CREATE TABLESPACE TABLES_EXAMEN DATAFILE
'C:\app\Usuario\product\21c\oradata\XE\TABLES_EXAMEN.dbf' SIZE 500M;

-- Creación Tablespace de preguntas
CREATE TABLESPACE TABLES_PREGUNTA DATAFILE
'C:\app\Usuario\product\21c\oradata\XE\TABLES_PREGUNTA.dbf' SIZE
700M;

-- Creación Tablespace de respuestas
CREATE TABLESPACE TABLES_RESPUESTA DATAFILE
'C:\app\Usuario\product\21c\oradata\XE\TABLES_RESPUESTA.dbf' SIZE
700M;

-- Creación Tablespace de profesor
CREATE TABLESPACE TABLES_PROFESOR DATAFILE
'C:\app\Usuario\product\21c\oradata\XE\TABLES_PROFESOR.dbf' SIZE
700M;

-- Creación Tablespace de estudiante
CREATE TABLESPACE TABLES_ESTUDIANTE DATAFILE
'C:\app\Usuario\product\21c\oradata\XE\TABLES_ESTUDIANTE.dbf' SIZE
700M;

-- Creación Tablespace de registro
CREATE TABLESPACE TABLES_REGISTRO DATAFILE 
'C:\app\Usuario\product\21c\oradata\XE\TABLES_REGISTRO.dbf' SIZE 700M;

--Asignación de tablespace a la tabla estudiante
ALTER TABLE ESTUDIANTE MOVE TABLESPACE TABLES_ESTUDIANTE;

--Asignación de tablespace a la tabla profesor
ALTER TABLE PROFESOR MOVE TABLESPACE TABLES_PROFESOR;

--Asignación de tablespace a la tabla examen
ALTER TABLE EXAMEN MOVE TABLESPACE TABLES_EXAMEN;

--Asignación de tablespace a la tabla pregunta
ALTER TABLE PREGUNTA MOVE TABLESPACE TABLES_PREGUNTA;

--Asignación de tablespace a la tabla presentacion-examen
ALTER TABLE PRESENTACION_EXAMEN MOVE TABLESPACE
TABLES_RESPUESTA;

--Asignación de tablespace a la tabla REGISTRO
ALTER TABLE REGISTRO MOVE TABLESPACE TABLES_REGISTRO;