const crearMensaje = (nombre, mensaje) => {
    let data = {
        nombre,
        mensaje,
        fecha: new Date().getTime()
    }
    return data;
}

module.exports = {
    crearMensaje
}