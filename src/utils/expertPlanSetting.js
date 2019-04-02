const racingSetting = ['冠', '亚', '三', '四', '五', '六', '七', '八', '九', '十']
const sscSetting = ['万', '千', '百', '十', '个']

export const setting = {
  bcr: racingSetting,
  cs60cr: racingSetting,
  jspk10: racingSetting,
  er75ft: racingSetting,
  mlaft: racingSetting,
  cs600cr: racingSetting,
  jsssc: sscSetting,
  cqssc: sscSetting,
  xjssc: sscSetting,
  tjssc: sscSetting,
  csffc: sscSetting,
  cs10fc: sscSetting,
  cs5fc: sscSetting
}

export const hasExpertPlan = function (code) {
  return !!setting[code]
}
