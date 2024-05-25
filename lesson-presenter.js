(function() {

  // get session instance if class page
  var hash = window.location.hash.split('/')
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
    var iframe = document.querySelector('#lesson-plan-panel iframe')

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
        top: 32px;
        right: 32px;
        height: 32px;
        width: 32px;
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
    let rand = document.createElement('div')
    rand.textContent = '🧑‍🎓'
    rand.classList.add('button')
    rand.setAttribute('id', 'randomstudent')
    rand.setAttribute('title', 'Random Student')
    rand.addEventListener('click', function() {
      fullscreen(students[student])
      student = student == students.length ? 0 : student + 1 // loop array
    })
    presenter.appendChild(rand)
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

  // get class roll, filter by attendance and shuffle
  var student = 0
  var students
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
  
})()