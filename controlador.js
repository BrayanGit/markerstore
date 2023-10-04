const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const pool = require("./config/db");

const registrarUsuario = async (nombre, email, password) => {
  const saltRounds = 10;
  const salt = bcrypt.genSaltSync(saltRounds);
  const hashedPassword = bcrypt.hashSync(password, salt);
  const values = [nombre, email, hashedPassword];
  const consulta = "INSERT INTO usuarios (nombre, email, password) VALUES ($1, $2, $3)";
  await pool.query(consulta, values);
};
const verificarCredenciales = async (email, password) => {
  const values = [email];
  const consulta = "SELECT * FROM usuarios WHERE email = $1";
  const { rows: [usuario], rowCount } = await pool.query(consulta, values);
  const { password: passwordEncriptada } = usuario;
  const passwordEsCorrecta = bcrypt.compareSync(password, passwordEncriptada);
  if (!passwordEsCorrecta || !rowCount)
    throw { code: 401, message: "Email o contraseña incorrecta" };
};
const obtenerUsuario = async (email) => {
  const consulta = "SELECT * FROM usuarios WHERE email = $1";
  const values = [email];
  const { rows: [usuario], rowCount } = await pool.query(consulta, values);
  if (!rowCount) throw { code: 404, message: "No se encontró ningún usuario con este email" };
  return usuario;
};
const enviarAlCarrito = async (id_usuario, productos) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    for (const producto of productos) {
      const { nombre, categoria, precio } = producto;
      const consulta = "INSERT INTO carritos (id_usuario, producto_nombre, producto_categoria, producto_precio) VALUES ($1, $2, $3, $4)";
      await client.query(consulta, [id_usuario, nombre, categoria, precio]);
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const actualizarPosteo = async (id, posteoActualizado) => {
  const { nombre_producto, comentario } = posteoActualizado;
  const consulta = "UPDATE posteos SET nombre_producto = $1, comentario = $2, WHERE id = $3";
  const values = [ nombre_producto, comentario, id];

  const { rowCount } = await pool.query(consulta, values);

  if (!rowCount) {
    throw { code: 404, message: "No se encontró ningún posteo con este ID" };
  }
};

const deletePosteo = async (id) => {
  const consulta = "DELETE FROM posteos WHERE id = $1";
  const values = [id];
  const { rowCount } = await pool.query(consulta, values);
  if (!rowCount) throw { code: 404, message: "No se encontró ningún posteo con este ID" };
};

module.exports = {
  registrarUsuario, 
  verificarCredenciales, 
  obtenerUsuario, 
  enviarAlCarrito,
  actualizarPosteo,
  deletePosteo
};