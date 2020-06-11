// Conexión con el servidor en el backend
var socket = io();

// Obtengo parámetro por URL
var params = new URLSearchParams(window.location.search);

// Me interesa q venga nombre y sala para construir el usuario y mandarlo al backend
if (!params.has('nombre') || !params.has('sala')) {
    window.location = 'index.html';
    throw new Error('El nombre y la sala son necesarios');
}

var usuario = {
    nombre: params.get('nombre'),
    sala: params.get('sala')
}

// Por usuario que entra, escucho la conexión y emito información al backend para q lo construya
socket.on('connect', function() {
    console.log('Conectado al servidor');
    socket.emit('entrarChat', usuario, function(resp) {
        console.log(resp);
    });
});

// escuchar
socket.on('disconnect', function() {
    console.log('Perdimos conexión con el servidor');
});

// Enviar información
// socket.emit('crearMensaje', {
//     mensaje: 'Hola Mundo'
// }, function(resp) {
//     console.log('respuesta server: ', resp);
// });

// Escuchar información
socket.on('crearMensaje', (mensaje) => {
    console.log('Servidor:', mensaje);
});

// Escucho cada vez q 1 usuario entra o sale del chat para devolver el total de conectados
socket.on('listaPersonas', (mensaje) => {
    console.log(mensaje);
});

socket.on('mensajePrivado', mensaje => {
    console.log(mensaje);
});