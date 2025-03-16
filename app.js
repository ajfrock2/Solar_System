/*
My solar System
-Austin Frock
*/
'use strict'

var gl;

var appInput = new Input();
var time = new Time();
var camera = new OrbitCamera(appInput);

var projectionMatrix = new Matrix4();
var lightPosition = new Vector3(0, 0, 0);
var lightMatrix = new Matrix4();

//Misc
var earthAxisRevision = new Matrix4().makeRotationX(23.5);
var starCount = 1000;
var cameraInBlackHole = false;

//Activation variables
var auraActive = false;
var constellationActive = false;
var trailActive = false;
var blackHoleActive = false;
var timeTrailActivated = 0;
var timeAuraActivated = 0;
var timeConstellationActivated = 0;

//Shaders
var phongShaderProgram;
var flatShaderProgram;
var flatTextureProgram;
var diffuseProgram;
var skyboxProgram;
var planetTrailProgram;
var cloudShaderProgram; 
var starShaderProgram;
var earthMoonProgram;
var auraShaderProgram;
var sunProgram;
var saturnRingProgram;

//Planet information
var sunScale = .1;
var earthDist = 70;

var sun        = new Planet(new Matrix4().makeScale(sunScale, sunScale, sunScale),                   10, new Matrix4().makeTranslation(0, 0, 0),                0);
var mercury    = new Planet(new Matrix4().makeScale(sunScale / 7, sunScale / 7, sunScale / 7),       10, new Matrix4().makeTranslation(earthDist * 0.3, 0, 0), -.1,   new Vector3(.3,.3,.3));
var venus      = new Planet(new Matrix4().makeScale(sunScale / 6, sunScale / 6, sunScale / 6),       -5, new Matrix4().makeTranslation(earthDist * 0.6, 0, 0), -.08,  new Vector3(1,1,0));
var earth      = new Planet(new Matrix4().makeScale(sunScale / 5, sunScale / 5, sunScale / 5),       10, new Matrix4().makeTranslation(earthDist, 0, 0),       -.06,  new Vector3(0,0,1));
var moon       = new Planet(new Matrix4().makeScale(sunScale / 20, sunScale / 20, sunScale / 20),    25, new Matrix4().makeTranslation(earthDist + 2, 0, 0),   -.2,   new Vector3(.5,.5,.5));
var mars       = new Planet(new Matrix4().makeScale(sunScale / 5, sunScale / 5, sunScale / 5),       28, new Matrix4().makeTranslation(earthDist * 1.5, 0, 0), -.04,  new Vector3(1,0,0));
var jupiter    = new Planet(new Matrix4().makeScale(sunScale / 2, sunScale / 2, sunScale / 2),       55, new Matrix4().makeTranslation(earthDist * 2.2, 0, 0), -.03,  new Vector3(1,.5,0));
var saturn     = new Planet(new Matrix4().makeScale(sunScale / 3, sunScale / 3, sunScale / 3),       54, new Matrix4().makeTranslation(earthDist * 2.5, 0, 0), -.02,  new Vector3(.8,.8,.4));
var sRings     = new Planet(new Matrix4().makeScale(sunScale * 50, sunScale * 50, sunScale * 50),     54, new Matrix4().makeTranslation(earthDist * 2.5, 0, 0), -.02,  new Vector3(.8,.8,.4));
var uranus     = new Planet(new Matrix4().makeScale(sunScale / 3.5, sunScale / 3.5, sunScale / 3.5), 44, new Matrix4().makeTranslation(earthDist * 3.2, 0, 0), -.01,  new Vector3(0,1,1));
var neptune    = new Planet(new Matrix4().makeScale(sunScale / 4, sunScale / 4, sunScale / 4),       45, new Matrix4().makeTranslation(earthDist * 4, 0, 0),   -.007, new Vector3(0,0,.5));
var atmosphere = new Planet(new Matrix4().makeScale(sunScale / 4.8, sunScale / 4.8, sunScale / 4.8), 15, new Matrix4().makeTranslation(earthDist, 0, 0),       -.06,  new Vector3(0,0,1));
moon.radiusFromOrbit = Math.sqrt(((moon.position.getPosition().x - earth.position.getPosition().x)*(moon.position.getPosition().x - earth.position.getPosition().x) 
                     + ((moon.position.getPosition().z - earth.position.getPosition().z)*(moon.position.getPosition().z - earth.position.getPosition().z))));

var mercuryAura = new Planet(new Matrix4().makeScale(sunScale / 7 * 1.2, sunScale / 7 * 1.2, sunScale / 7 * 1.2),       10, new Matrix4().makeTranslation(earthDist * 0.3, 0, 0), -.1,   new Vector3(.3,.3,.3));
var venusAura   = new Planet(new Matrix4().makeScale(sunScale / 6 * 1.2, sunScale / 6 * 1.2, sunScale / 6 * 1.2),       -5, new Matrix4().makeTranslation(earthDist * 0.6, 0, 0), -.08,  new Vector3(1,1,0));
var earthAura   = new Planet(new Matrix4().makeScale(sunScale / 5 * 1.2, sunScale / 5 * 1.2, sunScale / 5 * 1.2),       15, new Matrix4().makeTranslation(earthDist, 0, 0),       -.06,  new Vector3(0,0,1));
var moonAura    = new Planet(new Matrix4().makeScale(sunScale / 20 * 1.2, sunScale / 20 * 1.2, sunScale / 20 * 1.2),    25, new Matrix4().makeTranslation(earthDist + 2, 0, 0),   -.2,   new Vector3(.5,.5,.5));
var marsAura    = new Planet(new Matrix4().makeScale(sunScale / 5 * 1.2, sunScale / 5 * 1.2, sunScale / 5 * 1.2),       28, new Matrix4().makeTranslation(earthDist * 1.5, 0, 0), -.04,  new Vector3(1,0,0));
var jupiterAura = new Planet(new Matrix4().makeScale(sunScale / 2 * 1.2, sunScale / 2 * 1.2, sunScale / 2 * 1.2),       55, new Matrix4().makeTranslation(earthDist * 2.2, 0, 0), -.03,  new Vector3(1,.5,0));
var saturnAura  = new Planet(new Matrix4().makeScale(sunScale / 3 * 1.2, sunScale / 3 * 1.2, sunScale / 3 * 1.2),       54, new Matrix4().makeTranslation(earthDist * 2.5, 0, 0), -.02,  new Vector3(.8,.8,.4));
var uranusAura  = new Planet(new Matrix4().makeScale(sunScale / 3.5 * 1.2, sunScale / 3.5 * 1.2, sunScale / 3.5 * 1.2), 44, new Matrix4().makeTranslation(earthDist * 3.2, 0, 0), -.01,  new Vector3(0,1,1));
var neptuneAura = new Planet(new Matrix4().makeScale(sunScale / 4 * 1.2, sunScale / 4 * 1.2, sunScale / 4 * 1.2),       45, new Matrix4().makeTranslation(earthDist * 4, 0, 0),   -.007, new Vector3(0,0,.5));
moonAura.radiusFromOrbit = moon.radiusFromOrbit;

var blackHole = new Planet(new Matrix4().makeScale(sunScale * 3, sunScale * 3, sunScale * 3), 0, new Matrix4().makeTranslation(0,0,0), 0, new Vector3(0, 0, 0));
var blackHoleAura = new Planet(new Matrix4().makeScale(sunScale * 3.1, sunScale * 3.1, sunScale * 3.1), 0, new Matrix4().makeTranslation(0,0,0), 0, new Vector3(1, 1, 1));

//Planet set for camera switching controls
var planetSet = {
    sun: null,
    mercury: null,
    venus: null,
    earth: null,
    moon: null,
    mars: null,
    jupiter: null,
    saturn: null,
    uranus: null, 
    neptune: null,
};

//Planet geometry
var sunGeometry = null;
var mercuryGeometry = null;
var venusGeometry = null;
var earthGeometry = null;
var moonGeometry = null;
var marsGeometry = null;
var jupiterGeometry = null;
var saturnGeometry = null;
var uranusGeometry = null;
var neptuneGeometry = null;

//Aura geometry
var mercuryAuraGeometry = null;
var venusAuraGeometry = null;
var earthAuraGeometry = null;
var moonAuraGeometry = null;
var marsAuraGeometry = null;
var jupiterAuraGeometry = null;
var saturnAuraGeometry = null;
var uranusAuraGeometry = null;
var neptuneAuraGeometry = null;

//Misc geometry
var atmosphereGeometry = null;
var saturnRingGeometry = null;
var skyBoxGeometry = null;
var blackHoleGeometry = null;
var blackHoleAuraGeometry = null;

