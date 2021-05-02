import Vue from "vue";
import { Line, Bar } from "vue-chartjs";

function registerComponent(name, component) {
  Vue.component(name, {
    extends: component,
    props: ["data", "options"],
    mounted() {
      this.renderChart(this.data, this.options);
    }
  });
}

registerComponent("LineChart", Line);
registerComponent("BarChart", Bar);
