const sscSingleSetting = ['dragon_tiger_1_5', 'ball_than_size_1', 'ball_odd_even_1', 'ball_than_size_2', 'ball_odd_even_2', 'ball_than_size_3', 'ball_odd_even_3', 'ball_than_size_4', 'ball_odd_even_4', 'ball_than_size_5', 'ball_odd_even_5', 'sum_of_ball_than_size', 'sum_of_ball_odd_even']
const racingSingleSetting = ['dragon_tiger_1_10', 'ball_than_size_1', 'ball_odd_even_1', 'dragon_tiger_2_9', 'ball_than_size_2', 'ball_odd_even_2', 'dragon_tiger_3_8', 'ball_than_size_3', 'ball_odd_even_3', 'dragon_tiger_4_7', 'ball_than_size_4', 'ball_odd_even_4', 'dragon_tiger_5_6', 'ball_than_size_5', 'ball_odd_even_5', 'ball_than_size_6', 'ball_odd_even_6', 'ball_than_size_7', 'ball_odd_even_7', 'ball_than_size_8', 'ball_odd_even_8', 'ball_than_size_9', 'ball_odd_even_9', 'ball_than_size_10', 'ball_odd_even_10', 'sum_of_1st_2st_than_size', 'sum_of_1st_2st_odd_even']
const gd11x5SingleSetting = ['dragon_tiger_1_5', 'ball_than_size_1', 'ball_odd_even_1', 'ball_than_size_2', 'ball_odd_even_2', 'ball_than_size_3', 'ball_odd_even_3', 'ball_than_size_4', 'ball_odd_even_4', 'ball_than_size_5', 'ball_odd_even_5', 'sum_of_ball_odd_even', 'sum_of_ball_than_size', 'sum_of_ball_tail_than_size']
const gdklsfSingleSetting = ['ball_of_sum_number_odd_even_1', 'ball_tail_than_size_1', 'dragon_tiger_1_8', 'ball_odd_even_1', 'ball_than_size_1', 'ball_of_sum_number_odd_even_2', 'ball_tail_than_size_2', 'dragon_tiger_2_7', 'ball_odd_even_2', 'ball_than_size_2', 'ball_of_sum_number_odd_even_3', 'ball_tail_than_size_3', 'dragon_tiger_3_6', 'ball_odd_even_3', 'ball_than_size_3', 'ball_of_sum_number_odd_even_4', 'ball_tail_than_size_4', 'dragon_tiger_4_5', 'ball_odd_even_4', 'ball_than_size_4', 'ball_of_sum_number_odd_even_5', 'ball_tail_than_size_5', 'ball_odd_even_5', 'ball_than_size_5', 'ball_of_sum_number_odd_even_6', 'ball_tail_than_size_6', 'ball_odd_even_6', 'ball_than_size_6', 'ball_of_sum_number_odd_even_7', 'ball_tail_than_size_7', 'ball_odd_even_7', 'ball_than_size_7', 'ball_of_sum_number_odd_even_8', 'ball_tail_than_size_8', 'ball_odd_even_8', 'ball_than_size_8', 'sum_of_ball_odd_even', 'sum_of_ball_than_size', 'sum_of_ball_tail_than_size']
const k3SingleSetting = ['sum_of_ball_odd_even', 'sum_of_ball_than_size', 'balls_max_diff_odd_even', 'balls_max_diff_than_size', 'sum_of_ball_tail_odd_even', 'sum_of_ball_tail_than_size']
const kl8SingleSetting = ['balls_front_rear_count_cp', 'sum_of_ball_five_element', 'balls_odd_even_cp', 'sum_of_ball_odd_even', 'sum_of_ball_than_size']
const auluck8SingleSetting = ['sum_of_ball_five_element', 'sum_of_ball_odd_even', 'sum_of_ball_than_size']
const ddSingleSetting = ['sum_of_ball_odd_even', 'sum_of_ball_than_size', 'sum_of_ball_color_wavelength']

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
  gd11x5: gd11x5SingleSetting,
  cqlf: gdklsfSingleSetting,
  gdklsf: gdklsfSingleSetting,
  jsk3: k3SingleSetting,
  msk3: k3SingleSetting,
  bjk3: k3SingleSetting,
  bjkl8: kl8SingleSetting,
  auluck8: auluck8SingleSetting,
  pcdd: ddSingleSetting,
  jnd28: ddSingleSetting,
  luckdd: ddSingleSetting
}

const noSubOptionGames = ['bjkl8', 'auluck8', 'pcdd', 'jnd28', 'luckdd']
export const hasNotSubOption = (code) => {
  return noSubOptionGames.includes(code)
}

const hasJupanRoadGames = ['bcr', 'cs60cr', 'jspk10', 'er75ft', 'mlaft', 'cs600cr', 'jsssc', 'cqssc', 'xjssc', 'tjssc', 'csffc', 'cs10fc', 'cs5fc']
export const hasJupanRoad = (code) => {
  return hasJupanRoadGames.includes(code)
}

const seriesSSC = ['jsssc', 'cqssc', 'xjssc', 'tjssc', 'csffc', 'cs10fc', 'cs5fc']
export const isSeriesSSC = (code) => {
  return seriesSSC.includes(code)
}