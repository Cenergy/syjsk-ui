import Vue from "vue";

export default function componentToHtml(options) {
  const { component, props } = options || {};
  if (!component) return document.createElement("div");
  // 正确方式：使用 Vue.extend 生成组件构造器，再实例化
  const ComponentCtor = Vue.extend(component);
  const vm = new ComponentCtor({
    // 如需继承根实例上下文，可在调用方传入 parent
    propsData: props,
  });
  vm.$mount();
  return vm.$el;
}
