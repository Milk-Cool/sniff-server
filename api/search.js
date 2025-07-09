import express from "express";
import { search } from "../index.js";

export const searchRouter = express.Router();
searchRouter.get("/", async (req, res) => {
    const from = req.query.from ? parseInt(req.query.from) : 0;
    const to = req.query.to ? parseInt(req.query.to) : Date.now();
    const at = req.query.at || "";

    res.send(await search(
        Number.isNaN(from) ? 0 : from,
        Number.isNaN(to) ? Date.now() : to,
        at
    ));
});