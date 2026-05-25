// Seed the database with the 20 sample books and 6 readlists from the prototype.
import { pool } from './index.js';

const BOOKS = [
  { id: 'b1',  title: 'Piranesi',                         author: 'Susanna Clarke',    year: 2020, pages: 272,  tags: ['Magical Realism','Quiet','Mystery'],             why: "A lonely man maps the corridors of an infinite house — gentle, eerie, and impossible to forget.", cover: { shape:'split',  bg:'#F4ECD8', ink:'#1A1A1A', accent:'#2849A3' }, rating: 4.6 },
  { id: 'b2',  title: 'Klara and the Sun',                author: 'Kazuo Ishiguro',    year: 2021, pages: 320,  tags: ['Literary','Sci-Fi','Tender'],                    why: "An AI narrator who studies the sun like a religion. Quiet sci-fi about devotion.",               cover: { shape:'circle', bg:'#2849A3', ink:'#F4ECD8', accent:'#F4ECD8' }, rating: 4.4 },
  { id: 'b3',  title: 'Tomorrow & Tomorrow & Tomorrow',   author: 'Gabrielle Zevin',   year: 2022, pages: 416,  tags: ['Friendship','Games','Love'],                     why: "Two game designers spend thirty years not-quite-falling-in-love. Bittersweet and clever.",      cover: { shape:'arrow',  bg:'#C75A3A', ink:'#F4ECD8', accent:'#F4ECD8' }, rating: 4.5 },
  { id: 'b4',  title: 'The Bee Sting',                   author: 'Paul Murray',       year: 2023, pages: 656,  tags: ['Family','Dark Comedy','Irish'],                  why: "A doomed Irish family told from four perspectives that braid into one car-crash finale.",       cover: { shape:'stripe', bg:'#1A1A1A', ink:'#F4ECD8', accent:'#C75A3A' }, rating: 4.3 },
  { id: 'b5',  title: 'Severance',                       author: 'Ling Ma',           year: 2018, pages: 304,  tags: ['Speculative','Office','Pandemic'],               why: "A New York office worker keeps showing up to her cubicle as the city ends. Deadpan apocalypse.", cover: { shape:'dot',    bg:'#1A1A1A', ink:'#F4ECD8', accent:'#2849A3' }, rating: 4.1 },
  { id: 'b6',  title: 'Lincoln in the Bardo',            author: 'George Saunders',   year: 2017, pages: 368,  tags: ['Experimental','Historical','Ghosts'],            why: "Ghosts in a cemetery argue over the body of Lincoln's son. Formally wild, heart-cracking.",    cover: { shape:'wave',   bg:'#DCC9A4', ink:'#1A1A1A', accent:'#2849A3' }, rating: 4.2 },
  { id: 'b7',  title: 'Trust',                           author: 'Hernan Diaz',       year: 2022, pages: 416,  tags: ['Literary','Wall Street','Multi-voice'],          why: "Four nested accounts of a Gilded-Age tycoon, each rewriting the last.",                       cover: { shape:'serif',  bg:'#F4ECD8', ink:'#1A1A1A', accent:'#2849A3' }, rating: 4.0 },
  { id: 'b8',  title: 'The Overstory',                   author: 'Richard Powers',    year: 2018, pages: 512,  tags: ['Nature','Epic','Climate'],                       why: "Nine strangers, one canopy of trees, the slow geology of caring.",                              cover: { shape:'stack',  bg:'#6B7C32', ink:'#F4ECD8', accent:'#F4ECD8' }, rating: 4.4 },
  { id: 'b9',  title: 'Pachinko',                        author: 'Min Jin Lee',       year: 2017, pages: 496,  tags: ['Family Saga','Korean','Historical'],             why: "Four generations of a Korean family in Japan. Patient, sweeping, devastating.",                 cover: { shape:'block',  bg:'#C75A3A', ink:'#F4ECD8', accent:'#1A1A1A' }, rating: 4.5 },
  { id: 'b10', title: 'Open City',                       author: 'Teju Cole',         year: 2011, pages: 272,  tags: ['Walking','Quiet','Essayistic'],                  why: "A psychiatrist drifts through New York thinking about everything and nothing.",                 cover: { shape:'stripe', bg:'#2849A3', ink:'#F4ECD8', accent:'#F4ECD8' }, rating: 4.0 },
  { id: 'b11', title: 'A Visit from the Goon Squad',     author: 'Jennifer Egan',     year: 2010, pages: 352,  tags: ['Music','Linked Stories','Time'],                 why: "Thirteen linked stories about people in the music industry — including one told in PowerPoint.", cover: { shape:'arrow',  bg:'#F4ECD8', ink:'#1A1A1A', accent:'#2849A3' }, rating: 4.1 },
  { id: 'b12', title: 'Bluets',                          author: 'Maggie Nelson',     year: 2009, pages: 112,  tags: ['Essay','Lyric','Blue'],                          why: "240 numbered fragments about the color blue, grief, and obsession. Short. Sharp.",             cover: { shape:'block',  bg:'#2849A3', ink:'#F4ECD8', accent:'#F4ECD8' }, rating: 4.2 },
  { id: 'b13', title: 'Exhalation',                      author: 'Ted Chiang',        year: 2019, pages: 368,  tags: ['Sci-Fi','Stories','Thought-Experiment'],         why: "Nine short stories that each fold open like a perfect math proof.",                            cover: { shape:'wave',   bg:'#F4ECD8', ink:'#1A1A1A', accent:'#2849A3' }, rating: 4.6 },
  { id: 'b14', title: 'A Little Life',                   author: 'Hanya Yanagihara', year: 2015, pages: 720,  tags: ['Friendship','Trauma','Long'],                    why: "Four friends in New York. One of them is unraveling, slowly, for 700 pages.",                  cover: { shape:'serif',  bg:'#1A1A1A', ink:'#F4ECD8', accent:'#C75A3A' }, rating: 4.3 },
  { id: 'b15', title: 'The Vegetarian',                  author: 'Han Kang',          year: 2007, pages: 192,  tags: ['Korean','Body Horror','Lyric'],                  why: "A woman quietly decides to stop eating meat. Then she decides to stop being a person.",        cover: { shape:'circle', bg:'#C75A3A', ink:'#F4ECD8', accent:'#F4ECD8' }, rating: 4.0 },
  { id: 'b16', title: 'Annihilation',                    author: 'Jeff VanderMeer',  year: 2014, pages: 208,  tags: ['Sci-Fi','Weird','Nature'],                       why: "Four scientists walk into Area X. Few come back. The land itself is rewriting them.",          cover: { shape:'dot',    bg:'#6B7C32', ink:'#F4ECD8', accent:'#F4ECD8' }, rating: 4.0 },
  { id: 'b17', title: 'The Idiot',                       author: 'Elif Batuman',      year: 2017, pages: 432,  tags: ['Coming-of-Age','Funny','Email'],                 why: "A Harvard freshman in 1995 falls in love over email. Painfully smart, slyly hilarious.",      cover: { shape:'arrow',  bg:'#DCC9A4', ink:'#1A1A1A', accent:'#C75A3A' }, rating: 3.9 },
  { id: 'b18', title: 'Beloved',                         author: 'Toni Morrison',     year: 1987, pages: 324,  tags: ['Literary','Historical','Ghosts'],                why: "A formerly enslaved mother is haunted by her daughter — by a ghost, by the choice. Towering.",  cover: { shape:'stack',  bg:'#1A1A1A', ink:'#F4ECD8', accent:'#C75A3A' }, rating: 4.5 },
  { id: 'b19', title: 'Mrs. Dalloway',                   author: 'Virginia Woolf',    year: 1925, pages: 194,  tags: ['Classic','Day-in-the-Life','Stream'],            why: "One day in London. One party. Every thought a small explosion.",                               cover: { shape:'serif',  bg:'#2849A3', ink:'#F4ECD8', accent:'#F4ECD8' }, rating: 4.1 },
  { id: 'b20', title: 'Real Estate',                     author: 'Deborah Levy',      year: 2021, pages: 240,  tags: ['Memoir','Living-Autobiography','Quiet'],         why: "Levy daydreams a house she will never own. The final of her Living Autobiography trio.",       cover: { shape:'stripe', bg:'#F4ECD8', ink:'#1A1A1A', accent:'#2849A3' }, rating: 4.0 },
];

