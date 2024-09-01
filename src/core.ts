/*
 * @Author: zf
 * @Date: 2024-09-01 14:16:27
 * @Description: 核心入口
 */

import type {
  CommandContent,
  CommandOptions,
  InfoFromBundler,
  PluginOptions,
  TarConfig,
  TarOptions,
} from './types'

import { execCommand, existsPath, genTarCommand, getFileName, removePath, setColor } from './util'

/* 默认值 */
const defaultTar: TarConfig = {
  disable: false,
  dir: '',
  name: '{name}{stamp}{project}v{version}{mode}.tar.gz',
  mode: undefined,
  shell: undefined,
}

/* 默认信息 */
export const dftInfo: InfoFromBundler = {
  dir: '.',
  shell: undefined,
  mode: undefined,
}

/* 打包压缩 */
export const tarPipe = async (config: TarConfig) => {
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
  const cmd = genTarCommand(dir, fileName)
  process.stdout.write(setColor(['打包压缩： ', setColor(cmd, 'magenta'), ' \n'], 'green'))
  process.stdout.write(setColor(`开始时间： ${new Date().toLocaleString()}`))
  const [error] = await execCommand(cmd, { shell })
  if (error) {
    process.stdout.write(setColor(`\n打包压缩失败： ${error.message.toString()}\n`, 'red'))
    return
  } else {
    process.stdout.write(setColor(`  结束时间： ${new Date().toLocaleString()}\n`))
    // 4. 解压命令
    const cmdx = setColor(` tar -xzf ${fileName} -C . --strip-components=0 `, 'magenta')
    const msg = setColor(['解压命令：', cmdx, '\n'], 'green')
    process.stdout.write(msg)
  }
}
/* 执行命令 */
export const commandPipe = async (command: CommandContent, shell?: string) => {
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
export const getTarConfig = (info: InfoFromBundler, options?: TarOptions): TarConfig => {
  const tarConfig = { ...defaultTar }
  for (const key in tarConfig) {
    const value = options?.[key] ?? info[key]
    if (value !== undefined) {
      tarConfig[key] = value
    }
  }

  return tarConfig
}

/* 执行打包压缩 */
export const execTar = async (info: InfoFromBundler, options?: PluginOptions) => {
  try {
    process.stdout.write('\n')
    // preCommand

    const command = (options as CommandOptions)?.command
    // 确定类型
    if (command === undefined) {
      // 解析环境参数
      const cfg = getTarConfig(info, options)
      await tarPipe(cfg)
    } else {
      await commandPipe(command, info.shell)
    }

    // postCommand
    process.stdout.write('\n')
  } catch (error) {
    console.error(error)
  }
}
