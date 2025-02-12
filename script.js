let shaderSwirly, shaderFieldFlow, shaderFBM3D, currentShader;
let noiseTexture; // For Field Flow shader
let cnv;

function setup() {
  // Create a canvas that initially fills the player container.
  cnv = createCanvas(windowWidth, windowHeight, WEBGL);
  cnv.parent("player");
  // Set id, class, and tabindex to mimic Shadertoy's player.
  cnv.elt.id = "demogl";
  cnv.elt.className = "playerCanvas";
  cnv.elt.setAttribute("tabindex", "0");

  // Call helper to sync drawing buffer with display size.
  updateCanvasSize();

  noStroke();

  // Retrieve shader sources.
  const vert = document.getElementById("vertex-shader").textContent;
  const swirlyFrag = document.getElementById("swirly-shader").textContent;
  const fieldFlowFrag = document.getElementById("fieldflow-shader").textContent;
  const fbm3dFrag = document.getElementById("fbm3d-shader").textContent;

  // Create shader objects.
  shaderSwirly = createShader(vert, swirlyFrag);
  shaderFieldFlow = createShader(vert, fieldFlowFrag);
  shaderFBM3D = createShader(vert, fbm3dFrag);

  // Default shader.
  currentShader = shaderSwirly;

  // Create a noise texture for Field Flow.
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

  // Setup UI for shader selection.
  const shaderSelect = document.getElementById("shaderSelect");
  shaderSelect.addEventListener("change", function () {
    hideAllControls();
    switch (this.value) {
      case "swirly":
        currentShader = shaderSwirly;
        document.getElementById("swirlyControls").style.display = "block";
        break;
      case "fieldflow":
        currentShader = shaderFieldFlow;
        document.getElementById("fieldFlowControls").style.display = "block";
        break;
      case "fbm3d":
        currentShader = shaderFBM3D;
        document.getElementById("fbm3dControls").style.display = "block";
        break;
    }
  });
}

// Helper from webglfundamentals.org: Resize the canvas drawing buffer
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
  
  shader(currentShader);
  // Pass the dynamic resolution
  currentShader.setUniform("u_resolution", [width, height]);
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
  } else if (currentShader === shaderFieldFlow) {
    let flowMult = parseFloat(document.getElementById("flowMult").value);
    currentShader.setUniform("u_flowMult", flowMult);
    currentShader.setUniform("u_channel0", noiseTexture);
  } else if (currentShader === shaderFBM3D) {
    let numOct = parseFloat(document.getElementById("numOct").value);
    let uvScale = parseFloat(document.getElementById("uvScale").value);
    currentShader.setUniform("u_numOct", numOct);
    currentShader.setUniform("u_uvScale", uvScale);
  }
  
  // Draw a plane that fills the canvas.
  plane(width, height);
}

function windowResized() {
  updateCanvasSize();
}
