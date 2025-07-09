import express from "express";
import { loadEjs } from "./loadejs.js";
import { DEFAULT_RANGE } from "./range.js";

export const frontendRouter = express.Router();
frontendRouter.get("/auth", (_req, res) => res.send(loadEjs({}, "auth.ejs")));
frontendRouter.get("/", async (req, res) => {
    const range = req.query.range ? parseInt(req.query.range) : DEFAULT_RANGE;
    res.send(loadEjs({ range }, "dashboard.ejs"))
});
frontendRouter.get("/upload", (_req, res) => res.send(loadEjs({}, "upload.ejs")));
frontendRouter.get("/boards", (_req, res) => res.send(loadEjs({}, "boards.ejs")));