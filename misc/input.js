function Input() {
	this.up = false;
	this.down = false;
	this.left = false;
    this.right = false;
    this.a = false;
    this.s = false;
    this.d = false;
    this.w = false;
    this.f = false;
    this.t = false;
    this.c = false;
    this.b = false;

    // -------------------------------------------------------------------------
    function onKeyUp(e) {
        if (e.key == "ArrowUp") { this.up = false; }
        if (e.key == "ArrowDown") { this.down = false; }
        if (e.key == "ArrowLeft") { this.left = false; }
        if (e.key == "ArrowRight") { this.right = false; }
        if (e.key == "a") { this.a = false; }
        if (e.key == "s") { this.s = false; }
        if (e.key == "d") { this.d = false; }
        if (e.key == "f") { this.f = false; }
        if (e.key == "w") { this.w = false; }
        if (e.key == "t") { this.t = false; }
        if (e.key == "c") { this.c = false; }
        if (e.key == "b") { this.b = false; }
    }

    // -------------------------------------------------------------------------
    function onKeyDown(e) {
        if (e.key == "ArrowUp") { this.up = true; }
        if (e.key == "ArrowDown") { this.down = true; }
        if (e.key == "ArrowLeft") { this.left = true; }
        if (e.key == "ArrowRight") { this.right = true; }
        if (e.key == "a") { this.a = true; }
        if (e.key == "s") { this.s = true; }
        if (e.key == "d") { this.d = true; }
        if (e.key == "f") { this.f = true; }
        if (e.key == "w") { this.w = true; }
        if (e.key == "t") { this.t = true; }
        if (e.key == "c") { this.c = true; }
        if (e.key == "b") { this.b = true; }
	}

	window.addEventListener('keydown', onKeyDown.bind(this));
    window.addEventListener('keyup', onKeyUp.bind(this));
}

// EOF 00100001-10