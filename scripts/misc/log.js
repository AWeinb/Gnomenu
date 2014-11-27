
const Main = imports.ui.main;

function log(classname, funcname, message) {
    global.log(classname + "::" + funcname + ": " + message);
}

function logWarning(classname, funcname, message) {
    global.log(classname + "::" + funcname + ": " + message);
}

function logError(classname, funcname, message) {
    global.log(classname + "::" + funcname + ": " + message);
    Main.notifyError(classname + "::" + funcname, message);
}

            //Main.notifyError(_("Failed to launch \"%s\"").format(this._name), e.message);
            
            
//const Me = imports.misc.extensionUtils.getCurrentExtension();
//const Log = Me.imports.scripts.misc.log;