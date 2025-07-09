const delBoard = async (id, el) => {
    if(!confirm("Are you sure?")) return;
    const f = await fetch("/api/boards/" + id + "/delete", {
        headers: { authorization: "Bearer " + localStorage.getItem("_sniff_key") }
    });
    if(f.status !== 200) return alert("Couldn't delete!");
    const j = await f.json();
    await updateTable(j);

    el.remove();
}

const updateTable = boards => {
    const tbody = document.querySelector("tbody");
    for(const el of Array.from(tbody.children))
        el.remove();
    for(const board of boards) {
        const tr = document.createElement("tr");

        const id = document.createElement("td");
        id.innerText = board.id;
        tr.appendChild(id);

        const mac = document.createElement("td");
        mac.innerText = board.mac;
        tr.appendChild(mac);

        const actions = document.createElement("td");

        const del = document.createElement("a");
        del.href = "javascript:void(0)";
        del.innerText = "delete";
        del.addEventListener("click", () => delBoard(board.id, tr));
        actions.appendChild(del);

        actions.append(document.createTextNode(" "));

        const stats = document.createElement("a");
        stats.href = "/board?id=" + board.id;
        stats.innerText = "stats";
        actions.appendChild(stats);

        tr.appendChild(actions);

        tbody.appendChild(tr);
    }
}

if(!localStorage.getItem("_sniff_key"))
    alert("Key not set! Authenticate at /auth first");
else (async () => {
    const f = await fetch("/api/boards", {
        headers: { authorization: "Bearer " + localStorage.getItem("_sniff_key") }
    });
    if(f.status !== 200) return alert("Couldn't get boards!");
    const j = await f.json();

    updateTable(j);

    document.querySelector("#add").addEventListener("click", async () => {
        const mac = document.querySelector("#mac").value;
        const f = await fetch("/api/boards/new", {
            method: "POST",
            headers: {
                "content-type": "application/json",
                authorization: "Bearer " + localStorage.getItem("_sniff_key")
            },
            body: JSON.stringify({ mac })
        });
        if(f.status !== 200) return alert("Couldn't add!");
        updateTable(await f.json());
    });
})();