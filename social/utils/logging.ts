export type LogCategory = 'login' | 'signup' | 'logout' | 'enrollments' | 'updates';

interface LogData {
  timestamp: string;
  [key: string]: any;
}

const LOG_STORAGE_KEY = 'vlcCampLogs';

/**
 * Recupera todos los logs desde localStorage.
 * @returns Un objeto con todas las categorías de logs.
 */
const getLogs = (): Record<LogCategory, LogData[]> => {
  try {
    const storedLogs = localStorage.getItem(LOG_STORAGE_KEY);
    if (storedLogs) {
      return JSON.parse(storedLogs);
    }
  } catch (error) {
    console.error("❌ Error al leer los logs del localStorage:", error);
    localStorage.removeItem(LOG_STORAGE_KEY); // Limpia datos corruptos
  }

  // Estructura vacía por defecto
  return {
    login: [],
    signup: [],
    logout: [],
    enrollments: [],
    updates: [],
  };
};

/**
 * Guarda todos los logs en localStorage.
 */
const saveLogs = (logs: Record<LogCategory, LogData[]>) => {
  try {
    localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(logs, null, 2));
  } catch (error) {
    console.error("❌ Error al guardar logs en localStorage:", error);
  }
};

/**
 * Registra un nuevo evento en una categoría de logs.
 */
export const logEvent = (category: LogCategory, data: Record<string, any>) => {
  const allLogs = getLogs();

  const newLogEntry: LogData = {
    timestamp: new Date().toISOString(),
    ...data,
  };

  if (!allLogs[category]) {
    allLogs[category] = [];
  }

  allLogs[category].push(newLogEntry);
  saveLogs(allLogs);

  console.log(`✅ Log añadido a la categoría "${category}":`, newLogEntry);
};

/**
 * Muestra todos los logs guardados en consola y los devuelve.
 */
export const showLogs = (): Record<LogCategory, LogData[]> => {
  const logs = getLogs();
  console.log("📜 Logs almacenados en localStorage:", logs);
  return logs;
};
