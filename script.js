async function cargarMalla() {
  const respuesta = await fetch('data/malla.json');
  const datos = await respuesta.json();
  const contenedor = document.getElementById('malla');
  const completados = JSON.parse(localStorage.getItem('ramosCompletados') || '[]');

  datos.semestres.forEach((semestre) => {
    const columna = document.createElement('div');
    columna.classList.add('semestre');

    const titulo = document.createElement('h2');
    const sufijos = ["er", "do", "er", "to", "to", "to", "mo", "vo", "no", "mo"];
titulo.textContent = `${semestre.numero}${sufijos[semestre.numero - 1]} semestre`;
    columna.appendChild(titulo);

    semestre.ramos.forEach((ramo) => {
      const divRamo = document.createElement('div');
      divRamo.classList.add('ramo');
      divRamo.textContent = `${ramo.codigo} - ${ramo.nombre}`;
      divRamo.dataset.codigo = ramo.codigo;
      divRamo.dataset.desbloquea = JSON.stringify(ramo.desbloquea || []);

      if (completados.includes(ramo.codigo)) {
        divRamo.classList.add('completado');
        divRamo.classList.add('desbloqueado');
        divRamo.textContent += ' ✓';
      } else if (semestre.numero === 1) {
        divRamo.classList.add('desbloqueado');
      }

      columna.appendChild(divRamo);
    });

    contenedor.appendChild(columna);
  });
}

function activarInteraccion() {
  document.addEventListener('click', (e) => {
    if (!e.target.classList.contains('ramo') || !e.target.classList.contains('desbloqueado')) return;

    const completados = new Set(JSON.parse(localStorage.getItem('ramosCompletados') || '[]'));
    const codigo = e.target.dataset.codigo;

    if (e.target.classList.contains('completado')) {
      e.target.classList.remove('completado');
      e.target.textContent = e.target.textContent.replace(' ✓', '');
      completados.delete(codigo);
    } else {
      e.target.classList.add('completado');
      e.target.textContent += ' ✓';
      completados.add(codigo);

      const desbloqueos = JSON.parse(e.target.dataset.desbloquea || '[]');
      desbloqueos.forEach((codigo) => {
        const ramo = document.querySelector(`.ramo[data-codigo="${codigo}"]`);
        if (ramo) {
          ramo.classList.add('desbloqueado');
        }
      });
    }

    localStorage.setItem('ramosCompletados', JSON.stringify([...completados]));
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  await cargarMalla();
  activarInteraccion();
});
