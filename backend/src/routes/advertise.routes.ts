import { Router } from "express";
import { submitAdRequest } from "../controllers/ad-request.controller.js";

export const advertiseRouter = Router();

advertiseRouter.post("/", submitAdRequest);
