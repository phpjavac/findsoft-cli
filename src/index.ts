#!/usr/bin/env node

import cdn from "./cdn";

const type = process.argv[2];

switch (type) {
    case "cdn":
        cdn();
        break;
    case "-v":
    case "--version":
        console.log(require("../package.json").version);
        break;
    case "?":
    case "--help":
    case "-h":
        console.log(`
    Usage:
        cdn [type] [options]
    Options:
        -v, --version    output the version number
        -h, --help       output usage information
        ?                output usage information
    Type:   
        cdn             cdn
    `);
    default:
        console.log(`
    Usage:
        cdn [type] [options]
    Options:
        -v, --version    output the version number
        -h, --help       output usage information
        ?                output usage information
    Type:   
        cdn             cdn
    `); break;
}

export default cdn;