// server.js

/**
 * @fileoverview Servidor Node.js para actuar como proxy de la API de Marvel.
 * Permite buscar cómics y maneja la autenticación con las claves de la API de Marvel.
 * @module server
 */

// Carga las variables de entorno desde el archivo .env
require('dotenv').config();
const express = require('express');
const axios = require('axios'); // Para hacer solicitudes HTTP a la API de Marvel
const md5 = require('md5');     // Para generar el hash de autenticación de Marvel
const app = express();
const cors = require('cors');   // Para habilitar Cross-Origin Resource Sharing

app.use(cors());

app.use(express.static('frontend'));


app.get('/api/comics', async (req, res) => {
  const { title } = req.query;
  const ts = Date.now().toString();
  const publicKey = 'fd7855d3ea993643a7f632036e448990';
  const privateKey = 'ea2f3685bc95a9afe3bca94687f6c4b85d9d6282';

  console.log('--- Nueva solicitud a /api/comics ---');
  console.log('Título de búsqueda:', title);
  console.log('Timestamp:', ts);
  console.log('Clave Pública cargada:', publicKey ? 'Sí' : 'No', publicKey); // Confirma que la clave se carga

  // Genera el hash de autenticación
  const hash = md5(ts + privateKey + publicKey);
  console.log('Hash generado:', hash);

  const url = 'https://gateway.marvel.com/v1/public/comics?';

  try {
    console.log('Intentando hacer solicitud a la API de Marvel con URL:', url);
    const response = await axios.get(url, {
      params: {
        ts,
        apikey: publicKey,
        hash,
        titleStartsWith: title || undefined
      }
    });

    console.log('Respuesta de la API de Marvel (status):', response.status);
    res.json(response.data);
  } catch (error) {
    console.error('ERROR EN SERVER.JS: Error al consultar la API de Marvel:', error.message);
    if (error.response) {
      console.error('ERROR SERVER.JS: Datos de error de la respuesta:', error.response.data);
      console.error('ERROR SERVER.JS: Estado HTTP de la respuesta:', error.response.status);
    } else if (error.request) {
      // La solicitud fue hecha pero no se recibió respuesta
      console.error('ERROR SERVER.JS: No se recibió respuesta de la API de Marvel. Posiblemente un timeout o problema de red.');
    } else {
      // Algo más causó el error
      console.error('ERROR SERVER.JS: Error inesperado:', error.message);
    }
    res.status(error.response ? error.response.status : 500).json({
      error: 'Error al consultar la API de Marvel desde el servidor',
      details: error.message
    });
  }
});

// Inicia el servidor en el puerto 3000.
app.listen(3000, () => {
  console.log('Servidor iniciado en http://localhost:3000');
});
