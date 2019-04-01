const racingSetting = [{
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
const sscSetting = [{
  type: 'position',
  displayName: '位置',
  tabs: ['第一球', '第二球', '第三球', '第四球', '第五球'],
  cumulationNames: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
  cumulationType: '号码'
}]
const ddSetting = [{
  type: 'position',
  displayName: '位置',
  tabs: ['第一球', '第二球', '第三球'],
  cumulationNames: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
  cumulationType: '号码'
}]
const k3Setting = [{
  type: 'sum',
  displayName: '总和',
  cumulationNames: ['3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18'],
  cumulationType: '总和',
  hotArea: 3
}]

const gd11x5Setting = [{
  type: 'position',
  displayName: '位置',
  tabs: ['第一球', '第二球', '第三球', '第四球', '第五球'],
  cumulationNames: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'],
  cumulationType: '号码'
}]

const gdklsfSetting = [{
  type: 'position',
  displayName: '位置',
  tabs: ['一', '二', '三', '四', '五', '六', '七', '八'],
  cumulationNames: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'],
  cumulationType: '号码'
}]

export const settings = {
  bcr: racingSetting,
  cs60cr: racingSetting,
  jspk10: racingSetting,
  er75ft: racingSetting,
  mlaft: racingSetting,
  cs600cr: racingSetting,
  jsssc: sscSetting,
  cqssc: sscSetting,
  ynssc: sscSetting,
  xjssc: sscSetting,
  tjssc: sscSetting,
  csffc: sscSetting,
  cs10fc: sscSetting,
  cs5fc: sscSetting,
  pcdd: ddSetting,
  jnd28: ddSetting,
  luckdd: ddSetting,
  jsk3: k3Setting,
  msk3: k3Setting,
  bjk3: k3Setting,
  gd11x5: gd11x5Setting,
  gdklsf: gdklsfSetting
}

const hasTrendDiagramGames = ['bcr', 'cs60cr', 'jspk10', 'er75ft', 'mlaft', 'cs600cr', 'jsssc', 'cqssc', 'ynssc', 'xjssc', 'tjssc', 'csffc', 'cs10fc', 'cs5fc', 'pcdd', 'jnd28', 'luckdd', 'jsk3', 'msk3', 'bjk3', 'gd11x5', 'gdklsf']
export const hasTrendDiagram = (code) => {
  return hasTrendDiagramGames.includes(code)
}
