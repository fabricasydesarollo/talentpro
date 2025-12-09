import { useEffect, useState } from "react";
import { GrNext, GrPrevious } from "react-icons/gr";
import PropTypes from 'prop-types';
const Pagination = ({ dataFetch, setData, totalRows, clave}) => {

    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        if (!dataFetch || dataFetch.length === 0) return;

        // Calcular datos paginados solo si dataFetch cambia
        const indexOfLastData = currentPage * totalRows;
        const indexOfFirstData = indexOfLastData - totalRows;
        const paginatedData = dataFetch.slice(indexOfFirstData, indexOfLastData);

        setData(prev => {
            if (JSON.stringify(prev[clave]) !== JSON.stringify(paginatedData)) {
                return { ...prev, [clave]: paginatedData };
            }
            return prev;
        });
    }, [dataFetch, currentPage, totalRows, setData, clave]); 

    const nextPage = () => {
        if (currentPage < Math.ceil(dataFetch.length / totalRows)) {
            setCurrentPage(prev => prev + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prev => prev - 1);
        }
    };

    const totalPages = Math.ceil(dataFetch.length / totalRows)

    return (
        <div className="flex w-full justify-between items-center my-10">
            <button
                onClick={prevPage}
                className="bg-zvioleta text-white rounded-md px-6 py-2 font-bold disabled:opacity-50"
                disabled={currentPage === 1}
            >
                <GrPrevious />
            </button>

            <span>{currentPage} de {totalPages}</span>

            <button
                onClick={nextPage}
                className="bg-zvioleta text-white rounded-md px-6 py-2 font-bold disabled:opacity-50"
                disabled={currentPage >= totalPages}
            >
                <GrNext />
            </button>
        </div>
    )
}
Pagination.propTypes = {
    dataFetch: PropTypes.array.isRequired,
    setData: PropTypes.func,
    totalRows: PropTypes.number,
    clave: PropTypes.string
}

export default Pagination