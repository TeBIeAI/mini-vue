export const EMPTY_OBJ: { readonly [key: string]: any } = Object.freeze({})

export const isObject = (val: unknown): val is Record<any, any> => {
	return val !== null && typeof val === 'object'
}

export const isFunction = (val: unknown): val is Function => {
	return typeof val === 'function'
}

export const isString = (val: unknown): val is string => typeof val === 'string'

export const isArray = value => Array.isArray(value)

const hasOwnProperty = Object.prototype.hasOwnProperty
export const hasOwn = (target, key) => {
	return hasOwnProperty.call(target, key)
}

export * from './shapeFlag'
