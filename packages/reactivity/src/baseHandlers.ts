import { hasOwn, isObject } from '@vue/shared'
import { track, trgger } from './effect'
import { reactive, readonly } from './reactive'

const get = createGetter()
const readonlyGet = createGetter(true)

function createGetter(isReadOnly = false, shallow = false) {
	return function get(target, key) {
		const res = Reflect.get(target, key)

		if (!isReadOnly) {
			// 此处可以开始收集依赖
			track(target, 'add', key)
		}

		// 如果是浅层代理  直接返回  不必考虑key是否为对象
		if (shallow) {
			return res
		}

		if (isObject(res)) {
			// 此处需要处理只读属性 不需要做深层代理
			// 如果访问的是一个对象  才开始对该属性进行代理，此处避免初始化的时候进行深层代理问题   访问时候才开始代理 进行依赖收集
			return isReadOnly ? readonly(res) : reactive(res)
		}

		return res
	}
}

const set = createSetter()

function createSetter(shallow = false) {
	return function set(target, key, value) {
		let oldValue = target[key]

		// 判断 oldValue 是否为只读属性 只读属性不能修改  reactive({name: {name1: {name2: 2}}})   name1 有可能被readonly 包裹
		// isReadonly(oldValue)

		// 判断是新增 还是修改
		const hadKey = hasOwn(target, key)

		const result = Reflect.set(target, key, value)
		if (!hadKey) {
			// 新增
			trgger(target, 'add', key, value)
		} else {
			// 修改
			trgger(target, 'set', key, value, oldValue)
		}

		return result
	}
}

export const mutableHandlers = {
	get,
	set
}

export const readonlyHandlers = {
	get: readonlyGet,
	set(target, key) {
		console.warn(
			`Set operation on key "${String(key)}" failed: target is readonly.`,
			target
		)
		return true
	}
}
