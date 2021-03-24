<template>
  <div
    class="bg-white dark:bg-gray-800 dark:text-gray-300 dark:border-gray-500 border-2 border-gray-300 p-3 rounded-md tracking-wide shadow-lg news-table"
  >
    <h1 class="table-title">Live news in London</h1>
    <div v-for="news, i in paginatedNews()" :key="i">
      <news-article
        :title="news.title"
        :description="news.description"
        :url="news.url"
      ></news-article>
    </div>
    <nav class="relative z-0 inline-flex rounded-md shadow-sm" aria-label="Pagination">
        <a @click="decrementPageNumber" class="dark:text-gray-300 dark:bg-gray-800 relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
          <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
        </a>
        <p class="dark:text-gray-300 dark:bg-gray-800 relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
          {{pageNum}}
        </p>
        <a @click="incrementPageNumber"  class="dark:text-gray-300 dark:bg-gray-800 relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
          <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
          </svg>
        </a>
    </nav>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from "nuxt-property-decorator";

@Component({
  components: {
    NewsArticle: () => import("~/components/NewsArticle.vue")
  }
})
export default class NewsTable extends Vue {
  channels = {
    NewsChannel: {
      received: this.parseMessage
    }
  };
  currentNews: Array<any> = [];
  pageNum: number = 1;
  limit: number = 4;

  mounted() {
    this.$cable.subscribe({
      channel: "NewsChannel"
    });
    setTimeout(() => {
      this.$cable.perform({
        channel: "NewsChannel",
        action: "request_update",
        data: {
          location: "london",
          source: "google"
        }
      });

      setInterval(() => {
        this.$cable.perform({
          channel: "NewsChannel",
          action: "request_update",
          data: {
            location: "london",
            source: "google"
          }
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
    console.log(this.currentNews);

    this.$forceUpdate();
  }

  getDifference(arr1: Array<any>, arr2: Array<any>) {
    return arr1.filter(o => this.indexOfObject(arr2, o) == -1);
  }

  indexOfObject(arr: Array<any>, object: Object) {
    for (let i in arr) if (this.isNewsObjectEqual(arr[i], object)) return i;
    return -1;
  }

  isNewsObjectEqual(o1: any, o2: any) {
    return (
      o1.title === o2.title &&
      o1.description === o2.description &&
      o1.url === o2.url
    );
  }

  incrementPageNumber() {
    if (this.pageNum * this.limit < this.currentNews.length)
      this.pageNum++;
  }

  decrementPageNumber() {
    if (this.pageNum > 1)
      this.pageNum--;
  }

  paginatedNews() {
    return this.currentNews.slice((this.pageNum - 1) * this.limit, this.pageNum * this.limit);
  }
}
8;
</script>

<style>
.news-table {
  text-align: center;
  margin: 5% 5%;
  max-width: 60vw;
  
}

.table-title {
  font-weight: 700;
  justify-self: center;
}
</style>
