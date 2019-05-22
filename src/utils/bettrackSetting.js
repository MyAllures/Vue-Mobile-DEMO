import gameType from './gameType'

const ssSeries = gameType['ssSeries']
const racingSeries = gameType['racingSeries']

export function hasBettrack (code) {
  return ssSeries.includes(code) || racingSeries.includes(code)
}
