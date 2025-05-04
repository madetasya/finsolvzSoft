import "dotenv/config";

import pkg from "mongoose";
const { connect, connection } = pkg;

async function database() {
  try {
    await connect(process.env.MONGO_URI);
    // console.log(`MongoDB Connected: ${connection.db.databaseName}`);
  } catch (err) {
    // console.error(err.message);
    process.exit(1);
  }
}

export default database;
