<template lang="pug">
div
  p Session usage
  button(@click="updateSession1") update session data: {{sessionObj?.session?.test}} / {{val?.test}}
  button(@click="updateSession2") update session data again
  
  hr
  button(@click="getSession3") checks: get session id + data
  button(@click="resetSession4") reset() session
  pre(ref="result")
</template>

<script lang="tsx">
export default defineComponent({
  data() {
    return {
      sessionObj: null as any,
      val: null as any,
    };
  },

  async mounted() {
    // https://nuxt.com/modules/session
    let sessionObj = await useSession();

    this.sessionObj = sessionObj;
    this.val = sessionObj.session;
  },

  methods: {
    async updateSession1() {
      // must update with an object
      await this.sessionObj.update({ test: 123 });
    },
    async updateSession2() {
      // must update with an object
      await this.sessionObj.update({ test: 456 });
    },

    addResult(obj: any) {
      (this.$refs.result as HTMLPreElement).innerText +=
        JSON.stringify(obj, null, 3) + "\n";
    },
    addResultBlock(title: string = "") {
      (this.$refs.result as HTMLPreElement).innerText +=
        "-".repeat(5) + " " + title + " " + "-".repeat(5) + "\n";
    },
    async getSession3() {
      this.addResultBlock("get session data");

      // must update with an object
      let x = await useFetch("/api/foo");
      console.log("/api/foo", x.data.value);
      this.addResult(x.data.value);

      x = await useFetch("/api/foo");
      console.log("/api/foo", x.data.value);
      this.addResult(x.data.value);

      let y = await useFetch("/api/session");
      console.log("/api/session 1", y.data.value);
      this.addResult(y.data.value);

      y = await useFetch("/api/session");
      console.log("/api/session 2", y.data.value);
      this.addResult(y.data.value);
    },

    async resetSession4() {
      await this.sessionObj?.reset();
      await this.getSession3();
    },
  },
});
</script>

<style lang="less" scoped>
div {
  border: 1px solid gray;
  padding: 0.5em 1em;
}
</style>
