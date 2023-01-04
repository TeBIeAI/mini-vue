import { isObject } from '@vue/shared'
import { mutableHandlers, readonlyHandlers } from './baseHandlers'

export const enum ReactiveFlags {
	SKIP = '__v_skip',
	IS_REACTIVE = '__v_isReactive',
	IS_READONLY = '__v_isReadonly',
	IS_SHALLOW = '__v_isShallow',
	RAW = '__v_raw'
}

export interface Target {
	[ReactiveFlags.SKIP]?: boolean
	[ReactiveFlags.IS_REACTIVE]?: boolean
	[ReactiveFlags.IS_READONLY]?: boolean
	[ReactiveFlags.IS_SHALLOW]?: boolean
	[ReactiveFlags.RAW]?: any
}

export const reactiveMap = new WeakMap<Target, any>()
export const shallowReactiveMap = new WeakMap<Target, any>()
export const readonlyMap = new WeakMap<Target, any>()
export const shallowReadonlyMap = new WeakMap<Target, any>()

function createReactiveObject(target, isReadOnly, baseHandlers, proxyMap) {
	if (!isObject(target)) {
		console.warn(`value cannot be made reactive: ${String(target)}`)
		return target
	}
	const existingProxy = proxyMap.get(target)
	if (existingProxy) return target

	const proxy = new Proxy(target, baseHandlers)

	proxyMap.set(target, proxy)

	return proxy
}

export function reactive(target) {
	// 先判断是否为isReadOnly

	return createReactiveObject(target, false, mutableHandlers, reactiveMap)
}

export function readonly(target) {
	return createReactiveObject(target, true, readonlyHandlers, readonlyMap)
}

export function isReadonly(value: unknown): boolean {
	return !!(value && (value as Target)[ReactiveFlags.IS_READONLY])
}
