<template>
  <div class="suggest-box" v-click-outside="dropDownClose">
    <div class="suggest-text"></div>
    <form class="suggest-form">
      <div class="suggest-field" v-html="props?.customData.labelText"></div>
      <div class="suggest-input">
        <input
            type="text"
            class="text"
            v-model="data.message"
            @click="dropDownOpen"
            @keypress="keydown()"
            :placeholder="props?.customData.placeholder"
            aria-describedby="suggest-warning"
            aria-errormessage="suggest-warning"
            :aria-placeholder="props?.customData.ariaPlaceholder"
            v-if="data.chip.length<1"
        >
        <div class="chips-keeper" v-if="data.chip.length>0" @click="dropDownOpen">
          <div
              class="chips-item"
              v-for="(item, index) in data.chip"
              :key="index"
          >
            {{item}}
            <span class="chips-remove" @click="chipDelete(item)" aria-hidden="true">
              <svg viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 13L13 1M1 1L13 13" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
          </div>
        </div>

        <div
            id="suggest-warning"
            class="suggest-warning"
            v-show="data.warning"
            aria-live="assertive"
        >
          {{props.customData.tips}}
        </div>
        <div
            class="suggest-warning"
            v-show="data.errorFetch"
            aria-live="assertive"
        >
          {{data.errorFetch}}
        </div>
        <div
            class="suggest-warning"
            v-show="data.limitChip"
            aria-live="assertive"
            v-if="props.multiselectable.value>1"
        >
          {{props.multiselectable.text}}
        </div>
      </div>
    </form>
    <div class="suggest-drop" v-if="data.dropOpen">
      <div class="drop-items">
        <DropItems :items="data.dropItems" @chooseItem="alias=>choiseItem(alias)" :apiField="props.apiField"/>
      </div>
    </div>
  </div>

</template>

<script setup lang="ts">
  import { reactive, watch, defineProps } from 'vue'
  import DropItems from './DropItems.vue'

  const props = defineProps({
    multiselectable: {
      enabled: {
        type: Boolean,
        default: false,
      },
      text: {
        type: String,
        default: "Максимальный лимит для выбора превышен",
      },
      value:{
        type: Number,
        default: 1,
      }
    },
    api: {
      type: String,
      default: 'https://habr.com/kek/v2/publication/suggest-mention?q=',
    },
    apiField: {
      avatar: {
        type: String,
        default: 'avatar'
      },
      type: {
        type: String,
        default: 'type'
      },
      name: {
        type: String,
        default: 'name'
      },
      alias: {
        type: String,
        default: 'alias'
      }
    },
    customData: {
      placeholder: {
        type: String,
        default: 'Введите логин'
      },
      labelText: {
        type: String,
        default: '<span>*</span>Пользователь или компания'
      },
      ariaPlaceholder: {
        type: String,
        default: 'Введите свой логин используя только цифры и буквы латинского алфавита'
      },
      tips: {
        type: String,
        default: 'Разрешены только цифры и латинские буквы'
      }
    }
  });

  const data = reactive({
    warning: false,
    errorFetch: '',
    message: '',
    rawMessage: '',
    dropOpen: false,
    chip: [],
    limitChip: false,
    dropItems: [] as ResponseData[],
    check: null as null | unknown
  })

  interface ResponseData {
    id: number;
    name: string;
  }

  const dropDownOpen = (): void =>{
    data.dropOpen = true
  }
  const dropDownClose = (): void =>{
    data.dropOpen = false
  }
  const chipDelete = (i:string): void =>{
    let index = data.chip.indexOf(i)
    if (index !== -1) {
      data.chip.splice(index, 1);
    }
  }

  const handleError = (status: number, statusText: string) => {
    switch (status) {
      case 400:
        data.errorFetch = 'Серверная ошибка. Данные переданы неверно';
        throw new Error(`Серверная ошибка. Статус ответа: ${status}. Ошибка: ${statusText}`);
      case 500:
        data.errorFetch = 'Серверная ошибка. Целостность работы сервера нарушена';
        throw new Error(`Серверная ошибка. Статус ответа: ${status}. Ошибка: Unknown error`);
      default:
        throw new Error(`Серверная ошибка. Статус ответа: ${status}. Ошибка: Unknown error`);
    }
  };

  let abortController: AbortController = new AbortController();

  const debounce = <F extends (...args: any[]) => void>(func: F, delay: number): F => {
    let timeoutId: ReturnType<typeof setTimeout>;
    return function(this: ThisParameterType<F>, ...args: Parameters<F>) {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        func.apply(this, args);
      }, delay);
    } as F;
  };

  const fetchSearch = async (search: string): Promise<ResponseData[] | void> => {
    if (abortController) {
      abortController.abort();
    }
    abortController = new AbortController();
    try {
      const response = await fetch(props.api+search, {
        method: 'GET'
      });

      if (!response.ok) {
        handleError(response.status, response.statusText);
      }

      data.errorFetch = '';
      const responseData: ResponseData[] = await response.json();

      if (!responseData || !Array.isArray(responseData.data)) {
        data.errorFetch = 'Ответ от сервера неверный'
        throw new Error('Ответ от сервера неверный');
      }

      return responseData;
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        data.errorFetch = 'Запрос отменен';
      } else if(error instanceof Error){
        handleError(error.status, error.message);
      } else {
        console.error(error);
      }
    }
  };

   const debouncedFetchSearch = debounce((search: string) => {
    fetchSearch(search).then(searchResult => {
      if (searchResult) {
        data.dropItems = searchResult.data;
      }
    }).catch(error => {
      console.error('Error fetching search:', error);
    });
  }, 300);

  const choiseItem = (alias:string) => {
    if(!props.multiselectable){
      data.chip = []
    }
    if(data.chip.length<props.multiselectable.value){
      let index = data.chip.indexOf(alias)
      if (index == -1) {
        data.chip.push(alias)
      }
    } else {
      if(data.limitChip == false){
        data.limitChip = true;
        setTimeout(()=>{
          data.limitChip = false;
        },1500)
      }
    }
  }

  const keydown = (evt: KeyboardEvent): void => {
    evt = evt ? evt : window.event;
    if (evt.key.match(/^[a-zA-Z0-9]+$/)) {
      data.warning = false;
      if (evt.key === 'Backspace') {
        data.rawMessage = data.rawMessage.slice(0, -1);
      } else {
        if (evt.key.length < 2 && data.rawMessage.length <= 8) {
          data.rawMessage += evt.key.replace(/[^a-zA-Z0-9]/g, '');
        }
      }
    } else {
      data.warning = true;
    }
  };

  watch(() => data.message, function() {
    if (data.message.length < 12) {
      data.check = null;
    }
    let val = data.message.replace(/\s/g, "");
    if (data.rawMessage !== val) {
      if (data.rawMessage.length >= val.length) {
        data.message = data.rawMessage;
      } else {
        data.message = data.message.slice(0, -1);
      }
    }
    if (data.message.length > 2) {
      debouncedFetchSearch(data.message);
    }
  });

  watch(() => data.rawMessage, function () {
    let val = data.message.replace(/\s/g, "");
    if (data.rawMessage !== val) {
      if (data.rawMessage.length >= val.length) {
        data.message = data.rawMessage;
      } else {
        data.message = data.message.slice(0, -1);
      }
    }
  });

