/*
 * @Author: zf
 * @Date: 2024-09-01 14:17:18
 * @Description: rollup版插件
 */

import type { PluginOptions } from './types'
import type { InputPluginOption, NormalizedOutputOptions } from 'rollup'

import { dftInfo, execTar } from './core'
import { getShellName } from './util'

const tarInRollup = (options?: PluginOptions): InputPluginOption => {
  // 禁用状态--需要？
  if (options?.disable) {
    return { name: 'wind-plugin-tar' }
  }

  const info = { ...dftInfo }

  return {
    name: 'rollup-plugin-tar',
    async renderStart(outputOptions: NormalizedOutputOptions) {
      // 无法自行从配置中获取mode，故只能通过配置项传入
      // kv.mode = config.mode
      info.dir = outputOptions.dir ?? ''
      // 确定shell环境
      // 无法自行从环境变量中获取，故只能通过配置项传入
      info.shell = await getShellName(options?.shell)
    },
    async closeBundle() {
      await execTar(info, options)
    },
  }
}

export default tarInRollup
