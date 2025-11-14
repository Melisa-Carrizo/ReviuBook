## 📚 Reviú Book - Frontend

### 📋 Descripción del Proyecto

**Reviú Book** es la interfaz de usuario (Frontend) de un sistema integral de gestión y reseña de libros. Permite a los usuarios interactuar con la API para explorar colecciones de títulos, visualizar detalles esenciales como el título, ISBN, portada, autor y editorial, y realizar reseñas y comentarios.

### ⚙️ Tecnologías y Stack del Frontend

Este proyecto de interfaz de usuario fue desarrollado utilizando las siguientes herramientas:

| Componente | Tecnología | Versión/Detalle |
| :--- | :--- | :--- |
| **Framework** | Angular | 20 (con TypeScript) |
| **Estilado** | CSS | Estilado nativo |
| **Librerías UI** | Angular Material | Componentes de interfaz profesionales |
| **Alertas** | SweetAlert | Diálogos de alerta personalizados |
| **Notificaciones** | Snackbar | Notificaciones discretas de la aplicación |
| **Entorno** | Node.js, Angular CLI | Herramientas esenciales de desarrollo |

---

### 🔑 Requisitos

Para poder utilizar y desarrollar este frontend, necesitas tener instalado:

* **Node.js y npm**
* **Angular CLI**

### 🔌 Dependencia del Backend (API)

Este frontend **requiere** que el servidor API (Backend) de Spring Boot esté corriendo para funcionar correctamente.

* **Repositorio del Backend (API):** La documentación e instrucciones para levantar el backend se encuentran en el siguiente repositorio:
    ```
    https://github.com/CiroDiPaolo/Libreria-API.git
    ```
* **Nota:** Asegúrate de que el backend esté ejecutándose en `http://localhost:8080` antes de iniciar este frontend.

---

### 🚀 Instalación y Uso del Frontend

Sigue estos pasos para obtener una copia operativa del frontend en tu máquina local.

#### 1. Pasos de Instalación

1.  **Clonar este repositorio (Frontend):**
    ```bash
    git clone [https://github.com/JFelixZuniga/Frontend-Projects](https://github.com/JFelixZuniga/Frontend-Projects)
    ```
2.  **Acceder al directorio del proyecto:**
    ```bash
    cd reviubook
    ```
3.  **Instalar las dependencias de Angular:**
    ```bash
    npm install
    ```
4.  **Ejecuta el proyecto:**
    ```bash
    ng serve
    ```
