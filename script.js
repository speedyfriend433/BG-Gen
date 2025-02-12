let shaderSwirly, shaderHex, shaderFBM3D, currentShader;
let cnv;

function setup() {
  // Create a canvas that fills the #player container.
  cnv = createCanvas(windowWidth, windowHeight, WEBGL);
  cnv.parent("player");
  cnv.elt.id = "demogl";
  cnv.elt.className = "playerCanvas";
  cnv.elt.setAttribute("tabindex", "0");

  updateCanvasSize();
  noStroke();

  // Retrieve shader source strings.
  const vert = document.getElementById("vertex-shader").textContent;
  const swirlyFrag = document.getElementById("swirly-shader").textContent;
  const hexFrag = document.getElementById("hex-shader").textContent;
  const fbm3dFrag = document.getElementById("fbm3d-shader").textContent;

  // Create shader objects.
  shaderSwirly = createShader(vert, swirlyFrag);
  shaderHex = createShader(vert, hexFrag);
  shaderFBM3D = createShader(vert, fbm3dFrag);

  // Set default shader.
  currentShader = shaderSwirly;

  // Setup UI for shader selection.
  const shaderSelect = document.getElementById("shaderSelect");
  shaderSelect.addEventListener("change", function() {
    hideAllControls();
    switch (this.value) {
      case "swirly":
        currentShader = shaderSwirly;
        document.getElementById("swirlyControls").style.display = "block";
        break;
      case "hex":
        currentShader = shaderHex;
        document.getElementById("hexControls").style.display = "block";
        break;
      case "fbm3d":
        currentShader = shaderFBM3D;
        document.getElementById("fbm3dControls").style.display = "block";
        break;
    }
  });
}

// Helper: Ensure the drawing buffer matches the displayed size.
function updateCanvasSize() {
  let canvasElt = cnv.elt;
  let displayWidth = canvasElt.clientWidth;
  let displayHeight = canvasElt.clientHeight;
  if (width !== displayWidth || height !== displayHeight) {
    resizeCanvas(displayWidth, displayHeight);
    drawingContext.viewport(0, 0, displayWidth, displayHeight);
    ortho(-displayWidth/2, displayWidth/2, -displayHeight/2, displayHeight/2, 0, 10000);
  }
}

function hideAllControls() {
  let controls = document.getElementsByClassName("shaderControls");
  for (let i = 0; i < controls.length; i++) {
    controls[i].style.display = "none";
  }
}

function draw() {
  updateCanvasSize();

  // For the fixed‐resolution shaders (swirly, hex), force resolution 1024×576.
  if(currentShader === shaderSwirly || currentShader === shaderHex) {
    currentShader.setUniform("u_resolution", [1024.0, 576.0]);
  } else {
    currentShader.setUniform("u_resolution", [width, height]);
  }
  currentShader.setUniform("u_time", millis() / 1000.0);

  if (currentShader === shaderSwirly) {
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
  }
  else if (currentShader === shaderFBM3D) {
    let numOct = parseFloat(document.getElementById("numOct").value);
    let uvScale = parseFloat(document.getElementById("uvScale").value);
    currentShader.setUniform("u_numOct", numOct);
    currentShader.setUniform("u_uvScale", uvScale);
  }
  
  plane(width, height);
}

function windowResized() {
  updateCanvasSize();
}

