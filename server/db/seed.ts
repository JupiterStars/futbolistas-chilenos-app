/**
 * FCH Noticias - Database Seeds
 * Datos iniciales para desarrollo y pruebas
 * 
 * Contiene:
 * - 9 Categorías de noticias
 * - 30 Jugadores reales de fútbol chileno
 * - 50 Noticias de ejemplo
 * - Transferencias de ejemplo
 */

import { sql } from '@vercel/postgres';
import { drizzle } from 'drizzle-orm/vercel-postgres';
import {
  categories,
  news,
  players,
  transfers,
  type InsertCategory,
  type InsertNews,
  type InsertPlayer,
  type InsertTransfer,
} from './schema';

const db = drizzle(sql);

// ============================================================================
// DATOS: CATEGORÍAS
// ============================================================================

const categoriesData: InsertCategory[] = [
  {
    name: 'La Roja',
    slug: 'la-roja',
    description: 'Noticias de la Selección Chilena de Fútbol, convocatorias, partidos y resultados',
    color: '#E30613',
    icon: 'Flag',
  },
  {
    name: 'Extranjero',
    slug: 'extranjero',
    description: 'Chilenos jugando en el exterior: Europa, Sudamérica y resto del mundo',
    color: '#FFA500',
    icon: 'Globe',
  },
  {
    name: 'Sub-20',
    slug: 'sub-20',
    description: 'Noticias de la selección Sub-20 y juveniles de esa categoría',
    color: '#3B82F6',
    icon: 'Users',
  },
  {
    name: 'Sub-18',
    slug: 'sub-18',
    description: 'Noticias de la selección Sub-18 y juveniles de esa categoría',
    color: '#10B981',
    icon: 'Users',
  },
  {
    name: 'Sub-17',
    slug: 'sub-17',
    description: 'Noticias de la selección Sub-17 y juveniles de esa categoría',
    color: '#8B5CF6',
    icon: 'Users',
  },
  {
    name: 'Sub-16',
    slug: 'sub-16',
    description: 'Noticias de la selección Sub-16 y juveniles de esa categoría',
    color: '#F59E0B',
    icon: 'Users',
  },
  {
    name: 'Sub-15',
    slug: 'sub-15',
    description: 'Noticias de la selección Sub-15 y juveniles de esa categoría',
    color: '#EC4899',
    icon: 'Users',
  },
  {
    name: 'Entrevistas',
    slug: 'entrevistas',
    description: 'Entrevistas exclusivas con jugadores, técnicos y figuras del fútbol chileno',
    color: '#14B8A6',
    icon: 'Mic',
  },
  {
    name: 'Mercado de Pases',
    slug: 'mercado-de-pases',
    description: 'Rumores, transferencias confirmadas y movimientos del mercado',
    color: '#F97316',
    icon: 'ArrowRightLeft',
  },
];

// ============================================================================
// DATOS: JUGADORES
// ============================================================================

