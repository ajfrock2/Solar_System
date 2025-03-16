precision mediump float;

uniform float uTime;
uniform vec3 uColor;

varying float vSeed;

void main(void) {
    vec3 col = uColor * ( 0.5 + 0.5 * sin(uTime * 3.0 + vSeed * 80.0));
    gl_FragColor = vec4(col, 1.0); 
}

// EOF 00100001-10