   console.log("SCRIPT CARREGADO");

let grafico = null;

let graficoDetalhes = null;

let topEventosGlobal = [];

let graficoEventos = null;

let graficoUnits = null;

const barPercentagePlugin = {

    id: "barPercentagePlugin",

    afterDatasetsDraw(chart) {

        const { ctx } = chart;

        const dataset =
            chart.data.datasets[0];

        const total =
            dataset.data.reduce(
                (acc, val) => acc + val,
                0
            );

        chart.getDatasetMeta(0).data.forEach((bar, index) => {

            const value =
                dataset.data[index];

            const percent =
                ((value / total) * 100)
                .toFixed(0) + "%";

            ctx.save();

            ctx.fillStyle = "#ffffff";

            ctx.strokeStyle = "#000";

            ctx.lineWidth = 3;

            ctx.font = "bold 16px Segoe UI";

            ctx.textAlign = "left";

            ctx.textBaseline = "middle";

            ctx.strokeText(
                percent,
                bar.x + 10,
                bar.y
            );

            ctx.fillText(
                percent,
                bar.x + 10,
                bar.y
            );

            ctx.restore();
        });
    }
};

const percentagePlugin = {

    id: "percentagePlugin",

    afterDatasetsDraw(chart) {

        const { ctx } = chart;

        const dataset =
            chart.data.datasets[0];

        const total =
            dataset.data.reduce(
                (acc, val) => acc + val,
                0
            );

            const active = chart.getActiveElements();

        chart.getDatasetMeta(0).data.forEach((arc, index) => {

    const isHovered =
        active.some(
            element =>
                element.index === index
        );

    if (isHovered) {
        return;
    }

            const value =
                dataset.data[index];

            const percentage =
                ((value / total) * 100)
                .toFixed(0) + "%";

            const angle =
    (arc.startAngle + arc.endAngle) / 2;

const radius =
    (arc.innerRadius + arc.outerRadius) / 2;

const x =
    arc.x + Math.cos(angle) * radius - 8;

const y =
    arc.y + Math.sin(angle) * radius;

            ctx.save();

ctx.fillStyle = "#ffffff";

ctx.strokeStyle = "#000000";

ctx.lineWidth = 3;

ctx.font = "bold 20px Segoe UI";

ctx.strokeText(
    percentage,
    x,
    y
);

ctx.fillText(
    percentage,
    x,
    y
);

            ctx.restore();

        });
    }
};



// =========================
// BUSCAR TOP 3
// =========================
async function buscarTop3() {

document.getElementById("detalhesLinha").style.display = "none";
document.getElementById("detalhesLinha").innerHTML = "";

document.getElementById("detalhesEventos").style.display = "none";
document.getElementById("detalhesEventos").innerHTML = "";

document.getElementById("detalhesUnits").style.display = "none";
document.getElementById("detalhesUnits").innerHTML = "";

document.getElementById("areaGraficoDetalhes").style.display = "none";

document.getElementById("areaGraficoTop3").style.display = "none";
document.getElementById("areaGraficoEventos").style.display = "none";

document.getElementById("cards").innerHTML = "";
document.getElementById("cardsEventos").innerHTML = "";

// recolhe os painéis
document.getElementById("conteudoTopLine").style.display = "none";
document.getElementById("iconeTopLine").innerHTML = "+";

document.getElementById("conteudoEventos").style.display = "none";
document.getElementById("iconeEventos").innerHTML = "+";

document.getElementById("conteudoUnits").style.display = "none";
document.getElementById("iconeUnits").innerHTML = "+";
    

    if (grafico) {
        grafico.destroy();
    }

    const dataInicial =
        document.getElementById("dataInicial").value;

    const dataFinal =
        document.getElementById("dataFinal").value;

    const turno =
        document.getElementById("turno").value;

    const area =
    document.getElementById("area").value;

    const arquivo =
        document.getElementById("arquivoExcel").files[0];

    if (!arquivo) {

        alert("Selecione um arquivo Excel.");

        return;
    }

    // Lê Excel
    const dados =
        await lerExcel();

    // Filtra
    const dadosFiltrados =
        filtrarPorDataETurnoEArea(
            dados,
            dataInicial,
            dataFinal,
            turno,
            area
        );

    // Não encontrou registros
    if (dadosFiltrados.length === 0) {

        document.getElementById("mensagem").innerHTML =
            "⚠️ Nenhum registro encontrado para os filtros selecionados.";

        return;
    }

    // Gera Top 3
    const top3 =
        gerarTop3(
            dadosFiltrados
        );

    const top3Units =
    gerarTop3Units(
        dadosFiltrados
    );

    criarCardsUnits(top3Units);

    criarGraficoUnits(top3Units);


    document.getElementById("areaTopUnits")
    .style.display = "block";

    document.getElementById("areaGraficoUnits")
    .style.display = "block";



    const top3Eventos =
    gerarTop3Eventos(dadosFiltrados);

    topEventosGlobal = top3Eventos;

    criarCardsEventos(top3Eventos);

    document.getElementById("areaGraficoEventos")
    .style.display = "block";

    criarGraficoEventos(top3Eventos);


    if (top3.length === 0) {

        document.getElementById("mensagem").innerHTML =
            "⚠️ Nenhum downtime encontrado.";

        return;
    }

    document.getElementById("mensagem").innerHTML = "";

    criarCards(top3);

    criarGrafico(top3);

 document.getElementById("areaGraficoTop3").style.display = "block";
document.getElementById("areaTopEventos").style.display = "block";
document.getElementById("areaGraficoEventos").style.display = "block";

// abre automaticamente
document.getElementById("conteudoTopLine").style.display = "block";
document.getElementById("iconeTopLine").innerHTML = "-";

document.getElementById("conteudoEventos").style.display = "block";
document.getElementById("iconeEventos").innerHTML = "-";

document.getElementById("conteudoUnits").style.display = "block";
document.getElementById("iconeUnits").innerHTML = "-";

document.getElementById("areaDashboards").style.display = "block";
}


