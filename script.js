async function cargarMalla() {
  const respuesta = await fetch('data/malla.json');
  const datos = await respuesta.json();
  const contenedor = document.getElementById('malla');

  datos.semestres.forEach((semestre) => {
    const columna = document.createElement('div');
    columna.classList.add('semestre');
    if (semestre.numero !== 1) columna.classList.add('bloqueado');

    const titulo = document.createElement('h2');
    titulo.textContent = `Semestre ${semestre.numero}`;
    columna.appendChild(titulo);

    semestre.ramos.forEach((ramo) => {
      const divRamo = document.createElement('div');
      divRamo.classList.add('ramo');
      if (semestre.numero === 1) divRamo.classList.add('desbloqueado');

      divRamo.textContent = `${ramo.codigo} - ${ramo.nombre}`;
      divRamo.dataset.codigo = ramo.codigo;
      divRamo.dataset.desbloquea = JSON.stringify(ramo.desbloquea || []);
      columna.appendChild(divRamo);
    });

    contenedor.appendChild(columna);
  });
}

function activarDesbloqueo() {
  document.addEventListener('click', (e) => {
    if (
      e.target.classList.contains('ramo') &&
      e.target.classList.contains('desbloqueado') &&
      !e.target.classList.contains('completado')
    ) {
      e.target.classList.add('completado');
      e.target.textContent += ' ✓';

      const desbloqueos = JSON.parse(e.target.dataset.desbloquea || '[]');

      desbloqueos.forEach((codigo) => {
        const ramoADesbloquear = document.querySelector(`.ramo[data-codigo="${codigo}"]`);
        if (ramoADesbloquear) {
          ramoADesbloquear.classList.add('desbloqueado');
          ramoADesbloquear.classList.remove('bloqueado');
        }
      });
    }
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  await cargarMalla();
  activarDesbloqueo();
});
