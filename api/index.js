import express from "express";
import { boardRouter } from "./boards.js";
import { statsRouter } from "./stats.js";
import { searchRouter } from "./search.js";
import { passgenRouter } from "./passgen.js";

export const apiRouter = express.Router();
apiRouter.use(async (req, res, next) => {
    if(req.headers.authorization?.replace?.("Bearer ", "") !== process.env.ADMIN_KEY)
        return res.status(401).send("Unauthorized!");
    return await next();
});
apiRouter.get("/check", (_req, res) => res.send("OK"));
apiRouter.use("/boards", boardRouter);
apiRouter.use("/stats", statsRouter);
apiRouter.use("/search", searchRouter);
apiRouter.use("/passgen", passgenRouter);
