import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import routes from "./router/index.js";
import database from "./config/db.js";
import errorWarning from "./helpers/error.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

database();

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

app.use("/", routes);
app.use(errorWarning);

const greeting = process.env.GREETING;
app.get("/", (req, res) => {
  res.send(`${greeting}`);
});

app.get("/favicon.ico", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "favicon.ico"));
});

const PORT = process.env.PORT || 8787;
app.listen(PORT, "0.0.0.0", () => console.log(`🚀🚀 Server running on http://159.89.194.251:${PORT} 🚀🚀`));