const playersData: InsertPlayer[] = [
  {
    name: 'Alexis Sánchez',
    slug: 'alexis-sanchez',
    position: 'Delantero Centro',
    team: 'Inter de Milán',
    nationality: 'Chile',
    age: 35,
    height: 169,
    weight: 62,
    imageUrl: '/images/players/alexis-sanchez.jpg',
    stats: { goals: 8, assists: 5, matches: 25, minutes: 1800, yellowCards: 3, redCards: 0 },
    marketValue: 3500000,
  },
  {
    name: 'Arturo Vidal',
    slug: 'arturo-vidal',
    position: 'Mediocampista Central',
    team: 'Colo-Colo',
    nationality: 'Chile',
    age: 37,
    height: 180,
    weight: 75,
    imageUrl: '/images/players/arturo-vidal.jpg',
    stats: { goals: 3, assists: 4, matches: 18, minutes: 1400, yellowCards: 5, redCards: 1 },
    marketValue: 800000,
  },
  {
    name: 'Charles Aránguiz',
    slug: 'charles-aranguez',
    position: 'Mediocampista Defensivo',
    team: 'Libre',
    nationality: 'Chile',
    age: 35,
    height: 172,
    weight: 68,
    imageUrl: '/images/players/charles-aranguez.jpg',
    stats: { goals: 1, assists: 2, matches: 15, minutes: 1100, yellowCards: 4, redCards: 0 },
    marketValue: 500000,
  },
  {
    name: 'Gary Medel',
    slug: 'gary-medel',
    position: 'Defensa Central',
    team: 'Bologna',
    nationality: 'Chile',
    age: 37,
    height: 171,
    weight: 76,
    imageUrl: '/images/players/gary-medel.jpg',
    stats: { goals: 0, assists: 1, matches: 12, minutes: 900, yellowCards: 6, redCards: 0 },
    marketValue: 400000,
  },
  {
    name: 'Claudio Bravo',
    slug: 'claudio-bravo',
    position: 'Portero',
    team: 'Real Betis',
    nationality: 'Chile',
    age: 41,
    height: 184,
    weight: 80,
    imageUrl: '/images/players/claudio-bravo.jpg',
    stats: { goals: 0, assists: 0, matches: 20, minutes: 1800, cleanSheets: 5, saves: 65 },
    marketValue: 300000,
  },
  {
    name: 'Eduardo Vargas',
    slug: 'eduardo-vargas',
    position: 'Delantero Centro',
    team: 'Universidad de Chile',
    nationality: 'Chile',
    age: 34,
    height: 176,
    weight: 74,
    imageUrl: '/images/players/eduardo-vargas.jpg',
    stats: { goals: 12, assists: 6, matches: 28, minutes: 2200, yellowCards: 7, redCards: 0 },
    marketValue: 1200000,
  },
  {
    name: 'Erick Pulgar',
    slug: 'erick-pulgar',
    position: 'Mediocampista Defensivo',
    team: 'Flamengo',
    nationality: 'Chile',
    age: 30,
    height: 187,
    weight: 78,
    imageUrl: '/images/players/erick-pulgar.jpg',
    stats: { goals: 2, assists: 3, matches: 32, minutes: 2500, yellowCards: 8, redCards: 0 },
    marketValue: 4500000,
  },
  {
    name: 'Paulo Díaz',
    slug: 'paulo-diaz',
    position: 'Defensa Central',
    team: 'River Plate',
    nationality: 'Chile',
    age: 30,
    height: 178,
    weight: 72,
    imageUrl: '/images/players/paulo-diaz.jpg',
    stats: { goals: 1, assists: 1, matches: 35, minutes: 3000, yellowCards: 9, redCards: 1 },
    marketValue: 5500000,
  },
  {
    name: 'Ben Brereton Díaz',
    slug: 'ben-brereton-diaz',
    position: 'Delantero Centro',
    team: 'Villarreal',
    nationality: 'Chile',
    age: 25,
    height: 188,
    weight: 75,
    imageUrl: '/images/players/ben-brereton-diaz.jpg',
    stats: { goals: 6, assists: 2, matches: 22, minutes: 1400, yellowCards: 3, redCards: 0 },
    marketValue: 8000000,
  },
  {
    name: 'Víctor Dávila',
    slug: 'victor-davila',
    position: 'Mediocampista Ofensivo',
    team: 'Club América',
    nationality: 'Chile',
    age: 27,
    height: 170,
    weight: 65,
    imageUrl: '/images/players/victor-davila.jpg',
    stats: { goals: 8, assists: 7, matches: 38, minutes: 2800, yellowCards: 4, redCards: 0 },
    marketValue: 6500000,
  },
  {
    name: 'Darío Osorio',
    slug: 'dario-osorio',
    position: 'Extremo Izquierdo',
    team: 'Midtjylland',
    nationality: 'Chile',
    age: 21,
    height: 182,
    weight: 70,
    imageUrl: '/images/players/dario-osorio.jpg',
    stats: { goals: 5, assists: 4, matches: 26, minutes: 1800, yellowCards: 2, redCards: 0 },
    marketValue: 7000000,
  },
  {
    name: 'Marcelino Núñez',
    slug: 'marcelino-nunez',
    position: 'Mediocampista Central',
    team: 'Norwich City',
    nationality: 'Chile',
    age: 24,
    height: 175,
    weight: 68,
    imageUrl: '/images/players/marcelino-nunez.jpg',
    stats: { goals: 4, assists: 6, matches: 40, minutes: 3200, yellowCards: 6, redCards: 0 },
    marketValue: 5500000,
  },
  {
    name: 'Alexander Aravena',
    slug: 'alexander-aravena',
    position: 'Delantero Centro',
    team: 'Necaxa',
    nationality: 'Chile',
    age: 22,
    height: 178,
    weight: 72,
    imageUrl: '/images/players/alexander-aravena.jpg',
    stats: { goals: 9, assists: 3, matches: 32, minutes: 2400, yellowCards: 4, redCards: 0 },
    marketValue: 4200000,
  },
  {
    name: 'Bruno Barticciotto',
    slug: 'bruno-barticciotto',
    position: 'Delantero Centro',
    team: 'Talleres',
    nationality: 'Chile',
    age: 23,
    height: 181,
    weight: 74,
    imageUrl: '/images/players/bruno-barticciotto.jpg',
    stats: { goals: 7, assists: 5, matches: 28, minutes: 2000, yellowCards: 3, redCards: 0 },
    marketValue: 4800000,
  },
  {
    name: 'Maximiliano Guerrero',
    slug: 'maximiliano-guerrero',
    position: 'Extremo Izquierdo',
    team: 'Universidad de Chile',
    nationality: 'Chile',
    age: 25,
    height: 176,
    weight: 70,
    imageUrl: '/images/players/maximiliano-guerrero.jpg',
    stats: { goals: 11, assists: 8, matches: 30, minutes: 2500, yellowCards: 5, redCards: 1 },
    marketValue: 3500000,
  },
  {
    name: 'Lucas Assadi',
    slug: 'lucas-assadi',
    position: 'Mediocampista Ofensivo',
    team: 'Universidad de Chile',
    nationality: 'Chile',
    age: 21,
    height: 173,
    weight: 68,
    imageUrl: '/images/players/lucas-assadi.jpg',
    stats: { goals: 6, assists: 10, matches: 29, minutes: 2100, yellowCards: 4, redCards: 0 },
    marketValue: 4000000,
  },
  {
    name: 'César Pérez',
    slug: 'cesar-perez',
    position: 'Mediocampista Central',
    team: 'Unión La Calera',
    nationality: 'Chile',
    age: 22,
    height: 177,
    weight: 71,
    imageUrl: '/images/players/cesar-perez.jpg',
    stats: { goals: 3, assists: 4, matches: 35, minutes: 2800, yellowCards: 7, redCards: 0 },
    marketValue: 2500000,
  },
  {
    name: 'Daniel Gutiérrez',
    slug: 'daniel-gutierrez',
    position: 'Lateral Izquierdo',
    team: 'Colo-Colo',
    nationality: 'Chile',
    age: 22,
    height: 175,
    weight: 69,
    imageUrl: '/images/players/daniel-gutierrez.jpg',
    stats: { goals: 1, assists: 6, matches: 33, minutes: 2800, yellowCards: 6, redCards: 1 },
    marketValue: 3200000,
  },
  {
    name: 'Jeyson Rojas',
    slug: 'jeyson-rojas',
    position: 'Delantero Centro',
    team: 'Colo-Colo',
    nationality: 'Chile',
    age: 22,
    height: 179,
    weight: 73,
    imageUrl: '/images/players/jeyson-rojas.jpg',
    stats: { goals: 8, assists: 4, matches: 31, minutes: 2200, yellowCards: 2, redCards: 0 },
    marketValue: 4500000,
  },
  {
    name: 'Joan Cruz',
    slug: 'joan-cruz',
    position: 'Delantero Centro',
    team: 'Colo-Colo',
    nationality: 'Chile',
    age: 21,
    height: 181,
    weight: 74,
    imageUrl: '/images/players/joan-cruz.jpg',
    stats: { goals: 5, assists: 3, matches: 24, minutes: 1600, yellowCards: 3, redCards: 0 },
    marketValue: 2800000,
  },
  {
    name: 'Vicente Pizarro',
    slug: 'vicente-pizarro',
    position: 'Mediocampista Central',
    team: 'Colo-Colo',
    nationality: 'Chile',
    age: 21,
    height: 174,
    weight: 67,
    imageUrl: '/images/players/vicente-pizarro.jpg',
    stats: { goals: 2, assists: 5, matches: 27, minutes: 1900, yellowCards: 5, redCards: 0 },
    marketValue: 3000000,
  },
  {
    name: 'Zidane Yáñez',
    slug: 'zidane-yanez',
    position: 'Mediocampista Ofensivo',
    team: 'Universidad Católica',
    nationality: 'Chile',
    age: 20,
    height: 176,
    weight: 69,
    imageUrl: '/images/players/zidane-yanez.jpg',
    stats: { goals: 4, assists: 3, matches: 25, minutes: 1500, yellowCards: 2, redCards: 0 },
    marketValue: 2200000,
  },
  {
    name: 'Clemente Montes',
    slug: 'clemente-montes',
    position: 'Extremo Derecho',
    team: 'Universidad Católica',
    nationality: 'Chile',
    age: 24,
    height: 180,
    weight: 72,
    imageUrl: '/images/players/clemente-montes.jpg',
    stats: { goals: 6, assists: 4, matches: 29, minutes: 2100, yellowCards: 4, redCards: 0 },
    marketValue: 2800000,
  },
  {
    name: 'Thomas Galdames',
    slug: 'thomas-galdames',
    position: 'Lateral Izquierdo',
    team: 'Godoy Cruz',
    nationality: 'Chile',
    age: 26,
    height: 178,
    weight: 71,
    imageUrl: '/images/players/thomas-galdames.jpg',
    stats: { goals: 1, assists: 3, matches: 26, minutes: 2100, yellowCards: 5, redCards: 1 },
    marketValue: 1800000,
  },
  {
    name: 'Nayel Mehssatou',
    slug: 'nayel-mehssatou',
    position: 'Lateral Derecho',
    team: 'Colo-Colo',
    nationality: 'Chile',
    age: 22,
    height: 183,
    weight: 75,
    imageUrl: '/images/players/nayel-mehssatou.jpg',
    stats: { goals: 0, assists: 4, matches: 32, minutes: 2700, yellowCards: 8, redCards: 0 },
    marketValue: 2600000,
  },
  {
    name: 'Emiliano Amor',
    slug: 'emiliano-amor',
    position: 'Defensa Central',
    team: 'Vélez Sarsfield',
    nationality: 'Chile',
    age: 29,
    height: 185,
    weight: 80,
    imageUrl: '/images/players/emiliano-amor.jpg',
    stats: { goals: 1, assists: 0, matches: 24, minutes: 2000, yellowCards: 5, redCards: 0 },
    marketValue: 1200000,
  },
  {
    name: 'Valber Huerta',
    slug: 'valber-huerta',
    position: 'Defensa Central',
    team: 'Toluca',
    nationality: 'Chile',
    age: 29,
    height: 188,
    weight: 82,
    imageUrl: '/images/players/valber-huerta.jpg',
    stats: { goals: 2, assists: 1, matches: 36, minutes: 3200, yellowCards: 7, redCards: 0 },
    marketValue: 2200000,
  },
  {
    name: 'Matías Zaldivia',
    slug: 'matias-zaldivia',
    position: 'Defensa Central',
    team: 'Universidad de Chile',
    nationality: 'Chile',
    age: 32,
    height: 186,
    weight: 78,
    imageUrl: '/images/players/matias-zaldivia.jpg',
    stats: { goals: 3, assists: 0, matches: 30, minutes: 2600, yellowCards: 9, redCards: 1 },
    marketValue: 900000,
  },
  {
    name: 'Fabián Hormazábal',
    slug: 'fabian-hormazabal',
    position: 'Lateral Derecho',
    team: "O'Higgins",
    nationality: 'Chile',
    age: 28,
    height: 176,
    weight: 70,
    imageUrl: '/images/players/fabian-hormazabal.jpg',
    stats: { goals: 2, assists: 5, matches: 28, minutes: 2300, yellowCards: 6, redCards: 0 },
    marketValue: 800000,
  },
  {
    name: 'Yonathan Andía',
    slug: 'yonathan-andia',
    position: 'Lateral Izquierdo',
    team: 'Universidad de Chile',
    nationality: 'Chile',
    age: 31,
    height: 177,
    weight: 72,
    imageUrl: '/images/players/yonathan-andia.jpg',
    stats: { goals: 0, assists: 3, matches: 27, minutes: 2200, yellowCards: 5, redCards: 0 },
    marketValue: 600000,
  },
];

// ============================================================================
// DATOS: NOTICIAS (Generadas dinámicamente con categorías)
// ============================================================================

