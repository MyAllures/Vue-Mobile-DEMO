import Vue from 'vue'

// By default we import all the components.
// Only reserve the components on demand and remove the rest.
// Style is always required.
import {
  /* eslint-disable no-unused-vars */
  Style,
  Picker,
  DatePicker,
  // scroll
  Scroll,
  Input,
  Upload,
  Loading
} from 'cube-ui'

Vue.use(Picker)
Vue.use(DatePicker)
Vue.use(Scroll)
Vue.use(Input)
Vue.use(Upload)
Vue.use(Loading)
