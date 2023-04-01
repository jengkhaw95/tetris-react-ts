export const uuid = (length = 6) => {
  return Math.random()
    .toString(16)
    .slice(2, 2 + length)
}
