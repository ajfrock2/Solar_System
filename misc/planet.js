var Planet = function (scale, rotationSpeed, position, orbitSpeed, trailColor) {
    //Holds planet data 

    this.scale = scale;
    this.rotationSpeed = rotationSpeed;
    this.position = position;
    this.orbitSpeed = orbitSpeed;
    this.radiusFromOrbit = Math.sqrt((this.position.getPosition().x * this.position.getPosition().x) + 
        (this.position.getPosition().z * this.position.getPosition().z));
    this.trailColor = trailColor;
}



// EOF 00100001-10