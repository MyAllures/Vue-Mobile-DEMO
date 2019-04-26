import Vue from 'vue'

// By default we import all the components.
// Only reserve the components on demand and remove the rest.
// Style is always required.
import {
  /* eslint-disable no-unused-vars */
  Style,
  // form
  Checkbox,
  Switch,
  // popup
  Popup,
  Picker,
  DatePicker,
  // scroll
  Scroll,
  Sticky
} from 'cube-ui'

Vue.use(Checkbox)
Vue.use(Switch)
Vue.use(Popup)
Vue.use(Picker)
Vue.use(DatePicker)
Vue.use(Scroll)
Vue.use(Sticky)
