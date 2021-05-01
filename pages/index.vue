<template>
  <div class="app-body">
    <new-news-modal></new-news-modal>
    <floating-search></floating-search>
    <map-container :ip="ip"></map-container>
    <analytics-counter
      :title="'Daily Website Visits'"
      :url="'/api/statistics/get_visit_count'"
    ></analytics-counter>
    <div class="break"></div>
    <div class="news">
      <div class="news-header">
        <h1 class="news-title">Live news</h1>
        <button
          class="bg-gray-300 hover:bg-gray-400 dark:text-gray-300 dark:bg-gray-800 text-gray-800 dark:hover:bg-gray-700 font-bold py-2 px-4 rounded inline-flex items-center ml-2"
          @click="openNewsModal"
        >
          <svg
            class="fill-current w-6 h-6 mr-2"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
              clip-rule="evenodd"
            />
          </svg>
          <span>Add City</span>
        </button>
      </div>
      <div
        class="news-table-container"
        v-for="(news, i) in newsTables"
        :key="news.uid"
      >
        <news-table
          :location="news.location"
          :source="news.source"
          :index="i"
        ></news-table>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from "nuxt-property-decorator";
import { ipData } from "~/store";

interface NewsTable {
  location: string;
  source: string;
  uid: string;
}

@Component
export default class Index extends Vue {
  newsTables: Array<NewsTable> = [
    // TODO REPLACE WITH USERS CITY LATER
  ];
  ip: string = "8.8.8.8";
  // Get real ip from x-forwarded-for header due to heroku tunneling res through proxy
  async asyncData({ req }) {
    if (req == undefined) return;
    return {
      ip: req.headers["x-forwarded-for"]
        ? req.headers["x-forwarded-for"]
        : "8.8.8.8",
    };
  }

  async mounted() {
    await this.$http.$get("/api/statistics/log_visit");
    this.$root.$on("addCityNewsFeed", this.addCityNewsFeed);
    this.$root.$on("deleteNewsTable", this.deleteNewsTable);
    if (Object.keys(ipData.data).length == 0)
      await ipData.setData(await this.$http.$get(`/external/ip/${this.ip}`));

    let city = ipData.data.city;
    this.newsTables.push({
      location: city,
      source: "google",
      uid: this.randomUID(),
    });
  }

  openNewsModal() {
    this.$root.$emit("toggleNewsModal");
  }

  addCityNewsFeed(location: string) {
    this.newsTables.push({
      location: location,
      source: "google",
      uid: this.randomUID(),
    });
  }

  randomUID() {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }

  deleteNewsTable(index: number) {
    this.$delete(this.newsTables, index);
    this.$forceUpdate();
  }
}
</script>

<style>
.app-body {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.news-table-container,
.news {
  justify-content: center;
  display: block;
}

.news-title {
  font-weight: 700;
  font-size: 24px;
}

.news-header {
  justify-content: center;
  flex-basis: 100%;
  display: flex;
}

.counter {
  display: block;
  justify-content: center;
}
</style>
