export const isObject = (val: unknown): val is Record<any, any> => {
	return val !== null && typeof val === 'object'
}

const hasOwnProperty = Object.prototype.hasOwnProperty
export const hasOwn = (target, key) => {
	return hasOwnProperty.call(target, key)
}
