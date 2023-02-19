<template lang="pug">
main
    Teleport(to="#mainNav")
        li.extraNavItem: a(@click="doLogout" href) logout
        
    div.info(v-if="!(keepAliveData?.isAuthenticated)")
        p You have been logged out.
        NuxtLink(to="/cms/login") login
        
    div(v-if="(keepAliveData?.isAuthenticated) && !navigation") loading ...
    
    section(v-if="navigation")
        header CMS Dashboard
        
        aside
            header: b Nav
            div(v-for="item in navigation")
                div.btn(@click="getContent(item)" :rel="item.id" v-if="item.type == 'file'") {{item.name}}
                div(v-if="item.type == 'dir'")  / {{item.name}}
        
        article
            header
                b Content:
                | 
                span {{item?.name}}
            
            p(v-if="!fileContent") &lt;-- load a file
            pre(contenteditable ref="fc" v-if="fileContent") {{fileContent}}
            div(v-if="fileContent")
                button(@click="save") save
                
            p.error(v-if="validateMsg") {{validateMsg}}
            
            details(closed)
                summary Details of fetching navigation
                pre {{navigation}}
            
</template>

<script lang="ts">
/**
 * License: ISC Nabil Redmann 2023
 */

export default defineComponent({
  data() {
    return {
      navigation: null as unknown as object,
      fileContent: "",
      item: null as any,
      validateMsg: "",
      keepAliveData: undefined as any,

      timer: {
        navigation: undefined as unknown as number,
        keepAlive: undefined as unknown as number,
      },
    };
  },

  async mounted() {
    let { data, refresh } = await useFetch("/cms/api/content/navigation");

    console.log("data", data);

    this.navigation = data;

    /* does only really make sense, if the server does not chache forever */
    this.timer.navigation = window.setInterval(async () => {
      refresh();
    }, 5000);

    // ----

    let { data: keepAliveData, refresh: isAuthRefresh } = await useAsyncData(
      () => $fetch("/cms/api/auth/keepAlive")
    );
    this.keepAliveData = keepAliveData;

    this.timer.keepAlive = window.setInterval(async () => {
      isAuthRefresh();
    }, 5000);
  },

  beforeUnmount() {
    window.clearInterval(this.timer.navigation);
    window.clearInterval(this.timer.keepAlive);
  },

  methods: {
    async doLogout() {
      let { data }: { data: any } = await useFetch("/cms/api/logout");

      if (data.success) {
        navigateTo("/");
      }
    },

    async getContent(item: any) {
      console.log("getContent", item);
      let { data, pending, error, refresh } = await useFetch(
        "/cms/api/content/get?id=" + item.id
      );

      console.log("getContent DATA", data);

      this.item = item;
      this.fileContent = data as any;
    },

    async save() {
      let content = (this.$refs.fc as HTMLElement).innerText;

      try {
        this.validateMsg = "";
        if (!content) throw "Must contain content, at least `{}`";
        JSON.parse(content);
      } catch (err: unknown) {
        this.validateMsg = (err as Error).message;
        return;
      }

      let data = await $fetch("/cms/api/content/set?id=" + this.item.id, {
        method: "POST",
        body: content,
      });
    },
  },
});
</script>

<style lang="less" scoped>
main > section {
  margin-top: 2em;
}

.extraNavItem {
  display: inline-block;
  font-style: italic;
}

pre[contenteditable] {
  border: 1px solid gray;
  overflow: auto;
}

.btn {
  text-decoration: underline;
  cursor: pointer;

  &:hover {
    color: blue;
  }
}

section {
  display: grid;
  grid-template-areas:
    "header header"
    "aside article";
  grid-auto-columns: 12em 1fr;
  gap: 1em;

  > header {
    grid-area: header;
  }

  > aside {
    grid-area: aside;

    > header {
      margin-bottom: 1em;
    }
  }

  > article {
    grid-area: article;
    display: grid;
    grid-auto-rows: min-content;
  }
}

.info {
  background: silver;
  padding: 2em;
  margin: 1em;
}

.error {
  color: red;
}

details {
  margin: 2em;
}
</style>
