import express from "express";
import { addTrustedBoard, deleteTrustedBoardByID, getTrustedBoard, getTrustedBoards } from "../index.js";
import { MAC_REGEX } from "../regex.js";

export const boardRouter = express.Router();
boardRouter.use(express.json());
boardRouter.get("/", async (req, res) => {
    res.send(await getTrustedBoards());
});
boardRouter.get("/:id/delete", async (req, res) => {
    await deleteTrustedBoardByID(req.params.id);
    res.send(await getTrustedBoards());
});
boardRouter.post("/new", async (req, res) => {
    if(!req.body || !req.body.mac || !req.body.mac.match?.(MAC_REGEX))
        return res.status(400).send("Bad request");
    if(await getTrustedBoard(req.body.mac))
        return res.status(409).send("Already exists!");
    await addTrustedBoard(req.body.mac);
    res.send(await getTrustedBoards());
});