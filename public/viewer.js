const updateSelect = boards => {
    const select = document.querySelector("select");
    for(const board of boards) {
        const option = document.createElement("option");

        option.value = board.mac;
        option.innerText = board.mac + (board.name ? " | " + board.name : "");

        select.appendChild(option);
    }
};

const updateTable = results => {
    const tbody = document.querySelector("tbody");
    for(const el of Array.from(tbody.children))
        el.remove();
    for(const result of results) {
        const tr = document.createElement("tr");

        const mac = document.createElement("td");
        mac.innerText = result.mac;
        tr.appendChild(mac);

        const spotted = document.createElement("td");
        spotted.innerText = result.spotted;
        tr.appendChild(spotted);

        const detailsTD = document.createElement("td");

        const detailsLink = document.createElement("a");
        detailsLink.href = "/details?mac=" + result.mac;
        detailsLink.innerText = "view";
        detailsTD.appendChild(detailsLink);

        tr.appendChild(detailsTD);

        tbody.appendChild(tr);
    }
};

if(!localStorage.getItem("_sniff_key"))
    alert("Key not set! Authenticate at /auth first");
else (async () => {
    const f = await fetch("/api/boards", {
        headers: { authorization: "Bearer " + localStorage.getItem("_sniff_key") }
    });
    if(f.status !== 200) return alert("Couldn't get boards!");
    const j = await f.json();

    document.querySelector("#from").valueAsNumber = Date.now();
    document.querySelector("#to").valueAsNumber = Date.now();

    updateSelect(j);

    document.querySelector("#search").addEventListener("click", async () => {
        const from = document.querySelector("#from").valueAsNumber;
        const to = document.querySelector("#to").valueAsNumber;
        if(Number.isNaN(from) || Number.isNaN(to))
            return alert("Invalid dates!");
        const at = document.querySelector("#at").value;
        
        const f = await fetch("/api/search?" + new URLSearchParams({
            from, to, at
        }), {
            headers: { authorization: "Bearer " + localStorage.getItem("_sniff_key") }
        });
        if(f.status !== 200) return alert("Couldn't perform search!");
        const j = await f.json();
        updateTable(j);
    });
})();