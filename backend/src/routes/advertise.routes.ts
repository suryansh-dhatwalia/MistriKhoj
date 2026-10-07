import { Router } from "express";
import { getPublicRates, submitAdRequest } from "../controllers/ad-request.controller.js";

export const advertiseRouter = Router();

advertiseRouter.get("/rates", getPublicRates);
advertiseRouter.post("/", submitAdRequest);
