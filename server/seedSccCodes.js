require("dotenv").config();
const mongoose = require("mongoose");

const connectDB = require("./config/db");

const SccCodeModel = require('./models/SccCode');

const sccCodes = [
  '0IXYCAH8UW',
  '12EOU5RGVX',
  '1AZN0FXJVM',
  '46HJV9KH1F',
  '4XRDN9O4AW',
  '921664ML8D',
  '9IJKHGHJK4',
  'A546AKU16A',
  'GKJ3K1YBGE',
  'IGBQET8OOY',
  'IKKSZYJTSH',
  'JOV50TOSYR',
  'N5J53QK9FO',
  'R2ZHBUYO2V',
  'S6K3AV3IVR',
  'SDUBJ5IOYB',
  'V0GB2G690L',
  'YFUVLYBQZR',
  'Z9HOC1LF4X',
  'ZDN06T01V9',
];

async function seed() {
  try {
    await connectDB();

    const docs = sccCodes.map((code) => ({ scc: code, used: false }));

    for (const doc of docs) {
      await SccCodeModel.updateOne(
        { scc: doc.scc },
        { $setOnInsert: doc },
        { upsert: true }
      );
    }

    console.log("SCC codes inserted/ensured successfully!");
  } catch (err) {
    console.error("Error seeding SCC codes:", err);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
