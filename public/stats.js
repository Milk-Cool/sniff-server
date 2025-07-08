import { Chart, LineController, CategoryScale, LinearScale, PointElement, LineElement } from "https://cdn.jsdelivr.net/npm/chart.js@4.5.0/+esm";
Chart.register(LineController, CategoryScale, LinearScale, PointElement, LineElement);

if(!localStorage.getItem("_sniff_key"))
    alert("Key not set! Authenticate at /auth first");
else (async () => {
    const range = new URLSearchParams(location.search).get("range");

    const f = await fetch(`/api/stats${range === null ? "" : "?range=" + range}`, {
        headers: {
            authorization: "Bearer " + localStorage.getItem("_sniff_key")
        }
    });
    if(f.status !== 200) return alert("Couldn't fetch stats!");
    const j = await f.json();
    document.querySelector("#cnt").innerText = j.cnt;
    document.querySelector("#cntFrom").innerText = j.cntFrom;
    document.querySelector("#cntMac").innerText = j.cntMac;

    const f2 = await fetch(`api/stats/chart${range === null ? "" : "?range=" + range}`, {
        headers: {
            authorization: "Bearer " + localStorage.getItem("_sniff_key")
        }
    });
    if(f2.status !== 200) return alert("Couldn't fetch charts!");
    const j2 = await f2.json();
    new Chart(document.querySelector("#chart"), {
        type: "line",
        data: {
            labels: j2.map(x => new Date(x.timestamp).toLocaleString()),
            datasets: [
                { label: "Total", data: j2.map(x => x.cnt), borderColor: "red", tension: .1 },
                { label: "Unique MACs", data: j2.map(x => x.cntMac), borderColor: "gold", tension: .1 }
            ]
        }
    });
})();