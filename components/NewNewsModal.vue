<template>
  <div>
    <!--Modal-->
    <div
      class="modal fixed w-full h-full top-0 left-0 flex items-center justify-center"
      :class="{ 'opacity-0 pointer-events-none': !active }"
    >
      <div
        class="modal-overlay absolute w-full h-full bg-gray-900 opacity-50"
        @click="toggleModal"
      ></div>

      <div
        class="inline-block align-bottom bg-white rounded-lg text-center overflow-hidden shadow-xl transform transition-all my-8 max-w-lg w-full"
      >
        <div class="modal-content py-4 text-center px-6">
          <h1 class="text-2xl">Add a City</h1>
          <div class="relative">
            <div class="pt-2 relative text-gray-600">
              <input
                class="border-2 border-gray-300 bg-white h-10 px-5 pr-32 rounded-lg text-sm focus:outline-none"
                type="search"
                placeholder="Search City"
                v-on:keyup.enter="addCity"
                v-model="location"
              />
              <button
                type="submit"
                class="absolute right-0 top-0 mt-5 sm:mr-24 mr-12"
                @click="addCity"
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
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from "nuxt-property-decorator";
@Component
export default class NewNewsModal extends Vue {
  active: boolean = false;
  location: string = "";

  mounted() {
    this.$root.$on("toggleNewsModal", this.toggleModal);
  }

  toggleModal() {
    this.active = !this.active;
  }

  addCity() {
    this.toggleModal();
    this.$root.$emit("addCityNewsFeed", this.location);
  }
}
</script>

<style>
.modal {
  z-index: 10;
  transition: opacity 0.25s ease;
}
body.modal-active {
  overflow-x: hidden;
  overflow-y: visible !important;
}
</style>
