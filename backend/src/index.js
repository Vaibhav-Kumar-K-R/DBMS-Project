// Dependecy Imports
import express from "express";
import "dotenv/config";
import cors from "cors";

// Configs Imports
import { connectDB } from "./config/db.js";

// Router endpoints
import vendorRouter from "./routes/vendor.route.js";
import customerRouter from "./routes/customer.route.js";
import adminRouter from "./routes/admin.route.js";
import managerRouter from "./routes/manager.route.js";
import employeeRouter from "./routes/employee.route.js";
import warehouseRouter from "./routes/warehouse.route.js";

connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.get("/health", (_req, res) => {
  res.status(200).json({
    health: "ok",
    message: "Server is running fine",
  });
});

// Route endpoints
app.use("/api/vendor", vendorRouter);
app.use("/api/customer", customerRouter);
app.use("/api/admin", adminRouter);
app.use("/api/warehouse", warehouseRouter);
app.use("/api/manager", managerRouter);
app.use("/api/employee", employeeRouter);

// Error handler
app.use("*", (err, _req, res, next) => {
  res.status(500).json({ error: err.message });
  next();
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});