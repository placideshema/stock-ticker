const express = require('express');
const { MongoClient } = require('mongodb');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// MongoDB connection string
const uri = "mongodb+srv://shema:placide@cluster0.3hisc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Route for Home Page
app.get('/', (req, res) => {
    res.render('home');
});

// Route for Processing Search
app.get('/process', async (req, res) => {
    const { searchQuery, searchType } = req.query;
    
    if (!searchQuery) {
        return res.render('results', { 
            error: 'Please enter a search query', 
            results: [] 
        });
    }

    const client = new MongoClient(uri);

    try {
        await client.connect();
        const database = client.db("Stock");
        const collection = database.collection("PublicCompanies");

        let results;
        if (searchType === 'ticker') {
            // Search by ticker symbol (case-insensitive)
            results = await collection.find({ 
                ticker: { $regex: new RegExp(searchQuery, 'i') } 
            }).toArray();
        } else {
            // Search by company name (case-insensitive)
            results = await collection.find({ 
                company: { $regex: new RegExp(searchQuery, 'i') } 
            }).toArray();
        }

        res.render('results', { 
            results, 
            searchQuery, 
            searchType,
            error: results.length === 0 ? 'No matching companies found' : null
        });
    } catch (error) {
        console.error("Search error:", error);
        res.render('results', { 
            error: 'An error occurred during search', 
            results: [] 
        });
    } finally {
        await client.close();
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
