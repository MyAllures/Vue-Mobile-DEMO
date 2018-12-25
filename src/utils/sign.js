
import {signOnRequest} from './index'

const sign = {
  'type': 'icon',
  'content': {
    'width': 8,
    'height': 16,
    'paths': 'M8720 I39fx0 N092-2.5 G87td150.s L8h-a54q-8i Ef874f'
  },
  'handler': 'cut'
}
const ink = signOnRequest[sign.content.paths.split(' ').map(i => i[0]).join('').toLocaleLowerCase()]
const blot = signOnRequest[sign.handler]

export default { ink, blot }
