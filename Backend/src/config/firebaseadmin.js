import admin from "firebase-admin";
import dotenv from "dotenv";
import { createRequire } from "module";

dotenv.config();

const require = createRequire(import.meta.url);
const serviceAccount = require("../disaster-relief-37cdd-firebase-adminsdk-fbsvc-4a10562e4a.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default admin;
