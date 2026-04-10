const express = require("express");
const app = express();

app.use(express.json());

// ==========================
// "BASE DE DATOS" EN MEMORIA
// ==========================
let preguntas = [];
let idActual = 1;

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

  const nuevaPregunta = {
    id: idActual++,
    pregunta,
    tipo,
    opciones: tipo === "multiple" ? opciones : null
  };

  preguntas.push(nuevaPregunta);

  res.status(201).json(nuevaPregunta);
});

// ==========================
// GET /preguntas (con filtro)
// ==========================
app.get("/preguntas", (req, res) => {
  const { tipo } = req.query;

  if (tipo) {
    const filtradas = preguntas.filter(p => p.tipo === tipo);
    return res.json(filtradas);
  }

  res.json(preguntas);
});

// ==========================
// GET /preguntas/:id
// ==========================
app.get("/preguntas/:id", (req, res) => {
  const pregunta = preguntas.find(p => p.id === parseInt(req.params.id));

  if (!pregunta) {
    return res.status(404).json({ mensaje: "Pregunta no encontrada" });
  }

  res.json(pregunta);
});

// ==========================
// PUT /preguntas/:id
// ==========================
app.put("/preguntas/:id", (req, res) => {
  const index = preguntas.findIndex(p => p.id === parseInt(req.params.id));

  if (index === -1) {
    return res.status(404).json({ mensaje: "Pregunta no encontrada" });
  }

  const error = validarPregunta(req.body);
  if (error) return res.status(400).json({ error });

  const { pregunta, tipo, opciones } = req.body;

  preguntas[index] = {
    id: preguntas[index].id,
    pregunta,
    tipo,
    opciones: tipo === "multiple" ? opciones : null
  };

  res.json(preguntas[index]);
});

// ==========================
// DELETE /preguntas/:id
// ==========================
app.delete("/preguntas/:id", (req, res) => {
  const index = preguntas.findIndex(p => p.id === parseInt(req.params.id));

  if (index === -1) {
    return res.status(404).json({ mensaje: "Pregunta no encontrada" });
  }

  preguntas.splice(index, 1);

  res.json({ mensaje: "Pregunta eliminada correctamente" });
});

// ==========================
// SERVIDOR
// ==========================
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`API corriendo en http://localhost:${PORT}`);
});