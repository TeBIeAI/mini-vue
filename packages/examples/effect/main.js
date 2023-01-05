import { effect, reactive } from '../../vue/dist/mini-vue.esm-bundler.js'

const obj1 = reactive({
	name: {
		sex: '男'
	}
})
const _effect = effect(() => {
	console.log(obj1.name.sex)
})
// console.log(obj1.name.sex)
// console.log(obj1)
setTimeout(() => {
	obj1.name.sex = '女'
}, 1000)
