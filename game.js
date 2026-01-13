/**
 * Flappy Bird – HTML5 Canvas-spill
 *
 * Dette scriptet inneholder all spill-logikk for et enkelt
 * Flappy Bird-inspirert spill bygget med HTML5 Canvas og JavaScript.
 *
 * Ansvar:
 * - Game loop og game states (start, playing, gameover)
 * - Fysikk for fuglen
 * - Generering og håndtering av rør
 * - Kollisjon og poengberegning
 * - Tegning av UI og spillobjekter
 *
 * Prosjektet er laget som et porteføljeprosjekt med fokus på
 * ryddig struktur, tydelig ansvar og enkel spillarkitektur.
 */

const canvas = document.getElementById('gameCanvas'); 
const ctx = canvas.getContext('2d');

// Vi setter hele html5-canvasets bredde og høyde
canvas.width = 800;
canvas.height = 600;

// Status på gameplay
let gameState = 'start'; // andre mulige tilstander: start | playing | gameover
let score = 0;

// Fuglen i spillet
const bird = {
    x : 80, // Fuglen sin horisontale posisjon
    y: canvas.height / 2, // Fuglen sin vertikale posisjon
    radius: 12    , // Fuglen sin radius
    gravity: 0.6, // Tyngdekraften som trekker fuglen nedover
    velocity: 0, // Fuglen sin nåværende hastighet
    jumpStrength: -8 // Styrken på hoppet når fuglen hopper
}

// Rør i spillet
const pipes = [];
const pipeWidth = 60;
const pipeGap = 160;
const pipeSpeed = 6;

// Game loop funksjon
function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Rens canvaset

    if (gameState == "start") {
        drawStartScreen();
        drawBird();
    } else if (gameState == "playing") {
        updateBird();
        updatePipes();
        drawPipes();
        checkPipeCollision();
        updateScore();
        drawScore(); 
        drawBird();

        // Lag ny pipe hvis det ikke finnes noen,
        // eller siste pipe er langt nok unna
        if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - 300) {
            createPipe();
        }
    } else if (gameState == "gameover") {
        drawGameOverScreen();
        drawBird();
    }

    requestAnimationFrame(update); // Kall update funksjonen igjen for neste frame
}

// ===========================
//  Pipe funksjoner - stolper
// ===========================

function createPipe() {
  const topHeight = Math.random() * (canvas.height - pipeGap - 200) + 50;

  pipes.push({
    x: canvas.width,
    topHeight: topHeight,
    bottomY: topHeight + pipeGap,
    passed: false
  });
}

function updatePipes() {
  for (let pipe of pipes) {
    pipe.x -= pipeSpeed;
  }

  // Fjern stolper som er utenfor skjermen
  if (pipes.length && pipes[0].x + pipeWidth < 0) {
    pipes.shift();
  }
}

function drawPipes() {
  ctx.fillStyle = "green";

  for (let pipe of pipes) {
    // Topp
    ctx.fillRect(pipe.x, 0, pipeWidth, pipe.topHeight);

    // Bunn
    ctx.fillRect(
      pipe.x,
      pipe.bottomY,
      pipeWidth,
      canvas.height - pipe.bottomY
    );
  }
}

function checkPipeCollision() {
  for (let pipe of pipes) {
    // Horisontal sjekk (fugl innenfor pipe-bredden)
    const withinX =
      bird.x + bird.radius > pipe.x &&
      bird.x - bird.radius < pipe.x + pipeWidth;

    if (withinX) {
      // Topp-pipe
      if (bird.y - bird.radius < pipe.topHeight) {
        gameState = "gameover";
      }

      // Bunn-pipe
      if (bird.y + bird.radius > pipe.bottomY) {
        gameState = "gameover";
      }
    } 
  }
}

// ===========================
//  Fugl funksjoner
// ===========================

function drawBird() {
  ctx.beginPath();
  ctx.arc(bird.x, bird.y, bird.radius, 0, Math.PI * 2);
  ctx.fillStyle = "yellow";
  ctx.fill();
}

//Logikken for å oppdatere fuglens posisjon
function updateBird() {
    bird.velocity += bird.gravity; // Påfør tyngdekraften på fuglens hastighet
    bird.y += bird.velocity; // Oppdater fuglens posisjon basert på hastigheten

    // Sjekk om fuglen treffer bakken eller toppen av canvaset
    if (bird.y + bird.radius > canvas.height || bird.y - bird.radius < 0) {
        gameState = 'gameover'; // Sett spilltilstanden til gameover
    }
}


// ===========================
//  UI funksjoner
// ===========================

function drawStartScreen() {
  drawPanel();

  ctx.fillStyle = "#222";
  ctx.textAlign = "center";

  ctx.font = "36px Arial";
  ctx.fillText("Flappy Bird", canvas.width / 2, canvas.height / 2 - 30);

  ctx.font = "18px Arial";
  ctx.fillText(
    "Trykk for å starte",
    canvas.width / 2,
    canvas.height / 2 + 20
  );
}

function drawGameOverScreen() {
  drawPanel();

  ctx.textAlign = "center";

  ctx.fillStyle = "#d32f2f";
  ctx.font = "36px Arial";
  ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2 - 40);

  ctx.fillStyle = "#222";
  ctx.font = "20px Arial";
  ctx.fillText(
    `Poengsum: ${score}`,
    canvas.width / 2,
    canvas.height / 2
  );

  ctx.font = "16px Arial";
  ctx.fillText(
    "Trykk for å starte på nytt",
    canvas.width / 2,
    canvas.height / 2 + 40
  );
}

// ===========================
//  Score funksjoner
// ===========================

function updateScore() {
    for (let pipe of pipes) {
        if (!pipe.passed && bird.x > pipe.x + pipeWidth) {
            score++;
            pipe.passed = true;
        }
    }
}

function drawScore() {
  ctx.fillStyle = "#ffffff";
  ctx.font = "22px Arial";
  ctx.textAlign = "center";

  ctx.fillText(score, canvas.width / 2, 40);
}

// ===========================
//  Input håndtering
// ===========================
function handleInput() {
  if (gameState === "start") {
    gameState = "playing";
    bird.velocity = bird.jumpStrength;
  } else if (gameState === "playing") {
    bird.velocity = bird.jumpStrength;
  } else if (gameState === "gameover") {
    resetGame();
  }
}

function resetGame() {
  // Reset fugl
  bird.y = canvas.height / 2;
  bird.velocity = 0;

  // Reset stolper
  pipes.length = 0;
  score = 0;

  // Reset game state
  gameState = "start";
}

// ===========================
//  Event lyttere
// ===========================
window.addEventListener("keydown", handleInput);
canvas.addEventListener("click", handleInput);
canvas.addEventListener("touchstart", handleInput);

function drawPanel() {
  // Mørk overlay
  ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Lys panel
  const panelWidth = 420;
  const panelHeight = 200;
  const x = (canvas.width - panelWidth) / 2;
  const y = (canvas.height - panelHeight) / 2;

  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.roundRect(x, y, panelWidth, panelHeight, 16);
  ctx.fill();
}

// Start game loop
update();