//Star/Constellation geometry
var starGeometry = null;
var ursaMajorGeometry = null;
var cancerGeometry = null;
var canisMajorGeometry = null;
var cygnusGeometry = null;
var delphinusGeometry = null;
var orionGeometry = null;
var hydrusGeometry = null;
var tucanaGeometry = null;
var vulpeculaGeometry = null;
var piscesGeometry = null; 
var volansGeometry = null;
var virgoGeometry = null;
var muscaGeometry = null;
var ursaMinorGeometry = null;
var pavoGeometry = null;
var lupusGeometry = null;
var doradoGeometry = null;
var geminiGeometry = null;


// auto start the app when the html page is ready
window.onload = window['initializeAndStartRendering'];

//All the assets from other defined
var loadedAssets = {
    phongTextVS: null, phongTextFS: null,
    flatColorVS: null, flatColorFS: null,
    flatTextureVS: null, flatTextureFS: null,
    diffuseVS: null, diffuseFS: null,
    sphereJSON: null,
    sunImage: null,
    mercuryImage: null,
    venusImage: null,
    earthImage: null, 
    moonImage: null,
    marsImage: null,
    jupiterImage: null,
    saturnImage: null,
    uranusImage: null,
    neptuneImage: null,
    skyBoxPosX: null, skyBoxNegX: null, skyBoxPosY: null, skyBoxNegY: null, skyBoxPosZ: null, skyBoxNegZ: null,
    cubeJSON: null,
    skyboxVS: null, skyboxFS: null,
    planetTrailVS: null, planetTrailFS: null,
    atmopshereImage: null,
    cloudVS: null, cloudFS: null,
    starVS: null, starFS: null,
    earthMoonVS: null, earthMoonFS: null,
    auraVS: null, auraFS: null,
    flowmapImage: null,
    sunVS: null, sunFS: null,
    ringImage: null,
    ringVS: null, ringFS: null,
};

// -------------------------------------------------------------------------
function initializeAndStartRendering() {
    initGL();
    loadAssets(function() {
        createShaders(loadedAssets);
        createScene();

        updateAndRender();
    });
}

// -------------------------------------------------------------------------
function initGL(canvas) {
    var canvas = document.getElementById("webgl-canvas");

    try {
        gl = canvas.getContext("webgl");
        gl.canvasWidth = canvas.width;
        gl.canvasHeight = canvas.height;

        gl.enable(gl.DEPTH_TEST);
    } catch (e) {}

    if (!gl) {
        alert("Could not initialise WebGL, sorry :-(");
    }
}

// -------------------------------------------------------------------------
//All the assets from other files being assigned
function loadAssets(onLoadedCB) {
    var filePromises = [
        fetch('./shaders/phong.vs.glsl').then((response) => { return response.text(); }),
        fetch('./shaders/phong.pointlit.fs.glsl').then((response) => { return response.text(); }),
        fetch('./data/sphere.json').then((response) => { return response.json(); }),
        loadImage('./data/sun.jpg'),
        fetch('./shaders/flat.color.vs.glsl').then((response) => { return response.text(); }),
        fetch('./shaders/flat.color.fs.glsl').then((response) => { return response.text(); }),
        fetch('./shaders/flat.texture.vs.glsl').then((response) => { return response.text(); }),
        fetch('./shaders/flat.texture.fs.glsl').then((response) => { return response.text(); }),
        loadImage('./data/mercury.jpg'),
        fetch('./shaders/diffuse.vs.glsl').then((response) => { return response.text(); }),
        fetch('./shaders/diffuse.fs.glsl').then((response) => { return response.text(); }),
        loadImage('./data/venus.jpg'),
        loadImage('./data/earth.jpg'),
        loadImage('./data/moon.png'),
        loadImage('./data/mars.jpg'),
        loadImage('./data/jupiter.jpg'),
        loadImage('./data/saturn.jpg'),
        loadImage('./data/uranus.jpg'),
        loadImage('./data/neptune.jpg'),
        loadImage('./data/galaxyPosX.png'),
        loadImage('./data/galaxyNegX.png'),
        loadImage('./data/galaxyPosY.png'),
        loadImage('./data/galaxyNegY.png'),
        loadImage('./data/galaxyPosZ.png'),
        loadImage('./data/galaxyNegZ.png'),
        fetch('./data/cube.json').then((response) => { return response.json(); }),
        fetch('./shaders/skybox.vs.glsl').then((response) => { return response.text(); }),
        fetch('./shaders/skybox.fs.glsl').then((response) => { return response.text(); }),
        fetch('./shaders/planet.trail.vs.glsl').then((response) => { return response.text(); }),
        fetch('./shaders/planet.trail.fs.glsl').then((response) => { return response.text(); }),
        loadImage('./data/clouds.jpg'),
        fetch('./shaders/cloud.vs.glsl').then((response) => { return response.text(); }),
        fetch('./shaders/cloud.fs.glsl').then((response) => { return response.text(); }),
        fetch('./shaders/star.vs.glsl').then((response) => { return response.text(); }),
        fetch('./shaders/star.fs.glsl').then((response) => { return response.text(); }),
        fetch('./shaders/earth.moon.vs.glsl').then((response) => { return response.text(); }),
        fetch('./shaders/earth.moon.fs.glsl').then((response) => { return response.text(); }),
        fetch('./shaders/aura.vs.glsl').then((response) => { return response.text(); }),
        fetch('./shaders/aura.fs.glsl').then((response) => { return response.text(); }),
        loadImage('./data/flowmap.png'),
        fetch('./shaders/sun.vs.glsl').then((response) => { return response.text(); }),
        fetch('./shaders/sun.fs.glsl').then((response) => { return response.text(); }),
        loadImage('./data/rings.png'),
        fetch('./shaders/saturn.rings.vs.glsl').then((response) => { return response.text(); }),
        fetch('./shaders/saturn.rings.fs.glsl').then((response) => { return response.text(); }),
    ];

    Promise.all(filePromises).then(function(values) {
        // Assign loaded data to our named variables
        loadedAssets.phongTextVS = values[0];
        loadedAssets.phongTextFS = values[1];
        loadedAssets.sphereJSON = values[2];
        loadedAssets.sunImage = values[3];
        loadedAssets.flatColorVS = values[4];
        loadedAssets.flatColorFS = values[5];
        loadedAssets.flatTextureVS = values[6];
        loadedAssets.flatTextureFS = values[7];
        loadedAssets.mercuryImage = values[8];
        loadedAssets.diffuseVS = values[9];
        loadedAssets.diffuseFS = values[10];
        loadedAssets.venusImage = values[11];
        loadedAssets.earthImage = values[12];
        loadedAssets.moonImage = values[13];
        loadedAssets.marsImage = values[14];
        loadedAssets.jupiterImage = values[15];
        loadedAssets.saturnImage = values[16];
        loadedAssets.uranusImage = values[17];
        loadedAssets.neptuneImage = values[18];
        loadedAssets.skyBoxPosX = values[19];
        loadedAssets.skyBoxNegX = values[20];
        loadedAssets.skyBoxPosY = values[21];
        loadedAssets.skyBoxNegY = values[22];
        loadedAssets.skyBoxPosZ = values[23];
        loadedAssets.skyBoxNegZ = values[24];
        loadedAssets.cubeJSON = values[25];
        loadedAssets.skyboxVS = values[26];
        loadedAssets.skyboxFS = values[27];
        loadedAssets.planetTrailVS = values[28];
        loadedAssets.planetTrailFS = values[29];
        loadedAssets.atmopshereImage = values[30];
        loadedAssets.cloudVS = values[31];
        loadedAssets.cloudFS = values[32];
        loadedAssets.starVS = values[33];
        loadedAssets.starFS = values[34];
        loadedAssets.earthMoonVS = values[35];
        loadedAssets.earthMoonFS = values[36];
        loadedAssets.auraVS = values[37];
        loadedAssets.auraFS = values[38];
        loadedAssets.flowmapImage = values[39];
        loadedAssets.sunVS = values[40];
        loadedAssets.sunFS = values[41];
        loadedAssets.ringImage = values[42];
        loadedAssets.ringVS = values[43];
        loadedAssets.ringFS = values[44];
    }).catch(function(error) {
        console.error(error.message);
    }).finally(function() {
        onLoadedCB();
    });
}

