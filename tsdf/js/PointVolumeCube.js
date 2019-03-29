const createPointVolumeCubeBuffer = (res, width) => {
  var vertices = new Float32Array(res*res*res*3)

  var vertInds = []

  for(let x=0; x<res; x++){
    let xf = (x/(res-1)) * width
    for(let y=0; y<res; y++){
      let yf = (y/(res-1)) * width
      for(let z=0; z<res; z++){
        let vertInd = ((x * res + y) * res + z) * 3
        let zf = (z/(res-1) ) * width
        vertices[vertInd] = xf
        vertices[vertInd+1] = yf
        vertices[vertInd+2] = zf
        vertInds.push(vertInd)
      }
    }
  }

  return [vertices, vertInds]
}
