<template functional>
  <svg :width="`${props.width}px`" :height="`${props.width}px`" viewBox="4 4 16 16" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <!-- Generator: Sketch 49.3 (51167) - http://www.bohemiancoding.com/sketch -->
    <title>icon_filter</title>
    <desc>Created with Sketch.</desc>
    <defs></defs>
    <g id="icon_filter" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <path d="M13.6364955,11.129986 L13.6364955,17.4539688 C13.6364955,17.6753682 13.5002959,17.8715677 13.3034965,17.9567674 C13.2356966,17.9825674 13.1588968,17.9993673 13.091097,17.9993673 C12.9458974,17.9993673 12.8096978,17.9483675 12.7070981,17.8379678 L10.525504,15.6557737 C10.4235043,15.553774 10.3635045,15.4169744 10.3635045,15.2723748 L10.3635045,11.129986 L6.1623159,6.92879747 C6.00031634,6.77519789 5.95771645,6.53639854 6.04291622,6.3317991 C6.12811599,6.13619963 6.32431546,6 6.54571485,6 L17.4542851,6 C17.6756845,6 17.871884,6.13619963 17.9570838,6.3317991 C18.0422835,6.53639854 17.9996837,6.77519789 17.8376841,6.92879747 L13.6364955,11.129986 Z" id="Fill-1" fill="currentColor"></path>
    </g>
  </svg>
</template>
<script>
export default {
  name: 'FilterIcon',
  props: {
    width: {
      type: [String, Number],
      default: 16
    }
  }
}
</script>
