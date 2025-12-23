# 🎯 EVALUACIONES TALENT PRO

Sistema integral de evaluaciones de desempeño para el desarrollo del talento organizacional.

## 📋 Descripción

**Evaluaciones Talent Pro** es una aplicación web moderna desarrollada en React que permite gestionar evaluaciones de desempeño de manera integral. El sistema facilita la evaluación 360°, autoevaluaciones, seguimiento de competencias y generación de informes detallados para el desarrollo profesional de los colaboradores.

## ✨ Características Principales

### 🔐 **Sistema de Autenticación**
- Login seguro con validación de credenciales
- Gestión de perfiles de usuario (Colaborador, Evaluador, Administrador)
- Cambio obligatorio de contraseña predeterminada
- Protección de rutas según perfiles de usuario

### 📊 **Evaluaciones**
- **Autoevaluación**: Reflexión personal sobre desempeño y competencias
- **Evaluación por Jefe**: Retroalimentación objetiva del supervisor directo
- **Escala de calificación**: Sistema de 1-5 puntos con criterios claros
- **Seguimiento de progreso**: Monitoreo del avance de evaluaciones

### 📈 **Dashboard e Informes**
- **Dashboard personalizado** según el perfil del usuario
- **Gráficas interactivas** de avance y cumplimiento
- **Informes detallados** por colaborador, equipo y empresa
- **Exportación a Excel** con formato profesional
- **Generación de PDFs** para reportes ejecutivos

### 👥 **Gestión Administrativa**
- **Gestión de usuarios** y asignación de roles
- **Administración de empresas** y sedes
- **Configuración de evaluaciones** y períodos
- **Gestión de descriptores** y competencias

### 📋 **Informes y Reportes**
- **Centro de reportes** centralizado
- **Informes de resultados** individuales y grupales
- **Planes de acción** y seguimiento de mejoras
- **Análisis de avances** por competencias

## 🛠️ Tecnologías Utilizadas

### **Frontend**
- **React 18.3.1** - Biblioteca principal
- **Vite** - Herramienta de construcción y desarrollo
- **React Router DOM** - Navegación y rutas
- **Tailwind CSS** - Framework de estilos
- **React Icons** - Iconografía

### **Componentes y UI**
- **Material-UI** - Componentes de interfaz
- **Ant Design** - Componentes adicionales
- **React Modal** - Modales y diálogos
- **Sonner** - Sistema de notificaciones toast

### **Manejo de Datos**
- **Axios** - Cliente HTTP para API
- **React Hook Form** - Gestión de formularios
- **Context API** - Gestión de estado global

### **Visualización y Reportes**
- **Recharts** - Gráficas y visualizaciones
- **ExcelJS** - Generación de archivos Excel
- **Material React Table** - Tablas avanzadas

### **Desarrollo**
- **ESLint** - Linting y calidad de código
- **PostCSS** - Procesamiento de CSS
- **Autoprefixer** - Compatibilidad de CSS

## 🚀 Instalación y Configuración

### **Prerrequisitos**
- Node.js (versión 16 o superior)
- npm o yarn
- Servidor backend configurado

### **Instalación**

1. **Clonar el repositorio**
```bash
git clone [URL_DEL_REPOSITORIO]
cd evaluaciones-talent-pro
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
# Crear archivo .env en la raíz del proyecto
VITE_API_URL=http://localhost:3000/api
```

4. **Ejecutar en modo desarrollo**
```bash
npm run dev
```

5. **Construir para producción**
```bash
npm run build
```

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── DataTable.jsx   # Tabla de datos con exportación
│   ├── Layout.jsx      # Layout principal
│   ├── Modal.jsx       # Componente modal
│   └── ...
├── pages/              # Páginas principales
│   ├── Admin/          # Páginas de administración
│   ├── Home.jsx        # Página de inicio
│   ├── Login.jsx       # Página de login
│   ├── Evaluacion.jsx  # Página de evaluación
│   └── ...
├── context/            # Contextos de React
│   └── UserContext.jsx # Contexto de usuario
├── hooks/              # Hooks personalizados
├── lib/                # Utilidades y configuraciones
│   └── actions.js      # Configuración de API
└── assets/             # Recursos estáticos
```

## 🎨 Diseño y Estilos

### **Colores Institucionales**
- **Violeta Principal**: `#80006A` (zvioleta)
- **Naranja Acento**: `#FF5F3F` (znaranja)  
- **Violeta Opaco**: `#A65C99` (zvioletaopaco)

### **Principios de Diseño**
- **Diseño limpio y profesional**
- **Interfaz intuitiva y accesible**
- **Responsive design** para todos los dispositivos
- **Consistencia visual** en todos los componentes

## 👤 Perfiles de Usuario

### **1. Colaborador (Perfil 1)**
- Realizar autoevaluaciones
- Ver resultados personales
- Acceder a dashboard personal
- Consultar su perfil

### **2. Evaluador (Perfil 2)**
- Evaluar a su equipo
- Ver informes de su equipo
- Acceder a gráficas de avance
- Generar reportes grupales

### **3. Administrador (Perfil 3)**
- Gestión completa del sistema
- Administrar usuarios y empresas
- Configurar evaluaciones
- Acceso a todos los informes

## 🔧 Funcionalidades Clave

### **Sistema de Evaluaciones**
- Evaluaciones por competencias
- Escala de calificación 1-5
- Comentarios y observaciones
- Seguimiento de progreso

### **Generación de Reportes**
- Exportación a Excel con formato profesional
- Generación de PDFs ejecutivos
- Gráficas interactivas
- Filtros avanzados

### **Gestión de Datos**
- Tablas con paginación y búsqueda
- Selección múltiple de registros
- Validaciones en tiempo real
- Estados de carga optimizados

## 🚦 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Servidor de desarrollo

# Construcción
npm run build        # Construir para producción
npm run preview      # Vista previa de producción

# Calidad de código
npm run lint         # Ejecutar ESLint
```

## 🔒 Seguridad

- **Autenticación basada en tokens**
- **Protección de rutas** según perfiles
- **Validación de formularios**
- **Sanitización de datos**
- **Encriptación de contraseñas**

## 📱 Responsive Design

La aplicación está optimizada para:
- **Desktop** (1024px+)
- **Tablet** (768px - 1023px)
- **Mobile** (320px - 767px)

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para la funcionalidad (`git checkout -b feature/nueva-funcionalidad`)
3. Commit los cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto es privado y confidencial. Todos los derechos reservados.

## 📞 Soporte

Para soporte técnico o consultas sobre el sistema, contactar al equipo de desarrollo.

---

**Desarrollado con ❤️ para el crecimiento y desarrollo del talento organizacional**