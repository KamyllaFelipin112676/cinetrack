// Os 6 filmes de exemplo definidos na Parte 1 (mesmos dados de parte1/app.js).

const poster = (codigo) => `https://image.tmdb.org/t/p/w600_and_h900_face/${codigo}.jpg`;

export const FILMES_EXEMPLO = [
    { id: 1, titulo: 'A Origem', ano: 2010, genero: 'Ficção científica', poster: poster('9e3Dz7aCANy5aRUQF745IlNloJ1'), nota: 5, status: 'assistido', comentario: 'Revejo sempre.' },
    { id: 2, titulo: 'Parasita', ano: 2019, genero: 'Suspense', poster: poster('igw938inb6Fy0YVcwIyxQ7Lu5FO'), nota: 4, status: 'assistido', comentario: '' },
    { id: 3, titulo: 'O Auto da Compadecida', ano: 2000, genero: 'Comédia', poster: poster('imcOp1kJsCsAFCoOtY5OnPrFbAf'), nota: 5, status: 'assistido', comentario: 'Clássico nacional.' },
    { id: 4, titulo: 'Duna: Parte Dois', ano: 2024, genero: 'Ficção científica', poster: poster('8LJJjLjAzAwXS40S5mx79PJ2jSs'), nota: 4, status: 'assistindo', comentario: '' },
    { id: 5, titulo: 'Interestelar', ano: 2014, genero: 'Ficção científica', poster: poster('6ricSDD83BClJsFdGB6x7cM0MFQ'), nota: 5, status: 'quero', comentario: '' },
    { id: 6, titulo: 'Cidade de Deus', ano: 2002, genero: 'Drama', poster: poster('gfnXixcGC060QcG6JPxN6AMdVsq'), nota: 4, status: 'quero', comentario: '' }
];