function generateNewsData(categoryMap: Map<string, string>): InsertNews[] {
  const news: InsertNews[] = [];
  const now = new Date();

  // Helper para crear slug
  const slugify = (text: string) =>
    text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\-]+/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 100);

  // Helper para fecha
  const dateOffset = (days: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() - days);
    return d;
  };

  // NOTICIAS LA ROJA (10)
  const laRojaId = categoryMap.get('la-roja')!;
  news.push(
    {
      title: 'Convocatoria de Gareca: Los 26 jugadores para las Eliminatorias',
      slug: slugify('convocatoria-gareca-26-jugadores-eliminatorias'),
      excerpt: 'Ricardo Gareca dio a conocer la lista de convocados para los próximos partidos de la Roja ante Brasil y Uruguay.',
      content: 'El entrenador argentino de la Selección Chilena, Ricardo Gareca, confirmó los 26 jugadores que representarán a Chile en las próximas fechas FIFA de las Eliminatorias Sudamericanas. La lista incluye sorpresas con la vuelta de jugadores experimentados y el debut de varias promesas juveniles.\n\nEntre los nombres destacados se encuentran Alexis Sánchez, Arturo Vidal, Gary Medel y Claudio Bravo, quienes continúan siendo pilares fundamentales para el combinado nacional.\n\nLos partidos serán de vital importancia para las aspiraciones chilenas de clasificar al próximo Mundial de fútbol.',
      categoryId: laRojaId,
      imageUrl: '/images/news/convocatoria-gareca.jpg',
      views: 15420,
      featured: true,
      publishedAt: dateOffset(1),
    },
    {
      title: 'Alexis Sánchez: "Vamos a dejar todo por la clasificación"',
      slug: slugify('alexis-sanchez-vamos-dejar-todo-clasificacion'),
      excerpt: 'El delantero del Inter habló en conferencia de prensa sobre las expectativas para los próximos partidos.',
      content: 'Alexis Sánchez fue el capitán de la palabra en la conferencia de prensa previa al duelo ante Brasil. El Niño Maravilla expresó su confianza en el grupo y aseguró que el equipo dará el máximo esfuerzo por conseguir los puntos necesarios.\n\n"Sabemos que están en juego puntos muy importantes. Vamos a dejar todo en la cancha por la clasificación al Mundial", declaró con contundencia.\n\nEl delantero también elogió el trabajo de Ricardo Gareca y la integración de los nuevos jugadores al plantel.',
      categoryId: laRojaId,
      imageUrl: '/images/news/alexis-conferencia.jpg',
      views: 12350,
      featured: false,
      publishedAt: dateOffset(2),
    },
    {
      title: 'Chile cayó ante Brasil en Maracaná pero dejó buenas sensaciones',
      slug: slugify('chile-cayo-brasil-maracana-buenas-sensaciones'),
      excerpt: 'La Roja perdió 2-1 en Rio de Janeiro en un partido donde mostró carácter y mejor juego colectivo.',
      content: 'La Selección Chilena cayó por 2-1 ante Brasil en el mítico Estadio Maracaná, pero se retiró con la sensación de haber competido de igual a igual ante una de las mejores selecciones del mundo.\n\nEl gol chileno fue obra de Ben Brereton Díaz, quien aprovechó un error defensivo para empatar momentáneamente el partido.\n\nPese a la derrota, el rendimiento del equipo de Gareca dejó sensaciones positivas para lo que viene.',
      categoryId: laRojaId,
      imageUrl: '/images/news/chile-brasil-maracana.jpg',
      views: 18900,
      featured: true,
      publishedAt: dateOffset(3),
    },
    {
      title: 'Claudio Bravo anuncia su retiro de la Selección tras 18 años',
      slug: slugify('claudio-bravo-anuncia-retiro-seleccion-18-anos'),
      excerpt: 'El capitán histórico de la Roja colgará los guantes internacionales después de la Copa América 2024.',
      content: 'Claudio Bravo confirmó en rueda de prensa que la próxima Copa América será su último torneo con la camiseta de La Roja. Tras 18 años de servicio y más de 140 partidos internacionales, el portero del Betis decidió dar un paso al costado.\n\n"Ha sido el honor más grande de mi carrera defender a Chile. Agradezco a todos los que me apoyaron en este camino", expresó visiblemente emocionado.\n\nBravo deja un legado imborrable con las dos Copa América conquistadas en 2015 y 2016.',
      categoryId: laRojaId,
      imageUrl: '/images/news/bravo-retiro.jpg',
      views: 25600,
      featured: true,
      publishedAt: dateOffset(5),
    },
    {
      title: 'El once ideal histórico de la Generación Dorada según los fanáticos',
      slug: slugify('once-ideal-historico-generacion-dorada-fanaticos'),
      excerpt: 'Encuesta reveló el equipo soñado con los mejores jugadores de la época dorada del fútbol chileno.',
      content: 'Una encuesta masiva realizada entre los hinchas de la Roja determinó cuál sería el once ideal de la histórica Generación Dorada del fútbol chileno.\n\nEl equipo elegido incluye a Claudio Bravo en el arco; Gary Medel, Gonzalo Jara, Gary Caldwell en defensa; Marcelo Díaz, Arturo Vidal, Charles Aránguiz en el mediocampo; y Alexis Sánchez, Eduardo Vargas, Jorge Valdíva y Humberto Suazo en ataque.\n\nEsta generación logró los títulos más importantes de la historia del país sudamericano.',
      categoryId: laRojaId,
      imageUrl: '/images/news/once-ideal-dorada.jpg',
      views: 11200,
      featured: false,
      publishedAt: dateOffset(7),
    },
    {
      title: 'Gareca probó nueva formación en el entrenamiento de hoy',
      slug: slugify('gareca-probo-nueva-formacion-entrenamiento-hoy'),
      excerpt: 'El técnico argentino ensayó un esquema ofensivo con tres delanteros ante la ausencia de jugadores clave.',
      content: 'Ricardo Gareca sorprendió en el entrenamiento matutino al probar una nueva formación táctica. El Tigre ensayó un esquema 4-3-3 con tres delanteros puros, buscando mayor presencia ofensiva para los próximos compromisos.\n\nLa novedad fue la inclusión de Ben Brereton Díaz, Alexis Sánchez y Alexander Aravena como tridente ofensivo.\n\n"Estamos buscando alternativas para generar más peligro", comentó uno de los asistentes técnicos.',
      categoryId: laRojaId,
      imageUrl: '/images/news/gareca-entrenamiento.jpg',
      views: 8900,
      featured: false,
      publishedAt: dateOffset(8),
    },
    {
      title: 'Inaugurarán estatua de la Generación Dorada en el Estadio Nacional',
      slug: slugify('inauguran-estatua-generacion-dorada-estadio-nacional'),
      excerpt: 'La escultura homenajeará a los campeones de América de 2015 y 2016.',
      content: 'La Municipalidad de Ñuñoa anunció la inauguración de una estatua dedicada a la Generación Dorada de la Selección Chilena. La obra se emplazará en los alrededores del Estadio Nacional y será develada el próximo mes.\n\nLa escultura representará a los jugadores históricos que conquistaron las dos Copas América consecutivas.\n\n"Es un merecido reconocimiento para quienes nos dieron las alegrías más grandes", declaró la alcaldesa.',
      categoryId: laRojaId,
      imageUrl: '/images/news/estatua-dorada.jpg',
      views: 14500,
      featured: false,
      publishedAt: dateOffset(10),
    },
    {
      title: 'Chile Sub-20 se prepara para el Sudamericano de Venezuela',
      slug: slugify('chile-sub-20-prepara-sudamericano-venezuela'),
      excerpt: 'La selección juvenil intensifica su preparación en Santiago antes de viajar al torneo continental.',
      content: 'La Roja Sub-20 cumple su última semana de preparación en Santiago antes de viajar a Venezuela para disputar el Campeonato Sudamericano de la categoría.\n\nEl director técnico tiene prácticamente definido el equipo titular, con varios jugadores que ya debutaron en primera división.\n\nEl torneo otorgará cupos para el Mundial Sub-20 de la FIFA, por lo que la presión es máxima para el combinado nacional.',
      categoryId: laRojaId,
      imageUrl: '/images/news/sub20-entrenamiento.jpg',
      views: 7600,
      featured: false,
      publishedAt: dateOffset(12),
    },
    {
      title: 'Vidal: "La Roja necesita sangre nueva pero con experiencia"',
      slug: slugify('vidal-roja-necesita-sangre-nueva-experiencia'),
      excerpt: 'El King habló sobre el proceso de renovación que vive la selección nacional.',
      content: 'Arturo Vidal analizó el momento actual de la Selección Chilena en una extensa entrevista. El King aseguró que el equipo necesita incorporar jugadores jóvenes pero manteniendo la base experimentada.\n\n"La mezcla es importante. Los jóvenes vienen con todo pero necesitan guía", expresó el mediocampista de Colo-Colo.\n\nVidal también se refirió a su futuro en la selección, indicando que quiere seguir aportando mientras esté físicamente bien.',
      categoryId: laRojaId,
      imageUrl: '/images/news/vidal-entrevista.jpg',
      views: 13400,
      featured: false,
      publishedAt: dateOffset(14),
    },
    {
      title: 'Fixture confirmado: Chile debutará contra Argentina en el Monumental',
      slug: slugify('fixture-chile-debuta-argentina-monumental'),
      excerpt: 'La CONMEBOL confirmó el calendario completo de las próximas Eliminatorias.',
      content: 'La CONMEBOL confirmó oficialmente el fixture de las próximas fechas de las Eliminatorias Sudamericanas. Chile debutará visitando a Argentina en el Estadio Monumental de Buenos Aires.\n\nEl partido será el primer examen de fuego para Ricardo Gareca, quien buscará romper la racha negativa de visita ante el campeón mundial.\n\nLos boletos para el encuentro ya están a la venta para los hinchas chilenos que quieran acompañar al equipo.',
      categoryId: laRojaId,
      imageUrl: '/images/news/fixture-eliminatorias.jpg',
      views: 16700,
      featured: true,
      publishedAt: dateOffset(15),
    }
  );

  // NOTICIAS EXTRANJERO (10)
  const extranjeroId = categoryMap.get('extranjero')!;
  news.push(
    {
      title: 'Alexis Sánchez brilló con gol y asistencia en la Serie A',
      slug: slugify('alexis-brillo-gol-asistencia-serie-a'),
      excerpt: 'El chileno fue figura en la victoria del Inter ante la Juventus por 2-1.',
      content: 'Alexis Sánchez tuvo una noche mágica en el Giuseppe Meazza. El delantero chileno anotó un golazo y dio una asistencia en la victoria del Inter sobre la Juventus por 2-1 en un partidazo de la Serie A.\n\nEl Niño Maravilla fue elegido como la figura del partido y recibió ovación de la afición nerazzurra al ser sustituido.\n\nCon esta actuación, Alexis demuestra que a sus 35 años sigue siendo un jugador de elite en Europa.',
      categoryId: extranjeroId,
      imageUrl: '/images/news/alexis-inter-juventus.jpg',
      views: 22100,
      featured: true,
      publishedAt: dateOffset(2),
    },
    {
      title: 'Erick Pulgar campeón: Flamengo conquistó el Carioca',
      slug: slugify('erick-pulgar-campeon-flamengo-carioca'),
      excerpt: 'El mediocampista chileno levantó su primer título en Brasil con la camiseta del Mengão.',
      content: 'Erick Pulgar celebró su primer campeonato como jugador de Flamengo. El mediocampista chileno fue titular en la final del Campeonato Carioca donde el Mengão se impuso ante su clásico rival.\n\nPulgar fue una pieza clave durante todo el torneo, destacando por su solidez defensiva y su capacidad de distribución.\n\n"Muy feliz por este primer título. Es un club enorme y espero seguir sumando", declaró tras el partido.',
      categoryId: extranjeroId,
      imageUrl: '/images/news/pulgar-campeon.jpg',
      views: 18900,
      featured: false,
      publishedAt: dateOffset(4),
    },
    {
      title: 'Paulo Díaz: Gol clave para mantener a River como puntero',
      slug: slugify('paulo-diaz-gol-clave-river-puntero'),
      excerpt: 'El defensor chileno anotó de cabeza en la victoria del Millonario por 1-0.',
      content: 'Paulo Díaz volvió a demostrar su capacidad goleadora. El defensor central chileno anotó de cabeza el único gol del partido que le dio la victoria a River Plate y mantuvo al equipo como puntero de la Liga Argentina.\n\nEl Coto, como es conocido en Argentina, lleva ya tres goles en la temporada y se ha convertido en un especialista en el juego aéreo ofensivo.\n\n"Siempre trato de aportar en ambas áreas. Contento por el gol y por el triunfo", dijo tras el encuentro.',
      categoryId: extranjeroId,
      imageUrl: '/images/news/diaz-gol-river.jpg',
      views: 15600,
      featured: true,
      publishedAt: dateOffset(6),
    },
    {
      title: 'Ben Brereton Díaz anotó en su debut con la camiseta del Villarreal',
      slug: slugify('brereton-gol-debut-villarreal'),
      excerpt: 'El delantero nacido en Inglaterra marcó en los primeros minutos de su presentación.',
      content: 'Ben Brereton Díaz tuvo un debut soñado con la camiseta del Villarreal. El delantero chileno ingresó desde el banco en el minuto 60 y anotó un gol apenas 10 minutos después para sellar la victoria de su equipo.\n\nEl gol generó euforia en la afición del Submarino Amarillo, que ya lo ha adoptado como uno de sus jugadores favoritos.\n\n"Es un comienzo perfecto. Espero seguir ayudando al equipo", declaró el nacido en Stoke-on-Trent.',
      categoryId: extranjeroId,
      imageUrl: '/images/news/brereton-debut-villarreal.jpg',
      views: 24500,
      featured: true,
      publishedAt: dateOffset(1),
    },
    {
      title: 'Víctor Dávila brilla en México: Doblete en la victoria del América',
      slug: slugify('davila-doblete-america-mexico'),
      excerpt: 'El chileno anotó dos goles y fue elegido figura en la goleada de las Águilas.',
      content: 'Víctor Dávila está en racha en la Liga MX. El mediocampista ofensivo chileno anotó un doblete en la contundente victoria del Club América por 4-1, siendo elegido como la figura indiscutida del partido.\n\nEl Principito, como lo conocen en México, lleva ya 8 goles en el torneo y es uno de los máximos goleadores de su equipo.\n\nLa afición del América coreó su nombre al final del encuentro, reconociendo su gran nivel de juego.',
      categoryId: extranjeroId,
      imageUrl: '/images/news/davila-doblete.jpg',
      views: 19800,
      featured: false,
      publishedAt: dateOffset(3),
    },
    {
      title: 'Darío Osorio anota su primer gol en Europa con el Midtjylland',
      slug: slugify('osorio-primer-gol-europa-midtjylland'),
      excerpt: 'La joya chilena marcó en la victoria de su equipo en la Superliga danesa.',
      content: 'Darío Osorio anotó su primer gol en el fútbol europeo. El joven extremo chileno marcó en la victoria del Midtjylland por 3-1 en la Superliga danesa, celebrando de forma emotiva junto a sus compañeros.\n\nEl gol llegó tras una gran jugada individual donde Osorio dejó atrás a tres defensores antes de definir con precisión.\n\n"Es un sueño cumplido marcar en Europa. Vienen más", prometió el ex Universidad de Chile.',
      categoryId: extranjeroId,
      imageUrl: '/images/news/osorio-gol-dinamarca.jpg',
      views: 17500,
      featured: false,
      publishedAt: dateOffset(5),
    },
    {
      title: 'Marcelino Núñez: Asistencia mágica en el Championship inglés',
      slug: slugify('marcelino-asistencia-magica-championship'),
      excerpt: 'El chileno dio un pase golazo en el empate del Norwich City.',
      content: 'Marcelino Núñez se lució con una asistencia espectacular en el empate del Norwich City. El mediocampista chileno habilitó a su compañero con un pase filtrado de 30 metros que rompió la línea defensiva rival.\n\nLa jugada fue destacada en los noticieros deportivos ingleses como una de las mejores del fin de semana.\n\nNúñez se ha consolidado como titular indiscutido en el equipo canario y sueña con ascender a la Premier League.',
      categoryId: extranjeroId,
      imageUrl: '/images/news/marcelino-asistencia.jpg',
      views: 14200,
      featured: false,
      publishedAt: dateOffset(8),
    },
    {
      title: 'Alexander Aravena: El goleador chileno que enamora a México',
      slug: slugify('aravena-goleador-chileno-mexico'),
      excerpt: 'El delantero lleva 9 goles y es el máximo artillero del Necaxa.',
      content: 'Alexander Aravena se ha convertido en la gran figura del Necaxa. El delantero chileno lleva 9 goles en el torneo y es el máximo artillero de su equipo, siendo fundamental en la remontada del club en la tabla.\n\nLa afición mexicana ya lo apoda como "El Tanque" por su fuerza física y capacidad goleadora.\n\n"Estoy muy agradecido con el club y la gente. Mi objetivo es seguir haciendo goles", comentó el ex Universidad Católica.',
      categoryId: extranjeroId,
      imageUrl: '/images/news/aravena-goleador.jpg',
      views: 16300,
      featured: false,
      publishedAt: dateOffset(10),
    },
    {
      title: 'Gary Medel jugará su última temporada en Europa antes de retirarse',
      slug: slugify('medel-ultima-temporada-europa-retiro'),
      excerpt: 'El Pitbull confirmó que al finalizar la temporada dejará el fútbol de alto rendimiento.',
      content: 'Gary Medel anunció que la presente temporada será su última en el fútbol europeo. El defensor chileno, de 37 años, confirmó que pondrá fin a su exitosa carrera en el Viejo Continente para posiblemente regresar a Chile.\n\nMedel deja atrás más de 15 años en Europa, donde defendió las camisetas de Boca Juniors, Sevilla, Inter de Milán, Barcelona, Besiktas y Bologna.\n\n"Han sido años maravillosos. Ahora quiero disfrutar con mi familia", declaró.',
      categoryId: extranjeroId,
      imageUrl: '/images/news/medel-retiro.jpg',
      views: 28900,
      featured: true,
      publishedAt: dateOffset(12),
    },
    {
      title: 'Charles Aránguiz rechaza ofertas y espera el club ideal',
      slug: slugify('aranguiz-rechaza-ofertas-espera-club'),
      excerpt: 'El Príncipe sigue libre tras finalizar su contrato con el Bayer Leverkusen.',
      content: 'Charles Aránguiz continúa sin equipo tras finalizar su vínculo con el Bayer Leverkusen. El mediocampista chileno ha recibido varias ofertas tanto de Europa como de Sudamérica, pero ninguna ha convencido al jugador.\n\nSegún su representante, Aránguiz busca un proyecto deportivo ambicioso donde pueda seguir compitiendo al más alto nivel.\n\n"Quiere tomar la mejor decisión para su carrera. No tiene prisa", aseguró su agente.',
      categoryId: extranjeroId,
      imageUrl: '/images/news/aranguis-libre.jpg',
      views: 13400,
      featured: false,
      publishedAt: dateOffset(14),
    }
  );

  // NOTICIAS SUB-20 (5)
  const sub20Id = categoryMap.get('sub-20')!;
  news.push(
    {
      title: 'Chile Sub-20 venció a Argentina en amistoso preparatorio',
      slug: slugify('chile-sub20-vencio-argentina-amistoso'),
      excerpt: 'La selección juvenil ganó 2-1 con goles de Zabala y Rojas.',
      content: 'La Roja Sub-20 consiguió una importante victoria ante Argentina en el primer amistoso preparatorio para el Sudamericano. Los goles chilenos fueron obra de Franco Zabala y David Rojas.\n\nEl partido sirvió para que el cuerpo técnico evaluara a los jugadores en puestos clave.\n\n"Contentos con el rendimiento, pero queda mucho por mejorar", indicó el entrenador.',
      categoryId: sub20Id,
      imageUrl: '/images/news/sub20-argentina.jpg',
      views: 8900,
      featured: false,
      publishedAt: dateOffset(5),
    },
    {
      title: 'Tres jugadores de Colo-Colo Sub-20 fueron convocados',
      slug: slugify('tres-colo-colo-sub20-convocados'),
      excerpt: 'Jeyson Rojas, Vicente Pizarro y otro jugador albas sumados al proceso.',
      content: 'El proceso Sub-20 de Chile recibió un importante refuerzo con la convocatoria de tres jugadores de Colo-Colo. Jeyson Rojas, Vicente Pizarro y el portero Sebastián Araya se sumaron a los entrenamientos de la selección.\n\nLos tres jugadores han tenido buenas actuaciones en el torneo de reservas y merecieron el llamado del cuerpo técnico nacional.\n\n"Es un orgullo representar a Chile. Vamos a dejar todo", expresó Rojas.',
      categoryId: sub20Id,
      imageUrl: '/images/news/sub20-colo-colo.jpg',
      views: 7200,
      featured: false,
      publishedAt: dateOffset(8),
    },
    {
      title: 'Sub-20: Categoría con más talento de los últimos años',
      slug: slugify('sub20-categoria-mas-talento-anos'),
      excerpt: 'Los entrenadores destacan la calidad individual de esta generación.',
      content: 'Los entrenadores del fútbol formativo chileno coinciden en que la actual Sub-20 es una de las generaciones con más talento de los últimos años.\n\nJugadores como Darío Osorio, Zidane Yáñez y Jeyson Rojas ya debutaron en primera división y muestran un nivel técnico superior.\n\n"Hay jugadores con condiciones para jugar en Europa", aseguró un scout internacional.',
      categoryId: sub20Id,
      imageUrl: '/images/news/sub20-talento.jpg',
      views: 6500,
      featured: false,
      publishedAt: dateOffset(12),
    },
    {
      title: 'Fixture Sudamericano Sub-20: Chile debuta ante Ecuador',
      slug: slugify('fixture-sudamericano-sub20-chile-ecuador'),
      excerpt: 'El torneo se jugará en Venezuela desde el próximo mes.',
      content: 'La CONMEBOL confirmó el fixture del Sudamericano Sub-20 de Venezuela. Chile debutará ante Ecuador el primer día de competencia.\n\nEl torneo otorgará cuatro cupos directos para el Mundial de la categoría.\n\n"Sabemos la importancia del torneo. Estamos trabajando para llegar de la mejor manera", indicó el DT.',
      categoryId: sub20Id,
      imageUrl: '/images/news/sub20-fixture.jpg',
      views: 8100,
      featured: false,
      publishedAt: dateOffset(15),
    },
    {
      title: 'Sub-20 se concentrará en Santiago antes de viajar a Venezuela',
      slug: slugify('sub20-concentracion-santiago-venezuela'),
      excerpt: 'La selección juvenil tendrá una semana de trabajo intensivo.',
      content: 'La Roja Sub-20 realizará una concentración de una semana en Santiago antes de viajar a Venezuela para el Sudamericano.\n\nDurante estos días, el cuerpo técnico definirá los 23 jugadores que representarán a Chile en el torneo.\n\n"Son días importantes para tomar decisiones. Hay muy buen nivel", comentó el entrenador.',
      categoryId: sub20Id,
      imageUrl: '/images/news/sub20-concentracion.jpg',
      views: 5800,
      featured: false,
      publishedAt: dateOffset(18),
    }
  );

  // NOTICIAS SUB-18, SUB-17, SUB-16, SUB-15 (5 cada una)
  const sub18Id = categoryMap.get('sub-18')!;
  news.push(
    {
      title: 'Sub-18: Chile clasificó al Sudamericano de la categoría',
      slug: slugify('sub18-chile-clasifico-sudamericano'),
      excerpt: 'La selección juvenil logró su cupo tras imponerse en el hexagonal.',
      content: 'Chile Sub-18 logró su clasificación al Sudamericano de la categoría tras imponerse en el hexagonal final del torneo clasificatorio.\n\nLos dirigidos por Héctor Robles mostraron un gran nivel colectivo durante toda la competencia.\n\n"Merecido premio para los chicos que trabajaron muy duro", declaró el entrenador.',
      categoryId: sub18Id,
      imageUrl: '/images/news/sub18-clasificacion.jpg',
      views: 6200,
      featured: false,
      publishedAt: dateOffset(7),
    },
    {
      title: 'Proceso Sub-18: Seis jugadores de la UC fueron citados',
      slug: slugify('sub18-seis-jugadores-uc-citados'),
      excerpt: 'La Universidad Católica aporta la mayoría de jugadores a la selección.',
      content: 'El proceso Sub-18 de Chile contará con seis jugadores de Universidad Católica para los próximos microciclos.\n\nLa escuela cruzada sigue demostrando su capacidad formativa al aportar la mayor cantidad de jugadores a la selección nacional.\n\n"La UC tiene una metodología excepcional", destacó el director técnico de la selección.',
      categoryId: sub18Id,
      imageUrl: '/images/news/sub18-uc.jpg',
      views: 5400,
      featured: false,
      publishedAt: dateOffset(10),
    },
    {
      title: 'Sub-18 empató con Paraguay en amistoso internacional',
      slug: slugify('sub18-empato-paraguay-amistoso'),
      excerpt: 'El partido terminó 1-1 con gol de Vicencio.',
      content: 'La Roja Sub-18 empató 1-1 con Paraguay en amistoso disputado en el Centro de Entrenamiento de Quilín. El gol chileno fue obra de Benjamín Vicencio.\n\nEl partido sirvió para que el cuerpo técnico probara variantes tácticas y nuevos jugadores.\n\n"Buen nivel de los chicos contra un rival complicado", evaluó el DT.',
      categoryId: sub18Id,
      imageUrl: '/images/news/sub18-paraguay.jpg',
      views: 4800,
      featured: false,
      publishedAt: dateOffset(14),
    },
    {
      title: 'Promesas Sub-18: Los jugadores a seguir de cerca',
      slug: slugify('promesas-sub18-jugadores-seguir'),
      excerpt: 'Análisis de los talentos que podrían dar el salto a primera división.',
      content: 'El fútbol formativo chileno tiene varias promesas en la categoría Sub-18. Jugadores como Bruno Soto, Benjamín Vicencio y Martín Ampuero destacan por su técnica y capacidad de juego.\n\nVarios de ellos ya entrenan con la primera división de sus clubes y podrían debutar pronto.\n\n"Hay talento de sobra, hay que saberlo cuidar", aseguró un entrenador de proyección.',
      categoryId: sub18Id,
      imageUrl: '/images/news/sub18-promesas.jpg',
      views: 7100,
      featured: false,
      publishedAt: dateOffset(16),
    },
    {
      title: 'Sub-18 intensifica preparación para el Sudamericano de Colombia',
      slug: slugify('sub18-intensifica-preparacion-sudamericano-colombia'),
      excerpt: 'La selección tendrá dos microciclos antes del torneo continental.',
      content: 'Chile Sub-18 intensifica su preparación de cara al Sudamericano de Colombia. El equipo tendrá dos microciclos de entrenamiento antes de viajar al torneo.\n\nEl objetivo es clasificar al Mundial Sub-20 del próximo año.\n\n"Estamos armando un grupo competitivo", indicó el entrenador.',
      categoryId: sub18Id,
      imageUrl: '/images/news/sub18-entrenamiento.jpg',
      views: 5200,
      featured: false,
      publishedAt: dateOffset(19),
    }
  );

  const sub17Id = categoryMap.get('sub-17')!;
  news.push(
    {
      title: 'Chile Sub-17 debuta en el Sudamericano ante Brasil',
      slug: slugify('chile-sub17-debuta-sudamericano-brasil'),
      excerpt: 'El torneo se disputa en Ecuador y Chile busca el cupo al Mundial.',
      content: 'Chile Sub-17 debutará en el Sudamericano de Ecuador enfrentando a Brasil. El partido será clave para las aspiraciones de la Roja en el torneo.\n\nEl equipo llega con buenas sensaciones tras los amistosos preparatorios.\n\n"Sabemos que Brasil es favorito, pero vamos a competir", aseguró el capitán.',
      categoryId: sub17Id,
      imageUrl: '/images/news/sub17-brasil.jpg',
      views: 6800,
      featured: false,
      publishedAt: dateOffset(4),
    },
    {
      title: 'Sub-17: Convocados de Colo-Colo y la U dominan la lista',
      slug: slugify('sub17-convocados-colo-colo-u-dominan'),
      excerpt: 'Los tradicionales clubes aportan la mayoría de jugadores.',
      content: 'La lista de convocados de Chile Sub-17 está dominada por jugadores de Colo-Colo y Universidad de Chile. Los dos clubes aportan 14 de los 23 jugadores seleccionados.\n\nEsto demuestra el trabajo formativo de ambas instituciones en las categorías menores.\n\n"Los clubes están haciendo un gran trabajo", destacó el DT nacional.',
      categoryId: sub17Id,
      imageUrl: '/images/news/sub17-convocados.jpg',
      views: 5900,
      featured: false,
      publishedAt: dateOffset(9),
    },
    {
      title: 'La joya de 15 años que ilusiona a la Sub-17',
      slug: slugify('joya-15-anos-ilusiona-sub17'),
      excerpt: 'Matías Fernández, medio delantero de O\'Higgins, destaca en el proceso.',
      content: 'Matías Fernández es la gran promesa de la Sub-17 de Chile. Con apenas 15 años, el mediocampista ofensivo de O\'Higgins ya entrena con la selección mayor de su categoría.\n\nSu técnica, visión de juego y capacidad goleadora lo han hecho destacar en el proceso formativo.\n\n"Tiene condiciones especiales. Hay que cuidarlo", recomiendan los entrenadores.',
      categoryId: sub17Id,
      imageUrl: '/images/news/sub17-joya.jpg',
      views: 8200,
      featured: false,
      publishedAt: dateOffset(13),
    },
    {
      title: 'Sub-17: Reunión técnica define estrategia para el Sudamericano',
      slug: slugify('sub17-reunion-tecnica-estrategia-sudamericano'),
      excerpt: 'El cuerpo técnico analizó rivales y definió el sistema de juego.',
      content: 'El cuerpo técnico de Chile Sub-17 realizó una extensa reunión para definir la estrategia del Sudamericano. Se analizaron los rivales del grupo y se definió el sistema de juego.\n\nSe optó por un 4-3-3 ofensivo que aproveche la velocidad de los extremos.\n\n"Tenemos jugadores para un juego audaz", comentó el entrenador.',
      categoryId: sub17Id,
      imageUrl: '/images/news/sub17-reunion.jpg',
      views: 4500,
      featured: false,
      publishedAt: dateOffset(17),
    },
    {
      title: 'Goleador Sub-17: Martín Arroyo lleva 15 goles en el torneo',
      slug: slugify('goleador-sub17-martin-arroyo-15-goles'),
      excerpt: 'El delantero de Universidad de Chile es el máximo artillero del proceso.',
      content: 'Martín Arroyo es el goleador de la Sub-17 chilena. El delantero de Universidad de Chile lleva 15 goles en el torneo formativo y es el máximo artillero del proceso.\n\nSu capacidad goleadora lo ha hecho destacar y ya despierta el interés de clubes extranjeros.\n\n"Sueño con ser como Marcelo Salas", confesó el joven goleador.',
      categoryId: sub17Id,
      imageUrl: '/images/news/sub17-goleador.jpg',
      views: 7600,
      featured: false,
      publishedAt: dateOffset(20),
    }
  );

  const sub16Id = categoryMap.get('sub-16')!;
  news.push(
    {
      title: 'Chile Sub-16 campeón del cuadrangular internacional',
      slug: slugify('chile-sub16-campeon-cuadrangular'),
      excerpt: 'La selección juvenil ganó el torneo tras vencer a Uruguay en la final.',
      content: 'Chile Sub-16 se consagró campeón del cuadrangular internacional tras vencer 2-1 a Uruguay en la final. Los goles fueron obra de Diego Carreño y Benjamín Osses.\n\nEl torneo sirvió como preparación para el Sudamericano de la categoría.\n\n"Un premio al trabajo de los chicos", celebró el entrenador.',
      categoryId: sub16Id,
      imageUrl: '/images/news/sub16-campeon.jpg',
      views: 6100,
      featured: false,
      publishedAt: dateOffset(6),
    },
    {
      title: 'Sub-16: Convocatoria para microciclo en Quilín',
      slug: slugify('sub16-convocatoria-microciclo-quilin'),
      excerpt: '30 jugadores fueron citados para los entrenamientos.',
      content: 'La ANFP confirmó la convocatoria de 30 jugadores al microciclo de la Sub-16. Los entrenamientos se realizarán en el Centro de Entrenamiento de Quilín.\n\nEl objetivo es ir definiendo el grupo que participará en el Sudamericano.\n\n"Es una etapa importante de observación", indicó el coordinador.',
      categoryId: sub16Id,
      imageUrl: '/images/news/sub16-convocatoria.jpg',
      views: 4800,
      featured: false,
      publishedAt: dateOffset(11),
    },
    {
      title: 'Proceso Sub-16: Los jugadores más destacados del año',
      slug: slugify('sub16-jugadores-destacados-anio'),
      excerpt: 'Análisis de los mejores futbolistas de la categoría.',
      content: 'El año deportivo de la Sub-16 dejó varios jugadores destacados. Diego Carreño, Benjamín Osses y Tomás Guzmán fueron los más sobresalientes durante el proceso.\n\nLos tres jugadores ya entrenan con categorías superiores en sus clubes.\n\n"Son chicos con proyección importante", destacan los formadores.',
      categoryId: sub16Id,
      imageUrl: '/images/news/sub16-destacados.jpg',
      views: 5500,
      featured: false,
      publishedAt: dateOffset(15),
    },
    {
      title: 'Sub-16: Triunfo ante Perú en amistoso de preparación',
      slug: slugify('sub16-triunfo-peru-amistoso'),
      excerpt: 'Chile ganó 3-0 con goles de Carreño, Osses y Guzmán.',
      content: 'Chile Sub-16 derrotó 3-0 a Perú en amistoso disputado en Lima. Los goles fueron obra de Diego Carreño, Benjamín Osses y Tomás Guzmán.\n\nEl partido fue parte de la gira preparatoria para el Sudamericano.\n\n"Buen rendimiento colectivo", evaluó el DT.',
      categoryId: sub16Id,
      imageUrl: '/images/news/sub16-peru.jpg',
      views: 4200,
      featured: false,
      publishedAt: dateOffset(18),
    },
    {
      title: 'Nuevos entrenadores para las selecciones Sub-15 y Sub-16',
      slug: slugify('nuevos-entrenadores-sub15-sub16'),
      excerpt: 'La ANFP confirmó los cuerpos técnicos para los procesos juveniles.',
      content: 'La ANFP confirmó los nuevos entrenadores para las selecciones Sub-15 y Sub-16. Ambos procesos tendrán cuerpos técnicos renovados para los próximos Sudamericanos.\n\nLos nuevos entrenadores ya trabajan en la observación de jugadores a nivel nacional.\n\n"Queremos renovar las metodologías", indicó el gerente de selecciones.',
      categoryId: sub16Id,
      imageUrl: '/images/news/sub16-entrenadores.jpg',
      views: 3800,
      featured: false,
      publishedAt: dateOffset(21),
    }
  );

  const sub15Id = categoryMap.get('sub-15')!;
  news.push(
    {
      title: 'Chile Sub-15 clasificó al Sudamericano de Paraguay',
      slug: slugify('chile-sub15-clasifico-sudamericano-paraguay'),
      excerpt: 'La selección juvenil logró su cupo tras el hexagonal clasificatorio.',
      content: 'Chile Sub-15 logró su clasificación al Sudamericano de Paraguay tras imponerse en el hexagonal clasificatorio. El equipo mostró un gran nivel futbolístico durante toda la competencia.\n\nLa Roja ganó 4 de sus 5 partidos y fue el mejor equipo del torneo.\n\n"Merecido premio para estos chicos", celebró el entrenador.',
      categoryId: sub15Id,
      imageUrl: '/images/news/sub15-clasificacion.jpg',
      views: 5300,
      featured: false,
      publishedAt: dateOffset(8),
    },
    {
      title: 'Sub-15: La joyita de 13 años que deslumbra a todos',
      slug: slugify('sub15-joyita-13-anos-deslumbra'),
      excerpt: 'Nicolás Fernández, extremo de Cobreloa, ya es seguido por clubes grandes.',
      content: 'Nicolás Fernández es la gran sensación de la Sub-15. Con apenas 13 años, el extremo de Cobreloa deslumbra por su velocidad y desequilibrio individual.\n\nVarios clubes grandes ya preguntaron por su situación contractual.\n\n"Es un fenómeno. Hay que cuidarlo mucho", advierten los formadores.',
      categoryId: sub15Id,
      imageUrl: '/images/news/sub15-joyita.jpg',
      views: 7800,
      featured: false,
      publishedAt: dateOffset(12),
    },
    {
      title: 'Sub-15: Trabajo de captación en regiones da frutos',
      slug: slugify('sub15-captacion-regiones-frutos'),
      excerpt: 'Nuevos jugadores de regiones se suman al proceso nacional.',
      content: 'El trabajo de captación de la ANFP en regiones está dando frutos para la Sub-15. Jugadores de Arica, Concepción, Temuco y Puerto Montt se sumaron al proceso nacional.\n\nEsto demuestra que el talento está en todo el país.\n\n"Hay que mirar a Chile entero", enfatizó el coordinador de captación.',
      categoryId: sub15Id,
      imageUrl: '/images/news/sub15-regiones.jpg',
      views: 4100,
      featured: false,
      publishedAt: dateOffset(16),
    },
    {
      title: 'Sub-15: Amistoso ante Universidad Católica Sub-17',
      slug: slugify('sub15-amistoso-uc-sub17'),
      excerpt: 'Chile cayó 2-1 pero dejó buenas sensaciones ante mayores.',
      content: 'Chile Sub-15 enfrentó a Universidad Católica Sub-17 en amistoso preparatorio. A pesar de caer 2-1, el equipo mostró buen nivel ante rivales de mayor edad.\n\n"Compitieron de igual a igual con chicos más grandes", valoró el cuerpo técnico.',
      categoryId: sub15Id,
      imageUrl: '/images/news/sub15-uc.jpg',
      views: 3600,
      featured: false,
      publishedAt: dateOffset(19),
    },
    {
      title: 'Sub-15 intensifica preparación física para el Sudamericano',
      slug: slugify('sub15-intensifica-preparacion-fisica'),
      excerpt: 'Los jugadores duplican las sesiones de entrenamiento.',
      content: 'Chile Sub-15 intensificó su preparación física de cara al Sudamericano de Paraguay. Los jugadores duplican las sesiones de entrenamiento durante los microciclos.\n\nEl objetivo es llegar en la mejor condición posible al torneo.\n\n"La base física es fundamental a esta edad", explicó el preparador.',
      categoryId: sub15Id,
      imageUrl: '/images/news/sub15-fisico.jpg',
      views: 3200,
      featured: false,
      publishedAt: dateOffset(22),
    }
  );

  // ENTREVISTAS (5)
  const entrevistasId = categoryMap.get('entrevistas')!;
  news.push(
    {
      title: 'Exclusiva: Alexis Sánchez habla de su futuro y la Roja',
      slug: slugify('exclusiva-alexis-sanchez-futuro-roja'),
      excerpt: 'El Niño Maravilla abre su corazón en entrevista única con FCH Noticias.',
      content: 'En una extensa entrevista exclusiva para FCH Noticias, Alexis Sánchez habló de todo: su futuro en el Inter, su presente en la selección y sus sueños pendientes.\n\n"Mi ilusión es jugar un Mundial con Chile. Sé que será difícil pero no imposible", confesó el delantero.\n\nTambién se refirió a su relación con Arturo Vidal y los recuerdos de la Generación Dorada.',
      categoryId: entrevistasId,
      imageUrl: '/images/news/entrevista-alexis.jpg',
      views: 32100,
      featured: true,
      publishedAt: dateOffset(3),
    },
    {
      title: 'Entrevista: Arturo Vidal y sus confesiones más sinceras',
      slug: slugify('entrevista-arturo-vidal-confesiones'),
      excerpt: 'El King se sincera sobre su carrera, polémicas y el amor por Colo-Colo.',
      content: 'Arturo Vidal no se guardó nada en esta entrevista exclusiva. El King habló de sus polémicas, sus títulos, su paso por Europa y su regreso a Colo-Colo.\n\n"Siempre soñé con volver al Cacique. Aquí estoy para ganar todo", aseguró.\n\nTambién reveló anécdotas inéditas de la Generación Dorada y su relación con Sampaoli.',
      categoryId: entrevistasId,
      imageUrl: '/images/news/entrevista-vidal.jpg',
      views: 28500,
      featured: true,
      publishedAt: dateOffset(7),
    },
    {
      title: 'Entrevista: Gary Medel reflexiona sobre su carrera',
      slug: slugify('entrevista-gary-medel-reflexiona-carrera'),
      excerpt: 'El Pitbull hace balance de sus años en Europa y sus objetivos pendientes.',
      content: 'Gary Medel hizo un profundo balance de su carrera en esta entrevista exclusiva. El Pitbull repasó sus años en Sevilla, Inter, Barcelona y Bologna.\n\n"Han sido 15 años increíbles. Ahora quiero cerrar mi carrera de la mejor manera", dijo.\n\nTambién habló de su deseo de ser entrenador cuando cuelgue los botines.',
      categoryId: entrevistasId,
      imageUrl: '/images/news/entrevista-medel.jpg',
      views: 19200,
      featured: false,
      publishedAt: dateOffset(11),
    },
    {
      title: 'Entrevista: Darío Osorio y sus sueños en Europa',
      slug: slugify('entrevista-dario-osorio-suenos-europa'),
      excerpt: 'La joya chilena habla de su adaptación a Dinamarca y sus metas.',
      content: 'Darío Osorio conversó en exclusiva sobre su nueva vida en Dinamarca. El joven extremo cuenta cómo fue su adaptación al Midtjylland y sus objetivos en Europa.\n\n"Mi sueño es jugar en las grandes ligas. Paso a paso, estoy aprendiendo", expresó.\n\nTambién envió un mensaje a los jóvenes futbolistas que sueñan con emigrar.',
      categoryId: entrevistasId,
      imageUrl: '/images/news/entrevista-osorio.jpg',
      views: 15600,
      featured: false,
      publishedAt: dateOffset(15),
    },
    {
      title: 'Entrevista: Eduardo Vargas y su vuelta a la U',
      slug: slugify('entrevista-eduardo-vargas-vuelta-u'),
      excerpt: 'El Turquito habla de su regreso a Universidad de Chile y sus objetivos.',
      content: 'Eduardo Vargas se sinceró sobre su regreso a Universidad de Chile. El Turquito contó por qué eligió volver al club que lo vio nacer como futbolista.\n\n"Siempre quise volver a la U. Es mi casa", afirmó emocionado.\n\nTambién habló de sus objetivos: ganar el torneo nacional y volver a la selección.',
      categoryId: entrevistasId,
      imageUrl: '/images/news/entrevista-vargas.jpg',
      views: 21800,
      featured: false,
      publishedAt: dateOffset(18),
    }
  );

  // MERCADO DE PASES (5)
  const mercadoId = categoryMap.get('mercado-de-pases')!;
  news.push(
    {
      title: 'Bombazo: ¿Vidal vuelve a Europa? Inter sondeó su situación',
      slug: slugify('bombazo-vidal-vuelta-europa-inter'),
      excerpt: 'El Inter de Milán habría consultado por el King para la próxima temporada.',
      content: 'Bomba en el mercado de pases: según fuentes cercanas al jugador, el Inter de Milán habría sondeado la situación de Arturo Vidal.\n\nEl King podría regresar a Europa seis meses después de volver a Colo-Colo.\n\n"Por ahora está concentrado en el Cacique, pero escucha ofertas", indicó su representante.',
      categoryId: mercadoId,
      imageUrl: '/images/news/mercado-vidal-inter.jpg',
      views: 45200,
      featured: true,
      publishedAt: dateOffset(1),
    },
    {
      title: 'Exclusivo: Charles Aránguiz tiene oferta de la MLS',
      slug: slugify('exclusivo-aranguez-oferta-mls'),
      excerpt: 'Inter Miami y LA Galaxy pelean por el fichaje del Príncipe.',
      content: 'Charles Aránguiz tiene una oferta formal de la MLS. Según pudo saber FCH Noticias, Inter Miami y LA Galaxy están interesados en contratar al mediocampista chileno.\n\nLa oferta del equipo de Los Ángeles sería más económica, pero Miami ofrece jugar junto a Messi.\n\n"Está evaluando todas las opciones", confirmó su agente.',
      categoryId: mercadoId,
      imageUrl: '/images/news/mercado-aranguez-mls.jpg',
      views: 38500,
      featured: true,
      publishedAt: dateOffset(4),
    },
    {
      title: 'Colo-Colo quiere a Bruno Barticciotto',
      slug: slugify('colo-colo-quiere-barticciotto'),
      excerpt: 'El Cacique inició negociaciones con Talleres por el delantero.',
      content: 'Colo-Colo quiere reforzar su ataque con Bruno Barticciotto. El Cacique inició negociaciones formales con Talleres de Argentina para fichar al delantero chileno.\n\nLa operación podría rondar los 3 millones de dólares.\n\n"Es un delantero que nos interesa mucho", admitió la dirigencia alba.',
      categoryId: mercadoId,
      imageUrl: '/images/news/mercado-barticciotto.jpg',
      views: 29800,
      featured: false,
      publishedAt: dateOffset(6),
    },
    {
      title: 'Flamengo rechazó oferta por Erick Pulgar',
      slug: slugify('flamengo-rechazo-oferta-pulgar'),
      excerpt: 'El club brasileño no quiere vender al mediocampista chileno.',
      content: 'Flamengo rechazó una oferta formal por Erick Pulgar. Un club de Arabia Saudita habría ofrecido 8 millones de dólares por el 50% del pase del chileno.\n\nLa dirigencia del Mengão considera que Pulgar es pieza clave y no lo quiere vender.\n\n"Erick es fundamental para nuestro proyecto", indicaron desde el club.',
      categoryId: mercadoId,
      imageUrl: '/images/news/mercado-pulgar.jpg',
      views: 24300,
      featured: false,
      publishedAt: dateOffset(9),
    },
    {
      title: 'River Plate acelera por una renovación de Paulo Díaz',
      slug: slugify('river-acelera-renovacion-paulo-diaz'),
      excerpt: 'El club argentino quiere extender el contrato del defensor chileno.',
      content: 'River Plate aceleró las negociaciones para renovar a Paulo Díaz. El club argentino quiere extender el contrato del defensor chileno hasta 2027.\n\nLa propuesta incluye una mejora sustancial en su salario actual.\n\n"Estoy muy contento en River. Quiero seguir", expresó el Coto.',
      categoryId: mercadoId,
      imageUrl: '/images/news/mercado-paulo-diaz.jpg',
      views: 21200,
      featured: false,
      publishedAt: dateOffset(13),
    }
  );

  return news;
}

