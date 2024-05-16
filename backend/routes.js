import { Router } from "express";
import { applyHeuristics } from "./Controller.js";

const router = Router();

router.post("/apply-heuristics", applyHeuristics);

export default router;