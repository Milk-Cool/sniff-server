import express from "express";
import { randomBytes } from "crypto";

export const passgenRouter = express.Router();
passgenRouter.get("/", (_req, res) => {
    res.send(randomBytes(16).toString("hex"));
});