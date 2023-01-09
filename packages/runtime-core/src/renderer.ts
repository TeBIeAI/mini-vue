import { ShapeFlags } from '@vue/shared'
import { ReactiveEffect } from 'packages/reactivity/src/effect'
import { createAppAPI } from './apiCreateApp'
import { renderComponentRoot } from './componentRenderUtils'
import { createComponentInstance, setupComponent } from './components'

export const Text = Symbol('text')

function isSameVNodeType(n1, n2) {
	return n1.type === n2.type
}

export function baseCreateRenderer(options) {
	const {
		insert: hostInsert,
		remove: hostRemove,
		patchProp: hostPatchProp,
		createElement: hostCreateElement,
		createText: hostCreateText,
		createComment: hostCreateComment,
		setText: hostSetText,
		setElementText: hostSetElementText,
		parentNode: hostParentNode,
		nextSibling: hostNextSibling,
		setScopeId: hostSetScopeId = NOOP,
		insertStaticContent: hostInsertStaticContent
	} = options

	const processComponent = (n1, n2, container, anchor) => {
		if (n1 === null) {
			// 走这里  是第一次渲染
			mountComponent(n2, container, anchor)
		} else {
			// 走组件更新
		}
	}

	// 挂在组件 其核心是获取组件的render 的模板
	const mountComponent = (initialVNode, container, anchor) => {
		// 初始化 创建组件实例
		const instance = (initialVNode.component =
			createComponentInstance(initialVNode))

		// 配置组件
		setupComponent(instance)
		// 为render创建effect
		setupRenderEffect(instance, container)
	}

	const setupRenderEffect = (instance, container) => {
		const componentUpdateFn = () => {
			if (!instance.isMounted) {
				let vnodeHook: undefined

				const { bm, m } = instance
				const proxyToUse = instance.proxy

				if (bm) {
					// 处理beforMounted
				}
				// instance.render.call(proxyToUse, proxyToUse)
				const subTree = (instance.subTree = renderComponentRoot(instance))

				patch(null, subTree, container)

				return false

				if (m) {
					// 处理mounted   此时组件挂载成功
					// 此处做了简化，直接调用   没有考虑instance的问题
					m.forEach(fn => {
						fn()
					})
				}
			} else {
				// 更新组件
			}
		}

		const effect = new ReactiveEffect(componentUpdateFn)

		const update = (instance.update = () => effect.run())

		update()
	}

	// 处理元素
	const processElement = (n1, n2, container, anchore) => {
		debugger
		if (n1 === null) {
			mountElement(n2, container, anchore)
		}
	}

	const mountElement = (vnode, container, anchor) => {
		let el = (vnode.el = hostCreateElement(vnode.type))
		debugger
	}
	// 处理元素

	/**
	 *
	 * @param n1 父组件
	 * @param n2 当前组件
	 * @param container 要挂在的容器 element
	 * @param anchor 挂在的锚点
	 */
	const patch = (n1, n2, container, anchor = null) => {
		if (n1 === n2) return

		// 判断父组件是否和当前组件相同
		if (n1 && isSameVNodeType(n1, n2)) {
		}

		const { type, shapeFlag } = n2

		switch (type) {
			case Text:
				break

			default:
				if (shapeFlag & ShapeFlags.ELEMENT) {
					processElement(n1, n2, container, anchor)
				} else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
					processComponent(n1, n2, container, anchor)
				}
				break
		}
	}

	const render = function (vnode, container) {
		if (vnode == null) {
			// 执行卸载操作
		} else {
			patch(container.vnode || null, vnode, container, null)
		}
	}

	return {
		render,
		createApp: createAppAPI(render)
	}
}

export function createRenderer(options) {
	return baseCreateRenderer(options)
}
