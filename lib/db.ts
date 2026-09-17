import mysql from "mysql2/promise";

const requiredEnvVars = ["DB_HOST", "DB_PORT", "DB_USER", "DB_PASSWORD", "DB_NAME"] as const;

function assertDbConfigured() {
  const missing = requiredEnvVars.filter((name) => !process.env[name]);
  if (missing.length) {
    throw new Error(
      `Faltan variables de entorno de la base de datos: ${missing.join(", ")}. Agrégalas en .env.local (ver .env.local.example).`
    );
  }
}

assertDbConfigured();

// Pool en vez de una conexión por request: cada conexión a MySQL implica un
// handshake TCP + autenticación (con Railway, además cruzando su proxy
// público), y MySQL solo acepta un número limitado de conexiones simultáneas.
// Abrir una nueva por cada request de la API sería lento y, bajo tráfico
// concurrente, agotaría ese límite. El pool abre unas pocas conexiones una
// sola vez, las reutiliza entre requests (una petición la toma prestada y la
// devuelve al terminar, en vez de cerrarla) y hace cola si todas están en uso.
export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
