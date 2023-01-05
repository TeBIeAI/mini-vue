export let activeEffect: ReactiveEffect

export class ReactiveEffect {
	active = true
	deps: any[] = []
	constructor(public fn, public scheduler = null) {}

	run() {
		if (!this.active) {
			return this.fn()
		}
		try {
			activeEffect = this

			return this.fn()
		} finally {
			activeEffect = undefined
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
	if (activeEffect === undefined) {
		// 目前不需要收集依赖 没有effect
		return
	}

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

export function trackEffects(dep) {
	dep.add(activeEffect)
	activeEffect.deps.push(dep)
	console.log(dep)
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

function triggerEffects(dep) {
	for (const effect of dep) {
		effect.run()
	}
}
