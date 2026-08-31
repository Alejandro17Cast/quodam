# Quodam

Quodam es una aplicación web interactiva de lectura orientada a estudiantes de segundo grado de primaria. Su propósito es ofrecer una experiencia de lectura breve, clara y visualmente atractiva mediante textos cortos, animaciones y elementos interactivos.

La aplicación presenta las lecturas a través de una experiencia inspirada en un libro digital, permitiendo descubrir contenidos de manera dinámica antes de acceder al lector principal.

---

## Descripción

Quodam busca transformar la lectura tradicional en una experiencia digital más atractiva para niños en etapa inicial de desarrollo lector.

En lugar de presentar únicamente una lista de textos, la aplicación utiliza una interfaz visual basada en la exploración y el descubrimiento. El usuario puede seleccionar una lectura, visualizar una animación de libro y posteriormente acceder al contenido correspondiente.

Las lecturas están diseñadas para ser breves, utilizar vocabulario sencillo y mantener una estructura adecuada para estudiantes de segundo grado.

---

## Objetivo

Desarrollar una aplicación web que fomente el interés por la lectura mediante una experiencia interactiva, accesible y adaptada a estudiantes de segundo grado.

Entre los principales objetivos del proyecto se encuentran:

* Facilitar el acceso a lecturas breves y comprensibles.
* Crear una interfaz adecuada para usuarios infantiles.
* Incorporar elementos visuales y animaciones que favorezcan la atención.
* Mantener una navegación sencilla e intuitiva.
* Promover la lectura como una actividad de exploración y aprendizaje.

---

## Características principales

* Selección dinámica de lecturas.
* Selección aleatoria evitando repeticiones consecutivas.
* Animación interactiva de un libro.
* Presentación visual de la lectura seleccionada.
* Página independiente para la visualización del contenido.
* Indicador visual de progreso durante la lectura.
* Lecturas almacenadas y administradas mediante archivos JSON.
* Interfaz diseñada para estudiantes de segundo grado.
* Arquitectura modular en JavaScript.
* Diseño adaptable a diferentes tamaños de pantalla.

---

## Público objetivo

Quodam está dirigido principalmente a estudiantes de segundo grado de educación primaria.

La interfaz considera características propias de este grupo de usuarios, entre ellas:

* Tipografía de fácil lectura.
* Distribución clara del contenido.
* Colores diferenciados.
* Elementos interactivos de tamaño adecuado.
* Textos breves.
* Navegación sencilla.
* Retroalimentación visual durante la interacción.

---

## Tecnologías utilizadas

El proyecto utiliza tecnologías web nativas:

* HTML5
* CSS3
* JavaScript
* JSON
* Git
* GitHub

La aplicación no depende actualmente de frameworks de JavaScript, lo que permite mantener una estructura ligera y facilita la comprensión de la lógica del sistema.

---

## Estructura del proyecto

```text
quodam/
│
├── assets/
│
├── css/
│   ├── components/
│   │   └── book.css
│   │
│   └── pages/
│       └── reader.css
│
├── data/
│   ├── readings-index.json
│   └── ...
│
├── js/
│   ├── modules/
│   │   ├── bookAnimation.js
│   │   ├── readingReader.js
│   │   ├── readingRenderer.js
│   │   └── readingSelector.js
│   │
│   ├── utils/
│   │   └── random.js
│   │
│   ├── config.js
│   └── main.js
│
├── index.html
├── lectura.html
└── README.md
```

La estructura puede variar a medida que continúe el desarrollo del proyecto.

---

## Funcionamiento general

El flujo principal de la aplicación es el siguiente:

```text
Página principal
      |
      v
Descubrimiento de lectura
      |
      v
Selección aleatoria
      |
      v
Animación del libro
      |
      v
Presentación de la lectura
      |
      v
Inicio de lectura
      |
      v
Página del lector
```

Cuando el usuario selecciona una lectura, la aplicación conserva su identificador y lo utiliza para abrir el lector correspondiente.

Un ejemplo de la URL utilizada es:

```text
lectura.html?id=lectura-01
```

El módulo encargado del lector obtiene este identificador desde la URL y localiza la lectura correspondiente dentro del índice de lecturas.

---

## Sistema de lecturas

Las lecturas son administradas mediante archivos JSON.

El archivo principal:

```text
data/readings-index.json
```

contiene la información necesaria para identificar y localizar las lecturas disponibles.

Cada lectura puede contener una estructura similar a la siguiente:

```json
{
  "id": "lectura-01",
  "title": "Título de la lectura",
  "category": "Aventura",
  "level": "Segundo grado",
  "estimatedReadingTime": "3 min",
  "image": "./assets/images/lectura-01.png",
  "thumbnail": "./assets/images/lectura-01-thumb.png",
  "active": true,
  "lines": []
}
```

