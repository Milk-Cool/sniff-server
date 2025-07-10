// const data = ;

import express from "express";
import { getMACData } from "../index.js";

export const detialsRouter = express.Router();
detialsRouter.get("/", async (req, res) => {
    const from = req.query.from ? parseInt(req.query.from) : 0;
    const to = req.query.to ? parseInt(req.query.to) : Date.now();
    const offset = req.query.offset ? parseInt(req.query.offset) : 0;
    const mac = req.query.mac;
    if(!mac) res.status(400).send("MAC not specified!");

    const sniffs = await getMACData(
        mac,
        Number.isNaN(from) ? 0 : from,
        Number.isNaN(to) ? Date.now() : to,
        500, // TODO: pull from query?
        Number.isNaN(offset) ? 0 : offset
    );

    res.send(sniffs);
});