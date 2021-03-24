<template>
  <div class="relative pt-1">
    <p class="py-4">{{ name }}</p>
    <div class="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
      <div
        :style="{ width: `${percentage}%` }"
        class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gray-500"
      ></div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "nuxt-property-decorator";
@Component
export default class CrimePercentageBar extends Vue {
  @Prop() name: string;
  @Prop() percentage: number;
}
</script>
