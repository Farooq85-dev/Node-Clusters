const cluster = require("cluster");
const os = require("os");

const totalLogicalProcessors = os.cpus().length;

if (cluster.isPrimary) {
  console.log(`Primary process ${process.pid} is running`);

  const workerCount = process.env.WORKER_COUNT || totalLogicalProcessors;

  for (let i = 0; i < workerCount; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });
} else {
  const express = require("express");
  const app = express();
  const PORT = process.env.PORT || 3500;

  app.use((req, res, next) => {
    console.log(`Request to ${req.path} handled by process ${process.pid}`);
    next();
  });

  app.get("/", (req, res) => {
    res.json(`Server is Running at process Id of ${process.pid} 🚀`);
  });

  app.listen(PORT, () => {
    console.log(
      `Worker ${process.pid} is running on http://localhost:${PORT} 🚀`
    );
  });

  process.on("SIGTERM", () => {
    console.log(`Worker ${process.pid} is shutting down.`);
    process.exit();
  });
}
