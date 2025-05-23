let names = []
let current = 0
let secondsPerPerson = 0
let interval = null
let remaining = 0

function startDaily() {
  const total = parseInt(document.getElementById('duration').value, 10)
  names = document.getElementById('names').value
    .split('\n')
    .map(n => n.trim())
    .filter(n => n.length)
  if (names.length === 0) return

  secondsPerPerson = Math.floor((total * 60) / names.length)
  current = 0
  remaining = secondsPerPerson

  document.getElementById('daily').classList.remove('hidden')
  updateUI()
  runTimer()
}

function runTimer() {
  clearInterval(interval)
  interval = setInterval(() => {
    remaining--
    updateTimer()
    if (remaining <= 0) next()
  }, 1000)
}

function updateTimer() {
  const min = String(Math.floor(remaining / 60)).padStart(2, '0')
  const sec = String(remaining % 60).padStart(2, '0')
  document.getElementById('countdown').textContent = `${min}:${sec}`
}

function updateUI() {
  document.getElementById('currentName').textContent = names[current]
  remaining = secondsPerPerson
  updateTimer()
}

function next() {
  current++
  if (current >= names.length) {
    clearInterval(interval)
    document.getElementById('currentName').textContent = 'Fim da daily!'
    document.getElementById('countdown').textContent = ''
  } else {
    updateUI()
    runTimer()
  }
}

function skip() {
  next()
}
