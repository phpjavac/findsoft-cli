#!/usr/bin/env node
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target, mod));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// package.json
var require_package = __commonJS({
  "package.json"(exports, module2) {
    module2.exports = {
      name: "@findsoft/findsoft-cli",
      version: "0.5.0",
      description: "",
      bin: {
        "findsoft-cli": "dist/findsoft-cli.js"
      },
      scripts: {
        build: "esbuild ./src/index.ts --bundle --platform=node --external:./node_modules/* --outfile=./dist/findsoft-cli.js",
        test: "jest"
      },
      author: "",
      license: "ISC",
      dependencies: {
        cheerio: "^1.0.0-rc.10",
        "cos-nodejs-sdk-v5": "^2.11.6",
        esbuild: "^0.14.36",
        progress: "^2.0.3",
        useref: "^1.4.4"
      },
      devDependencies: {
        babel: "^6.23.0",
        "@babel/preset-env": "^7.16.11",
        "@types/node": "^17.0.30",
        jest: "^28.0.2",
        "@babel/preset-typescript": "^7.16.7",
        "@types/jest": "^27.4.1",
        "ts-jest": "^27.1.4"
      }
    };
  }
});

// src/index.ts
var src_exports = {};
__export(src_exports, {
  default: () => src_default
});
module.exports = __toCommonJS(src_exports);

