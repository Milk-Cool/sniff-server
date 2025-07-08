import express from "express";
import { loadEjs } from "./loadejs.js";

export const frontendRouter = express.Router();
frontendRouter.get("/auth", (_req, res) => res.send(loadEjs({}, "auth.ejs")));
frontendRouter.get("/upload", (_req, res) => res.send(loadEjs({}, "upload.ejs")));