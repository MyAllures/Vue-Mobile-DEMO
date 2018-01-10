<template>
  <div v-if="queryset.length === 0" class="text-muted">{{resultInfo}}</div>
  <div v-else class="m-l m-r">
    <x-button @click.native="pull(true)" v-if="queryset.length < count" :disabled="busy">
      <spinner v-if="loading" :type="'spiral'" class="vux-spinner-inverse"></spinner>
      <span v-if="!busy">{{$t('profile.more')}}</span>
      <span v-else>正在载入...</span>
    </x-button>
  </div>
</template>

<script>
// to perform a pulling, parent componet need to boardcast 'rebase' event
// once the comopnent is ready, and might trigger 'rebase' everytime needed
import { XButton } from 'vux'
import axios from 'axios'
export default {
  props: {
    limit: {
      default: 10
    },
    queryset: {
      required: true,
      type: Array
    },
    query: {
      required: true,
      type: Object
    },
    extra: {
      default: '',
      type: String
    },
    api: {
      required: true,
      type: String
    }
  },
  data () {
    return {
      _queryset: this.queryset,
      count: 0,
      next: '',
      busy: false,
      loading: '',
      resultInfo: ''
    }
  },
  methods: {
    rebase () {
      this.next = this.buildUrl(this.api, this.extra + '&opt_expand=1&offset=0&limit=' + this.limit)
      this._queryset = []
      this.$emit('updateQueryset', this._queryset)
      this.pull()
    },
    pull (isLoadMore) {
      this.busy = true
      this.resultInfo = '正在载入...'
      axios.get(this.next).then(response => {
        this.$emit('gameLoaded')
        this.busy = false
        this.count = response.count
        if (isLoadMore === true) {
          this._queryset = this._queryset.concat(response.results)
        } else {
          this._queryset = response.results
        }
        this.$emit('updateQueryset', this._queryset)
        if (!this._queryset.length) {
          this.resultInfo = '查无记录'
        } else {
          this.resultInfo = ''
        }
        this.next = response.next
      }, response => {
        if (response.status === 401) {
          this.$router.push('/login?next=' + this.$route.path)
        }
      })
    },
    // build router query string through this.query
    buildUrl (api, defaultQuery) {
      let url = api + (defaultQuery ? ('?' + defaultQuery) : '')
      let params = []
      let query = this.$route.query

      // sync query data with local data
      // this.query = query
      this.$emit('updateQuery', query)

      for (let x in query) {
        if (query[x]) {
          params.push(x + '=' + query[x])
        }
      }
      return url + (defaultQuery ? '&' : '?') + params.join('&')
    },
    // change the route, and then parent component will know and trigger 'created' hook
    submit () {
      let query = Object.assign({}, this.query)
      let queryStr = []
      query['a'] = Math.random()
      for (let x in query) {
        if (query[x] === '') {
          delete query[x]
        } else {
          queryStr.push(`${x}=${query[x]}`)
        }
      }
      this.$router.push(`${this.$route.path}?${queryStr.join('&')}`)
    }
  },
  components: {
    XButton
  }
}
</script>
<style>
.text-muted {
  font-size: 13px;
  text-align: center;
  display: block;
}
</style>
