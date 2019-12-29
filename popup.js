require('ace/src-min/theme-chrome.js')
var editor = ace.edit("scriptArea");
editor.setTheme("ace/theme/chrome");
editor.session.setMode("ace/mode/javascript");
var editor2 = ace.edit("scriptArea-other");
editor2.setTheme("ace/theme/chrome");
editor2.session.setMode("ace/mode/javascript");

const tabInputField = document.getElementById('tabInputField')
const otherSiteDomainList = document.getElementById('otherSiteDomain')
const saveBtn = document.getElementById('save')
const saveBtnOther = document.getElementById('save-other')
const deleteBtn = document.getElementById('delete')
const deleteBtnOther = document.getElementById('delete-other')

function getData(key, type='sync') {
  return new Promise((resolve) => {
    chrome.storage[type].get([key], function(result) {
      resolve(result ? (result.hasOwnProperty(key) ? result[key] : {}) : {})
    })
  })
}

function getCurrentTab() {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, resolve)
  })
}

async function populateFields() {
  const currentTab = await getCurrentTab()
  console.log('currentTab', currentTab[0])
  const tabDomain = /^http(?:s)?\:\/\/(.*?)(?:\/|$)/.exec(currentTab[0].url)
  console.log('tabDomain: ', tabDomain)
  tabInputField.value = tabDomain ? tabDomain[1] : 'null'
  console.log('tabInputField.value', tabInputField.value)
  const scripts = await getData('scripts')
  console.log('scripts', scripts)
  if(scripts[tabInputField.value]) {
    editor.setValue(scripts[tabInputField.value])
  }
}

otherSiteDomainList.addEventListener('change', (evt) => {
  handleViewDomain(evt.target.value)
  chrome.storage.local.set({selector: evt.target.value})
})

function selectDomain(domain) {
  const query = '#otherSiteDomain [value="' + domain + '"]'
  const targetDomainOption = document.querySelector(query)
  if(targetDomainOption) {
    targetDomainOption.selected = true
  }
  handleViewDomain(domain)
}

async function handleViewDomain(domain) {
  const scripts = await getData('scripts')
  if(scripts.hasOwnProperty(domain)) {
    editor2.setValue(scripts[domain])
  }
}

async function Initialization() {
  populateFields()
  Array.from(otherSiteDomainList.children).forEach(child => {
    otherSiteDomainList.removeChild(child)
  })
  defaultOption = document.createElement('option')
  defaultOption.setAttribute('selected', '')
  defaultOption.setAttribute('disabled', '')
  defaultOption.setAttribute('value', 'null')
  defaultOption.innerText = 'Select domain'
  otherSiteDomainList.appendChild(defaultOption)

  const scripts = await getData('scripts')
  for(const domain in scripts) {
    const selectOption = document.createElement('option')
    selectOption.setAttribute('value', domain)
    selectOption.innerText = domain
    otherSiteDomainList.appendChild(selectOption)
  }
  handleViewDomain(otherSiteDomainList.value)

  const selectedDomain = await getData('selector', 'local')
  selectDomain(selectedDomain)
}
Initialization()


saveBtn.addEventListener('click', async (evt) => {
  evt.preventDefault()
  const scripts = await getData('scripts')
  chrome.storage.sync.set({scripts: {
    ...scripts,
    [tabInputField.value]: editor.getValue()
  }})
  Initialization()
})

saveBtnOther.addEventListener('click', async (evt) => {
  evt.preventDefault()
  const scripts = await getData('scripts')
  chrome.storage.sync.set({scripts: {
    ...scripts,
    [otherSiteDomainList.value]: editor2.getValue()
  }})
  Initialization()
})

// TODO:
// When deleting a domain from the script-other section, if script-current-tab
// section is also on same domain it doesn't delete.
//
// Need some sort of pub-sub model or some other pattern to have multiple
// events fired on deletion etc. Need each script section to be "reactive"
// to state changes...   sounds familiar ;-)

deleteBtn.addEventListener('click', async (evt) => {
  evt.preventDefault()
  const scripts = await getData('scripts')
  const domain = tabInputField.value
  const selectedDomain = await getData('selector', 'local')
  if(domain === selectedDomain) {
    chrome.storage.local.set({selector: 'null'})
  }
  delete scripts[domain]
  chrome.storage.sync.set({scripts})
  if(Object.keys(scripts).length > 0) {
    domain = Object.keys(scripts)[0]
    editor.setValue(scripts[doinnerText])
  }
  Initialization()
})

deleteBtnOther.addEventListener('click', async (evt) => {
  evt.preventDefault()
  const scripts = await getData('scripts')
  const domain = otherSiteDomainList.value
  const selectedDomain = await getData('selector', 'local')
  if(domain === selectedDomain) {
    chrome.storage.local.set({selector: 'null'})
  }
  delete scripts[domain]
  chrome.storage.sync.set({scripts})
  if(Object.keys(scripts).length > 0) {
    otherSiteDomainList.value = Object.keys(scripts)[0]
    editor2.setValue(scripts[domain])
  } else {
    selectDomain('null')
    editor2.setValue('')
  }
  Initialization()
})
