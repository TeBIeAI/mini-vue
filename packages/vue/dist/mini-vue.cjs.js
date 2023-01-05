'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const isObject = (val) => {
    return val !== null && typeof val === 'object';
};
const hasOwnProperty = Object.prototype.hasOwnProperty;
const hasOwn = (target, key) => {
    return hasOwnProperty.call(target, key);
};

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
    return !Object.is(value, oldValue);
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

exports.computed = computed;
exports.effect = effect;
exports.reactive = reactive;
exports.readonly = readonly;
exports.ref = ref;
exports.track = track;
//# sourceMappingURL=mini-vue.cjs.js.map
