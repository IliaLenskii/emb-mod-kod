'use strict';

class TestClass {
    
    constructor () {
        //super()
        
        this.name = '';
        this.f = 0;
    }
    
    check() {

        return true;
    }
    
    static distance(a, b) {
        const dx = a.x - b.x;
        const dy = a.y - b.y;

        return Math.hypot(dx, dy);
    }

};

class Lion extends TestClass {

    speak() {

        //super.check();
        //console.log(this.name + ' roars.');
    }
};

module.exports = TestClass;

