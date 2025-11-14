# Sistema Anti-Fraude Multi-Capa

## Objetivo
Evitar que un mismo usuario vote dos veces en la misma encuesta, manteniendo la privacidad y sin almacenar información sensible.

---

## Arquitectura de Seguridad

### Capa 1: Fingerprint del Servidor (Principal)
**Ubicación:** `server.js:80-93`

```javascript
generateVoterFingerprint(ip, userAgent, surveyId)
```

**Cómo funciona:**
1. Captura la IP del cliente (normalizada, sin prefijos IPv6)
2. Captura el User-Agent del navegador
3. Usa el ID de la encuesta como salt único
4. Genera un **doble hash SHA-256**:
   - Hash 1: `SHA256(IP|UserAgent|SurveyID)`
   - Hash 2: `SHA256(Hash1 + SurveyID)`

**Por qué doble hash:**
- Mayor seguridad contra rainbow tables
- El salt por encuesta previene correlación entre encuestas diferentes
- Imposible revertir para obtener la IP original

**Validación:** `server.js:313-323`
- Antes de registrar un voto, verifica si el fingerprint ya existe
- Si existe → rechaza con código `ALREADY_VOTED` (HTTP 403)
- Si no existe → permite el voto y almacena el fingerprint

---

### Capa 2: LocalStorage del Cliente (Secundaria)
**Ubicación:** `public/alumno.html:30-44`

```javascript
hasVotedInSurvey(surveyId)
markAsVoted(surveyId)
```

**Cómo funciona:**
1. Mantiene un array de IDs de encuestas votadas en `localStorage`
2. Verifica ANTES de enviar la petición al servidor
3. Si el servidor detecta voto duplicado, sincroniza con localStorage

**Por qué es importante:**
- Feedback instantáneo al usuario (sin esperar al servidor)
- Funciona incluso si el servidor falla temporalmente
- Reduce carga en el servidor (filtra intentos obvios)

---

## Escenarios de Fraude y Protección

### ✅ Escenario 1: Usuario intenta votar dos veces
**Ataque:** Hacer clic varias veces en el botón de voto
**Defensa:**
- Capa 2 bloquea en el cliente (inmediato)
- Capa 1 bloquea en el servidor (backup)
**Resultado:** Bloqueado completamente

---

### ✅ Escenario 2: Usuario borra localStorage
**Ataque:** Abrir DevTools → Application → Clear storage
**Defensa:**
- Capa 2 falla (localStorage vacío)
- Capa 1 detecta el fingerprint en servidor
**Resultado:** Bloqueado por el servidor

---

### ⚠️ Escenario 3: Usuario cambia de navegador
**Ataque:** Votar en Chrome, luego en Firefox (mismo PC)
**Defensa:**
- User-Agent diferente → fingerprint diferente
- Sistema lo detecta como "usuarios" diferentes
**Limitación:** Difícil de prevenir sin comprometer privacidad
**Mitigación sugerida:** Límite de votos totales + monitoreo manual

---

### ⚠️ Escenario 4: Usuario cambia de red
**Ataque:** Votar en WiFi casa, luego con datos móviles
**Defensa:**
- IP diferente → fingerprint diferente
- Sistema lo detecta como "usuarios" diferentes
**Limitación:** No se puede prevenir 100% sin violar privacidad
**Mitigación sugerida:** Análisis de patrones temporales (votos en ráfaga)

---

### ✅ Escenario 5: Varios usuarios en WiFi compartido
**Protección:** Cada navegador tiene User-Agent ligeramente diferente
**Resultado:** Funcionamiento normal, usuarios legítimos no bloqueados

---

## Nivel de Privacidad

### ✅ Lo que NO se almacena:
- IP en texto plano
- Información personal identificable
- User-Agent completo

### ✅ Lo que SÍ se almacena:
- Hash irreversible (64 caracteres hexadecimales)
- Timestamp del voto
- Opción votada (anónima)

