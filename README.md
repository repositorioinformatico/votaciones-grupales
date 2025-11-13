# Sistema de Encuestas para Profesor y Alumnos

Sistema web de encuestas en tiempo real sin base de datos, diseñado para que un profesor pueda crear encuestas y los alumnos puedan votar a través de la red LAN.

## Características

- **Sin base de datos**: Utiliza archivos JSON para persistencia de datos
- **Tiempo real**: Los resultados se actualizan automáticamente
- **Red LAN**: Accesible desde cualquier dispositivo conectado a la misma red
- **Interfaz dual**: Panel de control para el profesor y vista de votación para alumnos
- **Autenticación segura**: Sistema de contraseña maestra para acceso del profesor
- **Exportación de datos**: Descarga resultados en formato CSV con estadísticas detalladas
- **Control manual de votos**: El profesor define el número máximo de votos por encuesta
- **Validaciones de seguridad**: Protección contra manipulación de datos y ataques XSS
- **Fácil de usar**: Configuración simple en Windows

## Tecnologías Utilizadas

- **Backend**: Node.js + Express
- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **Persistencia**: Archivos JSON (sin base de datos)
- **Comunicación**: API REST

## Estructura del Proyecto

```
test-claude-code-web/
├── server.js           # Servidor Express
├── package.json        # Dependencias
├── data/               # Carpeta de persistencia
│   ├── surveys.json    # Encuestas almacenadas
│   └── votes.json      # Votos almacenados
└── public/             # Archivos estáticos
    ├── profesor.html   # Interfaz del profesor
    ├── alumno.html     # Interfaz de los alumnos
    └── styles.css      # Estilos
```

## Instalación en Windows

### 1. Instalar Node.js

1. Descarga Node.js desde: https://nodejs.org/
2. Instala la versión LTS (Long Term Support)
3. Verifica la instalación abriendo CMD y ejecutando:
   ```
   node --version
   npm --version
   ```

### 2. Instalar las dependencias

1. Abre CMD o PowerShell
2. Navega a la carpeta del proyecto:
   ```
   cd ruta\a\test-claude-code-web
   ```
3. Instala las dependencias:
   ```
   npm install
   ```

## Uso

### Iniciar el servidor

1. Abre CMD o PowerShell en la carpeta del proyecto
2. Ejecuta:
   ```
   npm start
   ```
3. Verás un mensaje como:
   ```
   ===========================================
   ✓ Servidor de encuestas iniciado
   ✓ Puerto: 3000
   ✓ Acceso local: http://localhost:3000
   ✓ Acceso LAN: http://[IP-de-este-PC]:3000
   ===========================================
   📊 Profesor: http://localhost:3000/profesor.html
   🎓 Alumnos: http://localhost:3000/alumno.html
   ===========================================

   📡 Direcciones IP disponibles:
      - Ethernet: http://192.168.1.100:3000
   ===========================================
   ```

### Obtener la IP del PC del profesor (Windows)

1. Abre CMD
2. Ejecuta: `ipconfig`
3. Busca la sección de tu conexión de red (Ethernet o Wi-Fi)
4. Anota la "Dirección IPv4" (ej: 192.168.1.100)

### Acceder desde los dispositivos

**En el PC del profesor:**
- Abre el navegador y ve a: `http://localhost:3000/profesor.html`

**En los PCs de los alumnos:**
- Conecta a la misma red LAN que el profesor
- Abre el navegador y ve a: `http://[IP-DEL-PROFESOR]:3000/alumno.html`
- Ejemplo: `http://192.168.1.100:3000/alumno.html`

## Funcionalidades

### Panel del Profesor (`profesor.html`)

1. **Autenticación**:
   - Sistema de contraseña maestra para acceso seguro
   - Configuración de contraseña en el primer uso (mínimo 4 caracteres)

2. **Crear encuesta**:
   - Escribe la pregunta (máximo 500 caracteres)
   - Añade opciones de respuesta (mínimo 2, máximo 20)
   - **Define el número máximo de votos** que se aceptarán
   - Haz clic en "Crear Encuesta"
   - La encuesta se activa automáticamente

3. **Control manual de votos**:
   - El profesor establece cuántos votos se aceptarán en total
   - Útil para controlar el número de alumnos en clase
   - Una vez alcanzado el límite, no se aceptan más votos
   - No se usa detección por dispositivo, el control es completamente manual

4. **Ver resultados en tiempo real**:
   - Los resultados se actualizan automáticamente cada 5 segundos
   - Muestra gráficas de pastel y barras con porcentajes
   - Muestra el total de votos vs. el máximo permitido

5. **Estadísticas detalladas**:
   - Ver información de cada voto (opción votada y fecha/hora)
   - Exportar resultados a CSV con estadísticas completas

6. **Cerrar encuesta**:
   - Haz clic en "Cerrar Encuesta" para finalizar la votación
   - Los alumnos ya no podrán votar

7. **Historial**:
   - Ver encuestas anteriores
   - Consultar resultados de encuestas cerradas
   - Descargar estadísticas en formato CSV

