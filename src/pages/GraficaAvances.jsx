import { Bar, BarChart, CartesianGrid, Cell, Line, Label, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import PropTypes from 'prop-types';

export const BarChartAdvance = ({ data, nombre, setOpenModal, setEmpresa }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold text-gray-900 text-center">
          Avance por {nombre}
        </h3>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              onClick={(data) => {
                setEmpresa(data.activePayload[0].payload);
                setOpenModal(true);
              }}
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 150 }}
              stackOffset='sign'
            >
              <XAxis 
                dataKey="nombre" 
                angle={-20} 
                textAnchor="end" 
                fontSize={12}
                tick={{ fill: '#6B7280' }}
              />
              <YAxis 
                fontSize={12}
                tick={{ fill: '#6B7280' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar dataKey="Usuarios" fill="#80006A" stackId="a" radius={[0, 0, 4, 4]} />
              <Bar dataKey="Evaluacion" fill="#FFB5A6" stackId="a" />
              <Bar dataKey="Autoevaluacion" fill="#D7D7D7" stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

BarChartAdvance.propTypes = {
  data: PropTypes.array.isRequired,
  nombre: PropTypes.string.isRequired,
  setOpenModal: PropTypes.func.isRequired,
  setEmpresa: PropTypes.func.isRequired,
};

export const BarChartPromedio = ({ data, nombre, index }) => {
  const colors = ["#A65C99", "#FFB5A6"];
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold text-gray-900 text-center">{nombre}</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              stackOffset='stacked'
            >
              <XAxis 
                dataKey="nombre" 
                height={100} 
                fontSize={12} 
                tick={{ fill: '#6B7280' }}
                tickFormatter={(value) => {
                  return value.split(" ").join("\n");
                }} 
              />
              <YAxis 
                domain={[0, 5]} 
                fontSize={12}
                tick={{ fill: '#6B7280' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar 
                key={index} 
                dataKey="promedio" 
                fill={colors[index % colors.length]}
                stackId="a" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

BarChartPromedio.propTypes = {
  data: PropTypes.array.isRequired,
  nombre: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
};

export const PieChartCumplimiento = ({ nombre, data }) => {
  const COLORS = ['#FFB5A6', "#80006A"];

  const Respuestas = data?.map(item => item.value)[0];
  const Usuarios = data?.map(item => item.Usuarios)?.filter(item => item != undefined && item != null).join(',');
  const porcentaje = (Respuestas * 100) / Usuarios;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold text-gray-900 text-center">{nombre}</h3>
        
        {data?.length > 0 && (
          <div className="text-center space-y-1 mb-4">
            <p className="text-sm text-gray-600">Población total: <span className="font-medium text-gray-900">{Usuarios}</span></p>
            <p className="text-sm text-gray-600">Evaluados: <span className="font-medium text-gray-900">{Respuestas}</span></p>
          </div>
        )}
        
        <div className="h-80 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie 
                data={data} 
                dataKey='value' 
                label 
                innerRadius="60%" 
                outerRadius="80%" 
                cx="50%" 
                cy="50%"
              >
                {data?.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
                <Label
                  value={`${porcentaje.toFixed(1)}%`}
                  position="center"
                  fontSize="20"
                  fontWeight="bold"
                  fill="#80006A"
                />
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

PieChartCumplimiento.propTypes = {
  data: PropTypes.array.isRequired,
  nombre: PropTypes.string.isRequired,
};

export const LineChartPromedio = ({ nombre, data }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold text-gray-900 text-center">{nombre}</h3>
        <div className="h-80">
          <ResponsiveContainer width='100%' height="100%">
            <LineChart 
              data={data} 
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="valor" 
                fontSize={12}
                tick={{ fill: '#6B7280' }}
              />
              <YAxis 
                fontSize={12}
                tick={{ fill: '#6B7280' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="promedio" 
                stroke="#80006A" 
                strokeWidth={3}
                dot={{ fill: "#80006A", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "#80006A", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

LineChartPromedio.propTypes = {
  data: PropTypes.array,
  nombre: PropTypes.string.isRequired,
};