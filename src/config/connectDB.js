const mongoose = require("mongoose");

const uri = process.env.MONGODB_URI;

if (!uri || !uri.trim()) {
  throw new Error("MONGODB_URI is not defined in environment variables");
}

const clientOptions = {
  serverApi: { version: "1", strict: true, deprecationErrors: true },
};

const connectDB = async () => {
  try {
    await mongoose.connect(uri, clientOptions);
    // await mongoose.connection.db.admin().command({ ping: 1 });
    // console.log("You successfully connected to MongoDB!");
  } catch (error) {
    throw error;
  } finally {
    //  await mongoose.disconnect();
  }
};

module.exports = connectDB;
