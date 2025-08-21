import mongoose from "mongoose";
import {DB_NAME} from "../constants.js"

const connectDB = async() => {
  try {
    const connectionInstance = await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
    console.log(`\nConnected to MongoDB at ${connectionInstance.connection.host}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

export default connectDB;