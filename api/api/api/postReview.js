// Se encargará de recibir el nombre y la opinión del formulario y guardarlos en la base de datos.
const { neon } = require('@neondatabase/serverless');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Vercel manda un OPTIONS primero para verificar permisos
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Recibe los datos que enviaremos desde el frontend
  const { user_name, comment } = req.body;

  if (!user_name || !comment) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }

  try {
    const sql = neon(process.env.DATABASE_URL);
    
    // Inserta la reseña en la base de datos
    const result = await sql`
      INSERT INTO reviews (user_name, comment) 
      VALUES (${user_name}, ${comment}) 
      RETURNING *
    `;
    
    res.status(201).json(result[0]);
  } catch (error) {
    console.error("Error guardando en Neon:", error);
    res.status(500).json({ error: error.message });
  }
};