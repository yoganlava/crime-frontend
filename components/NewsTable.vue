<template>
  <div
    class="max-w-sm bg-white border-2 border-gray-300 p-3 rounded-md tracking-wide shadow-lg news-table"
  >
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
export default class NewsTable extends Vue {}
</script>#

<style>
.news-table {
    margin: 5% 5%;
}
</style>