8. **Limpiar datos**:
   - Botón para eliminar todas las encuestas y votos

### Panel de Alumnos (`alumno.html`)

1. **Ver encuesta activa**:
   - Si hay una encuesta activa, se muestra automáticamente
   - Si no hay, aparece un mensaje de espera
   - La página se actualiza cada 3 segundos automáticamente

2. **Votar**:
   - Haz clic en la opción deseada
   - Confirma el voto en el modal de confirmación
   - El voto se registra inmediatamente

3. **Ver resultados**:
   - Después de votar, se muestran los resultados en tiempo real
   - Los resultados se actualizan automáticamente cada 3 segundos
   - Muestra gráficas de barras con porcentajes

4. **Control del profesor**:
   - El profesor controla manualmente cuántos votos se aceptan
   - Si se alcanza el límite establecido, no se aceptan más votos
   - Si se crea una nueva encuesta, se puede volver a votar

## 🔒 Seguridad

El sistema incluye múltiples capas de validación para proteger contra ataques y manipulación de datos:

### Validaciones en el Endpoint de Votación

1. **Validación de tipos de datos**:
   - Verifica que `surveyId` y `option` sean strings
   - Rechaza peticiones con tipos de datos incorrectos

2. **Validación de longitud máxima**:
   - `surveyId`: máximo 50 caracteres
   - `option`: máximo 500 caracteres
   - Protege contra ataques de desbordamiento

3. **Sanitización contra XSS**:
   - Elimina espacios en blanco con `trim()`
   - Previene inyección de código malicioso

4. **Validación de opciones válidas**:
   - Verifica que la opción votada exista en la encuesta
   - **Protege contra hackeo del frontend** (manipulación del código fuente)
   - Si alguien modifica el HTML para enviar una opción falsa, el servidor la rechaza

### Validaciones en el Endpoint de Creación de Encuestas

1. **Validación de tipos de datos**:
   - `question`: debe ser string
   - `options`: debe ser array
   - `maxVotes`: debe ser number

2. **Validación de longitud máxima**:
   - Pregunta: máximo 500 caracteres
   - Cada opción: máximo 200 caracteres
   - Número de opciones: máximo 20

3. **Sanitización**:
   - Aplica `trim()` a pregunta y opciones
   - Verifica que no haya opciones vacías después de sanitizar

4. **Autenticación obligatoria**:
   - Solo accesible con contraseña de profesor
   - Protege contra creación no autorizada de encuestas

### Protección Contra Ataques Comunes

- ✅ **Manipulación del frontend**: Las opciones de voto se validan en el servidor
- ✅ **Inyección de código**: Sanitización de todos los inputs
- ✅ **Desbordamiento**: Límites de longitud en todos los campos
- ✅ **Tipos incorrectos**: Validación estricta de tipos de datos
- ✅ **Acceso no autorizado**: Sistema de autenticación para el profesor

## Guía de Uso para Profesores

### Primera Configuración

1. **Iniciar el servidor**:
   ```bash
   npm start
   ```

2. **Configurar contraseña**:
   - Accede a `http://localhost:3000/profesor.html`
   - La primera vez, configura una contraseña maestra (mínimo 4 caracteres)
   - **Importante**: Guarda esta contraseña, no se puede recuperar

3. **Obtener IP para compartir con alumnos**:
   - El servidor muestra tu IP al iniciar
   - O ejecuta `ipconfig` en CMD y busca "Dirección IPv4"
   - Comparte con los alumnos: `http://TU-IP:3000/alumno.html`

### Crear una Encuesta

1. **Accede al panel del profesor** y haz login
2. **Escribe la pregunta** de la encuesta
3. **Añade las opciones** (mínimo 2, máximo 20):
   - Escribe una opción en el campo de texto
   - Haz clic en "Añadir opción"
   - Repite para cada opción
4. **Define el número máximo de votos**:
   - Ejemplo: Si tienes 25 alumnos, pon 25
   - Esto evita votos adicionales no deseados
5. **Haz clic en "Crear Encuesta"**
6. La encuesta se activa automáticamente y los alumnos pueden empezar a votar

### Durante la Votación

- **Los resultados se actualizan automáticamente** cada 5 segundos
- Puedes ver el progreso: "Votos: 15 / 25"
- Los alumnos ven los resultados en tiempo real después de votar

### Finalizar la Encuesta

1. Haz clic en **"Cerrar Encuesta"**
2. Los alumnos ya no podrán votar
3. Puedes **ver estadísticas detalladas** o **descargar CSV**

### Exportar Resultados

1. Haz clic en **"Ver Estadísticas"** en cualquier encuesta
2. Se muestra una tabla con:
   - Opción votada por cada alumno
   - Fecha y hora exacta de cada voto
3. Haz clic en **"Descargar CSV"** para guardar los resultados
4. El archivo CSV incluye:
   - Detalle de cada voto
   - Resumen de resultados con porcentajes

