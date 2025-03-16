precision mediump float;

uniform vec3 uLightPosition;
uniform vec3 uCameraPosition;
uniform sampler2D uTexture;

varying vec2 vTexcoords;
varying vec3 vWorldNormal;
varying vec3 vWorldPosition;

void main(void) {

    //gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0); 

    // diffuse contribution

    vec3 lightNormal = normalize(uLightPosition - vWorldPosition);
    vec3 worldNormal = normalize(vWorldNormal);
    float lambertTerm = max(dot(worldNormal, lightNormal), 0.0);

    // specular contribution
    vec3 towardsEye = normalize(uCameraPosition - vWorldPosition);
    vec3 reflectionVec = -lightNormal + 2.0 * lambertTerm * worldNormal;

    float phongTerm = pow(max(dot(reflectionVec, towardsEye), 0.0), 64.0);

    // combine
 
    vec3 albedo = texture2D(uTexture, vTexcoords).rgb;

    vec3 ambient = albedo * 0.1;
    vec3 diffuseColor = albedo * lambertTerm * vec3(1.0, 1.0, 1.0);
    vec3 specularColor = phongTerm * vec3(0.3, 0.3, 0.3) * vec3(1.0, 1.0, 1.0);

    vec3 finalColor = ambient + diffuseColor + specularColor;

    gl_FragColor = vec4(finalColor, 1.0);

}

// EOF 00100001-10