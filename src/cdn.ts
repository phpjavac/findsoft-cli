import COS from "cos-nodejs-sdk-v5";
import path from "path";
import fs from "fs";
import * as cheerio from "cheerio";
import ProgressBar from "progress";



const lazyLoadJs = /^app.*.js$/
const webpackLazyRouter = "manifest.js"

const replaceHref = (cdn, element: string, file) => {
    element = element.replace(`/${cdn.fileName}/`, "./")
    const uploadFileName = `${cdn.fileName}/${cdn.version}`;
    const filePath = path.resolve(process.cwd(), cdn.fileName);
    // 获取文件名
    const ext = path.basename(file);
    const afterfile = file.replace(ext, '')
    let url = path.resolve(afterfile, element)
    // 取得文件名
    const fileName = path.basename(url);

    if (webpackLazyRouter === fileName) {
        // webpackLazyRouter规则
        let htmlString = fs.readFileSync(url).toString()
        htmlString = htmlString.replace(`n.p="./"`, `n.p="${cdn.domain}/${uploadFileName}/"`).replace(`n.p=""`, `n.p="${cdn.domain}/${uploadFileName}/"`).replace(`n.p="/${cdn.fileName}/"`, `n.p="${cdn.domain}/${uploadFileName}/"`)
        fs.writeFileSync(url, htmlString);

    }
    if (lazyLoadJs.test(fileName)) {
        // app.js规则
        let htmlString = fs.readFileSync(url).toString()
        htmlString = htmlString.replace(`u.p=""`, `u.p="${cdn.domain}/${uploadFileName}/"`).replace(`u.p="/${cdn.fileName}/"`, `u.p="${cdn.domain}/${uploadFileName}/"`)
        fs.writeFileSync(url, htmlString);
    }
    url = `${cdn.domain}/${url.replace(filePath, uploadFileName).replace(/\\/g, '/')}`
    return url;
}

// 设置html
function setHtml(html, path, cdn) {
    //将html字符串转换为jsdom 方便操作
    let $ = cheerio.load(html, { decodeEntities: false })
    $('link').each(function name(i, v) {

        let _href = $(v).attr('href')
        if (!_href) return;
        if (_href.includes(cdn.domain) || _href.includes('//')) {
            return;
        } else {
            let _replaceHref = replaceHref(cdn, _href, path)
            if (_href && _replaceHref) {
                // 替换href
                $(v).attr('href', _replaceHref)
            }
        }

    })
    $('script').each(function name(i, v) {

        let _src = $(v).attr('src')
        if (!_src) return;
        if (_src.includes(cdn.domain)) {
            return;
        } else {
            let _replaceHref = replaceHref(cdn, _src, path)
            if (_src && _replaceHref) {
                // 替换src
                $(v).attr('src', _replaceHref)
            }
        }

    })
    fs.writeFile(path, $.html(), 'utf-8', function (error) {
        if (error) {
        } else {
        }
    })
}

/** 判断文件是否排除 */
const isExclude = (file: string, exclude: string | string[]): boolean => {
    if (Array.isArray(exclude)) {
        if (exclude.length === 0) {
            return false;
        }
        for (let index = 0; index < exclude.length; index++) {
            const element = exclude[index];
            // 判断是否为文件夹
            if (element.endsWith("\\")) {
                return file.includes(element);
            }
            return file.endsWith(element);
        }
    } else {
        // 判断是否为文件夹
        if (exclude.endsWith("\\")) {
            return file.includes(exclude);
        }
        return file.endsWith(exclude);
    }
}

/** 判断文件是否包含 */
const isInclude = (file: string, include: string | string[]): boolean => {
    if (Array.isArray(include)) {
        for (let index = 0; index < include.length; index++) {
            const element = include[index];
            // 判断是否为文件夹
            if (element.endsWith("\\")) {
                return file.includes(element);
            }
            return file.endsWith(element);
        }
    } else {
        // 判断是否为文件夹
        if (include.endsWith("\\")) {
            return file.includes(include);
        }
        return file.endsWith(include);
    }
}

/**
 * 文件遍历方法
 * @param filePath 需要遍历的文件路径
 * @param exclude 排除的文件
 * @param includes 包含的文件 优先级比排除的文件高
 * @returns {string[]}
 */
