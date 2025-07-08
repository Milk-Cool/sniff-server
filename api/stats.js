import express from "express";
import { getCharts, getStats } from "../index.js";
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
statsRouter.get("/chart", async (req, res) => {
    const range = req.query.range ? parseInt(req.query.range) : DEFAULT_RANGE;
    const charts = await getCharts(Number.isNaN(range) ? DEFAULT_RANGE : range);
    res.send(charts.map(x => {
        x.cntMac = x.cnt_mac;
        delete x.cnt_mac;
        
        return Object.fromEntries(Object.entries(x).map(x => [x[0], parseInt(x[1])]));
    }));
});