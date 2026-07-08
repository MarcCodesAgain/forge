export interface ExerciseTemplate {
  name: string;
  muscle: string;
  equipment: string;
}

export const EXERCISE_DB: ExerciseTemplate[] = [
  // PECHO
  { name: 'Press Banca', muscle: 'Pecho', equipment: 'Barra' },
  { name: 'Press Banca Inclinado', muscle: 'Pecho', equipment: 'Barra' },
  { name: 'Press Banca Declinado', muscle: 'Pecho', equipment: 'Barra' },
  { name: 'Press Mancuernas', muscle: 'Pecho', equipment: 'Mancuernas' },
  { name: 'Press Mancuernas Inclinado', muscle: 'Pecho', equipment: 'Mancuernas' },
  { name: 'Aperturas Mancuernas', muscle: 'Pecho', equipment: 'Mancuernas' },
  { name: 'Aperturas Polea', muscle: 'Pecho', equipment: 'Polea' },
  { name: 'Fondos en Paralelas', muscle: 'Pecho', equipment: 'Peso corporal' },
  { name: 'Flexiones', muscle: 'Pecho', equipment: 'Peso corporal' },
  { name: 'Press Máquina Pecho', muscle: 'Pecho', equipment: 'Máquina' },

  // ESPALDA
  { name: 'Peso Muerto', muscle: 'Espalda', equipment: 'Barra' },
  { name: 'Remo con Barra', muscle: 'Espalda', equipment: 'Barra' },
  { name: 'Remo Mancuerna', muscle: 'Espalda', equipment: 'Mancuernas' },
  { name: 'Dominadas', muscle: 'Espalda', equipment: 'Peso corporal' },
  { name: 'Jalón al Pecho', muscle: 'Espalda', equipment: 'Polea' },
  { name: 'Remo en Polea Baja', muscle: 'Espalda', equipment: 'Polea' },
  { name: 'Pull-over Polea', muscle: 'Espalda', equipment: 'Polea' },
  { name: 'Remo Máquina', muscle: 'Espalda', equipment: 'Máquina' },
  { name: 'Jalón Agarre Estrecho', muscle: 'Espalda', equipment: 'Polea' },
  { name: 'Peso Muerto Rumano', muscle: 'Espalda', equipment: 'Barra' },

  // HOMBROS
  { name: 'Press Militar', muscle: 'Hombros', equipment: 'Barra' },
  { name: 'Press Arnold', muscle: 'Hombros', equipment: 'Mancuernas' },
  { name: 'Press Mancuernas Hombros', muscle: 'Hombros', equipment: 'Mancuernas' },
  { name: 'Elevaciones Laterales', muscle: 'Hombros', equipment: 'Mancuernas' },
  { name: 'Elevaciones Frontales', muscle: 'Hombros', equipment: 'Mancuernas' },
  { name: 'Pájaros', muscle: 'Hombros', equipment: 'Mancuernas' },
  { name: 'Face Pull', muscle: 'Hombros', equipment: 'Polea' },
  { name: 'Elevaciones Laterales Polea', muscle: 'Hombros', equipment: 'Polea' },
  { name: 'Press Máquina Hombros', muscle: 'Hombros', equipment: 'Máquina' },

  // BÍCEPS
  { name: 'Curl Barra', muscle: 'Bíceps', equipment: 'Barra' },
  { name: 'Curl Mancuernas', muscle: 'Bíceps', equipment: 'Mancuernas' },
  { name: 'Curl Martillo', muscle: 'Bíceps', equipment: 'Mancuernas' },
  { name: 'Curl Concentrado', muscle: 'Bíceps', equipment: 'Mancuernas' },
  { name: 'Curl Polea Baja', muscle: 'Bíceps', equipment: 'Polea' },
  { name: 'Curl Barra Z', muscle: 'Bíceps', equipment: 'Barra' },
  { name: 'Curl Scott', muscle: 'Bíceps', equipment: 'Barra' },
  { name: 'Curl Máquina', muscle: 'Bíceps', equipment: 'Máquina' },

  // TRÍCEPS
  { name: 'Press Francés', muscle: 'Tríceps', equipment: 'Barra' },
  { name: 'Extensión Tríceps Polea', muscle: 'Tríceps', equipment: 'Polea' },
  { name: 'Fondos Tríceps Banco', muscle: 'Tríceps', equipment: 'Peso corporal' },
  { name: 'Press Cerrado', muscle: 'Tríceps', equipment: 'Barra' },
  { name: 'Patada de Tríceps', muscle: 'Tríceps', equipment: 'Mancuernas' },
  { name: 'Extensión Mancuerna Sobre Cabeza', muscle: 'Tríceps', equipment: 'Mancuernas' },
  { name: 'Extensión Polea Sobre Cabeza', muscle: 'Tríceps', equipment: 'Polea' },

  // PIERNAS
  { name: 'Sentadilla', muscle: 'Piernas', equipment: 'Barra' },
  { name: 'Sentadilla Goblet', muscle: 'Piernas', equipment: 'Mancuernas' },
  { name: 'Prensa de Piernas', muscle: 'Piernas', equipment: 'Máquina' },
  { name: 'Extensión de Cuádriceps', muscle: 'Piernas', equipment: 'Máquina' },
  { name: 'Curl Femoral Tumbado', muscle: 'Piernas', equipment: 'Máquina' },
  { name: 'Curl Femoral de Pie', muscle: 'Piernas', equipment: 'Máquina' },
  { name: 'Sentadilla Búlgara', muscle: 'Piernas', equipment: 'Mancuernas' },
  { name: 'Zancadas', muscle: 'Piernas', equipment: 'Mancuernas' },
  { name: 'Hip Thrust', muscle: 'Piernas', equipment: 'Barra' },
  { name: 'Peso Muerto Piernas Rectas', muscle: 'Piernas', equipment: 'Barra' },
  { name: 'Abductor Máquina', muscle: 'Piernas', equipment: 'Máquina' },
  { name: 'Aductor Máquina', muscle: 'Piernas', equipment: 'Máquina' },

  // GEMELOS
  { name: 'Elevación Talones de Pie', muscle: 'Gemelos', equipment: 'Máquina' },
  { name: 'Elevación Talones Sentado', muscle: 'Gemelos', equipment: 'Máquina' },
  { name: 'Elevación Talones con Barra', muscle: 'Gemelos', equipment: 'Barra' },

  // CORE / ABDOMINALES
  { name: 'Crunch Abdominal', muscle: 'Core', equipment: 'Peso corporal' },
  { name: 'Plancha', muscle: 'Core', equipment: 'Peso corporal' },
  { name: 'Rueda Abdominal', muscle: 'Core', equipment: 'Accesorios' },
  { name: 'Elevación de Piernas', muscle: 'Core', equipment: 'Peso corporal' },
  { name: 'Russian Twist', muscle: 'Core', equipment: 'Peso corporal' },
  { name: 'Cable Crunch', muscle: 'Core', equipment: 'Polea' },
  { name: 'Crunch Máquina', muscle: 'Core', equipment: 'Máquina' },

  // CARDIO / FUNCIONAL
  { name: 'Peso Muerto Hexagonal', muscle: 'Full body', equipment: 'Barra' },
  { name: 'Clean and Press', muscle: 'Full body', equipment: 'Barra' },
  { name: 'Farmer\'s Walk', muscle: 'Full body', equipment: 'Mancuernas' },
  { name: 'Kettlebell Swing', muscle: 'Full body', equipment: 'Kettlebell' },
  { name: 'Box Jump', muscle: 'Full body', equipment: 'Peso corporal' },
  { name: 'Battle Ropes', muscle: 'Full body', equipment: 'Accesorios' },
];

export const MUSCLES = [...new Set(EXERCISE_DB.map(e => e.muscle))];
