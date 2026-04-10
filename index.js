const express = require("express");
const app = express();
const db = require("./db/database");

app.use(express.json());

const PORT = 3000;

// ==========================
// FUNCIÓN CAMPO CALCULADO
// ==========================
function calcularCantidadOpciones(opciones) {
  if (!opciones) return 0;
  return opciones
    .split(",")
    .map(o => o.trim())
    .filter(o => o !== "").length;
}

// ==========================
// VALIDACIÓN
// ==========================
function validarPregunta(data) {
  const { pregunta, tipo, opciones } = data;

  const tiposValidos = ["multiple", "texto", "numero", "booleana"];

  if (!pregunta || pregunta.trim().length < 5) {
    return "La pregunta debe tener mínimo 5 caracteres";
  }

  if (!tiposValidos.includes(tipo)) {
    return "Tipo inválido (multiple, texto, numero, booleana)";
  }

  if (tipo === "multiple") {
    if (!opciones || opciones.trim() === "") {
      return "Opciones son obligatorias para tipo multiple";
    }
  }

  return null;
}

// ==========================
// POST /preguntas
// ==========================
app.post("/preguntas", (req, res) => {
  const error = validarPregunta(req.body);
  if (error) return res.status(400).json({ error });

  const { pregunta, tipo, opciones } = req.body;

  db.run(
    `INSERT INTO preguntas (pregunta, tipo, opciones) VALUES (?, ?, ?)`,
    [pregunta, tipo, tipo === "multiple" ? opciones : null],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      res.status(201).json({
        id: this.lastID,
        pregunta,
        tipo,
        opciones
      });
    }
  );
});

// ==========================
// GET /preguntas (CON CAMPO CALCULADO)
// ==========================
app.get("/preguntas", (req, res) => {
  const { tipo } = req.query;

  let query = "SELECT * FROM preguntas";
  let params = [];

  if (tipo) {
    query += " WHERE tipo = ?";
    params.push(tipo);
  }

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    const resultado = rows.map(p => ({
      ...p,
      cantidad_opciones: calcularCantidadOpciones(p.opciones)
    }));

    res.json(resultado);
  });
});

// ==========================
// GET /preguntas/:id (CON CAMPO CALCULADO)
// ==========================
app.get("/preguntas/:id", (req, res) => {
  db.get(
    "SELECT * FROM preguntas WHERE id = ?",
    [req.params.id],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });

      if (!row) {
        return res.status(404).json({ mensaje: "Pregunta no encontrada" });
      }

      const resultado = {
        ...row,
        cantidad_opciones: calcularCantidadOpciones(row.opciones)
      };

      res.json(resultado);
    }
  );
});

// ==========================
// PUT /preguntas/:id
// ==========================
app.put("/preguntas/:id", (req, res) => {
  const error = validarPregunta(req.body);
  if (error) return res.status(400).json({ error });

  const { pregunta, tipo, opciones } = req.body;

  db.run(
    `UPDATE preguntas 
     SET pregunta = ?, tipo = ?, opciones = ?
     WHERE id = ?`,
    [pregunta, tipo, tipo === "multiple" ? opciones : null, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      if (this.changes === 0) {
        return res.status(404).json({ mensaje: "Pregunta no encontrada" });
      }

      res.json({
        id: req.params.id,
        pregunta,
        tipo,
        opciones
      });
    }
  );
});

// ==========================
// DELETE /preguntas/:id
// ==========================
app.delete("/preguntas/:id", (req, res) => {
  db.run(
    "DELETE FROM preguntas WHERE id = ?",
    [req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      if (this.changes === 0) {
        return res.status(404).json({ mensaje: "Pregunta no encontrada" });
      }

      res.json({ mensaje: "Pregunta eliminada correctamente" });
    }
  );
});

// ==========================
// SERVIDOR
// ==========================
app.listen(PORT, () => {
  console.log(`API corriendo en http://localhost:${PORT}`);
});