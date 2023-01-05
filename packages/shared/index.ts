export * from './src'

export const hasChanged = (value, oldValue) => {
	return !Object.is(value, oldValue)
}
