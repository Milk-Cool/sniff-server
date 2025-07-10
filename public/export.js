if(!localStorage.getItem("_sniff_key"))
    alert("Key not set! Authenticate at /auth first");
else (async () => {
    const params = new URLSearchParams(location.search);
    const f = await fetch(`/api/export/count?from=${encodeURIComponent(params.get("from"))}&to=${encodeURIComponent(params.get("to"))}`, {
        headers: {
            authorization: "Bearer " + localStorage.getItem("_sniff_key")
        }
    });
    if(f.status !== 200) return alert("Couldn't fetch count!");
    const t = await f.text();
    document.querySelector("#records").innerText = t;

    document.querySelector("#from").valueAsNumber = Date.now();
    document.querySelector("#to").valueAsNumber = Date.now();
    
    document.querySelector("#refresh").addEventListener("click", () => {
        const params = new URLSearchParams(location.search);
        params.set("from", document.querySelector("#from").valueAsNumber);
        params.set("to", document.querySelector("#to").valueAsNumber);
        location.search = "?" + params.toString();
    });

    document.querySelector("#export").addEventListener("click", async () => {
        const f = await fetch(`/api/export?from=${encodeURIComponent(params.get("from"))}&to=${encodeURIComponent(params.get("to"))}`, {
            headers: {
                authorization: "Bearer " + localStorage.getItem("_sniff_key")
            }
        });
        if(f.status !== 200) return alert("Couldn't export!");
        const blob = await f.blob();
        const file = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = file;
        a.download = "sniff.json";
        a.style.display = "none";
        document.body.appendChild(a);
        a.click();
        a.remove();

        setTimeout(() => URL.revokeObjectURL(file), 1000);
    });
})();