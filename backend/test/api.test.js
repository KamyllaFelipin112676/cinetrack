// Testes da API REST com o executor nativo do Node (npm test).
// Cada teste usa um arquivo de dados temporário, então data/filmes.json não é alterado.

import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { mkdtemp, rm, readFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { criarApp } from '../app.js';
import { criarRepositorio } from '../repositorio.js';
import { FILMES_EXEMPLO } from '../filmes-exemplo.js';

let pasta;
let arquivo;
let servidor;
let base;

async function iniciar(env = {}) {
    const repositorio = criarRepositorio(arquivo);
    await repositorio.substituirTudo(FILMES_EXEMPLO);
    const app = criarApp({ repositorio, env: { NODE_ENV: 'test', ...env } });
    servidor = http.createServer(app.handler);
    await new Promise((resolve) => servidor.listen(0, resolve));
    base = `http://127.0.0.1:${servidor.address().port}`;
}

const api = (rota, opcoes = {}) => fetch(base + rota, {
    ...opcoes,
    headers: { 'Content-Type': 'application/json', ...opcoes.headers }
});

beforeEach(async () => {
    pasta = await mkdtemp(path.join(os.tmpdir(), 'cinetrack-'));
    arquivo = path.join(pasta, 'filmes.json');
    await iniciar();
});

afterEach(async () => {
    await new Promise((resolve) => servidor.close(resolve));
    await rm(pasta, { recursive: true, force: true });
});

test('GET /filmes lista os 6 filmes em JSON', async () => {
    const resposta = await api('/filmes');
    assert.equal(resposta.status, 200);
    assert.match(resposta.headers.get('content-type'), /application\/json/);
    const filmes = await resposta.json();
    assert.equal(filmes.length, 6);
});

test('GET /filmes?status= filtra por status e rejeita status inválido', async () => {
    const quero = await (await api('/filmes?status=quero')).json();
    assert.deepEqual(quero.map((f) => f.titulo), ['Interestelar', 'Cidade de Deus']);
    assert.equal((await api('/filmes?status=xyz')).status, 400);
});

test('GET /filmes/:id devolve o filme ou 404', async () => {
    const filme = await (await api('/filmes/3')).json();
    assert.equal(filme.titulo, 'O Auto da Compadecida');
    const inexistente = await api('/filmes/999');
    assert.equal(inexistente.status, 404);
    assert.ok((await inexistente.json()).erro);
});

test('POST /filmes cria com id novo, status 201, e grava no arquivo', async () => {
    const resposta = await api('/filmes', {
        method: 'POST',
        body: JSON.stringify({ titulo: '  Central do Brasil ', ano: 1998, genero: 'Drama', status: 'quero', nota: 5, id: 1 })
    });
    assert.equal(resposta.status, 201);
    const criado = await resposta.json();
    assert.equal(criado.id, 7); // o id enviado pelo cliente é ignorado
    assert.equal(criado.titulo, 'Central do Brasil');
    assert.equal(resposta.headers.get('location'), '/filmes/7');

    const noArquivo = JSON.parse(await readFile(arquivo, 'utf8'));
    assert.equal(noArquivo.length, 7);
    assert.equal(noArquivo.at(-1).titulo, 'Central do Brasil');
});

test('POST /filmes responde 400 sem título ou sem ano', async () => {
    const semTitulo = await api('/filmes', { method: 'POST', body: JSON.stringify({ ano: 2000 }) });
    assert.equal(semTitulo.status, 400);
    assert.ok((await semTitulo.json()).detalhes.titulo);

    const semAno = await api('/filmes', { method: 'POST', body: JSON.stringify({ titulo: 'X' }) });
    assert.equal(semAno.status, 400);
    assert.ok((await semAno.json()).detalhes.ano);

    const jsonQuebrado = await api('/filmes', { method: 'POST', body: '{titulo:' });
    assert.equal(jsonQuebrado.status, 400);
});

test('PUT /filmes/:id atualiza preservando o id, ou 404', async () => {
    const resposta = await api('/filmes/2', {
        method: 'PUT',
        body: JSON.stringify({ id: 99, titulo: 'Parasita', ano: 2019, genero: 'Suspense', status: 'assistido', nota: 5, comentario: 'Obra-prima.' })
    });
    assert.equal(resposta.status, 200);
    const atualizado = await resposta.json();
    assert.equal(atualizado.id, 2);
    assert.equal(atualizado.nota, 5);

    const relido = await (await api('/filmes/2')).json();
    assert.equal(relido.comentario, 'Obra-prima.');

    const naoExiste = await api('/filmes/999', { method: 'PUT', body: JSON.stringify({ titulo: 'X', ano: 2000 }) });
    assert.equal(naoExiste.status, 404);

    const invalido = await api('/filmes/2', { method: 'PUT', body: JSON.stringify({ titulo: '' }) });
    assert.equal(invalido.status, 400);
});

test('DELETE /filmes/:id responde 204 e depois 404', async () => {
    const resposta = await api('/filmes/1', { method: 'DELETE' });
    assert.equal(resposta.status, 204);
    assert.equal(await resposta.text(), '');
    assert.equal((await api('/filmes/1')).status, 404);
    assert.equal((await api('/filmes/1', { method: 'DELETE' })).status, 404);
});

test('os dados sobrevivem a um novo servidor (persistência)', async () => {
    await api('/filmes/6', { method: 'DELETE' });
    await new Promise((resolve) => servidor.close(resolve));

    const app = criarApp({ repositorio: criarRepositorio(arquivo), env: { NODE_ENV: 'test' } });
    servidor = http.createServer(app.handler);
    await new Promise((resolve) => servidor.listen(0, resolve));
    base = `http://127.0.0.1:${servidor.address().port}`;

    const filmes = await (await api('/filmes')).json();
    assert.equal(filmes.length, 5);
});

test('escritas simultâneas não se perdem', async () => {
    const criacoes = Array.from({ length: 10 }, (_, i) => api('/filmes', {
        method: 'POST',
        body: JSON.stringify({ titulo: `Filme ${i}`, ano: 2000 + i })
    }));
    const ids = (await Promise.all(criacoes.map(async (p) => (await p).json()))).map((f) => f.id);
    assert.equal(new Set(ids).size, 10);
    assert.equal((await (await api('/filmes')).json()).length, 16);
});

test('CORS liberado para localhost e preflight responde 204', async () => {
    const preflight = await fetch(`${base}/filmes`, {
        method: 'OPTIONS',
        headers: { Origin: 'http://localhost:5173', 'Access-Control-Request-Method': 'PUT' }
    });
    assert.equal(preflight.status, 204);
    assert.equal(preflight.headers.get('access-control-allow-origin'), 'http://localhost:5173');
    assert.match(preflight.headers.get('access-control-allow-methods'), /PUT/);

    const externo = await fetch(`${base}/filmes`, { headers: { Origin: 'https://exemplo.com' } });
    assert.equal(externo.headers.get('access-control-allow-origin'), null);
});

test('rota inexistente responde 404 em JSON e método não suportado 405', async () => {
    const resposta = await api('/nada');
    assert.equal(resposta.status, 404);
    assert.match(resposta.headers.get('content-type'), /application\/json/);
    assert.equal((await api('/filmes', { method: 'PATCH', body: '{}' })).status, 405);
});

test('proxy TMDB responde 503 quando não há chave configurada', async () => {
    assert.deepEqual(await (await api('/tmdb/status')).json(), { disponivel: false });
    assert.equal((await api('/tmdb/buscar?titulo=duna')).status, 503);
});
