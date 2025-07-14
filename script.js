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

      if (semestre.numero === 1) divRamo.classList.add('primer-semestre');

      // Invertir la relación: de cada desbloqueado, saber quién lo desbloquea
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

  function actualizarEstadoRamos() {
    mapaRamos.forEach((divRamo, codigo) => {
      const requisitos = mapaDesbloqueos.get(codigo) || [];
      const desbloqueado = requisitos.length === 0 || requisitos.some(req => completados.has(req));
      if (divRamo.classList.contains('primer-semestre') || completados.has(codigo)) {
        divRamo.classList.add('desbloqueado');
        divRamo.classList.add('completado');
        if (!divRamo.textContent.includes('✓')) divRamo.textContent += ' ✓';
      } else if (desbloqueado) {
        divRamo.classList.add('desbloqueado');
        divRamo.classList.remove('completado');
        divRamo.textContent = divRamo.textContent.replace(' ✓', '');
      } else {
        divRamo.classList.remove('desbloqueado');
        divRamo.classList.remove('completado');
        divRamo.textContent = divRamo.textContent.replace(' ✓', '');
      }
    });
    localStorage.setItem('ramosCompletados', JSON.stringify([...completados]));
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

  actualizarEstadoRamos();
}
document.addEventListener('DOMContentLoaded', cargarMalla);
