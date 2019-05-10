import Vue from 'vue'

// By default we import all the components.
// Only reserve the components on demand and remove the rest.
// Style is always required.
import {
  /* eslint-disable no-unused-vars */
  Style,
  Textarea,
  Picker,
  ActionSheet,
  DatePicker,
  // scroll
  Scroll,
  Input,
  Upload,
  Loading,
  TabBar,
  TabPanels,
  Toast
} from 'cube-ui'

Vue.use(Textarea)
Vue.use(Picker)
Vue.use(ActionSheet)
Vue.use(DatePicker)
Vue.use(Scroll)
Vue.use(Input)
Vue.use(Upload)
Vue.use(Loading)
Vue.use(TabBar)
Vue.use(TabPanels)
Vue.use(Toast)
