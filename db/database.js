const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./preguntas.db");

// Crear tabla
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS preguntas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pregunta TEXT NOT NULL,
      tipo TEXT NOT NULL,
      opciones TEXT
    )
  `);
});

module.exports = db;