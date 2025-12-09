import { useMemo } from "react";

export const desviacionEstandar = (data = [], calificaciones) => {
    const n = data?.length;
    const mean = data.reduce((acc, curr) => acc + curr, 0) / n;
    const variance = data.reduce((acc, curr) => acc + (curr - mean) ** 2, 0) / n;
    const desviacion = Math.sqrt(variance);
    return distribucionNormal(calificaciones, mean, desviacion);
}

export const distribucionNormal = (calificaciones, media, desviacion) => {
    const pi = Math.PI;
    if (Array.isArray(calificaciones)) {
        return calificaciones.flatMap((val) => {
            const coeficiente = 1 / (desviacion * Math.sqrt(2 * pi));
            const exponente = Math.exp(-Math.pow(val - media, 2) / (2 * Math.pow(desviacion, 2)));
            const valor = coeficiente * exponente;
            return { valor: val, promedio: isNaN(valor) ? 0 : valor };
        });
    }
}

export function smoothScrollTo(to, duration = 600) {
    const start = window.scrollY || window.pageYOffset
    const distance = to - start
    let startTime = null

    function animation(currentTime) {
        if (!startTime) startTime = currentTime
        const timeElapsed = currentTime - startTime
        const progress = Math.min(timeElapsed / duration, 1)

        // Easing (easeInOutCubic)
        const easing = progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2

        window.scrollTo(0, start + distance * easing)

        if (timeElapsed < duration) {
            requestAnimationFrame(animation)
        }
    }

    requestAnimationFrame(animation)
}


export function normalizarData(usuarios, evaluaciones) {
    return usuarios.map(user => {
        const asignado = evaluaciones.find(ev => ev.idUsuario == user.idUsuario)
        if (asignado) {
            return {
                idUsuario: user.idUsuario,
                nombre: user.nombre,
                empresa: user.empresa,
                idEmpresa: user.idEmpresa,
                evaluacion: asignado?.Evaluacion,
                autoevaluacion: asignado?.Autoevaluacion
            }
        } else {
            return {
                idUsuario: user.idUsuario,
                nombre: user.nombre,
                empresa: user.empresa,
                idEmpresa: user.idEmpresa,
                evaluacion: false,
                autoevaluacion: false
            }
        }
    })
}

export const filtrarSedes = (empresas, idEmpresa) => {
    const filtrados = empresas?.Sedes?.filter(sede => sede.idEmpresa == idEmpresa) || []
    if(!filtrados){
        return []
    }
    return filtrados.sort((a, b) => a.nombre.localeCompare(b.nombre))
}