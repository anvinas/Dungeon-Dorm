const User = require ('./authModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const InventoryItem = require('../barkeeper/InventoryItem');

// ✅ GET /inventory - Fetch all inventory items
exports.findAll = async (req, res) => {
    try {
        const items = await InventoryItem.find().sort({ createdAt: -1 }); // optional: newest first
        res.status(200).json(items);
    } catch (error) {
        console.error('Error fetching inventory items:', error);
        res.status(500).json({ error: 'Server error' });
    }
}

// POST /inventory - Create new inventory item
exports.create = async (req, res) => {
    try {
        const { name, healthAmount, description } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Name is required' });
        }

        const newItem = new InventoryItem({ name, healthAmount, description });
        const savedItem = await newItem.save();

        res.status(201).json(savedItem);
    } catch (error) {
        console.error('Error creating inventory item:', error);
        res.status(500).json({ error: 'Server error' });
    }
}