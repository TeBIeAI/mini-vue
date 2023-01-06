import { currentInstance } from './components'

const enum LifeCycleHooks {
	BEFOR_MOUNT = 'bm',
	MOUNTED = 'm',
	BEFOR_UPDATE = 'bu',
	UPDATE = 'u'
}

export const createHooks = lifecycle => {
	// hook 的 target =>  当前实例
	return (hook, target = currentInstance) => {
		injectHook(lifecycle, (...args: unknown[]) => hook(...args), target)
	}
}

function injectHook(type, hook, target = currentInstance) {}
