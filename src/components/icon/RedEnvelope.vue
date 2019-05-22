<template functional>
  <svg :width="`${props.width}px`" :height="`${props.width}px`" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <g id="red-pocket" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
      <path d="M12,16 C9.60825,16 7.671,14.336 7.527,12.242 C5.410875,11.943 4.61325,11.321 3,10.034 L3,19.461 C3,20.858 4.366875,22 6.0375,22 L17.9625,22 C19.633125,22 21,20.858 21,19.461 L21,10.034 C19.38675,11.321 18.589125,11.943 16.473,12.242 C16.329,14.336 14.39175,16 12,16" id="Fill-1" fill="currentColor"></path>
      <path d="M17.9623,2 L6.0373,2 C4.366675,2 2.9998,3.143 2.9998,4.539 L2.9998,7.138 C4.1248,9 5.39605,10.116 7.71355,10.844 C8.2738,9.203 9.9703,8 11.9998,8 C14.0293,8 15.7258,9.203 16.28605,10.844 C18.604675,10.116 19.8748,9 20.9998,7.138 L20.9998,4.539 C20.9998,3.143 19.632925,2 17.9623,2" id="Fill-3" fill="currentColor"></path>
      <path d="M14,12 C14,10.897 13.103,10 12,10 C10.897,10 10,10.897 10,12 C10,13.103 10.897,14 12,14 C13.103,14 14,13.103 14,12" id="Fill-6" fill="currentColor"></path>
    </g>
  </svg>
</template>
<script>
export default {
  name: 'RedEnvelopeIcon',
  props: {
    width: {
      type: [String, Number],
      default: 24
    }
  }
}
</script>
