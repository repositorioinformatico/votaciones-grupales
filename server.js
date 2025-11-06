const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Rutas de archivos JSON para persistencia
const DATA_DIR = path.join(__dirname, 'data');
const SURVEYS_FILE = path.join(DATA_DIR, 'surveys.json');
const VOTES_FILE = path.join(DATA_DIR, 'votes.json');

// Inicializar directorio y archivos JSON si no existen
function initializeDataFiles() {
  // Crear directorio data/ si no existe
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // Crear archivos JSON si no existen
  if (!fs.existsSync(SURVEYS_FILE)) {
    fs.writeFileSync(SURVEYS_FILE, JSON.stringify({ surveys: [] }, null, 2));
  }
  if (!fs.existsSync(VOTES_FILE)) {
    fs.writeFileSync(VOTES_FILE, JSON.stringify({ votes: [] }, null, 2));
  }
}

// Leer encuestas
function readSurveys() {
  const data = fs.readFileSync(SURVEYS_FILE, 'utf8');
  return JSON.parse(data);
}

// Guardar encuestas
function saveSurveys(data) {
  fs.writeFileSync(SURVEYS_FILE, JSON.stringify(data, null, 2));
}

// Leer votos
function readVotes() {
  const data = fs.readFileSync(VOTES_FILE, 'utf8');
  return JSON.parse(data);
}

// Guardar votos
function saveVotes(data) {
  fs.writeFileSync(VOTES_FILE, JSON.stringify(data, null, 2));
}

// ========== ENDPOINTS ==========

// Obtener todas las encuestas (para el profesor)
app.get('/api/surveys', (req, res) => {
  const data = readSurveys();
  res.json(data.surveys);
});

// Obtener encuesta activa (para los estudiantes)
app.get('/api/active-survey', (req, res) => {
  const data = readSurveys();
  const activeSurvey = data.surveys.find(s => s.status === 'active');

  if (activeSurvey) {
    // Obtener votos para esta encuesta
    const votesData = readVotes();
    const surveyVotes = votesData.votes.filter(v => v.surveyId === activeSurvey.id);

    // Calcular resultados
    const results = activeSurvey.options.map(option => {
      const count = surveyVotes.filter(v => v.option === option).length;
      return { option, count };
    });

    res.json({
      ...activeSurvey,
      results
    });
  } else {
    res.json(null);
  }
});

// Crear nueva encuesta
app.post('/api/surveys', (req, res) => {
  const { question, options, maxVotes } = req.body;

  if (!question || !options || options.length < 2) {
    return res.status(400).json({ error: 'Se requiere pregunta y al menos 2 opciones' });
  }

  if (!maxVotes || maxVotes < 1) {
    return res.status(400).json({ error: 'Se requiere el número máximo de votos (mínimo 1)' });
  }

  const data = readSurveys();

  // Cerrar cualquier encuesta activa anterior
  data.surveys = data.surveys.map(s => ({ ...s, status: 'closed' }));

  const newSurvey = {
    id: Date.now().toString(),
    question,
    options,
    status: 'active',
    createdAt: new Date().toISOString(),
    maxVotes: maxVotes
  };

  data.surveys.push(newSurvey);
  saveSurveys(data);

  res.json(newSurvey);
});

// Cerrar encuesta activa
app.post('/api/surveys/:id/close', (req, res) => {
  const { id } = req.params;
  const data = readSurveys();

  const survey = data.surveys.find(s => s.id === id);
  if (!survey) {
    return res.status(404).json({ error: 'Encuesta no encontrada' });
  }

  survey.status = 'closed';
  saveSurveys(data);

  res.json(survey);
});

