import { ROM, Transport, ESPLoader } from "https://unpkg.com/esptool-js@0.5.6/bundle.js";

if(!localStorage.getItem("_sniff_key"))
    alert("Key not set! Authenticate at /auth first");

document.querySelector("#api").value = location.origin;
const logs = document.querySelector("#logs");

const readFile = async el => {
    if(el.files.length === 0) return false;
    const reader = new FileReader();
    let done = false;
    reader.addEventListener("load", () => done = reader.result);
    reader.readAsArrayBuffer(el.files[0]);
    const cb = resolve => {
        if(done !== false) resolve();
        else setTimeout(cb, 1, resolve);
    }
    await new Promise(cb);
    return Array.from(new Uint8Array(done)).map(x => String.fromCharCode(x)).join("");
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

document.querySelector("#upload").addEventListener("click", async () => {
    const bootloader = await readFile(document.querySelector("#bootloader"));
    const partitions = await readFile(document.querySelector("#partitions"));
    const firmware = await readFile(document.querySelector("#firmware"));
    if(!bootloader || !partitions || !firmware)
        return alert("Please upload the necessary files!");

    const ssid = document.querySelector("#ssid").value;
    const password = document.querySelector("#password").value;
    const api = document.querySelector("#api").value;
    if(!ssid || !password || !api)
        return alert("Please enter the settings!");

    const device = await navigator.serial.requestPort();
    const transport = new Transport(device, true);
    logs.value = "";

    const loader = new ESPLoader({
        transport,
        baudrate: 115200
    });
    await loader.connect();
    const mac = await loader.chip.readMac(loader);
    console.log(mac);
    logs.value += "Got MAC address\n";
    const f = await fetch("/api/boards/new", {
        method: "POST",
        headers: {
            "content-type": "application/json",
            authorization: "Bearer " + localStorage.getItem("_sniff_key")
        },
        body: JSON.stringify({ mac })
    });
    if(f.status === 200) logs.value += "Board added!\n";
    else {
        logs.value += "Couldn't add board: " + f.status + "\n";
        if(f.status !== 409) return;
        logs.value += "Continuing anyway - it already exists\n";
    }
    
    logs.value += "Uploading, please wait...\n";
    await loader.writeFlash({
        eraseAll: true,
        fileArray: [
            { address: 0x1000, data: bootloader },
            { address: 0x8000, data: partitions },
            { address: 0x10000, data: firmware }
        ],
        flashSize: "keep",
        compress: true,
    });
    await loader.after();
    logs.value += "Flashed the board, starting configuration...\n";

    await sleep(1000);
    const writer = await device.writable.getWriter();
    await writer.write(new TextEncoder().encode(`s${ssid}\np${password}\na${api}\n`));
    logs.value += "Written settings.\nDone! Wait 60s and see if it works :D\n"
});