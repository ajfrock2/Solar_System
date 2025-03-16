precision mediump float;

uniform samplerCube uCubeMap;

varying vec3 vDirection;

void main(void) {
    //gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0); 
    gl_FragColor = textureCube(uCubeMap, normalize(vDirection));
}

// EOF 00100001-10