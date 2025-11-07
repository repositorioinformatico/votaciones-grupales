# Sistema de Encuestas para Profesor y Alumnos

Sistema web de encuestas en tiempo real sin base de datos, diseñado para que un profesor pueda crear encuestas y los alumnos puedan votar a través de la red LAN.

## Características

- **Sin base de datos**: Utiliza archivos JSON para persistencia de datos
- **Tiempo real**: Los resultados se actualizan automáticamente
- **Red LAN**: Accesible desde cualquier dispositivo conectado a la misma red
- **Interfaz dual**: Panel de control para el profesor y vista de votación para alumnos
- **Autenticación segura**: Sistema de contraseña maestra para acceso del profesor
- **Exportación de datos**: Descarga resultados en formato CSV con estadísticas detalladas
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
   - Configuración de contraseña en el primer uso

2. **Crear encuesta**:
   - Escribe la pregunta
   - Añade opciones de respuesta (mínimo 2)
   - Haz clic en "Crear Encuesta"
   - La encuesta se activa automáticamente

3. **Ver resultados en tiempo real**:
   - Los resultados se actualizan automáticamente cada 5 segundos
   - Muestra gráficas de pastel y barras con porcentajes
   - Muestra el total de votos

4. **Estadísticas detalladas**:
   - Ver información de cada voto (IP, fingerprint, fecha/hora)
   - Exportar resultados a CSV con estadísticas completas

5. **Cerrar encuesta**:
   - Haz clic en "Cerrar Encuesta" para finalizar la votación
   - Los alumnos ya no podrán votar

6. **Historial**:
   - Ver encuestas anteriores
   - Consultar resultados de encuestas cerradas
   - Descargar estadísticas en formato CSV

7. **Limpiar datos**:
   - Botón para eliminar todas las encuestas y votos

### Panel de Alumnos (`alumno.html`)

1. **Ver encuesta activa**:
   - Si hay una encuesta activa, se muestra automáticamente
   - Si no hay, aparece un mensaje de espera

2. **Votar**:
   - Haz clic en la opción deseada
   - Confirma el voto
   - El voto se registra inmediatamente

3. **Ver resultados**:
   - Después de votar, se muestran los resultados en tiempo real
   - Los resultados se actualizan automáticamente cada 3 segundos

4. **Restricción de voto**:
   - Cada dispositivo solo puede votar una vez por encuesta
   - Si se crea una nueva encuesta, se puede volver a votar

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
      "createdAt": "2024-11-06T10:00:00.000Z"
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
      "studentId": "student_12345",
      "timestamp": "2024-11-06T10:05:00.000Z"
    }
  ]
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

- `GET /api/surveys` - Obtener todas las encuestas
- `GET /api/active-survey` - Obtener la encuesta activa
- `POST /api/surveys` - Crear una nueva encuesta
- `POST /api/surveys/:id/close` - Cerrar una encuesta
- `POST /api/vote` - Registrar un voto
- `GET /api/surveys/:id/results` - Obtener resultados de una encuesta
- `POST /api/reset` - Limpiar todos los datos

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
- Los archivos JSON crecen con el tiempo (hacer limpieza periódica)
- Sin autenticación de usuarios (identificación por dispositivo)
- Sin cifrado de datos (usar solo en redes seguras)

## Mejoras Futuras Posibles

- [ ] Múltiples encuestas activas simultáneas
- [ ] Temporizador automático para cerrar encuestas
- [ ] Gráficas más avanzadas
- [ ] Modo oscuro

## Licencia

MIT

## Soporte

Para problemas o preguntas, abre un issue en el repositorio.
