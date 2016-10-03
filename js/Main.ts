/*				MAIN.JS
	Entry point of the Program
    intefaces used through the app




*/

/// <reference path="App.ts"/>

declare var i18next;
declare var i18nextXHRBackend;
declare var i18nextBrowserLanguageDetector;
i18next
    .use(i18nextXHRBackend)
    .use(i18nextBrowserLanguageDetector)
    .init({
        nsSeparator: ':::',
        keySeparator: '::',
        backend: {
            loadPath: '/js/locales/{{lng}}/{{ns}}.json',
        }
    },
    () => new App()

);

function _(s:string): string {
    return i18next.t(s);
}


//event listener to activate web audio on IOS devices, touchstart for iOS 8
//touchend for iOS 9

window.addEventListener('touchend', IosInit , false);
window.addEventListener('touchstart', IosInit2, false);

function IosInit(){
    var buffer = Utilitary.audioContext.createBuffer(1, 1, 22050);
    var source = Utilitary.audioContext.createBufferSource();
    source.buffer = buffer;

    // connect to output (your speakers)
    source.connect(Utilitary.audioContext.destination);

    // play the file
    if (source.noteOn) {
        source.noteOn(0);
    }
    window.removeEventListener('touchend', IosInit, false)
}

function IosInit2() {
    var buffer = Utilitary.audioContext.createBuffer(1, 1, 22050);
    var source = Utilitary.audioContext.createBufferSource();
    source.buffer = buffer;

    // connect to output (your speakers)
    source.connect(Utilitary.audioContext.destination);

    // play the file
    if (source.noteOn) {
        source.noteOn(0);
    }
    window.removeEventListener('touchstart', IosInit2, false)
}
