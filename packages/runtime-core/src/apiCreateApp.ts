import { isFunction } from '@vue/shared'
import { createVNode } from './vnode'

export function createAppAPI(render) {
	return function createApp(rootComponent, rootProps = null) {
		if (!isFunction(rootComponent)) {
			rootComponent = { ...rootComponent }
		}

		let isMouted = false

		const app = {
			_props: rootProps,
			_container: null,
			_instance: null,
			_component: rootComponent,

			// 组件挂在方法
			mount(rootContainer) {
				if (!isMouted) {
					// 将rootComponent 渲染 vnode
					const vnode = createVNode(rootComponent, rootProps)

					// 此处可以进行挂在
					render(vnode, rootContainer)

					// 标记挂在结束
					isMouted = true
					app._container = rootContainer
				}
			}
		}

		return app
	}
}
