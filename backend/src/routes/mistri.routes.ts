import { Router } from "express";
import { listMistris, registerMistri } from "../controllers/mistri.controller.js";

export const mistriRouter = Router();

mistriRouter.get("/", listMistris);
mistriRouter.post("/register", registerMistri);
