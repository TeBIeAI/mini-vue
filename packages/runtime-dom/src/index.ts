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

	const { mount } = app

	app.mount = function (container) {
		if (!container) return

		container = nodeOps.querySelector(container)
		container.innerHTML = ''

		const proxy = mount(container)

		return proxy
	}

	return app
}

export * from '@mini-vue/runtime-core'
export * from '@mini-vue/reactivity'
