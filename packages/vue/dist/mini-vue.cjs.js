'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function createAppAPI(render) {
    return function createApp(rootComponent, rootProps = null) {
        debugger;
        const app = {
            // 组件挂在方法
            mount(rootContainer) { }
        };
        return app;
    };
}

function baseCreateRenderer(options) {
    const render = [];
    return {
        render,
        createApp: createAppAPI()
    };
}
function createRenderer(options) {
    return baseCreateRenderer();
}

// 这个文件主要用于操作dom  我直接将源文件复制过来了
const doc = (typeof document !== 'undefined' ? document : null);
const svgNS = 'http://www.w3.org/2000/svg';
const nodeOps = {
    insert: (child, parent, anchor) => {
        parent.insertBefore(child, anchor || null);
    },
    remove: child => {
        const parent = child.parentNode;
        if (parent) {
            parent.removeChild(child);
        }
    },
    createElement: (tag, isSVG, is, props) => {
        const el = isSVG
            ? doc.createElementNS(svgNS, tag)
            : doc.createElement(tag, is ? { is } : undefined);
        if (tag === 'select' && props && props.multiple != null) {
            el.setAttribute('multiple', props.multiple);
        }
        return el;
    },
    createText: text => doc.createTextNode(text),
    createComment: text => doc.createComment(text),
    setText: (node, text) => {
        node.nodeValue = text;
    },
    setElementText: (el, text) => {
        el.textContent = text;
    },
    parentNode: node => node.parentNode,
    nextSibling: node => node.nextSibling,
    querySelector: selector => doc.querySelector(selector),
    setScopeId(el, id) {
        el.setAttribute(id, '');
    }
};

const patchAttr = (el, key, value) => {
    if (value == null) {
        el.removeAttrbute(key);
    }
    else {
        el.setAttribute(key, value);
    }
};

const patchStyle = (el, prevValue, nextValue) => {
    const style = el.style;
    if (nextValue == null) {
        el.removeAttrbute("style");
    }
    else {
        // 老的里新的有没有
        if (prevValue) {
            for (const key in nextValue) {
                if (nextValue[key] == null) {
                    style[key] = "";
                }
            }
        }
        // 新的里面 需要复制到style
        for (const key in nextValue) {
            style[key] = nextValue[key];
        }
    }
};

const patchEvent = (el, key, value) => {
    // 对函数进行缓存
    const invokers = el._evi || (el._evi = {});
    const exists = invokers[key];
    if (value && exists) {
        // 需要绑定事件  而且还存在的情况下
        exists.value = value;
    }
    else {
        const eventName = key.slice(2).toLowerCase();
        if (value) {
            // 要绑定事件 以前没有绑定过
            let invoker = (invokers[key] = createInvoder(value));
            el.addEventListener(eventName, invoker);
        }
        else {
            // 以前绑定了  但是没有VAlue
            el.removeEventListener(eventName, exists);
            invokers[key] = undefined;
        }
    }
};
function createInvoder(value) {
    const invoker = function (e) {
        invoker.value(e);
    };
    // 为了能随时更改value属性
    invoker.value = value;
    return invoker;
}

const patchClass = (el, value) => {
    if (value == null) {
        value = "";
    }
    el.className = value;
};

// 这里面针对的是一系列属性操作
const patchProp = (el, key, prevValue, nextValue) => {
    switch (key) {
        case 'class':
            patchClass(el, nextValue);
            break;
        case 'style':
            patchStyle(el, prevValue, nextValue);
            break;
        default:
            // 如果不是事件  才是属性
            if (/^on[^a-z]/.test(key)) {
                patchEvent(el, key, nextValue);
            }
            else {
                patchAttr(el, key, nextValue);
            }
            break;
    }
};

// 创建dom操作相关属性
Object.assign(nodeOps, { patchProp });
let renderer;
function ensureRenderer() {
    return renderer || (renderer = createRenderer());
}
const createApp = (...args) => {
    const app = ensureRenderer().createApp(...args);
    return app;
};

exports.createApp = createApp;
//# sourceMappingURL=mini-vue.cjs.js.map
