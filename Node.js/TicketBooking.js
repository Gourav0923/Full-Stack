// server.js

const express = require('express');
const app = express();
const PORT = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// --- Configuration and Data ---
const SEAT_LOCK_DURATION_MS = 60 * 1000; // 1 minute lock time

let seats = {
    'A1': { status: 'available', lockedBy: null, lockExpiresAt: null },
    'A2': { status: 'available', lockedBy: null, lockExpiresAt: null },
    'A3': { status: 'available', lockedBy: null, lockExpiresAt: null },
    'B1': { status: 'available', lockedBy: null, lockExpiresAt: null },
    'B2': { status: 'booked', lockedBy: 'SYSTEM', lockExpiresAt: null }, 
};

// Simple utility to generate a unique user ID for simulation
const generateUserId = () => `user_${Math.random().toString(36).substring(2, 9)}`;

// --- Seat Locking Utility/Cleanup Logic ---
const cleanupExpiredLocks = () => {
    const now = Date.now();
    for (const seatId in seats) {
        const seat = seats[seatId];
        if (seat.status === 'locked' && seat.lockExpiresAt < now) {
            console.log(`Lock expired for seat ${seatId}. Clearing lock.`);
            seat.status = 'available';
            seat.lockedBy = null;
            seat.lockExpiresAt = null;
        }
    }
};

// --- API Endpoints ---

/**
 * 1. GET /seats - View available seats
 */
app.get('/seats', (req, res) => {
    cleanupExpiredLocks(); 
    const view = {};
    for (const seatId in seats) {
        view[seatId] = { status: seats[seatId].status };
    }
    res.status(200).json(view);
});

/**
 * 2. POST /seats/lock - Temporarily lock a seat
 */
app.post('/seats/lock', (req, res) => {
    const { seatId, userId } = req.body;
    if (!seatId || !userId) {
        return res.status(400).json({ success: false, message: "Missing seatId or userId in request body." });
    }

    cleanupExpiredLocks(); 
    const seat = seats[seatId];
    if (!seat) {
        return res.status(404).json({ success: false, message: `Seat ${seatId} does not exist.` });
    }

    if (seat.status === 'booked') {
        return res.status(409).json({ success: false, message: `Seat ${seatId} is already booked.` });
    }

    if (seat.status === 'locked') {
        if (seat.lockedBy === userId) {
            seat.lockExpiresAt = Date.now() + SEAT_LOCK_DURATION_MS;
            return res.status(200).json({ 
                success: true, 
                message: `Lock renewed for seat ${seatId} by user ${userId}.`,
                lockExpiresAt: seat.lockExpiresAt
            });
        }
        return res.status(409).json({ success: false, message: `Seat ${seatId} is already locked by another user.` });
    }

    // Success: Lock the seat
    seat.status = 'locked';
    seat.lockedBy = userId;
    seat.lockExpiresAt = Date.now() + SEAT_LOCK_DURATION_MS;

    res.status(200).json({ 
        success: true, 
        message: `Seat ${seatId} successfully locked for user ${userId}.`,
        lockExpiresAt: seat.lockExpiresAt
    });
});

/**
 * 3. POST /seats/confirm - Confirm a booking
 */
app.post('/seats/confirm', (req, res) => {
    const { seatId, userId } = req.body;
    if (!seatId || !userId) {
        return res.status(400).json({ success: false, message: "Missing seatId or userId in request body." });
    }

    cleanupExpiredLocks(); 
    const seat = seats[seatId];
    if (!seat) {
        return res.status(404).json({ success: false, message: `Seat ${seatId} does not exist.` });
    }

    if (seat.status === 'booked') {
        return res.status(409).json({ success: false, message: `Seat ${seatId} is already permanently booked.` });
    }

    if (seat.status === 'locked' && seat.lockedBy === userId) {
        seat.status = 'booked';
        seat.lockedBy = userId;
        seat.lockExpiresAt = null;

        return res.status(201).json({ 
            success: true, 
            message: `Booking for seat ${seatId} confirmed by user ${userId}.`
        });
    } 

    if (seat.status === 'locked' && seat.lockedBy !== userId) {
        return res.status(403).json({ success: false, message: `Seat ${seatId} is locked by another user. Cannot confirm.` });
    } else {
        return res.status(400).json({ success: false, message: `Seat ${seatId} is available. Must lock seat before confirmation.` });
    }
});

// --- Start the server ---
app.listen(PORT, () => {
    console.log(`Booking API server running at http://localhost:${PORT}`);
});
