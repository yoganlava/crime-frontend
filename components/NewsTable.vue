<template>
  <div
    class="bg-white dark:bg-gray-800 dark:text-gray-300 dark:border-gray-500 border-2 border-gray-300 p-3 rounded-md tracking-wide shadow-lg news-table flex flex-col justify-center"
  >
    <div class="grid-cols-2 sm:grid-cols-4">
      <div
        class="modal-close cursor-pointer z-50 float-right"
        @click="deleteTable"
      >
        <svg
          class="fill-current text-black"
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 18 18"
        >
          <path
            d="M14.53 4.53l-1.06-1.06L9 7.94 4.53 3.47 3.47 4.53 7.94 9l-4.47 4.47 1.06 1.06L9 10.06l4.47 4.47 1.06-1.06L10.06 9z"
          ></path>
        </svg>
      </div>
      <h1 class="table-title text-2xl">Live news in {{ location }}</h1>
      <div v-if="currentNews.length" class="sm:grid-cols-2">
        <label class="dark:text-gray-300">Website:</label>
        <select
          class="bg-white border border-gray-300 rounded-md shadow-sm sm:text-sm dark:bg-gray-800 dark:text-gray-300"
          v-model="source"
        >
          <option value="google">Google</option>
          <option value="independent">The Independent</option>
          <option value="guardian">The Guardian</option>
        </select>
      </div>
    </div>
    <div v-if="this.currentNews.length == 0" class="flex justify-center">
      <spinning-loader></spinning-loader>
    </div>
    <div v-else class="items-center">
      <div v-for="(news, i) in paginatedNews()" :key="i">
        <news-article
          :title="news.title"
          :description="news.description"
          :url="news.url"
        ></news-article>
      </div>
      <nav class="z-0 inline-flex rounded-md shadow-sm" aria-label="Pagination">
        <a
          @click="decrementPageNumber"
          class="dark:text-gray-300 dark:bg-gray-800 inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
        >
          <svg
            class="h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fill-rule="evenodd"
              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
              clip-rule="evenodd"
            />
          </svg>
        </a>
        <p
          class="dark:text-gray-300 dark:bg-gray-800 inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
        >
          {{ pageNum }}
        </p>
        <a
          @click="incrementPageNumber"
          class="dark:text-gray-300 dark:bg-gray-800 inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
        >
          <svg
            class="h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fill-rule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clip-rule="evenodd"
            />
          </svg>
        </a>
      </nav>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from "nuxt-property-decorator";
import Actioncable from "actioncable";

interface NewsArticle {
  title: string;
  description: string;
  url: string;
}

@Component({
  components: {
    NewsArticle: () => import("~/components/NewsArticle.vue"),
  },
})
export default class NewsTable extends Vue {
  @Prop() location: string;
  @Prop() source: string;
  @Prop() index: number;
  currentNews: Array<NewsArticle> = [];
  pageNum: number = 1;
  limit: number = 4;
  channel: Actioncable.Channel;
  cable: Actioncable.Cable;

  @Watch("source")
  changeSource() {
    this.currentNews = [];
    this.channel.perform("request_update", {
      location: this.location,
      source: this.source,
    });
  }

  mounted() {
    let { cable, channel } = this.$createConnection(this.parseMessage);
    (this.cable = cable), (this.channel = channel);
    setTimeout(() => {
      this.channel.perform("request_update", {
        location: this.location,
        source: this.source,
      });

      setInterval(() => {
        this.channel.perform("request_update", {
          location: this.location,
          source: this.source,
        });
      }, 50000);
    }, 2000);
  }

  parseMessage(data) {
    if (!this.currentNews.length) {
      this.currentNews = data;
      return;
    }
    this.currentNews.unshift(...this.getDifference(data, this.currentNews));
    this.$forceUpdate();
  }

  getDifference(arr1: Array<NewsArticle>, arr2: Array<NewsArticle>) {
    return arr1.filter((o) => this.indexOfObject(arr2, o) == -1);
  }

  indexOfObject(arr: Array<NewsArticle>, object: NewsArticle) {
    for (let i in arr) if (this.isNewsObjectEqual(arr[i], object)) return i;
    return -1;
  }

  isNewsObjectEqual(o1: NewsArticle, o2: NewsArticle) {
    return (
      o1.title === o2.title &&
      o1.description === o2.description &&
      o1.url === o2.url
    );
  }

  incrementPageNumber() {
    if (this.pageNum * this.limit < this.currentNews.length) this.pageNum++;
  }

  decrementPageNumber() {
    if (this.pageNum > 1) this.pageNum--;
  }

  paginatedNews() {
    return this.currentNews.slice(
      (this.pageNum - 1) * this.limit,
      this.pageNum * this.limit
    );
  }

  deleteTable() {
    // Destructor Stuff
    this.$root.$emit("deleteNewsTable", this.index);
    this.cable.disconnect();
    this.$destroy();
  }
}
8;
</script>

<style>
.news-table {
  text-align: center;
  margin: 5% 20%;
}

@media only screen and (max-width: 800px) {
  .news-table {
    margin: 5% 5%;
  }
}

.table-title {
  font-weight: 700;
  justify-self: center;
}
</style>
