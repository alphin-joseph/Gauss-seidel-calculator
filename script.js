function buildMatrixInputs() {
  const size = parseInt(document.getElementById('matrix-size').value);
  const container = document.getElementById('matrix-container');
  container.style.gridTemplateColumns = `repeat(${size + 2}, minmax(60px, 1fr))`;
  container.innerHTML = '';

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      container.innerHTML += `<input type="number" step="any" class="matrix-cell cell-a" data-row="${i}" data-col="${j}" placeholder="a${i+1}${j+1}" value="${i === j ? 4 : 1}">`;
    }
    container.innerHTML += `<span class="matrix-row-label">=</span>`;
    container.innerHTML += `<input type="number" step="any" class="matrix-cell cell-b" data-row="${i}" placeholder="b${i+1}" value="${(i+1)*5}">`;
  }

  container.innerHTML += `<div style="grid-column: span ${size + 2}; margin-top: 1rem;"><label>Initial Guesses (X₀)</label></div>`;
  for (let i = 0; i < size; i++) {
    container.innerHTML += `<input type="number" step="any" class="matrix-cell cell-x0" data-row="${i}" placeholder="x${i+1} initial" value="0">`;
  }
}

function showError(msg) {
  const errBox = document.getElementById('error-display');
  errBox.innerText = msg;
  errBox.style.display = 'block';
  document.getElementById('results-card').style.display = 'none';
}

function clearError() {
  document.getElementById('error-display').style.display = 'none';
}

function solveGaussSeidel() {
  clearError();
  const n = parseInt(document.getElementById('matrix-size').value);
  const maxIter = parseInt(document.getElementById('max-iterations').value);
  const tol = parseFloat(document.getElementById('tolerance').value);

  let A = Array.from({ length: n }, () => Array(n).fill(0));
  let B = Array(n).fill(0);
  let X = Array(n).fill(0);

  // Read inputs
  let inputsValid = true;
  document.querySelectorAll('.cell-a').forEach(el => {
    const val = parseFloat(el.value);
    if (isNaN(val)) inputsValid = false;
    A[parseInt(el.dataset.row)][parseInt(el.dataset.col)] = val;
  });
  document.querySelectorAll('.cell-b').forEach(el => {
    const val = parseFloat(el.value);
    if (isNaN(val)) inputsValid = false;
    B[parseInt(el.dataset.row)] = val;
  });
  document.querySelectorAll('.cell-x0').forEach(el => {
    const val = parseFloat(el.value);
    if (isNaN(val)) inputsValid = false;
    X[parseInt(el.dataset.row)] = val;
  });

  if (!inputsValid) return showError("Error: Please make sure all matrix fields contain valid numerical values.");

  // Exception: Zero diagonal elements
  for (let i = 0; i < n; i++) {
    if (A[i][i] === 0) return showError(`Execution Error: Diagonal element A[${i+1}][${i+1}] is zero. Gauss-Seidel involves division by diagonal elements.`);
  }

  // Warning: Diagonal dominance
  let isDominant = true;
  for (let i = 0; i < n; i++) {
    let sum = 0;
    for (let j = 0; j < n; j++) if (i !== j) sum += Math.abs(A[i][j]);
    if (Math.abs(A[i][i]) < sum) isDominant = false;
  }

  const consoleOutput = document.getElementById('console-output');
  consoleOutput.innerHTML = '';
  if (!isDominant) {
    consoleOutput.innerHTML += `<div class="step" style="color: #facc15;">[Warning]: Matrix is not strictly diagonally dominant. The method may not converge.</div>`;
  }

  // Iteration loop
  let iter = 0;
  let converged = false;

  while (iter < maxIter && !converged) {
    iter++;
    let maxDiff = 0;
    let logLine = `<strong>Iteration ${iter}:</strong>\n`;

    for (let i = 0; i < n; i++) {
      let sum = 0;
      for (let j = 0; j < n; j++) {
        if (i !== j) sum += A[i][j] * X[j];
      }
      let oldX = X[i];
      X[i] = (B[i] - sum) / A[i][i];
      
      let diff = Math.abs(X[i] - oldX);
      if (diff > maxDiff) maxDiff = diff;

      logLine += `  x${i+1} = (${B[i]} - ${sum.toFixed(4)}) / ${A[i][i]} = <strong>${X[i].toFixed(6)}</strong> (Δ = ${diff.toFixed(6)})\n`;
    }

    consoleOutput.innerHTML += `<div class="step">${logLine}</div>`;

    if (maxDiff < tol) {
      converged = true;
      consoleOutput.innerHTML += `<div class="step" style="color: #34d399;"><strong>Success: Converged in ${iter} iterations within tolerance ${tol}.</strong></div>`;
    }
  }

  if (!converged) {
    consoleOutput.innerHTML += `<div class="step" style="color: #fca5a5;"><strong>Notice: Reached maximum iterations (${maxIter}) without meeting tolerance.</strong></div>`;
  }

  // Render output grid
  const solutionOutput = document.getElementById('solution-output');
  solutionOutput.innerHTML = '';
  X.forEach((val, idx) => {
    solutionOutput.innerHTML += `
      <div class="solution-box">
        <label>x${idx + 1}</label>
        <div class="val">${val.toFixed(6)}</div>
      </div>`;
  });

  document.getElementById('results-card').style.display = 'block';
}

// Build matrix inputs on page load
document.addEventListener('DOMContentLoaded', buildMatrixInputs);
