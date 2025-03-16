/*
 * A simple object to encapsulate the data and operations of object rasterization
 */
function WebGLGeometryJSON(gl) {
	this.gl = gl;
	this.worldMatrix = new Matrix4();
    this.lineVerticies = [];
    this.time = 0;
    this.timeSince = 0;
    this.starVerticies = [];

	// -----------------------------------------------------------------------------
    //The defalut create function for simple JSON data
	this.create = function(jsonFileData, rawImage, rawImage2) {
        // fish out references to relevant data pieces from 'data'
        var verts = jsonFileData.meshes[0].vertices;
        var normals = jsonFileData.meshes[0].normals;
        var texcoords = jsonFileData.meshes[0].texturecoords[0];
        var indices = [].concat.apply([], jsonFileData.meshes[0].faces);

        // create the position and color information for this object and send it to the GPU
        this.vertexBuffer = gl.createBuffer();
        this.gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

        this.normalBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        this.gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

        this.texcoordBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(gl.ARRAY_BUFFER, this.texcoordBuffer);
        this.gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texcoords), gl.STATIC_DRAW);

        this.indexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        this.gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

        this.trailVertexBuffer = gl.createBuffer();

        this.colorBuffer = gl.createBuffer();

        // store all of the necessary indexes into the buffer for rendering later
        this.indexCount = indices.length;

        if (rawImage) {
            this.texture = this.gl.createTexture();
            this.gl.activeTexture(gl.TEXTURE0);
            this.gl.bindTexture(gl.TEXTURE_2D, this.texture);
            this.gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
            this.gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
            this.gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
            this.gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            this.gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            this.gl.texImage2D(
                this.gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
                this.gl.UNSIGNED_BYTE,
                rawImage
            );
            this.gl.bindTexture(gl.TEXTURE_2D, null);
        }
        if (rawImage2) {
            this.flowMap = this.gl.createTexture();
            this.gl.activeTexture(gl.TEXTURE1);
            this.gl.bindTexture(gl.TEXTURE_2D, this.flowMap);
            this.gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
            this.gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
            this.gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
            this.gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            this.gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            this.gl.texImage2D(
                this.gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
                this.gl.UNSIGNED_BYTE,
                rawImage2
            );
            this.gl.bindTexture(gl.TEXTURE_2D, null);
        }
	}
	// -------------------------------------------------------------------------
     //The defalut render function for simple JSON data
	this.render = function(camera, projectionMatrix, shaderProgram, otherPlanet, otherPlanetGeometry, time) {
        gl.useProgram(shaderProgram);

        var attributes = shaderProgram.attributes;
        var uniforms = shaderProgram.uniforms;
        this.time += time;

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.vertexAttribPointer(
            attributes.vertexPositionAttribute,
            3,
            gl.FLOAT,
            gl.FALSE,
            0,
            0
        );
        gl.enableVertexAttribArray(attributes.vertexPositionAttribute);

        if (attributes.hasOwnProperty('vertexNormalsAttribute')) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
            gl.vertexAttribPointer(
                attributes.vertexNormalsAttribute,
                3,
                gl.FLOAT,
                gl.FALSE,
                0,
                0
            );
            gl.enableVertexAttribArray(attributes.vertexNormalsAttribute);
        }

        if (attributes.hasOwnProperty('vertexTexcoordsAttribute')) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.texcoordBuffer);
            gl.vertexAttribPointer(
                attributes.vertexTexcoordsAttribute,
                2,
                gl.FLOAT,
                gl.FALSE,
                0,
                0
            );
            gl.enableVertexAttribArray(attributes.vertexTexcoordsAttribute);
        }

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

        if (this.texture) {
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.uniform1i(uniforms.textureUniform, 0); 
        }
        
        if (this.flowMap) {
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, this.flowMap);
            gl.uniform1i(uniforms.flowMapUniform, 1); 
            gl.uniform1f(uniforms.timeUniform, this.time);
        }
            

        if(otherPlanet && otherPlanetGeometry){
            gl.uniform1f(uniforms.otherPlanetRadiusUniform, otherPlanet.scale.getElement(0,0) * 50);
            gl.uniform3f(uniforms.otherPlanetPositionUniform, otherPlanetGeometry.worldMatrix.getPosition().x,  otherPlanetGeometry.worldMatrix.getPosition().y,  otherPlanetGeometry.worldMatrix.getPosition().z);
        }

        // Send our matrices to the shader
        gl.uniformMatrix4fv(uniforms.worldMatrixUniform, false, this.worldMatrix.clone().transpose().elements);
        gl.uniformMatrix4fv(uniforms.viewMatrixUniform, false, camera.getViewMatrix().clone().transpose().elements);
        gl.uniformMatrix4fv(uniforms.projectionMatrixUniform, false, projectionMatrix.clone().transpose().elements);
        
        gl.drawElements(gl.TRIANGLES, this.indexCount, gl.UNSIGNED_SHORT, 0);

        this.texture && gl.bindTexture(gl.TEXTURE_2D, null);
        gl.disableVertexAttribArray(attributes.vertexPositionAttribute);
        attributes.vertexNormalsAttribute && gl.disableVertexAttribArray(attributes.vertexNormalsAttribute);
        attributes.vertexTexcoordsAttribute && gl.disableVertexAttribArray(attributes.vertexTexcoordsAttribute);
	}
    // -----------------------------------------------------------------------------
    //Creates geometry specfically for the skybox
    this.createSkybox = function(jsonFileData, img1, img2, img3, img4, img5, img6){
        this.texture = gl.createTexture();
        this.gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.texture);
        this.gl.texImage2D(this.gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGBA, gl.RGBA, this.gl.UNSIGNED_BYTE, img1);
        this.gl.texImage2D(this.gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGBA, gl.RGBA, this.gl.UNSIGNED_BYTE, img2);
        this.gl.texImage2D(this.gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGBA, gl.RGBA, this.gl.UNSIGNED_BYTE, img3);
        this.gl.texImage2D(this.gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGBA, gl.RGBA, this.gl.UNSIGNED_BYTE, img4);
        this.gl.texImage2D(this.gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGBA, gl.RGBA, this.gl.UNSIGNED_BYTE, img5);
        this.gl.texImage2D(this.gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGBA, gl.RGBA, this.gl.UNSIGNED_BYTE, img6);
        this.gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        this.gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        this.gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

       
        var verts = jsonFileData.meshes[0].vertices;
        var indices = [].concat.apply([], jsonFileData.meshes[0].faces);

        // create the position and color information for this object and send it to the GPU
        this.vertexBuffer = gl.createBuffer();
        this.gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

        this.indexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        this.gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

        // store all of the necessary indexes into the buffer for rendering later
        this.indexCount = indices.length;

        this.gl.bindTexture(gl.TEXTURE_2D, null);
    }
    // -----------------------------------------------------------------------------
    //Renders geometry specfically for the skybox
    this.renderSkybox = function(camera, projectionMatrix, shaderProgram) {
        gl.useProgram(shaderProgram);

        var attributes = shaderProgram.attributes;
        var uniforms = shaderProgram.uniforms;

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.vertexAttribPointer(
            attributes.vertexPositionAttribute,
            3,
            gl.FLOAT,
            gl.FALSE,
            0,
            0
        );
        gl.enableVertexAttribArray(attributes.vertexPositionAttribute);

        if (attributes.hasOwnProperty('vertexNormalsAttribute')) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
            gl.vertexAttribPointer(
                attributes.vertexNormalsAttribute,
                3,
                gl.FLOAT,
                gl.FALSE,
                0,
                0
            );
            gl.enableVertexAttribArray(attributes.vertexNormalsAttribute);
        }

        if (attributes.hasOwnProperty('vertexTexcoordsAttribute')) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.texcoordBuffer);
            gl.vertexAttribPointer(
                attributes.vertexTexcoordsAttribute,
                2,
                gl.FLOAT,
                gl.FALSE,
                0,
                0
            );
            gl.enableVertexAttribArray(attributes.vertexTexcoordsAttribute);
        }

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

        if (this.texture) {
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.texture);
        }

        // Send our matrices to the shader
        gl.uniformMatrix4fv(uniforms.worldMatrixUniform, false, this.worldMatrix.clone().transpose().elements);
        gl.uniformMatrix4fv(uniforms.projectionMatrixUniform, false, projectionMatrix.clone().transpose().elements);
        gl.uniformMatrix4fv(uniforms.viewMatrixUniform, false, camera.getViewMatrix().clone().transpose().elements);
        gl.uniform1i(uniforms.cubeMapUniform, 0);
        gl.drawElements(gl.TRIANGLES, this.indexCount, gl.UNSIGNED_SHORT, 0);

        this.texture && gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
        gl.disableVertexAttribArray(attributes.vertexPositionAttribute);
        attributes.vertexNormalsAttribute && gl.disableVertexAttribArray(attributes.vertexNormalsAttribute);
        attributes.vertexTexcoordsAttribute && gl.disableVertexAttribArray(attributes.vertexTexcoordsAttribute);
	}
    // -----------------------------------------------------------------------------
    //Renders each associated geometry's trail, (for planets)
    this.renderTrail = function(camera, projectionMatrix, shaderProgram, deltaTime, color) {
        this.gl.useProgram(shaderProgram);

        var attributes = shaderProgram.attributes;
        var uniforms = shaderProgram.uniforms;

        this.timeSince += deltaTime;
        if(this.timeSince > .2){
            var curPos = this.worldMatrix.getPosition();
            this.lineVerticies.push(curPos.x);
            this.lineVerticies.push(curPos.y);
            this.lineVerticies.push(curPos.z);
            this.timeSince = 0;
    }

        this.gl.bindBuffer(gl.ARRAY_BUFFER, this.trailVertexBuffer);
        this.gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.lineVerticies), gl.DYNAMIC_DRAW);
        this.gl.vertexAttribPointer(
            attributes.vertexPositionAttribute,
            3,
            gl.FLOAT,
            gl.FALSE,
            0,
            0
        );
        this.gl.enableVertexAttribArray(attributes.vertexPositionAttribute);

        
        // Send our matrices to the shader
        this.gl.uniformMatrix4fv(uniforms.worldMatrixUniform, false, this.worldMatrix.clone().transpose().elements);
        this.gl.uniformMatrix4fv(uniforms.viewMatrixUniform, false, camera.getViewMatrix().clone().transpose().elements);
        this.gl.uniformMatrix4fv(uniforms.projectionMatrixUniform, false, projectionMatrix.clone().transpose().elements);
        this.gl.uniform3f(uniforms.colorUniform, color.x, color.y, color.z)
        
        this.gl.drawArrays(gl.LINE_STRIP, 0, this.lineVerticies.length / 3);     
	}
    // -----------------------------------------------------------------------------
    //Creates a geometry associated with many random dots to be represented as stars
    this.createStarSystem = function(verticies, brightnessLevels){
        this.starBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(gl.ARRAY_BUFFER, this.starBuffer);
        this.gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verticies), gl.STATIC_DRAW);

        this.seedBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(gl.ARRAY_BUFFER, this.seedBuffer);
        this.gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(brightnessLevels), gl.STATIC_DRAW);
    }
    // -----------------------------------------------------------------------------
    //Renders the stars as flashing distant start
    this.renderStarSystem = function(camera, projectionMatrix, shaderProgram, starSize, starCount, deltaTime, color){
        gl.useProgram(shaderProgram);
        var attributes = shaderProgram.attributes;
        var uniforms = shaderProgram.uniforms;
        this.timeSince += deltaTime;

        gl.bindBuffer(gl.ARRAY_BUFFER, this.starBuffer);
        gl.vertexAttribPointer(
            attributes.vertexPositionAttribute,
            3,
            gl.FLOAT,
            gl.FALSE,
            0,
            0
        );
        gl.enableVertexAttribArray(attributes.vertexPositionAttribute);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.seedBuffer);
        gl.vertexAttribPointer(
            attributes.seedAttribute,
            1,
            gl.FLOAT,
            gl.FALSE,
            0,
            0
        );
        gl.enableVertexAttribArray(attributes.seedAttribute);

        gl.uniform1f(uniforms.starSizeUniform, starSize);
        gl.uniformMatrix4fv(uniforms.worldMatrixUniform, false, this.worldMatrix.clone().transpose().elements);
        gl.uniformMatrix4fv(uniforms.viewMatrixUniform, false, camera.getViewMatrix().clone().transpose().elements);
        gl.uniformMatrix4fv(uniforms.projectionMatrixUniform, false, projectionMatrix.clone().transpose().elements);
        gl.uniform1f(uniforms.timeUniform, this.timeSince);
        gl.uniform3f(uniforms.colorUniform, color.x, color.y, color.z);

        gl.drawArrays(gl.POINTS, 0, starCount);
    }
    // -----------------------------------------------------------------------------
    //Renders the stars colored, and conencted them with lines 
    this.renderConstellation = function(camera, projectionMatrix, shaderProgram, starSize, starCount, deltaTime, color){
        gl.useProgram(shaderProgram);
        var attributes = shaderProgram.attributes;
        var uniforms = shaderProgram.uniforms;
        this.timeSince += deltaTime;

        gl.bindBuffer(gl.ARRAY_BUFFER, this.starBuffer);
        gl.vertexAttribPointer(
            attributes.vertexPositionAttribute,
            3,
            gl.FLOAT,
            gl.FALSE,
            0,
            0
        );
        gl.enableVertexAttribArray(attributes.vertexPositionAttribute);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.seedBuffer);
        gl.vertexAttribPointer(
            attributes.seedAttribute,
            1,
            gl.FLOAT,
            gl.FALSE,
            0,
            0
        );
        gl.enableVertexAttribArray(attributes.seedAttribute);

        gl.uniform1f(uniforms.starSizeUniform, starSize);
        gl.uniformMatrix4fv(uniforms.worldMatrixUniform, false, this.worldMatrix.clone().transpose().elements);
        gl.uniformMatrix4fv(uniforms.viewMatrixUniform, false, camera.getViewMatrix().clone().transpose().elements);
        gl.uniformMatrix4fv(uniforms.projectionMatrixUniform, false, projectionMatrix.clone().transpose().elements);
        gl.uniform1f(uniforms.timeUniform, this.timeSince);
        gl.uniform3f(uniforms.colorUniform, color.x, color.y, color.z);

        this.gl.drawArrays(gl.LINE_STRIP, 0, starCount);
        gl.drawArrays(gl.POINTS, 0, starCount);
    }
    // -----------------------------------------------------------------------------
    //Renders a glowing aura around the geometry, (for planets)
    this.renderAura = function(camera, projectionMatrix, shaderProgram, color, deltaTime) {
        gl.useProgram(shaderProgram);

        var attributes = shaderProgram.attributes;
        var uniforms = shaderProgram.uniforms;
        this.timeSince += deltaTime;

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.vertexAttribPointer(
            attributes.vertexPositionAttribute,
            3,
            gl.FLOAT,
            gl.FALSE,
            0,
            0
        );
        gl.enableVertexAttribArray(attributes.vertexPositionAttribute);

        if (attributes.hasOwnProperty('vertexNormalsAttribute')) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
            gl.vertexAttribPointer(
                attributes.vertexNormalsAttribute,
                3,
                gl.FLOAT,
                gl.FALSE,
                0,
                0
            );
            gl.enableVertexAttribArray(attributes.vertexNormalsAttribute);
        }

        if (attributes.hasOwnProperty('vertexTexcoordsAttribute')) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.texcoordBuffer);
            gl.vertexAttribPointer(
                attributes.vertexTexcoordsAttribute,
                2,
                gl.FLOAT,
                gl.FALSE,
                0,
                0
            );
            gl.enableVertexAttribArray(attributes.vertexTexcoordsAttribute);
        }

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

        if (this.texture) {
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
        }

        // Send our matrices to the shader
        gl.uniformMatrix4fv(uniforms.worldMatrixUniform, false, this.worldMatrix.clone().transpose().elements);
        gl.uniformMatrix4fv(uniforms.viewMatrixUniform, false, camera.getViewMatrix().clone().transpose().elements);
        gl.uniformMatrix4fv(uniforms.projectionMatrixUniform, false, projectionMatrix.clone().transpose().elements);
        gl.uniform3f(uniforms.colorUniform, color.x, color.y, color.z);
        gl.uniform1f(uniforms.timeUniform, this.timeSince);


        gl.drawElements(gl.TRIANGLES, this.indexCount, gl.UNSIGNED_SHORT, 0);

        this.texture && gl.bindTexture(gl.TEXTURE_2D, null);
        gl.disableVertexAttribArray(attributes.vertexPositionAttribute);
        attributes.vertexNormalsAttribute && gl.disableVertexAttribArray(attributes.vertexNormalsAttribute);
        attributes.vertexTexcoordsAttribute && gl.disableVertexAttribArray(attributes.vertexTexcoordsAttribute);
	}

}

// EOF 00100001-10