--------------------------------------------------------
--  DDL for Function ACTUALIZAR_ESTUDIANTE
--------------------------------------------------------

  CREATE OR REPLACE NONEDITIONABLE FUNCTION "ACTUALIZAR_ESTUDIANTE" (
    CEDULA IN NUMBER,
    P_NOMBRE IN VARCHAR2,
    CLAVE IN VARCHAR2
) RETURN BOOLEAN
AS
    V_COUNT NUMBER;
BEGIN
    -- Buscamos que exista la cédula
    SELECT COUNT(*) INTO V_COUNT FROM ESTUDIANTE
    WHERE ID_ESTUDIANTE = CEDULA;

    --ACTUALIZAMOS SI LA ENCUENTRA
    IF V_COUNT > 0 THEN
        UPDATE ESTUDIANTE SET NOMBRE = P_NOMBRE, CONTRASEÑA = CLAVE WHERE ID_ESTUDIANTE = CEDULA;
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END;

/
--------------------------------------------------------
--  DDL for Function ACTUALIZAR_GRUPO
--------------------------------------------------------

  CREATE OR REPLACE NONEDITIONABLE FUNCTION "ACTUALIZAR_GRUPO" (
    GRUPO NUMBER,
    NOMBRE_GRUPO VARCHAR2
) RETURN BOOLEAN AS
    V_COUNT NUMBER;
BEGIN
    --Buscamos que no esté creado
    SELECT COUNT(*)INTO V_COUNT FROM GRUPO WHERE ID_GRUPO = GRUPO;

    --Actualizamos
    IF V_COUNT = 1 THEN
        UPDATE GRUPO SET NOMBRE = NOMBRE_GRUPO 
        WHERE ID_GRUPO = GRUPO;
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END;

/
--------------------------------------------------------
--  DDL for Function ACTUALIZAR_PROFESOR
--------------------------------------------------------

  CREATE OR REPLACE NONEDITIONABLE FUNCTION "ACTUALIZAR_PROFESOR" (
    CEDULA IN NUMBER,
    P_NOMBRE IN VARCHAR2,
    CLAVE IN VARCHAR2
) RETURN BOOLEAN
AS
    V_COUNT NUMBER;
BEGIN
    -- Buscamos que exista la cédula
    SELECT COUNT(*) INTO V_COUNT FROM PROFESOR
    WHERE ID_PROFESOR = CEDULA;
    
    --ACTUALIZAMOS SI LA ENCUENTRA
    IF V_COUNT > 0 THEN
        UPDATE PROFESOR SET NOMBRE = P_NOMBRE, CONTRASEÑA = CLAVE WHERE ID_PROFESOR = CEDULA;
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END;

/
--------------------------------------------------------
--  DDL for Function AÑADIR_ESTUDIANTES_GRUPO
--------------------------------------------------------

  CREATE OR REPLACE NONEDITIONABLE FUNCTION "AÑADIR_ESTUDIANTES_GRUPO" (
    ESTUDIANTE_ID NUMBER,
    GRUPO_ID NUMBER
) RETURN VARCHAR2 AS
    COUNT_EST NUMBER;
    COUNT_GRU NUMBER;
    COUNT_EST_GRU NUMBER;
BEGIN
    --Buscamos el grupo
    SELECT COUNT(*) INTO COUNT_GRU FROM GRUPO
    WHERE ID_GRUPO = GRUPO_ID;

    --Buscamos el estudiante
    SELECT COUNT(*) INTO COUNT_EST FROM ESTUDIANTE
    WHERE ID_ESTUDIANTE = ESTUDIANTE_ID;
    
    --Buscamos que el estudiante no esté en un grupo
    SELECT COUNT(*) INTO COUNT_EST_GRU FROM ESTUDIANTE_GRUPO
    WHERE ID_ESTUDIANTE = ESTUDIANTE_ID;

    --Agregamos al grupo si los encuentra
    IF COUNT_GRU = 1 AND COUNT_EST = 1 AND COUNT_EST_GRU = 0 THEN
        INSERT INTO ESTUDIANTE_GRUPO (ID_ESTUDIANTE, ID_GRUPO)
        VALUES (ESTUDIANTE_ID, GRUPO_ID);
        RETURN 'Estudiante Agregado';     
    ELSIF COUNT_EST_GRU = 1 THEN
        RETURN 'El estudiante ya está en un grupo';
    ELSIF COUNT_EST = 0 THEN
        RETURN 'El estudiante no existe';   
    ELSIF COUNT_GRU = 0 THEN
        RETURN 'El grupo no existe';
    END IF;
END;

