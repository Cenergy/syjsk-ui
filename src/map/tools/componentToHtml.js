import Vue from "vue";
import vueInstance from "@/main";

export default function componentToHtml(options) {
  const { component, props } = options;
  if (!component) return document.createElement("div");
  const starRating = new Vue({
    ...component,
    parent: vueInstance,
    propsData: props,
  }).$mount();
  return starRating.$el;
}
