importScripts("./comlink/umd/comlink.js");
importScripts("./pyodide/pyodide.js");


let loaded = (async () => {
    await loadPyodide({indexURL : "./pyodide/"});
    let http_client = await fetch("./http_client.py");
    pyodide._module.FS.unlink("/lib/python3.8/site-packages/pyodide/http_client.py");
    pyodide._module.FS.writeFile("/lib/python3.8/site-packages/pyodide/http_client.py", new Uint8Array(await http_client.arrayBuffer()));
    pyodide._module.registerComlink(Comlink);
})();


async function runPythonAsync(src){
    await loaded;
    return await pyodide.runPythonAsync(src);
}

function sleep(ms){
    return new Promise(resolve => setTimeout(resolve, ms));
}

function set_proxy(name, obj){
    console.log("setproxy", name, obj);
    self[name] = obj;
}

async function test(){
    let resp = await main_globals.fetch("index.html");
    try {
        return (await resp.text()).slice(0, 10);
    } finally {
        await resp.__destroy();
        console.log(await resp.status);
    }
}

async function test(){
    let resp = await main_globals.fetch("index.html");
    try {
        return (await resp.text()).slice(0, 10);
    } finally {
        await resp.__destroy();
        // console.log(await resp.status);
    }
}

function test2(){
    let resp = main_globals.fetch("index.html").syncify();
    console.log(resp);
    try {
        return resp.text().syncify();
    } finally {
        resp.__destroy().syncify();
    }
}

function loadPackage(){
    importScripts("micropip");
    pyodide.runPython("import micropip");
}

Comlink.expose(self);
