import BaseLayer from "./baseLayer";
import * as request from "@/api/map";
import * as styles from "../styles";
import eventBus from "../../../utils/EventBus";
import { Message } from "element-ui";
class cloudImage extends BaseLayer {
  constructor(options) {
    super(options);
  }
  // 异步显示函数
  async show() {
    eventBus.emit('showCloudDialog', true);
  }
  hide() {}
}
export default new cloudImage();
