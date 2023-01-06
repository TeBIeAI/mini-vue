import { EMPTY_OBJ, isFunction, isObject, ShapeFlags } from '@vue/shared'

let uid = 0

export let currentInstance = null

export const getCurrentInstance = () => currentInstance

export function createComponentInstance(vnode) {
	const type = vnode.type

	// 组件的属性以及方法
	const instance = {
		uid: uid++,
		vnode,
		type,
		render: null,
		proxy: null,
		components: null,

		// emit
		emit: null,

		// state
		ctx: EMPTY_OBJ,
		props: EMPTY_OBJ,
		attrs: EMPTY_OBJ,
		setupState: EMPTY_OBJ,

		// 生命周期钩子
		isMounted: false,
		bm: null,
		m: null,
		bu: null,
		u: null
	}

	instance.ctx = { _: instance }

	return instance
}

export function setupComponent(instance) {
	const { props, children } = instance.vnode

	instance.props = props
	instance.children = children //插槽的解析

	// 配置状态组件
	let isStateful = instance.vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT

	if (isStateful) {
		setupStatefulComponent(instance)
	}
}

function setupStatefulComponent(instance) {
	const Component = instance.type

	// instance.proxy = new Proxy(instance.ctx)

	// 调用setup
	const { setup } = Component

	if (setup) {
		currentInstance = instance

		const setupContext = createSetupContext(instance)

		const setupResult = setup(instance.props, setupContext)

		currentInstance = null

		handleSetupResult(instance, setupResult)
	}
}

// 处理setup 的返回结果
function handleSetupResult(instance, setupResult) {
	if (isFunction(setupResult)) {
		instance.render = setupResult
	} else if (isObject(setupResult)) {
		instance.setupState = setupResult
	}

	finishComponentSetup(instance)
}

function finishComponentSetup(instance) {
	console.log(instance)
	const Component = instance.type
	if (!instance.render) {
		instance.render = Component.render
	}
}

// 创建上下文
export function createSetupContext(instance) {
	return {
		attrs: {},
		slots: {},
		emit: () => {},
		expose: () => {}
	}
}
