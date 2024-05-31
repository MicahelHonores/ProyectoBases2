CREATE OR REPLACE FUNCTION agregar_examen (
    p_nombre IN VARCHAR2,
    p_descripcion IN VARCHAR2,
    p_cantidad_preguntas IN NUMBER,
    p_tiempo_limite IN NUMBER,
    p_id_curso IN NUMBER,
    p_id_profesor IN NUMBER,
    p_orden IN VARCHAR2
) RETURN NUMBER
IS
    v_id_examen NUMBER;
BEGIN
    INSERT INTO "EXAMEN" (
        "NOMBRE",
        "DESCRIPCIÓN",
        "CANTIDAD_DE_PREGUNTAS",
        "TIEMPO_LÍMITE",
        "ID_CURSO",
        "ID_PROFESOR",
        "ORDEN"
    ) VALUES (
        p_nombre,
        p_descripcion,
        p_cantidad_preguntas,
        p_tiempo_limite,
        p_id_curso,
        p_id_profesor,
        p_orden
    )
    RETURNING "ID_EXAMEN" INTO v_id_examen;

    RETURN v_id_examen; -- Devolver el ID del examen creado
END;
/

CREATE OR REPLACE FUNCTION actualizar_examen (
    p_id_examen IN NUMBER,
    p_nombre IN VARCHAR2,
    p_descripcion IN VARCHAR2,
    p_cantidad_preguntas IN NUMBER,
    p_tiempo_limite IN NUMBER,
    p_id_curso IN NUMBER,
    p_id_profesor IN NUMBER,
    p_orden IN VARCHAR2
) RETURN NUMBER
IS
BEGIN
    UPDATE "EXAMEN"
    SET
        "NOMBRE" = p_nombre,
        "DESCRIPCIÓN" = p_descripcion,
        "CANTIDAD_DE_PREGUNTAS" = p_cantidad_preguntas,
        "TIEMPO_LÍMITE" = p_tiempo_limite,
        "ID_CURSO" = p_id_curso,
        "ID_PROFESOR" = p_id_profesor,
        "ORDEN" = p_orden
    WHERE
        "ID_EXAMEN" = p_id_examen;

    RETURN SQL%ROWCOUNT; -- Devuelve el número de filas afectadas por la actualización
END;
/

CREATE OR REPLACE FUNCTION eliminar_examen (
    p_id_examen IN NUMBER
) RETURN NUMBER
IS
    v_num_horarios NUMBER;
BEGIN
    -- Verificar si el examen está asignado a algún horario
    SELECT COUNT(*)
    INTO v_num_horarios
    FROM "EXAMEN_HORARIO"
    WHERE "ID_EXAMEN" = p_id_examen;

    IF v_num_horarios > 0 THEN
        -- El examen está asignado a al menos un horario, no se puede eliminar
        RETURN 0;
    ELSE
        -- El examen no está asignado a ningún horario, se puede eliminar
        DELETE FROM "EXAMEN"
        WHERE "ID_EXAMEN" = p_id_examen;

        RETURN 1; -- Indicar que el examen fue eliminado
    END IF;
END;
/
