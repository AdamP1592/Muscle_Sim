import fs from "fs";
import path from "path";

const { createServer } = require('node:https');
const hostName = '127.0.0.1';
const port = 5252;
const server = createServer( (req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', "HTML");
    res.end("Hello World");
});


function route(page){
    var endpoints = {
        "/home":
    }

}

function getPage(pageName){
    if(pageName === "/home"){
        
    }
}
