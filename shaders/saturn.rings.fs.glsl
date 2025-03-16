precision mediump float;

uniform vec3 uLightPosition;
uniform sampler2D uTexture;

varying vec2 vTexcoords;
varying vec3 vWorldNormal;
varying vec3 vWorldPosition;

void main(void) {
 
    // diffuse contribution

    vec3 lightNormal = normalize(uLightPosition - vWorldPosition);
    vec3 worldNormal = normalize(vWorldNormal);
    float lambertTerm = max(dot(worldNormal, lightNormal), 0.0);

    vec4 albedo = texture2D(uTexture, vTexcoords).rgba;

    //vec3 diffuseColor = albedo.rgb * lambertTerm * 1.05;
    
    gl_FragColor = vec4(albedo * 0.5);

}

// EOF 00100001-10