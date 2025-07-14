const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Archivo para guardar las reseñas
const reviewsFile = path.join(__dirname, 'reviews.json');

// Función para leer reseñas
function readReviews() {
    try {
        if (fs.existsSync(reviewsFile)) {
            const data = fs.readFileSync(reviewsFile, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error leyendo reseñas:', error);
    }
    return [];
}

// Función para escribir reseñas
function writeReviews(reviews) {
    try {
        fs.writeFileSync(reviewsFile, JSON.stringify(reviews, null, 2));
    } catch (error) {
        console.error('Error escribiendo reseñas:', error);
    }
}

// GET - Obtener todas las reseñas
app.get('/api/reviews', (req, res) => {
    const reviews = readReviews();
    res.json(reviews);
});

// POST - Agregar nueva reseña
app.post('/api/reviews', (req, res) => {
    const { name, rating, comment } = req.body;
    
    if (!name || !rating || !comment) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }
    
    const reviews = readReviews();
    const newReview = {
        id: Date.now().toString(),
        name,
        rating: parseInt(rating),
        comment,
        date: new Date().toISOString()
    };
    
    reviews.push(newReview);
    writeReviews(reviews);
    
    res.status(201).json(newReview);
});

// DELETE - Eliminar reseña (con contraseña)
app.delete('/api/reviews/:id', (req, res) => {
    const { id } = req.params;
    const { password } = req.body;
    
    // Contraseña para eliminar (puedes cambiarla)
    const ADMIN_PASSWORD = 'admin123';
    
    if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ error: 'Contraseña incorrecta' });
    }
    
    const reviews = readReviews();
    const reviewIndex = reviews.findIndex(review => review.id === id);
    
    if (reviewIndex === -1) {
        return res.status(404).json({ error: 'Reseña no encontrada' });
    }
    
    reviews.splice(reviewIndex, 1);
    writeReviews(reviews);
    
    res.json({ message: 'Reseña eliminada correctamente' });
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
}); 