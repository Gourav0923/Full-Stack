const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

// --- In-memory Data Store ---
let cards = [
  { id: 1, suit: "Hearts", value: "Ace" },
  { id: 2, suit: "Spades", value: "King" },
  { id: 3, suit: "Diamonds", value: "Queen" }
];
let nextId = cards.length + 1;

// --- Routes ---

// Root route
app.get('/', (req, res) => {
  res.send("Welcome to the Playing Cards API. Use /cards to get started.");
});

// 1. GET /cards - List all cards
app.get('/cards', (req, res) => {
  res.status(200).json(cards);
});

// 2. GET /cards/:id - Retrieve card by ID
app.get('/cards/:id', (req, res) => {
  const cardId = parseInt(req.params.id);
  const card = cards.find(c => c.id === cardId);

  if (card) {
    res.status(200).json(card);
  } else {
    res.status(404).json({ message: `Card with ID ${cardId} not found.` });
  }
});

// 3. POST /cards - Add a new card
app.post('/cards', (req, res) => {
  const { suit, value } = req.body;

  if (!suit || !value) {
    return res.status(400).json({ message: "Missing 'suit' or 'value'." });
  }

  const newCard = { id: nextId++, suit, value };
  cards.push(newCard);

  res.status(201).location(`/cards/${newCard.id}`).json(newCard);
});

// 4. DELETE /cards/:id - Delete a card by ID
app.delete('/cards/:id', (req, res) => {
  const cardId = parseInt(req.params.id);
  const initialLength = cards.length;

  cards = cards.filter(c => c.id !== cardId);

  if (cards.length < initialLength) {
    res.status(204).send();
  } else {
    res.status(404).json({ message: `Card with ID ${cardId} not found.` });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Card API server running at http://localhost:${PORT}`);
});
