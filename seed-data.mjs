import mysql from 'mysql2/promise';

const DATABASE_URL = process.env.DATABASE_URL;

async function seed() {
  const connection = await mysql.createConnection(DATABASE_URL);
  
  console.log('🌱 Seeding database...');

  // Insert categories
  console.log('📁 Creating categories...');
  await connection.execute(`
    INSERT INTO news_categories (name, slug, description, color) VALUES
    ('Últimas Noticias', 'ultimas-noticias', 'Las noticias más recientes del fútbol chileno', '#E30613'),
    ('Fichajes', 'fichajes', 'Rumores y confirmaciones del mercado de fichajes', '#0039A6'),
    ('Análisis Tácticos', 'analisis-tacticos', 'Análisis profundos de partidos y jugadores', '#FFD700'),
    ('Selección', 'seleccion', 'Noticias de la selección chilena', '#E30613'),
    ('Ligas Europeas', 'ligas-europeas', 'Chilenos en las mejores ligas del mundo', '#0039A6')
    ON DUPLICATE KEY UPDATE name=name
  `);

  // Insert teams
  console.log('⚽ Creating teams...');
  await connection.execute(`
    INSERT INTO teams (name, shortName, country, league, logo) VALUES
    ('Universidad de Chile', 'U. de Chile', 'Chile', 'Primera División', '/teams/udechile.png'),
    ('Colo-Colo', 'Colo-Colo', 'Chile', 'Primera División', '/teams/colocolo.png'),
    ('Universidad Católica', 'U. Católica', 'Chile', 'Primera División', '/teams/ucatolica.png'),
    ('Real Betis', 'Betis', 'España', 'La Liga', '/teams/betis.png'),
    ('Brighton & Hove Albion', 'Brighton', 'Inglaterra', 'Premier League', '/teams/brighton.png'),
    ('Olympique de Marseille', 'Marsella', 'Francia', 'Ligue 1', '/teams/marseille.png'),
    ('Inter de Milán', 'Inter', 'Italia', 'Serie A', '/teams/inter.png'),
    ('Flamengo', 'Flamengo', 'Brasil', 'Brasileirão', '/teams/flamengo.png'),
    ('Bayer Leverkusen', 'Leverkusen', 'Alemania', 'Bundesliga', '/teams/leverkusen.png'),
    ('Selección Chilena', 'Chile', 'Chile', 'Selección', '/teams/chile.png')
    ON DUPLICATE KEY UPDATE name=name
  `);

  // Get team IDs
  const [teams] = await connection.execute('SELECT id, name FROM teams');
  const teamMap = {};
  teams.forEach(t => teamMap[t.name] = t.id);

  // Insert players
  console.log('👤 Creating players...');
  const players = [
    {
      name: 'Alexis Sánchez',
      slug: 'alexis-sanchez',
      position: 'Delantero',
      nationality: 'Chile',
      age: 35,
      height: 169,
      weight: 62,
      preferredFoot: 'Derecho',
      jerseyNumber: 7,
      teamId: teamMap['Inter de Milán'],
      marketValue: 3000000,
      goals: 8,
      assists: 5,
      matches: 25,
      minutesPlayed: 1800,
      yellowCards: 3,
      redCards: 0,
      overallRating: 82,
      pace: 78,
      shooting: 84,
      passing: 80,
      dribbling: 86,
      defending: 35,
      physical: 68,
      imageUrl: '/player-profile.jpg'
    },
    {
      name: 'Ben Brereton Díaz',
      slug: 'ben-brereton-diaz',
      position: 'Delantero',
      nationality: 'Chile',
      age: 25,
      height: 185,
      weight: 80,
      preferredFoot: 'Derecho',
      jerseyNumber: 19,
      teamId: teamMap['Real Betis'],
      marketValue: 12000000,
      goals: 12,
      assists: 4,
      matches: 30,
      minutesPlayed: 2400,
      yellowCards: 2,
      redCards: 0,
      overallRating: 78,
      pace: 82,
      shooting: 79,
      passing: 65,
      dribbling: 72,
      defending: 30,
      physical: 78,
      imageUrl: '/chile-players.jpg'
    },
    {
      name: 'Claudio Bravo',
      slug: 'claudio-bravo',
      position: 'Portero',
      nationality: 'Chile',
      age: 41,
      height: 184,
      weight: 80,
      preferredFoot: 'Derecho',
      jerseyNumber: 1,
      teamId: teamMap['Real Betis'],
      marketValue: 500000,
      goals: 0,
      assists: 0,
      matches: 15,
      minutesPlayed: 1350,
      yellowCards: 1,
      redCards: 0,
      overallRating: 80,
      pace: 45,
      shooting: 20,
      passing: 75,
      dribbling: 40,
      defending: 30,
      physical: 65,
      imageUrl: '/player-profile.jpg'
    },
    {
      name: 'Marcelino Núñez',
      slug: 'marcelino-nunez',
      position: 'Mediocampista',
      nationality: 'Chile',
      age: 24,
      height: 175,
      weight: 70,
      preferredFoot: 'Izquierdo',
      jerseyNumber: 8,
      teamId: teamMap['Brighton & Hove Albion'],
      marketValue: 15000000,
      goals: 6,
      assists: 8,
      matches: 28,
      minutesPlayed: 2200,
      yellowCards: 4,
      redCards: 0,
      overallRating: 77,
      pace: 72,
      shooting: 75,
      passing: 82,
      dribbling: 78,
      defending: 55,
      physical: 65,
      imageUrl: '/young-promises.jpg'
    },
    {
      name: 'Darío Osorio',
      slug: 'dario-osorio',
      position: 'Mediocampista',
      nationality: 'Chile',
      age: 20,
      height: 170,
      weight: 65,
      preferredFoot: 'Derecho',
      jerseyNumber: 10,
      teamId: teamMap['Bayer Leverkusen'],
      marketValue: 8000000,
      goals: 4,
      assists: 7,
      matches: 22,
      minutesPlayed: 1600,
      yellowCards: 2,
      redCards: 0,
      overallRating: 76,
      pace: 88,
      shooting: 70,
      passing: 75,
      dribbling: 85,
      defending: 35,
      physical: 60,
      imageUrl: '/future-players.jpg'
    },
    {
      name: 'Víctor Dávila',
      slug: 'victor-davila',
      position: 'Delantero',
      nationality: 'Chile',
      age: 27,
      height: 175,
      weight: 72,
      preferredFoot: 'Derecho',
      jerseyNumber: 11,
      teamId: teamMap['Colo-Colo'],
      marketValue: 4000000,
      goals: 15,
      assists: 6,
      matches: 32,
      minutesPlayed: 2700,
      yellowCards: 5,
      redCards: 1,
      overallRating: 75,
      pace: 85,
      shooting: 78,
      passing: 68,
      dribbling: 80,
      defending: 30,
      physical: 70,
      imageUrl: '/chile-team-2.jpg'
    },
    {
      name: 'Gabriel Suazo',
      slug: 'gabriel-suazo',
      position: 'Defensa',
      nationality: 'Chile',
      age: 27,
      height: 175,
      weight: 72,
      preferredFoot: 'Izquierdo',
      jerseyNumber: 3,
      teamId: teamMap['Olympique de Marseille'],
      marketValue: 6000000,
      goals: 2,
      assists: 5,
      matches: 26,
      minutesPlayed: 2200,
      yellowCards: 6,
      redCards: 0,
      overallRating: 76,
      pace: 80,
      shooting: 55,
      passing: 72,
      dribbling: 70,
      defending: 78,
      physical: 75,
      imageUrl: '/player-profile.jpg'
    },
    {
      name: 'Erick Pulgar',
      slug: 'erick-pulgar',
      position: 'Mediocampista',
      nationality: 'Chile',
      age: 30,
      height: 188,
      weight: 78,
      preferredFoot: 'Derecho',
      jerseyNumber: 5,
      teamId: teamMap['Flamengo'],
      marketValue: 5000000,
      goals: 3,
      assists: 4,
      matches: 28,
      minutesPlayed: 2300,
      yellowCards: 7,
      redCards: 1,
      overallRating: 77,
      pace: 60,
      shooting: 72,
      passing: 78,
      dribbling: 70,
      defending: 75,
      physical: 80,
      imageUrl: '/player-profile.jpg'
    }
  ];

  for (const player of players) {
    await connection.execute(`
      INSERT INTO players (name, slug, position, nationality, age, height, weight, preferredFoot, jerseyNumber, currentTeamId, marketValue, goals, assists, matches, minutesPlayed, yellowCards, redCards, overallRating, pace, shooting, passing, dribbling, defending, physical, imageUrl)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE name=name
    `, [
      player.name, player.slug, player.position, player.nationality, player.age,
      player.height, player.weight, player.preferredFoot, player.jerseyNumber,
      player.teamId, player.marketValue, player.goals, player.assists, player.matches,
      player.minutesPlayed, player.yellowCards, player.redCards, player.overallRating,
      player.pace, player.shooting, player.passing, player.dribbling, player.defending,
      player.physical, player.imageUrl
    ]);
  }

  // Get category IDs
  const [categories] = await connection.execute('SELECT id, slug FROM news_categories');
  const catMap = {};
  categories.forEach(c => catMap[c.slug] = c.id);

  // Insert news
  console.log('📰 Creating news...');
  const news = [
    {
      title: 'Ben Brereton Díaz brilla con doblete en victoria del Real Betis',
      slug: 'ben-brereton-diaz-doblete-real-betis',
      excerpt: 'El delantero chileno anotó dos goles en la victoria 3-1 sobre el Sevilla en el derbi andaluz.',
      content: 'Ben Brereton Díaz continúa su gran momento en La Liga española. El delantero de la selección chilena anotó un doblete en la victoria del Real Betis sobre el Sevilla por 3-1 en el derbi andaluz.\n\nEl primer gol llegó al minuto 23 tras una gran jugada colectiva, mientras que el segundo fue un cabezazo imparable en el minuto 67.\n\nCon estos goles, Brereton suma 12 tantos en la temporada y se consolida como uno de los máximos goleadores del equipo verdiblanco.',
      categoryId: catMap['ultimas-noticias'],
      imageUrl: '/chile-players.jpg',
      isFeatured: true,
      isPremium: false,
      views: 15420
    },
    {
      title: 'Darío Osorio en la mira de grandes clubes europeos',
      slug: 'dario-osorio-interes-clubes-europeos',
      excerpt: 'El joven mediocampista chileno ha despertado el interés de varios gigantes del fútbol europeo.',
      content: 'Darío Osorio, la joven promesa del fútbol chileno, está en la mira de varios clubes importantes de Europa. Según reportes de medios alemanes, equipos como el Bayern Munich y el Borussia Dortmund han mostrado interés en el mediocampista del Bayer Leverkusen.\n\nA sus 20 años, Osorio ha demostrado un talento excepcional y una madurez impropia de su edad. Su velocidad, regate y visión de juego lo han convertido en una pieza clave del equipo de Xabi Alonso.\n\nEl Leverkusen, sin embargo, no tiene intención de vender a su joya chilena y estaría preparando una renovación de contrato con mejora salarial.',
      categoryId: catMap['fichajes'],
      imageUrl: '/future-players.jpg',
      isFeatured: true,
      isPremium: false,
      views: 12350
    },
    {
      title: 'Análisis: El sistema táctico de Chile bajo la nueva dirección técnica',
      slug: 'analisis-sistema-tactico-chile',
      excerpt: 'Desglosamos el nuevo enfoque táctico de la selección chilena y cómo afecta a los jugadores clave.',
      content: 'La selección chilena ha experimentado cambios significativos en su enfoque táctico bajo la nueva dirección técnica. El equipo ha pasado de un 4-3-3 tradicional a un sistema más flexible que alterna entre 4-2-3-1 y 3-5-2 según el rival.\n\nEste nuevo sistema permite mayor protagonismo a mediocampistas creativos como Marcelino Núñez y Darío Osorio, mientras que Ben Brereton Díaz tiene más libertad de movimiento en el frente de ataque.\n\nLa defensa también ha mostrado mejoras, con Gabriel Suazo aportando profundidad por la banda izquierda y una línea defensiva más compacta.',
      categoryId: catMap['analisis-tacticos'],
      imageUrl: '/stadium-bg.jpg',
      isFeatured: false,
      isPremium: true,
      views: 8920
    },
    {
      title: 'Marcelino Núñez se consolida en la Premier League',
      slug: 'marcelino-nunez-premier-league',
      excerpt: 'El mediocampista chileno ha sido pieza clave en el Brighton de Roberto De Zerbi.',
      content: 'Marcelino Núñez ha completado una temporada excepcional en la Premier League. El mediocampista chileno se ha ganado un lugar en el once titular del Brighton y ha demostrado que tiene nivel para competir en la mejor liga del mundo.\n\nCon 6 goles y 8 asistencias, Núñez ha superado las expectativas y se ha convertido en uno de los jugadores más destacados del equipo. Su capacidad para llegar al área y su precisión en los tiros de larga distancia lo han hecho imprescindible.\n\nEl técnico Roberto De Zerbi ha elogiado públicamente al chileno: "Marcelino tiene una calidad técnica excepcional y una mentalidad ganadora. Es el tipo de jugador que todo entrenador quiere tener".',
      categoryId: catMap['ligas-europeas'],
      imageUrl: '/young-promises.jpg',
      isFeatured: true,
      isPremium: false,
      views: 11200
    },
    {
      title: 'Alexis Sánchez podría volver al fútbol sudamericano',
      slug: 'alexis-sanchez-vuelta-sudamerica',
      excerpt: 'El histórico delantero chileno evalúa opciones para la próxima temporada.',
      content: 'Alexis Sánchez, leyenda del fútbol chileno, estaría evaluando la posibilidad de volver al fútbol sudamericano para la próxima temporada. Según fuentes cercanas al jugador, clubes de Argentina y Brasil han mostrado interés en el delantero.\n\nA sus 35 años, el "Niño Maravilla" aún tiene mucho que ofrecer y podría ser una incorporación de lujo para cualquier equipo del continente. Su experiencia en las mejores ligas del mundo y su liderazgo serían invaluables.\n\nSin embargo, también existe la posibilidad de que Alexis renueve con el Inter de Milán por una temporada más, donde ha sido un jugador importante en la rotación del equipo.',
      categoryId: catMap['fichajes'],
      imageUrl: '/player-profile.jpg',
      isFeatured: false,
      isPremium: false,
      views: 9800
    },
    {
      title: 'La Roja Sub-23 clasifica al Preolímpico',
      slug: 'chile-sub23-preolimpico',
      excerpt: 'La selección juvenil chilena logró su clasificación al torneo continental.',
      content: 'La selección chilena Sub-23 ha logrado su clasificación al Preolímpico Sudamericano tras una brillante actuación en el torneo clasificatorio. El equipo dirigido mostró un fútbol ofensivo y dinámico que ilusiona de cara al futuro.\n\nDestacaron las actuaciones de varios jugadores que ya han sido convocados a la selección mayor, demostrando la profundidad del talento chileno. La defensa fue sólida y el mediocampo creativo generó numerosas ocasiones de gol.\n\nEste logro representa una gran noticia para el fútbol chileno, que busca renovar su generación dorada con nuevos talentos que puedan llevar a La Roja de vuelta a los primeros planos del fútbol mundial.',
      categoryId: catMap['seleccion'],
      imageUrl: '/chile-team-1.jpg',
      isFeatured: false,
      isPremium: false,
      views: 7650
    }
  ];

  for (const article of news) {
    await connection.execute(`
      INSERT INTO news (title, slug, excerpt, content, categoryId, imageUrl, isFeatured, isPremium, views, publishedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE title=title
    `, [
      article.title, article.slug, article.excerpt, article.content,
      article.categoryId, article.imageUrl, article.isFeatured, article.isPremium, article.views
    ]);
  }

  // Get player IDs
  const [playerRows] = await connection.execute('SELECT id, name FROM players');
  const playerMap = {};
  playerRows.forEach(p => playerMap[p.name] = p.id);

  // Insert transfers
  console.log('🔄 Creating transfers...');
  const transfers = [
    {
      playerId: playerMap['Darío Osorio'],
      fromTeamId: teamMap['Universidad de Chile'],
      toTeamId: teamMap['Bayer Leverkusen'],
      fee: 6000000,
      feeType: 'paid',
      status: 'confirmed',
      contractYears: 5,
      source: 'Comunicado oficial'
    },
    {
      playerId: playerMap['Ben Brereton Díaz'],
      fromTeamId: teamMap['Brighton & Hove Albion'],
      toTeamId: teamMap['Real Betis'],
      fee: 8000000,
      feeType: 'paid',
      status: 'confirmed',
      contractYears: 4,
      source: 'Comunicado oficial'
    },
    {
      playerId: playerMap['Marcelino Núñez'],
      fromTeamId: teamMap['Universidad Católica'],
      toTeamId: teamMap['Brighton & Hove Albion'],
      fee: 5000000,
      feeType: 'paid',
      status: 'confirmed',
      contractYears: 4,
      source: 'Comunicado oficial'
    },
    {
      playerId: playerMap['Alexis Sánchez'],
      fromTeamId: teamMap['Inter de Milán'],
      toTeamId: teamMap['Flamengo'],
      fee: null,
      feeType: 'undisclosed',
      status: 'rumor',
      contractYears: null,
      source: 'Medios brasileños'
    }
  ];

  for (const transfer of transfers) {
    await connection.execute(`
      INSERT INTO transfers (playerId, fromTeamId, toTeamId, fee, feeType, status, contractYears, source, announcedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE playerId=playerId
    `, [
      transfer.playerId, transfer.fromTeamId, transfer.toTeamId,
      transfer.fee, transfer.feeType, transfer.status, transfer.contractYears, transfer.source
    ]);
  }

  console.log('✅ Database seeded successfully!');
  await connection.end();
}

seed().catch(console.error);
