[README.md](https://github.com/user-attachments/files/30235915/README.md)
# 🦆 Sistema de Gestión Gastronómica y Analítica Predictiva - Restaurante "Los Patos"

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI_0.110.0-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React_19.2-61DAFB?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript_5.x-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/ML_Engine-Python_3.11+-3776AB?style=flat&logo=python)](https://www.python.org/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL_15+-4169E1?style=flat&logo=postgresql)](https://www.postgresql.org/)
[![Spring Boot](https://img.shields.io/badge/Alternative_Backend-Spring_Boot_4.0-6DB33F?style=flat&logo=springboot)](https://spring.io/)
[![License](https://img.shields.io/badge/License-Academic_/_MIT-blue.svg)](#13-licencia)

Plataforma web integral de gestión empresarial (ERP/POS) y analítica de datos predictivos diseñada específicamente para optimizar las operaciones gastronómicas del restaurante **"Los Patos"**. El sistema combina capacidades operativas de punto de venta (POS), comandero digital para cocina y control de stock, con un motor avanzado de Machine Learning y Data Warehouse para el pronóstico de demanda, pruebas de hipótesis e inteligencia de negocios.

---

## 📋 Tabla de Contenidos
1. [Título y Descripción](#-sistema-de-gestión-gastronómica-y-analítica-predictiva---restaurante-los-patos)
2. [Arquitectura del Sistema](#2-arquitectura-del-sistema)
3. [Estructura del Proyecto](#3-estructura-del-proyecto)
4. [Tecnologías Utilizadas](#4-tecnologías-utilizadas)
5. [Módulos del Sistema](#5-módulos-del-sistema)
6. [Seguridad y Control de Acceso](#6-seguridad-y-control-de-acceso)
7. [Base de Datos y Data Warehouse](#7-base-de-datos-y-data-warehouse)
8. [Documentación y Generación de Reportes](#8-documentación-y-generación-de-reportes)
9. [Guía de Desarrollo](#9-guía-de-desarrollo)
10. [Instalación y Configuración](#10-instalación-y-configuración)
11. [Metodología de Desarrollo y ML](#11-metodología-de-desarrollo-y-ml)
12. [Roles y Permisos del Sistema](#12-roles-y-permisos-del-sistema)
13. [Licencia](#13-licencia)
14. [Contribución](#14-contribución)
15. [Soporte y Contacto](#15-soporte-y-contacto)

---

## 2. 🏗️ Arquitectura del Sistema

El sistema implementa una **Arquitectura Monolítica Modular Desacoplada (SPA + REST API)** con soporte para procesamiento analítico avanzado (OLAP) e inteligencia artificial.

```mermaid
graph TD
    subgraph Cliente ["Frontend (Single Page Application)"]
        UI["React 19 + TypeScript (Vite)"]
        UI_Components["Views: Dashboard, POS Ventas, Cocina, Insumos, Predicts, Chatbot"]
        UI --> UI_Components
    end

    subgraph Backend_Python ["Backend Principal (Python / FastAPI)"]
        API_Gateway["API REST (FastAPI + Uvicorn)"]
        Auth_Module["Auth Service (Bcrypt + RBAC)"]
        CRUD_Services["Gestión Operativa (Clientes, Ventas, Insumos, Mesas)"]
        ML_Pipeline["Engine de Predicción (Pandas, Scikit-Learn, SciPy)"]
        Report_Gen["Generador de Reportes (ReportLab, Docx, OpenPyXL)"]
        Email_Svc["Servicio de Email SMTP"]
        
        API_Gateway --> Auth_Module
        API_Gateway --> CRUD_Services
        API_Gateway --> ML_Pipeline
        API_Gateway --> Report_Gen
        API_Gateway --> Email_Svc
    end

    subgraph Backend_Java ["Backend Secundario / Microservicio (Java Spring Boot)"]
        Spring_API["Spring Boot 4.0 (JPA, Validation, WebMVC, OpenPDF)"]
    end

    subgraph Almacenamiento ["Persistencia de Datos (PostgreSQL)"]
        DB_OLTP[("Base de Datos Transaccional (OLTP)\n- Usuarios, Clientes, Ventas, Insumos")]
        DB_OLAP[("Data Warehouse (OLAP - Star Schema)\n- DimCliente, DimProducto, FactVentas, FactInventario")]
    end

    UI -->|HTTP / REST JSON| API_Gateway
    UI -.->|Integración opcional| Spring_API
    CRUD_Services --> DB_OLTP
    ML_Pipeline --> DB_OLAP
    Spring_API --> DB_OLTP
```

### Componentes Clave:
- **Capa de Presentación (Frontend):** Interfaz SPA responsiva desarrollada en React 19 y TypeScript, impulsada por Vite. Incluye soporte para modo claro/oscuro y estado dinámico.
- **Capa de Negocio y ML (Backend Python):** FastAPI gestiona endpoints REST asíncronos y ejecuta la canalización de analítica descriptiva y predictiva (RandomForest, Regresión Lineal, tuning de hiperparámetros y EDA).
- **Capa de Negocio Alternativa (Backend Java):** Microservicio en Spring Boot 4.0 con Java 22 para operaciones críticas con gestión fuerte de tipos e integración con OpenPDF.
- **Capa de Datos:** PostgreSQL administrado mediante SQLAlchemy ORM (Python) y Hibernate/JPA (Java), articulado en dos esquemas: **OLTP** (operación en tiempo real) y **OLAP** (Data Warehouse multidimensional).

---

## 3. 📁 Estructura del Proyecto

```
proyecto los patos/
├── backend/                        # Backend principal en Python (FastAPI) y secundario (Spring Boot)
│   ├── build.gradle                # Configuración de dependencias Java Spring Boot
│   ├── gradlew / gradlew.bat       # Wrapper de Gradle
│   ├── main.py                     # API Principal FastAPI, endpoints REST y enrutamiento
│   ├── auth.py                     # Lógica de autenticación, hash de contraseñas (Bcrypt)
│   ├── database.py                 # Conexión SQLAlchemy a PostgreSQL y pool de conexiones
│   ├── models.py                   # Modelos ORM (Tablas OLTP y Data Warehouse OLAP)
│   ├── schemas.py                  # Esquemas de validación Pydantic DTOs
│   ├── email_service.py            # Notificaciones por correo electrónico y envío de comprobantes
│   ├── predicts_pipeline.py        # Pipeline de ML: EDA, Model Training, Cross-Validation, Reportes
│   ├── requirements.txt            # Dependencias Python
│   ├── static/                     # Archivos estáticos y gráficos generados por el pipeline predictivo
│   └── src/                        # Código fuente del backend Java Spring Boot
│       └── main/java/com/los_patos/restaurant/
│           ├── RestaurantApplication.java
│           ├── config/             # Configuración de Seguridad y CORS
│           ├── controller/         # Controladores REST Spring Boot
│           ├── model/              # Entidades JPA (Insumo, Producto, Venta, etc.)
│           ├── repository/         # Repositorios Spring Data JPA
│           └── service/            # Servicios de lógica de negocio
├── frontend/                       # Aplicación SPA Frontend en React + TypeScript
│   ├── package.json                # Dependencias npm
│   ├── vite.config.ts              # Configuración del bundler Vite
│   ├── tsconfig.json               # Configuración TypeScript
│   ├── index.html                  # HTML5 base
│   └── src/
│       ├── App.tsx                 # Enrutador dinámico, Route Guards y layout global
│       ├── api.ts                  # Cliente HTTP, definición de interfaces DTO y llamadas al backend
│       ├── index.css               # Sistema de diseño global, variables CSS y Dark Mode
│       ├── components/             # Componentes reutilizables (Sidebar, Chatbox, Modal, etc.)
│       └── views/                  # Vistas principales del sistema
│           ├── Dashboard.tsx       # KPI ejecutivos y panel general
│           ├── Ventas.tsx          # POS - Punto de Venta e impresión de tickets
│           ├── Cocina.tsx          # Monitor KDS de preparación de pedidos
│           ├── Mesas.tsx           # Control visual de salón y reservas
│           ├── Clientes.tsx        # CRM de clientes y preferencias
│           ├── Catalogo.tsx        # ABM de productos y recetas de insumos
│           ├── Insumos.tsx         # Gestión de inventario y compras de insumos
│           ├── Analitica.tsx       # Business Intelligence y gráficos de DW
│           ├── Historial.tsx       # Historial transaccional de ventas
│           ├── Predicts.tsx        # Módulo de proyecciones ML y reportes ejecutivos
│           ├── Login.tsx           # Inicio de sesión
│           └── Register.tsx        # Registro de usuarios
├── crear_admin.py                  # Script de inicialización de usuarios administradores
└── sent_emails/                    # Almacenamiento local de auditoría de correos enviados
```

---

## 4. 🛠️ Tecnologías Utilizadas

### Frontend
- **Framework:** React 19.2
- **Lenguaje:** TypeScript 5.x / 6.x
- **Build Tool:** Vite 8.0
- **Iconografía:** Lucide React
- **Estilos:** Vanilla CSS con variables CSS personalizadas, Flexbox/Grid responsivo y soporte para Tema Oscuro/Claro nativo.

### Backend Principal (Python)
- **Framework Web:** FastAPI 0.110.0 + Uvicorn
- **ORM & DB:** SQLAlchemy 2.0+ & `psycopg2-binary`
- **Autenticación:** PyBCrypt / Bcrypt
- **Validación de Datos:** Pydantic v2
- **Data Science & ML:** Pandas, NumPy, Scikit-Learn 1.4+, SciPy 1.12+, Joblib
- **Visualización:** Matplotlib, Seaborn
- **Generación de Documentos:** ReportLab (PDF), `python-docx` (Word), `openpyxl` (Excel)

### Backend Secundario (Java)
- **Framework:** Spring Boot 4.0.6 (Java 22)
- **Persistencia:** Spring Data JPA / Hibernate
- **Seguridad:** Spring Security Crypto 6.3
- **PDF Generation:** OpenPDF 1.3.30
- **Utilidades:** Project Lombok

### Base de Datos & Data Warehouse
- **Motor:** PostgreSQL 15+
- **Modelos:** OLTP (Transaccional) y OLAP (Esquema en Estrella: Tablas de Hechos y Dimensiones)

---

## 5. 🧩 Módulos del Sistema

| Módulo | Descripción | Funcionalidades Principales | Restricción por Rol |
| :--- | :--- | :--- | :---: |
| **📊 Dashboard** | Vista ejecutiva de la operación diaria. | KPIs en tiempo real, resumen de ventas del día, accesos rápidos y estado del restaurante. | Todos |
| **🛒 Ventas (POS)** | Terminal de Punto de Venta interactivo. | Selección de mesa, catálogo de platos por categoría, descuentos, propina, cálculo de impuestos, emisión de comprobantes digitales y envío por email. | Todos |
| **🍳 Cocina (KDS)** | Kitchen Display System para el área de cocina. | Control de pedidos en tiempo real con estados (`pendiente`, `en preparación`, `completado`), cronómetro visual y actualización dinámica. | Todos |
| **🍽️ Mesas & Reservas** | Gestión de salón y reservas de comensales. | Distribución de mesas por ubicación (Salón principal, Terraza, VIP), estados (`libre`, `ocupada`, `reservada`) y agenda de reservas. | Todos |
| **👥 Clientes** | CRM básico de fidelización de clientes. | Registro de clientes, preferencias gastronómicas, métodos de pago habituales y segmentos de consumo. | Todos |
| **📦 Catálogo** | Gestión de productos y estructura de menú. | ABM de productos, asignación de precios, costo de producción, tiempo estimado de preparación y asociación con insumos. | **Administrador** |
| **🥩 Insumos** | Control de almacén e inventario de materias primas. | Control de stock actual, stock mínimo de reabastecimiento, costeo unitario, proveedores asociados y registro de compras. | **Administrador** |
| **📈 Analítica (BI)** | Tablero de Inteligencia de Negocios. | Consultas sobre el Data Warehouse (Hechos y Dimensiones), ventas por empleado, productos más vendidos, mermas y tendencias. | **Administrador** |
| **📜 Historial** | Registro auditado de transacciones. | Búsqueda avanzada de ventas pasadas, desglose por ticket, cliente y mesa. | **Administrador** |
| **🤖 Predicts (ML)** | Canalización de Machine Learning y Forecasting. | Predicción de demanda de productos/insumos, EDA interactivo, pruebas de hipótesis (ANOVA/t-student) y descarga de informes en PDF/DOCX/XLSX. | **Administrador** |
| **💬 Chatbot IA** | Asistente virtual contextual. | Asistente flotante interactivo para responder consultas operativas y analíticas sobre el restaurante. | Todos |

---

## 6. 🔒 Seguridad y Control de Acceso

1. **Autenticación:** 
   - Encriptación de contraseñas mediante **Bcrypt** con costo de hashing adaptativo.
   - Validación estricta de credenciales en inicio de sesión con manejo de estados activos de usuario.
2. **Control de Acceso Basado en Roles (RBAC):**
   - El sistema clasifica a los usuarios en dos roles primarios: `administrador` y `empleado`.
   - **Route Guards en Frontend:** Redirección automática si un usuario sin privilegios intenta acceder a módulos restringidos (`catalogo`, `insumos`, `analitica`, `historial`, `predicts`).
3. **Protección contra Inyecciones:**
   - Uso obligatorio de **SQLAlchemy ORM** y **Spring Data JPA** con parámetros preparados para evitar vulnerabilidades de Inyección SQL.
4. **Sanitización de Datos y CORS:**
   - Middleware de CORS configurado con orígenes y cabeceras permitidas.
   - Esquemas Pydantic que realizan tipado estricto y sanitización de todas las entradas JSON.

---

## 7. 🗄️ Base de Datos y Data Warehouse

El sistema opera sobre una base de datos **PostgreSQL** organizada en dos modelos lógicos:

### Modelo OLTP (Transaccional)
Diseñado en 3ra Forma Normal (3FN) para la operación rápida de lecturas y escrituras en tiempo real:
- `usuarios`: Credenciales, roles (`administrador`/`empleado`) y estado.
- `empleados`, `clientes`, `proveedores`: Entidades principales del negocio.
- `productos`, `insumos`, `producto_insumo`: Recetas y composición de platos.
- `mesas`, `reservas`: Gestión de salón.
- `ventas_encabezado`, `ventas_detalle`: Transacciones POS y comandero.
- `movimientos_inventario`: Entradas, salidas y mermas.

### Modelo OLAP / Data Warehouse (Esquema en Estrella - Star Schema)
Optimizado para consultas analíticas pesadas y alimentación de modelos de Inteligencia Artificial:

```
                  +------------------+
                  |    DimTiempo     |
                  +------------------+
                           |
                           | 1:N
                           v
+------------------+     +--------------------+     +------------------+
|    DimCliente    |---->|     FactVentas     |<----|   DimProducto    |
+------------------+ 1:N +--------------------+ 1:N +------------------+
                           ^                ^
                       1:N |            1:N |
+------------------+       |                |       +------------------+
|   DimEmpleado    |-------+                +-------|     DimMesa      |
+------------------+                                +------------------+
```

- **Tablas Dimensionales:** `DimCliente`, `DimEmpleado`, `DimMesa`, `DimProducto`, `DimProveedor`, `DimTiempo`.
- **Tablas de Hechos:** `FactVenta`, `FactInventario`, `FactReserva`.

---

## 8. 📄 Documentación y Generación de Reportes

### Documentación de API
- **Swagger UI:** Accesible interactivamente en `http://localhost:8000/docs` cuando el servidor FastAPI está ejecutándose.
- **ReDoc:** Disponible en `http://localhost:8000/redoc`.

### Motor de Reportes Ejecutivos Automáticos
El módulo predictivo incluye una suite de generación documental automatizada:
- **PDF Report (`ReportLab`):** Documento ejecutivo formateado con gráficos estáticos de predicción de demanda, tablas de resumen y análisis estadístico.
- **Word Report (`python-docx`):** Reporte editable institucional estructurado por secciones (Introducción, Metodología, Hallazgos, Predicciones y Recomendaciones).
- **Excel Spreadsheet (`openpyxl`):** Libro contable y analítico con hojas dedicadas para la matriz de datos, resultados del modelo predictivo y métricas de error (RMSE, MAE, R²).

---

## 9. 💻 Guía de Desarrollo

### Estilo de Código y Buenas Prácticas
- **Python:** Cumplimiento con estándares **PEP 8**. Uso de Type Hints en funciones y Pydantic para DTOs.
- **TypeScript / React:** Componentes funcionales con Hooks, tipado estricto de Props e Interfaces en `api.ts`. Formateo verificado mediante ESLint.
- **Base de Datos:** Migraciones explícitas mediante `Base.metadata.create_all` y transacciones seguras con bloques `try/except/finally` en las sesiones de SQLAlchemy.

### Comandos de Utilidad durante el Desarrollo
- **Linter de Frontend:**
  ```bash
  cd frontend
  npm run lint
  ```
- **Creación de Usuario Administrador Inicial:**
  ```bash
  python crear_admin.py
  ```

---

## 10. ⚙️ Instalación y Configuración

### Requisitos Previos
- **Node.js** v18.0 o superior & **npm**
- **Python** 3.11 o superior
- **PostgreSQL** 15 o superior
- *(Opcional)* **JDK 22** & Gradle (Solo si desea ejecutar el backend secundario Java Spring Boot)

---

### Paso 1: Clonar el Repositorio
```bash
git clone https://github.com/RGiancarloc/sistema-los-patos.git
cd "proyecto los patos"
```

---

### Paso 2: Configuración de Base de Datos PostgreSQL
1. Cree la base de datos en su servidor local de PostgreSQL:
   ```sql
   CREATE DATABASE los_patos;
   ```
2. Verifique la cadena de conexión en `backend/database.py` (o configure la variable de entorno correspondiente):
   ```python
   SQLALCHEMY_DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/los_patos"
   ```

---

### Paso 3: Configurar e Instalar Backend (Python FastAPI)
1. Ingrese a la carpeta backend y cree un entorno virtual:
   ```bash
   python -m venv .venv
   ```
2. Active el entorno virtual:
   - **Windows:** `.venv\Scripts\activate`
   - **Linux/macOS:** `source .venv/bin/activate`
3. Instale las dependencias:
   ```bash
   pip install -r backend/requirements.txt
   ```
4. Inicialice los usuarios administradores por defecto (`admin` / `admin123` y `empleado` / `emp123`):
   ```bash
   python crear_admin.py
   ```
5. Inicie el servidor backend en modo desarrollo:
   ```bash
   uvicorn backend.main:app --reload --port 8000
   ```
   El backend estará disponible en `http://localhost:8000`.

---

### Paso 4: Configurar e Instalar Frontend (React + Vite)
1. En una nueva terminal, navegue a la carpeta del frontend:
   ```bash
   cd frontend
   ```
2. Instale los paquetes de npm:
   ```bash
   npm install
   ```
3. Ejecute el servidor de desarrollo de Vite:
   ```bash
   npm run dev
   ```
   El frontend estará accesible en `http://localhost:5173`.

---

### *(Opcional)* Paso 5: Ejecución Backend Java Spring Boot
Si requiere ejecutar el microservicio Java:
```bash
cd backend
./gradlew bootRun
```

---

## 11. 📐 Metodología de Desarrollo y ML

### Metodología de Desarrollo de Software: Agile / Scrum
El desarrollo de la plataforma se estructuró bajo la metodología ágil **Scrum**, iterando en sprints de 2 semanas con entregables incrementales:
1. **Sprint 1:** Modelado de Base de Datos OLTP/OLAP e infraestructura FastAPI/React.
2. **Sprint 2:** Implementación del POS (Ventas), Comandero de Cocina y Control de Mesas.
3. **Sprint 3:** Módulos de Gestión de Insumos, Catálogo y Clientes.
4. **Sprint 4:** Desarrollo del Pipeline de ML, Forecasting, DW Star Schema y Motor de Reportes.

### Metodología de Ciencia de Datos: CRISP-DM
Para el diseño del módulo predictivo (`predicts_pipeline.py`), se aplicó la metodología estándar **CRISP-DM** (*Cross-Industry Standard Process for Data Mining*):

```mermaid
flowchart LR
    A["1. Business\nUnderstanding"] --> B["2. Data\nUnderstanding"]
    B --> C["3. Data\nPreparation"]
    C --> D["4. Modeling"]
    D --> E["5. Evaluation"]
    E --> F["6. Deployment"]
    E -.-> C
```

1. **Comprensión del Negocio:** Identificar la variabilidad en la demanda de platillos e insumos en el restaurante para reducir mermas y optimizar compras.
2. **Comprensión de Datos:** Análisis exploratorio (EDA), evaluación de distribuciones, estacionalidad y correlaciones entre variables meteorológicas/días festivos y ventas.
3. **Preparación de Datos:** Limpieza de datos, imputación de faltantes, codificación One-Hot y escalado estándar de características (*StandardScaler*).
4. **Modelado:** Entrenamiento y comparativa de algoritmos (*Random Forest Regressor*, *Ridge Regression*, *Linear Regression*).
5. **Evaluación:** Validaciones cruzadas (*k-fold cross validation*), ajuste de hiperparámetros (*GridSearchCV*) y evaluación de métricas de precisión (RMSE, MAE, R²).
6. **Despliegue:** Integración fluida en la API FastAPI para consulta dinámica desde la interfaz React y generación de reportes en PDF, Word y Excel.

---

## 12. 👥 Roles y Permisos del Sistema

El sistema implementa una matriz estricta de **Control de Acceso Basado en Roles (RBAC)**:

| Módulo / Funcionalidad | 👑 Administrador | 👨‍🍳 / 💁‍♂️ Empleado |
| :--- | :---: | :---: |
| Inicio de Sesión y Autenticación | **Sí** | **Sí** |
| Visualizar Dashboard & KPIs | **Sí** | **Sí** |
| Registrar Ventas en POS | **Sí** | **Sí** |
| Monitor de Cocina (KDS) | **Sí** | **Sí** |
| Consultar y Ocupar Mesas / Reservas | **Sí** | **Sí** |
| Registrar y Consultar Clientes | **Sí** | **Sí** |
| Chatbot de Asistencia con IA | **Sí** | **Sí** |
| Crear / Editar Productos y Precios | **Sí** | ❌ *(Bloqueado)* |
| Gestionar Stock de Insumos y Compras | **Sí** | ❌ *(Bloqueado)* |
| Acceso a Tableros Analíticos BI (Data Warehouse) | **Sí** | ❌ *(Bloqueado)* |
| Consultar Historial de Ventas Auditado | **Sí** | ❌ *(Bloqueado)* |
| Ejecutar Predicciones ML y Descargar Reportes | **Sí** | ❌ *(Bloqueado)* |

---

## 13. 📄 Licencia

Este proyecto ha sido desarrollado como parte del proyecto de grado / tesis universitaria **"TESIS I - Sistema de Gestión Gastronómica y Analítica Predictiva para el Restaurante Los Patos"**.

Todos los derechos reservados © 2026. Licenciado bajo la **Licencia MIT** (o términos académicos de la institución educativa correspondiente). Consulte el archivo `LICENSE` para mayores detalles.

---

## 14. 🤝 Contribución

¡Las contribuciones y sugerencias son bienvenidas! Para colaborar en este proyecto, por favor siga estos pasos:

1. Realice un **Fork** del repositorio.
2. Cree una rama para su nueva característica o corrección de error:
   ```bash
   git checkout -b feature/nueva-funcionalidad
   ```
3. Realice sus cambios y asegúrese de formatear el código según las normas del proyecto (PEP8 / ESLint).
4. Confirme sus cambios con mensajes descriptivos:
   ```bash
   git commit -m "feat: agrega soporte para código QR en comprobantes POS"
   ```
5. Envíe sus cambios a su repositorio remoto:
   ```bash
   git push origin feature/nueva-funcionalidad
   ```
6. Abra un **Pull Request** detallando las modificaciones realizadas.

---

## 📞 15. Soporte y Contacto

Si tiene alguna pregunta, encuentra un error o desea solicitar asistencia técnica sobre la instalación o ejecución del sistema, comuníquese con el equipo de desarrollo:

- **Proyecto:** Sistema de Gestión y Analítica Predictiva - Restaurante Los Patos
- **Repositorio:** [RGiancarloc/sistema-los-patos](https://github.com/RGiancarloc/sistema-los-patos)
- **Email de Contacto:** `soporte@lospatos-restaurant.com` / `admin@lospatos.com`
- **Ubicación:** Universidad - Proyecto Tesis I
