chrome.runtime.onMessage.addListener(function(message, callback) {
  const messages = {
    hello: () => {
      sendResponse({payload: 'Welcome!'})
    },
    end: shutDown,
  }
  if(messages.hasOwnProperty(message)) {
    messages[message]()
  } else {
    console.log('Message not valid option')
  }
  if(callback) {
    callback('test param')
  } else {
    console.log('No callback provided')
  }
})

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status == 'complete') {
    console.log('tab: ', tab, '\ntabId: ', tabId)
    runScriptForSite(tab)
      .then(script => {
        if(script) {
          chrome.tabs.executeScript(tabId, {
            code: script
          }, (...args) => {
            console.log('callback from execution: ', args)
          })
        }
      })
  }
})

chrome.runtime.onSuspend.addListener(function() {
  shutdown()
})

function shutDown() {
  chrome.runtime.Port.disconnect()
}

function getData(key) {
  return new Promise((resolve) => {
    chrome.storage.sync.get([key], function(result) {
      resolve(result[key])
    })
  })
}

async function runScriptForSite(tab) {
  // TODO - only load script for needed url
  const scripts = await getData('scripts')

  console.log('scripts: ', scripts)
  console.log('taburl: ', tab.url)
  const tabDomain = /^http(?:s)?\:\/\/(.*?)(?:\/|$)/.exec(tab.url)
  const workingDomain = tabDomain ? tabDomain[1] : null
  console.log(workingDomain)
  if(scripts && scripts.hasOwnProperty(workingDomain)) {
    return scripts[workingDomain]
  }
  return null
}
