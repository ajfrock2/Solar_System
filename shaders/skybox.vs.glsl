precision mediump float;

attribute vec3 aVertexPosition;

uniform mat4 uWorldMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uViewMatrix;

varying vec3 vDirection;

void main(void) {
    gl_Position = uProjectionMatrix * uWorldMatrix * vec4(aVertexPosition, 1.0);
    vDirection = (vec4(aVertexPosition, 0.0) * uViewMatrix).xyz ;
}

// EOF 00100001-10