import express from "express";
import { boardRouter } from "./boards.js";

export const apiRouter = express.Router();
apiRouter.use(async (req, res, next) => {
    if(req.headers.authorization.replace("Bearer ", "") !== process.env.ADMIN_KEY)
        return res.status(401).send("Unauthorized!");
    return await next();
});
apiRouter.use("/boards", boardRouter);
