export const isObject = (val: unknown): val is Record<any, any> => {
	return val !== null && typeof val === 'object'
}

export const isFunction = (val: unknown): val is Function => {
	return typeof val === 'function'
}

const hasOwnProperty = Object.prototype.hasOwnProperty
export const hasOwn = (target, key) => {
	return hasOwnProperty.call(target, key)
}
