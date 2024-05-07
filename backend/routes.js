import { Router } from "express";
import { createGraph } from "./controller.js";

const router = Router();

router.post("/create-graph", createGraph);

export default router;