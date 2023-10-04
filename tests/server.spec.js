const request = require('supertest');
const app = require('../index'); 

describe('Operaciones CRUD', () => {

  it('respuesta 200 al acceder a posteos', async () => {
    const response = await request(app).get('/posteos');
    expect(response.status).toBe(200);
  });

  it("Obteniendo 401 al hacer login con contraseña o password erroneo", async() => {
    const userData = {email: "tester@tester.com", password: "121232"}
    const response = await request(app)
      .post("/login")
      .send(userData);
    expect(response.status).toBe(401);
  });

  it('debería obtener una respuesta 200 al enviar un POST a /carrito', async () => {
    const datosDePrueba = {
      id_usuario: 5, // Reemplaza con un ID de usuario válido
      productos: [
        {
          nombre: 'ProductoPrueba',
          categoria: 'CategoríaPrueba',
          precio: '6000 CLP',
        },
      ],
    };
    const response = await request(app)
      .post('/carrito')
      .send(datosDePrueba);

    expect(response.status).toBe(200);
  });

  it("Obteniendo un error 401 para una solicitud sin token", async () => {
    const response = await request(app)
      .get("/usuarios");
    expect(response.status).toBe(401);
  });
});
