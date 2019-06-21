function foo(a, b, callback){
    let x = a + b;
    callback(x)
}

foo(5, 5, (result)=>{
    return console.log(result)
})
