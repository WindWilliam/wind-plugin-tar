/*
 * @Author: zf
 * @Date: 2024-09-01 14:17:47
 * @Description: webpack版插件
 */
import type { Compiler } from 'webpack'
import type { PluginOptions } from './types'

import { dftInfo, execTar } from './core'
import { getShellName } from './util'

class TarPlugin {
  options?: PluginOptions
  readonly name: string = 'wind-plugin-tar'
  /* 构造函数 */
  constructor(options?: PluginOptions) {
    this.options = options
  }
  apply(compiler: Compiler) {
    const { options } = this
    // 禁用状态
    if (options?.disable ?? process.env.NODE_ENV !== 'production') {
      return
    }

    const info = { ...dftInfo }
    compiler.hooks.done.tapPromise(this.name, () => {
      return new Promise(async (resolve) => {
        info.dir = compiler.options.output.path ?? ''
        info.mode = compiler.options.mode
        info.shell = await getShellName(options?.shell)

        await execTar(info, options)

        resolve()
      })
    })
  }
}

/* 初始化插件 */
const tarInWebpack = (options?: PluginOptions) => {
  return new TarPlugin(options)
}

export default tarInWebpack
