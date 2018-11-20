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
  'h9339': {
    id: 0,
    name: 'h9339',
    seoWebsite: 'https://cp031.com/'
  },
  'staging': {
    id: 0,
    name: 'staging',
    seoWebsite: 'https://cp031.com/'
  }
}

module.exports = productionConfig[process.env.company]||{}

