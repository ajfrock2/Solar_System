precision mediump float;

uniform sampler2D uTexture;
uniform sampler2D uFlowMap;
uniform float uTime;

varying vec2 vTexcoords;

void main(void) {

    
    vec2 flow = texture2D(uFlowMap, vTexcoords).rg;
    flow = ((flow - 0.5) * 2.0) * sin(uTime * 0.2);
    vec3 color = (texture2D(uTexture, vTexcoords + flow * 0.1)).rgb;

    gl_FragColor = vec4(color, 1.0);

}

// EOF 00100001-10