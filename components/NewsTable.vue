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
  // Location of news
  @Prop() location: string;
  // News source
  @Prop() source: string;
  // Page number
  @Prop() index: number;
  currentNews: Array<NewsArticle> = [];
  // current news page num
  pageNum: number = 1;
  // number of articles per page
  limit: number = 4;
  channel: Actioncable.Channel;
  cable: Actioncable.Cable;

  /**
   * Watch source property for any changes
   * if there are any changes, request the new news source and update articles
   */
  @Watch("source")
  changeSource() {
    // clear news
    this.currentNews = [];
    // update news
    this.channel.perform("request_update", {
      location: this.location,
      source: this.source,
    });
  }

  /**
   * create a connection and request updates every 50000ms
   */
  mounted() {
    // connect to the action cable server
    let { cable, channel } = this.$createConnection(this.parseMessage);
    (this.cable = cable), (this.channel = channel);
    // wait two seconds before requesting for update,
    // so we can connect and subscribe
    setTimeout(() => {
      this.channel.perform("request_update", {
        location: this.location,
        source: this.source,
      });
      // set interval to request update every 50000ms
      setInterval(() => {
        this.channel.perform("request_update", {
          location: this.location,
          source: this.source,
        });
      }, 50000);
    }, 2000);
  }

  /**
   * update news with any new news from actioncable server
   * @param {json[]} data
   */
  parseMessage(data) {
    // if there is no news in the table currently, just set the current news as the new news
    if (!this.currentNews.length) {
      this.currentNews = data;
      return;
    }
    // add any new news to the current news
    this.currentNews.unshift(...this.getDifference(data, this.currentNews));
    this.$forceUpdate();
  }

  /**
   * Gets the difference between two arrays
   * @param {Array<NewsArticle>} arr1
   * @param {Array<NewsArticle>} arr2
   * @returns {Array<NewsArticle>}
   */
  getDifference(arr1: Array<NewsArticle>, arr2: Array<NewsArticle>) {
    return arr1.filter((o) => this.indexOfObject(arr2, o) == -1);
  }

  /**
   * @description
   * @param {Array<NewsArticle>} arr
   * @param {Array<NewsArticle>} object: NewsArticle
   * @returns {Number}
   */
  indexOfObject(arr: Array<NewsArticle>, object: NewsArticle) {
    for (let i in arr) if (this.isNewsObjectEqual(arr[i], object)) return i;
    return -1;
  }

  /**
   * Simple check of equality of two articles
   * @param {NewsArticle} o1
   * @param {NewsArticle} o2
   * @returns {boolean}
   */
  isNewsObjectEqual(o1: NewsArticle, o2: NewsArticle) {
    return (
      o1.title === o2.title &&
      o1.description === o2.description &&
      o1.url === o2.url
    );
  }

  /**
   * Increment news page
   */
  incrementPageNumber() {
    if (this.pageNum * this.limit < this.currentNews.length) this.pageNum++;
  }

  /**
   * Decrement news page
   */
  decrementPageNumber() {
    if (this.pageNum > 1) this.pageNum--;
  }

  /**
   * Returns paginated slice of current news
   * @returns {Array<NewsArticles>}
   */
  paginatedNews() {
    return this.currentNews.slice(
      (this.pageNum - 1) * this.limit,
      this.pageNum * this.limit
    );
  }

  /**
   * Destructor for table
   */
  deleteTable() {
    // Emit deleteNewsTableEvent
    this.$root.$emit("deleteNewsTable", this.index);
    // Disconnect from action cable server
    this.cable.disconnect();
    // Destroy component
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
