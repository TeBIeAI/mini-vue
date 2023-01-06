// 这个文件主要用于操作dom  我直接将源文件复制过来了

const doc = (typeof document !== 'undefined' ? document : null) as Document
export const svgNS = 'http://www.w3.org/2000/svg'

export const nodeOps = {
	insert: (child, parent, anchor) => {
		parent.insertBefore(child, anchor || null)
	},

	remove: child => {
		const parent = child.parentNode
		if (parent) {
			parent.removeChild(child)
		}
	},

	createElement: (tag, isSVG, is, props): Element => {
		const el = isSVG
			? doc.createElementNS(svgNS, tag)
			: doc.createElement(tag, is ? { is } : undefined)

		if (tag === 'select' && props && props.multiple != null) {
			;(el as HTMLSelectElement).setAttribute('multiple', props.multiple)
		}

		return el
	},

	createText: text => doc.createTextNode(text),

	createComment: text => doc.createComment(text),

	setText: (node, text) => {
		node.nodeValue = text
	},

	setElementText: (el, text) => {
		el.textContent = text
	},

	parentNode: node => node.parentNode as Element | null,

	nextSibling: node => node.nextSibling,

	querySelector: selector => doc.querySelector(selector),

	setScopeId(el, id) {
		el.setAttribute(id, '')
	}
}
