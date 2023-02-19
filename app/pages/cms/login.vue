<template lang="pug">
main
  section
      header login
      
      form(@submit="doLogin")
          input(name="name" placeholder="name")
          br
          input(name="password" placeholder="password")
          br
          span.error(v-if="error") {{error}}
          br
          button(type="submit" ref="buttonSubmit") submit
          
      button(@click="navigateTo('/cms')" :disabled="!isAuthenticated") continue
      pre {{result}}
</template>

<script lang="ts">
/**
 * License: ISC Nabil Redmann 2023
 */

declare type LoginReturnType = { isAuthenticated: boolean; data: {} };
export default defineComponent({
  data() {
    return {
      result: {} as any,
      isAuthenticated: false,
      error: null as string | null,
    };
  },

  methods: {
    async doLogin(event: FormDataEvent) {
      event.preventDefault();

      (this.$refs.buttonSubmit as HTMLButtonElement).disabled = true;

      const formData = new FormData(event.target as HTMLFormElement);
      const formValues = Object.fromEntries(formData.entries());

      /* exposes ref(data) and refresh()
      let { data, refresh, error } = await useFetch("/cms/login", {
        method: "POST",
        body: formValues,
      }); // note, data is ref'ed, use data.value to access content
      */

      // @ts-ignore 2321
      let data: LoginReturnType = await $fetch("/cms/login", {
        method: "POST",
        body: formValues,
      });

      (this.$refs.buttonSubmit as HTMLButtonElement).disabled = false;

      this.isAuthenticated = data.isAuthenticated;

      console.log("A", data.isAuthenticated, data);

      this.result = JSON.stringify(data, null, 2);

      if (this.isAuthenticated) {
        //navigateTo("/cms");
      } else {
        this.error = "Wrong username or password";
        setTimeout(() => (this.error = null), 5000);
      }
    },
  },
});
</script>

<style lang="less" scoped>
main > section {
  margin-top: 2em;
}

.error {
  color: red;
}
</style>
