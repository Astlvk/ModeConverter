<style>
  .headHeight {
    height: 70px;
  }
</style>

<template>
  <div class="container text-center">
    <div id="head" class="line-small headHeight">
      <h1>Web数字谱转调器</h1>
    </div>
      <converter></converter>
    <div id="foot">
      不明所以的页脚
    </div>
  </div>
</template>

<script>
  import converter from './converter'
  export default {
    components: {
      converter,
    }
  }
</script>
