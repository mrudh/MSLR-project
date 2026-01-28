const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGO_URI;

async function connectDB() {
  if (!MONGO_URI) throw new Error("MONGO_URI missing in environment");

  await mongoose.connect(MONGO_URI, { dbName: "Referendums" });
  console.log("MongoDB connected");
}

module.exports = connectDB;