// =========================
// CRIAR CARDS
// =========================
function criarCards(dados) {

    let html = "";

    const tops = ["TOP 1 - LINE", "TOP 2 - LINE", "TOP 3 - LINE"];

    dados.forEach((item, index) => {

        html += `
        <div class="card"
             onclick="detalharLinha('${item.Line}')">

            <div class="rank">
                ${tops[index]}
            </div>

            <div class="descricao">
                ${item.Line}
            </div>

            <div class="valor">
                ${item.Downtime} min
            </div>

        </div>
        `;
    });

    document.getElementById("cards").innerHTML = html;
}


// =========================
// CRIAR GRÁFICO
// =========================
function criarGrafico(dados) {

    const ctx =
        document.getElementById("graficoTop3");

    if (grafico) {
        grafico.destroy();
    }

grafico = new Chart(ctx, {

    type: "doughnut",

    plugins: [percentagePlugin],

    data: {

        labels: dados.map(x => x.Line),

        datasets: [{

            data: dados.map(x => x.Downtime),

            backgroundColor: [
                "#FFD700",
                "#C0C0C0",
                "#CD7F32"
            ],

            borderColor: "#ffffff",

            borderWidth: 3,

            hoverOffset: 25
        }]
    },

    options: {

        responsive: true,

        maintainAspectRatio: false,

        cutout: "78%",

        plugins: {

            legend: {

                position: "bottom",

                labels: {

                    color: "#ffffff",

                    font: {
                        size: 12,
                        weight: "bold"
                    },

                    padding: 15
                }
            },

            tooltip: {

                backgroundColor: "#082b55",

                titleColor: "#00ffcc",

                bodyColor: "#ffffff",

                borderColor: "#00d4ff",

                borderWidth: 1
            }
        }
    }
});
}