// -------------------------------------------------------------------------
//Creates and links all the shaders to the files as well as defining variables to access their uniform and attribute variables
function createShaders(loadedAssets) {
    //Not currently used
    phongShaderProgram = createCompiledAndLinkedShaderProgram(loadedAssets.phongTextVS, loadedAssets.phongTextFS);

    phongShaderProgram.attributes = {
        vertexPositionAttribute: gl.getAttribLocation(phongShaderProgram, "aVertexPosition"),
        vertexNormalsAttribute: gl.getAttribLocation(phongShaderProgram, "aNormal"),
        vertexTexcoordsAttribute: gl.getAttribLocation(phongShaderProgram, "aTexcoords")
    };

    phongShaderProgram.uniforms = {
        worldMatrixUniform: gl.getUniformLocation(phongShaderProgram, "uWorldMatrix"),
        viewMatrixUniform: gl.getUniformLocation(phongShaderProgram, "uViewMatrix"),
        projectionMatrixUniform: gl.getUniformLocation(phongShaderProgram, "uProjectionMatrix"),
        lightPositionUniform: gl.getUniformLocation(phongShaderProgram, "uLightPosition"),
        cameraPositionUniform: gl.getUniformLocation(phongShaderProgram, "uCameraPosition"),
        textureUniform: gl.getUniformLocation(phongShaderProgram, "uTexture"),
    };

    //Shades a single color, used for both the black hole and black hole aura
    flatShaderProgram = createCompiledAndLinkedShaderProgram(loadedAssets.flatColorVS, loadedAssets.flatColorFS);

    flatShaderProgram.attributes = {
        vertexPositionAttribute: gl.getAttribLocation(flatShaderProgram, "aVertexPosition")
    };

    flatShaderProgram.uniforms = {
        worldMatrixUniform: gl.getUniformLocation(flatShaderProgram, "uWorldMatrix"),
        viewMatrixUniform: gl.getUniformLocation(flatShaderProgram, "uViewMatrix"),
        projectionMatrixUniform: gl.getUniformLocation(flatShaderProgram, "uProjectionMatrix"),
        colorUniform: gl.getUniformLocation(flatShaderProgram, "uColor"),
    };


    //Shades the texture with no lighting impacts, not currently used
    flatTextureProgram = createCompiledAndLinkedShaderProgram(loadedAssets.flatTextureVS, loadedAssets.flatTextureFS);

    flatTextureProgram.attributes = {
        vertexPositionAttribute: gl.getAttribLocation(flatTextureProgram, "aVertexPosition"),
        vertexTexcoordsAttribute: gl.getAttribLocation(flatTextureProgram, "aTexcoords")
    };

    flatTextureProgram.uniforms = {
        worldMatrixUniform: gl.getUniformLocation(flatTextureProgram, "uWorldMatrix"),
        viewMatrixUniform: gl.getUniformLocation(flatTextureProgram, "uViewMatrix"),
        projectionMatrixUniform: gl.getUniformLocation(flatTextureProgram, "uProjectionMatrix"),
        textureUniform: gl.getUniformLocation(flatTextureProgram, "uTexture"),
    };

    //Shades using the texture and takes in to account only diffuse lighting, used for all the simply lit planets
    diffuseProgram = createCompiledAndLinkedShaderProgram(loadedAssets.diffuseVS, loadedAssets.diffuseFS);

    diffuseProgram.attributes = {
        vertexPositionAttribute: gl.getAttribLocation(diffuseProgram, "aVertexPosition"),
        vertexNormalsAttribute: gl.getAttribLocation(diffuseProgram, "aNormal"),
        vertexTexcoordsAttribute: gl.getAttribLocation(diffuseProgram, "aTexcoords")
    };

    diffuseProgram.uniforms = {
        worldMatrixUniform: gl.getUniformLocation(diffuseProgram, "uWorldMatrix"),
        viewMatrixUniform: gl.getUniformLocation(diffuseProgram, "uViewMatrix"),
        projectionMatrixUniform: gl.getUniformLocation(diffuseProgram, "uProjectionMatrix"),
        lightPositionUniform: gl.getUniformLocation(diffuseProgram, "uLightPosition"),
        textureUniform: gl.getUniformLocation(diffuseProgram, "uTexture"),
    };

    //Shades the skybox, used for the skybox
    skyboxProgram = createCompiledAndLinkedShaderProgram(loadedAssets.skyboxVS, loadedAssets.skyboxFS);

    skyboxProgram.attributes = {
        vertexPositionAttribute: gl.getAttribLocation(skyboxProgram, "aVertexPosition"),
    };

    skyboxProgram.uniforms = {
        worldMatrixUniform: gl.getUniformLocation(skyboxProgram, "uWorldMatrix"),
        projectionMatrixUniform: gl.getUniformLocation(skyboxProgram, "uProjectionMatrix"),
        cubeMapUniform: gl.getUniformLocation(skyboxProgram, "uCubeMap"),
        viewMatrixUniform: gl.getUniformLocation(skyboxProgram, "uViewMatrix"),
    };

    //Shades a planets trail based on its color, used by all planets when activated
    planetTrailProgram = createCompiledAndLinkedShaderProgram(loadedAssets.planetTrailVS, loadedAssets.planetTrailFS);

    planetTrailProgram.attributes = {
        vertexPositionAttribute: gl.getAttribLocation(planetTrailProgram, "aVertexPosition"),
    };

    planetTrailProgram.uniforms = {
        worldMatrixUniform: gl.getUniformLocation(planetTrailProgram, "uWorldMatrix"),
        viewMatrixUniform: gl.getUniformLocation(planetTrailProgram, "uViewMatrix"),
        projectionMatrixUniform: gl.getUniformLocation(planetTrailProgram, "uProjectionMatrix"),
        colorUniform: gl.getUniformLocation(planetTrailProgram, "uTrailColor"),
    };

    //Shades the clouds on earth, used by the atmosphere
    cloudShaderProgram = createCompiledAndLinkedShaderProgram(loadedAssets.cloudVS, loadedAssets.cloudFS);

    cloudShaderProgram.attributes = {
        vertexPositionAttribute: gl.getAttribLocation(cloudShaderProgram, "aVertexPosition"),
        vertexTexcoordsAttribute: gl.getAttribLocation(cloudShaderProgram, "aTexcoords")
    };

    cloudShaderProgram.uniforms = {
        worldMatrixUniform: gl.getUniformLocation(cloudShaderProgram, "uWorldMatrix"),
        viewMatrixUniform: gl.getUniformLocation(cloudShaderProgram, "uViewMatrix"),
        projectionMatrixUniform: gl.getUniformLocation(cloudShaderProgram, "uProjectionMatrix"),
        textureUniform: gl.getUniformLocation(cloudShaderProgram, "uTexture"),
    };

    //Shades the stars so they either create constellations or fluctuate in birghtness, used by the star system and all constellations
    starShaderProgram = createCompiledAndLinkedShaderProgram(loadedAssets.starVS, loadedAssets.starFS);
    
    starShaderProgram.attributes = {
        vertexPositionAttribute: gl.getAttribLocation(starShaderProgram, "aVertexPosition"),
        seedAttribute: gl.getAttribLocation(starShaderProgram, "aSeed"),
    };

    starShaderProgram.uniforms = {
        worldMatrixUniform: gl.getUniformLocation(starShaderProgram, "uWorldMatrix"),
        viewMatrixUniform: gl.getUniformLocation(starShaderProgram, "uViewMatrix"),
        projectionMatrixUniform: gl.getUniformLocation(starShaderProgram, "uProjectionMatrix"),
        starSizeUniform: gl.getUniformLocation(starShaderProgram, "uStarSize"),
        timeUniform: gl.getUniformLocation(starShaderProgram, "uTime"),
        colorUniform: gl.getUniformLocation(starShaderProgram, "uColor"),
    };

    //Shades the earth and moon simply while also implmenting shadows, used by the earth and moon
    earthMoonProgram = createCompiledAndLinkedShaderProgram(loadedAssets.earthMoonVS, loadedAssets.earthMoonFS);

    earthMoonProgram.attributes = {
        vertexPositionAttribute: gl.getAttribLocation(earthMoonProgram, "aVertexPosition"),
        vertexNormalsAttribute: gl.getAttribLocation(earthMoonProgram, "aNormal"),
        vertexTexcoordsAttribute: gl.getAttribLocation(earthMoonProgram, "aTexcoords")
    };

    earthMoonProgram.uniforms = {
        worldMatrixUniform: gl.getUniformLocation(earthMoonProgram, "uWorldMatrix"),
        viewMatrixUniform: gl.getUniformLocation(earthMoonProgram, "uViewMatrix"),
        projectionMatrixUniform: gl.getUniformLocation(earthMoonProgram, "uProjectionMatrix"),
        lightPositionUniform: gl.getUniformLocation(earthMoonProgram, "uLightPosition"),
        textureUniform: gl.getUniformLocation(earthMoonProgram, "uTexture"),
        otherPlanetPositionUniform: gl.getUniformLocation(earthMoonProgram, "uOtherPlanetPosition"),
        otherPlanetRadiusUniform: gl.getUniformLocation(earthMoonProgram, "uOtherPlanetRadius"),
    };

    //Shades the aura around each planet, used by every planet when activated
    auraShaderProgram = createCompiledAndLinkedShaderProgram(loadedAssets.auraVS, loadedAssets.auraFS);

    auraShaderProgram.attributes = {
        vertexPositionAttribute: gl.getAttribLocation(auraShaderProgram, "aVertexPosition")
    };

    auraShaderProgram.uniforms = {
        worldMatrixUniform: gl.getUniformLocation(auraShaderProgram, "uWorldMatrix"),
        viewMatrixUniform: gl.getUniformLocation(auraShaderProgram, "uViewMatrix"),
        projectionMatrixUniform: gl.getUniformLocation(auraShaderProgram, "uProjectionMatrix"),
        colorUniform: gl.getUniformLocation(auraShaderProgram, "uColor"),
        timeUniform: gl.getUniformLocation(auraShaderProgram, "uTime"),
    };

    //Shades the sun using a flow map and a flat texture, used by the sun
    sunProgram = createCompiledAndLinkedShaderProgram(loadedAssets.sunVS, loadedAssets.sunFS);

    sunProgram.attributes = {
        vertexPositionAttribute: gl.getAttribLocation(sunProgram, "aVertexPosition"),
        vertexTexcoordsAttribute: gl.getAttribLocation(sunProgram, "aTexcoords")
    };

    sunProgram.uniforms = {
        worldMatrixUniform: gl.getUniformLocation(sunProgram, "uWorldMatrix"),
        viewMatrixUniform: gl.getUniformLocation(sunProgram, "uViewMatrix"),
        projectionMatrixUniform: gl.getUniformLocation(sunProgram, "uProjectionMatrix"),
        textureUniform: gl.getUniformLocation(sunProgram, "uTexture"),
        flowMapUniform: gl.getUniformLocation(sunProgram, "uFlowMap"),
        timeUniform: gl.getUniformLocation(sunProgram, "uTime"),
    };

    //Shades the saturns rings using a flat texture and its alpha value, used by saturns rings
    saturnRingProgram = createCompiledAndLinkedShaderProgram(loadedAssets.ringVS, loadedAssets.ringFS);

    saturnRingProgram.attributes = {
        vertexPositionAttribute: gl.getAttribLocation(saturnRingProgram, "aVertexPosition"),
        vertexNormalsAttribute: gl.getAttribLocation(saturnRingProgram, "aNormal"),
        vertexTexcoordsAttribute: gl.getAttribLocation(saturnRingProgram, "aTexcoords")
    };

    saturnRingProgram.uniforms = {
        worldMatrixUniform: gl.getUniformLocation(saturnRingProgram, "uWorldMatrix"),
        viewMatrixUniform: gl.getUniformLocation(saturnRingProgram, "uViewMatrix"),
        projectionMatrixUniform: gl.getUniformLocation(saturnRingProgram, "uProjectionMatrix"),
        lightPositionUniform: gl.getUniformLocation(saturnRingProgram, "uLightPosition"),
        textureUniform: gl.getUniformLocation(saturnRingProgram, "uTexture"),
    };
}

