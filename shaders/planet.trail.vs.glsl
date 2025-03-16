precision mediump float;

attribute vec3 aVertexPosition;

uniform mat4 uWorldMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform vec3 uTrailColor;

varying vec3 vTrailColor;


void main(void) {
    vTrailColor = uTrailColor;
    gl_Position = uProjectionMatrix * uViewMatrix * vec4(aVertexPosition, 1.0);
}

// EOF 00100001-10