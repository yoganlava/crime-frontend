<template>
  <div>
    <input
      v-model="address"
      v-on:keyup.enter="onClickClear"
      class="border-2 border-gray-300 bg-white h-10 px-5 pr-16 rounded-lg text-sm focus:outline-none"
      type="search"
      placeholder="Search address"
      v-debounce:150ms.cancelonempty.lock="autocomplete"
    />
    <button
      type="submit"
      class="absolute right-0 top-0 mt-5 mr-4"
      @click="onClickClear"
    >
      <svg
        class="text-gray-600 h-4 w-4 fill-current"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        version="1.1"
        id="Capa_1"
        x="0px"
        y="0px"
        viewBox="0 0 16 16"
        style="enable-background: new 0 0 16 16"
        xml:space="preserve"
      >
        <path
          fill-rule="evenodd"
          d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
          clip-rule="evenodd"
        />
      </svg>
    </button>
    <div
      class="absolute w-full z-50 bg-white border border-gray-300 mt-1 mh-48 overflow-hidden overflow-y-scroll rounded-md shadow-md"
      v-if="suggestions.length"
    >
      <ul class="py-1">
        <li
          v-for="(suggestion, i) in suggestions"
          :key="i"
          class="px-3 py-2 cursor-pointer hover:bg-gray-200"
          @click="onSuggestionClick(suggestion)"
        >
          <p v-html="highlightSuggestionTitle(suggestion)"></p>
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "nuxt-property-decorator";

@Component
export default class FloatingSearch extends Vue {
  @Prop() onClick: (address) => void;
  address: string = "";
  suggestions = [];

  async autocomplete() {
    let res = await this.$http.$get(
      `/api/autocomplete?q=${this.address.replaceAll(" ", "+")}`
    );
    this.suggestions = res.items;
  }

  highlightSuggestionTitle(suggestion) {
    let string = suggestion.address.label;
    for (let highlight of suggestion.highlights.address.label) {
      string = this.insertInto(
        this.insertInto(string, highlight.start, "<b>"),
        highlight.end + 3,
        "</b>"
      );
    }
    return string;
  }

  onClickClear() {
    this.suggestions = [];
    this.onClick(this.address);
    this.address = "";
  }

  onSuggestionClick(suggestion) {
    this.address = suggestion.address.label;
    this.onClick(this.address);
    this.suggestions = [];
  }

  insertInto(string: string, index: number, value: string) {
    return string.substr(0, index) + value + string.substr(index);
  }
}
</script>