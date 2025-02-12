let shaderMetaballs, shaderSwirly, shaderFieldFlow, shaderFBM3D, currentShader;
let noiseTexture; // used for Field Flow shader

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  // Ensure drawing covers the full screen.
  rectMode(CENTER);
  noStroke();
  
  // Retrieve shader source strings
  const vert = document.getElementById('vertex-shader').textContent;
  const metaFrag = document.getElementById('fragment-shader').textContent;
  const swirlyFrag = document.getElementById('swirly-shader').textContent;
  const fieldFlowFrag = document.getElementById('fieldflow-shader').textContent;
  const fbm3dFrag = document.getElementById('fbm3d-shader').textContent;
  
  // Create shader objects
  shaderMetaballs = createShader(vert, metaFrag);
  shaderSwirly = createShader(vert, swirlyFrag);
  shaderFieldFlow = createShader(vert, fieldFlowFrag);
  shaderFBM3D = createShader(vert, fbm3dFrag);
  
  // Default shader is Metaballs.
  currentShader = shaderMetaballs;
  
  // Create a noise texture for Field Flow shader (256 x 256 grayscale)
  noiseTexture = createGraphics(256, 256);
  noiseTexture.loadPixels();
  for (let x = 0; x < 256; x++) {
    for (let y = 0; y < 256; y++) {
      let index = 4 * (x + y * 256);
      let val = floor(random(0, 255));
      noiseTexture.pixels[index] = val;
      noiseTexture.pixels[index + 1] = val;
      noiseTexture.pixels[index + 2] = val;
      noiseTexture.pixels[index + 3] = 255;
    }
  }
  noiseTexture.updatePixels();
  
  // Listen to shader selection changes
  const shaderSelect = document.getElementById('shaderSelect');
  shaderSelect.addEventListener('change', function() {
    hideAllControls();
    switch (this.value) {
      case 'metaballs':
        currentShader = shaderMetaballs;
        break;
      case 'swirly':
        currentShader = shaderSwirly;
        document.getElementById('swirlyControls').style.display = 'block';
        break;
      case 'fieldflow':
        currentShader = shaderFieldFlow;
        document.getElementById('fieldFlowControls').style.display = 'block';
        break;
      case 'fbm3d':
        currentShader = shaderFBM3D;
        document.getElementById('fbm3dControls').style.display = 'block';
        break;
    }
  });
}

function hideAllControls() {
  let controls = document.getElementsByClassName('shaderControls');
  for (let i = 0; i < controls.length; i++) {
    controls[i].style.display = 'none';
  }
}

function draw() {
  shader(currentShader);
  currentShader.setUniform("u_resolution", [width, height]);
  currentShader.setUniform("u_time", millis() / 1000.0);
  
  if (currentShader === shaderMetaballs) {
    // Update uniforms for Metaballs shader:
    let ballPositions = [];
    let ballRadii = [];
    for (let i = 0; i < 4; i++) {
      let angle = (millis() / 1000.0) * (0.5 + i * 0.3);
      let x = 0.5 + 0.3 * cos(angle + i);
      let y = 0.5 + 0.3 * sin(angle + i + 1.0);
      ballPositions.push(x, y);
      let radius = 0.15 + 0.05 * sin(millis() / 1000.0 + i);
      ballRadii.push(radius);
    }
    currentShader.setUniform("u_ballPos", ballPositions);
    currentShader.setUniform("u_ballRadius", ballRadii);
    
  } else if (currentShader === shaderSwirly) {
    // Update uniforms from Swirly Pattern controls:
    let noiseSpeed = parseFloat(document.getElementById("noiseSpeed").value);
    let swirlFactor = parseFloat(document.getElementById("swirlFactor").value);
    let smoothEdge1 = parseFloat(document.getElementById("smoothEdge1").value);
    let smoothEdge2 = parseFloat(document.getElementById("smoothEdge2").value);
    
    function hexToRgb(hex) {
      let bigint = parseInt(hex.slice(1), 16);
      let r = ((bigint >> 16) & 255) / 255;
      let g = ((bigint >> 8) & 255) / 255;
      let b = (bigint & 255) / 255;
      return [r, g, b];
    }
    let colorLow = hexToRgb(document.getElementById("colorLow").value);
    let colorHigh = hexToRgb(document.getElementById("colorHigh").value);
    
    currentShader.setUniform("u_noiseSpeed", noiseSpeed);
    currentShader.setUniform("u_swirlFactor", swirlFactor);
    currentShader.setUniform("u_smoothEdge1", smoothEdge1);
    currentShader.setUniform("u_smoothEdge2", smoothEdge2);
    currentShader.setUniform("u_colorLow", colorLow);
    currentShader.setUniform("u_colorHigh", colorHigh);
    
  } else if (currentShader === shaderFieldFlow) {
    // Update uniform for Field Flow shader:
    let flowMult = parseFloat(document.getElementById("flowMult").value);
    currentShader.setUniform("u_flowMult", flowMult);
    currentShader.setUniform("u_channel0", noiseTexture);
    
  } else if (currentShader === shaderFBM3D) {
    // Update uniforms for FBM 3D shader:
    let numOct = parseFloat(document.getElementById("numOct").value);
    let uvScale = parseFloat(document.getElementById("uvScale").value);
    currentShader.setUniform("u_numOct", numOct);
    currentShader.setUniform("u_uvScale", uvScale);
  }
  
  // Draw a quad that covers the entire canvas.
  rect(0, 0, width, height);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
