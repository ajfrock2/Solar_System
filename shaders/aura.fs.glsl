precision mediump float;

uniform vec3 uColor;
uniform float uTime;

void main(void) {
    gl_FragColor = vec4(uColor, 0.3 * sin(uTime * 2.0)); 
}

// EOF 00100001-10