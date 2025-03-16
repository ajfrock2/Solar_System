function OrbitCamera(input) {
    this.cameraWorldMatrix = new Matrix4();
    this.cameraTarget = new Vector4(0, 0, 0, 1);
    this.yawDegrees = 0;
    this.pitchDegrees = -45;
    this.minDistance = 30;
    this.maxDistance = 100;
    this.zoomScale = 1;
    this.planetIndex = 0;
    this.timeSinceChange = 0;
    this.targetPosition = new Vector4(0, 0, 0, 1);

    var lastMouseX = 0;
    var lastMouseY = 0;
    var isDragging = false;

    // -------------------------------------------------------------------------
    this.getViewMatrix = function () {
        return this.cameraWorldMatrix.clone().inverse();
    }

    // -----------------------------------------------------------------------------
    this.getPosition = function() {
      return new Vector4(
          this.cameraWorldMatrix.elements[3],
          this.cameraWorldMatrix.elements[7],
          this.cameraWorldMatrix.elements[11],
          1
      );
    }

    // -------------------------------------------------------------------------
    this.getRight = function () {
        return new Vector3(
            this.cameraWorldMatrix.elements[0],
            this.cameraWorldMatrix.elements[4],
            this.cameraWorldMatrix.elements[8]
        ).normalize();
    }

    // -------------------------------------------------------------------------
    this.getUp = function () {
        return new Vector3(
            this.cameraWorldMatrix.elements[1],
            this.cameraWorldMatrix.elements[5],
            this.cameraWorldMatrix.elements[9]
        ).normalize();
    }

    // -------------------------------------------------------------------------
    this.update = function (dt, secondsElapsedSinceStart, planetSet) {
        // Extract the basis vector corresponding to forward
        var currentForward = new Vector3(
            this.cameraWorldMatrix.elements[2],
            this.cameraWorldMatrix.elements[6],
            this.cameraWorldMatrix.elements[10]
        );

        var tether = new Vector4(0, 0, this.minDistance + (this.maxDistance - this.minDistance) * this.zoomScale, 0);
        yaw = new Matrix4().makeRotationY(this.yawDegrees);
        pitch = new Matrix4().makeRotationX(this.pitchDegrees);
        
        var transformedTether = pitch.multiplyVector(tether);
        transformedTether = yaw.multiplyVector(transformedTether);

        if(input.right && (secondsElapsedSinceStart - this.timeSinceChange) > 0.5){
            this.timeSinceChange = secondsElapsedSinceStart;
            this.planetIndex = (this.planetIndex + 1) % 10;
        }

        if(input.left && (secondsElapsedSinceStart - this.timeSinceChange) > 0.5){
            this.timeSinceChange = secondsElapsedSinceStart;
            this.planetIndex = (this.planetIndex - 1 + 10) % 10;
        } 

        changeCamera(this.planetIndex, planetSet, this);
        var position = this.cameraTarget.clone().add(transformedTether);
        this.lookAt(position, this.targetPosition);   
        //console.log(this.planetIndex);    
    }

    // -------------------------------------------------------------------------
    this.lookAt = function (eyePos, targetPos) {
        var worldUp = new Vector4(0, 1, 0, 0);

        var cross = function (v1, v2) {
            return new Vector4(
                v1.y * v2.z - v1.z * v2.y,
                v1.z * v2.x - v1.x * v2.z,
                v1.x * v2.y - v1.y * v2.x,
                0
            );
        }

        this.cameraWorldMatrix.makeIdentity();

        var forward = targetPos.clone().subtract(eyePos).normalize();
        var right = cross(forward, worldUp).normalize();
        var up = cross(right, forward);

        var e = this.cameraWorldMatrix.elements;
        e[0] = right.x; e[1] = up.x; e[2] = -forward.x; e[3] = eyePos.x;
        e[4] = right.y; e[5] = up.y; e[6] = -forward.y; e[7] = eyePos.y;
        e[8] = right.z; e[9] = up.z; e[10] = -forward.z; e[11] = eyePos.z;
        e[12] = 0; e[13] = 0; e[14] = 0; e[15] = 1;

        return this;
    };

    // -------------------------------------------------------------------------
    document.onmousedown = function (evt) {
        isDragging = true;
        lastMouseX = evt.pageX;
        lastMouseY = evt.pageY;
    }

    // -------------------------------------------------------------------------
    document.onmousemove = function (evt) {
        if (isDragging) {
            this.yawDegrees -= (evt.pageX - lastMouseX) * 0.5;
            this.pitchDegrees -= (evt.pageY - lastMouseY) * 0.5;

            this.pitchDegrees = Math.min(this.pitchDegrees, 85);
            this.pitchDegrees = Math.max(this.pitchDegrees, -85);

            lastMouseX = evt.pageX;
            lastMouseY = evt.pageY;
        }
    }.bind(this)

    // -------------------------------------------------------------------------
    document.onmousewheel = function (evt) {
        this.zoomScale -= evt.wheelDelta * 0.001;
        this.zoomScale = Math.min(this.zoomScale, 1);
        this.zoomScale = Math.max(this.zoomScale, 0);
    }.bind(this)

    // -------------------------------------------------------------------------
    document.onmouseup = function (evt) {
        isDragging = false;
    }
    
}

