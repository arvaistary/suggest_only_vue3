import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
const app = createApp(App)

app.directive("click-outside", {
   beforeMount: function (element, binding) {
        console.log({
            element,
            binding
        });

        //  check that click was outside the el and his children
        element.clickOutsideEvent = function (event:MouseEvent) {
            // and if it did, call method provided in attribute value
            if (!(element === event.target || element.contains(event.target))) {
                binding.value(event);
            }
        };
        document.body.addEventListener('click', element.clickOutsideEvent)
    },
    unmounted: function (element) {
        document.body.removeEventListener('click', element.clickOutsideEvent)
    }
});

app.mount('#app')


