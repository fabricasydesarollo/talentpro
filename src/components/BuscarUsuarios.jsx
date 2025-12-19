import axios from "axios"
import { useState } from "react"
import { URLBASE } from "../lib/actions"

const BuscarUsuarios = () => {

    const [documento, setDocumento] = useState(null)
    const [nombre, setNombre] = useState(null)
    const [usuarios, setUsuarios] = useState([])

    const buscarUsuarios = () => {
            axios.get(`${URLBASE}/usuarios/search`, {params: {documento, nombre}})
                .then(response => {
                    setUsuarios(response.data?.usuarios)
                })
                .catch(error => {
                    console.error("Error al buscar usuarios por documento:", error)
                })
    }

    const gestionarUsuario = (idUsuario) => {
        console.log("Gestionar usuario con ID:", idUsuario)
    }
    
    return (
        <div className="bg-black inset-0 overflow-auto w-full fixed h-full bg-opacity-50 flex justify-center items-center">
            <div className="bg-white rounded-md m-10 p-6 w-full max-w-6xl relative mt-10 mb-10 shadow-lg shadow-gray-400">
                <h2 className="text-3xl font-bold mb-4 text-znaranja text-center">Buscar Usuarios</h2>
                <button className="rounded-full bg-znaranja absolute top-4 right-4 text-white px-2 hover:scale-105 shadow-md shadow-znaranja">X</button>
                <form className="grid grid-cols-5 gap-4 mb-4 justify-evenly w-full">
                    <div className="col-span-2 mb-4">
                        <label className="block text-gray-700 mb-2" htmlFor="search-document">
                            Número de documento
                        </label>
                        <input
                            type="text"
                            id="search-document"
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-zvioleta focus:border-transparent focus:ring-offset-0"
                            placeholder="Ingrese número de documento"
                            onChange={(e) => setDocumento(e.target.value)}
                            value={documento}
                        />
                    </div>
                    <div className="col-span-2 mb-4">
                        <label className="block text-gray-700 mb-2" htmlFor="search-name">
                            Nombre del usuario
                        </label>
                        <input
                            type="text"
                            id="search-name"
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-zvioleta focus:border-transparent focus:ring-offset-0"
                            placeholder="Ingrese nombre del usuario"
                            onChange={(e) => setNombre(e.target.value)}
                            value={nombre}
                        />
                    </div>
                    <div className="col-span-1 mb-4 flex items-end">
                        <button
                            type="button"
                            className="bg-zvioleta text-white px-4 py-2 rounded-lg hover:bg-zvioleta/80"
                            onClick={buscarUsuarios}
                        >
                            Buscar
                        </button>
                    </div>
                </form>
                <div>
                    <table className="w-full table-auto border-collapse border border-gray-300">
                        <thead>
                            <tr>
                                <th className="border px-4 py-2">Documento</th>
                                <th className="border px-4 py-2">Nombre</th>
                                <th className="border px-4 py-2">Correo</th>
                                <th className="border px-4 py-2">Empresa</th>
                                <th className="border px-4 py-2">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                usuarios.length === 0 ? (
                                    <tr>
                                        <td className="border px-4 py-2 text-center" colSpan="4">No se encontraron usuarios.</td>
                                    </tr>
                                ) : (
                                    usuarios.map((usuario, index) => (
                                        <tr key={index}>
                                            <td className="border px-4 py-2">{usuario.idUsuario}</td>
                                            <td className="border px-4 py-2">{usuario.nombre}</td>
                                            <td className="border px-4 py-2">{usuario.Empresas?.[0]?.nombre || 'N/A'}</td>
                                            <td className="border px-4 py-2">{usuario.correo}</td>
                                            <td className="border px-4 py-2">
                                                <button 
                                                onClick={() => gestionarUsuario(usuario.idUsuario)}
                                                className="bg-zvioleta text-white px-2 py-1 rounded mr-2">Gestionar</button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default BuscarUsuarios