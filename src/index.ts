/*
 * @Author: zf
 * @Date: 2024-08-25 14:42:17
 * @Description:
 */

import type { PluginOptions } from './types'

import tarInRollup from './rollup'
import tarInVite from './vite'
import tarInWebpack from './webpack'

import { setColor } from './util'

/* 根据编译环境获取打包插件 */
function getPluginByBundler(bundler?: string, options?: PluginOptions) {
  switch (bundler) {
    case 'webpack':
      return tarInWebpack(options)
    case 'rollup':
      return tarInRollup(options)
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

export { tarInRollup, tarInVite, tarInWebpack }
