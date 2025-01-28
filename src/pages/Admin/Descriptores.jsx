import axios from "axios";
import { useEffect, useState } from "react";
import { URLBASE } from "../../lib/actions";
import {
    Card,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Button,
    Select,
    MenuItem,
    Checkbox,
    FormControl,
    Chip,
    Snackbar,
    TextField,
} from "@mui/material";
import Loading from "../Loading";
import { toast } from "react-toastify";

const Descriptores = () => {
    const [nivelesCargo, setNivelesCargo] = useState([]);
    const [competenciasDisponibles, setCompetenciasDisponibles] = useState([]);
    const [descriptoresDisponibles, setDescriptoresDisponibles] = useState([]);
    const [selectedNivelCargo, setSelectedNivelCargo] = useState(null);
    const [selectedCompetencias, setSelectedCompetencias] = useState([]);
    const [selectedDescriptores, setSelectedDescriptores] = useState([]);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("");

    // Cargar los datos de las APIs
    useEffect(() => {
        const fetchData = async () => {
            try {
                const nivelCargoRes = await axios.get(`${URLBASE}/usuarios/nivelcargos`);
                setNivelesCargo(nivelCargoRes.data?.data);

                const competenciasRes = await axios.get(`${URLBASE}/competencias`);
                setCompetenciasDisponibles(competenciasRes.data?.data);

                const descriptoresRes = await axios.get(`${URLBASE}/competencias/descriptores`);
                setDescriptoresDisponibles(descriptoresRes.data?.data);
            } catch (err) {
                toast.error('Error al cargar los datos' + err)
            } finally {
                setLoading(false)
            }
        };
        fetchData();
    }, [openSnackbar]);

    const handleNivelCargoClick = (nivelCargo) => {
        setSelectedNivelCargo(nivelCargo);
        setSelectedCompetencias(nivelCargo.Competencias?.map((comp) => comp.idCompetencia) || []);
        setSelectedDescriptores(nivelCargo.Descriptores?.map((desc) => desc.idDescriptor) || []);
    };


    if (loading) {
        return (
            <Loading />
        );
    }


    const handleAssignCompetencias = async () => {
        const payload = {
            idNivelCargo: selectedNivelCargo.idNivelCargo,
            competencias: selectedCompetencias,
        };
        try {
            if (payload.competencias.length > 1) {
                const response = await axios.post(`${URLBASE}/competencias/asignarCompCargo`, payload)
                if (response.status == 201) {
                    toast.success("Competencias asignadas correctamente.")
                    setOpenSnackbar(true)
                }
            }else{
                toast.error("Debes seleccionar datos para guardar")
            }
        } catch {
            toast.error('Error al asignar competencias, intentalo nuevamente.')

        }

    };

    const handleAssignDescriptores = async () => {
        const payload = {
            idNivelCargo: selectedNivelCargo.idNivelCargo,
            descriptores: selectedDescriptores,
        };
        try {
            if (payload.descriptores.length > 1) {
                const response = await axios.post(`${URLBASE}/competencias/asignarDescCargo`, payload)
                if (response.status == 201) {
                    toast.success("Descriptores asignados correctamente.")
                    setOpenSnackbar(true)
                }
            }else{
                toast.error("Debes seleccionar datos para guardar")
            }
        } catch {
            toast.error('Error al asignar descriptores, intentalo nuevamente.')
        }
    };


    const filteredNivelesCargo = nivelesCargo.filter((nivelCargo) =>
        nivelCargo?.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCloseSnackbar = () => setOpenSnackbar(false);

    return (
        <div className="m-10">
            {/* Tabla de Niveles de Cargo */}
            <h2 className="text-2xl text-zvioleta text-center my-6 font-bold">Asociar competencias y descriptores por nivel de cargo</h2>
            <TextField
                label="Buscar Nivel de Cargo"
                variant="outlined"
                fullWidth
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                margin="normal"
            />
            <Card>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Nombre del Nivel de Cargo</TableCell>
                                <TableCell>Fecha de actualización</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredNivelesCargo?.map((nivelCargo) => (
                                <TableRow
                                    key={nivelCargo.idNivelCargo}
                                    onClick={() => handleNivelCargoClick(nivelCargo)}
                                    className="cursor-pointer hover:bg-gray-100"
                                >
                                    <TableCell>{nivelCargo.nombre}</TableCell>
                                    <TableCell>{new Date(nivelCargo.updatedAt).toLocaleDateString()}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Card>

            {/* Modal para asignar Competencias y Descriptores */}
            <Dialog open={!!selectedNivelCargo} onClose={() => setSelectedNivelCargo(null)}>
                <DialogTitle>Asignar competencias o descriptores a <span className="text-znaranja">{selectedNivelCargo?.nombre}</span></DialogTitle>
                <DialogContent>
                    {selectedNivelCargo && (
                        <div>
                            <h3>Competencias Asignadas:</h3>
                            <FormControl fullWidth className="mt-4 max-w-96 sm:max-w-full">
                                <Select
                                    multiple
                                    value={selectedCompetencias}
                                    onChange={(e) => setSelectedCompetencias(e.target.value)}
                                    renderValue={(selected) => (
                                        <div className="">
                                            {selected.map((item) => {
                                                const competencia = competenciasDisponibles.find((comp) => comp.idCompetencia === item);
                                                return competencia && (
                                                    <Chip key={item} label={competencia.nombre} />
                                                );
                                            })}
                                        </div>
                                    )}
                                    MenuProps={{
                                        PaperProps: {
                                            style: {
                                                maxWidth: '500px',  // Limitar el ancho máximo del menú
                                            },
                                        },
                                    }}
                                >
                                    {competenciasDisponibles && competenciasDisponibles.length > 0 && competenciasDisponibles.map((competencia) => (
                                        <MenuItem key={competencia.idCompetencia} value={competencia.idCompetencia} style={{ whiteSpace: 'normal' }}>
                                            <Checkbox checked={selectedCompetencias.indexOf(competencia.idCompetencia) > -1} />
                                            {competencia.nombre} - {competencia.Empresas?.map((empresa) => empresa.nombre).join(", ")}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <h3 className="mt-4">Descriptores Asignados:</h3>
                            <FormControl className="mt-4 max-w-96 sm:max-w-full">
                                <Select
                                    multiple
                                    value={selectedDescriptores}
                                    onChange={(e) => setSelectedDescriptores(e.target.value)}
                                    renderValue={(selected) => (
                                        <div className="">
                                            {selected.map((item) => {
                                                const descriptor = descriptoresDisponibles.find((desc) => desc.idDescriptor === item);
                                                return descriptor && (
                                                    <Chip key={item} label={descriptor.descripcion} />
                                                );
                                            })}
                                        </div>
                                    )}
                                    MenuProps={{
                                        PaperProps: {
                                            style: {
                                                maxWidth: '500px',  // Limitar el ancho máximo del menú
                                            },
                                        },
                                    }}
                                >
                                    {descriptoresDisponibles && descriptoresDisponibles.length > 0 && descriptoresDisponibles.map((descriptor) => (
                                        <MenuItem key={descriptor.idDescriptor} value={descriptor.idDescriptor} style={{ whiteSpace: 'normal' }}>
                                            <Checkbox checked={selectedDescriptores.indexOf(descriptor.idDescriptor) > -1} />
                                            {descriptor.descripcion}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>


                        </div>
                    )}
                </DialogContent>

                <DialogActions>
                    <Button onClick={handleAssignCompetencias} color="primary" variant="contained">
                        Asignar Competencias
                    </Button>
                    <Button onClick={handleAssignDescriptores} color="secondary" variant="contained">
                        Asignar Descriptores
                    </Button>
                    <Button onClick={() => setSelectedNivelCargo(null)} color="default">
                        Cerrar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar para mostrar mensajes de éxito o error */}
            <Snackbar
                open={openSnackbar}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
            />
        </div>
    );
};

export default Descriptores;