function changeCamera(index, planets, camera){
    //Changes the camera focus point based on arrow key interaction
    switch (index) {
        case 0: //Sun
            camera.targetPosition = planets.sun.worldMatrix.getPosition();
            camera.cameraTarget = new Vector4(camera.targetPosition.x + 1, camera.targetPosition.y + 1, camera.targetPosition.z + 1);
            camera.minDistance = 30;
            break;
        case 1: //Mercury
            camera.targetPosition = planets.mercury.worldMatrix.getPosition();
            camera.cameraTarget = new Vector4(camera.targetPosition.x + 1, camera.targetPosition.y + 1, camera.targetPosition.z + 1);
            camera.minDistance = 10;
            break;
        case 2: //Venus
            camera.targetPosition = planets.venus.worldMatrix.getPosition();
            camera.cameraTarget = new Vector4(camera.targetPosition.x + 1, camera.targetPosition.y + 1, camera.targetPosition.z + 1);
            camera.minDistance = 10;
            break;
        case 3: //Earth
            camera.targetPosition = planets.earth.worldMatrix.getPosition();
            camera.cameraTarget = new Vector4(camera.targetPosition.x + 1, camera.targetPosition.y + 1, camera.targetPosition.z + 1);
            camera.minDistance = 10;
            break;
        case 4: //Moon
            camera.targetPosition = planets.moon.worldMatrix.getPosition();
            camera.cameraTarget = new Vector4(camera.targetPosition.x + 1, camera.targetPosition.y + 1, camera.targetPosition.z + 1);
            camera.minDistance = 7;
            break;
        case 5: //Mars
            camera.targetPosition = planets.mars.worldMatrix.getPosition();
            camera.cameraTarget = new Vector4(camera.targetPosition.x + 1, camera.targetPosition.y + 1, camera.targetPosition.z + 1);
            camera.minDistance = 10;
            break;
        case 6: //Jupiter
            camera.targetPosition = planets.jupiter.worldMatrix.getPosition();
            camera.cameraTarget = new Vector4(camera.targetPosition.x + 1, camera.targetPosition.y + 1, camera.targetPosition.z + 1);
            camera.minDistance = 20;
            break;
        case 7: //Saturn
            camera.targetPosition = planets.saturn.worldMatrix.getPosition();
            camera.cameraTarget = new Vector4(camera.targetPosition.x + 1, camera.targetPosition.y + 1, camera.targetPosition.z + 1);
            camera.minDistance = 20;
            break;
        case 8: //Uranus
            camera.targetPosition = planets.uranus.worldMatrix.getPosition();
            camera.cameraTarget = new Vector4(camera.targetPosition.x + 1, camera.targetPosition.y + 1, camera.targetPosition.z + 1);
            camera.minDistance = 15;
            break;
        case 9: //Neptune
            camera.targetPosition = planets.neptune.worldMatrix.getPosition();
            camera.cameraTarget = new Vector4(camera.targetPosition.x + 1, camera.targetPosition.y + 1, camera.targetPosition.z + 1);
            camera.minDistance = 15;
            break;
        default:
    }
}

// EOF 00100001-10