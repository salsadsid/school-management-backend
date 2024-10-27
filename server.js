import app from "./app.js";
import { connectDB } from "./config/db.js";

// database connection
connectDB();

// server
const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log(`App is running on port ${port}`);
});
