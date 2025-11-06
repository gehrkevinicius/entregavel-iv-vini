import promptSync from "prompt-sync";
import { linearSearch } from "./search/linear-search.js";
import { insertionSort } from "./sort/insertion-sort.js";
import { Queue } from "./structs/queue.js";
import { Stack } from "./structs/stack.js";

const prompt = promptSync();

const enun = `
O que você quer fazer?
[rc] Registrar cliente na fila
[ac] Atender o próximo cliente
[mc] Mostrar clientes atendidos (a-z)
[pc] Procurar cliente da fila pelo nome
[uc] Ver último cliente atendido
[rq] Mostrar relatório e sair
`.trim();

const fila = new Queue();
const pilhaAtendidos = new Stack();

let proximaSenha = 1;
const nomesRegistrados = new Set();

function obterTamanho(col) {
  if (typeof col.size === "function") return col.size();
  if (typeof col.size === "number") return col.size;
  return 0;
}

function paraArray(col) {
  if (typeof col.toArray === "function") return col.toArray();
  if (Array.isArray(col.items)) return col.items.slice();
  return [];
}

function formatarCliente(c) {
  return `${c.ticket} - ${c.name}`;
}

function registrarCliente() {
  const nome = prompt("Nome do cliente: ").trim();
  if (!nome) {
    console.log("Nome inválido. Tente novamente.");
    return;
  }
  const chave = nome.toLowerCase();
  if (nomesRegistrados.has(chave)) {
    console.log("Cliente já registrado na fila.");
    return;
  }
  const cliente = { ticket: proximaSenha++, name: nome };
  fila.enqueue(cliente);
  nomesRegistrados.add(chave);
  console.log("Registrado:", formatarCliente(cliente));
}

function atenderProximo() {
  if (fila.isEmpty()) {
    console.log("Nenhum cliente na fila.");
    return;
  }
  const cliente = fila.dequeue();
  pilhaAtendidos.push(cliente);
  nomesRegistrados.delete(cliente.name.toLowerCase());
  console.log("Atendido:", formatarCliente(cliente));
}

function mostrarAtendidos() {
  if (pilhaAtendidos.isEmpty()) {
    console.log("Nenhum cliente atendido ainda.");
    return;
  }
  const atendidos = paraArray(pilhaAtendidos).map((c) => c.name);
  const ordenados = insertionSort
    ? insertionSort(atendidos.slice())
    : atendidos.slice().sort();
  console.log("Clientes atendidos (A-Z):");
  ordenados.forEach((nome) => console.log("- " + nome));
}

function procurarNaFila() {
  if (fila.isEmpty()) {
    console.log("Fila vazia.");
    return;
  }
  const termo = prompt("Nome a procurar: ").trim();
  if (!termo) {
    console.log("Busca vazia.");
    return;
  }
  const termoLower = termo.toLowerCase();
  const arr = paraArray(fila).map((c) => c.name);
  const arrLower = arr.map((n) => n.toLowerCase());
  const idx = linearSearch
    ? linearSearch(arrLower, termoLower)
    : arrLower.indexOf(termoLower);
  if (idx >= 0) {
    const cliente = paraArray(fila)[idx];
    console.log(
      "Encontrado na fila:",
      formatarCliente(cliente),
      `(posição ${idx + 1})`
    );
  } else {
    console.log("Cliente não encontrado na fila.");
  }
}

function verUltimoAtendido() {
  if (pilhaAtendidos.isEmpty()) {
    console.log("Nenhum cliente atendido ainda.");
    return;
  }
  const ultimo = pilhaAtendidos.peek();
  console.log("Último atendido:", formatarCliente(ultimo));
}

function relatorioESair() {
  console.log("=== Relatório final ===");
  console.log("Clientes ainda na fila:", obterTamanho(fila));
  if (!fila.isEmpty()) {
    paraArray(fila).forEach((c) => console.log(" -", formatarCliente(c)));
  }
  console.log("Clientes atendidos (ordem de atendimento):");
  const atendidos = paraArray(pilhaAtendidos).slice().reverse();
  if (atendidos.length === 0) console.log(" (nenhum)");
  else atendidos.forEach((c) => console.log(" -", formatarCliente(c)));
  console.log("Saindo!");
  process.exit();
}
