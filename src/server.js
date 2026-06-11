require('dotenv').config();
const app = require('./app');
const connectDatabase = require('./config/db');

const PORT = process.env.PORT || 4000;

const startServer = async () => {
    await connectDatabase();

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

startServer();

setInterval(() => {
    console.log('Performing periodic cleanup of old reports...');
    fetch("https://angosecapi.onrender.com/api/health", {
        method: "GET",
    })
        .then((response) => response.json())
        .then((data) => {
            console.log("API Health Check:", data);
        })
        .catch((error) => {
            console.error("API Health Check Failed:", error);
        });
},14 * 1000); 
