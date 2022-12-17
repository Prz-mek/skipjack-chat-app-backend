import mongoose from 'mongoose';
const dotenv = require("dotenv").config();

async function connectToDatabase() {
  try {
    if (process.env.DB_STRING) {
        const conn = await mongoose.connect(process.env.DB_STRING)
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } else {
        throw new Error("No database connection string");
    }
  } catch (error) {
    console.log(error)
    process.exit(1)
  }
}

export default connectToDatabase;