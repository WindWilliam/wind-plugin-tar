/*
 * @Author: zf
 * @Date: 2024-09-01 14:16:52
 * @Description: vite版插件
 */

import type { Plugin, ResolvedConfig } from 'vite'
import type { PluginOptions } from './types'

import { dftInfo, execTar } from './core'
import { getShellName } from './util'

/* vite插件入口 */
const tarInVite = (options?: PluginOptions): Plugin => {
  const info = { ...dftInfo }

  return {
    name: 'vite-plugin-tar',
    apply: 'build',
    async configResolved(config: ResolvedConfig) {
      info.mode = config.mode
      info.dir = config.build.outDir
      // 确定shell环境
      info.shell = await getShellName(options?.shell ?? config.env.VITE_TAR_SHELL)
    },
    async closeBundle() {
      await execTar(info, options)
    },
  }
}

export default tarInVite
