precision mediump float;

attribute vec3 aVertexPosition;
attribute float aSeed;

uniform float uStarSize;
uniform mat4 uWorldMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

varying float vSeed;

void main(void) {
    gl_Position = uProjectionMatrix * uViewMatrix * uWorldMatrix * vec4(aVertexPosition, 1.0);
    gl_PointSize = uStarSize;
    vSeed = aSeed;
}

// EOF 00100001-10