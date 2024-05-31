create or replace FUNCTION insertar_pregunta (
    p_texto IN VARCHAR2,
    p_opciones IN VARCHAR2,
    p_respuestas_correctas IN VARCHAR2,
    p_id_tipo IN NUMBER,
    p_tema IN VARCHAR2 DEFAULT 'No definido',
    p_privacidad IN NUMBER DEFAULT 0
) RETURN NUMBER
IS
    v_id_pregunta NUMBER;
BEGIN
    -- Obtener el próximo valor de la secuencia para el ID_EXAMEN
    SELECT secuencia_examen.NEXTVAL INTO v_id_pregunta FROM DUAL;
    
    INSERT INTO "BELSANTO"."PREGUNTA" (
        "ID_PREGUNTA",
        "TEXTO",
        "OPCIONES",
        "RESPUESTAS_CORRECTAS",
        "ID_TIPO",
        "TEMA",
        "PRIVACIDAD"
    ) VALUES (
        v_id_pregunta,
        p_texto,
        p_opciones,
        p_respuestas_correctas,
        p_id_tipo,
        p_tema,
        p_privacidad
    )
    RETURNING "ID_PREGUNTA" INTO v_id_pregunta;

    RETURN v_id_pregunta;
END;

/

CREATE OR REPLACE FUNCTION actualizar_pregunta (
    p_id_pregunta IN NUMBER,
    p_texto IN VARCHAR2,
    p_opciones IN VARCHAR2,
    p_respuestas_correctas IN VARCHAR2,
    p_id_tipo IN NUMBER,
    p_tema IN VARCHAR2 DEFAULT 'No definido',
    p_privacidad IN NUMBER DEFAULT 0
) RETURN NUMBER
IS
BEGIN
    UPDATE "PREGUNTA"
    SET
        "TEXTO" = p_texto,
        "OPCIONES" = p_opciones,
        "RESPUESTAS_CORRECTAS" = p_respuestas_correctas,
        "ID_TIPO" = p_id_tipo,
        "TEMA" = p_tema,
        "PRIVACIDAD" = p_privacidad
    WHERE
        "ID_PREGUNTA" = p_id_pregunta;

    RETURN SQL%ROWCOUNT; -- Devuelve el número de filas afectadas por la actualización
END;
/

CREATE OR REPLACE FUNCTION eliminar_pregunta (
    p_id_pregunta IN NUMBER
) RETURN NUMBER
IS
    v_num_examenes NUMBER;
BEGIN
    -- Verificar si la pregunta está siendo usada en algún examen
    SELECT COUNT(*)
    INTO v_num_examenes
    FROM "EXAMEN_PREGUNTA"
    WHERE "ID_PREGUNTA" = p_id_pregunta;

    IF v_num_examenes = 0 THEN
        -- No está siendo usada en ningún examen, se puede eliminar
        DELETE FROM "PREGUNTA"
        WHERE "ID_PREGUNTA" = p_id_pregunta;

        RETURN 1; -- Indicar que la pregunta fue eliminada
    ELSE
        -- La pregunta está siendo usada en al menos un examen, no se puede eliminar
        RETURN 0; -- Indicar que la pregunta no fue eliminada
    END IF;
END;
/

CREATE OR REPLACE FUNCTION actualizar_privacidad_pregunta (
    p_id_pregunta IN NUMBER,
    p_id_profesor IN NUMBER,
    p_privacidad IN NUMBER
) RETURN NUMBER
IS
    v_privacidad_actual NUMBER;
    v_id_profesor_examen NUMBER;
BEGIN
    -- Obtener la privacidad actual de la pregunta
    SELECT PRIVACIDAD
    INTO v_privacidad_actual
    FROM "PREGUNTA"
    WHERE "ID_PREGUNTA" = p_id_pregunta;

    IF v_privacidad_actual = p_privacidad THEN
        -- La privacidad actual es igual a la nueva privacidad, no es necesario actualizar
        RETURN 1;
    ELSIF v_privacidad_actual = 0 AND p_privacidad = 1 THEN
        -- Intento de cambiar de pública a privada, verificar si la pregunta está siendo usada por otro profesor en un examen
        SELECT COUNT(*)
        INTO v_id_profesor_examen
        FROM "EXAMEN" EX
        INNER JOIN "EXAMEN_PREGUNTA" EP ON EX."ID_EXAMEN" = EP."ID_EXAMEN"
        WHERE EP."ID_PREGUNTA" = p_id_pregunta AND EX."ID_PROFESOR" <> p_id_profesor;

        IF v_id_profesor_examen > 0 THEN
            -- La pregunta está siendo usada por otro profesor en un examen, no se puede cambiar la privacidad
            RETURN 0;
        END IF;
    END IF;

    -- Actualizar la privacidad de la pregunta
    UPDATE "PREGUNTA"
    SET "PRIVACIDAD" = p_privacidad
    WHERE "ID_PREGUNTA" = p_id_pregunta;

    RETURN 1; -- Indicar que la privacidad fue actualizada correctamente
END;
/

