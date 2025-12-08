import Vue from "vue";

// 将组件实例渲染为 HTML 字符串，并确保销毁实例以避免内存泄漏
export default function componentToHtml(options) {
  const { component, props, parent } = options || {};
  if (!component) return "";

  // 使用 Vue.extend 生成组件构造器，再实例化
  const ComponentCtor = Vue.extend(component);
  const vm = new ComponentCtor({
    // 可选：继承父级上下文
    parent,
    propsData: props,
  });
  vm.$mount();

  // 读取 HTML 字符串并清理实例与节点
  const el = vm.$el;
  const html = el && el.outerHTML ? el.outerHTML : "";
  vm.$destroy();
  if (el && typeof el.remove === "function") {
    try { el.remove(); } catch (_) {}
  }
  return html;
}
