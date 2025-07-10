import express from "express";
import { boardRouter } from "./boards.js";
import { statsRouter } from "./stats.js";
import { searchRouter } from "./search.js";
import { passgenRouter } from "./passgen.js";
import { detialsRouter } from "./details.js";
import { exportRouter } from "./export.js";

export const apiRouter = express.Router();
apiRouter.use(async (req, res, next) => {
    const tok = req.headers.authorization?.replace?.("Bearer ", "");
    if(tok !== process.env.ADMIN_KEY && !(process.env.DEMO && tok === "Demo123"))
        return res.status(401).send("Unauthorized!");
    return await next();
});
apiRouter.get("/check", (_req, res) => res.send("OK"));
apiRouter.use("/boards", boardRouter);
apiRouter.use("/stats", statsRouter);
apiRouter.use("/search", searchRouter);
apiRouter.use("/passgen", passgenRouter);
apiRouter.use("/details", detialsRouter);
apiRouter.use("/export", exportRouter);
