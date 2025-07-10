import express from "express";
import { addTrustedBoard, changeTrustedBoardsName, deleteTrustedBoardByID, getBoardCharts, getBoardStats, getTrustedBoard, getTrustedBoardByID, getTrustedBoards } from "../index.js";
import { MAC_REGEX } from "../regex.js";
import { DEFAULT_RANGE } from "../range.js";

export const boardRouter = express.Router();
boardRouter.use(express.json());
boardRouter.get("/", async (req, res) => {
    res.send(await getTrustedBoards());
});
boardRouter.get("/:id/delete", async (req, res) => {
    if(process.env.DEMO) return res.status(400).send("DEMO");
    await deleteTrustedBoardByID(req.params.id);
    res.send(await getTrustedBoards());
});
boardRouter.get("/:id/name", async (req, res) => {
    if(process.env.DEMO) return res.status(400).send("DEMO");
    if(!req.query.new) return res.status(400).send("Please specify a new name!");
    await changeTrustedBoardsName(req.params.id, req.query.new);
    res.send("OK");
});
boardRouter.get("/:id/stats", async (req, res) => {
    const range = req.query.range ? parseInt(req.query.range) : DEFAULT_RANGE;
    const board = await getTrustedBoardByID(req.params.id);
    if(!board) return res.status(404).send("Couldn't find the board!");
    const stats = await getBoardStats(board.mac, Number.isNaN(range) ? DEFAULT_RANGE : range);
    res.send({
        cnt: stats.cnt,
        cntMac: stats.cnt_mac
    });
});
boardRouter.get("/:id/chart", async (req, res) => {
    const range = req.query.range ? parseInt(req.query.range) : DEFAULT_RANGE;
    const board = await getTrustedBoardByID(req.params.id);
    if(!board) return res.status(404).send("Couldn't find the board!");
    const charts = await getBoardCharts(board.mac, Number.isNaN(range) ? DEFAULT_RANGE : range);
    res.send(charts.map(x => {
        x.cntMac = x.cnt_mac;
        delete x.cnt_mac;
        
        return Object.fromEntries(Object.entries(x).map(x => [x[0], parseInt(x[1])]));
    }));
});
boardRouter.post("/new", async (req, res) => {
    if(process.env.DEMO) return res.status(400).send("DEMO");
    if(!req.body || !req.body.mac || !req.body.mac.match?.(MAC_REGEX) || !req.body.key)
        return res.status(400).send("Bad request");
    if(await getTrustedBoard(req.body.mac))
        return res.status(409).send("Already exists!");
    await addTrustedBoard(req.body.mac, req.body.name || "", req.body.key);
    res.send(await getTrustedBoards());
});