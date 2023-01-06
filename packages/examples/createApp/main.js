import {
	createApp,
	getCurrentInstance,
	reactive,
	effect
} from '../../vue/dist/mini-vue.esm-bundler.js'

const App = {
	setup(props, ctx) {
		const instance = getCurrentInstance()

		console.log('instance', instance)

		const obj = {
			name: 1
		}

		const state = reactive(obj)

		effect(() => {
			state.name
		})

		setTimeout(() => {
			state.name = 222
		}, 2000)

		const a = {
			name: '你好'
		}
		return () => {
			debugger
		}
	}
}

const app = createApp(App, { name: '我是根组件props' })
app.mount('#app')
console.log(app)
