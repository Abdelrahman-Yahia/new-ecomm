const shirtModel = require('../models/shirtModel');

const getAllShirts = async (req, res) => {
  try {
    const shirts = await shirtModel.getAllShirts();
    res.json(shirts);
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching shirts' });
  }
};

const getShirtById = async (req, res) => {
  try {
    const shirt = await shirtModel.getShirtById(req.params.id);
    if (!shirt) return res.status(404).json({ error: 'Shirt not found' });
    res.json(shirt);
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching shirt' });
  }
};

const createShirt = async (req, res) => {
  try {
    const { name, description, price, stock } = req.body;
    if (!name || !price) return res.status(400).json({ error: 'Name and price are required' });

    const newShirt = await shirtModel.createShirt({ name, description, price, stock: stock || 0 });
    res.status(201).json(newShirt);
  } catch (error) {
    res.status(500).json({ error: 'Server error creating shirt' });
  }
};

const updateShirt = async (req, res) => {
  try {
    const { name, description, price, stock } = req.body;
    const updatedShirt = await shirtModel.updateShirt(req.params.id, { name, description, price, stock });
    if (!updatedShirt) return res.status(404).json({ error: 'Shirt not found' });
    res.json(updatedShirt);
  } catch (error) {
    res.status(500).json({ error: 'Server error updating shirt' });
  }
};

const deleteShirt = async (req, res) => {
  try {
    await shirtModel.deleteShirt(req.params.id);
    res.json({ message: 'Shirt deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error deleting shirt' });
  }
};

module.exports = { getAllShirts, getShirtById, createShirt, updateShirt, deleteShirt };
