/*				MAIN.JS
    Entry point of the Program

    Create the scenes
    Navigate between scenes
    Activate Physical input/output
    Handle Drag and Drop
    Create Factories and Modules

    DEPENDENCIES :
        - Accueil.js
        - Finish.js
        - Playground.js
        - Pedagogie.js
        - SceneClass.js

        - ModuleClass.js
        - Connect.js
        - libfaust.js
        - webaudio-asm-wrapper.js
        - Pedagogie/Tooltips.js

*/
"use strict";
window.addEventListener('load', init, false);
function init() {
    var app = new App();
    try {
        app.audioContext = new AudioContext();
    }
    catch (e) {
        alert('The Web Audio API is apparently not supported in this browser.');
    }
    app.createAllScenes();
    app.showFirstScene();
}
/********************************************************************
**************************  CLASS  *********************************
********************************************************************/
//interface Navigator {
//    getUserMedia(
//        options: { video?: boolean; audio?: boolean; },
//        success: (stream: any) => void,
//        error?: (error: string) => void
//    ): void;
//    webkitGetUserMedia(
//        options: { video?: boolean; audio?: boolean; },
//        successCallback: (stream: any) => void,
//        errorCallback: (error: Error) => void)
//        : any;
//}
var App = (function () {
    function App() {
    }
    App.prototype.showFirstScene = function () {
        this.scenes[0].showScene();
    };
    App.prototype.createAllScenes = function () {
        this.scenes = [];
        if (this.isPedagogie) {
            this.scenes[0] = new Scene("Accueil");
            SceneAccueilView.initWelcomeScene(this.scenes[0]);
            this.scenes[1] = new Scene("Pedagogie", ScenePedagogieView.onloadPedagogieScene, ScenePedagogieView.onunloadPedagogieScene);
            ScenePedagogieView.initPedagogieScene(this.scenes[1]);
            this.scenes[2] = new Scene("Export", SceneExportView.onloadExportScene, SceneExportView.onunloadExportScene);
        }
        else {
            this.scenes[0] = new Scene("Normal", onloadNormalScene, onunloadNormalScene);
            ScenePlaygroundView.initNormalScene(this.scenes[0]);
        }
        App.currentScene = 0;
    };
    /********************************************************************
    **********************  NAVIGATION BETWEEN SCENES *******************
    ********************************************************************/
    App.prototype.nextScene = function () {
        var index = App.currentScene;
        this.scenes[index].hideScene();
        this.scenes[index].unloadScene();
        App.currentScene = index + 1;
        console.log("WINDOW CURRENT SCENE");
        console.log(this.scenes[index + 1].getSceneContainer());
        this.scenes[index + 1].showScene();
        this.scenes[index + 1].loadScene();
    };
    App.prototype.previousScene = function () {
        var index = App.currentScene;
        this.scenes[index].hideScene();
        this.scenes[index].unloadScene();
        this.scenes[index - 1].showScene();
        this.scenes[index - 1].loadScene();
        App.currentScene = index - 1;
    };
    /********************************************************************
    **********************  ACTIVATE PHYSICAL IN/OUTPUT *****************
    ********************************************************************/
    App.prototype.activateAudioInput = function () {
        var navigator = navigator;
        if (!navigator.getUserMedia) {
            navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
        }
        if (navigator.getUserMedia) {
            navigator.getUserMedia({ audio: true }, this.getDevice, function (e) {
                alert('Error getting audio input');
            });
        }
        else {
            alert('Audio input API not available');
        }
    };
    App.prototype.getDevice = function (device) {
        // Create an AudioNode from the stream.
        this.src = document.getElementById("input");
        src.audioNode = audioContext.createMediaStreamSource(device);
        var i = document.createElement("div");
        i.className = "node node-output";
        i.addEventListener("mousedown", startDraggingConnector, true);
        i.innerHTML = "<span class='node-button'>&nbsp;</span>";
        src.appendChild(i);
        connectModules(src, window.scenes[window.currentScene].audioInput());
    };
    App.prototype.activateAudioOutput = function (sceneOutput) {
        var out = document.createElement("div");
        out.id = "audioOutput";
        out.audioNode = window.audioContext.destination;
        document.body.appendChild(out);
        connectModules(sceneOutput, out);
    };
    /********************************************************************
    ****************  CREATE FAUST FACTORIES AND MODULES ****************
    ********************************************************************/
    App.prototype.compileFaust = function (name, sourcecode, x, y, callback) {
        //  Temporarily Saving parameters of compilation
        window.name = name;
        window.source = sourcecode;
        window.x = x;
        window.y = y;
        var currentScene = window.scenes[window.currentScene];
        // To Avoid click during compilation
        if (currentScene)
            currentScene.muteScene();
        //var args = ["-I", "http://faust.grame.fr/faustcode/"];
        //var args = ["-I", "http://10.0.1.2/faustcode/"];
        var args = ["-I", "http://" + location.hostname + "/faustcode/"];
        var factory = faust.createDSPFactory(sourcecode, args);
        callback(factory);
        if (currentScene)
            currentScene.unmuteScene();
    };
    App.prototype.createFaustModule = function (factory) {
        if (!factory) {
            alert(faust.getErrorMessage());
            return null;
        }
        var faustModule;
        // can't it be just window.scenes[window.currentScene] ???
        if (isTooltipEnabled())
            faustModule = createModule(idX++, window.x, window.y, window.name, document.getElementById("modules"), window.scenes[1].removeModule);
        else
            faustModule = createModule(idX++, window.x, window.y, window.name, document.getElementById("modules"), window.scenes[0].removeModule);
        faustModule.setSource(window.source);
        faustModule.createDSP(factory);
        faustModule.createFaustInterface();
        faustModule.addInputOutputNodes();
        window.scenes[window.currentScene].addModule(faustModule);
    };
    /********************************************************************
    ***********************  HANDLE DRAG AND DROP ***********************
    ********************************************************************/
    //-- Init drag and drop reactions
    App.prototype.setGeneralDragAndDrop = function () {
        window.ondragover = function () { this.className = 'hover'; return false; };
        window.ondragend = function () { this.className = ''; return false; };
        window.ondrop = function (e) {
            uploadFile(e);
            return true;
        };
    };
    //-- Init drag and drop reactions
    App.prototype.resetGeneralDragAndDrop = function (div) {
        window.ondragover = function () { return false; };
        window.ondragend = function () { return false; };
        window.ondrop = function (e) { return false; };
    };
    //-- Prevent Default Action of the browser from happening
    App.prototype.preventDefaultAction = function (e) {
        e.preventDefault();
    };
    App.prototype.terminateUpload = function () {
        var uploadTitle = document.getElementById("upload");
        uploadTitle.textContent = "";
        if (isTooltipEnabled() && sceneHasInstrumentAndEffect())
            toolTipForConnections();
    };
    //-- Finds out if the drop was on an existing module or creating a new one
    App.prototype.uploadFile = function (e) {
        if (!e)
            e = window.event;
        var alreadyInNode = false;
        var modules = window.scenes[window.currentScene].getModules();
        for (var i = 0; i < modules.length; i++) {
            if (modules[i].isPointInNode(e.clientX, e.clientY))
                alreadyInNode = true;
        }
        if (!alreadyInNode) {
            var x = e.clientX;
            var y = e.clientY;
            uploadOn(null, x, y, e);
        }
    };
    //-- Upload content dropped on the page and create a Faust DSP with it
    App.prototype.uploadOn = function (module, x, y, e) {
        preventDefaultAction(e);
        var uploadTitle = document.getElementById("upload");
        uploadTitle.textContent = "CHARGEMENT EN COURS ...";
        // CASE 1 : THE DROPPED OBJECT IS A URL TO SOME FAUST CODE
        if (e.dataTransfer.getData('URL') && e.dataTransfer.getData('URL').split(':').shift() != "file") {
            var url = e.dataTransfer.getData('URL');
            var filename = url.toString().split('/').pop();
            filename = filename.toString().split('.').shift();
            var xmlhttp = new XMLHttpRequest();
            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                    var dsp_code = "process = vgroup(\"" + filename + "\",environment{" + xmlhttp.responseText + "}.process);";
                    if (module == null)
                        compileFaust(filename, dsp_code, x, y, createFaustModule);
                    else
                        module.update(filename, dsp_code);
                }
                terminateUpload();
            };
            xmlhttp.open("GET", url, false);
            // 	Avoid error "mal formé" on firefox
            xmlhttp.overrideMimeType('text/html');
            xmlhttp.send();
        }
        else if (e.dataTransfer.getData('URL').split(':').shift() != "file") {
            var dsp_code = e.dataTransfer.getData('text');
            // CASE 2 : THE DROPPED OBJECT IS SOME FAUST CODE
            if (dsp_code) {
                dsp_code = "process = vgroup(\"" + "TEXT" + "\",environment{" + dsp_code + "}.process);";
                if (!module)
                    compileFaust("TEXT", dsp_code, x, y, createFaustModule);
                else
                    module.update("TEXT", dsp_code);
                terminateUpload();
            }
            else {
                var files = e.target.files || e.dataTransfer.files;
                var file = files[0];
                if (location.host.indexOf("sitepointstatic") >= 0)
                    return;
                var request = new XMLHttpRequest();
                if (request.upload) {
                    var reader = new FileReader();
                    var ext = file.name.toString().split('.').pop();
                    var filename = file.name.toString().split('.').shift();
                    var type;
                    if (ext == "dsp") {
                        type = "dsp";
                        reader.readAsText(file);
                    }
                    else if (ext == "json") {
                        type = "json";
                        reader.readAsText(file);
                    }
                    else
                        terminateUpload();
                    reader.onloadend = function (e) {
                        dsp_code = "process = vgroup(\"" + filename + "\",environment{" + reader.result + "}.process);";
                        if (!module && type == "dsp")
                            compileFaust(filename, dsp_code, x, y, createFaustModule);
                        else if (type == "dsp")
                            module.update(filename, dsp_code);
                        else if (type == "json")
                            window.scenes[window.currentScene].recallScene(reader.result);
                        terminateUpload();
                    };
                }
            }
        }
        else {
            terminateUpload();
            window.alert("THIS OBJECT IS NOT FAUST COMPILABLE");
        }
    };
    return App;
})();
//# sourceMappingURL=Main.js.map