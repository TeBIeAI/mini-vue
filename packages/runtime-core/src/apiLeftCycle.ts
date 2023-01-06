import { currentInstance } from './components'

const enum LifecycleHooks {
	BEFOR_MOUNT = 'bm',
	MOUNTED = 'm',
	BEFOR_UPDATE = 'bu',
	UPDATE = 'u'
}

export const createHook = lifecycle => {
	// hook 的 target =>  当前实例
	return (hook, target = currentInstance) => {
		debugger
		injectHook(lifecycle, (...args: unknown[]) => hook(...args), target)
	}
}

function injectHook(type, hook, target = currentInstance) {
	const hooks = target[type] || (target[type] = [])
	debugger
}

export const onMounted = createHook(LifecycleHooks.MOUNTED)
