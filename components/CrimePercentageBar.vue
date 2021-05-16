<template>
  <div class="relative pt-1">
    <p class="py-4">{{ name }}: {{ current }}</p>
    <div class="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
      <div
        :style="{ width: `${(current / total) * 100}%` }"
        class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gray-500"
      ></div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "nuxt-property-decorator";
@Component
export default class CrimePercentageBar extends Vue {
  // Name of the progress bar
  @Prop() name: string;
  // Current number of crime
  @Prop() current: number;
  // Total number of crimes
  @Prop() total: number;
}
</script>
