precision mediump float;

uniform vec3 uLightPosition;
uniform sampler2D uTexture;
uniform vec3 uOtherPlanetPosition;
uniform float uOtherPlanetRadius;

varying vec2 vTexcoords;
varying vec3 vWorldNormal;
varying vec3 vWorldPosition;

void main(void) {
 
    // diffuse contribution

    vec3 lightNormal = normalize(uLightPosition - vWorldPosition);
    vec3 worldNormal = normalize(vWorldNormal);
    float lambertTerm = max(dot(worldNormal, lightNormal), 0.0);

    vec3 albedo = texture2D(uTexture, vTexcoords).rgb;
   
    vec3 diffuseColor = albedo * lambertTerm * vec3(1.0, 1.0, 1.0) * 1.05;
    

    bool inShadow = false;
    vec3 planetDirection = (uOtherPlanetPosition - vWorldPosition);
    float scalar = dot(planetDirection, lightNormal);
    if(scalar > 0.0){

        vec3 closestPoint = scalar * lightNormal + vWorldPosition;
        vec3 distToCenter = closestPoint - uOtherPlanetPosition;

        if((distToCenter.x * distToCenter.x)+(distToCenter.y * distToCenter.y)+(distToCenter.z * distToCenter.z) < (uOtherPlanetRadius * uOtherPlanetRadius)){
        inShadow = true; 
        }
    }


    if(inShadow){
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    }else{
        gl_FragColor = vec4(diffuseColor, 1.0);
    }

}

// EOF 00100001-10