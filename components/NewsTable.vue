<template>
  <div
    class="bg-white border-2 border-gray-300 p-3 rounded-md tracking-wide shadow-lg news-table"
  >
    <h1 class="table-title">Live news in London</h1>
    <div v-for="news, i in currentNews" :key="i">
        <news-article :title="news.title" :description="news.description" :url="news.url"></news-article>
    </div>
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
}8
</script>

<style>
.news-table {
  text-align: center;
  margin: 5% 5%;
  max-width: 40vw;
}

.table-title {
  font-weight: 700;
  justify-self: center;
}
</style>
