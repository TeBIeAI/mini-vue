'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const isObject = (val) => {
    return val !== null && typeof val === 'object';
};
const hasOwnProperty = Object.prototype.hasOwnProperty;
const hasOwn = (target, key) => {
    return hasOwnProperty.call(target, key);
};

const targetMap = new WeakMap();
function track(target, type, key) {
    let depsMap = targetMap.get(target);
    if (!depsMap) {
        targetMap.set(target, (depsMap = new Map()));
    }
    let dep = depsMap.get(key);
    if (!dep) {
        depsMap.set(key, (dep = new Map()));
    }
}

const get = createGetter();
const readonlyGet = createGetter(true);
const set = createSetter();
function createGetter(isReadOnly = false, shallow = false) {
    return function get(target, key) {
        const res = Reflect.get(target, key);
        isReadonly(res);
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
function createSetter(isReadOnly = false, shallow = false) {
    return function set(target, key, value) {
        let oldValue = target[key];
        // 判断 oldValue 是否为只读属性 只读属性不能修改  reactive({name: {name1: {name2: 2}}})   name1 有可能被readonly 包裹
        isReadonly(oldValue);
        // 判断是新增 还是修改
        hasOwn(target, key);
        const result = Reflect.set(target, key, value);
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
        return target;
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
function isReadonly(value) {
    return !!(value && value["__v_isReadonly" /* ReactiveFlags.IS_READONLY */]);
}

exports.reactive = reactive;
exports.readonly = readonly;
exports.track = track;
//# sourceMappingURL=mini-vue.cjs.js.map
