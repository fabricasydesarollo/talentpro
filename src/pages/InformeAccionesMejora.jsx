import axios from "axios";
import { useEffect, useState } from "react";
import { URLBASE } from '../lib/actions';
import { toast } from "react-toastify";
import { Space, Table, Tag } from "antd";
import { Input } from 'antd';
const { Search } = Input;

const InformeAccionesMejora = () => {
    const [acciones, setAcciones] = useState([]);
    const [filteredData, setFilteredData] = useState([]);

    useEffect(() => {
        async function getAcciones() {
            try {
                const response = await axios.get(`${URLBASE}/informes/acciones`, { withCredentials: true });
                if (response.status === 200) {
                    // Agregar un índice único para Ant Design
                    const dataWithKeys = response.data?.reporte.map((item, index) => ({
                        ...item,
                        key: index,
                    }));
                    setAcciones(dataWithKeys);
                }
            } catch (error) {
                toast.error('Ocurrió un error al obtener los datos, inténtalo de nuevo: ' + error.message);
            }
        }

        getAcciones();
    }, []);

    const columns = [
        {
            title: 'Documento',
            dataIndex: 'idUsuario',
            key: 'idUsuario',
            filters: [...new Set(acciones.map(item => item.idUsuario))].map(documento => ({
                text: documento,
                value: documento,
            })),
            onFilter: (value, record) => record.idUsuario === value,
        },        
        {
            title: 'Nombre',
            dataIndex: 'nombre',
            key: 'nombre',
        },
        {
            title: 'Cargo',
            dataIndex: 'cargo',
            key: 'cargo',
        },
        {
            title: 'Área',
            dataIndex: 'area',
            key: 'area',
            filters: [...new Set(acciones.map(item => item.area))].map(area => ({
                text: area,
                value: area
            })),
            onFilter: (value, record) => record.area === value
        },
        {
            title: 'Empresa',
            key: 'Empresas',
            render: (_, record) => (
                record.Empresas?.map((empresa, index) => (
                    <div key={index}>
                        <p>{empresa.nombre}</p>
                    </div>
                ))
            ),
            filters: [...new Set(acciones.flatMap(item => item.Empresas.map(e => e.nombre)))].map(empresa => ({
                text: empresa,
                value: empresa,
            })),
            onFilter: (value, record) => record.Empresas.some(empresa => empresa.nombre === value),
        },
        {
            title: 'Sedes',
            key: 'Sedes',
            render: (_, record) => (
                record.Sedes?.map((empresa, index) => (
                    <div key={index}>
                        <p>{empresa.nombre}</p>
                    </div>
                ))
            ),
            filters: [...new Set(acciones.flatMap(item => item.Sedes.map(e => e.nombre)))].map(sede => ({
                text: sede,
                value: sede,
            })),
            onFilter: (value, record) => record.Sedes.some(sede => sede.nombre === value),
        },
        {
            title: 'Evaluadores',
            key: 'evaluadores',
            render: (_, record) => (
                record.evaluadores?.map((evalItem, index) => (
                    <div key={index}>
                        <p><strong>{evalItem.idUsuario}</strong></p>
                        <p><strong>{evalItem.nombre}</strong></p>
                        <p>{evalItem.cargo} - {evalItem.area}</p>
                    </div>
                ))
            ),
        },

        {
            title: 'Compromisos',
            key: 'compromisos',
            render: (_, record) => (
                record.evaluacionesComoColaborador?.flatMap(evaluacion =>
                    evaluacion.Compromisos.map((compromiso, index) => (
                        <div key={index} className="mb-2">
                            <Tag color="#A65C99">{compromiso.Competencia?.nombre}</Tag>
                            <p>{compromiso.comentario}</p>
                            <p>Estado: {compromiso.estado}</p>
                            <p>Fecha Cumplimiento: {new Date(compromiso.fechaCumplimiento).toLocaleDateString()}</p>
                        </div>
                    ))
                )
            ),
        },
    ];

    const onSearch = (value) => {
        const filtered = acciones.filter(item => 
            item.idUsuario.toString().includes(value) || item.nombre.toLowerCase().includes(value.toLowerCase()) || item.cargo.toLowerCase().includes(value.toLowerCase()) || item.area.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredData(filtered);
    };


    return (
        <div className="m-12">
            <Search
                placeholder="Buscar en la tabla"
                allowClear
                onSearch={onSearch}
                style={{
                    width: 300,
                    marginBottom: 8
                }}
            />
            <Space style={{ marginBottom: 16 }} />
            <Table
                columns={columns}
                dataSource={filteredData.length > 0 ? filteredData : acciones}
                onChange={(pagination, filters, sorter) => {
                    console.log('Table Parameters:', pagination, filters, sorter);
                }}
                className="text-zvioleta"
            />
        </div>
    );
};

export default InformeAccionesMejora;
