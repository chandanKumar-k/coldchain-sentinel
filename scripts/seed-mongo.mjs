import { MongoClient } from "mongodb";
const c = new MongoClient(process.env.MONGODB_URI || "mongodb://localhost:27017");
const col = c.db(process.env.MONGODB_DATABASE || "coldchain_sentinel").collection("sensor_readings");
await col.deleteMany({});
const temps = { 1: [4.5,5.2,6.1,10.5,12.2,13.0], 2: [5.8,7.1,6.4,5.9,7.0,6.6], 3: [2.5,4.2,8.5,9.1,7.9,12.4] };
const docs = [];
for (const [id, arr] of Object.entries(temps)) arr.forEach((t, i) =>
  docs.push({ reading_id: `R-${id}-${i}`, sensor_id: +id, timestamp: new Date(Date.now() - (arr.length - i) * 300000), temperature: t }));
await col.insertMany(docs);
await col.createIndex({ sensor_id: 1, timestamp: -1 });
console.log("Inserted", docs.length); await c.close();
