const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const pool = require("./config/db");
const { api_secret, token_expired_time } = require("./config/private");
const { logRequest } = require('./middleware/logger'); 
const { verificarToken } = require('./middleware/auth'); 
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT;

app.use(bodyParser.json());
app.use(cors());
app.use(express.json());
app.use(logRequest);

const { 
  registrarUsuario, 
  verificarCredenciales,
  obtenerUsuario, 
  enviarAlCarrito,
  actualizarPosteo,
  deletePosteo
} = require("./controlador");

app.post("/carrito", async (req, res) => {
  try {
    const { id_usuario, productos } = req.body;
    await enviarAlCarrito(id_usuario, productos);
    res.send({ totalPago: calcularTotalPago(productos) });
  } catch (error) {
    console.error("Error al realizar el carrito:", error);
    res.status(500).send("Error al realizar el carrito");
  }
});
// Función para calcular el total de pago
const calcularTotalPago = (productos) => {
  return productos.reduce((total, producto) => total + parseFloat(producto.precio), 0);
};
app.get('/carrito', async (req, res) => {
  try {
    // Realizar la lógica para obtener los productos en el carrito desde la base de datos
    // y calcular el precio total
    const totalPago = 0; // Reemplaza esto con la lógica adecuada para obtener el precio total
    res.json({ totalPago });
  } catch (error) {
    console.error('Error al obtener los productos en el carrito:', error);
    res.status(500).json({ error: 'Error al obtener los productos en el carrito' });
  }
});

app.post('/posteos', async (req, res) => {
  try {
    const { nombre_producto, comentario } = req.body;
    // Validar que los campos requeridos estén presentes antes de realizar la inserción
    if (!nombre_producto || !comentario) {
      return res.status(400).send("Nombre del producto y comentario son campos requeridos.");
    }
    // Insertar los datos en la tabla "posteos"
    const query = `
      INSERT INTO posteos (nombre_producto, comentario)
      VALUES ($1, $2)
    `;
    await pool.query(query, [nombre_producto, comentario]);
    res.status(201).send("Posteo creado con éxito");
  } catch (error) {
    console.error('Error al crear el posteo:', error);
    res.status(500).send("Error al crear el posteo");
  }
});
app.get('/posteos', async (req, res) => {
  try {
    // Consulta para obtener todos los posteos
    const query = `SELECT * FROM posteos`;
    const result = await pool.query(query);
    
    // Enviar los datos de los posteos como respuesta
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error al obtener los posteos:', error);
    res.status(500).send("Error al obtener los posteos");
  }
});
app.put("/posteos/:id", verificarToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre } = jwt.decode(req.header("Authorization").split("Bearer ")[1]);
    await actualizarPosteo(id, req.body);
    res.status(200).send(`El usuario ${nombre} ha actualizado el posteo de id ${id}`);
  } catch (error) {
    res.status(error.code || 500).send(error.message);
  }
});

app.delete("/posteos/:id", verificarToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre } = jwt.decode(req.header("Authorization").split("Bearer ")[1]);
    await deletePosteo(id);
    res.status(200).send(`El usuario ${nombre} ha eliminado el posteo de id ${id}`);
  } catch (error) {
    res.status(error.code || 500).send(error.message);
  }
});

// RUTAS CORRESPONDIENTE A USUARIOS
app.post("/usuarios", async (req, res) => {
  try {
    const { nombre, email, password } = req.body;
    await registrarUsuario(nombre, email, password);
    res.send("Usuario creado con éxito");
  } catch (error) {
    res.status(500).send(error);
  }
});
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    await verificarCredenciales(email, password);
    const token = jwt.sign({ email }, api_secret, { expiresIn: token_expired_time });
    res.send(token);
  } catch (error) {
    console.log(error);
    res.status(error.code || 401).send(error.message);
  }
});
app.get("/usuarios", verificarToken, async (req, res) => {
  try {
    const token = req.header("Authorization").split("Bearer ")[1];
    const { email } = jwt.decode(token);
    const usuario = await obtenerUsuario(email);
    res.json(usuario);
  } catch (error) {
    res.status(error.code || 500).send(error.message);
  }
});
app.listen(port, () => {
  console.log(`Servidor levanatdo en el puerto ${port}`);
});
//app.listen(3000, () => console.log("SERVER ON"));

module.exports = app;