const fileDisplay = (filePath, exclude: string | string[] = [], includes?: string | string[]): string[] => {
    let files = [];
    //根据文件路径读取文件，返回文件列表
    fs.readdirSync(filePath).forEach((filename) => {
        //获取当前文件的绝对路径
        var filedir = path.join(filePath, filename);
        if (fs.statSync(filedir).isDirectory()) {
            files = files.concat(fileDisplay(filedir, exclude, includes))
        } else {
            // 优先判断包含的文件
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
}

const startCDN = async () => {
    fs.readFile(path.resolve(process.cwd(), "findsoft.config.json"), (err, files) => {
        if (err)
            throw err;
        try {
            const { cdn } = JSON.parse(files.toString());
            const uploadFileName = `${cdn.fileName}\\${cdn.version}`;
            const filePath = path.resolve(process.cwd(), cdn.fileName);
            const cos = new COS({
                SecretId: cdn.secretId,
                SecretKey: cdn.secretKey,
            });

            // 开始替换html里的引用文件
            const htmlFiles = fileDisplay(filePath, undefined, ".html");
            for (let index = 0; index < htmlFiles.length; index++) {
                const element = htmlFiles[index];
                const html = fs.readFileSync(element);
                setHtml(html.toString(), element, cdn)
            }
            // 处理webgl相关文件
            let webglFiles = fileDisplay(filePath, undefined, ".json");
            webglFiles = webglFiles.filter((item) => { return item.toLocaleLowerCase().includes('webgl') && item.toLocaleLowerCase().includes('build') });
            if (webglFiles.length > 1) {
                webglFiles.forEach(item => {
                    const webgl = fs.readFileSync(item)
                    const webglJson = JSON.parse(webgl.toString())
                    const ext = path.basename(item);
                    const afterfile = item.replace(ext, '')
                    fs.copyFileSync(path.resolve(__dirname, "static/UnityLoader.js"), `${afterfile}UnityLoader.js`);
                    // unity3D 打包的文件 特殊处理
                    webglJson.dataUrl && (webglJson.dataUrl = replaceHref(cdn, webglJson.dataUrl, item.replace(ext, webglJson.dataUrl)));
                    webglJson.asmCodeUrl && (webglJson.asmCodeUrl = replaceHref(cdn, webglJson.asmCodeUrl, item.replace(ext, webglJson.asmCodeUrl)));
                    webglJson.asmMemoryUrl && (webglJson.asmMemoryUrl = replaceHref(cdn, webglJson.asmMemoryUrl, item.replace(ext, webglJson.asmMemoryUrl)));
                    webglJson.asmFrameworkUrl && (webglJson.asmFrameworkUrl = replaceHref(cdn, webglJson.asmFrameworkUrl, item.replace(ext, webglJson.asmFrameworkUrl)));
                    webglJson.wasmCodeUrl && (webglJson.wasmCodeUrl = replaceHref(cdn, webglJson.wasmCodeUrl, item.replace(ext, webglJson.wasmCodeUrl)));
                    webglJson.wasmFrameworkUrl && (webglJson.wasmFrameworkUrl = replaceHref(cdn, webglJson.wasmFrameworkUrl, item.replace(ext, webglJson.wasmFrameworkUrl)));
                    fs.writeFile(item, JSON.stringify(webglJson), 'utf-8', function (error) {
                        if (error) {
                        } else {
                        }
                    })
                })

            };


            /** 获取储存桶列表 */
            cos.getService({}, (err, data) => {
                console.log("开始上传文件");
                const bucket = data.Buckets.find((item) => { return item.Name === cdn.bucket });

                //调用文件遍历方法
                const files = fileDisplay(filePath, cdn.exclude);
                const bar = new ProgressBar('  uploading [:bar] :rate/bps :percent :etas', {
                    complete: '=',
                    incomplete: ' ',
                    width: 20,
                    total: files.length
                });

                for (let index = 0; index < files.length; index++) {
                    let file = files[index];
                    let filedir = file.replace(filePath, uploadFileName).replace(/\\/g, '/')
                    cos.putObject({
                        Bucket: bucket.Name, /* 填入您自己的存储桶，必须字段 */
                        Region: bucket.Location,  /* 存储桶所在地域，例如ap-beijing，必须字段 */
                        Key: filedir,  /* 存储在桶里的对象键（例如1.jpg，a/b/test.txt），必须字段 */
                        StorageClass: 'STANDARD',
                        /* 当Body为stream类型时，ContentLength必传，否则onProgress不能返回正确的进度信息 */
                        Body: fs.createReadStream(file), // 上传文件对象
                        ContentLength: fs.statSync(file).size,
                        // onProgress: function(progressData) {
                        //     console.log(JSON.stringify(progressData));
                        // }
                    }, (err, data) => {
                        bar.tick(1, 1);
                    });

                }

            });

        } catch (error) {
            console.error(error);

            throw err;

        }
    })
}

export default startCDN;