// ============================================================================
// FUNCIONES AUXILIARES
// ============================================================================

/**
 * Genera datos de transferencias basados en los jugadores
 */
function generateTransfersData(
  playerMap: Map<string, string>
): InsertTransfer[] {
  const transfers: InsertTransfer[] = [];

  const transferData = [
    { playerSlug: 'arturo-vidal', fromTeam: 'Flamengo', toTeam: 'Colo-Colo', fee: 'Libre', type: 'free', status: 'confirmed' },
    { playerSlug: 'eduardo-vargas', fromTeam: 'Atlético Mineiro', toTeam: 'Universidad de Chile', fee: 'Libre', type: 'free', status: 'confirmed' },
    { playerSlug: 'erick-pulgar', fromTeam: 'Fiorentina', toTeam: 'Flamengo', fee: '€3M', type: 'transfer', status: 'confirmed' },
    { playerSlug: 'paulo-diaz', fromTeam: 'San Lorenzo', toTeam: 'River Plate', fee: '€4M', type: 'transfer', status: 'confirmed' },
    { playerSlug: 'ben-brereton-diaz', fromTeam: 'Nottingham Forest', toTeam: 'Villarreal', fee: '€8M', type: 'transfer', status: 'confirmed' },
    { playerSlug: 'victor-davila', fromTeam: 'CSKA Moscú', toTeam: 'Club América', fee: '€5M', type: 'transfer', status: 'confirmed' },
    { playerSlug: 'dario-osorio', fromTeam: 'Universidad de Chile', toTeam: 'Midtjylland', fee: '€6M', type: 'transfer', status: 'confirmed' },
    { playerSlug: 'marcelino-nunez', fromTeam: 'Universidad Católica', toTeam: 'Norwich City', fee: '€4M', type: 'transfer', status: 'confirmed' },
    { playerSlug: 'alexander-aravena', fromTeam: 'Universidad Católica', toTeam: 'Necaxa', fee: '€3M', type: 'transfer', status: 'confirmed' },
    { playerSlug: 'bruno-barticciotto', fromTeam: 'Palestino', toTeam: 'Talleres', fee: '€2M', type: 'transfer', status: 'confirmed' },
    { playerSlug: 'charles-aranguez', fromTeam: 'Bayer Leverkusen', toTeam: 'Libre', fee: 'Libre', type: 'free', status: 'confirmed' },
    { playerSlug: 'matias-zaldivia', fromTeam: 'Colo-Colo', toTeam: 'Universidad de Chile', fee: 'Libre', type: 'free', status: 'confirmed' },
  ];

  for (const t of transferData) {
    const playerId = playerMap.get(t.playerSlug);
    if (playerId) {
      transfers.push({
        playerId,
        fromTeam: t.fromTeam,
        toTeam: t.toTeam,
        fee: t.fee,
        type: t.type as 'transfer' | 'loan' | 'free',
        status: t.status as 'confirmed' | 'rumor',
        date: new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)),
      });
    }
  }

  // Agregar transferencias como rumores
  const rumors = [
    { playerSlug: 'alexis-sanchez', toTeam: 'Colo-Colo', fee: 'Libre' },
    { playerSlug: 'maximiliano-guerrero', toTeam: 'Atlas', fee: '€2M' },
    { playerSlug: 'jeyson-rojas', toTeam: 'Betis', fee: '€5M' },
  ];

  for (const r of rumors) {
    const playerId = playerMap.get(r.playerSlug);
    if (playerId) {
      transfers.push({
        playerId,
        fromTeam: 'Club actual',
        toTeam: r.toTeam,
        fee: r.fee,
        type: 'transfer',
        status: 'rumor',
        date: new Date(),
      });
    }
  }

  return transfers;
}

