'use client';

import { useEffect, useState } from "react";

const categorias = [
  "Bruto",
  "Padaria",
  "Carnes",
  "Produto de Limpeza",
  "Hortifrut",
  "Utilidades"
];

function getEmptyItems() {
  return {
    Bruto: [],
    Padaria: [],
    Carnes: [],
    "Produto de Limpeza": [],
    Hortifrut: [],
    Utilidades: [],
  };
}

export default function Home() {
  // Estado para saber se está no client
  const [isClient, setIsClient] = useState(false);
  const [items, setItems] = useState(getEmptyItems);

  // Inputs separados para cada categoria
  const [newItems, setNewItems] = useState(getEmptyItems());

  // Edição
  const [editing, setEditing] = useState<{ categoria: string | null; index: number | null }>({ categoria: null, index: null });
  const [editingText, setEditingText] = useState("");

  // Carregar do localStorage só no client
  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem("lista-compras-items");
    if (saved) setItems(JSON.parse(saved));
  }, []);

  // Persistência no localStorage
  useEffect(() => {
    if (isClient) {
      localStorage.setItem("lista-compras-items", JSON.stringify(items));
    }
  }, [items, isClient]);

  // Adicionar item em uma categoria
  const addItem = (categoria: string) => {
    const text = newItems[categoria]?.trim();
    if (text) {
      setItems({
        ...items,
        [categoria]: [...items[categoria], { text, checked: false }]
      });
      setNewItems({ ...newItems, [categoria]: "" });
    }
  };

  // Remover item
  const removeItem = (categoria: string, index: number) => {
    setItems({
      ...items,
      [categoria]: items[categoria].filter((_, i) => i !== index)
    });
  };

  // Marcar/desmarcar item
  const toggleCheck = (categoria: string, index: number) => {
    setItems({
      ...items,
      [categoria]: items[categoria].map((item, i) =>
        i === index ? { ...item, checked: !item.checked } : item
      )
    });
  };

  // Iniciar edição
  const startEdit = (categoria: string, index: number) => {
    setEditing({ categoria, index });
    setEditingText(items[categoria][index].text);
  };

  // Salvar edição
  const saveEdit = () => {
    const { categoria, index } = editing;
    if (categoria !== null && index !== null) {
      setItems({
        ...items,
        [categoria]: items[categoria].map((item, i) =>
          i === index ? { ...item, text: editingText } : item
        )
      });
    }
    setEditing({ categoria: null, index: null });
    setEditingText("");
  };

  // Só renderiza após montar no client
  if (!isClient) return null;

  return (
    <div style={{ maxWidth: 500, margin: "40px auto", fontFamily: "sans-serif" }}>
      {/* <h1>Lista de Compras</h1> */}
      {categorias.map((categoria) => (
        <div key={categoria} style={{ marginBottom: 24 }}>
          <h2 className="categoria-titulo" style={{ marginBottom: 8, marginTop: 16 }}>{categoria}</h2>
          <div style={{ display: "flex", gap: 8, marginBottom: 0 }}>
            <input
              className="input"
              type="text"
              placeholder={`Novo item em ${categoria}`}
              value={newItems[categoria] || ""}
              onChange={e =>
                setNewItems({ ...newItems, [categoria]: e.target.value })
              }
              onKeyDown={e => e.key === "Enter" && addItem(categoria)}
            />
            <button className="botao-adicionar" onClick={() => addItem(categoria)}>Adicionar</button>
          </div>
          <ul className="lista-compras-lista">
            {items[categoria].map((item: any, index: number) => (
              <li
                key={index}
                className={`lista-compras-item${item.checked ? " checked" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => toggleCheck(categoria, index)}
                />
                {editing.categoria === categoria && editing.index === index ? (
                  <>
                    <input
                      value={editingText}
                      onChange={e => setEditingText(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && saveEdit()}
                      style={{ flex: 1, marginRight: 8 }}
                    />
                    <button onClick={saveEdit}>Salvar</button>
                    <button onClick={() => setEditing({ categoria: null, index: null })}>Cancelar</button>
                  </>
                ) : (
                  <>
                    <span style={{ flex: 1 }}>{item.text}</span>
                    <button onClick={() => startEdit(categoria, index)} style={{ marginLeft: 8 }}>Editar</button>
                    <button onClick={() => removeItem(categoria, index)} style={{ marginLeft: 8 }}>Remover</button>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}