import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Transaction } from './schemas.js';
dotenv.config();

const app = express();
app.use(express.json()); 

const MONGO_URI = process.env.MONGODB_URI;

const connectToDatabase = async () => {
    try {
      await mongoose.connect(MONGO_URI);
      console.log("Connected to MongoDB");
    } catch (err) {
      console.error("Failed to connect to MongoDB", err);
    }
  };

  connectToDatabase();

//  Add a new transaction 
app.post('/transactions', async (request, response) => {
    try {
        const { type, category, amount, description } = request.body;

        // Basic validation
        if (!type || !category || !amount) {
            return response.status(400).send({ error: 'Type, category, and amount are required' });
        }

        if (type !== 'income' && type !== 'expense') {
            return response.status(400).send({ error: 'Type must be either "income" or "expense"' });
        }

        if (typeof amount !== 'number' || amount <= 0) {
            return response.status(400).send({ error: 'Amount must be a positive number' });
        }

        const transaction = new Transaction({ type, category, amount, description });
        await transaction.save();
        response.status(201).send(transaction);
    } catch (error) {
        response.status(400).send({ error: 'Invalid input or Server error' });
    }
});


//  Get all 
app.get('/transactions', async (request, response) => {
    try {
        const transactions = await Transaction.find();
        response.status(200).send(transactions);
    } catch (error) {
        response.status(500).send({ error: 'Unable to fetch transactions' });
    }
});

//  Get a transaction by ID
app.get('/transactions/:id', async (request, response) => {
    try {
        const transaction = await Transaction.findById(request.params.id);
        if (!transaction) return response.status(404).send({ error: 'Transaction not found' });
        response.status(200).send(transaction);
    } catch (error) {
        response.status(500).send({ error: 'Invalid transaction ID' });
    }
});

// Update 
app.put('/transactions/:id', async (request, response) => {
    try {
        const { type, category, amount, description } = request.body;
        const transaction = await Transaction.findByIdAndUpdate(
            request.params.id,
            { type, category, amount, description },
            { new: true, runValidators: true }
        );
        if (!transaction) return response.status(404).send({ error: 'Transaction not found' });
        response.status(200).send(transaction);
    } catch (error) {
        response.status(400).send({ error: 'Invalid input or transaction ID' });
    }
});


//  Delete
app.delete('/transactions/:id', async (request, response) => {
    try {
        const transaction = await Transaction.findByIdAndDelete(request.params.id);
        if (!transaction) return response.status(404).send({ error: 'Transaction not found' });
        response.status(200).send({ message: 'Transaction deleted' });
    } catch (error) {
        response.status(500).send({ error: 'Invalid transaction ID' });
    }
});

//summary
app.get('/summary', async (request, response) => {
    try {
        const transactions = await Transaction.find(); // Retrieve all transactions

        let totalIncome = 0;
        let totalExpense = 0;

        // Calculate totals
        transactions.forEach(transaction => {
            if (transaction.type === 'income') {
                totalIncome += transaction.amount;
            } else if (transaction.type === 'expense') {
                totalExpense += transaction.amount;
            }
        });

        const balance = totalIncome - totalExpense;

        response.status(200).send({ totalIncome, totalExpense, balance });
    } catch (error) {
        response.status(500).send({ error: 'Unable to fetch summary' });
    }
});

// listen
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
