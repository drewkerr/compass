(function() {

  // get session instance if class page
  const hash = window.location.hash.split('/')
  if (hash[0] == '#session') {
    var instanceId = hash[1]
  } else {
    alert('Open a class page first.')
    return
  }

  // toggle if already active
  if (document.querySelector('#presenter')) {
    document.querySelector('#closepresenter').click()
    return
  } else {
    loadPresenter()
  }

  function loadPresenter() {
    // get lesson plan document
    const iframe = document.querySelector('#lesson-plan-panel iframe')

    // override scrolling behaviour
    function toggleScroll(a, b) {
      document.querySelector('html').style.overflowY = a
      iframe.contentWindow.document.querySelector('html').style.overflowY = b
    }
    toggleScroll('hidden', 'scroll')

    // scale lesson plan iframe
    const scale = screen.width / iframe.getBoundingClientRect().width

    iframe.contentWindow.document.querySelector('body')
      .insertAdjacentHTML('beforeend',
        `<div id="presenter"><style type="text/css">
        body {
          width: calc(${100/scale}vw - 40px);
          transform: scale(${scale});
          transform-origin: top left;
        }
        </style></div>`)

    // resize iframe container
    const presenter = document.createElement('div')
    presenter.setAttribute('id', 'presenter')
    document.body.appendChild(presenter)

    presenter.insertAdjacentHTML('beforeend',
      `<style type="text/css">
      #lesson-plan-panel iframe {
        position: fixed;
        top: 0;
        left: 0;
        height: 100vh !important;
        width: 100vw !important;
        overscroll-behavior: contain;
        z-index: 1000;
      }
      .button {
        position: fixed;
        right: 32px;
        height: 32px;
        font-size: 32px;
        opacity: 0.3;
        transition: opacity 0.5s;
        z-index: 2000;
        filter: grayscale(100%);
      }
      .button:hover {
        opacity: 1;
      }
      #closepresenter {
        top: 32px;
      }
      #randomstudent {
        top: 96px;
      }
      #announce {
        top: 160px;
      }
      #timer {
        top: 224px;
      }
      #progress {
        position: fixed;
        bottom: 0;
        left: 0;
        background-color: #06c;
        height: 1em;
        width: 0;
        z-index: 2000;
      }
      </style>`)

    // button to close presenter view
    let close = document.createElement('div')
    close.textContent = '❌'
    close.classList.add('button')
    close.setAttribute('id', 'closepresenter')
    close.setAttribute('title', 'Close')
    close.addEventListener('click', function() {
      toggleScroll('scroll', 'hidden')
      presenter.remove()
      iframe.contentWindow.document.querySelector('#presenter').remove()
    })
    presenter.appendChild(close)

    // button to show the name of a random student
    let rando = document.createElement('div')
    rando.textContent = '🧑‍🎓'
    rando.classList.add('button')
    rando.setAttribute('id', 'randomstudent')
    rando.setAttribute('title', 'Random Student')
    rando.addEventListener('click', function() {
      fullscreen(students[student])
      student = student == students.length ? 0 : student + 1 // loop array
    })
    presenter.appendChild(rando)

    // button to show some text fullscreen
    let announce = document.createElement('div')
    announce.textContent = '📢'
    announce.classList.add('button')
    announce.setAttribute('id', 'announce')
    announce.setAttribute('title', 'Show announcement fullscreen')
    announce.addEventListener('click', function() {
      fullscreen(window.prompt("Announcement:"))
    })
    presenter.appendChild(announce)
    
    // button to set a countdown timer
    let timer = document.createElement('div')
    timer.textContent = '⏲️'
    timer.classList.add('button')
    timer.setAttribute('id', 'timer')
    timer.setAttribute('title', 'Set a countdown timer')
    timer.addEventListener('click', function() {
      if (timerInterval) {
        clearInterval(timerInterval)
        timerInterval = false
        timer.textContent = '⏲️'
      } else {
        let minutes = window.prompt("Start a timer for how many minutes?")
        minutes = parseFloat(minutes)
        if (minutes > 0) {
          let now = new Date()
          let finish = new Date(now.getTime() + minutes * 60 * 1000)
          startTimer(finish)
        }
      }
    })
    presenter.appendChild(timer)

    // lesson progress bar
    let progress = document.createElement('div')
    progress.setAttribute('id', 'progress')
    presenter.appendChild(progress)
  }

  // display text fullscreen
  function fullscreen(content) {
    const div = document.createElement('div')
    div.style.position = 'fixed'
    div.style.top = '0'
    div.style.left = '0'
    div.style.width = '100vw'
    div.style.height = '100vh'
    div.style.backgroundColor = 'rgba(0, 0, 0, 0.8)'
    div.style.display = 'flex'
    div.style.alignItems = 'center'
    div.style.justifyContent = 'center'
    div.style.zIndex = '9999'
    const p = document.createElement('p')
    p.textContent = content
    p.style.color = 'white'
    p.style.fontSize = '5rem'
    p.style.fontWeight = 'bold'
    div.appendChild(p)
    document.body.appendChild(div)
    div.addEventListener('click', () => {
      document.body.removeChild(div);
    })
  }

  var timerInterval
  function startTimer(finish) {
    let timer = document.querySelector('#timer')
    const tick = () => {
      let now = new Date()
      if (now < finish) {
        let current = (finish - now) / 1000
        let minutes = Math.floor(current / 60)
        let seconds = Math.round(current % 60).toString().padStart(2, '0')
        timer.textContent = `${minutes}:${seconds}`
      } else {
        clearInterval(timerInterval)
        timer.textContent = '⏲️'
        fullscreen("Timer finished")
      }
    }
    timerInterval = setInterval(tick, 1000)
  }

  // get class roll, filter by attendance and shuffle
  let student = 0
  let students
  getRoll(instanceId)

  async function getRoll(instanceId) {
    const res = await fetch("/Services/Attendance.svc/GetRollPackage",{
      body: JSON.stringify({instanceId: instanceId}),
      headers: {'Content-Type':'application/json'},
      method:'POST'})
    const roll = await res.json()
    students = roll.d.data.rollData
      .filter(student => student.s == 1)
      .map(student => student.n)
    students = await shuffle(students)
  }

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      // [array[i], array[j]] = [array[j], array[i]] doesn't work with async??
      const a = array[i]
      const b = array[j]
      array[i] = b
      array[j] = a
    }
    return array
  }
  
  // get today's schedule and add a lesson timer
  getSchedule(instanceId)
  
  async function getSchedule(instanceId) {
    const activityId = instanceId.slice(0,-12)
    const yyyy = instanceId.slice(-8, -4)
    const mm = instanceId.slice(-10, -8)
    const dd = instanceId.slice(-12, -10)
    const date = `${yyyy}-${mm}-${dd}`
    const res = await fetch("/Services/Calendar.svc/GetCalendarEventsByActivity",{
      body: JSON.stringify({
        homePage: false,
        activityId: activityId,
        locationId: null,
        staffIds: null,
        startDate: date,
        endDate: date,
        page:1, start:0, limit:25}),
      headers: {'Content-Type':'application/json'},
      method:'POST'})
    const schedule = await res.json()
    let activity = schedule.d.find(a => a.instanceId == instanceId)
    let interval
    const tick = () => {
      let now = new Date()
      let start = new Date(activity.start)
      let finish = new Date(activity.finish)
      if (now > start && now < finish) {
        let duration = (finish - start) / 60 / 1000
        let elapsed = (now - start) / 60 / 1000
        let percent = elapsed / duration * 100
        document.querySelector('#progress').style.width = `${percent}%`
      } else {
        document.querySelector('#progress').style.width = 0
        clearInterval(interval)
      }
    }
    if (activity) {
      interval = setInterval(tick, 1000)
    }
  }

})()