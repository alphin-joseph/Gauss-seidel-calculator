function log(message, success=true){

    const consoleArea =
    document.getElementById("consoleArea");

    const div = document.createElement("div");

    div.className =
    success ? "success" : "error";

    div.innerHTML =
    (success ? "✓ " : "✗ ") + message;

    consoleArea.appendChild(div);

    consoleArea.scrollTop =
    consoleArea.scrollHeight;
}

function toggleIterations(){

    const area =
    document.getElementById("iterationsArea");

    area.style.display =
    area.style.display === "none"
    ? "block"
    : "none";
}

function get(id){
    return Number(document.getElementById(id).value);
}

function solveGaussSeidel(){

    document.getElementById("consoleArea").innerHTML="";
    document.getElementById("iterationsArea").innerHTML="";

    const A = [
        [get("a11"),get("a12"),get("a13")],
        [get("a21"),get("a22"),get("a23")],
        [get("a31"),get("a32"),get("a33")]
    ];

    const B = [
        get("b1"),
        get("b2"),
        get("b3")
    ];

    let x = [
        get("x1"),
        get("x2"),
        get("x3")
    ];

    const tol =
    Number(document.getElementById("tol").value);

    const maxIter =
    Number(document.getElementById("maxIter").value);

    for(let i=0;i<3;i++){

        for(let j=0;j<3;j++){

            if(isNaN(A[i][j])){

                log("Matrix contains empty values",false);
                return;
            }
        }
    }

    log("Matrix input validated");

    for(let i=0;i<3;i++){

        if(A[i][i]===0){

            log(
                `Zero diagonal at row ${i+1}`,
                false
            );

            return;
        }
    }

    log("Diagonal entries valid");

    let dominant=true;

    for(let i=0;i<3;i++){

        let sum=0;

        for(let j=0;j<3;j++){

            if(i!==j)
                sum += Math.abs(A[i][j]);
        }

        if(Math.abs(A[i][i]) < sum)
            dominant=false;
    }

    if(dominant)
        log("Matrix is diagonally dominant");
    else
        log(
            "Matrix not diagonally dominant. Convergence not guaranteed",
            false
        );

    let converged=false;

    for(let iter=1;iter<=maxIter;iter++){

        const old=[...x];

        x[0]=
        (B[0]
        -A[0][1]*x[1]
        -A[0][2]*x[2])
        /A[0][0];

        x[1]=
        (B[1]
        -A[1][0]*x[0]
        -A[1][2]*x[2])
        /A[1][1];

        x[2]=
        (B[2]
        -A[2][0]*x[0]
        -A[2][1]*x[1])
        /A[2][2];

        const error =
        Math.max(
            Math.abs(x[0]-old[0]),
            Math.abs(x[1]-old[1]),
            Math.abs(x[2]-old[2])
        );

        const div =
        document.createElement("div");

        div.className="iteration";

        div.innerHTML=`
        <strong>Iteration ${iter}</strong><br>
        x₁ = ${x[0].toFixed(8)}<br>
        x₂ = ${x[1].toFixed(8)}<br>
        x₃ = ${x[2].toFixed(8)}<br>
        Error = ${error.toExponential(4)}
        `;

        document
        .getElementById("iterationsArea")
        .appendChild(div);

        if(error < tol){

            converged=true;

            log(
                `Converged in ${iter} iterations`
            );

            break;
        }
    }

    if(!converged){

        log(
            "Maximum iterations reached",
            false
        );
    }

    document.getElementById(
        "solution"
    ).innerHTML = `
        <strong>x₁</strong> = ${x[0].toFixed(8)}<br>
        <strong>x₂</strong> = ${x[1].toFixed(8)}<br>
        <strong>x₃</strong> = ${x[2].toFixed(8)}
    `;
}
