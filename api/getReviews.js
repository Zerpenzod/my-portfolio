//Se encargará de pedirle todas las reseñas a Neon (de la más nueva a la más vieja).
const { neon } = require('@neondatabase/serverless');

module.exports = async function handler(req, res) {
  // Permitir peticiones desde cualquier origen (CORS)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  try {
    // Se conecta a Neon usando la variable de entorno de Vercel
    const sql = neon(process.env.DATABASE_URL);
    
    // Consulta SQL
    const reviews = await sql`SELECT * FROM reviews ORDER BY created_at DESC`;
    
    res.status(200).json(reviews);
  } catch (error) {
    console.error("Error en Neon:", error);
    res.status(500).json({ error: error.message });
  }
};