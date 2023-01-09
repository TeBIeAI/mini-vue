import {
	createApp,
	getCurrentInstance,
	reactive,
	effect,
	onMounted,
	createVNode
} from '../../vue/dist/mini-vue.esm-bundler.js'

const App = {
	setup(props, ctx) {
		const instance = getCurrentInstance()

		onMounted(() => {
			console.log(instance)
		})

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
		return state => {
			return createVNode('p', '你好')
		}
	}
}

const app = createApp(App, { name: '我是根组件props' })
app.mount('#app')
console.log(app)