// =========================
// DETALHES DA LINHA
// =========================
async function detalharLinha(linha) {

    console.log("Linha clicada:", linha);

    document.getElementById("detalhesEventos")
    .style.display = "none";

    document.getElementById("detalhesEventos")
    .innerHTML = "";

    // Esconde detalhes dos eventos
    document.getElementById("detalhesEventos")
    .style.display = "none";

    const dataInicial =
        document.getElementById("dataInicial").value;

    const dataFinal =
        document.getElementById("dataFinal").value;

    document.getElementById("areaGraficoDetalhes")
        .style.display = "block";

    // Fecha detalhes de Units
    document.getElementById("detalhesUnits")
    .style.display = "none";

    document.getElementById("detalhesUnits")
    .innerHTML = "";

    // Lê o Excel local
    const dados =
        await lerExcel();

    // Filtra período
    const turno =
        document.getElementById("turno").value;

    const area =
        document.getElementById("area").value;

    const dadosFiltrados =
        filtrarPorDataETurnoEArea(
            dados,
            dataInicial,
            dataFinal,
            turno,
            area
        );

    // Filtra apenas a linha clicada
    const linhaDados =
        dadosFiltrados.filter(
            item => item.Line === linha
        );

const ranking = {};

linhaDados.forEach(item => {

    const motivo = item.SubOrigin || "-";
    const modelo = item.Model || "-";
    const downtime = Number(item.Downtime || 0);

    if (!ranking[motivo]) {

        ranking[motivo] = {
            downtime: 0,
            models: {}
        };
    }

    ranking[motivo].downtime += downtime;

    ranking[motivo].models[modelo] =
        (ranking[motivo].models[modelo] || 0)
        + downtime;
});

const detalhes = Object.entries(ranking)

.map(([SubOrigin, dados]) => {

    const modelos =
        Object.entries(dados.models)

        .sort((a,b) => b[1] - a[1])

        .slice(0, 3)

        .map(
            ([modelo, tempo]) =>
            `${modelo}&nbsp; 
            <span style="color:#ff5555;font-weight:bold;">( ${tempo} )
            </span>`  
        )

        .join("<br>");

    return {

        SubOrigin,
        Downtime: dados.downtime,
        Models: modelos
    };
})

.sort((a,b) =>
    b.Downtime - a.Downtime
);

    criarGraficoDetalhes(detalhes);

    let html = `
        <h2>DETAILS ${linha}</h2>

        <table class="tabelaDetalhes">

            <tr>
                <th>Reason</th>
                <th>Downtime</th>
                <th>Model</th>
            </tr>
    `;

    detalhes.forEach(item => {

        html += `
            <tr>
                <td>${item.SubOrigin}</td>
                <td>
                    <span style="color:#ff5555;font-weight:bold;">
                    ${item.Downtime} 
                    </span>
                </td>
                <td>${item.Models}</td>
            </tr>
        `;
    });

    html += `
        </table>
    `;

    document.getElementById("detalhesLinha")
        .style.display = "block";

    document.getElementById("detalhesLinha")
        .innerHTML = html;
}
function criarGraficoDetalhes(dados) {

    const ctx =
        document.getElementById("graficoDetalhes");

    if (graficoDetalhes) {
        graficoDetalhes.destroy();
    }

    graficoDetalhes = new Chart(ctx, {

        type: "bar",

        plugins: [barPercentagePlugin],

        data: {

            labels: dados.map(x => x.SubOrigin),

            datasets: [{

                data: dados.map(x => x.Downtime),

                backgroundColor: "#00ff9d",

                borderRadius: 8,

                borderSkipped: false,

                borderColor: "#ffffff",

                borderWidth: 2,

                barThickness: 18,

                maxBarThickness: 20

            }]
        },

        options: {

            indexAxis: "y",

            responsive: true,

            maintainAspectRatio: false,

            plugins: {

                legend: {
                    display: false
                }

            },

            scales: {

                x: {

                    suggestedMax:
                    Math.max(...dados.map(x => x.Downtime)) * 1.20,

                    ticks: {
                        color: "white"
                    },

                    grid: {
                        color: "rgba(255,255,255,0.1)"
                    }
                },

                y: {

                    ticks: {
                        color: "white"
                    },

                    grid: {
                        color: "rgba(255,255,255,0.1)"
                    }
                }
            }
        }
    });
    
}
function normalizarSubOrigin(valor) {

    const mapa = {
        "EXCESSO DE FALHA": "EXCESSO DE FALHAS",
        "EXCESSO FALHAS": "EXCESSO DE FALHAS",
        "FALTA ABASTECIMENTO": "FALTA DE ABASTECIMENTO",
        "TREINAMENTOS": "TREINAMENTO",
        "TREINAMENTO LINHA": "TREINAMENTO"
    };

    if (!valor) {
        return "";
    }

    valor = valor
        .toString()
        .toUpperCase()
        .trim();

    return mapa[valor] || valor;
}
function prepararDados(dados) {

    return dados.map(item => ({
        ...item,

        SubOrigin:
            normalizarSubOrigin(item.SubOrigin),

        Line:
            String(item.Line || "")
            .toUpperCase()
            .trim(),

        Shift:
            String(item.Shift || "")
            .trim()
    }));
}
function obterArea(line) {

    const linha = String(line || "").toUpperCase();

    if (linha.includes("CFC")) {
        return "CFC";
    }

    if (linha.includes("BE")) {
        return "BACKEND";
    }

    if (linha.includes("FE")) {
        return "FRONTEND";
    }

    return "";
}
async function lerExcel() {

    const arquivo =
        document.getElementById("arquivoExcel").files[0];

    const buffer =
        await arquivo.arrayBuffer();

    const workbook =
        XLSX.read(buffer, {
            type: "array"
        });

    const sheet =
        workbook.Sheets[
            workbook.SheetNames[0]
        ];

    let dados =
        XLSX.utils.sheet_to_json(sheet);

    dados = prepararDados(dados);

    return dados;
}
function filtrarPorDataETurnoEArea(
    dados,
    dataInicial,
    dataFinal,
    turno,
    area
) {

    const inicio = new Date(dataInicial);
    const fim = new Date(dataFinal);

    return dados.filter(item => {

        const dataRegistro =
            new Date(item.Date);

        const dentroPeriodo =
            dataRegistro >= inicio &&
            dataRegistro <= fim;

        const turnoValido =
            !turno ||
            item.Shift === turno;

        const areaLinha =
            obterArea(item.Line);

        const areaValida =
            !area ||
            areaLinha === area;

        return (
            dentroPeriodo &&
            turnoValido &&
            areaValida
        );
    });
}
function gerarTop3(dados) {

    const ranking = {};

    dados.forEach(item => {

        const linha = item.Line;

        const downtime =
            Number(item.Downtime || 0);

        ranking[linha] =
            (ranking[linha] || 0)
            + downtime;
    });

    console.log("RANKING", ranking);

    return Object.entries(ranking)

        .map(([Line, Downtime]) => ({
            Line,
            Downtime
        }))

        .sort((a, b) =>
            b.Downtime - a.Downtime
        )

        .slice(0, 3);
}
function gerarTop3Eventos(dados) {

    const ranking = {};

    dados.forEach(item => {

        const downtime =
            Number(item.Downtime || 0);

        if (downtime <= 0) return;

        if (!ranking[downtime]) {

            ranking[downtime] = {
                Downtime: downtime,
                Ocorrencias: 0,
                Registros: []
            };
        }

        ranking[downtime].Ocorrencias++;

        ranking[downtime].Registros.push(item);

    });

    return Object.values(ranking)

.sort((a, b) =>
    b.Downtime - a.Downtime
)
        .slice(0, 3);
}
function criarCardsEventos(dados) {

    let html = "";

    const tops = ["TOP 1 - EVENTS", "TOP 2 - EVENTS", "TOP 3 - EVENTS"];

    const classes = [
    "gold",
    "silver",
    "bronze"
];

    dados.forEach((item, index) => {

        html += `

            <div class="cardEvento ${classes[index]}"
                onclick="mostrarDetalhesEvento(${item.Downtime})">

              <div class="rank">
                 ${tops[index]}
            </div>

            <div class="ocorrencias">
                 ${item.Ocorrencias} Occurrences
              </div>

             <div class="valor">
                 ${item.Downtime} min
             </div>

</div>

`;
    });

    document.getElementById("cardsEventos").innerHTML = html;
}
function mostrarDetalhesEvento(downtime) {

    // Esconde detalhes da linha
document.getElementById("detalhesLinha")
    .style.display = "none";

// Esconde gráfico de motivos da linha
document.getElementById("areaGraficoDetalhes")
    .style.display = "none";

// Fecha detalhes de Units
document.getElementById("detalhesUnits")
    .style.display = "none";

document.getElementById("detalhesUnits")
    .innerHTML = "";

    const grupo =
        topEventosGlobal.find(
            x => x.Downtime === downtime
        );

    if (!grupo) return;

    grupo.Registros.sort((a, b) => {

    const dataA = new Date(a.Date);
    const dataB = new Date(b.Date);

    return dataB - dataA; // mais recente primeiro
});

    let html = `

        <h2>
            EVENT DETAILS
            (${downtime} min)
        </h2>

        <table class="tabelaDetalhes">

            <tr>
                <th>Date</th>
                <th>Line</th>
                <th>Model</th>
                <th>Downtime</th>
                <th>Reason</th>
                <th>Commentary</th>
                <th>Employee</th>
            </tr>

    `;

    grupo.Registros.forEach(item => {

       const partes = (item.Date || "").split("/");

        const dataBR = partes.length === 3? `${partes[1]}/${partes[0]}/${partes[2]}`: "-"; 

        html += `



            <tr>

                <td>${dataBR}</td>

                <td>${item.Line || "-"}</td>

                <td>${item.Model || "-"}</td>

                <td>
                    <span style="color:#ff5555;font-weight:bold;">
                    ${item.Downtime || "-"}
                    </span>    
                </td>

                <td>${item.SubOrigin || "-"}</td>

                <td>${item.Commentary || "-"}</td>

                <td>${item.Employee || "-"}</td>

            </tr>

        `;
    });

html += "</table>";

const detalhes =
    document.getElementById("detalhesEventos");

detalhes.style.display = "none";

detalhes.innerHTML = html;

detalhes.style.display = "block";


    //document.getElementById("detalhesEventos")
        //.scrollIntoView({
        //    behavior: "smooth"
       // });
}
function criarGraficoEventos(dados) {

    const ctx =
        document.getElementById("graficoEventos");

    if (graficoEventos) {
        graficoEventos.destroy();
    }

    graficoEventos = new Chart(ctx, {

        type: "doughnut",

        plugins: [percentagePlugin],

        data: {

            labels: dados.map(
                x => `${x.Downtime} min`
            ),

            datasets: [{

                data: dados.map(
                    x => x.Downtime
                ),

                backgroundColor: [
                    "#FFD700",
                    "#C0C0C0",
                    "#CD7F32"
                ],

                borderColor: "#ffffff",

                borderWidth: 3,

                hoverOffset: 25
            }]
        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            cutout: "78%",

            plugins: {

                legend: {

                    position: "bottom",

                    labels: {

                        color: "#ffffff",

                        font: {
                            size: 12,
                            weight: "bold"
                        }
                    }
                }
            }
        }
    });
}
function toggleTopLine() {

    const area =
        document.getElementById("conteudoTopLine");

    const icone =
        document.getElementById("iconeTopLine");

    if (area.style.display === "none") {

        area.style.display = "block";

        icone.innerHTML = "-";

    } else {

        area.style.display = "none";

        icone.innerHTML = "+";

        // Fecha detalhes da linha
        document.getElementById("detalhesLinha")
            .style.display = "none";

        document.getElementById("detalhesLinha")
            .innerHTML = "";

        // Fecha gráfico detalhado
        document.getElementById("areaGraficoDetalhes")
            .style.display = "none";

        // Destroi gráfico detalhado
        if (graficoDetalhes) {
            graficoDetalhes.destroy();
            graficoDetalhes = null;
        }
    }
}
function toggleEventos() {

    const area =
        document.getElementById("conteudoEventos");

    const icone =
        document.getElementById("iconeEventos");

    if (area.style.display === "none") {

        area.style.display = "block";

        icone.innerHTML = "-";

    } else {

        area.style.display = "none";

        icone.innerHTML = "+";

        // Fecha detalhes dos eventos
        document.getElementById("detalhesEventos")
            .style.display = "none";

        document.getElementById("detalhesEventos")
            .innerHTML = "";
    }
}
function gerarTop3Units(dados) {

    const ranking = {};

    dados.forEach(item => {

        const linha = item.Line;

        const unidades =
            Number(item.Unidades || 0);

        ranking[linha] =
            (ranking[linha] || 0)
            + unidades;
    });

    return Object.entries(ranking)

        .map(([Line, Units]) => ({
            Line,
            Units
        }))

        .sort(
            (a, b) =>
                b.Units - a.Units
        )

        .slice(0, 3);
}
function criarCardsUnits(dados) {

    let html = "";

    const tops = [
        "TOP 1 - UNITS",
        "TOP 2 - UNITS",
        "TOP 3 - UNITS"
    ];

    const classes = [
    "gold",
    "silver",
    "bronze"
];

    dados.forEach((item, index) => {

        html += `

        <div class="cardEvento ${classes[index]}"
        onclick="mostrarDetalhesUnits('${item.Line}')">


            <div class="rank">
                ${tops[index]}
            </div>

            <div class="descricao">
                ${item.Line}
            </div>

            <div class="valor">
                ${item.Units.toLocaleString()}
            </div>

        </div>

        `;
    });

    document.getElementById("cardsUnits")
        .innerHTML = html;
}
function criarGraficoUnits(dados) {

    const ctx =
        document.getElementById("graficoUnits");

    if (graficoUnits) {
        graficoUnits.destroy();
    }

    graficoUnits = new Chart(ctx, {

        type: "doughnut",

        plugins: [percentagePlugin],

        data: {

            labels: dados.map(
                x => x.Line
            ),

datasets: [{

    data: dados.map(
        x => x.Units
    ),

    backgroundColor: [
        "#FFD700",
        "#C0C0C0",
        "#CD7F32"
    ],

    borderColor: "#ffffff",

    borderWidth: 3,

    hoverOffset: 25
}]
        },
        options: {

    responsive: true,

    maintainAspectRatio: false,

    cutout: "78%",

    plugins: {

        legend: {

            position: "bottom",

            labels: {

                color: "#ffffff",

                font: {
                    size: 12,
                    weight: "bold"
                }
            }
        }
    }
}

    });
}
function toggleUnits() {

    const area =
        document.getElementById("conteudoUnits");

    const icone =
        document.getElementById("iconeUnits");

    if (area.style.display === "none") {

        area.style.display = "block";

        icone.innerHTML = "-";

    } else {

        area.style.display = "none";

        icone.innerHTML = "+";

        document.getElementById("detalhesUnits")
            .style.display = "none";

        document.getElementById("detalhesUnits")
            .innerHTML = "";
    }
}
async function mostrarDetalhesUnits(linha) {

    // Fecha detalhes da linha
document.getElementById("detalhesLinha")
    .style.display = "none";

document.getElementById("detalhesLinha")
    .innerHTML = "";

// Fecha detalhes dos eventos
document.getElementById("detalhesEventos")
    .style.display = "none";

document.getElementById("detalhesEventos")
    .innerHTML = "";

// Fecha gráfico da linha
document.getElementById("areaGraficoDetalhes")
    .style.display = "none";

    const dataInicial =
        document.getElementById("dataInicial").value;

    const dataFinal =
        document.getElementById("dataFinal").value;

    const turno =
        document.getElementById("turno").value;

    const area =
        document.getElementById("area").value;

    const dados =
        await lerExcel();

    const dadosFiltrados =
        filtrarPorDataETurnoEArea(
            dados,
            dataInicial,
            dataFinal,
            turno,
            area
        );

    const registros =
        dadosFiltrados.filter(
            item => item.Line === linha
        );

    registros.sort(
        (a,b) =>
            Number(b.Unidades || 0)
            -
            Number(a.Unidades || 0)
    );

    let html = `

        <h2>${linha} - LOST UNITS DETAILS</h2>

        <table class="tabelaDetalhes">

            <tr>
                <th>Date</th>
                <th>Hour</th>
                <th>Model</th>
                <th>Rate</th>
                <th>Downtime</th>
                <th>Units</th>
                <th>Commentary</th>
                <th>Employee</th>
            </tr>

    `;

    registros.forEach(item => {

        const partes = (item.Date || "").split("/");

        const dataBR =
        partes.length === 3
        ? `${partes[1]}/${partes[0]}/${partes[2]}`
        : "-";

        html += `

            <tr>

                <td>${dataBR}</td>

                <td>${item.HoraRef || "-"}</td>

                <td>${(item.Model || "-")
                    .replace("_PCBA", "")
                    .replace("_LP4X", "")}
                </td>

                <td>${item.Rate || "-"}</td>

                <td>${item.Downtime || "-"}</td>

                <td>${item.Unidades || "-"}</td>

                <td>${item.Commentary || "-"}</td>

                <td>${item.Employee || "-"}</td>

            </tr>

        `;
    });

    html += "</table>";

    const detalhes =
        document.getElementById("detalhesUnits");

    detalhes.innerHTML = html;

    detalhes.style.display = "block";
    
    detalhes.scrollIntoView({
    behavior: "smooth",
    block: "start"
});
}
