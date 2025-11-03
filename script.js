// VARIABLES GLOBALES 
    let citas = []; // Array donde guardamos todas las citas
    let editandoId = null; // ID de la cita que se está editando ( null si no se está editando ninguna )
    const form = document.querySelector("#form-cita"); //Referencia al id del formulario
    const tabla = document.querySelector("#tabla-citas tbody"); //Referencia al cuerpo de la tabla
    const mensaje = document.querySelector("#mensaje"); //Referencia al div de mensajes

// FUNCIONES

// Cargar citas almacenadas en LocalStorage

function cargarCitas() { // Función para cargar las citas desde el almacenamiento local del navegador 
  const data = localStorage.getItem("citas"); // localStorage.getItem("citas") obtiene la cadena JSON almacenada bajo la clave "citas" en el localStorage del navegador 
  citas = data ? JSON.parse(data) : []; // JSON.parse(data) convierte la cadena JSON de vuelta a un array de objetos. Si no hay datos, inicializa citas como un array vacío 
  mostrarCitas(); // Llama a la función mostrarCitas para actualizar la tabla con las citas cargadas 
}

// Guardar las citas en LocalStorage

function guardarCitas() { /* Función para guardar las citas en el almacenamiento local del navegador */
  localStorage.setItem("citas", JSON.stringify(citas)); /* Convierte el array de citas a una cadena JSON y la guarda en localStorage */
}

// Mostrar las citas en la tabla

function mostrarCitas() { // Función para mostrar las citas en la tabla HTML 
  tabla.innerHTML = ""; // Vaciamos el tbody para eviar duplicados al re-renderizar 
  if (citas.length === 0) { // Si no hay citas, mostramos un mensaje 
    tabla.innerHTML = `<tr class="sinCitas"><td colspan="6">No hay citas registradas</td></tr>`;
    return; // Salimos de la función 
  }

  citas.forEach((cita, index) => { // Recorremos con index el array de citas
    const fila = document.createElement("tr"); // Creamos una nueva fila para la tabla en memoria 

    /* Insertamos HTML dentro de la fila con innerHTML ya que tenemos los datos en local, 
    si el contenido viniera de usuarios externos usamos textContent para evitar inyecciones XSS
    ${index + 1} muestra el número de la cita en la lista */

    fila.innerHTML = ` 
      <td>${index + 1}</td> 
      <td>${cita.nombre} ${cita.apellidos}</td>
      <td>${cita.fecha}</td>
      <td>${cita.hora}</td>
      <td>${cita.telefono}</td>
      <td class="actions">
        <button class="btn-edit">Editar</button>
        <button class="btn-delete">Eliminar</button>
      </td>
    `;

    // Asignamos funciones a los botones editar y eliminar que se ejecutarán al hacer click 

    fila.querySelector(".btn-edit").onclick = () => editarCita(cita.id);
    fila.querySelector(".btn-delete").onclick = () => eliminarCita(cita.id);

    tabla.appendChild(fila); // Añadimos la fila al tbody de la tabla para que se muestre en pantalla 
  });
}

// Mostrar mensaje temporal

function mostrarMensaje(texto) { // Función para mostrar un mensaje temporal al usuario 
  mensaje.textContent = texto; // Pone el texto dentro del <div id="mensaje"> 
  mensaje.style.display = "block"; // Cambiamos la propiedad CSS a "block" para que el mensaje sea visible 
  setTimeout(() => (mensaje.style.display = "none"), 2000); // Después de 2 segundos, ocultamos el mensaje cambiando la propiedad CSS a "none" 
}

// Validar formulario (retorna true si es válido)

function validarFormulario() { // Función para validar los campos del formulario 
  let valido = true; // Variable que indica si el formulario es válido 

  // Limpiamos errores que pudiesen haber aparecido en los campos del formulario para no confundir al usuario 

  document.querySelectorAll(".error-msg").forEach(e => e.textContent = "");
  document.querySelectorAll("input").forEach(e => e.classList.remove("error"));

  function error(id, texto) { // Función para marcar un campo como erróneo 
    const input = document.querySelector("#" + id); // Seleccionamos el input por su id 
    input.classList.add("error"); // Añadimos la clase CSS "error" para resaltar el campo 
    input.parentElement.querySelector(".error-msg").textContent = texto; // Mostramos el mensaje de error en el div correspondiente 
    valido = false; // Marcamos el formulario como no válido 
  }

  const nombre = document.querySelector("#nombre").value.trim(); // Obtenemos el valor del campo nombre y eliminamos espacios en blanco 
  const apellidos = document.querySelector("#apellidos").value.trim(); // Obtenemos el valor del campo apellidos y eliminamos espacios en blanco 
  const dni = document.querySelector("#dni").value.trim(); // Obtenemos el valor del campo dni y eliminamos espacios en blanco 
  const telefono = document.querySelector("#telefono").value.trim(); // Obtenemos el valor del campo telefono y eliminamos espacios en blanco 
  const nacimiento = document.querySelector("#nacimiento").value; // Obtenemos el valor del campo nacimiento 
  const fecha = document.querySelector("#fecha").value; // Obtenemos el valor del campo fecha 
  const hora = document.querySelector("#hora").value; // Obtenemos el valor del campo hora 

  if (!nombre) error("nombre", "El nombre es obligatorio"); // Si el nombre está vacío, llamamos a la función error 
  if (!apellidos) error("apellidos", "Los apellidos son obligatorios"); // Si los apellidos están vacíos, llamamos a la función error 
  if (!/^[0-9]{8}[A-Za-z]$/.test(dni)) error("dni", "Formato de DNI incorrecto"); // Validamos el formato del DNI con una expresión regular 
  if (!/^[0-9]{9}$/.test(telefono)) error("telefono", "Formato de teléfono incorrecto"); // Validamos el formato del teléfono con una expresión regular 
  if (!nacimiento) error("nacimiento", "Introduce fecha de nacimiento"); // Si la fecha de nacimiento está vacía, llamamos a la función error 
  if (!fecha) error("fecha", "Introduce fecha de cita"); // Si la fecha de la cita está vacía, llamamos a la función error 
  if (!hora) error("hora", "Introduce hora de cita"); // Si la hora de la cita está vacía, llamamos a la función error 

  return valido; // Retornamos si el formulario es válido o no 
}

