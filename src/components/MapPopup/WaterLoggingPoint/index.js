import Panel from "./Panel.vue"; // Dialog 的 UI 视图组件
import { dialogWithComponent } from "../../../utils/dialog.js";

/**
 * @name 静态方法，渲染Dialog组件，并且可在此处自定义dialog组件的props
 * @param {{ component: object, instance: object, componentDataAll: Array<object> }} contentProps 组件数据
 * @returns {Promise<any>}
 */
Panel.create = async (panelProps = {}) => {
  return dialogWithComponent((render) => render(Panel, panelProps), {
    title: panelProps.label,
    width: "400px",
  });
};

export default Panel;