const { api_secret } = require("../config/private");
const jwt = require("jsonwebtoken");

const verificarToken = (req, res, next) => {
  const Authorization = req.header("Authorization");
  if (!Authorization) {
    return res.status(401).send("No se proporcionó token en las cabeceras.");
  }
  const token = Authorization.split("Bearer ")[1];
  try {
    jwt.verify(token, api_secret);
    next();
  } catch (error) {
    return res.status(401).send("Token inválido o expirado.");
  }
};

module.exports = { verificarToken };

/*
const verificarToken = (req, res, next) => {
  const Authorization = req.header("Authorization");
  if (!Authorization) {
    return res.status(401).send("No se proporcionó token en las cabeceras.");
  }

  const token = Authorization.split("Bearer ")[1];
  try {
    jwt.verify(token, "az_AZ");
    next();
  } catch (error) {
    return res.status(401).send("Token inválido o expirado.");
  }
};

module.exports = {verificarToken};
*/