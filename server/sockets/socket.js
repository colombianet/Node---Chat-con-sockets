const { io } = require('../server');
const { Usuario } = require('../classes/usuario');
const { crearMensaje } = require('../utilidades/utilidades');

const usuarios = new Usuario();

io.on('connection', (client) => {

    // Estar pendiente cada q 1 usuario entre para recibir la info desde el front end
    client.on('entrarChat', (data, callback) => {

        // Parámetros necesario para construir usuarios
        if (!data.nombre || !data.sala) {
            return callback({
                err: true,
                mensaje: 'El nombre y la sala son necesarios'
            });
        }

        // Agrego al nuevo usuario al array
        usuarios.agregarPersona(client.id, data.nombre, data.sala);

        client.join(data.sala);

        // Emito la lista de usuarios conectados a una sala incluyendo el q ingresa, para el front end
        client.broadcast.to(data.sala).emit('listaPersonas', usuarios.getPersonasPorSala(data.sala));

        // Mando al front end el usuario que acaba de entrar
        client.broadcast.to(data.sala).emit('crearMensaje', crearMensaje('Admin', `${ data.nombre } entró`));


        // Cada vez q se cree 1 usuario, mostrar el array de todos los usuarios
        callback(usuarios.getPersonasPorSala(data.sala));
    });

    // Servidor pendiente cuando envíen mensajes para mandarlos al front end
    client.on('crearMensaje', (data, callback) => {
        // Obtengo los datos del client para no tener q colocar el nombre cada vez q envío 1 mensaje
        let persona = usuarios.getPersona(client.id);

        // Creo la estructura del mensaje (utilidades)
        let mensaje = crearMensaje(persona.nombre, data.mensaje);

        // Envío el mensaje solo a los usuarios q estén en la misma sala
        client.broadcast.to(persona.sala).emit('crearMensaje', mensaje);

        callback(mensaje);
    });

    client.on('mensajePrivado', data => {
        // Obtengo los datos de la persona emisora y recptora
        let personaEmite = usuarios.getPersona(client.id);
        let personaRecibe = usuarios.getPersona(data.para);

        let mensaje = crearMensaje(personaEmite.nombre, data.mensaje);

        // Solo permito envío de mensajes privados a usuarios en la misma sala de chat
        if (personaEmite.sala != personaRecibe.sala) {
            return;
        } else {
            client.broadcast.to(data.para).emit('mensajePrivado', mensaje);
        }
    });

    // Escuchar la desconexión de los usuarios
    client.on('disconnect', () => {
        // Borro el usuario desconectado del array y guardo la referencia del mismo para el front end
        let personaDesconetada = usuarios.borrarPersona(client.id);

        // Solo a los usuario q pertenecen a la misma sale les emito/notifico del usuario q se desconectó
        client.broadcast.to(personaDesconetada.sala).emit('crearMensaje', crearMensaje('Admin', `${ personaDesconetada.nombre } salió`));

        // Emito los usuarios que quedaron conectados en esa sala
        client.broadcast.to(personaDesconetada.sala).emit('listaPersonas', usuarios.getPersonasPorSala(personaDesconetada.sala));
    });
});