# dukku ready template 2 for Nuxt3 + ContentCMS+auth + Vue3 + Typescript + JSX + Pug + Less( + Sass)

## CMS Functions

[Explained in CMS-Readme.md](CMS-Readme.md)

## add SASS/SCSS
Open the terminal and
- `cd app`
- `npm i sass`
and you can use `<script lang="sass">` or "scss"

## adding any module
Open the terminal and
- `cd app`
- `npm i anymodule`

## deployment to Dokku
Check the commands in the `package.json` here.
- fix the config 
- check the commands
    - add your ssh ssl-certificate
        - local:createSshKey
        - dokku:addLocalUserSsh
    - initialize
        - dokku:link
        - dokku:create-app
        - dokku:create-bindings
    - push to servr
        - dokku:push
        
## Dokku NodeJS-Heroku-Buildpack related
- https://nuxtjs.org/deployments/dokku/
- https://nitro.unjs.io/deploy/providers/heroku
- https://devcenter.heroku.com/articles/nodejs-support
