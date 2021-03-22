<template>
  <div
    class="max-w-sm bg-white border-2 border-gray-300 p-3 rounded-md tracking-wide shadow-lg news-table"
  >
    <button
      class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center ml-2"
      @click="click"
    > Test </button>
    <table class="table-auto border">
      <thead>
        <tr>
          <th>Live news in {City}</th>
        </tr>
      </thead>
      <tbody>
        <tr class="border">
          <td>Man dead in {City}, Dog to blame???</td>
        </tr>
        <tr class="border">
          <td>{City} has been named the worst city in the UK</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from "nuxt-property-decorator";
@Component
export default class NewsTable extends Vue {
  channels = {
    NewsChannel: {
      received: this.parseMessage
    }
  };

  mounted() {
    this.$cable.subscribe({
      channel: "NewsChannel"
    });
  }

  click() {
    this.$cable.perform({
      channel: "NewsChannel",
      action: "initialise_source",
      data: {
        source: "google",
        location: "london"
      }
    });
  }

  parseMessage(data) {
    console.log(data);
  }
}
</script>

<style>
.news-table {
  margin: 5% 5%;
}
</style>