### Ejemplo de datos almacenados:
```json
{
  "id": "1763134097435",
  "surveyId": "1763134097432",
  "option": "JavaScript",
  "fingerprint": "a3f7b2c1e9d4f6a8b2c5e1d3f9a7b4c2e8f1d6a9b3c7e2f5a1d8b4c9e3f7a2b6",
  "timestamp": "2025-11-14T15:27:17.435Z"
}
```

**Imposible determinar:**
- ¿Qué IP votó por JavaScript?
- ¿Dos votos provienen de la misma IP?
- ¿Un usuario votó en múltiples encuestas?

---

## Dificultad de Fraude

### Para votar dos veces, un atacante necesita:
1. **Opción fácil:** Cambiar de navegador/dispositivo
2. **Opción media:** Usar VPN + borrar localStorage
3. **Opción difícil:** Spoofear User-Agent + VPN + navegador privado

### Comparación con sistemas tradicionales:

| Sistema | Dificultad Fraude | Privacidad | Implementación |
|---------|-------------------|------------|----------------|
| Sin protección | Trivial | Alta | Trivial |
| Solo cookies | Muy fácil | Alta | Fácil |
| Solo IP | Fácil | Media | Fácil |
| **IP + UA hasheado** | **Media-Alta** | **Alta** | **Media** |
| Login obligatorio | Alta | Baja | Compleja |

---

## Código Clave

### Generación de fingerprint
`server.js:80-93`
```javascript
function generateVoterFingerprint(ip, userAgent, surveyId) {
  const normalizedIP = ip.replace(/^::ffff:/, '');
  const fingerprintData = `${normalizedIP}|${userAgent}|${surveyId}`;
  const hash1 = crypto.createHash('sha256').update(fingerprintData).digest('hex');
  const hash2 = crypto.createHash('sha256').update(hash1 + surveyId).digest('hex');
  return hash2;
}
```

### Validación en servidor
`server.js:308-323`
```javascript
const voterFingerprint = generateVoterFingerprint(clientIP, userAgent, surveyId);
const alreadyVoted = surveyVotes.some(v => v.fingerprint === voterFingerprint);
if (alreadyVoted) {
  return res.status(403).json({
    error: 'Ya has votado en esta encuesta',
    code: 'ALREADY_VOTED'
  });
}
```

### Validación en cliente
`alumno.html:30-44`
```javascript
function hasVotedInSurvey(surveyId) {
  const votedSurveys = JSON.parse(localStorage.getItem('votedSurveys') || '[]');
  return votedSurveys.includes(surveyId);
}
```

---

## Pruebas

Ejecutar:
```bash
node test-anti-fraud.js
```

**Resultados esperados:**
- ✅ Voto válido se registra
- ✅ Voto duplicado bloqueado
- ✅ Fingerprint diferente permite voto
- ✅ Resultados precisos sin info sensible

---

## Mejoras Futuras (Opcional)

### 1. Rate Limiting
Limitar votos por IP a nivel de servidor (ej: máx 3 votos/minuto)

### 2. Análisis de Patrones
Detectar votos sospechosos:
- Múltiples votos en < 5 segundos
- User-Agents sospechosos (bots)
- IPs de VPN conocidas

### 3. CAPTCHA Condicional
Mostrar CAPTCHA solo si se detecta comportamiento sospechoso

### 4. Fingerprinting Avanzado
- Canvas fingerprinting
- WebGL fingerprinting
- Font fingerprinting

**Nota:** Estas técnicas son más invasivas y pueden reducir privacidad.

---

## Conclusión

Este sistema ofrece un **balance óptimo** entre:
- ✅ Seguridad anti-fraude
- ✅ Privacidad del usuario
- ✅ Facilidad de uso
- ✅ Sin base de datos externa
- ✅ Sin login/registro obligatorio

**Recomendado para:** Votaciones en aula, encuestas educativas, grupos pequeños-medianos (10-100 personas).
