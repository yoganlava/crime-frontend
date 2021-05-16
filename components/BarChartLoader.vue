<template>
  <div class="loader items-center col-span-2">
    <h2>Loading Crime Analytics!</h2>
    <div class="bars">
      <div><div class="loader1"></div></div>
      <div><div class="loader2"></div></div>
      <div><div class="loader3"></div></div>
      <div><div class="loader4"></div></div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from "nuxt-property-decorator";
@Component
export default class BarChartLoader extends Vue {}
</script>

<style lang="scss" scoped>
@mixin keyframes($name) {
  @-webkit-keyframes #{$name} {
    @content;
  }
  @-moz-keyframes #{$name} {
    @content;
  }
  @-ms-keyframes #{$name} {
    @content;
  }
  @keyframes #{$name} {
    @content;
  }
}

@include keyframes(bar) {
  @for $i from 0 through 100 {
    #{$i}% {
      @if $i >= 50 {
        height: 50px * ((100 - $i) / 50) + 1px;
      } @else {
        height: 50px * ($i / 50);
      }
    }
  }
}

@mixin bar {
  height: 50px;
  display: block;
  float: left;
  margin: 0 2px;
  width: 10px;
  animation-timing-function: ease-in-out;
  animation-duration: 2s;
  animation-name: bar;
  animation-iteration-count: infinite;
  height: 50px * 0.4;
}

h2 {
  font-weight: 500;
}

// TODO Better Centering
.loader {
  display: block;
  width: 100%;

  // margin: 0;
  text-align: center;
  align-items: center;
  // position: absolute;
  // left: calc(20%);
  // top: calc(50% - 56px);
  justify-content: center;
  padding-left: 30%;
  padding-right: 30%;
}

.bars {
  // position: absolute;
  // top: 50%;
  // left: 45%;
  margin-left: calc(50% - 30px);
  transform: scaleY(-1);
  // margin-left: 35%;
  margin-top: 50px;
  // padding-left: 37%;
  justify-content: center;
  text-align: center;
  align-items: center;
}

.loader1 {
  @include bar;
  background: #1399d6;
}
.loader2 {
  @include bar;
  animation-delay: -0.4s;
  background: #de2890;
}
.loader3 {
  @include bar;
  animation-delay: -0.8s;
  background: #ff969f;
}
.loader4 {
  @include bar;
  animation-delay: -0.6s;
  background: #2d65c5;
}
</style>
