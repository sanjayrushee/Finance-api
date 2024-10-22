import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
    type: { type: String, required: true, enum: ['income', 'expense'] },
    category: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    description: { type: String }
});

const Transaction = mongoose.model('Transaction', transactionSchema);
const categorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, required: true, enum: ['income', 'expense'] }
});

const Category = mongoose.model('Category', categorySchema);
export {Transaction, Category};
