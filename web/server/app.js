import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import routes from "./router/index.js";
import database from "./config/db.js";
import errorWarning from "./helpers/error.js";
import userController from "./controllers/userController.js";
const app = express();

database();
// app.use(cors({ origin: "*" }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", routes);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "public")));
app.use(errorWarning);

const greeting = process.env.GREETING;
app.get("/", (req, res) => {
  res.send(`${greeting}`);
});

app.get("/favicon.ico", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "favicon.ico"));
});

const PORT = process.env.PORT;
// app.listen(PORT, "0.0.0.0", () => console.log(`🚀🚀 Server running on http://159.89.194.251:${PORT} 🚀🚀`));
// console.log(process.env.EXPO_PUBLIC_API_URL);

app.listen(PORT, () => console.log(`🚀🚀 Server running on http://localhost:${PORT} 🚀🚀`));
