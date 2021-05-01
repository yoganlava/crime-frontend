<template>
  <div>
    <div class="flex justify-center mt-8 mb-2 flex-wrap">
      <h1
        class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate dark:text-gray-300"
      >
        About
      </h1>
    </div>
    <div class="mx-auto dark:text-gray-300" style="width: 50%">
      <p class="text-center">
        This is a free tool that provides a way to look at crime in different
        locations. This information can be used for a plethora of purposes by
        many people, such as looking at crime rates before visiting a certain
        location as a tourist, home owners looking who want to choose a security
        system for their homes, people moving to a new location, or any one
        else!<br />
        The ease of use also makes it perfect for anyone to quickly look up the
        information they need, such as elderly people.
      </p>
    </div>

    <div class="flex mt-8 mx-auto justify-center" style="width: 50%">
      <h2
        class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xm sm:truncate dark:text-gray-300"
      >
        Features
      </h2>
    </div>

    <div
      class="flex mt-2 mx-auto justify-center dark:text-gray-300"
      style="width: 50%"
    >
      <p>
        <b>Crime Map: </b>Offers data on criminal activity within a given
        location using the provided map.
      </p>
    </div>

    <div
      class="flex mt-2 mx-auto justify-center dark:text-gray-300"
      style="width: 50%"
    >
      <p>
        <b>Live News: </b>this is shown directly to you based on the location
        you enter. This can be found underneath the map.
      </p>
    </div>

    <div
      class="flex mt-2 mx-auto justify-center dark:text-gray-300"
      style="width: 50%"
    >
      <p>
        <b>Analytics: </b>An analytics page is offered to lay out more detailed
        statistics of a specified area.
      </p>
    </div>

    <div class="flex mt-8 mb-2 mx-auto justify-center" style="width: 60%">
      <h2
        class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xm sm:truncate dark:text-gray-300"
      >
        Credits
      </h2>
    </div>
    <div class="flex mx-auto justify-center dark:text-gray-300">
      <ul class="text-center">
        <li>Matthew McLoughlin</li>
        <li>Rafael Koullouros</li>
        <li>Udeshya Gurung</li>
        <li>Theo Sweet</li>
        <li>Connor Nolan</li>
        <li>Blake Fowler</li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from "nuxt-property-decorator";

@Component
export default class Analytics extends Vue {
  async created() {
    await this.$http.$get("/api/statistics/log_visit");
  }
}
</script>
