
async function cargarMalla() {
  const respuesta = await fetch('data/malla.json');
  const datos = await respuesta.json();
  const contenedor = document.getElementById('malla');
  const completados = new Set(JSON.parse(localStorage.getItem('ramosCompletados') || '[]'));
  const mapaRamos = new Map();
  const mapaDesbloqueos = new Map();

  datos.semestres.forEach((semestre) => {
    const columna = document.createElement('div');
    columna.classList.add('semestre');

    const sufijos = ["er", "do", "er", "to", "to", "to", "mo", "vo", "no", "mo"];
    const titulo = document.createElement('h2');
    titulo.textContent = `${semestre.numero}${sufijos[semestre.numero - 1]} semestre`;
    columna.appendChild(titulo);

    semestre.ramos.forEach((ramo) => {
      const divRamo = document.createElement('div');
      divRamo.classList.add('ramo');
      divRamo.dataset.codigo = ramo.codigo;
      divRamo.dataset.desbloquea = JSON.stringify(ramo.desbloquea || []);
      mapaRamos.set(ramo.codigo, divRamo);

      if (semestre.numero === 1) {
        divRamo.classList.add('primer-semestre');
        divRamo.classList.add('desbloqueado');
      }

      for (const desbloqueado of ramo.desbloquea || []) {
        if (!mapaDesbloqueos.has(desbloqueado)) {
          mapaDesbloqueos.set(desbloqueado, []);
        }
        mapaDesbloqueos.get(desbloqueado).push(ramo.codigo);
      }

      divRamo.textContent = `${ramo.codigo} - ${ramo.nombre}`;
      columna.appendChild(divRamo);
    });

    contenedor.appendChild(columna);
  });

  function actualizarProgreso() {
    const total = mapaRamos.size;
    const completadosCount = [...completados].filter(c => mapaRamos.has(c)).length;
    const porcentaje = Math.round((completadosCount / total) * 100);

    const barraInterno = document.getElementById("barra-interno");
    const gallina = document.getElementById("gallinita");

    if (barraInterno) barraInterno.style.width = `${porcentaje}%`;
    if (gallina) gallina.style.left = `calc(${porcentaje}% - 16px)`;
    document.getElementById("porcentaje").textContent = `${porcentaje}%`;

    const ingreso = new Date().getFullYear();
    if (completadosCount >= total) {
      const egreso = ingreso + 4;
      document.getElementById("estimacion").textContent = `Fecha estimada de término: diciembre ${egreso}`;
      if (!window._confetiMostrado) {
        window._confetiMostrado = true;
        confetti({
          particleCount: 300,
          spread: 150,
          origin: { y: 0.6 }
        });
        alert("¡Lo lograste, enfermer@! 🎉");
      }
    } else {
  const ingreso = new Date().getFullYear();
  const egreso = ingreso + 4;
  document.getElementById("estimacion").textContent = `Fecha estimada de término: diciembre ${egreso}`;
}
  }

  function actualizarEstadoRamos() {
    mapaRamos.forEach((divRamo, codigo) => {
      const requisitos = mapaDesbloqueos.get(codigo) || [];
      let desbloqueado = requisitos.length === 0 || requisitos.every(req => completados.has(req));

      if (completados.has(codigo)) {
        divRamo.classList.add('desbloqueado', 'completado');
        if (!divRamo.textContent.includes('✓')) divRamo.textContent += ' ✓';
      } else if (divRamo.classList.contains('primer-semestre') || desbloqueado) {
        divRamo.classList.add('desbloqueado');
        divRamo.classList.remove('completado');
        divRamo.textContent = divRamo.textContent.replace(' ✓', '');
      } else {
        divRamo.classList.remove('desbloqueado', 'completado');
        divRamo.textContent = divRamo.textContent.replace(' ✓', '');
      }
    });
    localStorage.setItem('ramosCompletados', JSON.stringify([...completados]));
    actualizarProgreso();
  }

  document.addEventListener('click', (e) => {
    if (!e.target.classList.contains('ramo') || !e.target.classList.contains('desbloqueado')) return;
    const codigo = e.target.dataset.codigo;
    if (completados.has(codigo)) {
      completados.delete(codigo);
    } else {
      completados.add(codigo);
    }
    actualizarEstadoRamos();
  });

  const modoSwitch = document.getElementById("modoNoche");
  if (modoSwitch) {
    modoSwitch.addEventListener("change", () => {
      document.body.classList.toggle("noche");
      document.querySelector("footer")?.classList.toggle("noche");
    });
  }

  actualizarEstadoRamos();
}

document.addEventListener('DOMContentLoaded', cargarMalla);
