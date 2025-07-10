import { Pool } from "pg";
import { createHash, randomUUID } from "crypto";

export const pool = new Pool({
    host: process.env.POSTGRES_HOST,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB
});
/** @typedef {"0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "a" | "b" | "c" | "d" | "e" | "f" | "A" | "B" | "C" | "D" | "E" | "F"} HexChar */
/** @typedef {`${HexChar}${HexChar}`} HexByte */
/** @typedef {`${HexByte}:${HexByte}:${HexByte}:${HexByte}:${HexByte}:${HexByte}`} MAC */

/**
 * @typedef {object} Board A board
 * @prop {import("crypto").UUID} id Board internal UUID
 * @prop {MAC} mac Board mac
 * @prop {string} name Board name
 * @prop {Buffer} key Board authkey
 */
/**
 * @typedef {object} Sniff A sniffed MAC
 * @prop {import("crypto").UUID} id Sniff internal UUID
 * @prop {MAC} from_mac Board mac
 * @prop {MAC} mac Device mac
 * @prop {number} rssi RSSI at the moment
 * @prop {number} timestamp Timestamp
 */

export const init = async () => {
    await pool.query(`CREATE TABLE IF NOT EXISTS boards (
        id uuid NOT NULL,
        mac bytea NOT NULL,
        name varchar(80),
        key bytea,

        PRIMARY KEY (id)
    )`);
    await pool.query(`CREATE TABLE IF NOT EXISTS sniffs (
        id uuid NOT NULL,
        from_mac bytea NOT NULL,
        mac bytea NOT NULL,
        rssi INTEGER NOT NULL,
        timestamp NUMERIC NOT NULL,

        PRIMARY KEY (id)
    )`);
};
export const deinit = async () => {
    await pool.end();
};

/**
 * @param {string} mac MAC address
 * @returns {Buffer} That adderss as a buffer
 */
const macToBuffer = mac => {
    return Buffer.from(mac.split(":").map(x => parseInt(x, 16)));
};
/**
 * @param {Buffer} buf MAC address buffer
 * @returns That address as a string
 */
const bufferToMac = buf => {
    return Array.from(buf).map(x => x.toString(16).padStart(2, "0")).join(":");
};
/**
 * @param {object} obj Initial object
 * @returns {object} Output object
 */
const objToMacs = (obj, delKey = true) => {
    if(!obj) return obj;
    if("mac" in obj) obj.mac = bufferToMac(obj.mac);
    if("from_mac" in obj) obj.from_mac = bufferToMac(obj.from_mac);

    // For boards
    if("key" in obj && delKey) delete obj.key;

    return obj;
};

/**
 * Adds a trusted board.
 * @param {MAC} mac Board MAC address
 * @param {string} name Board name
 * @param {string} key Board authkey
 */
export const addTrustedBoard = async (mac, name, key) => {
    await pool.query(`INSERT INTO boards (id, mac, name, key) VALUES ($1, $2, $3, $4)`,
        [randomUUID(), macToBuffer(mac), name, Buffer.from(createHash("sha256").update(key).digest("hex"), "hex")]);
};
/**
 * Gets a trusted board.
 * @param {MAC} mac Board MAC address
 * @param {boolean} delKey whether the key should be omitted
 * @returns {Board} The board
 */
export const getTrustedBoard = async (mac, delKey = true) => {
    return objToMacs((await pool.query(`SELECT * FROM boards WHERE mac = $1`, [macToBuffer(mac)])).rows?.[0], delKey);
};
/**
 * Gets a trusted board by its ID.
 * @param {import("crypto").UUID} id Board ID
 * @returns {Board} The board
 */
export const getTrustedBoardByID = async id => {
    return objToMacs((await pool.query(`SELECT * FROM boards WHERE id = $1`, [id])).rows?.[0]);
};
/**
 * Deletes a trusted board by its ID.
 * @param {import("crypto").UUID} id Board UUID
 */
export const deleteTrustedBoardByID = async id => {
    await pool.query(`DELETE FROM boards WHERE id = $1`, [id]);
};
/**
 * Gets all trusted boards.
 * @returns {Board[]} The board
 */
export const getTrustedBoards = async () => {
    return ((await pool.query(`SELECT * FROM boards`)).rows)?.map?.(objToMacs);
};
/**
 * Changes a trusted board's name by its ID.
 * @param {import("crypto").UUID} id Board UUID
 * @param {string} name New name
 */