/
--------------------------------------------------------
--  DDL for Function CREAR_ESTUDIANTE
--------------------------------------------------------

  CREATE OR REPLACE NONEDITIONABLE FUNCTION "CREAR_ESTUDIANTE" (
    CEDULA IN NUMBER,
    P_NOMBRE IN VARCHAR2,
    CLAVE IN VARCHAR2
) RETURN BOOLEAN
AS
    V_COUNT NUMBER;
BEGIN
    -- Buscamos que no exista la cédula
    SELECT COUNT(*) INTO V_COUNT FROM ESTUDIANTE
    WHERE ID_ESTUDIANTE = CEDULA;

     --Creamos si no existe la cédula
    IF V_COUNT = 0 THEN
        INSERT INTO ESTUDIANTE (ID_ESTUDIANTE, NOMBRE, CONTRASEÑA)
        VALUES (CEDULA, P_NOMBRE, CLAVE);
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END;

/
--------------------------------------------------------
--  DDL for Function CREAR_GRUPO
--------------------------------------------------------

  CREATE OR REPLACE NONEDITIONABLE FUNCTION "CREAR_GRUPO" (
    GRUPO NUMBER,
    NOMBRE_GRUPO VARCHAR2
) RETURN BOOLEAN AS
    V_COUNT NUMBER;
BEGIN
    --Buscamos que no esté creado
    SELECT COUNT(*)INTO V_COUNT FROM GRUPO WHERE ID_GRUPO = GRUPO;

    --Agregamos
    IF V_COUNT = 0 THEN
        INSERT INTO GRUPO (ID_GRUPO, NOMBRE)
        VALUES (GRUPO, NOMBRE_GRUPO);
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END;

/
--------------------------------------------------------
--  DDL for Function CREAR_PROFESOR
--------------------------------------------------------

  CREATE OR REPLACE NONEDITIONABLE FUNCTION "CREAR_PROFESOR" (
    CEDULA IN NUMBER,
    P_NOMBRE IN VARCHAR2,
    CLAVE IN VARCHAR2
) RETURN BOOLEAN
AS
    V_COUNT NUMBER;
BEGIN
    -- Buscamos que no exista la cédula
    SELECT COUNT(*) INTO V_COUNT FROM PROFESOR
    WHERE ID_PROFESOR = CEDULA;
    
     --Creamos si no existe la cédula
    IF V_COUNT = 0 THEN
        INSERT INTO PROFESOR (ID_PROFESOR, NOMBRE, CONTRASEÑA)
        VALUES (CEDULA, P_NOMBRE, CLAVE);
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END;

/
--------------------------------------------------------
--  DDL for Function ELIMINAR_ESTUDIANTE
--------------------------------------------------------

  CREATE OR REPLACE NONEDITIONABLE FUNCTION "ELIMINAR_ESTUDIANTE" (
    CEDULA IN NUMBER
) RETURN BOOLEAN
AS
    V_COUNT NUMBER;
BEGIN
    -- Buscamos que exista la cédula
    SELECT COUNT(*) INTO V_COUNT FROM ESTUDIANTE
    WHERE ID_ESTUDIANTE = CEDULA;

    --Eliminamos SI LA ENCUENTRA
    IF V_COUNT > 0 THEN
        DELETE FROM ESTUDIANTE WHERE ID_ESTUDIANTE = CEDULA;
        GUARDAR_REGISTRO_AUD;
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END;

/
--------------------------------------------------------
--  DDL for Function ELIMINAR_GRUPO
--------------------------------------------------------

  CREATE OR REPLACE NONEDITIONABLE FUNCTION "ELIMINAR_GRUPO" (
    GRUPO NUMBER
) RETURN BOOLEAN AS
    V_COUNT NUMBER;
BEGIN
    --Buscamos que esté
    SELECT COUNT(*)INTO V_COUNT FROM GRUPO WHERE ID_GRUPO = GRUPO;

    --Eliminamos
    IF V_COUNT = 1 THEN
        DELETE FROM GRUPO
        WHERE ID_GRUPO = GRUPO;
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END;

/
--------------------------------------------------------
--  DDL for Function ELIMINAR_PROFESOR
--------------------------------------------------------

  CREATE OR REPLACE NONEDITIONABLE FUNCTION "ELIMINAR_PROFESOR" (
    CEDULA IN NUMBER
) RETURN BOOLEAN
AS
    V_COUNT NUMBER;
BEGIN
    -- Buscamos que exista la cédula
    SELECT COUNT(*) INTO V_COUNT FROM PROFESOR
    WHERE ID_PROFESOR = CEDULA;

    --Eliminamos SI LA ENCUENTRA
    IF V_COUNT > 0 THEN
        DELETE FROM PROFESOR WHERE ID_PROFESOR = CEDULA;
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END;

/