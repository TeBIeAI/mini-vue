import { ReactiveEffect } from './effect'
import { trackRefValue } from './ref'

class ComputedRefImpl {
	public dep = []

	private _value

	public readonly __v_isRef = true

	public readonly effect: ReactiveEffect

	public _dirty = true

	constructor(getter) {
		this.effect = new ReactiveEffect(getter)
		this.effect.active = true
	}

	get value() {
		trackRefValue(this)
		const self = this

		if (self._dirty) {
			self._dirty = false
			self._value = self.effect.run()
		}
		return self._value
	}
}

export function computed(getter) {
	const cRef = new ComputedRefImpl(getter)

	return cRef
}