const READLISTS = [
  { id: 'r_classics',      title: 'Classics Everyone Should Read', sub: '5 books · 1,894 pages',  pitch: 'The ones people mean when they say "you have to read this." Essential, strange, and better than their reputation.', accent: '#1A1A1A', curator: 'ReadMe Editorial', ai: false, saves: 45200, books: ['b18','b19','b9','b8','b6'] },
  { id: 'r_comingofage',   title: 'Coming of Age',                 sub: '4 books · 1,920 pages',  pitch: 'Growing up is messy, slow, and occasionally funny. These books remember that.',                                    accent: '#2849A3', curator: 'ReadMe Editorial', ai: false, saves: 29800, books: ['b17','b3','b11','b14'] },
  { id: 'r_romcom',        title: 'Rom-Com Inspired',              sub: '5 books · 1,810 pages',  pitch: 'Less meet-cute, more "what are we?" — love stories for people who don\'t trust love stories.',                     accent: '#C75A3A', curator: 'ReadMe Editorial', ai: false, saves: 22100, books: ['b3','b17','b7','b11','b19'] },
  { id: 'r_scifi',         title: 'Sci-Fi',                        sub: '5 books · 1,472 pages',  pitch: 'Science fiction more interested in consciousness than spaceships. Slow, precise, worth it.',                       accent: '#6B7C32', curator: 'ReadMe Editorial', ai: false, saves: 31500, books: ['b2','b5','b13','b16','b1'] },
  { id: 'r_international', title: 'Most Popular International',    sub: '6 books · 2,320 pages',  pitch: 'Translated and border-crossing fiction that outsells everything in the original language. Read the world.',        accent: '#DCC9A4', curator: 'ReadMe Editorial', ai: false, saves: 18900, books: ['b2','b9','b15','b4','b7','b20'] },
];

