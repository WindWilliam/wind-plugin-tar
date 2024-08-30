/*
 * @Author: zf
 * @Date: 2024-08-25 15:44:13
 * @Description: 工具函数
 */

import { execSync } from 'node:child_process'
import type { ExecSyncOptions } from 'node:child_process'
import { existsSync, readFileSync, rmSync } from 'node:fs'

// ANSI 转义码，用于设置文本颜色
const colors = {
  reset: '\x1b[0m', // 重置颜色
  bold: '\x1b[1m', // 加粗
  dim: '\x1b[2m', //
  italic: '\x1b[3m', // 斜体
  underline: '\x1b[4m', // 下划线
  inverse: '\x1b[7m', // 反显
  hidden: '\x1b[8m', // 隐藏
  strikethrough: '\x1b[9m', // 删除线
  black: '\x1b[30m', // 黑色
  red: '\x1b[31m', // 红色
  green: '\x1b[32m', // 绿色
  yellow: '\x1b[33m', // 黄色
  blue: '\x1b[34m', // 蓝色
  magenta: '\x1b[35m', // 品红色
  cyan: '\x1b[36m', // 青色
  white: '\x1b[37m', // 白色
  gray: '\x1b[90m', // 灰色
  brightRed: '\x1b[91m', // 亮红色
  brightGreen: '\x1b[92m', // 亮绿色
  brightYellow: '\x1b[93m', // 亮黄色
  brightBlue: '\x1b[94m', // 亮蓝色
  brightMagenta: '\x1b[95m', // 亮品红色
  brightCyan: '\x1b[96m', // 亮青色
  brightWhite: '\x1b[97m', // 亮白色
}

/* 设置颜色 */
export const setColor = (
  strOrArr: string | string[],
  clr: keyof typeof colors = 'cyan'
): string => {
  // 多个颜色
  if (Array.isArray(strOrArr)) {
    let list: string[] = []
    strOrArr.forEach((str) => {
      if (str.startsWith('\x1b')) {
        list.push(str)
      } else {
        list.push(`${colors[clr]}${str}`)
      }
    })
    return list.join('') + colors.reset
  }
  // 部分颜色
  return `${colors[clr]}${strOrArr}${colors.reset}`
}
/* 执行命令 */
export const execCommand = async (
  command: string,
  options?: ExecSyncOptions
): Promise<[undefined, string] | [Error]> => {
  try {
    const result = await execSync(command, options)
    // 子进程inherit，正常时则无返回，异常时会进入catch
    if (result === null) {
      return [undefined, '']
    } else {
      // res 需要用toString()来取
      return [undefined, result.toString()]
    }
  } catch (error: any) {
    return [error]
  }
}

/* 读取json文件 */
export const readJson = (filePath: string) => {
  if (existsSync(filePath)) {
    const content = readFileSync(filePath, 'utf-8')
    try {
      return JSON.parse(content)
    } catch (error) {
      console.error(error)
      return {}
    }
  } else {
    return {}
  }
}

/* 判断文件（夹）是否存在 */
export const existsPath = (path: string) => {
  return existsSync(path)
}

/* 删除文件（夹） */
export const removePath = (path: string) => {
  return rmSync(path, { force: true, recursive: true })
}

/* 获取shell */
export const getShellName = async (shell?: string) => {
  const command = 'echo 233'
  if (!!shell) {
    // 测试可用性
    const [err] = await execCommand(command, { shell, stdio: 'ignore' })
    if (err === undefined) {
      return shell
    } else {
      // 输出信息，shell无效，将使用默认配置
      // console.warn(`shell "${shell}" is invalid, use default shell.`)
      const msg = setColor(
        ['shell配置 ', setColor(shell, 'magenta'), ' 无效，将使用默认配置！\n'],
        'yellow'
      )
      process.stdout.write(msg)
    }
  }
  // win平台特殊处理
  if (process.platform === 'win32') {
    const cmdList = ['powershell', 'pwsh']
    for (const item of cmdList) {
      const [err] = await execCommand(command, { shell: item, stdio: 'ignore' })
      if (err === undefined) {
        return item
      }
    }
    // 输出信息，没有找到有效的shell，tar命令将失败
    // console.error('no valid powershell found, command of tar will fail.')
    const msg = setColor('没有找到有效的shell，tar命令可能会失败！\n', 'red')
    process.stdout.write(msg)
  }

  return undefined
}

/* 时间戳，格式为yyyyMMDDHH */
function getStamp() {
  const date = new Date()
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()

  return `${year}${month.toString().padStart(2, '0')}${day.toString().padStart(2, '0')}${hour.toString().padStart(2, '0')}`
}
/* 获取文件名称 */
export const getFileName = (fileName: string, mode: string = '') => {
  if (fileName.includes('{')) {
    // 处理文件名称中的模板
    const pkg = readJson('package.json')
    const stamp = getStamp()
    const values: Record<string, string> = {
      name: pkg.name,
      version: pkg.version,
      project: pkg.project ?? '',
      stamp,
      mode,
    }
    fileName = fileName.replace(/{([^}]+)}/g, (_match, key) => values[key] ?? key)
  }

  // 确认文件的后缀
  if (fileName.endsWith('.tar.gz') || fileName.endsWith('.tgz')) {
    return fileName
  } else {
    return fileName + '.tar.gz'
  }
}
