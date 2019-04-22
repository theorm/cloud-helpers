function shouldReject() {
  return Math.random() < 0.3
}

async function handler(msg, { log }, { attempts }) {
  const rejecting = shouldReject()
  log.info(`Got message: ${msg.toString()}. Rejecting? ${rejecting}`)
  if (rejecting) throw new Error(`Just rejecting (${attempts} attempts)`)
}

module.exports = handler
