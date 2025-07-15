let mapaRamos = new Map();
const completados = new Set();

function cargarMalla() {
  fetch("data/malla.json")
    .then(response => response.json())
    .then(data => inicializarMalla(data))
    .catch(error => console.error("Error al cargar malla.json", error));
}

function inicializarMalla(data) {
  const contenedor = document.getElementById("malla");
  const semestres = data.semestres;

  mapaRamos = new Map();

  semestres.forEach(semestre => {
    const columna = document.createElement("div");
    columna.classList.add("semestre");

    const titulo = document.createElement("h3");
    const sufijo = semestre.numero === 1 ? "er" : semestre.numero === 3 ? "er" : "do";
    titulo.textContent = `${semestre.numero}º semestre`.replace("1º", "1er").replace("2º", "2do").replace("3º", "3er");
    columna.appendChild(titulo);

    semestre.ramos.forEach(ramo => {
      const boton = document.createElement("button");
      boton.textContent = ramo.nombre;
      boton.dataset.codigo = ramo.codigo;
      boton.classList.add("ramo");
      boton.classList.add("bloqueado");

      mapaRamos.set(ramo.codigo, {
        element: boton,
        desbloquea: ramo.desbloquea || [],
        requisitos: ramo.requisitos || []
      });

      boton.addEventListener("click", () => {
        if (!boton.classList.contains("desbloqueado") && !boton.classList.contains("aprobado")) return;

        boton.classList.toggle("aprobado");

if (boton.classList.contains("aprobado") && !boton.textContent.includes("✓")) {
  boton.textContent += " ✓";
} else if (!boton.classList.contains("aprobado")) {
  boton.textContent = boton.textContent.replace(" ✓", "");
}

const codigo = boton.dataset.codigo;
if (completados.has(codigo)) {
  completados.delete(codigo);
} else {
  completados.add(codigo);
}

actualizarEstadoRamos();
actualizarProgreso();

      });

      columna.appendChild(boton);
    });

    contenedor.appendChild(columna);
  });

  cargarDesdeLocalStorage();
  actualizarEstadoRamos();
  actualizarProgreso();
}

function actualizarEstadoRamos() {
  mapaRamos.forEach((ramo, codigo) => {
    const requisitos = ramo.requisitos || [];
    const desbloqueado = requisitos.every(r => completados.has(r));
    const estaAprobado = completados.has(codigo);

    ramo.element.classList.toggle("desbloqueado", desbloqueado || estaAprobado);
    ramo.element.classList.toggle("bloqueado", !desbloqueado && !estaAprobado);
    ramo.element.classList.toggle("aprobado", estaAprobado);
  });

  guardarEnLocalStorage();
}

function actualizarProgreso() {
  const total = mapaRamos.size;
  const completadosCount = [...completados].filter(c => mapaRamos.has(c)).length;
  const porcentaje = Math.round((completadosCount / total) * 100);

  const barraInterno = document.getElementById("barra-progreso")?.querySelector("#barra-interno");
  const gallina = document.getElementById("gallinita");

  if (barraInterno) barraInterno.style.width = `${porcentaje}%`;
  if (gallina) gallina.style.left = `calc(${porcentaje}% - 16px)`;
  document.getElementById("porcentaje").textContent = `${porcentaje}%`;

  // Calcular egreso dinámico
  const ramosPorSemestre = total / 10;
  const semestresCompletados = Math.floor(completadosCount / ramosPorSemestre);
  const añosExtra = Math.floor(semestresCompletados / 2);
  const añoActual = new Date().getFullYear();
  const añoEgreso = añoActual + (5 - añosExtra);

  document.getElementById("estimacion").textContent = `Fecha estimada de término: diciembre ${añoEgreso}`;

  if (completadosCount >= total && !window._confetiMostrado) {
    window._confetiMostrado = true;
    confetti({
      particleCount: 300,
      spread: 150,
      origin: { y: 0.6 }
    });
    alert("¡Lo lograste, enfermer@! 🎉");
  }
}

function guardarEnLocalStorage() {
  localStorage.setItem("ramosAprobados", JSON.stringify([...completados]));
}

function cargarDesdeLocalStorage() {
  const datos = localStorage.getItem("ramosAprobados");
  if (datos) {
    const aprobados = JSON.parse(datos);
    aprobados.forEach(codigo => completados.add(codigo));
  }
}

const modoSwitch = document.getElementById("modoNoche");
if (modoSwitch) {
  modoSwitch.addEventListener("change", () => {
    document.body.classList.toggle("noche");
    document.querySelector("footer")?.classList.toggle("noche");
  });
}

document.addEventListener("DOMContentLoaded", cargarMalla);
