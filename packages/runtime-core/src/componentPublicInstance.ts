import { hasOwn } from '@vue/shared'

export const PublicInstanceProxyHandlers = {
	get({ _: instance }, key) {
		const { setupState, props } = instance

		if (key[0] !== '$') {
			if (hasOwn(setupState, key)) {
				return setupState[key]
			} else if (hasOwn(props, key)) {
				return props[key]
			}
		}
	},
	set({ _: instance }, key, value) {
		const { setupState } = instance

		if (hasOwn(setupState, key)) {
			setupState[key] = value
		}
	}
}
