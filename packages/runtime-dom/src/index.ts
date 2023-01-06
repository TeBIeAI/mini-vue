import { createRenderer } from '@vue/runtime-core'
import { nodeOps } from './nodeOps'
import { patchProp } from './patchProp'

// 创建dom操作相关属性
const rendererOptions = Object.assign(nodeOps, { patchProp })

let renderer

function ensureRenderer() {
	return renderer || (renderer = createRenderer(rendererOptions))
}

export const createApp = (...args) => {
	const app = ensureRenderer().createApp(...args)

	return app
}
