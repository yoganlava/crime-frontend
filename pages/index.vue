<template>
  <div>
    <div class="app-body">
      <new-news-modal></new-news-modal>
      <floating-search></floating-search>
      <map-container :ip="ip"></map-container>
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
        <div class="news-table-container" v-for="news, i in newsTables" :key="i">
          <news-table :location="news.location" :source="news.source"></news-table>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from "nuxt-property-decorator";

interface NewsTable {
  location: string;
  source: string;
}

@Component({
  components: {
    NavBar: () => import("~/components/NavBar.vue"),
    FloatingSearch: () => import("~/components/FloatingSearch.vue"),
    MapContainer: () => import("~/components/MapContainer.vue"),
    NewsTable: () => import("~/components/NewsTable.vue"),
    NewNewsModal: () => import("~/components/NewNewsModal.vue")
  }
})
export default class Index extends Vue {
  newsTables: Array<NewsTable> = [
    // TODO REPLACE WITH USERS CITY LATER
    {
      location: "London",
      source: "google"
    }
  ];
  ip: string = "8.8.8.8";
  // Get real ip from x-forwarded-for header due to heroku tunneling res through proxy
  async asyncData({ req }) {
    if (req == undefined) return;
    return {
      ip: req.headers["x-forwarded-for"]
        ? req.headers["x-forwarded-for"]
        : "8.8.8.8"
    };
  }

  mounted() {
    this.$root.$on("addCityNewsFeed", this.addCityNewsFeed);
  }

  openNewsModal() {
    this.$root.$emit("toggleNewsModal");
  }

  addCityNewsFeed(location: string) {
    this.newsTables.push({
      location: location,
      source: "google"
    });
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
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
}

.news-title {
  font-weight: 700;
  font-size: 24px;
}

.news-header {
  justify-content: center;
  flex-basis: 100%;
  display: flex;
  margin-top: 2.5%;
}
</style>
