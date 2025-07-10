const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();
const PORT = 3001;
const REVIEWS_FILE = './reviews.json';

app.use(cors());
app.use(express.json());

// Leer reseñas
app.get('/api/reviews', (req, res) => {
    fs.readFile(REVIEWS_FILE, 'utf8', (err, data) => {
        if (err) return res.json([]);
        try {
            res.json(JSON.parse(data));
        } catch {
            res.json([]);
        }
    });
});

// Agregar reseña
app.post('/api/reviews', (req, res) => {
    const nueva = req.body;
    nueva.id = Date.now(); // id único por timestamp
    fs.readFile(REVIEWS_FILE, 'utf8', (err, data) => {
        let reviews = [];
        if (!err && data) {
            try { reviews = JSON.parse(data); } catch {}
        }
        reviews.unshift(nueva);
        fs.writeFile(REVIEWS_FILE, JSON.stringify(reviews, null, 2), () => {
            res.json({ ok: true });
        });
    });
});

// Eliminar reseña (requiere contraseña en query)
app.delete('/api/reviews/:id', (req, res) => {
    const password = req.query.password;
    if (password !== 'NoTocar123') {
        return res.status(403).json({ ok: false, error: 'Contraseña incorrecta' });
    }
    const id = parseInt(req.params.id);
    fs.readFile(REVIEWS_FILE, 'utf8', (err, data) => {
        let reviews = [];
        if (!err && data) {
            try { reviews = JSON.parse(data); } catch {}
        }
        const newReviews = reviews.filter(r => r.id !== id);
        fs.writeFile(REVIEWS_FILE, JSON.stringify(newReviews, null, 2), () => {
            res.json({ ok: true });
        });
    });
});

app.listen(PORT, () => {
    console.log(`API de reseñas corriendo en http://localhost:${PORT}`);
});