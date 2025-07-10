import express from "express";
import { exportData, countData } from "../index.js";

export const exportRouter = express.Router();
exportRouter.get("/count", async (req, res) => {
    const from = req.query.from ? parseInt(req.query.from) : 0;
    const to = req.query.to ? parseInt(req.query.to) : Date.now();
    res.send((await countData(
        Number.isNaN(from) ? 0 : from,
        Number.isNaN(to) ? Date.now() : to
    )).toString());
});
exportRouter.get("/", async (req, res) => {
    const from = req.query.from ? parseInt(req.query.from) : 0;
    const to = req.query.to ? parseInt(req.query.to) : Date.now();
    res.send(await exportData(
        Number.isNaN(from) ? 0 : from,
        Number.isNaN(to) ? Date.now() : to
    ));
});
