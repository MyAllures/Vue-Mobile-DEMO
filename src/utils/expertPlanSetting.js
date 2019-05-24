const racingSetting = ['冠', '亚', '三', '四', '五', '六', '七', '八', '九', '十']
const sscSetting = ['万', '千', '百', '十', '个']

export const setting = {
  bcr: racingSetting,
  jspk10: racingSetting,
  mlaft: racingSetting,
  jsssc: sscSetting,
  cqssc: sscSetting
}

export const hasExpertPlan = function (code) {
  return !!setting[code]
}
