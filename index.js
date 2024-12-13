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


// Route for Processing Search
app.get('/', async (req, res) => {
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
            
            results = await collection.find({ 
                ticker: searchQuery 
            }).toArray();
        } else {

            // Search by company name (case-insensitive)
            results = await collection.find({ 
                company: searchQuery 
            }).toArray();
        }
        console.log("the result is", results);
        
    } catch (error) {
        console.error("Search error:", error);
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});
