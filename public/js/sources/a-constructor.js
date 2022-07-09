'use strict';

/*
 * https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Object/create
 * 
 */

if (typeof Object.create != 'function') {
  // Production steps of ECMA-262, Edition 5, 15.2.3.5
  // Reference: http://es5.github.io/#x15.2.3.5
  Object.create = (function() {
    // To save on memory, use a shared constructor
    function Temp() {}

    // make a safe reference to Object.prototype.hasOwnProperty
    var hasOwn = Object.prototype.hasOwnProperty;

    return function (O) {
      // 1. If Type(O) is not Object or Null throw a TypeError exception.
      if (typeof O != 'object') {
        throw TypeError('Object prototype may only be an Object or null');
      }

      // 2. Let obj be the result of creating a new object as if by the
      //    expression new Object() where Object is the standard built-in
      //    constructor with that name
      // 3. Set the [[Prototype]] internal property of obj to O.
      Temp.prototype = O;
      var obj = new Temp();
      Temp.prototype = null; // Let's not keep a stray reference to O...

      // 4. If the argument Properties is present and not undefined, add
      //    own properties to obj as if by calling the standard built-in
      //    function Object.defineProperties with arguments obj and
      //    Properties.
      if (arguments.length > 1) {
        // Object.defineProperties does ToObject on its first argument.
        var Properties = Object(arguments[1]);
        for (var prop in Properties) {
          if (hasOwn.call(Properties, prop)) {
            obj[prop] = Properties[prop];
          }
        }
      }

      // 5. Return obj
      return obj;
    };
  })();
}


function Classification_Subsystem_Utilities() {
}

function Classification_Subsystem_Tabs() {

    //Classification_Subsystem_Utilities.apply(this, arguments);
}

Classification_Subsystem_Utilities.prototype = Object.create(Classification_Subsystem_Tabs.prototype);

function Classification_Subsystem_History() {
}

Classification_Subsystem_History.prototype = Object.create(Classification_Subsystem_Utilities.prototype);

function Classification_Doc_Collections() {
}

Classification_Doc_Collections.prototype = Object.create(Classification_Subsystem_History.prototype);


function Client_Always_Execute(){
}

Client_Always_Execute.prototype = Object.create(Classification_Doc_Collections.prototype);

function Classification_Subsystem_Attribute_Search(){
}

Classification_Subsystem_Attribute_Search.prototype = Object.create(Client_Always_Execute.prototype);


function Classification_Subsystem_Reports_Fiter(){
}

Classification_Subsystem_Reports_Fiter.prototype = Object.create(Classification_Subsystem_Attribute_Search.prototype);


function Classification_Subsystem_ReadyMade(){
}

Classification_Subsystem_ReadyMade.prototype = Object.create(Classification_Subsystem_Reports_Fiter.prototype);


function Classification_Pan_Main(){
}
Classification_Pan_Main.prototype = Object.create(Classification_Subsystem_ReadyMade.prototype);


function Classification_Subsystem_Form_Analysis(){
}

Classification_Subsystem_Form_Analysis.prototype = Object.create(Classification_Pan_Main.prototype);


function Classification_Subsystem_Main() {
    this.currentAJAX = null;
    this.pluginKodObj = {};
    //this.jQueryDialog = null;
}

Classification_Subsystem_Main.prototype = Object.create(Classification_Subsystem_Form_Analysis.prototype);
Classification_Subsystem_Main.prototype.constructor = Classification_Subsystem_Main;
