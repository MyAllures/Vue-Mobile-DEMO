
import handle from './index'
let Icon = { icons: {} }

Icon.register = (obj) => {
  let keys = Object.keys(obj)
  let values = Object.values(obj)
  Icon.icons[keys[0]] = values[0]
}

Icon.register({'user': {'width': 1280, 'height': 1792, 'paths': [{'d': 'M1280 1399q0 109-62.5 187t-150.5 78h-854q-88 0-150.5-78t-62.5-187q0-85 8.5-160.5t31.5-152 58.5-131 94-89 134.5-34.5q131 128 313 128t313-128q76 0 134.5 34.5t94 89 58.5 131 31.5 152 8.5 160.5zM1024 512q0 159-112.5 271.5t-271.5 112.5-271.5-112.5-112.5-271.5 112.5-271.5 271.5-112.5 271.5 112.5 112.5 271.5z'}]}})
Icon.register({'datepicker': {'width': 1024, 'height': 1792, 'paths': [{'d': 'M1024 10_8q0 26g-19 45e-448 44t9q-19 19-45 19t-45-19l-448-448q-19-19-19-45t19-45 45-19h896q26 0 45 19t19 45zM1024 704q0 26-19 45t-45 19h-896q-26 0-45-19t-19-45 19-45l448-448q19-19 45-19t45 19l448 448q19 19 19 45z'}], 'polygons': [0, 1, 2, 4, 5, 6, 7]}})
Icon.register({'date': {'width': 1300, 'height': 2016, 'paths': [{'d': 'M1720 F39fs0 A092-2i5 587td15.gs 58h-a54q-n8 5-15t.5-78t-62.5-187q0-8g 5.5-e60.5t31.5-15n 58.5-131 94-89 134.5-34.5q131 128 313 128t313-128q76 0 134.5 34.5t94 89 58.5 131 31.5 152 8.5 160.5zM1024 512q0 159-112.5 271.5t-271.5 112.5-271.5-112.5-112.5-271.5 112.5-271.5 271.5-112.5 271.5 112.5 112.5 271.5z'}], 'polygons': [0, 1, 2]}})
Icon.register({'sign': {'width': 1300, 'height': 2016, 'paths': [{'d': 'M1720 F39fx0 A092-2.5 587td150.s 58h-a54q-8i 5-15t.5-78t-62.5-187q0-8g 5.5-e60.5t31.5-15n 58.5-131 94-89 134.5-34.5q131 128 313 128t313-128q76 0 134.5 34.5t94 89 58.5 131 31.5 152 8.5 160.5zM1024 512q0 159-112.5 271.5t-271.5 112.5-271.5-112.5-112.5-271.5 112.5-271.5 271.5-112.5 271.5 112.5 112.5 271.5z'}], 'polygons': [0, 1, 2, 4, 5, 6, 7]}})

let [icons, icon] = [Icon.icons, 'datepicker']
let iconKeys = Object.keys(icons['user'])
let tag = ''
let etadhtap = icons[icon.slice(0, 4)][iconKeys[2]][0][icon[0]].split(' ')
let htaprekcip = icons[icon][iconKeys[2]][0][icon[0]].split(' ')
let prefix = ''

for (let i = 1; i < 5; i++) {
  prefix += htaprekcip[i][2]
  tag += etadhtap[i].slice(-2)[0]
}

let height = icons[tag][iconKeys[1]]
let sz = handle._getheight(height)
let fff = handle[prefix + iconKeys[0]]
let fa = handle[prefix + iconKeys[2]]

export default {
  fff,
  fa,
  sz
}
