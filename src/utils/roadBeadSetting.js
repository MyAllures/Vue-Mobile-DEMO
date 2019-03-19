const sscSetting = ['dragon_tiger_1_5', 'ball_than_size_1', 'ball_odd_even_1', 'ball_than_size_2', 'ball_odd_even_2', 'ball_than_size_3', 'ball_odd_even_3', 'ball_than_size_4', 'ball_odd_even_4', 'ball_than_size_5', 'ball_odd_even_5', 'sum_of_ball_than_size', 'sum_of_ball_odd_even']
const racingSetting = ['dragon_tiger_1_10', 'ball_than_size_1', 'ball_odd_even_1', 'dragon_tiger_2_9', 'ball_than_size_2', 'ball_odd_even_2', 'dragon_tiger_3_8', 'ball_than_size_3', 'ball_odd_even_3', 'dragon_tiger_4_7', 'ball_than_size_4', 'ball_odd_even_4', 'dragon_tiger_5_6', 'ball_than_size_5', 'ball_odd_even_5', 'ball_than_size_6', 'ball_odd_even_6', 'ball_than_size_7', 'ball_odd_even_7', 'ball_than_size_8', 'ball_odd_even_8', 'ball_than_size_9', 'ball_odd_even_9', 'ball_than_size_10', 'ball_odd_even_10', 'sum_of_1st_2st_than_size', 'sum_of_1st_2st_odd_even']
const gd11x5Setting = ['dragon_tiger_1_5', 'ball_than_size_1', 'ball_odd_even_1', 'ball_than_size_2', 'ball_odd_even_2', 'ball_than_size_3', 'ball_odd_even_3', 'ball_than_size_4', 'ball_odd_even_4', 'ball_than_size_5', 'ball_odd_even_5', 'sum_of_ball_odd_even', 'sum_of_ball_than_size', 'sum_of_ball_tail_than_size']
const gdklsfSetting = ['ball_of_sum_number_odd_even_1', 'ball_tail_than_size_1', 'dragon_tiger_1_8', 'ball_odd_even_1', 'ball_than_size_1', 'ball_of_sum_number_odd_even_2', 'ball_tail_than_size_2', 'dragon_tiger_2_7', 'ball_odd_even_2', 'ball_than_size_2', 'ball_of_sum_number_odd_even_3', 'ball_tail_than_size_3', 'dragon_tiger_3_6', 'ball_odd_even_3', 'ball_than_size_3', 'ball_of_sum_number_odd_even_4', 'ball_tail_than_size_4', 'dragon_tiger_4_5', 'ball_odd_even_4', 'ball_than_size_4', 'ball_of_sum_number_odd_even_5', 'ball_tail_than_size_5', 'ball_odd_even_5', 'ball_than_size_5', 'ball_of_sum_number_odd_even_6', 'ball_tail_than_size_6', 'ball_odd_even_6', 'ball_than_size_6', 'ball_of_sum_number_odd_even_7', 'ball_tail_than_size_7', 'ball_odd_even_7', 'ball_than_size_7', 'ball_of_sum_number_odd_even_8', 'ball_tail_than_size_8', 'ball_odd_even_8', 'ball_than_size_8', 'sum_of_ball_odd_even', 'sum_of_ball_than_size', 'sum_of_ball_tail_than_size']
const k3Setting = ['sum_of_ball_odd_even', 'sum_of_ball_than_size', 'balls_max_diff_odd_even', 'balls_max_diff_than_size', 'sum_of_ball_tail_odd_even', 'sum_of_ball_tail_than_size']
const kl8Setting = ['balls_front_rear_count_cp', 'sum_of_ball_five_element', 'balls_odd_even_cp', 'sum_of_ball_odd_even', 'sum_of_ball_than_size']
const auluck8Setting = ['sum_of_ball_five_element', 'sum_of_ball_odd_even', 'sum_of_ball_than_size']
const ddSetting = ['sum_of_ball_odd_even', 'sum_of_ball_than_size', 'sum_of_ball_color_wavelength']

export const settings = {
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
  cs5fc: sscSetting,
  gd11x5: gd11x5Setting,
  cqlf: gdklsfSetting,
  gdklsf: gdklsfSetting,
  jsk3: k3Setting,
  msk3: k3Setting,
  bjk3: k3Setting,
  bjkl8: kl8Setting,
  auluck8: auluck8Setting,
  pcdd: ddSetting,
  jnd28: ddSetting,
  luckdd: ddSetting
}

const noSubOptionGames = ['bjkl8', 'auluck8', 'pcdd', 'jnd28', 'luckdd']
export const hasNotSubOption = (code) => {
  return noSubOptionGames.includes(code)
}

const hasMoreRoadGames = ['bcr', 'cs60cr', 'jspk10', 'er75ft', 'mlaft', 'cs600cr', 'jsssc', 'cqssc', 'xjssc', 'tjssc', 'csffc', 'cs10fc', 'cs5fc']
export const hasMoreRoad = (code) => {
  return hasMoreRoadGames.includes(code)
}

const seriesSSC = ['jsssc', 'cqssc', 'xjssc', 'tjssc', 'csffc', 'cs10fc', 'cs5fc']
export const isSeriesSSC = (code) => {
  return seriesSSC.includes(code)
}

const gameHasRoadBead = ['bcr', 'cs60cr', 'jspk10', 'er75ft', 'mlaft', 'cs600cr', 'jsssc', 'cqssc', 'xjssc', 'tjssc', 'csffc', 'cs10fc', 'cs5fc', 'gd11x5', 'cqlf', 'gdklsf', 'jsk3', 'msk3', 'bjk3', 'bjkl8', 'auluck8', 'pcdd', 'jnd28', 'luckdd']

export const hasRoadBead = (code) => {
  return gameHasRoadBead.includes(code)
}
