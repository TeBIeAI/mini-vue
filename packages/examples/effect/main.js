import { effect, reactive } from '../../vue/dist/mini-vue.esm-bundler.js'

const obj = reactive({
	address: {
		name: 'hanchao'
	}
})

const obj1 = reactive({
	sex: '女'
})

const _effect = effect(() => {
	debugger
	console.log(obj.address)
	console.log(obj1.sex)
})

setTimeout(() => {
	obj1.sex = '男'
}, 1000)
