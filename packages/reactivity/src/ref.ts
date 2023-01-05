import { hasChanged, isObject } from '@mini-vue/shared'
import { reactive } from './reactive'

export function ref(value?: unknown) {
	return createRef(value)
}

function convert(value) {
	return isObject(value) ? reactive(value) : value
}

class RefImpl {
	private _value
	public dep = undefined
	public readonly __v_isRef = true

	constructor(value) {
		this._value = convert(value)
	}

	get value() {
		return this._value
	}

	set value(newVal) {
		if (hasChanged) {
			this._value = convert(newVal)
		}
	}
}

export function isRef(r) {
	return !!(r && r.__v_isRef === true)
}

function createRef(rawValue) {
	if (isRef(rawValue)) return rawValue

	return new RefImpl(rawValue)
}
