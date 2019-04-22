async function measureTime(fn, label, print) {
  const hrstart = process.hrtime()
  const onEnd = () => {
    const hrend = process.hrtime(hrstart)
    const ms = (hrend[0] * 1000) + (hrend[1] / 1e6)
    if (print) {
      print(`⏱: "${label}" took ${ms.toFixed(2)} ms.`)
    }
  }
  return fn()
    .then(x => {
      onEnd()
      return x
    })
    .catch(e => {
      onEnd()
      throw e
    })
}

module.exports = { measureTime }
