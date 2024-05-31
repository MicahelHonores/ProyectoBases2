CREATE OR REPLACE FUNCTION almacenar_presentacion_examen (
    p_id_estudiante IN NUMBER,
    p_id_examen IN NUMBER,
    p_fecha_presentacion IN DATE,
    p_puntaje IN NUMBER,
    p_tiempo_tomado IN INTERVAL DAY TO SECOND,
    p_direccion_ip IN VARCHAR2,
    p_respuestas IN VARCHAR2
) RETURN NUMBER
IS
    v_id_presentacion_examen NUMBER;
BEGIN
    INSERT INTO PRESENTACION_EXAMEN (
        ID_ESTUDIANTE,
        ID_EXAMEN,
        FECHA_PRESENTACION,
        PUNTAJE,
        TIEMPO_TOMADO,
        DIRECCION_IP,
        RESPUESTAS
    ) VALUES (
        p_id_estudiante,
        p_id_examen,
        p_fecha_presentacion,
        p_puntaje,
        p_tiempo_tomado,
        p_direccion_ip,
        p_respuestas
    )
    RETURNING ID_PRESENTACION_EXAMEN INTO v_id_presentacion_examen;

    RETURN v_id_presentacion_examen;
END;
/
