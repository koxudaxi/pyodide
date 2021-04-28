importScripts("./comlink/umd/comlink.js");
async function hello(){
    console.log(await self.main_window.ttt);
}

async function test(){
    let resp = await self.main_window.fetch("index.html");
    console.log("resp", resp);
    let value = await resp.text();
    console.log("value", value);
    return value;
}

function test2(){
    let resp = self.main_window.fetch("index.html").syncify();
    console.log("resp", resp);
    let value = resp.text().syncify();
    console.log("value", value);
    return value;
}

function test3(){
    return self.main_window.myfetch("index.html").syncify();
}


function set_global_scope(window){
    self.main_window = window;
}

Comlink.expose({hello, set_global_scope, test, test2, test3});