// ============================================================================
// FUNCIÓN PRINCIPAL DE SEED
// ============================================================================

/**
 * Ejecuta el seed de la base de datos
 */
export async function seed() {
  console.log('🌱 Iniciando seed de la base de datos...\n');

  try {
    // 1. Insertar categorías
    console.log('📂 Insertando categorías...');
    const insertedCategories = await db
      .insert(categories)
      .values(categoriesData)
      .returning({ id: categories.id, slug: categories.slug });
    
    const categoryMap = new Map(insertedCategories.map(c => [c.slug, c.id]));
    console.log(`   ✅ ${insertedCategories.length} categorías insertadas`);

    // 2. Insertar jugadores
    console.log('⚽ Insertando jugadores...');
    const insertedPlayers = await db
      .insert(players)
      .values(playersData)
      .returning({ id: players.id, slug: players.slug });
    
    const playerMap = new Map(insertedPlayers.map(p => [p.slug, p.id]));
    console.log(`   ✅ ${insertedPlayers.length} jugadores insertados`);

    // 3. Generar e insertar noticias
    console.log('📰 Insertando noticias...');
    const newsData = generateNewsData(categoryMap);
    const insertedNews = await db
      .insert(news)
      .values(newsData)
      .returning({ id: news.id });
    console.log(`   ✅ ${insertedNews.length} noticias insertadas`);

    // 4. Insertar transferencias
    console.log('🔄 Insertando transferencias...');
    const transfersData = generateTransfersData(playerMap);
    const insertedTransfers = await db
      .insert(transfers)
      .values(transfersData)
      .returning({ id: transfers.id });
    console.log(`   ✅ ${insertedTransfers.length} transferencias insertadas`);

    console.log('\n✨ Seed completado exitosamente!');
    console.log('\n📊 Resumen:');
    console.log(`   - Categorías: ${insertedCategories.length}`);
    console.log(`   - Jugadores: ${insertedPlayers.length}`);
    console.log(`   - Noticias: ${insertedNews.length}`);
    console.log(`   - Transferencias: ${insertedTransfers.length}`);

    return {
      categories: insertedCategories.length,
      players: insertedPlayers.length,
      news: insertedNews.length,
      transfers: insertedTransfers.length,
    };
  } catch (error) {
    console.error('\n❌ Error durante el seed:', error);
    throw error;
  }
}

/**
 * Limpia todas las tablas de la base de datos
 */
export async function cleanDatabase() {
  console.log('🧹 Limpiando base de datos...');
  
  try {
    await db.delete(transfers);
    await db.delete(news);
    await db.delete(players);
    await db.delete(categories);
    
    console.log('   ✅ Base de datos limpiada');
  } catch (error) {
    console.error('   ❌ Error limpiando la base de datos:', error);
    throw error;
  }
}

/**
 * Ejecuta seed completo con limpieza previa
 */
export async function resetAndSeed() {
  await cleanDatabase();
  await seed();
}

// ============================================================================
// EJECUCIÓN DIRECTA
// ============================================================================

// Si se ejecuta directamente (node seed.ts o tsx seed.ts)
if (import.meta.url === `file://${process.argv[1]}`) {
  resetAndSeed()
    .then(() => {
      console.log('\n👋 Proceso finalizado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Error fatal:', error);
      process.exit(1);
    });
}