// -------------------------------------------------------------------------
//Create the inital geometry for every object in the solar system
function createScene() {
 
    //Sun
    sunGeometry = new WebGLGeometryJSON(gl, sunProgram);
    createPlanetGeometry(sunGeometry, sun, loadedAssets.sphereJSON, loadedAssets.sunImage, loadedAssets.flowmapImage);

    //Mercury 
    mercuryGeometry = new WebGLGeometryJSON(gl, diffuseProgram);
    createPlanetGeometry(mercuryGeometry, mercury, loadedAssets.sphereJSON, loadedAssets.mercuryImage);
    
    //Venus
    venusGeometry = new WebGLGeometryJSON(gl, diffuseProgram);
    createPlanetGeometry(venusGeometry, venus, loadedAssets.sphereJSON, loadedAssets.venusImage);

    //Earth
    earthGeometry = new WebGLGeometryJSON(gl, earthMoonProgram);
    createPlanetGeometry(earthGeometry, earth, loadedAssets.sphereJSON, loadedAssets.earthImage);
    earthGeometry.worldMatrix.multiply(earthAxisRevision); //For axis tilt

    //Moon 
    moonGeometry = new WebGLGeometryJSON(gl, earthMoonProgram);
    createPlanetGeometry(moonGeometry, moon, loadedAssets.sphereJSON, loadedAssets.moonImage); 

    //Mars
    marsGeometry = new WebGLGeometryJSON(gl, diffuseProgram);
    createPlanetGeometry(marsGeometry, mars, loadedAssets.sphereJSON, loadedAssets.marsImage);

    //Jupiter
    jupiterGeometry = new WebGLGeometryJSON(gl, diffuseProgram);
    createPlanetGeometry(jupiterGeometry, jupiter, loadedAssets.sphereJSON, loadedAssets.jupiterImage);

    //Saturn
    saturnGeometry = new WebGLGeometryJSON(gl, diffuseProgram);
    createPlanetGeometry(saturnGeometry, saturn, loadedAssets.sphereJSON, loadedAssets.saturnImage);

    //Saturn Rings
    saturnRingGeometry = new WebGLGeometryQuad(gl, saturnRingProgram);
    saturnRingGeometry.worldMatrix.makeIdentity();
    var rotation = new Matrix4().makeRotationX(90);
    saturnRingGeometry.worldMatrix.multiply(sRings.position).multiply(rotation).multiply(sRings.scale);
    saturnRingGeometry.create(loadedAssets.ringImage);

    //Uranus
    uranusGeometry = new WebGLGeometryJSON(gl, diffuseProgram);
    createPlanetGeometry(uranusGeometry, uranus, loadedAssets.sphereJSON, loadedAssets.uranusImage);

    //Neptune
    neptuneGeometry = new WebGLGeometryJSON(gl, diffuseProgram);
    createPlanetGeometry(neptuneGeometry, neptune, loadedAssets.sphereJSON, loadedAssets.neptuneImage);

    //Skybox
    skyBoxGeometry = new WebGLGeometryJSON(gl, skyboxProgram);
    skyBoxGeometry.createSkybox(loadedAssets.cubeJSON, loadedAssets.skyBoxPosX, loadedAssets.skyBoxNegX, 
                loadedAssets.skyBoxPosY, loadedAssets.skyBoxNegY, loadedAssets.skyBoxPosZ, loadedAssets.skyBoxNegZ);
    skyBoxGeometry.worldMatrix.makeIdentity().makeScale(10000, 10000, 10000);

    //Atmposhere
    atmosphereGeometry = new WebGLGeometryJSON(gl, cloudShaderProgram);
    createPlanetGeometry(atmosphereGeometry, atmosphere, loadedAssets.sphereJSON, loadedAssets.atmopshereImage);

    //Stars
    starGeometry = new WebGLGeometryJSON(gl, starShaderProgram);
    createStars(starGeometry);
    ursaMajorGeometry = new WebGLGeometryJSON(gl, starShaderProgram);
    cancerGeometry = new WebGLGeometryJSON(gl, starShaderProgram);
    canisMajorGeometry = new WebGLGeometryJSON(gl, starShaderProgram);
    cygnusGeometry = new WebGLGeometryJSON(gl, starShaderProgram);
    delphinusGeometry = new WebGLGeometryJSON(gl, starShaderProgram);
    orionGeometry = new WebGLGeometryJSON(gl, starShaderProgram);
    hydrusGeometry = new WebGLGeometryJSON(gl, starShaderProgram);
    tucanaGeometry = new WebGLGeometryJSON(gl, starShaderProgram);
    vulpeculaGeometry = new WebGLGeometryJSON(gl, starShaderProgram);
    piscesGeometry = new WebGLGeometryJSON(gl, starShaderProgram);
    volansGeometry = new WebGLGeometryJSON(gl, starShaderProgram);
    virgoGeometry = new WebGLGeometryJSON(gl, starShaderProgram);
    muscaGeometry = new WebGLGeometryJSON(gl, starShaderProgram);
    ursaMinorGeometry = new WebGLGeometryJSON(gl, starShaderProgram);
    pavoGeometry = new WebGLGeometryJSON(gl, starShaderProgram);
    lupusGeometry = new WebGLGeometryJSON(gl, starShaderProgram);
    doradoGeometry = new WebGLGeometryJSON(gl, starShaderProgram);
    geminiGeometry = new WebGLGeometryJSON(gl, starShaderProgram);
    createCygnus(cygnusGeometry);
    createUrsaMajor(ursaMajorGeometry);
    createCancer(cancerGeometry);
    createCanisMajor(canisMajorGeometry);
    createDelphinus(delphinusGeometry);
    createOrion(orionGeometry);
    createHydrus(hydrusGeometry);
    createTucana(tucanaGeometry);
    createVulpecula(vulpeculaGeometry);
    createPisces(piscesGeometry);
    createVolans(volansGeometry);
    createVirgo(virgoGeometry);
    createMusca(muscaGeometry);
    createUrsaMinor(ursaMinorGeometry);
    createPavo(pavoGeometry);
    createLupus(lupusGeometry);
    createDorado(doradoGeometry);
    createGemini(geminiGeometry);

    //Black Hole
    blackHoleGeometry =  new WebGLGeometryJSON(gl, flatShaderProgram);
    createPlanetGeometry(blackHoleGeometry, blackHole, loadedAssets.sphereJSON);

    //Auras
    mercuryAuraGeometry = new WebGLGeometryJSON(gl, auraShaderProgram);
    venusAuraGeometry = new WebGLGeometryJSON(gl, auraShaderProgram);
    earthAuraGeometry = new WebGLGeometryJSON(gl, auraShaderProgram);
    moonAuraGeometry = new WebGLGeometryJSON(gl, auraShaderProgram);
    marsAuraGeometry = new WebGLGeometryJSON(gl, auraShaderProgram);
    jupiterAuraGeometry = new WebGLGeometryJSON(gl, auraShaderProgram);
    saturnAuraGeometry = new WebGLGeometryJSON(gl, auraShaderProgram);
    uranusAuraGeometry = new WebGLGeometryJSON(gl, auraShaderProgram);
    neptuneAuraGeometry = new WebGLGeometryJSON(gl, auraShaderProgram);
    blackHoleAuraGeometry = new WebGLGeometryJSON(gl, flatShaderProgram);
    createPlanetGeometry(mercuryAuraGeometry, mercuryAura, loadedAssets.sphereJSON);
    createPlanetGeometry(venusAuraGeometry, venusAura, loadedAssets.sphereJSON);
    createPlanetGeometry(earthAuraGeometry, earthAura, loadedAssets.sphereJSON);
    createPlanetGeometry(moonAuraGeometry, moonAura, loadedAssets.sphereJSON);
    createPlanetGeometry(marsAuraGeometry, marsAura, loadedAssets.sphereJSON);
    createPlanetGeometry(jupiterAuraGeometry, jupiterAura, loadedAssets.sphereJSON);
    createPlanetGeometry(saturnAuraGeometry, saturnAura, loadedAssets.sphereJSON);
    createPlanetGeometry(uranusAuraGeometry, uranusAura, loadedAssets.sphereJSON);
    createPlanetGeometry(neptuneAuraGeometry, neptuneAura, loadedAssets.sphereJSON);
    createPlanetGeometry(blackHoleAuraGeometry, blackHoleAura, loadedAssets.sphereJSON);

    //Camera information being updated
    planetSet.sun = sunGeometry;
    planetSet.mercury = mercuryGeometry;
    planetSet.venus = venusGeometry;
    planetSet.earth = earthGeometry;
    planetSet.moon = moonGeometry;
    planetSet.mars = marsGeometry;
    planetSet.jupiter = jupiterGeometry;
    planetSet.saturn = saturnGeometry;
    planetSet.uranus = uranusGeometry;
    planetSet.neptune = neptuneGeometry;
}

