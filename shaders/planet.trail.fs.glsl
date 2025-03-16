precision mediump float;

varying vec3 vTrailColor;

void main(void) {
    gl_FragColor = vec4(vTrailColor.x, vTrailColor.y, vTrailColor.z, 1.0); 
}

// EOF 00100001-10