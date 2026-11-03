import mysql from "mysql2/promise";
import { MongoClient } from "mongodb";
export const pool = mysql.createPool({
  host: process.env.MYSQL_HOST, user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD, database: process.env.MYSQL_DATABASE, connectionLimit: 5,
});
const client = new MongoClient(process.env.MONGODB_URI || "mongodb://localhost:27017");
export const readings = async () =>
  (await client.connect()).db(process.env.MONGODB_DATABASE).collection("sensor_readings");
