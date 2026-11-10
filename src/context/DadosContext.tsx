import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { armazenamento } from '../services/armazenamento';
import { DocumentoExplicado, Duvida } from '../types';

type Dados = {
  carregado: boolean;
  documentos: DocumentoExplicado[];
  duvidas: Duvida[];
  salvarDocumento: (d: DocumentoExplicado) => void;
  excluirDocumento: (id: string) => DocumentoExplicado | undefined;
  restaurarDocumento: (d: DocumentoExplicado) => void;
  guardarDuvida: (texto: string, doc?: DocumentoExplicado) => void;
  alternarDuvida: (id: string) => void;
  excluirDuvida: (id: string) => Duvida | undefined;
  restaurarDuvida: (d: Duvida) => void;
  duvidaGuardada: (texto: string, documentoId?: string) => boolean;
};

const Ctx = createContext<Dados | null>(null);

const novoId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export function DadosProvider({ children }: { children: React.ReactNode }) {
  const [carregado, setCarregado] = useState(false);
  const [documentos, setDocumentos] = useState<DocumentoExplicado[]>([]);
  const [duvidas, setDuvidas] = useState<Duvida[]>([]);

  useEffect(() => {
    (async () => {
      const [docs, duv] = await Promise.all([
        armazenamento.lerDocumentos<DocumentoExplicado>(),
        armazenamento.lerDuvidas<Duvida>(),
      ]);
      setDocumentos(docs);
      setDuvidas(duv);
      setCarregado(true);
    })();
  }, []);

  useEffect(() => {
    if (carregado) armazenamento.gravarDocumentos(documentos);
  }, [documentos, carregado]);

  useEffect(() => {
    if (carregado) armazenamento.gravarDuvidas(duvidas);
  }, [duvidas, carregado]);

  const salvarDocumento = useCallback((d: DocumentoExplicado) => {
    setDocumentos((lista) => [d, ...lista.filter((x) => x.id !== d.id)]);
  }, []);

  const excluirDocumento = useCallback(
    (id: string) => {
      const alvo = documentos.find((d) => d.id === id);
      setDocumentos((lista) => lista.filter((d) => d.id !== id));
      return alvo;
    },
    [documentos],
  );

  const restaurarDocumento = useCallback((d: DocumentoExplicado) => {
    setDocumentos((lista) =>
      [d, ...lista.filter((x) => x.id !== d.id)].sort((a, b) => b.criadoEm.localeCompare(a.criadoEm)),
    );
  }, []);

  const guardarDuvida = useCallback((texto: string, doc?: DocumentoExplicado) => {
    const limpo = texto.trim();
    if (!limpo) return;
    setDuvidas((lista) => [
      {
        id: novoId(),
        texto: limpo,
        documentoId: doc?.id,
        documentoTitulo: doc?.titulo,
        resolvida: false,
        criadaEm: new Date().toISOString(),
      },
      ...lista,
    ]);
  }, []);

  const alternarDuvida = useCallback((id: string) => {
    setDuvidas((lista) => lista.map((d) => (d.id === id ? { ...d, resolvida: !d.resolvida } : d)));
  }, []);

  const excluirDuvida = useCallback(
    (id: string) => {
      const alvo = duvidas.find((d) => d.id === id);
      setDuvidas((lista) => lista.filter((d) => d.id !== id));
      return alvo;
    },
    [duvidas],
  );

  const restaurarDuvida = useCallback((d: Duvida) => {
    setDuvidas((lista) =>
      [d, ...lista.filter((x) => x.id !== d.id)].sort((a, b) => b.criadaEm.localeCompare(a.criadaEm)),
    );
  }, []);

  const duvidaGuardada = useCallback(
    (texto: string, documentoId?: string) =>
      duvidas.some((d) => d.texto === texto && d.documentoId === documentoId),
    [duvidas],
  );

  const valor = useMemo(
    () => ({
      carregado,
      documentos,
      duvidas,
      salvarDocumento,
      excluirDocumento,
      restaurarDocumento,
      guardarDuvida,
      alternarDuvida,
      excluirDuvida,
      restaurarDuvida,
      duvidaGuardada,
    }),
    [
      carregado,
      documentos,
      duvidas,
      salvarDocumento,
      excluirDocumento,
      restaurarDocumento,
      guardarDuvida,
      alternarDuvida,
      excluirDuvida,
      restaurarDuvida,
      duvidaGuardada,
    ],
  );

  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
}

export function useDados() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useDados precisa estar dentro de DadosProvider');
  return v;
}
