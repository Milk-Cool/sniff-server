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
})();