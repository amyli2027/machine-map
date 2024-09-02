const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/machineDB')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Failed to connect to MongoDB', err));

// Create a Mongoose Schema
const machineSchema = new mongoose.Schema({
    name: String,
    info: String
});

// Create a Mongoose Model
const Machine = mongoose.model('Machine', machineSchema);

// Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname)));

// Endpoint to serve the JSON file (if needed)
app.get('/machines.json', (req, res) => {
    res.sendFile(path.join(__dirname, 'machines.json'));
});

// Endpoint to import JSON data to MongoDB
app.get('/import', async (req, res) => {
    try {
        // Read the JSON file
        const data = fs.readFileSync(path.join(__dirname, 'machines.json'), 'utf8');
        const machinesData = JSON.parse(data).machines;

        let newEntries = [];

        // Loop through the machines in the JSON file
        for (let machine of machinesData) {
            // Check if the machine already exists in the database
            const existingMachine = await Machine.findOne({ name: machine.name });

            // If the machine does not exist, add it to the newEntries array
            if (!existingMachine) {
                newEntries.push(machine);
            }
        }

        // If there are new entries, insert them into the database
        if (newEntries.length > 0) {
            const result = await Machine.insertMany(newEntries);
            console.log("New data inserted into MongoDB:", result);
            res.send('New machines data imported to MongoDB successfully!');
        } else {
            console.log("No new data to insert.");
            res.send('No new machines data to import.');
        }
    } catch (err) {
        console.error('Error importing data:', err);
        res.status(500).send('Failed to import data to MongoDB');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
