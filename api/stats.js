import express from "express";
import { getStats } from "../index.js";
import { DEFAULT_RANGE } from "../range.js";

export const statsRouter = express.Router();
statsRouter.get("/", async (req, res) => {
    const range = req.query.range ? parseInt(req.query.range) : DEFAULT_RANGE;
    const stats = await getStats(Number.isNaN(range) ? DEFAULT_RANGE : range);
    res.send({
        cnt: stats.cnt,
        cntMac: stats.cnt_mac,
        cntFrom: stats.cnt_from
    });
});