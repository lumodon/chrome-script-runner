const tabInputField = document.getElementById('tabInputField')
const otherSiteDomainList = document.getElementById('otherSiteDomain')
const scriptArea = document.getElementById('scriptArea')
const scriptAreaOther = document.getElementById('scriptArea-other')
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
    scriptArea.value = scripts[tabInputField.value]
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
    scriptAreaOther.value = scripts[domain]
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
    [tabInputField.value]: scriptArea.value
  }})
  Initialization()
})

saveBtnOther.addEventListener('click', async (evt) => {
  evt.preventDefault()
  const scripts = await getData('scripts')
  chrome.storage.sync.set({scripts: {
    ...scripts,
    [otherSiteDomainList.value]: scriptAreaOther.value
  }})
  Initialization()
})

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
    scriptArea.value = scripts[domain]
  } else {
    tabInputField.value = 'no scripts'
    scriptArea.value = ''
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
    domain = Object.keys(scripts)[0]
    scriptAreaOther.value = scripts[domain]
  } else {
    otherSiteDomainList.value = 'no scripts'
    scriptAreaOther.value = ''
  }
  Initialization()
})
