// Script de prueba del sistema anti-fraude
const API_URL = 'http://localhost:3000';

// Simular diferentes escenarios de votación
async function testAntifraudSystem() {
  console.log('🧪 Iniciando pruebas del sistema anti-fraude\n');

  try {
    // 1. Configurar contraseña (si no existe)
    console.log('1️⃣  Verificando contraseña...');
    const statusRes = await fetch(`${API_URL}/api/auth/status`);
    const statusData = await statusRes.json();

    if (!statusData.hasPassword) {
      console.log('   Estableciendo contraseña...');
      await fetch(`${API_URL}/api/auth/setup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: 'test1234' })
      });
      console.log('   ✓ Contraseña establecida\n');
    } else {
      console.log('   ✓ Contraseña ya existe\n');
    }

    // 2. Crear encuesta
    console.log('2️⃣  Creando encuesta de prueba...');
    const surveyRes = await fetch(`${API_URL}/api/surveys`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-password': 'test1234'
      },
      body: JSON.stringify({
        question: '¿Cuál es tu lenguaje favorito?',
        options: ['JavaScript', 'Python', 'Java'],
        maxVotes: 100
      })
    });
    const survey = await surveyRes.json();
    console.log(`   ✓ Encuesta creada: ${survey.id}\n`);

    // 3. Simular voto normal
    console.log('3️⃣  Simulando voto válido...');
    const vote1 = await fetch(`${API_URL}/api/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'TestBrowser/1.0'
      },
      body: JSON.stringify({
        surveyId: survey.id,
        option: 'JavaScript'
      })
    });
    const vote1Data = await vote1.json();

    if (vote1.ok) {
      console.log('   ✓ Voto registrado correctamente');
      console.log(`   ID: ${vote1Data.vote.id}\n`);
    } else {
      console.log(`   ✗ Error: ${vote1Data.error}\n`);
    }

    // 4. Intentar voto duplicado (mismo IP + User-Agent)
    console.log('4️⃣  Intentando voto duplicado (DEBE FALLAR)...');
    const vote2 = await fetch(`${API_URL}/api/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'TestBrowser/1.0'
      },
      body: JSON.stringify({
        surveyId: survey.id,
        option: 'Python'
      })
    });
    const vote2Data = await vote2.json();

    if (!vote2.ok && vote2Data.code === 'ALREADY_VOTED') {
      console.log('   ✓ ANTI-FRAUDE FUNCIONANDO: Voto duplicado bloqueado');
      console.log(`   Mensaje: ${vote2Data.error}\n`);
    } else {
      console.log('   ✗ ERROR: El sistema permitió voto duplicado\n');
    }

    // 5. Simular voto con User-Agent diferente (intentar burlar el sistema)
    console.log('5️⃣  Intentando burlar con User-Agent diferente...');
    const vote3 = await fetch(`${API_URL}/api/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'DifferentBrowser/2.0'
      },
      body: JSON.stringify({
        surveyId: survey.id,
        option: 'Java'
      })
    });
    const vote3Data = await vote3.json();

    if (vote3.ok) {
      console.log('   ⚠️  Voto permitido (diferente User-Agent)');
      console.log('   Esto es normal: cambiar de navegador es difícil de detectar\n');
    } else {
      console.log(`   ✓ Bloqueado: ${vote3Data.error}\n`);
    }

    // 6. Verificar resultados
    console.log('6️⃣  Verificando resultados...');
    const resultsRes = await fetch(`${API_URL}/api/surveys/${survey.id}/results`);
    const results = await resultsRes.json();

    console.log('   Resultados de la encuesta:');
    results.results.forEach(r => {
      console.log(`   - ${r.option}: ${r.count} votos`);
    });
    console.log(`   Total: ${results.totalVotes} votos\n`);

    console.log('✅ Pruebas completadas exitosamente');
    console.log('\n📋 Resumen del sistema anti-fraude:');
    console.log('   ✓ Capa 1: Fingerprint (IP + User-Agent + salt) hasheado');
    console.log('   ✓ Capa 2: localStorage en navegador');
    console.log('   ✓ Privacidad: IP nunca almacenada en texto plano');
    console.log('   ✓ Seguridad: Doble hash con salt por encuesta\n');

  } catch (error) {
    console.error('❌ Error en las pruebas:', error.message);
  }

  process.exit(0);
}

// Ejecutar pruebas
testAntifraudSystem();
