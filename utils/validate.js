import moment from 'moment'

/**
 * 校验手机号
 */
export const isPhone = phone => {
  return /^1[0-9]{10}$/.test(phone)
}
/**
 * 只能输入0 或非零开头的数字
 */
export const isInteger = value => {
  return /^(0|[1-9][0-9]*)$/.test(value)
}
/**
 * 校验金额
 */
export const isMoney = value => {
  return /(^[1-9]([0-9]+)?(\.[0-9]{1,4})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/.test(value)
}
/**
 * 验证小数2位
 */
export const isDouDecimal = value => {
  return /^(\d|[1-9]\d|100)(\.\d{1,2})?$/.test(value)
}
/**
 * 邮箱
 */
export const email = value => {
  return /[\w!#$%&'*+/=?^_`{|}~-]+(?:\.[\w!#$%&'*+/=?^_`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?/.test(value)
}
/**
 * 非0正整数
 */
export const isEcpInteger = value => {
  return /^\+?[1-9][0-9]*$/.test(value)
}
/**
 * 格式化时间
 */
export const formatDate = (value, pattern) => {
  pattern = pattern || 'YYYY-MM-DD HH:mm'
  if (!value || value === '') return ''
  return moment(value).format(pattern)
}
/**
 * table表格内数据过滤
 */
export const formatTable = {
  date: (() => {
    return formatDate
  })()
}

/**
 * 校验拼音
 */
export const isSpell = (value) => {
  return /^[A-Za-z]*$/.test(value)
}