// Guardar o editar cita

form.onsubmit = e => { // Se ejecuta la función cuando el usuario haga click en el botón de enviar del formulario 
  e.preventDefault(); // Evitamos que se recargue la página y que el formulario se envíe al servidor ya que lo queremos manejar con JavaScript 
  if (!validarFormulario()) return; // Si el formulario no es válido, salimos de la función 

  const nombre = document.querySelector("#nombre");
  const apellidos = document.querySelector("#apellidos");
  const dni = document.querySelector("#dni");
  const telefono = document.querySelector("#telefono");
  const nacimiento = document.querySelector("#nacimiento");
  const fecha = document.querySelector("#fecha");
  const hora = document.querySelector("#hora");
  const observaciones = document.querySelector("#observaciones");

  // Obtenemos los valores de los campos del formulario

  const cita = {
    id: editandoId || Date.now(), // si editandoId tiene valor (no null o 0) se usa ese id, si no, Date.now() genera un número único (ID)
    nombre: nombre.value.trim(), // Obtenemos el valor del campo nombre y eliminamos espacios en blanco 
    apellidos: apellidos.value.trim(), // Obtenemos el valor del campo apellidos y eliminamos espacios en blanco
    dni: dni.value.trim(), // Obtenemos el valor del campo dni y eliminamos espacios en blanco
    telefono: telefono.value.trim(), // Obtenemos el valor del campo telefono y eliminamos espacios en blanco
    nacimiento: nacimiento.value, // Obtenemos el valor del campo nacimiento
    fecha: fecha.value, // Obtenemos el valor del campo fecha
    hora: hora.value, // Obtenemos el valor del campo hora
    observaciones: observaciones.value.trim() // Obtenemos el valor del campo observaciones y eliminamos espacios en blanco
  };

  if (editandoId) {

    // Si se está editando una cita existente
    const i = citas.findIndex(c => c.id === editandoId); // findIndex busca el índice de la cita que se está editando y la reemplaza
    citas[i] = cita; // Reemplazamos la cita en el array
    editandoId = null; // Reseteamos editandoId a null para indicar que ya no estamos editando
    mostrarMensaje("Cita actualizada correctamente"); // Mostramos mensaje
  } else {

    // Si es una nueva cita
    citas.push(cita); // Añadimos la nueva cita al final del array
    mostrarMensaje("Cita guardada correctamente"); // Mostramos mensaje
  }

  guardarCitas(); // Guardamos las citas en LocalStorage
  mostrarCitas(); // Actualizamos la tabla con las citas
  form.reset(); // Reseteamos el formulario para dejarlo vacío
};

// Editar cita

function editarCita(id) { //Se llama a esta función cuando el usuario hace click en el botón editar de una cita
  const cita = citas.find(c => c.id === id); //.find() busca el primer elemento en el array que cumple la condición (c.id === id) y lo devuelve
  if (!cita) return; // Si no se encuentra la cita, salimos de la función

  // Rellenamos el formulario con los datos de la cita para que el usuario pueda editarlos

  editandoId = id; // Guardamos el ID de la cita que se está editando
  nombre.value = cita.nombre; // Rellenamos el campo nombre con el valor de la cita y así sucesivamente con todos los campos
  apellidos.value = cita.apellidos; 
  dni.value = cita.dni; 
  telefono.value = cita.telefono; 
  nacimiento.value = cita.nacimiento; 
  fecha.value = cita.fecha; 
  hora.value = cita.hora;  
  observaciones.value = cita.observaciones; 

  window.scrollTo({ top: 0, behavior: "smooth" }); // Desplazamos la ventana hacia arriba para que el usuario vea el formulario
}

// Eliminar cita

function eliminarCita(id) { // Se llama a esta función cuando el usuario hace click en el botón eliminar de una cita
  if (confirm("¿Seguro que deseas eliminar esta cita?")) { // Preguntamos al usuario si está seguro de eliminar la cita
    citas = citas.filter(c => c.id !== id); // .filter() crea un nuevo array con todas las citas excepto la que tiene el ID que se quiere eliminar
    guardarCitas(); // Guardamos las citas en LocalStorage
    mostrarCitas(); // Actualizamos la tabla con las citas
    mostrarMensaje("Cita eliminada"); // Mostramos mensaje
  }
}

// Inicializar
cargarCitas(); //Llama a cargarCitas para mostrar en la tabla las citas almacenadas al cargar la página
