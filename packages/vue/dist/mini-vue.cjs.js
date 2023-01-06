'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const EMPTY_OBJ = Object.freeze({});
const isObject = (val) => {
    return val !== null && typeof val === 'object';
};
const isFunction = (val) => {
    return typeof val === 'function';
};
const isString = (val) => typeof val === 'string';
const isArray = value => Array.isArray(value);
const hasOwnProperty = Object.prototype.hasOwnProperty;
const hasOwn = (target, key) => {
    return hasOwnProperty.call(target, key);
};

let uid = 0;
let currentInstance = null;
const getCurrentInstance = () => currentInstance;
function createComponentInstance(vnode) {
    const type = vnode.type;
    // 组件的属性以及方法
    const instance = {
        uid: uid++,
        vnode,
        type,
        render: null,
        proxy: null,
        components: null,
        // emit
        emit: null,
        // state
        ctx: EMPTY_OBJ,
        props: EMPTY_OBJ,
        attrs: EMPTY_OBJ,
        setupState: EMPTY_OBJ,
        // 生命周期钩子
        isMounted: false,
        bm: null,
        m: null,
        bu: null,
        u: null
    };
    instance.ctx = { _: instance };
    return instance;
}
function setupComponent(instance) {
    const { props, children } = instance.vnode;
    instance.props = props;
    instance.children = children; //插槽的解析
    // 配置状态组件
    let isStateful = instance.vnode.shapeFlag & 4 /* ShapeFlags.STATEFUL_COMPONENT */;
    if (isStateful) {
        setupStatefulComponent(instance);
    }
}
function setupStatefulComponent(instance) {
    const Component = instance.type;
    // instance.proxy = new Proxy(instance.ctx)
    // 调用setup
    const { setup } = Component;
    if (setup) {
        currentInstance = instance;
        const setupContext = createSetupContext();
        const setupResult = setup(instance.props, setupContext);
        currentInstance = null;
        handleSetupResult(instance, setupResult);
    }
}
// 处理setup 的返回结果
function handleSetupResult(instance, setupResult) {
    if (isFunction(setupResult)) {
        instance.render = setupResult;
    }
    else if (isObject(setupResult)) {
        instance.setupState = setupResult;
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    console.log(instance);
    const Component = instance.type;
    if (!instance.render) {
        instance.render = Component.render;
    }
}
// 创建上下文
function createSetupContext(instance) {
    return {
        attrs: {},
        slots: {},
        emit: () => { },
        expose: () => { }
    };
}

let activeEffect;
let shouldTrack = false;
class ReactiveEffect {
    constructor(fn, scheduler = null) {
        this.fn = fn;
        this.scheduler = scheduler;
        this.active = true;
        this.deps = [];
    }
    run() {
        if (!this.active) {
            // 此处执行fn  但不会进行依赖收集
            return this.fn();
        }
        try {
            activeEffect = this;
            shouldTrack = true;
            // 执行用户传入的fn 开始对fn内部使用的响应对象进行依赖收集
            return this.fn();
        }
        finally {
            // 执行完毕后  重置
            activeEffect = undefined;
            shouldTrack = false;
        }
    }
    stop() {
        // if(this.active) {
        //   clear
        // }
    }
}
function effect(fn, options) {
    const _effect = new ReactiveEffect(fn);
    _effect.run();
    const runner = _effect.run.bind(_effect);
    runner.effect = _effect;
    return runner;
}
const targetMap = new WeakMap();
function track(target, type, key) {
    if (shouldTrack && activeEffect) {
        let depsMap = targetMap.get(target);
        if (!depsMap) {
            targetMap.set(target, (depsMap = new Map()));
        }
        let dep = depsMap.get(key);
        if (!dep) {
            depsMap.set(key, (dep = new Set()));
        }
        trackEffects(dep);
    }
}
function trackEffects(dep) {
    if (activeEffect === undefined)
        return;
    dep.add(activeEffect);
    activeEffect.deps.push(dep);
}
function trgger(target, type, key, newValue, oldValue) {
    // 查看当前对象是否被收集过   也就是当前对象是否在effect中使用过
    const depsMap = targetMap.get(target);
    if (!depsMap)
        return;
    let deps = [];
    if (key !== void 0) {
        deps.push(depsMap.get(key));
    }
    const effects = [];
    for (const dep of deps) {
        if (dep) {
            effects.push(...dep);
        }
    }
    triggerEffects(new Set(effects));
}
function triggerEffects(dep) {
    for (const effect of dep) {
        effect.run();
    }
}

function createVNode(type, props = null, children = null) {
    const shapeFlag = isString(type)
        ? 1 /* ShapeFlags.ELEMENT */
        : isObject(type)
            ? 4 /* ShapeFlags.STATEFUL_COMPONENT */
            : 0;
    const vnode = {
        __v_isVNode: true,
        type,
        props,
        children,
        component: null,
        el: null,
        shapeFlag
    };
    // 判断children 的类型， 看是否是普通元素  还是插槽
    normalizeChildren(vnode, children);
    return vnode;
}
function normalizeChildren(vnode, children) {
    let type = 0;
    if (children === null) ;
    else if (isArray(children)) {
        type = 16 /* ShapeFlags.ARRAY_CHILDREN */;
    }
    else {
        type = 8 /* ShapeFlags.TEXT_CHILDREN */;
    }
    vnode.shapeFlag = vnode.shapeFlag | type;
}

function createAppAPI(render) {
    return function createApp(rootComponent, rootProps = null) {
        if (!isFunction(rootComponent)) {
            rootComponent = Object.assign({}, rootComponent);
        }
        let isMouted = false;
        const app = {
            _props: rootProps,
            _container: null,
            _instance: null,
            _component: rootComponent,
            // 组件挂在方法
            mount(rootContainer) {
                if (!isMouted) {
                    // 将rootComponent 渲染 vnode
                    const vnode = createVNode(rootComponent, rootProps);
                    // 此处可以进行挂在
                    render(vnode, rootContainer);
                    // 标记挂在结束
                    isMouted = true;
                    app._container = rootContainer;
                }
            }
        };
        return app;
    };
}

const Text = Symbol('text');
function isSameVNodeType(n1, n2) {
    return n1.type === n2.type;
}
function baseCreateRenderer(options) {
    const processComponent = (n1, n2, container, anchor) => {
        console.log(n1, n2);
        if (n1 === null) {
            // 走这里  是第一次渲染
            mountComponent(n2);
        }
    };
    // 挂在组件 其核心是获取组件的render 的模板
    const mountComponent = (initialVNode, container, anchor) => {
        // 初始化 创建组件实例
        const instance = (initialVNode.component =
            createComponentInstance(initialVNode));
        // 配置组件
        setupComponent(instance);
        // 为render创建effect
        setupRenderEffect(instance);
    };
    const setupRenderEffect = (instance, container) => {
        const componentUpdateFn = () => {
            if (!instance.isMounted) {
                instance.render();
                debugger;
            }
        };
        const effect = new ReactiveEffect(componentUpdateFn);
        const update = (instance.update = () => effect.run());
        update();
    };
    /**
     *
     * @param n1 父组件
     * @param n2 当前组件
     * @param container 要挂在的容器 element
     * @param anchor 挂在的锚点
     */
    const patch = (n1, n2, container, anchor = null) => {
        if (n1 === n2)
            return;
        // 判断父组件是否和当前组件相同
        if (n1 && isSameVNodeType(n1, n2)) ;
        const { type, shapeFlag } = n2;
        switch (type) {
            case Text:
                break;
            default:
                if (shapeFlag & 1 /* ShapeFlags.ELEMENT */) {
                    debugger;
                }
                else if (shapeFlag & 4 /* ShapeFlags.STATEFUL_COMPONENT */) {
                    processComponent(n1, n2);
                }
                break;
        }
    };
    const render = function (vnode, container) {
        if (vnode == null) ;
        else {
            patch(container.vnode || null, vnode, container, null);
        }
    };
    return {
        render,
        createApp: createAppAPI(render)
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

const get = createGetter();
const readonlyGet = createGetter(true);
function createGetter(isReadOnly = false, shallow = false) {
    return function get(target, key) {
        const res = Reflect.get(target, key);
        if (!isReadOnly) {
            // 此处可以开始收集依赖
            track(target, 'add', key);
        }
        // 如果是浅层代理  直接返回  不必考虑key是否为对象
        if (shallow) {
            return res;
        }
        if (isObject(res)) {
            // 此处需要处理只读属性 不需要做深层代理
            // 如果访问的是一个对象  才开始对该属性进行代理，此处避免初始化的时候进行深层代理问题   访问时候才开始代理 进行依赖收集
            return isReadOnly ? readonly(res) : reactive(res);
        }
        return res;
    };
}
const set = createSetter();
function createSetter(shallow = false) {
    return function set(target, key, value) {
        target[key];
        // 判断 oldValue 是否为只读属性 只读属性不能修改  reactive({name: {name1: {name2: 2}}})   name1 有可能被readonly 包裹
        // isReadonly(oldValue)
        // 判断是新增 还是修改
        const hadKey = hasOwn(target, key);
        const result = Reflect.set(target, key, value);
        if (!hadKey) {
            // 新增
            trgger(target, 'add', key);
        }
        else {
            // 修改
            trgger(target, 'set', key);
        }
        return result;
    };
}
const mutableHandlers = {
    get,
    set
};
const readonlyHandlers = {
    get: readonlyGet,
    set(target, key) {
        console.warn(`Set operation on key "${String(key)}" failed: target is readonly.`, target);
        return true;
    }
};

const reactiveMap = new WeakMap();
const readonlyMap = new WeakMap();
function createReactiveObject(target, isReadOnly, baseHandlers, proxyMap) {
    if (!isObject(target)) {
        console.warn(`value cannot be made reactive: ${String(target)}`);
        return target;
    }
    const existingProxy = proxyMap.get(target);
    if (existingProxy)
        return existingProxy;
    const proxy = new Proxy(target, baseHandlers);
    proxyMap.set(target, proxy);
    return proxy;
}
function reactive(target) {
    // 先判断是否为isReadOnly
    return createReactiveObject(target, false, mutableHandlers, reactiveMap);
}
function readonly(target) {
    return createReactiveObject(target, true, readonlyHandlers, readonlyMap);
}

const hasChanged = (value, oldValue) => {
	return !Object.is(value, oldValue)
};

function ref(value) {
    return createRef(value);
}
function convert(value) {
    return isObject(value) ? reactive(value) : value;
}
class RefImpl {
    constructor(value) {
        this.dep = undefined;
        this.__v_isRef = true;
        this._value = convert(value);
    }
    get value() {
        trackRefValue(this);
        return this._value;
    }
    set value(newVal) {
        if (hasChanged) {
            this._value = convert(newVal);
            triggerRefValue(this);
        }
    }
}
function trackRefValue(ref) {
    trackEffects(ref.dep || (ref.dep = new Set()));
}
function triggerRefValue(ref) {
    triggerEffects(ref.dep || (ref.dep = new Set()));
}
function isRef(r) {
    return !!(r && r.__v_isRef === true);
}
function createRef(rawValue) {
    if (isRef(rawValue))
        return rawValue;
    return new RefImpl(rawValue);
}

class ComputedRefImpl {
    constructor(getter) {
        this.dep = [];
        this.__v_isRef = true;
        this._dirty = true;
        this.effect = new ReactiveEffect(getter);
        this.effect.computed = this;
        this.effect.active = true;
    }
    get value() {
        trackRefValue(this);
        const self = this;
        if (self._dirty) {
            self._dirty = false;
            self._value = self.effect.run();
        }
        return self._value;
    }
}
function computed(getter) {
    const cRef = new ComputedRefImpl(getter);
    return cRef;
}

// 创建dom操作相关属性
Object.assign(nodeOps, { patchProp });
let renderer;
function ensureRenderer() {
    return renderer || (renderer = createRenderer());
}
const createApp = (...args) => {
    const app = ensureRenderer().createApp(...args);
    const { mount } = app;
    app.mount = function (container) {
        if (!container)
            return;
        container = nodeOps.querySelector(container);
        container.innerHTML = '';
        const proxy = mount(container);
        return proxy;
    };
    return app;
};

exports.baseCreateRenderer = baseCreateRenderer;
exports.computed = computed;
exports.createApp = createApp;
exports.createRenderer = createRenderer;
exports.effect = effect;
exports.getCurrentInstance = getCurrentInstance;
exports.reactive = reactive;
exports.readonly = readonly;
exports.ref = ref;
exports.track = track;
//# sourceMappingURL=mini-vue.cjs.js.map
