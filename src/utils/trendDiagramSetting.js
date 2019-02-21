const racingSingleSetting = [{
  type: 'position',
  displayName: '位置',
  tabs: ['冠', '亚', '季', '四', '五', '六', '七', '八', '九', '十'],
  cumulationNames: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
  cumulationType: '号码'
},
{
  type: 'number',
  displayName: '号码',
  tabs: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
  cumulationNames: ['冠', '亚', '季', '四', '五', '六', '七', '八', '九', '十'],
  cumulationType: '位置'
}]
const sscSingleSetting = [{
  type: 'position',
  displayName: '位置',
  tabs: ['第一球', '第二球', '第三球', '第四球', '第五球'],
  cumulationNames: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
  cumulationType: '号码'
}]
const ddSingleSetting = [{
  type: 'position',
  displayName: '位置',
  tabs: ['第一球', '第二球', '第三球'],
  cumulationNames: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
  cumulationType: '号码'
}]
export const settings = {
  bcr: racingSingleSetting,
  cs60cr: racingSingleSetting,
  jspk10: racingSingleSetting,
  er75ft: racingSingleSetting,
  mlaft: racingSingleSetting,
  cs600cr: racingSingleSetting,
  jsssc: sscSingleSetting,
  cqssc: sscSingleSetting,
  xjssc: sscSingleSetting,
  tjssc: sscSingleSetting,
  csffc: sscSingleSetting,
  cs10fc: sscSingleSetting,
  cs5fc: sscSingleSetting,
  pcdd: ddSingleSetting,
  jnd28: ddSingleSetting,
  luckdd: ddSingleSetting
}

const hasTrendDiagramGames = ['bcr', 'cs60cr', 'jspk10', 'er75ft', 'mlaft', 'cs600cr', 'jsssc', 'cqssc', 'xjssc', 'tjssc', 'csffc', 'cs10fc', 'cs5fc']
export const hasTrendDiagram = (code) => {
  return hasTrendDiagramGames.includes(code)
}