</script>

<style scoped>
.suggest-box{
  position: relative;
  display: flex;
  flex-direction: column;
}
.suggest-drop{
  position: relative;
  top: 18px;
  left: 0;
  background-color: #f9f9f9;
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.1), 0 6px 20px 0 rgba(0, 0, 0, 0.1);
  min-width: 200px;
  max-height: 208px;
  overflow: hidden;
  overflow-y: scroll;
  -ms-overflow-style: none;
  scrollbar-width: thin;
  scroll-behavior: smooth;
  overscroll-behavior: contain;
  scroll-snap-type: x mandatory;
  & > * {
    scroll-snap-align: start;
  }
}

.drop-items{
  max-height: 208px;
}
.chips-keeper{
  width: 100%;
  max-width: 100%;
  display: flex;
  flex-wrap: wrap;
  min-height: 40px;
  padding: 5px 10px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.1), 0 6px 20px 0 rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
  gap: 5px;
    &:hover{
      border: none;
      outline: none;
      box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.15), 0 6px 20px 0 rgba(0, 0, 0, 0.15);
    }
    &:focus{
      border: none;
      outline: none;
      box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.15), 0 6px 20px 0 rgba(0, 0, 0, 0.15);
    }
}
.suggest-input{
  display: flex;
  position: relative;
  width: 200px;
  input{
    flex: 1;
    border: none;
    width: 100%;
    height: 40px;
    padding: 5px 10px;
    color: #1a1a1a;
    background-color: #fff;
    border-radius: 4px;
    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.1), 0 6px 20px 0 rgba(0, 0, 0, 0.1);
    margin-left: 0;
    margin-right: auto;
    transition: box-shadow 0.3s ease;
    &:hover{
      border: none;
      outline: none;
      box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.15), 0 6px 20px 0 rgba(0, 0, 0, 0.15);
    }
    &:focus{
      border: none;
      outline: none;
      box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.15), 0 6px 20px 0 rgba(0, 0, 0, 0.15);
    }
  }
}
.suggest-field{
  font-weight: bold;
  margin-bottom: 5px;
  text-align: left;
}
.chips-item{
  padding: 5px 10px;
  background-color: #629fbc;
  border-radius: 5px;
  color: #fff;
  font-weight: bold;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.chips-remove{
  margin-left: 10px;
  cursor: pointer;
  svg{
    width: 8px;
    height: 8px;
    transform: translateY(-1px);
  }
}
.suggest-warning{
  position: absolute;
  bottom: -20px;
  left: 10px;
  color: red;
  font-size: 12px;
}
@media screen and (min-width:1024px) {
  .suggest-input{
    width: 500px;
    max-width: 500px;
  }
  .suggest-drop{
    width: 500px;
    max-width: 500px;
  }
  .drop-items {
    max-height: 166px;
  }
}
</style>
