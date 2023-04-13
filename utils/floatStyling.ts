export const floatStyling = (value: number) => {
  const returnValue = value
    .toFixed(2)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  if (returnValue === '0.00') {
    return '---'
  }
  return returnValue
}

export const intToString = (value: number) => {
  const suffixes = ['', 'k', 'm', 'b', 't']
  const suffixNum = Math.floor(('' + value).length / 3)
  let shortValue: any = parseFloat((suffixNum != 0 ? value / Math.pow(1000, suffixNum) : value).toPrecision(2))
  if (value > 999) {
    shortValue = shortValue.toFixed(1)
  }
  return shortValue + suffixes[suffixNum]
}
