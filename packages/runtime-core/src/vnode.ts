import { isArray, isObject, isString, ShapeFlags } from '@vue/shared'

export function isVnode(vnode) {
	return vnode.__v_isVnode
}

export function createVNode(type, props = null, children = null) {
	const shapeFlag = isString(type)
		? ShapeFlags.ELEMENT
		: isObject(type)
		? ShapeFlags.STATEFUL_COMPONENT
		: 0

	const vnode = {
		__v_isVNode: true,
		type,
		props,
		children,
		component: null, // 存放组件对应的实例
		el: null, // 稍后会将虚拟节点和真是节点对应起来
		shapeFlag
	}

	// 判断children 的类型， 看是否是普通元素  还是插槽
	normalizeChildren(vnode, children)

	return vnode
}

function normalizeChildren(vnode, children) {
	debugger
	let type = 0
	if (children === null) {
	} else if (isArray(children)) {
		type = ShapeFlags.ARRAY_CHILDREN
	} else {
		type = ShapeFlags.TEXT_CHILDREN
	}

	vnode.shapeFlag = vnode.shapeFlag | type
}
