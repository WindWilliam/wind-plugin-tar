/*
 * @Author: zf
 * @Date: 2024-09-01 14:18:44
 * @Description: 类型定义文件
 */

interface BundlerConfig {
  /*
   * 插件环境，默认为vite
   */
  bundler: string
}
export type CommandContent = string | string[]
/* 基础配置 */
interface BaseConfig {
  /*
   * 是否禁用插件--TODO 是否有必要？
   */
  disable?: boolean
  /*
   * 命令执行环境
   * windows平台，默认使用powershell
   * 其他平台，默认使用系统默认shell
   * 只可通过环境变量VITE_TAR_SHELL指定
   */
  shell?: string

  /*
   * TODO 打包压缩的额外命令
   * 打包压缩的前置命令
   */
  preCommand?: CommandContent

  /*
   * TODO 打包压缩的额外命令
   * 打包压缩的后置命令
   */
  postCommand?: CommandContent
}
/* 命令配置 */
interface CommandConfig extends BaseConfig {
  /*
   * 待执行命令
   */
  command: CommandContent
}
/* 打包压缩配置 */
export interface TarConfig extends BaseConfig {
  [key: string]: any // 添加字符串索引签名
  /*
   * 待打包压缩目录，默认从process中获取
   */
  dir: string
  /*
   * 打包压缩后的文件名称，默认为{name}{stamp}{project}v{version}{mode}.tar.gz
   * 支持变量：{name} - 系统名称
   *          {stamp} - 时间戳，格式为yyyyMMDDHH
   *          {project} - 项目信息，需要在package.json中配置
   *          {mode} - 编译模式
   *          {version} - 项目版本
   * 可以自定义字符串模板
   * 名称里支持相对路径，可直接指定文件最终位置
   */
  name: string
  /*
   * 编译模式，默认从process中获取
   */
  mode?: string
}
/* 插件参数选项 */
export type TarOptions = Partial<TarConfig & BundlerConfig>
export type CommandOptions = CommandConfig & Partial<BundlerConfig>
export type PluginOptions = TarOptions | CommandOptions

/* 编译配置 */
export type InfoFromBundler = {
  [key: string]: any // 添加字符串索引签名
  /*
   * 模式
   */
  mode?: string
  /*
   * 输出文件夹
   */
  dir: string
  /*
   * 命令执行环境
   */
  shell?: string
}
