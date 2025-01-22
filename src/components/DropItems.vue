<template>
  <ul
      class="drop-list-items"
  >
    <li
      v-for="(item, index) in props.items"
      :key="index"
      :data-test="index"
      :data-test2="index"
      @click="chooseItem('@'+item[apiField.alias])"
      @keydown="handleKeydown($event)"
      class="drop-item"
      :class="{ 'active': index === data.activeItemIndex }"
      tabindex="0"
      :aria-label="'@'+item[apiField.alias]"
      :aria-selected="index === data.activeItemIndex"
      role="listitem"
    >
      <div class="drop-item_img">
        <img :src="item[apiField.avatar]" alt="" v-if="item[apiField.avatar]">
        <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C14.1217 2 16.1566 2.84285 17.6569 4.34315C19.1571 5.84344 20 7.87827 20 10V22L15.081 21L12.001 22L9.009 21L4 22V10C4 7.87827 4.84285 5.84344 6.34315 4.34315C7.84344 2.84285 9.87827 2 12 2V2ZM18 10C18 8.4087 17.3679 6.88258 16.2426 5.75736C15.1174 4.63214 13.5913 4 12 4C10.4087 4 8.88258 4.63214 7.75736 5.75736C6.63214 6.88258 6 8.4087 6 10V19.561L9.138 18.935L12.009 19.895L14.964 18.935L18 19.553V10ZM9.5 12C9.10218 12 8.72064 11.842 8.43934 11.5607C8.15804 11.2794 8 10.8978 8 10.5C8 10.1022 8.15804 9.72064 8.43934 9.43934C8.72064 9.15804 9.10218 9 9.5 9C9.89782 9 10.2794 9.15804 10.5607 9.43934C10.842 9.72064 11 10.1022 11 10.5C11 10.8978 10.842 11.2794 10.5607 11.5607C10.2794 11.842 9.89782 12 9.5 12ZM14.5 12C14.1022 12 13.7206 11.842 13.4393 11.5607C13.158 11.2794 13 10.8978 13 10.5C13 10.1022 13.158 9.72064 13.4393 9.43934C13.7206 9.15804 14.1022 9 14.5 9C14.8978 9 15.2794 9.15804 15.5607 9.43934C15.842 9.72064 16 10.1022 16 10.5C16 10.8978 15.842 11.2794 15.5607 11.5607C15.2794 11.842 14.8978 12 14.5 12Z" fill="#21272A" />
        </svg>
      </div>
      <template v-if="item[apiField.type]=='user'">
        <div class="drop-item_text">
          <div class="drop-item_name" v-if="item[apiField.name]">
            <p v-html="item[apiField.name]"></p>
          </div>
          <div class="drop-item_label" v-if="item[apiField.alias]">
            <p v-html="'@'+item[apiField.alias]"></p>
          </div>
        </div>
      </template>
      <template v-if="item[apiField.type]=='company'">
        <div class="drop-item_text">
          <div class="drop-item_name" v-if="item[apiField.name]">
            <p v-html="item[apiField.name]"></p>
          </div>
          <div class="drop-item_label" v-if="item[apiField.alias]">
            <p v-html="'@'+item[apiField.alias]"></p>
          </div>
          <div class="drop-item_company">
            <p>Компания</p>
          </div>
        </div>
      </template>
    </li>
  </ul>

</template>

<script setup lang="ts">
import { reactive, defineEmits, defineProps, withDefaults } from 'vue'

const emit = defineEmits(['chooseItem'])

const data = reactive({
    activeItemIndex: 0,
  })

type Item = {
  alias: string;
}

type ApiField = {
  avatar: string;
  type: string;
  name: string;
  alias: string;
}

type Props = {
  items: Item[];
  apiField: ApiField;
}

const props = withDefaults(defineProps<Props>(), {
  items: () => [] as Item[]
});
const defaultApiField: ApiField = {
  avatar: 'avatar',
  type: 'type',
  name: 'name',
  alias: 'alias'
};
const apiField = reactive({
  ...defaultApiField,
  ...props.apiField
});

const chooseItem = (alias: string) => {
  emit('chooseItem', alias)
  data.activeItemIndex = props.items.findIndex(item => '@'+item[apiField.alias] === alias)
}

const handleKeydown = (evt: KeyboardEvent): void => {
  console.log('keydown')
  evt = evt ? evt : window.event;
  switch (evt.key) {
    case 'ArrowUp':
      if (data.activeItemIndex > 0) {
        data.activeItemIndex--
      }
      break;
    case 'ArrowDown':
      if (data.activeItemIndex < props.items.length - 1) {
        data.activeItemIndex++
      }
      break;
    case 'Enter':
        if (props.items.length > 0) {
          chooseItem('@' + props.items[data.activeItemIndex].alias)
        }
      break;
    default:
      break
  }
}

</script>


<style scoped>
.drop-item{
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  color: #1a1a1a;
  background-color: #fff;
  transition: background-color 0.3s ease;
  cursor: pointer;
  padding: 5px;
}
.drop-item:hover{
  background-color: #e7e7e7;
}
.drop-item_img{
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  max-width: 30px;
  margin-right: 5px;
  img{
    width: 100%;
    object-fit: cover;
  }

}
.drop-item_text{
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.drop-item_label{
  p{
    margin: 0;
    padding: 0;
    text-align: left;
    font-size: 14px;
    opacity: 0.9;
  }
}
.drop-item_name{
  font-weight: bold;
  margin: 0;
  p{
    margin: 0;
    padding: 0;
    text-align: left;
    font-size: 14px;
  }
}
.drop-item_company{
  margin: 0;
  p{
    margin: 0;
    padding: 0;
    text-align: left;
    font-size: 14px;
    opacity: 0.9;
  }
}
.drop-item{
  outline: none;
  &:focus{
    outline: none;
  }
}
.drop-list-items{
  margin: 0;
  padding: 0;
  list-style: none;
}
.active{
  background-color: #e4f6ff;
}
@media screen and (min-width:1024px) {
  .drop-item_text{
    flex-direction: row;
  }
  .drop-item_name{
    flex: 1;
    max-width: 40%;
  }
  .drop-item_label{
    flex: 1;
    max-width: 40%;
  }

}

</style>
