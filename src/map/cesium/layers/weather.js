import BaseLayer from "./baseLayer";
import * as request from "@/api/map";
import { addRainAnimation, removeRainAnimation } from "./rain";

class weather extends BaseLayer {
  constructor(options) {
    super(options);
  }
  show(options) { 
    const { viewer, id } = this;
    addRainAnimation(viewer,"small");
  }

  showRain(type) {
    const { viewer, id } = this;
    addRainAnimation(viewer,type);
  }

  setLegend() {}

  hide() {
    const { viewer, id } = this;
    removeRainAnimation(viewer);
  }
}
export default new weather();
