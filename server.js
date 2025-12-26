import dotenv from "dotenv";
import express from "express";
import routes from "./routes/indexRoutes.js";
import cors from "cors";
import connectDB from "./config/db.js";

const app = express();
const port = 3001;
dotenv.config();
app.use(
  cors({
    origin: ["http://localhost:5173", "https://omj-swc.vercel.app"], // yahan 2 URLs allow hain
  })
);
app.use(express.json()); // To parse JSON request bodies
app.use(express.urlencoded({ extended: true }));

connectDB();

app.get("/", (req, res) => {
  res.json({
    message: "hello world EMS",
  });
});

app.use(routes);

app.listen(port, () => {
  console.log(`app start on port ${port}`);
});