Esta estructura permite incorporar nuevas lecturas sin modificar directamente la lógica principal de la aplicación.

---

## Módulos principales

### readingSelector.js

Gestiona la carga y selección de las lecturas.

Entre sus responsabilidades se encuentran:

* Cargar el índice de lecturas.
* Obtener las lecturas disponibles.
* Filtrar las lecturas activas.
* Seleccionar una lectura de manera aleatoria.
* Evitar seleccionar inmediatamente la misma lectura anterior.

---

### bookAnimation.js

Gestiona las animaciones relacionadas con la representación visual del libro.

Entre sus funciones se encuentran:

* Controlar la apertura del libro.
* Gestionar el cambio visual de páginas.
* Mostrar la información correspondiente a la lectura seleccionada.
* Coordinar la transición entre diferentes estados de la interfaz.

---

### readingReader.js

Gestiona la página principal del lector.

Sus principales responsabilidades son:

* Obtener el identificador de la lectura desde la URL.
* Cargar el índice de lecturas.
* Localizar la lectura solicitada.
* Gestionar posibles errores.
* Enviar la información al módulo encargado de renderizar el contenido.

---

### readingRenderer.js

Se encarga de generar los elementos visuales correspondientes a una lectura.

Puede utilizar la información almacenada en los archivos JSON para mostrar:

* Títulos.
* Párrafos.
* Preguntas.
* Indicadores de progreso.
* Elementos interactivos.
* Diferentes bloques de contenido.

---

## Ejecución del proyecto

Debido a que la aplicación utiliza `fetch()` para cargar archivos JSON, es necesario ejecutar el proyecto mediante un servidor local.

### Visual Studio Code

Puede utilizarse la extensión Live Server.

Procedimiento:

1. Abrir la carpeta del proyecto en Visual Studio Code.
2. Abrir el archivo `index.html`.
3. Ejecutar la opción `Open with Live Server`.

---

### Python

También es posible ejecutar un servidor local utilizando Python.

Desde la carpeta raíz del proyecto:

```bash
python3 -m http.server 5500
```

Posteriormente, abrir en el navegador:

```text
http://localhost:5500
```

---

## Instalación

Clonar el repositorio:

```bash
git clone <URL-DEL-REPOSITORIO>
```

Ingresar al directorio:

```bash
cd quodam
```

Ejecutar un servidor local y abrir el proyecto desde el navegador.

---

## Diseño de la interfaz

La propuesta visual de Quodam está orientada a generar una experiencia amigable para estudiantes de primaria.

El diseño se basa principalmente en los siguientes conceptos:

* Lectura.
* Exploración.
* Descubrimiento.
* Aprendizaje.
* Interacción.

La representación de un libro funciona como uno de los elementos principales de la interfaz y permite conectar la experiencia digital con un elemento tradicional asociado a la lectura.

---

## Principios de diseño

Para mantener una experiencia adecuada al público objetivo, el proyecto busca respetar los siguientes principios:

### Claridad

La información debe presentarse de manera sencilla y sin elementos innecesarios que dificulten la comprensión.

### Legibilidad

El tamaño, contraste y espaciado del texto deben facilitar la lectura para estudiantes de segundo grado.

### Consistencia

Los colores, botones, componentes y animaciones deben mantener un lenguaje visual coherente.

### Interactividad

Las acciones del usuario deben producir una respuesta visual clara.

### Simplicidad

La navegación debe requerir la menor cantidad posible de pasos para acceder a una lectura.

---

## Mejoras futuras

Entre las funcionalidades consideradas para futuras versiones se encuentran:

* Reproducción de audio para las lecturas.
* Preguntas de comprensión lectora.
* Sistema de progreso.
* Registro de lecturas completadas.
* Sistema de logros o recompensas.
* Perfiles de estudiantes.
* Panel de administración para docentes.
* Nuevas categorías de lectura.
* Mayor biblioteca de contenidos.
* Actividades interactivas relacionadas con cada lectura.
* Mejoras de accesibilidad.
* Persistencia del progreso del usuario.

---

## Estado del proyecto

Quodam se encuentra actualmente en desarrollo.

El flujo principal implementado comprende:

```text
Descubrir -> Seleccionar -> Visualizar -> Leer
```

Actualmente se continúa trabajando en mejoras relacionadas con la interfaz, la experiencia de lectura, la navegación y la organización del contenido.

---

## Autor

Proyecto desarrollado con fines educativos y de aprendizaje en desarrollo web.

---

## Licencia

Este proyecto se encuentra actualmente destinado a fines académicos y educativos.

La licencia definitiva podrá establecerse posteriormente según las condiciones de distribución y uso del proyecto.
