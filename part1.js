const fs = require('fs');
const { MongoClient } = require('mongodb');

// My string coonnection
const uri = "mongodb+srv://shema:placide@cluster0.3hisc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

async function loadCompaniesFromCSV() {
    const client = new MongoClient(uri);

    try {
        // Connecting to MongoDB
        await client.connect();
        console.log("Connected to MongoDB");

        // Selecting database and collection
        const database = client.db("Stock");
        const collection = database.collection("PublicCompanies");

        // Clearing
        await collection.deleteMany({});
        console.log("Cleared existing documents");

        // Read CSV file
        const fileContent = fs.readFileSync('companies-1.csv', 'utf-8');
        const lines = fileContent.split('\n').slice(1); // Skiping the header

        // Processing each line
        for (const line of lines) {
            if (line.trim()) {
                const [company, ticker, price] = line.split(',');
                
                // Inserting document
                await collection.insertOne({
                    company: company.trim(),
                    ticker: ticker.trim(),
                    price: parseFloat(price)
                });

                console.log(`Inserted: ${company} - ${ticker} - ${price}`);
            }
        }

        console.log("Data loading complete");
    } catch (error) {
        console.error("Error loading data:", error);
    } finally {
        await client.close();
    }
}

loadCompaniesFromCSV();