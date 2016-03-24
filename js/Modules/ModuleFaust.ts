﻿/*MODULEFAUST.JS
HAND - MADE JAVASCRIPT CLASS CONTAINING A FAUST MODULE */

interface IfDSP {
    json: () => string;
    getValue: (text: string) => string;
    setValue: (text: string, val: string) => void;
    getNumInputs: () => number;
    getNumOutputs: () => number;
    controls: () => any;
    getProcessor: () => ScriptProcessorNode;
}

class ModuleFaust {
    fDSP: IfDSP;
    factory: Factory;
    fSource: string;
    fTempSource: string;
    fName: string;
    fTempName: string;
    fOutputConnections: Connector[] = [];
    fInputConnections: Connector[] = [];
    recallOutputsDestination: string[]=[];
    recallInputsSource: string[]=[];
    constructor(name: string) {
        this.fName = name;
    }


    /*************** ACTIONS ON IN/OUTPUT NODES ***************************/



    // ------ Returns Connection Array OR null if there are none
    getInputConnections(): Connector[] {
        return this.fInputConnections;
    }
    getOutputConnections(): Connector[] {
        return this.fOutputConnections;
    }

    //-- The Creation of array is only done when a new connection is added 
    //-- (to be able to return null when there are none)	
    addOutputConnection(connector: Connector): void {
        this.fOutputConnections.push(connector);
    }
    addInputConnection(connector: Connector): void {
        this.fInputConnections.push(connector);
    }

    removeOutputConnection(connector: Connector): void {
        this.fOutputConnections.splice(this.fOutputConnections.indexOf(connector), 1);
    }
    removeInputConnection(connector: Connector): void {
        this.fInputConnections.splice(this.fInputConnections.indexOf(connector), 1);
    }
    /********************** GET/SET SOURCE/NAME/DSP ***********************/
    setSource(code: string): void {
        this.fSource = code;
    }
    getSource(): string { return this.fSource; }
    getName(): string { return this.fName; }
    getDSP(): IfDSP {
        return this.fDSP;
    }
}
