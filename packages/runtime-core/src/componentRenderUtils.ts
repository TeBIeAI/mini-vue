export function renderComponentRoot(instance) {
	const {
		type: Component,
		vnode,
		proxy,
		withProxy,
		props,
		slots,
		attrs,
		emit,
		render,
		renderCache,
		data,
		setupState,
		ctx,
		inheritAttrs
	} = instance

	let result = render.call(proxy, proxy)

	return result
}
