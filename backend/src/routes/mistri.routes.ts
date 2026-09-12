import { Router } from "express";
import {
  getPaidSlotStatus,
  listMistris,
  registerMistri,
} from "../controllers/mistri.controller.js";

export const mistriRouter = Router();

mistriRouter.get("/", listMistris);
mistriRouter.get("/paid-slot", getPaidSlotStatus);
mistriRouter.post("/register", registerMistri);
