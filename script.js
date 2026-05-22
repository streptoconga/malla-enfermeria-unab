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

    titulo.textContent = `${semestre.numero}º semestre`
      .replace("1º", "1er")
      .replace("2º", "2do")
      .replace("3º", "3er");

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
  requisitos: []
});

      boton.addEventListener("click", () => {

        if (
          !boton.classList.contains("desbloqueado") &&
          !boton.classList.contains("aprobado")
        ) {
          return;
        }

        boton.classList.toggle("aprobado");

        if (
          boton.classList.contains("aprobado") &&
          !boton.textContent.includes("✓")
        ) {
          boton.textContent += " ✓";
        } else if (!boton.classList.contains("aprobado")) {
          boton.textContent =
            boton.textContent.replace(" ✓", "");
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
// Generar requisitos automáticamente
mapaRamos.forEach((ramoActual, codigoActual) => {

  mapaRamos.forEach((otroRamo, codigoOtro) => {

    if (
      otroRamo.desbloquea.includes(codigoActual)
    ) {
      ramoActual.requisitos.push(codigoOtro);
    }

  });

});
  cargarDesdeLocalStorage();
  actualizarEstadoRamos();
  actualizarProgreso();
}

function actualizarEstadoRamos() {

  mapaRamos.forEach((ramo, codigo) => {

    const requisitos = ramo.requisitos || [];

    const desbloqueado =
      requisitos.every(r => completados.has(r));

    const aprobado = completados.has(codigo);

    ramo.element.classList.remove(
      "bloqueado",
      "desbloqueado",
      "aprobado"
    );

    if (aprobado) {

      ramo.element.classList.add("aprobado");

    } else if (
      desbloqueado ||
      requisitos.length === 0
    ) {

      ramo.element.classList.add("desbloqueado");

    } else {

      ramo.element.classList.add("bloqueado");

    }

  });

  guardarEnLocalStorage();
}

function actualizarProgreso() {

  const total = mapaRamos.size;

  const completadosCount =
    [...completados].filter(c => mapaRamos.has(c)).length;

  const porcentaje =
    Math.round((completadosCount / total) * 100);

  const barraInterno =
    document.getElementById("barra-progreso")
      ?.querySelector("#barra-interno");

  const gallina =
    document.getElementById("gallinita");

  if (barraInterno) {
    barraInterno.style.width = `${porcentaje}%`;
  }

  if (gallina) {
    gallina.style.left = `calc(${porcentaje}% - 16px)`;
  }

  document.getElementById("porcentaje").textContent =
    `${porcentaje}%`;

  // Calcular avance real
  const ramosPorSemestre = total / 10;

  const semestreActual = Math.ceil(
    completadosCount / ramosPorSemestre
  );

  const semestresRestantes = Math.max(
    0,
    10 - semestreActual
  );

  const añosRestantes = Math.ceil(
    semestresRestantes / 2
  );

  const añoActual = new Date().getFullYear();

  const añoEgreso =
    añoActual + añosRestantes;

  document.getElementById("estimacion").textContent =
    `Fecha estimada de término: diciembre ${añoEgreso}`;

  if (
    completadosCount >= total &&
    !window._confetiMostrado
  ) {

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
  localStorage.setItem(
    "ramosAprobados",
    JSON.stringify([...completados])
  );
}

function cargarDesdeLocalStorage() {

  const datos =
    localStorage.getItem("ramosAprobados");

  if (datos) {

    const aprobados = JSON.parse(datos);

    aprobados.forEach(codigo =>
      completados.add(codigo)
    );
  }
}

const modoSwitch =
  document.getElementById("modoNoche");

if (modoSwitch) {

  modoSwitch.addEventListener("change", () => {

    document.body.classList.toggle("noche");

    document.querySelector("footer")
      ?.classList.toggle("noche");

  });

}

document.addEventListener(
  "DOMContentLoaded",
  cargarMalla
);
