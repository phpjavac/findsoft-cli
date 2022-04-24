# findsoft-cli
> findsoft前端工具库

## 安装

通过 [npm](https://www.npmjs.com/package/@findsoft/findsoft-cli)安装

```
npm install -g @findsoft/findsoft-cli
```


## 用法

`findsoft-cli new`生成一份配置文件，根据项目修改配置文件内容，然后执行对应工作流。
```
findsoft-cli [type]
```
## API

| cdn:          | new:          |
| ----------------- | ----------------- |
| `findsoft-cli cdn` | `findsoft-cli new` |
| 默认上传dist文件夹下所有文件到cdn服务器 | 生成一份默认配置 |


## OPTION
```
{
    "cdn": {                            // 腾讯cos相关配置
        "secretId": "your_secretId",    // cosId
        "secretKey": "your_secretKey",  // coskey
        "bucket": "your_bucket",        // cos桶
        "fileName": "your_fileName",    // 你的项目名称
        "version": "your_version",      // 当前项目版本
        "domain": "your_domain",        // cdn域名
        "exclude":[".html",".DS_Store"] // 需要排除哪些文件 支持文件后缀和文件夹
    }
}
```

## License

Copyright © 2010 - 2022 上海哲寻信息科技有限公司. Licensed under the GPL license.