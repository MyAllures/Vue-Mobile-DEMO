import axios from 'axios'
import urls from './urls'

axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded'

export function fetchUser () {
  return axios.get(urls.user)
}
