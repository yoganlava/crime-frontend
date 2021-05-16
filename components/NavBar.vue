<template>
  <nav class="bg-gray-800">
    <div class="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
      <div class="relative flex items-center justify-between h-16">
        <div class="absolute inset-y-0 left-0 flex items-center sm:hidden">
          <button
            type="button"
            class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            aria-controls="mobile-menu"
            aria-expanded="false"
            v-on:click="toggleMenu"
          >
            <span class="sr-only">Open main menu</span>
            <svg
              class="block h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
            <svg
              class="hidden h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div
          class="flex-1 flex items-center justify-center sm:items-stretch sm:justify-start"
        >
          <div class="flex-shrink-0 flex items-center">
            <h1 class="nav-title">Crime Spotter</h1>
          </div>
          <div class="hidden sm:ml-6 sm:block">
            <div class="flex space-x-4">
              <nuxt-link
                class="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                to="/"
              >
                Home
              </nuxt-link>
              <nuxt-link
                class="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                to="/analytics"
              >
                Analytics
              </nuxt-link>
              <nuxt-link
                class="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                to="/about"
              >
                About
              </nuxt-link>
            </div>
          </div>
        </div>
        <div
          class="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0 hidden sm:block"
        >
          <div
            class="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in"
          >
            <input
              type="checkbox"
              v-model="globalDarkMode"
              name="toggle"
              id="toggle"
              class="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
            />
            <label
              for="toggle"
              class="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"
            ></label>
          </div>
          <label for="toggle" class="text-xs text-gray-300">Dark Mode</label>
        </div>
      </div>
    </div>
    <div
      id="mobile-menu"
      ref="mobile-menu"
      :class="this.openMenu ? 'block' : 'hidden'"
      class="sm:hidden"
    >
      <div class="px-2 pt-2 pb-3 space-y-1">
        <nuxt-link
          class="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
          to="/"
        >
          Home
        </nuxt-link>
        <nuxt-link
          class="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
          to="/analytics"
        >
          Analytics
        </nuxt-link>
        <nuxt-link
          class="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
          to="/about"
        >
          About
        </nuxt-link>
      </div>
    </div>
  </nav>
</template>

<script lang="ts">
import { Vue, Component, Watch } from "nuxt-property-decorator";
@Component
export default class NavBar extends Vue {
  globalDarkMode: boolean = false;
  openMenu: boolean = false;

  @Watch("globalDarkMode")
  toggleDarkMode() {
    this.$root.$emit("triggerDarkMode", this.globalDarkMode);
    document.body.classList.toggle("dark");
    document.documentElement.style["color-scheme"] = this.globalDarkMode
      ? "light dark"
      : "light";
  }

  toggleMenu() {
    this.openMenu = !this.openMenu;
  }
}
</script>


<style lang="postcss">
.dark {
  background-color: black;
}

.toggle-checkbox:checked {
  @apply: right-0 border-green-400;
  right: 0;
  border-color: rgb(66, 66, 66);
}
.toggle-checkbox:checked + .toggle-label {
  @apply: bg-green-400;
  background-color: rgb(66, 66, 66);
}

.nav-title {
  color: white;
  font-weight: 700;
  font-size: 28px;
}
</style>
