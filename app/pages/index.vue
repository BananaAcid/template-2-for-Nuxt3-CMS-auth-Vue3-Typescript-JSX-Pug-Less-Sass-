<template lang="pug">
main
  section
    p
      b hi
      br
      NuxtLink(to="/two")
        | to page Two


    CmsTest
    
    JsxTest 
      
    //-SessionTests
</template>

<script lang="ts"></script>

<style lang="less" scoped>
section {
  > div {
    border: 1px solid gray;
    padding: 0.5em 1em;
    margin: 1em 0;
  }
}
</style>
