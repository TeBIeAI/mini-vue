import {
	computed,
	effect,
	reactive
} from '../../vue/dist/mini-vue.esm-bundler.js'

const obj1 = reactive({
	name: {
		sex: '男'
	}
})
const getName = effect(() => {
	debugger
	obj1.name.sex
})
// console.log(obj1.name.sex)
// console.log(obj1)
// setTimeout(() => {
// 	obj1.name.sex = '女'
// }, 1000)

// console.log(getName)

setTimeout(() => {
	obj1.name.sex = 11
}, 3000)
