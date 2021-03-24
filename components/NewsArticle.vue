<template>
  <a
    :href="url"
  >
    <div class="news-article-container my-3 dark:border-gray-500 dark:hover:bg-gray-700">
      <h1 class="news-title py-1">
        {{title}}
      </h1>
      <p>
        {{description}}
      </p>
    </div>
  </a>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "nuxt-property-decorator";

@Component
export default class NewsArticle extends Vue {
    @Prop() title: string
    @Prop() description: string
    @Prop() url: string
}
</script>

<style>
.news-article-container {
  text-align: initial;
  border: 1px solid #dadce0;
  border-radius: 8px;
  padding: 10px;
}

.news-article-container:hover {
  background: rgb(250, 250, 250);
}

.news-title {
  font-weight: 400;
  line-height: 25px;
}
</style>
