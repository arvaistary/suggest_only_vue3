<template>
  <Suggest
      :api="Api"
      :customData="CustomData"
      :apiField="CustomApiFieldName"
      :multiselectable="Multiselectable"
  />
</template>

<script setup lang="ts">
import Suggest from './components/Suggest.vue'
const Api = 'https://habr.com/kek/v2/publication/suggest-mention?q='
const CustomData = {
  labelText: '<span>*</span>Пользователь или компания',
  placeholder:'Введите логин',
  ariaPlaceholder:'Введите свой логин используя только цифры и буквы латинского алфавита',
  tips:'Разрешены только цифры и латинские буквы'
}
const CustomApiFieldName = {
  avatar: 'avatar',
  type:'type',
  name:'name',
  alias:'alias'
}
const Multiselectable = {
  enabled: true,
  text:'Превышено максимально допустимое значение выбранных данных',
  value:1
}
</script>

<style>
.suggest-field{
  span{
    color: red;
    position: relative;
    top: -0.25em;
    margin-right: 5px;
  }
}
</style>
