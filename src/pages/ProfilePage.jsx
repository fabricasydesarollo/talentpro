import { useState } from "react"
import DetallesEvaluación from "../components/DetallesEvaluación"
import { useUser } from "../context/UserContext"

const ProfilePage = () => {
    const { user } = useUser()
    const [openModal, setOpenModal] = useState(false)
    const [empresa] = Object.values(user.Empresas)
    return (
        <div className="grid md:grid-cols-8 w-full min-h-screen p-4 gap-2">
            <div className="md:col-span-2 col-span-1 border rounded-md h-full bg-gray-50 shadow-lg flex flex-col justify-between items-center">
                <div className="bg-white p-6 w-full max-w-md text-center space-y-4 mt-1">
                    <div className="flex justify-center">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-znaranja to-zvioleta flex items-center justify-center text-white text-3xl font-bold shadow-md">
                            {user?.nombre?.charAt(0)}
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-600 uppercase">{user?.nombre}</h2>
                    <p className="text-zvioleta font-medium">{user?.cargo}</p>
                    <p className="text-gray-600 font-medium">{empresa?.nombre}</p>
                    <div className="bg-gray-50 rounded-lg p-4 text-sm shadow-inner space-y-2">
                        <p>
                            <span className="font-semibold text-gray-600">Documento:</span>{" "}
                            {user?.idUsuario}
                        </p>
                        <p>
                            <span className="font-semibold text-gray-600">Fecha de Ingreso:</span>{" "}
                            {user?.fechaIngreso.split("T")[0]}
                        </p>
                    </div>
                </div>
                <p className="border-l-4 border-znaranja text-znaranja p-2 rounded-md">
                    <strong>Nota:</strong> Si cuentas con datos incorrectos, contacta con el administrador.
                </p>
            </div>
            <div className="md:col-span-6 border rounded-md h-full bg-gray-50 shadow-lg">
                <DetallesEvaluación setOpenModal={setOpenModal} idUsuario={user?.idUsuario} colaborador={false} />
            </div>

        </div>
    )
}

export default ProfilePage