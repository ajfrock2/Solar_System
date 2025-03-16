precision mediump float;

uniform sampler2D uTexture;

varying vec2 vTexcoords;

void main(void) {
 
    vec3 albedo = texture2D(uTexture, vTexcoords).rgb;
    
    gl_FragColor = vec4(0.7, 0.7, 0.7, albedo.x - 0.2);

}

// EOF 00100001-10