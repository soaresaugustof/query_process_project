import { Router } from "express";
import { applyHeuristics } from "./controller.js";

const router = Router();

router.post("/apply-heuristics", applyHeuristics);

export default router;