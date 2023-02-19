<template lang="pug">
nav#mainNav
    li: NuxtLink(to="/") Home
    //- "two" => automatically resolves to "/pages/two.vue"
    li: NuxtLink(to="/two") Two
    
    
</template>

<style lang="less" scoped>
nav {
  display: flex;
  gap: 1em;

  li {
    display: inline-block;
  }
}
</style>
