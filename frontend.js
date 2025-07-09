import express from "express";
import { loadEjs } from "./loadejs.js";
import { DEFAULT_RANGE } from "./range.js";
import { getTrustedBoardByID } from "./index.js";

export const frontendRouter = express.Router();
frontendRouter.get("/auth", (_req, res) => res.send(loadEjs({}, "auth.ejs")));
frontendRouter.get("/", async (req, res) => {
    const range = req.query.range ? parseInt(req.query.range) : DEFAULT_RANGE;
    res.send(loadEjs({ range }, "dashboard.ejs"))
});
frontendRouter.get("/viewer", (_req, res) => res.send(loadEjs({}, "viewer.ejs")));
frontendRouter.get("/upload", (_req, res) => res.send(loadEjs({}, "upload.ejs")));
frontendRouter.get("/boards", (_req, res) => res.send(loadEjs({}, "boards.ejs")));
frontendRouter.get("/board", async (req, res) => {
    const range = req.query.range ? parseInt(req.query.range) : DEFAULT_RANGE;
    const id = req.query.id;
    if(!id) return res.status(400).send("Bad request - please specify a board ID!");
    const board = await getTrustedBoardByID(id);
    if(!board) return res.status(404).send("Unknown/untrusted board!");
    res.send(loadEjs({ range, id: board.id, mac: board.mac }, "board.ejs"))
});