// Registrar un voto
app.post('/api/vote', (req, res) => {
  const { surveyId, option, fingerprint } = req.body;

  if (!surveyId || !option) {
    return res.status(400).json({ error: 'Se requiere surveyId y option' });
  }

  // Capturar IP del cliente
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;

  // Verificar que la encuesta existe y está activa
  const surveysData = readSurveys();
  const survey = surveysData.surveys.find(s => s.id === surveyId && s.status === 'active');

  if (!survey) {
    return res.status(400).json({ error: 'La encuesta no está activa' });
  }

  // Verificar que la opción es válida
  if (!survey.options.includes(option)) {
    return res.status(400).json({ error: 'Opción no válida' });
  }

  // Verificar número máximo de votos
  const votesData = readVotes();
  const surveyVotes = votesData.votes.filter(v => v.surveyId === surveyId);

  if (surveyVotes.length >= survey.maxVotes) {
    return res.status(400).json({ error: 'Se ha alcanzado el número máximo de votos para esta encuesta' });
  }

  // Verificar si este fingerprint o IP ya votó
  const existingVoteByFingerprint = surveyVotes.find(v => v.fingerprint === fingerprint);
  const existingVoteByIp = surveyVotes.find(v => v.ip === clientIp);

  if (existingVoteByFingerprint || existingVoteByIp) {
    return res.status(400).json({ error: 'Ya has votado en esta encuesta' });
  }

  // Registrar el voto
  const vote = {
    id: Date.now().toString(),
    surveyId,
    option,
    timestamp: new Date().toISOString(),
    ip: clientIp,
    fingerprint: fingerprint || 'unknown'
  };

  votesData.votes.push(vote);
  saveVotes(votesData);

  res.json({ success: true, vote });
});

// Obtener resultados de una encuesta
app.get('/api/surveys/:id/results', (req, res) => {
  const { id } = req.params;

  const surveysData = readSurveys();
  const survey = surveysData.surveys.find(s => s.id === id);

  if (!survey) {
    return res.status(404).json({ error: 'Encuesta no encontrada' });
  }

  const votesData = readVotes();
  const surveyVotes = votesData.votes.filter(v => v.surveyId === id);

  const results = survey.options.map(option => {
    const count = surveyVotes.filter(v => v.option === option).length;
    return { option, count };
  });

  res.json({
    survey,
    results,
    totalVotes: surveyVotes.length
  });
});

// Eliminar todos los datos (reset)
app.post('/api/reset', (req, res) => {
  saveSurveys({ surveys: [] });
  saveVotes({ votes: [] });
  res.json({ success: true, message: 'Datos reiniciados' });
});

// Obtener estadísticas detalladas de una encuesta (con IPs y fingerprints)
app.get('/api/surveys/:id/stats', (req, res) => {
  const { id } = req.params;

  const surveysData = readSurveys();
  const survey = surveysData.surveys.find(s => s.id === id);

  if (!survey) {
    return res.status(404).json({ error: 'Encuesta no encontrada' });
  }

  const votesData = readVotes();
  const surveyVotes = votesData.votes.filter(v => v.surveyId === id);

  // Mapear votos con todos los detalles
  const detailedVotes = surveyVotes.map(vote => ({
    option: vote.option,
    timestamp: vote.timestamp,
    ip: vote.ip || 'no disponible',
    fingerprint: vote.fingerprint || 'unknown'
  }));

  res.json({
    survey,
    votes: detailedVotes,
    totalVotes: surveyVotes.length
  });
});

// Inicializar archivos de datos
initializeDataFiles();

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log('===========================================');
  console.log(`✓ Servidor de encuestas iniciado`);
  console.log(`✓ Puerto: ${PORT}`);
  console.log(`✓ Acceso local: http://localhost:${PORT}`);
  console.log(`✓ Acceso LAN: http://[IP-de-este-PC]:${PORT}`);
  console.log('===========================================');
  console.log(`📊 Profesor: http://localhost:${PORT}/profesor.html`);
  console.log(`🎓 Alumnos: http://localhost:${PORT}/alumno.html`);
  console.log('===========================================');

  // Mostrar dirección IP local
  const os = require('os');
  const interfaces = os.networkInterfaces();
  console.log('\n📡 Direcciones IP disponibles:');
  Object.keys(interfaces).forEach(ifname => {
    interfaces[ifname].forEach(iface => {
      if (iface.family === 'IPv4' && !iface.internal) {
        console.log(`   - ${ifname}: http://${iface.address}:${PORT}`);
      }
    });
  });
  console.log('===========================================\n');
});
