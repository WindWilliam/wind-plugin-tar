/*
 * @Author: zf
 * @Date: 2024-08-25 14:42:17
 * @Description:
 */

import { execCommand, existsPath, getFileName, getShellName, removePath, setColor } from './util'
import type { Plugin, ResolvedConfig } from 'vite'

interface BundlerConfig {
  /*
   * 插件环境，默认为vite
   */
  bundler: string
}
type CommandContent = string | string[]
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
interface TarConfig extends BaseConfig {
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
type TarOptions = Partial<TarConfig & BundlerConfig>
type CommandOptions = CommandConfig & Partial<BundlerConfig>
type PluginOptions = TarOptions | CommandOptions

/* 默认值 */
const defaultTar: TarConfig = {
  disable: false,
  dir: '',
  name: '{name}{stamp}{project}v{version}{mode}.tar.gz',
  mode: undefined,
  shell: undefined,
}

/* 打包压缩 */
const tarPipe = async (config: TarConfig) => {
  const { dir, shell } = config
  // 1. 文件夹是否存在
  const exist = existsPath(dir!)
  if (!exist) {
    console.error(`${dir}文件夹不存在，跳过压缩！`)
    return
  }
  // 2 结果文件名称
  const fileName = getFileName(config.name!, config.mode)
  removePath(fileName)
  // 3. 打包压缩文件
  process.stdout.write(setColor(`打包压缩： ${new Date().toLocaleString()}`))
  const cmd = `tar -czf ${fileName} ${dir}`
  const [error] = await execCommand(cmd, { shell })
  if (error) {
    process.stdout.write(setColor(`\n打包压缩失败： ${error.message.toString()}\n`, 'red'))
    return
  } else {
    process.stdout.write(setColor(`  --  ${new Date().toLocaleString()}\n`))
    // 4. 解压命令
    const cmdx = setColor(` tar -xzf ${fileName} -C . --strip-components=0 `, 'magenta')
    const msg = setColor(['解压命令：', cmdx, '\n'], 'green')
    process.stdout.write(msg)
  }
}
/* 执行命令 */
const commandPipe = async (command: CommandContent, shell?: string) => {
  if (!Array.isArray(command)) {
    command = [command]
  }
  for (let idx = 0; idx < command.length; idx++) {
    const cmd = command[idx]
    const msg = setColor([
      `执行命令${idx + 1}：`,
      setColor(cmd, 'magenta'),
      new Date().toLocaleString(),
    ])
    process.stdout.write(`\r${msg}`)
    const [error] = await execCommand(cmd, { shell })
    process.stdout.write(setColor(`${new Date().toLocaleString()}\n`))
    if (error) {
      process.stdout.write(setColor(`\n失败：${error.message.toString()}\n`, 'red'))
      return
    }
  }
}

/* 获取打包压缩配置 */
const getTarConfig = (kv: Record<string, string>, options?: TarOptions): TarConfig => {
  const tarConfig = { ...defaultTar }
  for (const key in tarConfig) {
    const value = options?.[key] ?? kv[key]
    if (value !== undefined) {
      tarConfig[key] = value
    }
  }

  return tarConfig
}

export const tarInVite = (options?: PluginOptions): Plugin => {
  let kv: Record<string, any> = {}

  return {
    name: 'vite-plugin-tar',
    apply: 'build',
    async configResolved(config: ResolvedConfig) {
      kv.mode = config.mode
      kv.dir = config.build.outDir
      // 确定shell环境
      kv.shell = await getShellName(config.env.VITE_TAR_SHELL)
    },
    async closeBundle() {
      process.stdout.write('\n')
      // preCommand

      const command = (options as CommandOptions)?.command
      // 确定类型
      if (command === undefined) {
        // 解析环境参数
        const cfg = getTarConfig(kv, options)
        await tarPipe(cfg)
      } else {
        await commandPipe(command, kv.shell)
      }

      // postCommand
    },
  }
}

function tarInWebpack(options?: PluginOptions) {
  // TODO
  return {
    name: 'vite-plugin-tar',
    apply: 'build',
  }
}

/* 根据编译环境获取打包插件 */
function getPluginByBundler(bundler?: string, options?: PluginOptions) {
  switch (bundler) {
    case 'webpack':
    // return tarInWebpack(options)
    case 'vite':
      return tarInVite(options)
    default:
      process.stdout.write(setColor(`不支持的类型: ${bundler} !\n`, 'red'))
      return
  }
}

/* 导出插件 */
export default function tar(options?: PluginOptions): any {
  const bundler = options?.bundler ?? 'vite'
  return getPluginByBundler(bundler, options)
}