### Consejos Prácticos

- **Antes de clase**: Inicia el servidor y configura la contraseña
- **Al comenzar**: Comparte la URL con los alumnos (proyéctala en la pizarra)
- **Número de votos**: Ponlo igual al número de alumnos presentes
- **Nueva encuesta**: Crea una nueva cada vez que quieras hacer una pregunta
- **Al finalizar la clase**: Descarga los CSV si quieres guardar las estadísticas

## Persistencia de Datos

Los datos se almacenan en archivos JSON en la carpeta `data/`:

### `data/surveys.json`
```json
{
  "surveys": [
    {
      "id": "1699999999999",
      "question": "¿Cuál es tu lenguaje favorito?",
      "options": ["JavaScript", "Python", "Java"],
      "status": "active",
      "createdAt": "2024-11-06T10:00:00.000Z",
      "maxVotes": 25
    }
  ]
}
```

### `data/votes.json`
```json
{
  "votes": [
    {
      "id": "1699999999999",
      "surveyId": "1699999999999",
      "option": "JavaScript",
      "timestamp": "2024-11-06T10:05:00.000Z"
    }
  ]
}
```

### `data/config.json`
```json
{
  "passwordHash": "hash_de_la_contraseña_del_profesor"
}
```

## Configuración del Firewall (Windows)

Para que los alumnos puedan acceder desde otros PCs:

1. Abre "Firewall de Windows Defender"
2. Haz clic en "Configuración avanzada"
3. Selecciona "Reglas de entrada"
4. Haz clic en "Nueva regla..."
5. Selecciona "Puerto" y haz clic en "Siguiente"
6. Selecciona "TCP" y escribe "3000" en "Puertos locales específicos"
7. Selecciona "Permitir la conexión"
8. Selecciona todos los perfiles (Dominio, Privado, Público)
9. Dale un nombre como "Servidor de Encuestas"

**Alternativa rápida:** Al iniciar el servidor por primera vez, Windows puede pedir permiso automáticamente. Haz clic en "Permitir acceso".

## API Endpoints

El servidor proporciona los siguientes endpoints:

### Autenticación
- `GET /api/auth/status` - Verificar si hay contraseña establecida
- `POST /api/auth/setup` - Establecer contraseña por primera vez
- `POST /api/auth/login` - Validar contraseña (login)

### Encuestas (requieren autenticación excepto `/api/active-survey`)
- `GET /api/surveys` - Obtener todas las encuestas [🔒 Requiere auth]
- `GET /api/active-survey` - Obtener la encuesta activa [Público]
- `POST /api/surveys` - Crear una nueva encuesta [🔒 Requiere auth]
- `POST /api/surveys/:id/close` - Cerrar una encuesta [🔒 Requiere auth]
- `GET /api/surveys/:id/results` - Obtener resultados de una encuesta [Público]
- `GET /api/surveys/:id/stats` - Obtener estadísticas detalladas [🔒 Requiere auth]

### Votos
- `POST /api/vote` - Registrar un voto [Público]

### Administración
- `POST /api/reset` - Limpiar todos los datos [🔒 Requiere auth]

## Solución de Problemas

### Los alumnos no pueden acceder

1. Verifica que todos estén en la misma red
2. Verifica la IP del profesor con `ipconfig`
3. Desactiva temporalmente el firewall para probar
4. Asegúrate de usar la IP correcta (no 127.0.0.1 ni localhost)

### El servidor no arranca

1. Verifica que Node.js esté instalado: `node --version`
2. Instala las dependencias: `npm install`
3. Verifica que el puerto 3000 no esté en uso

### Los resultados no se actualizan

1. Refresca la página (F5)
2. Verifica la conexión a internet/red
3. Revisa la consola del navegador (F12) para errores

## Ventajas de usar Archivos JSON

- **Sin instalación de base de datos**: No requiere MySQL, MongoDB, etc.
- **Portabilidad**: Puedes copiar la carpeta completa a otro PC
- **Backup simple**: Solo copia la carpeta `data/`
- **Inspección manual**: Puedes abrir y ver los archivos JSON
- **Cero configuración**: Funciona inmediatamente después de `npm install`

## Limitaciones

- No recomendado para más de 100 alumnos simultáneos
- Los archivos JSON crecen con el tiempo (hacer limpieza periódica con el botón Reset)
- Control manual de votos (el profesor debe establecer el límite correcto)
- Sin cifrado de datos (usar solo en redes seguras/privadas)
- Sin detección automática de votos duplicados (se confía en el control manual)

## Mejoras Futuras Posibles

- [ ] Múltiples encuestas activas simultáneas
- [ ] Temporizador automático para cerrar encuestas
- [ ] Rate limiting (limitar número de votos por tiempo por IP)
- [ ] Modo oscuro
- [ ] Exportación a PDF además de CSV
- [ ] Sistema de sesiones más robusto
- [ ] Backup automático de datos

## Licencia

MIT

## Soporte

Para problemas o preguntas, abre un issue en el repositorio.
