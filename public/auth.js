document.querySelector("#auth").addEventListener("click", async () => {
    const key = document.querySelector("#key").value;
    if(!key) return alert("Key is empty!");

    const f = await fetch("/api/check", {
        headers: { authorization: "Bearer " + key }
    });
    if(f.status === 200) {
        localStorage.setItem("_sniff_key", key);
        alert("Key updated!");
    } else alert("Key is incorrect!");
});