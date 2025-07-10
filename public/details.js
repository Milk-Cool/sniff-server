let offset = 0;
const timeline = document.querySelector("#timeline");
const pullTimeline = async () => {
    const query = new URLSearchParams(location.search);
    const f = await fetch(`/api/details?mac=${encodeURIComponent(query.get("mac"))}&offset=${offset}${query.has("from") ? "&from=" + query.get("from") : ""}${query.has("to") ? "&to=" + query.get("to") : ""}`, {
        headers: { authorization: "Bearer " + localStorage.getItem("_sniff_key") }
    });
    if(f.status !== 200) return alert("Couldn't fetch timeline!");
    const data = await f.json();
    for(const sniff of data) {
        const div = document.createElement("div");
        
        const at = document.createElement("h3");
        at.innerText = "At " + sniff.from_mac;
        div.appendChild(at);

        const rssi = document.createElement("h4");
        rssi.innerText = "RSSI: " + sniff.rssi;
        div.appendChild(rssi);

        const datetime = document.createElement("h4");
        datetime.innerText = "Time: " + new Date(parseInt(sniff.timestamp)).toLocaleString();
        div.appendChild(datetime);

        timeline.appendChild(div);
    }
    if(data.length === 0) document.querySelector("#more").remove();
    else offset += data.length;
};

if(!localStorage.getItem("_sniff_key"))
    alert("Key not set! Authenticate at /auth first");
else (async () => {
    document.querySelector("#more").addEventListener("click", () => pullTimeline());
    await pullTimeline();

    document.querySelector("#from").valueAsNumber = Date.now();
    document.querySelector("#to").valueAsNumber = Date.now();

    document.querySelector("#refresh").addEventListener("click", () => {
        const params = new URLSearchParams(location.search);
        params.set("from", document.querySelector("#from").valueAsNumber);
        params.set("to", document.querySelector("#to").valueAsNumber);
        location.search = "?" + params.toString();
    });
})();