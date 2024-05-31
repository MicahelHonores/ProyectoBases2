export interface Question {
  id_pregunta?: string | undefined; // El ID de la pregunta (opcional, ya que será asignado por el servidor)
  texto: string; // El texto de la pregunta
  opciones: string[]; // Un array de opciones para la pregunta
  respuestas_correctas: string[]; // Un array de índices que representan las respuestas correctas
  id_tipo: number; // El ID del tipo de pregunta
  tema: string; // El tema o categoría de la pregunta
  privacidad: number; //  privacidad de la pregunta
}
