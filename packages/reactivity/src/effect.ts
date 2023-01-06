import { ComputedRefImpl } from './computed'

export let activeEffect: ReactiveEffect
let shouldTrack = false

export class ReactiveEffect {
	active = true
	deps: any[] = []
	computed?: ComputedRefImpl
	constructor(public fn, public scheduler = null) {}

	run() {
		if (!this.active) {
			// 此处执行fn  但不会进行依赖收集
			return this.fn()
		}
		try {
			activeEffect = this
			shouldTrack = true
			// 执行用户传入的fn 开始对fn内部使用的响应对象进行依赖收集
			return this.fn()
		} finally {
			// 执行完毕后  重置
			activeEffect = undefined
			shouldTrack = false
		}
	}

	stop() {
		// if(this.active) {
		//   clear
		// }
	}
}

export function effect(fn: () => {}, options) {
	const _effect = new ReactiveEffect(fn)

	_effect.run()

	const runner = _effect.run.bind(_effect)
	runner.effect = _effect

	return runner
}

const targetMap = new WeakMap()

export function track(target, type, key) {
	if (shouldTrack && activeEffect) {
		let depsMap = targetMap.get(target)

		if (!depsMap) {
			targetMap.set(target, (depsMap = new Map()))
		}

		let dep = depsMap.get(key)
		if (!dep) {
			depsMap.set(key, (dep = new Set()))
		}

		trackEffects(dep)
	}
}

export function trackEffects(dep) {
	if (activeEffect === undefined) return
	dep.add(activeEffect)
	activeEffect.deps.push(dep)
}

export function trgger(
	target,
	type,
	key,
	newValue?: unknown,
	oldValue?: unknown
) {
	// 查看当前对象是否被收集过   也就是当前对象是否在effect中使用过
	const depsMap = targetMap.get(target)
	if (!depsMap) return

	let deps = []

	if (key !== void 0) {
		deps.push(depsMap.get(key))
	}

	switch (type) {
		case 'add':
			break
		case 'set':
			// deps.push(depsMap.get(ITERATE_KEY))
			break

		default:
			break
	}
	const effects = []
	for (const dep of deps) {
		if (dep) {
			effects.push(...dep)
		}
	}
	triggerEffects(new Set(effects))
}

export function triggerEffects(dep) {
	for (const effect of dep) {
		effect.run()
	}
}
