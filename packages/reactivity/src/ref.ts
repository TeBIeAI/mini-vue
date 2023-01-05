import { hasChanged, isObject } from '@mini-vue/shared'
import { trackEffects, triggerEffects } from './effect'
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
		trackRefValue(this)
		return this._value
	}

	set value(newVal) {
		if (hasChanged) {
			this._value = convert(newVal)
			triggerRefValue(this)
		}
	}
}

export function trackRefValue(ref) {
	trackEffects(ref.dep || (ref.dep = new Set()))
}

export function triggerRefValue(ref) {
	triggerEffects(ref.dep || (ref.dep = new Set()))
}

export function isRef(r: any) {
	return !!(r && r.__v_isRef === true)
}

function createRef(rawValue: any) {
	if (isRef(rawValue)) return rawValue

	return new RefImpl(rawValue)
}