export const changeTrustedBoardsName = async (id, name) => {
    await pool.query(`UPDATE boards SET name = $2 WHERE id = $1`, [id, name]);
};

/**
 * Pushes a sniff to the database.
 * @param {MAC} fromMac Board MAC address
 * @param {MAC} mac Device MAC address
 * @param {number} rssi RSSI
 */
export const pushSniff = async (fromMac, mac, rssi) => {
    await pool.query(`INSERT INTO sniffs (id, from_mac, mac, rssi, timestamp)
        VALUES ($1, $2, $3, $4, $5)`, [randomUUID(), macToBuffer(fromMac), macToBuffer(mac), rssi, Date.now()]);
};

/**
 * Gets stats for sniffs in a certain time period.
 * Date.now() - sniff.timestamp < range
 * @param {number} range Range in ms
 * @returns {{ cnt: number, cnt_mac: number, cnt_from: number }} The stats
 */
export const getStats = async range => {
    return (await pool.query(`SELECT COUNT(*) AS cnt,
        COUNT(DISTINCT mac) as cnt_mac,
        COUNT(DISTINCT from_mac) as cnt_from
        FROM sniffs WHERE $1 - timestamp < $2`, [Date.now(), range])).rows?.[0];
}
/**
 * Gets chart data for sniffs in a certain time period.
 * Date.now() - sniff.timestamp < range
 * @param {number} range Range in ms
 * @returns {{ timestamp: number, cnt: number, cnt_mac: number, percentage: number }[]} The chart data
 */
export const getCharts = async range => {
    return (await pool.query(`SELECT FLOOR((timestamp - $1 + $2) / $2 * 100) AS percentage,
        MIN(timestamp) AS timestamp,
        COUNT(*) AS cnt,
        COUNT(DISTINCT mac) AS cnt_mac
        FROM sniffs WHERE $1 - timestamp < $2
        GROUP BY percentage ORDER BY percentage ASC`, [Date.now(), range])).rows;
}
/**
 * Gets stats for sniffs in a certain time period by a certain board.
 * Date.now() - sniff.timestamp < range
 * @param {MAC} mac Board MAC
 * @param {number} range Range in ms
 * @returns {{ cnt: number, cnt_mac: number }} The stats
 */
export const getBoardStats = async (mac, range) => {
    return (await pool.query(`SELECT COUNT(*) AS cnt,
        COUNT(DISTINCT mac) as cnt_mac
        FROM sniffs WHERE $1 - timestamp < $2 AND from_mac = $3`, [Date.now(), range, macToBuffer(mac)])).rows?.[0];
}
/**
 * Gets chart data for sniffs in a certain time period by a certain board.
 * Date.now() - sniff.timestamp < range
 * @param {MAC} mac Board MAC
 * @param {number} range Range in ms
 * @returns {{ timestamp: number, cnt: number, cnt_mac: number, percentage: number }[]} The chart data
 */
export const getBoardCharts = async (mac, range) => {
    return (await pool.query(`SELECT FLOOR((timestamp - $1 + $2) / $2 * 100) AS percentage,
        MIN(timestamp) AS timestamp,
        COUNT(*) AS cnt,
        COUNT(DISTINCT mac) AS cnt_mac
        FROM sniffs WHERE $1 - timestamp < $2 AND from_mac = $3
        GROUP BY percentage ORDER BY percentage ASC`, [Date.now(), range, macToBuffer(mac)])).rows;
}

/**
 * Finds MACs matching given options.
 * @param {number} from Min timestamp
 * @param {number} to Max timestamp
 * @param {MAC | ""} [at] MAC address of the board that must have sniffed their MAC
 * @returns {{ mac: MAC, spotted: number }[]} The results
 */
export const search = async (from, to, at = "") => {
    return (await pool.query(`SELECT mac,
        COUNT(*) AS spotted
        FROM sniffs WHERE timestamp >= $1 AND timestamp <= $2${at !== "" ? ` AND from_mac = $3` : ""}
        GROUP BY mac ORDER BY spotted DESC`, [from, to].concat(at === "" ? [] : [macToBuffer(at)]))).rows.map(x => {
            x = objToMacs(x);
            x.spotted = parseInt(x.spotted);
            return x;
        });
}