import { createAppAPI } from './apiCreateApp'

export function baseCreateRenderer(options) {
	const render = []

	return {
		render,
		createApp: createAppAPI(render)
	}
}

export function createRenderer(options) {
	return baseCreateRenderer(options)
}
