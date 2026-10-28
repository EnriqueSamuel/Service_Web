function marcar(campo, hayError, mensaje, errores) {
    if (hayError) {
        errores.push(mensaje);
        campo.classList.add("invalido");
        campo.classList.remove("valido");
    } else {
        campo.classList.remove("invalido");
        campo.classList.add("valido");
    }
}

function mostrarErrores(form, errores) {
    const respuesta = form.querySelector(".respuesta");
    respuesta.style.color = "#b42318";
    respuesta.innerHTML = errores.join("<br>");
    return errores.length === 0;
}

const formContacto = document.querySelector("#contacto");

if (formContacto) {
    formContacto.addEventListener("submit", (event) => {
        event.preventDefault();
        const errores = [];
        const nombre = document.querySelector("#nombre");
        const telefono = document.querySelector("#telefono");
        const correo = document.querySelector("#correo");
        const asunto = document.querySelector("#asunto");
        const mensaje = document.querySelector("#mensaje");
        const aviso = document.querySelector("#aviso");

        marcar(nombre, !/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]{3,}$/.test(nombre.value.trim()), "El nombre debe tener mínimo 3 letras y sin números", errores);
        marcar(telefono, !/^\d{10}$/.test(telefono.value), "El teléfono debe contener 10 dígitos", errores);
        marcar(correo, !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.value), "El correo no es válido", errores);
        marcar(asunto, asunto.value === "", "Elige un asunto", errores);
        marcar(mensaje, mensaje.value.trim().length < 15, "El mensaje debe tener mínimo 15 caracteres", errores);
        marcar(aviso, !aviso.checked, "Debes aceptar el aviso de privacidad", errores);

        if (mostrarErrores(formContacto, errores)) {
            Swal.fire({
                icon: "success",
                title: "Mensaje enviado",
                text: "Gracias " + nombre.value.trim().split(" ")[0] + ", te respondemos en 24 horas.",
                confirmButtonColor: "#a9502c"
            });
            formContacto.reset();
            formContacto.querySelectorAll(".valido").forEach(campo => campo.classList.remove("valido"));
        }
    });
}

const formRastreo = document.querySelector("#rastreo");

if (formRastreo) {
    const guia = document.querySelector("#guia");
    const resultado = document.querySelector("#resultado");

    if (localStorage.getItem("ultimaGuia")) {
        guia.value = localStorage.getItem("ultimaGuia");
    }

    formRastreo.addEventListener("submit", (event) => {
        event.preventDefault();
        const errores = [];

        marcar(guia, !/^\d{10}$/.test(guia.value), "La guía debe contener 10 dígitos y solo números", errores);

        if (!mostrarErrores(formRastreo, errores)) {
            resultado.innerHTML = "";
            return;
        }

        localStorage.setItem("ultimaGuia", guia.value);

        const pasos = ["Recibido en sucursal", "En camino a tu ciudad", "En reparto", "Entregado"];
        const suma = [...guia.value].reduce((total, num) => total + Number(num), 0);
        const avance = suma % 4;

        resultado.innerHTML = "<h2>Guía " + guia.value + "</h2><ol>" +
            pasos.map(paso => "<li class='paso'>" + paso + "</li>").join("") + "</ol>";

        document.querySelectorAll(".paso").forEach((paso, i) => {
            if (i <= avance) {
                setTimeout(() => paso.classList.add("listo"), i * 450);
            }
        });
    });
}

const formCotizar = document.querySelector("#cotizar");

if (formCotizar) {
    const ciudades = {
        "Tula de Allende": [20.05, -99.34],
        "Pachuca": [20.12, -98.73],
        "Ciudad de México": [19.43, -99.13],
        "Querétaro": [20.59, -100.39],
        "Puebla": [19.04, -98.2],
        "Guadalajara": [20.67, -103.35],
        "Monterrey": [25.69, -100.32],
        "Mérida": [20.97, -89.62]
    };

    const origen = document.querySelector("#origen");
    const destino = document.querySelector("#destino");
    const peso = document.querySelector("#peso");
    const largo = document.querySelector("#largo");
    const ancho = document.querySelector("#ancho");
    const alto = document.querySelector("#alto");
    const seguro = document.querySelector("#seguro");
    const total = document.querySelector("#total");
    const detalle = document.querySelector("#detalle");
    const historial = document.querySelector("#historial");

    if (localStorage.getItem("ultimaCotizacion")) {
        historial.textContent = "Tu última cotización fue " + localStorage.getItem("ultimaCotizacion") + ".";
    }

    formCotizar.addEventListener("submit", (event) => {
        event.preventDefault();
        const errores = [];

        marcar(origen, origen.value === "", "Elige la ciudad de origen", errores);
        marcar(destino, destino.value === "", "Elige la ciudad de destino", errores);
        if (origen.value !== "" && origen.value === destino.value) {
            marcar(destino, true, "El origen y el destino no pueden ser iguales", errores);
        }
        marcar(peso, !(Number(peso.value) > 0 && Number(peso.value) <= 70), "El peso debe estar entre 0.1 y 70 kg", errores);
        marcar(largo, Number(largo.value) < 1 || Number(largo.value) > 120, "El largo debe estar entre 1 y 120 cm", errores);
        marcar(ancho, Number(ancho.value) < 1 || Number(ancho.value) > 120, "El ancho debe estar entre 1 y 120 cm", errores);
        marcar(alto, Number(alto.value) < 1 || Number(alto.value) > 120, "El alto debe estar entre 1 y 120 cm", errores);

        if (!mostrarErrores(formCotizar, errores)) {
            return;
        }

        const a = ciudades[origen.value];
        const b = ciudades[destino.value];
        const rad = x => x * Math.PI / 180;
        const h = Math.sin(rad(b[0] - a[0]) / 2) ** 2 +
            Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(rad(b[1] - a[1]) / 2) ** 2;
        const km = 12742 * Math.asin(Math.sqrt(h));

        const volumen = largo.value * ancho.value * alto.value / 5000;
        const kg = Math.max(Number(peso.value), volumen);

        const servicio = formCotizar.servicio.value === "express"
            ? { base: 120, porKm: 0.06, dias: 1 }
            : { base: 70, porKm: 0.03, dias: 3 };

        const costo = servicio.base + km * servicio.porKm + kg * 9 + (seguro.checked ? 35 : 0);
        const dias = servicio.dias + Math.floor(km / 500);
        const precio = "$" + costo.toFixed(2) + " MXN";

        total.textContent = precio;
        detalle.textContent = origen.value + " a " + destino.value + ": unos " + Math.round(km) + " km y entrega en " + dias + " día(s) hábiles.";
        localStorage.setItem("ultimaCotizacion", precio);

        Swal.fire({
            icon: "success",
            title: precio,
            text: "Entrega estimada en " + dias + " día(s) hábiles.",
            confirmButtonColor: "#a9502c"
        });
    });
}