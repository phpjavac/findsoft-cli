#!/usr/bin/env node

import cdn from "./cdn";
import newConfig from "./config";

const type = process.argv[2];

switch (type) {
    case "cdn":
        cdn();
        break;
    case "new":
        newConfig();
        break;
    case "-v":
    case "--version":
        console.log(require("../package.json").version);
        break;
    case "?":
    case "--help":
    case "-h":

    default:
        console.log(`
    Usage:
        findsoft-cli [type]
    Type:   
        cdn              执行cdn工作流   
        new              生成新的配置文件
        -v, --version    output the version number
    `);
        break;
}

export default cdn;