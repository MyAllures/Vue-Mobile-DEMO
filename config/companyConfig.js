var productionConfig = {
  'hg9q_1': {
    id: 1,
    name: 'cc722',
    seoWebsite: ''
  },
  '75ue_2': {
   id: 2,
   name: 'fh801',
   seoWebsite: 'https://cp031.com/'
 },
  'cg8s_3': {
   id: 3,
   name: 'a59',
   seoWebsite: ''
 },
  '8fn3_4': {
   id: 4,
   name: 'hm7899',
   seoWebsite: ''
 },
  'staging': {
    id: 0,
    name: 'staging',
    seoWebsite: 'https://cp031.com/'
  }
}
if(process.env.NODE_ENV === 'production'){
  module.exports = productionConfig[process.env.company]
} else {
  module.exports = {
    id: 0,
    name: 'staging',
    seoWebsite: 'http://35.244.173.224/'
  }
}

