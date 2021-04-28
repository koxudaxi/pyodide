importScripts("./comlink/dist/umd/comlink.js");
importScripts("./pyodide/pyodide.js");


let loaded = (async () => {
    await loadPyodide({indexURL : "./pyodide/"});
    pyodide._module.registerComlink(Comlink);
})();

async function runPythonAsync(src){
    await loaded;
    return await pyodide.runPythonAsync(src);
}


function set_main_window(window){
    self.main_globals = window;
    self.main_window = window;
}

Comlink.expose(self);
