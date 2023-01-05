import {
	ref,
	readonly,
	reactive,
	effect
} from '../../vue/dist/mini-vue.esm-bundler.js'

const obj = ref({
	name: '你好'
})

effect(() => {
	console.log(obj.value.name)
})

obj.value.name = '111'
