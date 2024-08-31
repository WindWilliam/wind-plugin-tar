# vite-plugin-tar
Tar the result files after building.   
编译完成后自动进行tar打包压缩，最终得到xxx.tar.gz文件。

## Introduction 原理说明 
通过调用shell命令 `tar -czf xxx.tar.gz dist`，将编译后的**dist**文件打包成**xxx.tar.gz**文件。

## Install 安装

```bash
# pnpm
pnpm add vite-plugin-tar -D

# yarn
yarn add vite-plugin-tar -D

# npm
npm install vite-plugin-tar -D
```

## Options 配置
| Parameter 参数  | Types  类型               | Default 默认值                    | Description  描述说明
| ---------- | --------------------- | --------------------------- | ------------
|dir         | String                | get from the vite config<br/>自动从vite中获取输出目录配置 | directory to tar<br/>打包压缩目录
|name        | Stirng                | {name}{stamp}{project}v{version}{mode}.tar.gz | name of output file<br/>打包压缩文件名<br/><br/>**name**是从package.json中获取的名称<br/>**stamp**是时间戳，为yyyyMMddHH格式<br/>**project**是从package.json里对应字段获取的相关项目信息，没有则为空<br/>**version**是从package.json中获取的版本号<br/>**mode**是打包模式，默认从vite中获取，可通过设置mode参数覆盖
|mode        | Stirng                | get from the vite config<br/>自动从vite中获取打包模式 | build mode<br/>编译模式
|shell       | Stirng                | set `VITE_TAR_SHELL` in .env file<br/>建议通过.env文件配置shell环境 | the shell to use for the tar command<br/>tar命令运行的shell环境<br/>windows系统将自动使用`pwsh`或者`powershell`，其他系统为nodejs默认设置<br/>建议通过`.env`文件配置shell环境<br/>vite中的环境变量名称为`VITE_TAR_SHELL`


## Usage 使用
``` ts
// vite-config
import { defineConfig } from 'vite'
import { tarInVite } from "vite-plugin-tar"; // import tar from "vite-plugin-tar";

export default defineConfig({
  plugins: [
    tarInVite() // use default options 使用默认配置
  ]
})
```
当项目成功编译后可见如下输出日志：   
+ 打包压缩： tar -czf vt2024083115v0.0.0production.tar.gz dist   
+ 开始时间： 2024/8/31 15:24:11 -- 结束时间： 2024/8/31 15:24:11   
+ 解压命令： tar -xzf vt2024083115v0.0.0production.tar.gz -C . --strip-components=0 
  ```bash
  # 解压命令小技巧：
  tar -xzf xxx.tar.gz -C . --strip-components=0
  # -C表示解压目录，其中的"."表示当前目录
  # --strip-components表示解压后提取的tar包的目录层级，=1可以忽略根目录（如dist目录），直接得到其子文件夹和文件
  ```

## TODO 待办
- [ ] 支持其他打包工具
  - [ ] webpack
  - [ ] rollup
  - [ ] esbuild
- [ ] 增加前置/后置命令

## Support 支持
- [x] 支持vite打包工具
- [x] 支持自定义打包模式
