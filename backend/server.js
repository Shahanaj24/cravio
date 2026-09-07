// // start server
// require('dotenv').config();
// const app = require('./src/app');
// const connectDB = require('./src/db/db');


// connectDB();



// app.listen(3000, () => {
//     console.log("Server is running on port 3000");
// })

require("dotenv").config();

const app = require("./src/app");

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});