const client = await pool.connect();
try {
  await client.query('BEGIN');

  for (const b of BOOKS) {
    await client.query(
      `INSERT INTO books (id, title, author, year, pages, tags, why, cover, rating)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       ON CONFLICT (id) DO UPDATE SET
         title=$2, author=$3, year=$4, pages=$5, tags=$6, why=$7, cover=$8, rating=$9`,
      [b.id, b.title, b.author, b.year, b.pages, b.tags, b.why, JSON.stringify(b.cover), b.rating]
    );
  }

  for (const r of READLISTS) {
    await client.query(
      `INSERT INTO readlists (id, title, sub, pitch, accent, curator, ai, saves)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       ON CONFLICT (id) DO UPDATE SET
         title=$2, sub=$3, pitch=$4, accent=$5, curator=$6, ai=$7, saves=$8`,
      [r.id, r.title, r.sub, r.pitch, r.accent, r.curator, r.ai, r.saves]
    );
    await client.query('DELETE FROM readlist_books WHERE readlist_id = $1', [r.id]);
    for (let i = 0; i < r.books.length; i++) {
      await client.query(
        'INSERT INTO readlist_books (readlist_id, book_id, position) VALUES ($1,$2,$3)',
        [r.id, r.books[i], i]
      );
    }
  }

  await client.query('COMMIT');
  console.log(`✓ Seeded ${BOOKS.length} books, ${READLISTS.length} readlists`);
} catch (err) {
  await client.query('ROLLBACK');
  throw err;
} finally {
  client.release();
  await pool.end();
}
