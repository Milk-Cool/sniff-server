import express from "express";
import { addTrustedBoard, getTrustedBoard } from "../index.js";
import { MAC_REGEX } from "../regex.js";

export const boardRouter = express.Router();
boardRouter.use(express.json());
boardRouter.post("/new", async (req, res) => {
    if(!req.body || !req.body.mac || !req.body.mac.match?.(MAC_REGEX))
        return res.status(400).send("Bad request");
    if(await getTrustedBoard(req.body.mac))
        return res.status(409).send("Already exists!");
    await addTrustedBoard(req.body.mac);
    res.send("OK");
});