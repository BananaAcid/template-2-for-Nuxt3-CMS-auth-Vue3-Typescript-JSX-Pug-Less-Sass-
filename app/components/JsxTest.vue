<template lang="pug">

div
    button(@click="sayHi" ref="btn") say hi using JSX
    pre(ref="out") &gt;
</template>

<script lang="tsx">
import { render } from "vue"; // for jsx

export default defineComponent({
  data() {
    return {
      n: <div>did say hi</div>,
    };
  },

  methods: {
    sayHi() {
      (this.$refs.out as HTMLDivElement).innerText = ""; // clear
      render(this.n, this.$refs.out as HTMLDivElement); // append

      (this.$refs.btn as HTMLButtonElement).disabled = true;
    },
  },
});
</script>
