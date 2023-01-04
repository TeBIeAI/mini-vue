const targetMap = new WeakMap()

export function track(target, type, key) {
	let depsMap = targetMap.get(target)

	if (!depsMap) {
		targetMap.set(target, (depsMap = new Map()))
	}

	let dep = depsMap.get(key)
	if (!dep) {
		depsMap.set(key, (dep = new Map()))
	}

	trackEffects(dep)
}

export function trackEffects(dep) {}
