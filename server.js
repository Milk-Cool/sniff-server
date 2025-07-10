import express from "express";
import "dotenv/config";
import { deinit, getTrustedBoard, init, pushSniff } from "./index.js";
import { MAC_REGEX } from "./regex.js";
import { apiRouter } from "./api/index.js";
import { frontendRouter } from "./frontend.js";
import { createHash } from "crypto";

const app = express();
app.use(express.static("public"));
app.use(frontendRouter);

app.use("/api", apiRouter);
app.post("/sniff", express.json(), async (req, res) => {
    if(!req.body || !req.body.key || !req.body.mac || !req.body.mac.match?.(MAC_REGEX) || !Array.isArray(req.body.sniffs))
        return res.status(400).send("Invalid body!");
    const board = await getTrustedBoard(req.body.mac, false);
    if(!board || !board.key.equals(Buffer.from(createHash("sha256").update(req.body.key).digest("hex"), "hex")))
        return res.status(401).send("Unauthorized!");
    for(const sniff of req.body.sniffs) {
        if(!sniff.mac || !sniff.mac.match?.(MAC_REGEX) || typeof sniff.rssi !== "number")
            return res.status(400).send(`Invalid sniff!\n${JSON.stringify(sniff)}`);
        await pushSniff(req.body.mac, sniff.mac, sniff.rssi);
    }
    res.send("OK");
});

await init();
app.listen(9097);
const stop = async () => {
    await deinit();
    process.exit(0);
}
process.on("SIGHUP", async () => await stop());
process.on("SIGUSR2", async () => await stop());
process.on("SIGINT", async () => await stop());
process.on("SIGTERM", async () => await stop());