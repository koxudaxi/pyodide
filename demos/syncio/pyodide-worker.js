importScripts("./comlink/dist/umd/comlink.js");
let indexURL = "./pyodide/pyodide.js";
importScripts(indexURL);
let pyodideLoaded = loadPyodide({ indexURL });
let fetchPythonCode = fetch("code.py");

function sleep(t){
    return new Promise(resolve => setTimeout(resolve, t));
}

function promiseHandles(){
    let result;
    let promise = new Promise((resolve, reject) => {
        result = {resolve, reject};
    });
    result.promise = promise;
    return result;
}


// Comlink proxy and PyProxy don't get along as of yet so need a wrapper
function complete(value){
    let proxy = pycomplete(value);
    let result = proxy.toJs();
    proxy.destroy();
    return result;
}


Comlink.transferHandlers.set("EVENT", {
    canHandle: (obj) => obj instanceof Event,
    serialize: (ev) => {
      return [
        {
          target: {
            id: ev.target.id,
            classList: [...ev.target.classList],
            clientX: ev.clientX, clientY : ev.clientY,
          },
        },
        [],
      ];
    },
    deserialize: (obj) => obj,
});

class InnerExecution {
    constructor(code){
        this._code = code;
        this._interrupt_buffer = new Int32Array(new SharedArrayBuffer(4));
        this._validate_syntax = promiseHandles();
        this._result = promiseHandles();
        this._result.promise.finally(() => {
            for(let proxy of this.proxies){
                proxy[Comlink.releaseProxy]();
            }
        });
        this.proxies = [];
        this._stdin_callback = () => {throw new Error("No stdin callback registered!");};
        this._stdout_callback = () => {};
        this._stderr_callback = () => {};
    }

    interrupt_buffer(){
        return Comlink.transfer(this._interrupt_buffer);
    }

    start(){
        this._start_inner().then(this._result.resolve, this._result.reject);
    }

    async _start_inner(){
        pyodide.setInterruptBuffer(this._interrupt_buffer);
        try {
            return await exec_code(
                this._code,
                this._validate_syntax.resolve,
                this._stdin_callback,
                this._stdout_callback,
                this._stderr_callback
            );
        } catch(e){
            let err = new Error(format_last_exception());
            this._validate_syntax.reject(err);
            throw err;
        } finally {
            pyodide.setInterruptBuffer();
        }
    }

    async validate_syntax(){
        return await this._validate_syntax.promise;
    }

    async result(){
        return await this._result.promise;
    }

    async setStdin(outer_stdin_reader){
        // this.proxies.push(outer_stdin_reader);
        // this._stdin_callback = outerWrap(outer_stdin_reader);
    }

    onStdout(callback){
        this.proxies.push(callback);
        this._stdout_callback = (msg) => callback(msg).schedule_async();
    }

    onStderr(callback){
        this.proxies.push(callback);
        this._stderr_callback = (msg) => callback(msg).schedule_async();
    }
}


let async_wrappers = {};
async function init(windowProxy){
    await pyodideLoaded;
    let http_client = await fetch("./http_client.py");
    pyodide._module.FS.unlink("/lib/python3.8/site-packages/pyodide/http_client.py");
    pyodide._module.FS.writeFile("/lib/python3.8/site-packages/pyodide/http_client.py", new Uint8Array(await http_client.arrayBuffer()));
    pyodide._module.registerComlink(Comlink);
    self.windowProxy = windowProxy;
    self.main_globals = windowProxy;
    self.main_window = windowProxy;

    let mainPythonCode = await (await fetchPythonCode).text();
    let namespace = pyodide.pyimport("dict")();
    pyodide.pyodide_py.eval_code(mainPythonCode, namespace);
    for(let name of ["exec_code", "format_last_exception", "banner", "pycomplete"]){
        self[name] = namespace.get(name);
    }
    namespace.destroy();

    return Comlink.proxy({
        InnerExecution,
        pyodide,
        banner,
        complete,
    });
}

Comlink.expose(init);