// src/cdn.ts
var import_cos_nodejs_sdk_v5 = __toESM(require("../node_modules/cos-nodejs-sdk-v5/index.js"));
var import_path = __toESM(require("path"));
var import_fs = __toESM(require("fs"));
var cheerio = __toESM(require("../node_modules/cheerio/lib/index.js"));
var import_progress = __toESM(require("../node_modules/progress/index.js"));
var lazyLoadJs = /^app.*.js$/;
var webpackLazyRouter = "manifest.js";
var os = process.platform === "win32" ? "win" : "mac";
var replaceHref = (cdn, element, file) => {
  element = element.replace(`/${cdn.fileName}/`, "./");
  const uploadFileName = `${cdn.fileName}/${cdn.version}`;
  const filePath = import_path.default.resolve(process.cwd(), cdn.fileName);
  const ext = import_path.default.basename(file);
  const afterfile = file.replace(ext, "");
  let url = import_path.default.resolve(afterfile, element);
  const fileName = import_path.default.basename(url);
  if (webpackLazyRouter === fileName) {
    let htmlString = import_fs.default.readFileSync(url).toString();
    htmlString = htmlString.replace(`n.p="./"`, `n.p="${cdn.domain}/${uploadFileName}/"`).replace(`n.p=""`, `n.p="${cdn.domain}/${uploadFileName}/"`).replace(`n.p="/${cdn.fileName}/"`, `n.p="${cdn.domain}/${uploadFileName}/"`);
    import_fs.default.writeFileSync(url, htmlString);
  }
  if (lazyLoadJs.test(fileName)) {
    let htmlString = import_fs.default.readFileSync(url).toString();
    htmlString = htmlString.replace(`u.p=""`, `u.p="${cdn.domain}/${uploadFileName}/"`).replace(`u.p="/${cdn.fileName}/"`, `u.p="${cdn.domain}/${uploadFileName}/"`);
    import_fs.default.writeFileSync(url, htmlString);
  }
  url = `${cdn.domain}/${url.replace(filePath, uploadFileName).replace(/\\/g, "/")}`;
  return url;
};
function setHtml(html, path3, cdn) {
  let $ = cheerio.load(html, { decodeEntities: false });
  $("link").each(function name(i, v) {
    let _href = $(v).attr("href");
    if (!_href)
      return;
    if (_href.includes(cdn.domain) || _href.includes("//")) {
      return;
    } else {
      let _replaceHref = replaceHref(cdn, _href, path3);
      if (_href && _replaceHref) {
        $(v).attr("href", _replaceHref);
      }
    }
  });
  $("script").each(function name(i, v) {
    let _src = $(v).attr("src");
    if (!_src)
      return;
    if (_src.includes(cdn.domain)) {
      return;
    } else {
      let _replaceHref = replaceHref(cdn, _src, path3);
      if (_src && _replaceHref) {
        $(v).attr("src", _replaceHref);
      }
    }
  });
  import_fs.default.writeFile(path3, $.html(), "utf-8", function(error) {
    if (error) {
    } else {
    }
  });
}
var isExclude = (file, exclude) => {
  if (Array.isArray(exclude)) {
    if (exclude.length === 0) {
      return false;
    }
    let tag = false;
    for (let index = 0; index < exclude.length; index++) {
      const element = exclude[index];
      if (os === "win") {
        if (element.endsWith("\\")) {
          if (file.includes(element)) {
            tag = true;
          }
          ;
        } else if (file.endsWith(element)) {
          tag = true;
        }
        ;
      } else {
        if (element.endsWith("/")) {
          if (file.includes(element)) {
            tag = true;
          }
          ;
        } else if (file.endsWith(element)) {
          tag = true;
        }
        ;
      }
    }
    return tag;
  } else {
    if (os === "win") {
      if (exclude.endsWith("\\")) {
        return file.includes(exclude);
      }
      return file.endsWith(exclude);
    } else {
      if (exclude.endsWith("/")) {
        return file.includes(exclude);
      }
      return file.endsWith(exclude);
    }
  }
};
var isInclude = (file, include) => {
  if (Array.isArray(include)) {
    let tag = false;
    for (let index = 0; index < include.length; index++) {
      const element = include[index];
      if (os === "win") {
        if (element.endsWith("\\")) {
          if (file.includes(element)) {
            tag = true;
          }
          ;
        } else if (file.endsWith(element)) {
          tag = true;
        }
        ;
      } else {
        if (element.endsWith("/")) {
          if (file.includes(element)) {
            tag = true;
          }
          ;
        } else if (file.endsWith(element)) {
          tag = true;
        }
        ;
      }
    }
    return tag;
  } else {
    if (os === "win") {
      if (include.endsWith("\\")) {
        return file.includes(include);
      }
      return file.endsWith(include);
    } else {
      if (include.endsWith("/")) {
        return file.includes(include);
      }
      return file.endsWith(include);
    }
  }
};
var fileDisplay = (filePath, exclude = [], includes) => {
  let files = [];
  import_fs.default.readdirSync(filePath).forEach((filename) => {
    var filedir = import_path.default.join(filePath, filename);
    if (import_fs.default.statSync(filedir).isDirectory()) {
      files = files.concat(fileDisplay(filedir, exclude, includes));
    } else {
      if (includes) {
        if (isInclude(filedir, includes)) {
          files.push(filedir);
        }
        return;
      }
      if (!isExclude(filedir, exclude)) {
        files.push(filedir);
      }
    }
  });
  return files;
};
var startCDN = async () => {
  import_fs.default.readFile(import_path.default.resolve(process.cwd(), "findsoft.config.json"), (err, files) => {
    if (err)
      throw err;
    try {
      const { cdn } = JSON.parse(files.toString());
      if (os === "mac") {
        cdn.fileName = cdn.fileName.replace(/\\/g, "/");
      }
      const uploadFileName = `${cdn.fileName}\\${cdn.version}`;
      const filePath = import_path.default.resolve(process.cwd(), cdn.fileName);
      const cos = new import_cos_nodejs_sdk_v5.default({
        SecretId: cdn.secretId,
        SecretKey: cdn.secretKey
      });
      const htmlFiles = fileDisplay(filePath, void 0, ".html");
      for (let index = 0; index < htmlFiles.length; index++) {
        const element = htmlFiles[index];
        const html = import_fs.default.readFileSync(element);
        setHtml(html.toString(), element, cdn);
      }
      let webglFiles = fileDisplay(filePath, void 0, ".json");
      webglFiles = webglFiles.filter((item) => {
        return item.toLocaleLowerCase().includes("webgl") && item.toLocaleLowerCase().includes("build");
      });
      if (webglFiles.length > 1) {
        webglFiles.forEach((item) => {
          const webgl = import_fs.default.readFileSync(item);
          const webglJson = JSON.parse(webgl.toString());
          const ext = import_path.default.basename(item);
          const afterfile = item.replace(ext, "");
          import_fs.default.copyFileSync(import_path.default.resolve(__dirname, "static/UnityLoader.js"), `${afterfile}UnityLoader.js`);
          webglJson.dataUrl && (webglJson.dataUrl = replaceHref(cdn, webglJson.dataUrl, item.replace(ext, webglJson.dataUrl)));
          webglJson.asmCodeUrl && (webglJson.asmCodeUrl = replaceHref(cdn, webglJson.asmCodeUrl, item.replace(ext, webglJson.asmCodeUrl)));
          webglJson.asmMemoryUrl && (webglJson.asmMemoryUrl = replaceHref(cdn, webglJson.asmMemoryUrl, item.replace(ext, webglJson.asmMemoryUrl)));
          webglJson.asmFrameworkUrl && (webglJson.asmFrameworkUrl = replaceHref(cdn, webglJson.asmFrameworkUrl, item.replace(ext, webglJson.asmFrameworkUrl)));
          webglJson.wasmCodeUrl && (webglJson.wasmCodeUrl = replaceHref(cdn, webglJson.wasmCodeUrl, item.replace(ext, webglJson.wasmCodeUrl)));
          webglJson.wasmFrameworkUrl && (webglJson.wasmFrameworkUrl = replaceHref(cdn, webglJson.wasmFrameworkUrl, item.replace(ext, webglJson.wasmFrameworkUrl)));
          import_fs.default.writeFile(item, JSON.stringify(webglJson), "utf-8", function(error) {
            if (error) {
            } else {
            }
          });
        });
      }
      ;
      cos.getService({}, (err2, data) => {
        console.log("\u5F00\u59CB\u4E0A\u4F20\u6587\u4EF6");
        const bucket = data.Buckets.find((item) => {
          return item.Name === cdn.bucket;
        });
        const files2 = fileDisplay(filePath, cdn.exclude);
        const bar = new import_progress.default("  uploading [:bar] :rate/bps :percent :etas", {
          complete: "=",
          incomplete: " ",
          width: 20,
          total: files2.length
        });
        for (let index = 0; index < files2.length; index++) {
          let file = files2[index];
          let filedir = file.replace(filePath, uploadFileName).replace(/\\/g, "/");
          cos.putObject({
            Bucket: bucket.Name,
            Region: bucket.Location,
            Key: filedir,
            StorageClass: "STANDARD",
            Body: import_fs.default.createReadStream(file),
            ContentLength: import_fs.default.statSync(file).size
          }, (err3, data2) => {
            bar.tick(1, 1);
          });
        }
      });
    } catch (error) {
      console.error(error);
      throw err;
    }
  });
};
var cdn_default = startCDN;

// src/config.ts
var import_fs2 = __toESM(require("fs"));
var import_path2 = __toESM(require("path"));
var newConfig = () => {
  import_fs2.default.copyFileSync(import_path2.default.resolve(__dirname, "static/findsoft.config.json"), `${process.cwd()}/findsoft.config.json`);
};
var config_default = newConfig;

// src/index.ts
var type = process.argv[2];
switch (type) {
  case "cdn":
    cdn_default();
    break;
  case "new":
    config_default();
    break;
  case "-v":
  case "--version":
    console.log(require_package().version);
    break;
  case "?":
  case "--help":
  case "-h":
  default:
    console.log(`
    Usage:
        findsoft-cli [type]
    Type:   
        cdn              \u6267\u884Ccdn\u5DE5\u4F5C\u6D41   
        new              \u751F\u6210\u65B0\u7684\u914D\u7F6E\u6587\u4EF6
        -v, --version    output the version number
    `);
    break;
}
var src_default = cdn_default;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {});
