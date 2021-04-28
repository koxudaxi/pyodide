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

if(false){
    export { sleep };
}
