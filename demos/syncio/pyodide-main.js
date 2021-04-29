import * as Comlink from "./comlink/dist/esm/comlink.js";
window.Comlink = Comlink;
let pyodide;
let InnerExecution;
let banner;
let complete;



async function initializePyodide(){
    const worker = new Worker("pyodide-worker.js");
    const wrapper = Comlink.wrap(worker);
    const result = await wrapper(Comlink.proxy(window));
    ({pyodide, InnerExecution, banner, complete} = result);
    wrapper[Comlink.releaseProxy]();
    banner = "Welcome to the Pyodide terminal emulator 🐍\n" + await banner;
    window.pyodide = pyodide;
}
let initialized = initializePyodide();

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


class Execution {
    constructor(code){
        return (async () => {
            await initialized;
            this._inner = await new InnerExecution(code);
            this._result = this._inner.result();
            this._validate_syntax = this._inner.validate_syntax().schedule_async();
            this._interrupt_buffer = await this._inner.interrupt_buffer();
            this._started = false;
            return this;
        })();
    }

    start(){
        this._started = true;
        this._inner.start().schedule_async();
    }

    keyboardInterrupt(){
        this._interrupt_buffer[0] = 2;
    }

    validate_syntax(){
        return this._validate_syntax;
    }

    result(){
        return this._result;
    }

    async onStdin(callback){
        if(this._started){
            throw new Error("Cannot set standard in callback after starting the execution.");
        }
        // await this._inner.setStdin(blockingWrapperForAsync(callback));
    }

    async onStdout(callback){
        if(this._started){
            throw new Error("Cannot set standard out callback after starting the execution.");
        }
        await this._inner.onStdout(Comlink.proxy(callback));
    }

    async onStderr(callback){
        if(this._started){
            throw new Error("Cannot set standard error callback after starting the execution.");
        }
        await this._inner.onStderr(Comlink.proxy(callback));
    }
}
window.Execution = Execution;

export {Execution, pyodide, banner, complete, initializePyodide};