// -------------------------------------------------------------------------
//The iterative process for rendering everything to the screen
function updateAndRender() {
    requestAnimationFrame(updateAndRender);

    var aspectRatio = gl.canvasWidth / gl.canvasHeight;

    //Updating positions
    moveSolarSystem();

    //Camera information being updated
    planetSet.sun = sunGeometry;
    planetSet.mercury = mercuryGeometry;
    planetSet.venus = venusGeometry;
    planetSet.earth = earthGeometry;
    planetSet.moon = moonGeometry;
    planetSet.mars = marsGeometry;
    planetSet.jupiter = jupiterGeometry;
    planetSet.saturn = saturnGeometry;
    planetSet.uranus = uranusGeometry;
    planetSet.neptune = neptuneGeometry;

    time.update();
    camera.update(time.deltaTime, time.secondsElapsedSinceStart, planetSet);

    gl.viewport(0, 0, gl.canvasWidth, gl.canvasHeight);

    // this is a new frame so let's clear out whatever happened last frame
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    projectionMatrix.makePerspective(45, aspectRatio, 0.1, 15000);

    //Rendering
    if(!cameraInBlackHole){
        renderSolarSystem();

        configureInput();

        if(blackHoleActive){
            updateBlackHole();
            renderBlackHole();
            checkCameraStatus();
        }
        if(trailActive){
            renderTrails();
        }
        if(auraActive){
            renderAuras();
        }   
        if(constellationActive){
            renderConstellations();
        }else{
            renderConstellationsOff();
        }
    }
}
//-----------------------------------------------------------------
//A resuable function that allows each planets geomotry to be created and initialized
function createPlanetGeometry(geometry, planet, JSON, image, image2){
    geometry.worldMatrix.makeIdentity();
    geometry.worldMatrix.multiply(planet.position).multiply(planet.scale);
    if(!image2){
        geometry.create(JSON, image);
    }else{
        geometry.create(JSON, image, image2);
    }
    
}
// -------------------------------------------------------------------------
//Renders all the default objects in the solar system
function renderSolarSystem(){
    gl.enable(gl.DEPTH_TEST);
    skyBoxGeometry.renderSkybox(camera, projectionMatrix, skyboxProgram);

    sunGeometry.render(camera, projectionMatrix, sunProgram, null, null, time.deltaTime);
    mercuryGeometry.render(camera, projectionMatrix, diffuseProgram);
    venusGeometry.render(camera, projectionMatrix, diffuseProgram);
    earthGeometry.render(camera, projectionMatrix, earthMoonProgram, moon, moonGeometry);
    moonGeometry.render(camera, projectionMatrix, earthMoonProgram, earth, earthGeometry);
    marsGeometry.render(camera, projectionMatrix, diffuseProgram);
    jupiterGeometry.render(camera, projectionMatrix, diffuseProgram);
    saturnGeometry.render(camera, projectionMatrix, diffuseProgram);
    saturnRingGeometry.render(camera, projectionMatrix, saturnRingProgram);
    uranusGeometry.render(camera, projectionMatrix, diffuseProgram);
    neptuneGeometry.render(camera, projectionMatrix, diffuseProgram);

    starGeometry.renderStarSystem(camera, projectionMatrix, starShaderProgram, 2.0, starCount, time.deltaTime, new Vector3(1,1,1));
    
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    atmosphereGeometry.render(camera, projectionMatrix, cloudShaderProgram);
}
//--------------------------------------------------------------
//Responsible for all the "planets" rotations and orbits
function moveSolarSystem(){
    var systemCenter = sun.position.getPosition();
    movePlanet(sunGeometry, sun, systemCenter);
    movePlanet(mercuryGeometry, mercury, systemCenter);
    movePlanet(venusGeometry, venus, systemCenter);
    moveEarth(earthGeometry, earth, systemCenter);
    movePlanet(moonGeometry, moon, earthGeometry.worldMatrix.getPosition());
    movePlanet(marsGeometry, mars, systemCenter);
    movePlanet(jupiterGeometry, jupiter, systemCenter);
    movePlanet(saturnGeometry, saturn, systemCenter);
    movePlanet(uranusGeometry, uranus, systemCenter);
    movePlanet(neptuneGeometry, neptune, systemCenter);

    moveEarth(atmosphereGeometry, atmosphere, systemCenter);
    movePlanet(saturnRingGeometry, sRings, systemCenter);
    saturnRingGeometry.worldMatrix.multiply(new Matrix4().makeRotationX(90));

    movePlanet(mercuryAuraGeometry, mercuryAura, systemCenter);
    movePlanet(venusAuraGeometry, venusAura, systemCenter);
    movePlanet(earthAuraGeometry, earthAura, systemCenter);
    movePlanet(moonAuraGeometry, moonAura, earthGeometry.worldMatrix.getPosition());
    movePlanet(marsAuraGeometry, marsAura, systemCenter);
    movePlanet(jupiterAuraGeometry, jupiterAura, systemCenter);
    movePlanet(saturnAuraGeometry, saturnAura, systemCenter);
    movePlanet(uranusAuraGeometry, uranusAura, systemCenter);
    movePlanet(neptuneAuraGeometry, neptuneAura, systemCenter);
}
//----------------------------------------------------------------
//Updates each planets position based on its current position, rotation, and parents position
function movePlanet(planetGeometry, planet, orbitCenter) {
    var orbitMatrix = orbitPlanet(planet, orbitCenter);
    planetGeometry.worldMatrix.makeIdentity().multiply(planet.position).multiply(orbitMatrix).multiply(new Matrix4().makeRotationY(planet.rotationSpeed * time.secondsElapsedSinceStart)).multiply(planet.scale);    

}
//--------------------------------------------------------------
//Specifically moves earths and its cloud layer so that it also implments an axis revision similiar to its real life counterpart
function moveEarth(planetGeometry, planet, orbitCenter) {
    var orbitMatrix = orbitPlanet(planet, orbitCenter);
    planetGeometry.worldMatrix.makeIdentity()
                .multiply(planet.position)
                .multiply(orbitMatrix)
                .multiply(earthAxisRevision)
                .multiply(new Matrix4().makeRotationY(planet.rotationSpeed * time.secondsElapsedSinceStart))
                .multiply(planet.scale);    
}
//----------------------------------------------------------------
//Resposible for updating each planets position based on its center of orbit
function orbitPlanet(planet, center){
    var distX = planet.position.getElement(0,3);
    var distZ = planet.position.getElement(2,3);
    var x = center.x - distX + planet.radiusFromOrbit * Math.sin(time.secondsElapsedSinceStart * planet.orbitSpeed);
    var y = 0; 
    var z = center.z -distZ - planet.radiusFromOrbit * Math.cos(time.secondsElapsedSinceStart * planet.orbitSpeed);
    var movementMatrix = new Matrix4().makeTranslation(x, y, z)
    return movementMatrix;
}
//-----------------------------------------------------------------
//Renders each "planets" trail
function renderTrails(){
    mercuryGeometry.renderTrail(camera, projectionMatrix, planetTrailProgram, time.deltaTime, mercury.trailColor);
    venusGeometry.renderTrail(camera, projectionMatrix, planetTrailProgram, time.deltaTime, venus.trailColor);
    earthGeometry.renderTrail(camera, projectionMatrix, planetTrailProgram, time.deltaTime, earth.trailColor);
    moonGeometry.renderTrail(camera, projectionMatrix, planetTrailProgram, time.deltaTime, moon.trailColor);
    marsGeometry.renderTrail(camera, projectionMatrix, planetTrailProgram, time.deltaTime, mars.trailColor);
    jupiterGeometry.renderTrail(camera, projectionMatrix, planetTrailProgram, time.deltaTime, jupiter.trailColor);
    saturnGeometry.renderTrail(camera, projectionMatrix, planetTrailProgram, time.deltaTime, saturn.trailColor);
    uranusGeometry.renderTrail(camera, projectionMatrix, planetTrailProgram, time.deltaTime, uranus.trailColor);
    neptuneGeometry.renderTrail(camera, projectionMatrix, planetTrailProgram, time.deltaTime, neptune.trailColor);
}
//-----------------------------------------------------------------
//Renders the auras surrounding each "planet"
function renderAuras(){
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    gl.enable(gl.CULL_FACE)
    gl.cullFace(gl.FRONT);
    mercuryAuraGeometry.renderAura(camera, projectionMatrix, auraShaderProgram, mercuryAura.trailColor, time.deltaTime);
    venusAuraGeometry.renderAura(camera, projectionMatrix, auraShaderProgram, venusAura.trailColor, time.deltaTime);
    earthAuraGeometry.renderAura(camera, projectionMatrix, auraShaderProgram, earthAura.trailColor, time.deltaTime);
    moonAuraGeometry.renderAura(camera, projectionMatrix, auraShaderProgram, moonAura.trailColor, time.deltaTime);
    marsAuraGeometry.renderAura(camera, projectionMatrix, auraShaderProgram, marsAura.trailColor, time.deltaTime);
    jupiterAuraGeometry.renderAura(camera, projectionMatrix, auraShaderProgram, jupiterAura.trailColor, time.deltaTime);
    saturnAuraGeometry.renderAura(camera, projectionMatrix, auraShaderProgram, saturnAura.trailColor, time.deltaTime);
    uranusAuraGeometry.renderAura(camera, projectionMatrix, auraShaderProgram, uranusAura.trailColor, time.deltaTime);
    neptuneAuraGeometry.renderAura(camera, projectionMatrix, auraShaderProgram, neptuneAura.trailColor, time.deltaTime);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.disable(gl.CULL_FACE);
}
//-----------------------------------------------------------------
//Renders all the constellations
function renderConstellations(){
    gl.enable(gl.POLYGON_OFFSET_FILL);
    gl.polygonOffset(-1.0, -1.0);
    ursaMajorGeometry.renderConstellation(camera, projectionMatrix, starShaderProgram, 5.0, 28, 0, new Vector3(0,0.6,0.6));
    cancerGeometry.renderConstellation(camera, projectionMatrix, starShaderProgram, 5.0, 6, 0 , new Vector3(0,0.6,0.6));
    canisMajorGeometry.renderConstellation(camera, projectionMatrix, starShaderProgram, 5.0, 17, 0 , new Vector3(0,0.6,0.6));
    cygnusGeometry.renderConstellation(camera, projectionMatrix, starShaderProgram, 5.0, 13, 0 , new Vector3(0,0.6,0.6));
    delphinusGeometry.renderConstellation(camera, projectionMatrix, starShaderProgram, 5.0, 6, 0 , new Vector3(0,0.6,0.6));
    orionGeometry.renderConstellation(camera, projectionMatrix, starShaderProgram, 5.0, 34, 0 , new Vector3(0,0.6,0.6));
    hydrusGeometry.renderConstellation(camera, projectionMatrix, starShaderProgram, 5.0, 5, 0 , new Vector3(0,0.6,0.6));
    tucanaGeometry.renderConstellation(camera, projectionMatrix, starShaderProgram, 5.0, 7, 0 , new Vector3(0,0.6,0.6));
    vulpeculaGeometry.renderConstellation(camera, projectionMatrix, starShaderProgram, 5.0, 5, 0 , new Vector3(0,0.6,0.6));
    piscesGeometry.renderConstellation(camera, projectionMatrix, starShaderProgram, 5.0, 18, 0, new Vector3(0,0.6,0.6));
    volansGeometry.renderConstellation(camera, projectionMatrix, starShaderProgram, 5.0, 8, 0, new Vector3(0,0.6,0.6));
    virgoGeometry.renderConstellation(camera, projectionMatrix, starShaderProgram, 5.0, 20, 0, new Vector3(0,0.6,0.6));
    muscaGeometry.renderConstellation(camera, projectionMatrix, starShaderProgram, 5.0, 7, 0, new Vector3(0,0.6,0.6));
    ursaMinorGeometry.renderConstellation(camera, projectionMatrix, starShaderProgram, 5.0, 8, 0, new Vector3(0,0.6,0.6));
    pavoGeometry.renderConstellation(camera, projectionMatrix, starShaderProgram, 5.0, 15, 0 , new Vector3(0,0.6,0.6));
    lupusGeometry.renderConstellation(camera, projectionMatrix, starShaderProgram, 5.0, 11, 0, new Vector3(0,0.6,0.6));
    doradoGeometry.renderConstellation(camera, projectionMatrix, starShaderProgram, 5.0, 8, 0, new Vector3(0,0.6,0.6));
    geminiGeometry.renderConstellation(camera, projectionMatrix, starShaderProgram, 5.0, 26, 0, new Vector3(0,0.6,0.6));
    gl.disable(gl.POLYGON_OFFSET_FILL);
}
//-----------------------------------------------------------------
//Renders the stars within the consellations without connecting the lines
function renderConstellationsOff(){
    ursaMajorGeometry.renderStarSystem(camera, projectionMatrix, starShaderProgram, 2.0, 28, 0, new Vector3(1,1,1));
    cancerGeometry.renderStarSystem(camera, projectionMatrix, starShaderProgram, 2.0, 6, 0, new Vector3(1,1,1));
    canisMajorGeometry.renderStarSystem(camera, projectionMatrix, starShaderProgram, 2.0, 17, 0, new Vector3(1,1,1));
    cygnusGeometry.renderStarSystem(camera, projectionMatrix, starShaderProgram, 2.0, 13, 0, new Vector3(1,1,1));
    delphinusGeometry.renderStarSystem(camera, projectionMatrix, starShaderProgram, 2.0, 6, 0, new Vector3(1,1,1));
    orionGeometry.renderStarSystem(camera, projectionMatrix, starShaderProgram, 2.0, 34, 0, new Vector3(1,1,1));
    canisMajorGeometry.renderStarSystem(camera, projectionMatrix, starShaderProgram, 2.0, 17, 0, new Vector3(1,1,1));
    hydrusGeometry.renderStarSystem(camera, projectionMatrix, starShaderProgram, 2.0, 5, 0, new Vector3(1,1,1));
    tucanaGeometry.renderStarSystem(camera, projectionMatrix, starShaderProgram, 2.0, 7, 0, new Vector3(1,1,1));
    vulpeculaGeometry.renderStarSystem(camera, projectionMatrix, starShaderProgram, 2.0, 5, 0, new Vector3(1,1,1));
    piscesGeometry.renderStarSystem(camera, projectionMatrix, starShaderProgram, 2.0, 18, 0, new Vector3(1,1,1));
    volansGeometry.renderStarSystem(camera, projectionMatrix, starShaderProgram, 2.0, 8, 0, new Vector3(1,1,1));
    virgoGeometry.renderStarSystem(camera, projectionMatrix, starShaderProgram, 2.0, 20, 0, new Vector3(1,1,1));
    muscaGeometry.renderStarSystem(camera, projectionMatrix, starShaderProgram, 2.0, 7, 0, new Vector3(1,1,1));
    ursaMinorGeometry.renderStarSystem(camera, projectionMatrix, starShaderProgram, 2.0, 8, 0, new Vector3(1,1,1));
    pavoGeometry.renderStarSystem(camera, projectionMatrix, starShaderProgram, 2.0, 15, 0, new Vector3(1,1,1));
    lupusGeometry.renderStarSystem(camera, projectionMatrix, starShaderProgram, 2.0, 11, 0, new Vector3(1,1,1));
    doradoGeometry.renderStarSystem(camera, projectionMatrix, starShaderProgram, 2.0, 8, 0, new Vector3(1,1,1));
    geminiGeometry.renderStarSystem(camera, projectionMatrix, starShaderProgram, 2.0, 26, 0, new Vector3(1,1,1));
}
//-----------------------------------------------------------------
//Renders the black hole
function renderBlackHole(){
    blackHoleGeometry.renderAura(camera, projectionMatrix, flatShaderProgram, blackHole.trailColor, 0);
    gl.enable(gl.CULL_FACE)
    gl.cullFace(gl.FRONT);
    blackHoleAuraGeometry.renderAura(camera, projectionMatrix, flatShaderProgram, blackHoleAura.trailColor, 0);
    gl.disable(gl.CULL_FACE);
}
//-----------------------------------------------------------------
//Resets the verticies of the trails so each time the trail starts from scratch
function resetTrails(){
    mercuryGeometry.lineVerticies = [];
    venusGeometry.lineVerticies = [];
    earthGeometry.lineVerticies = [];
    moonGeometry.lineVerticies = [];
    marsGeometry.lineVerticies = [];
    jupiterGeometry.lineVerticies = [];
    saturnGeometry.lineVerticies = [];
    uranusGeometry.lineVerticies = [];
    neptuneGeometry.lineVerticies = [];
}
//-----------------------------------------------------------------
//Creates star positions for all the randomized flickering start
function createStars(geometry){
    var starPositions = [];
    for (let i = 0; i < starCount; i++) {
        do {
           var x = (Math.random() - 0.5) * 3000;
           var y = (Math.random() - 0.5) * 3000;
           var z = (Math.random() - 0.5) * 3000;
        } while (Math.sqrt(x * x + y * y + z * z) < 300);

        starPositions.push(x,y,z);
    }
    blackHole.position = new Matrix4().makeTranslation(starPositions[0], starPositions[1], starPositions[2]);
    blackHoleAura.position = blackHole.position;

    var starSeeds = [];
    for (let i = 0; i < starCount; i++) {
        starSeeds.push(Math.random());
    }
    geometry.createStarSystem(starPositions, starSeeds);
}
//-----------------------------------------------------------------
//Increases the black holes size over time
function updateBlackHole(){
    blackHole.scale.multiply(new Matrix4().makeScale(1.003, 1.003, 1.003));
    blackHoleAura.scale.multiply(new Matrix4().makeScale(1.003, 1.003, 1.003));
    blackHoleGeometry.worldMatrix.makeIdentity().multiply(blackHole.position).multiply(blackHole.scale);
    blackHoleAuraGeometry.worldMatrix.makeIdentity().multiply(blackHoleAura.position).multiply(blackHoleAura.scale);
}
//-----------------------------------------------------------------
//Checks if the camera is inside the black hole yet and will update said boolean accordingly
function checkCameraStatus(){
    var camPos = (camera.cameraWorldMatrix.getPosition());
    var holeCenter = (blackHole.position.getPosition());
    var dist = new Vector4().fromTo(camPos, holeCenter);
    var dist3 = new Vector3(dist.x, dist.y, dist.z);
    var length = dist3.length();
    if((blackHole.scale.getElement(0,0) * 50) > length ){
        cameraInBlackHole = true;
    }
}
//-----------------------------------------------------------------
//Checks for input and sets certain flags based on it
function configureInput(){
    //Trail
    if(appInput.t && !trailActive && (time.secondsElapsedSinceStart - timeTrailActivated) > 0.25){
        trailActive = true;
        timeTrailActivated = time.secondsElapsedSinceStart;
    }
    if(appInput.t && trailActive && (time.secondsElapsedSinceStart - timeTrailActivated) > 0.25){
        trailActive = false;
        timeTrailActivated = time.secondsElapsedSinceStart;
        resetTrails();
    }
    //Aura
    if(appInput.a && !auraActive && (time.secondsElapsedSinceStart - timeAuraActivated) > 0.25){
        auraActive = true;
        timeAuraActivated = time.secondsElapsedSinceStart;
    }
    if(appInput.a && auraActive && (time.secondsElapsedSinceStart - timeAuraActivated) > 0.25){
        auraActive = false;
        timeAuraActivated = time.secondsElapsedSinceStart;
    }
    //Constellation
    if(appInput.c && !constellationActive && (time.secondsElapsedSinceStart - timeConstellationActivated) > 0.25){
        constellationActive = true;
        timeConstellationActivated = time.secondsElapsedSinceStart;
    }
    if(appInput.c && constellationActive && (time.secondsElapsedSinceStart - timeConstellationActivated) > 0.25){
        constellationActive = false;
        timeConstellationActivated = time.secondsElapsedSinceStart;
    }
    //Black Hole
    if(appInput.b){
        blackHoleActive = true;
    }
        
}
//-----------------------------------------------------------------
function createUrsaMajor(geometry){
    var starPositions = [];
    starPositions.push(
        -800, 1200, -1500,
        -500, 1200, -1500,
        -400, 1140, -1500,
        -300, 1040, -1500,
        -290, 900, -1500,
        -340, 740, -1500,
        -220, 540, -1500,
        0, 370, -1500,
        -220, 540, -1500,
        40, 400, -1500,
        -220, 540, -1500,
        -340, 740, -1500,
        -290, 900, -1500,
        0, 825, -1500,
        280, 680, -1500,
        340, 600, -1500,
        480, 450, -1500,
        340, 600, -1500,
        500, 480, -1500,
        340, 600, -1500,
        280, 680, -1500,
        320, 800, -1500,
        690, 850, -1500,
        410, 930, -1500,
        70, 1000, -1500,
        0, 825, -1500,
        70, 1000, -1500,
        -300, 1040, -1500,
    );
    var starSeeds = [];
    for (let i = 0; i < 28; i++) {
        starSeeds.push(0);
    }
    geometry.createStarSystem(starPositions, starSeeds);
}
//-----------------------------------------------------------------
function createCancer(geometry){
    var starPositions = [];
    starPositions.push(
        1400, 1000, -1200,
        1300, 1600, -1100,
        1000, 1350, -1300,
        1300, 1600, -1100,
        1400, 1800, -1050,
        1580, 2300, -1000,
        0, 0, -1500
    );
    var starSeeds = [];
    for (let i = 0; i < 6; i++) {
        starSeeds.push(0);
    }
    geometry.createStarSystem(starPositions, starSeeds);
}
//-----------------------------------------------------------------
function createCanisMajor(geometry){
    var starPositions = [];
    starPositions.push(
        1400, 400, 120,
        1400, 750, -40,
        1500, 880, -50,
        1500, 900, -200,
        1500, 880, -50,
        1500, 910, 60,
        1500, 850, 90,
        1500, 910, 60,
        1600, 1080, 530,
        1600, 950, 480,
        1600, 900, 580,
        1600, 950, 480,
        1600, 1080, 530,
        1600, 1180, 450,
        1600, 1300, 440,
        1600, 1350, 800,
        1600, 1180, 450,
    );
    var starSeeds = [];
    for (let i = 0; i < 17; i++) {
        starSeeds.push(0);
    }
    geometry.createStarSystem(starPositions, starSeeds);
}
//-----------------------------------------------------------------
function createCygnus(geometry){
    var starPositions = [];
    starPositions.push(
        800, 500, 1500,
        780, 800, 1500,
        820, 1100, 1400,
        1050, 1100, 1400,
        820, 1100, 1400,
        870, 1500, 1350,
        1090, 1800, 1350,
        1100, 1850, 1250,
        1090, 1800, 1350,
        870, 1500, 1350,
        820, 1100, 1400,
        550, 1100, 1400,
        250, 1120, 1400,
    );
    var starSeeds = [];
    for (let i = 0; i < 13; i++) {
        starSeeds.push(0);
    }
    geometry.createStarSystem(starPositions, starSeeds);
}
//-----------------------------------------------------------------
function createDelphinus(geometry){
    var starPositions = [];
    starPositions.push(
        -300, 2600, 1500,
        250, 2800, 900,
        550, 3300, 800,
        950, 3000, 800,
        600, 3000, 1000,
        250, 2800, 900,
    );
    var starSeeds = [];
    for (let i = 0; i < 6; i++) {
        starSeeds.push(0);
    }
    geometry.createStarSystem(starPositions, starSeeds);
}
//-----------------------------------------------------------------
function createOrion(geometry){
    var starPositions = [];
    starPositions.push(
        -900, 300, 1500,
        -1000, 600, 1500,
        -1090, 670, 1500,
        -1000, 600, 1500,
        -900, 1000, 1500,
        -860, 1050, 1500,
        -760, 1200, 1500,
        -820, 1550, 1500,
        -760, 1200, 1500,
        -800, 1230, 1500,
        -920, 1570, 1500,
        -800, 1230, 1500,
        -760, 1200, 1500,
        -860, 1050, 1500,
        -900, 1000, 1500,
        -1200, 1200, 1500,
        -1300, 1100, 1500,
        -1650, 1170, 1300,
        -1650, 1250, 1300,
        -1550, 1450, 1300,
        -1650, 1250, 1300,
        -1650, 1170, 1300,
        -1630, 1090, 1300,
        -1600, 980, 1300,
        -1560, 940, 1300,
        -1600, 980, 1300,
        -1630, 1090, 1300,
        -1650, 1170, 1300,
        -1300, 1100, 1500,
        -1220, 780, 1500,
        -1090, 670, 1500,
        -1220, 780, 1500,
        -1500, 420, 1500,
        -900, 300, 1500,
    );
    var starSeeds = [];
    for (let i = 0; i < 34; i++) {
        starSeeds.push(0);
    }
    geometry.createStarSystem(starPositions, starSeeds);
}
//-----------------------------------------------------------------
function createHydrus(geometry){
    var starPositions = [];
    starPositions.push(
        -1500, 800, -300,
        -1500, 900, 200,
        -1300, 1200, 50,
        -1300, 1190, 10,
        -1100, 1520, -120,
    );
    var starSeeds = [];
    for (let i = 0; i < 5; i++) {
        starSeeds.push(0);
    }
    geometry.createStarSystem(starPositions, starSeeds);
}
//-----------------------------------------------------------------
function createTucana(geometry){
    var starPositions = [];
    starPositions.push(
        -320, 1350, -1000,
        -180, 1700, -1000,
        -1000, 2800, -1000,
        -1220, 1350, -900,
        -1220, 1250, -700,
        -1350, 1450, -640,
        -1000, 2800, -1000,
    );
    var starSeeds = [];
    for (let i = 0; i < 7; i++) {
        starSeeds.push(0);
    }
    geometry.createStarSystem(starPositions, starSeeds);
}
//-----------------------------------------------------------------
function createVulpecula(geometry){
    var starPositions = [];
    starPositions.push(
        400, 1500, -530,
        50, 1500, -400,
        0, 1500, 0,
        -600, 1500, 100,
        -800, 1500, 500,
    );
    var starSeeds = [];
    for (let i = 0; i < 5; i++) {
        starSeeds.push(0);
    }
    geometry.createStarSystem(starPositions, starSeeds);
}
//-----------------------------------------------------------------
function createPisces(geometry){
    var starPositions = [];
    starPositions.push(
        -125, -750, 1500,
        -150, -800, 1500,
        -120, -840, 1500,
        -80, -810, 1500,
        -80, -750, 1500,
        -125, -750, 1500,
        -130, -650, 1500,
        -125, -350, 1500,
        -110, -250, 1500,
        -70, -50, 1500,
        -50, 50, 1500,
        0, 300, 1500,
        -200, 100, 1500,
        -400, -70, 1500,
        -700, -300, 1500,
        -900, -320, 1500,
        -810, -240, 1500,
        -700, -300, 1500,
    );
    var starSeeds = [];
    for (let i = 0; i < 18; i++) {
        starSeeds.push(0);
    }
    geometry.createStarSystem(starPositions, starSeeds);
}
//-----------------------------------------------------------------
function createVolans(geometry){
    var starPositions = [];
    starPositions.push(
        1500, -300, 1500,
        1500, -300, 800,
        1500, -100, 650,
        1500, -180, 300,
        1500, -300, 800,
        1500, -800, 1050,
        1500, -650, 1600,
        1500, -300, 800,
    );
    var starSeeds = [];
    for (let i = 0; i < 8; i++) {
        starSeeds.push(0);
    }
    geometry.createStarSystem(starPositions, starSeeds);
}
//-----------------------------------------------------------------
function createVirgo(geometry){
    var starPositions = [];
    starPositions.push(
        0, -500, -1500,
        -100, -400, -1500,
        -150, -250, -1500,
        -140, -100, -1500,
        -180, 50, -1500,
        -280, 100, -1500,
        -350, 0, -1500,
        -140, -100, -1500,
        -150, -250, -1500,
        -280, -300, -1500,
        -450, -300, -1500,
        -280, -300, -1500,
        -150, -250, -1500,
        -180, -550, -1500,
        -100, -850, -1500,
        -150, -1050, -1500,
        -100, -850, -1500,
        -180, -550, -1500,
        -250, -700, -1500,
        -320, -1050, -1500,
    );
    var starSeeds = [];
    for (let i = 0; i < 20; i++) {
        starSeeds.push(0);
    }
    geometry.createStarSystem(starPositions, starSeeds);
}
//-----------------------------------------------------------------
function createMusca(geometry){
    var starPositions = [];
    starPositions.push(
        1500, -150, -700,
        1500, -120, -500,
        1500, 300, -900,
        1500, 0, -1300,
        1500, -150, -700,
        1500, -450, -700,
        1500, -1050, -900,
    );
    var starSeeds = [];
    for (let i = 0; i < 7; i++) {
        starSeeds.push(0);
    }
    geometry.createStarSystem(starPositions, starSeeds);
}
//-----------------------------------------------------------------
function createUrsaMinor(geometry){
    var starPositions = [];
    starPositions.push(
        750, 100, -1500,
        650, -100, -1500,
        560, -300, -1500,
        600, -600, -1500,
        500, -650, -1500,
        610, -880, -1500,
        730, -820, -1500,
        600, -600, -1500,
    );
    var starSeeds = [];
    for (let i = 0; i < 8; i++) {
        starSeeds.push(0);
    }
    geometry.createStarSystem(starPositions, starSeeds);
}
//-----------------------------------------------------------------
function createPavo(geometry){
    var starPositions = [];
    starPositions.push(
        -1500, -500, 700,
        -1500, -200, 730,
        -1500, 200, 900,
        -1500, -270, 1130,
        -1500, -240, 900,
        -1500, -200, 730,
        -1500, -400, 330,
        -1500, -200, 730,
        -1500, -240, 350,
        -1500, -130, 0,
        -1500, -180, -80,
        -1500, -130, 0,
        -1500, 0, 20,
        -1500, 0, 300,
        -1500, -200, 730,
    );
    var starSeeds = [];
    for (let i = 0; i < 15; i++) {
        starSeeds.push(0);
    }
    geometry.createStarSystem(starPositions, starSeeds);
}
//-----------------------------------------------------------------
function createLupus(geometry){
    var starPositions = [];
    starPositions.push(
        -1500, 150, -1100,
        -1500, 300, -1200,
        -1500, 400, -1150,
        -1500, 700, -1200,
        -1500, 450, -1420,
        -1500, 730, -1500,
        -1500, 700, -1200,
        -1500, 400, -1150,
        -1500, 250, -950,
        -1500, 150, -600,
        -1500, 0, -750,
    );
    var starSeeds = [];
    for (let i = 0; i < 11; i++) {
        starSeeds.push(0);
    }
    geometry.createStarSystem(starPositions, starSeeds);
}
//-----------------------------------------------------------------
function createDorado(geometry){
    var starPositions = [];
    starPositions.push(
        -1500, -900, -1500,
        -1500, -1100, -900,
        -1500, -1070, -300,
        -1400, -1570, 300,
        -1400, -1570, 600,
        -1300, -1970, 500,
        -1400, -1570, 300,
        -1500, -1100, -900,
    );
    var starSeeds = [];
    for (let i = 0; i < 8; i++) {
        starSeeds.push(0);
    }
    geometry.createStarSystem(starPositions, starSeeds);
}
//-----------------------------------------------------------------
function createGemini(geometry){
    var starPositions = [];
    starPositions.push(
        -400, -1500, -400,
        -100, -1500, -150,
        100, -1500, 0,
        150, -1500, -250,
        -250, -1500, -500,
        150, -1500, -250,
        100, -1500, 0,
        300, -1500, 350,
        450, -1500, 270,
        300, -1500, 350,
        350, -1500, 500,
        300, -1500, 350,
        150, -1500, 400,
        0, -1500, 500,
        200, -1500, 600,
        240, -1500, 600,
        200, -1500, 600,
        0, -1500, 500,
        -150, -1500, 700,
        0, -1500, 500,
        -350, -1500, 150,
        -550, -1500, -150,
        -350, -1500, 150,
        -550, -1500, 0,
        -640, -1500, -30,
        -750, -1500, 0,
    );
    var starSeeds = [];
    for (let i = 0; i < 26; i++) {
        starSeeds.push(0);
    }
    geometry.createStarSystem(starPositions, starSeeds);
}
// EOF 00100001-10/

