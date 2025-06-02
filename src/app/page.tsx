'use client';

import { useEffect, useState } from "react";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa"; // Adicione esta linha


const categorias = [
  "Bruto",
  "Padaria",
  "Carnes",
  "Produto de Limpeza",
  "Hortifrut",
  "Utilidades"
];

type Item = {
  text: string;
  checked: boolean;
};

type ItemsPorCategoria = {
  [categoria: string]: Item[];
};

// Função para inicializar o estado dos itens (arrays)
function getEmptyItems(): ItemsPorCategoria {
  return {
    Bruto: [],
    Padaria: [],
    Carnes: [],
    "Produto de Limpeza": [],
    Hortifrut: [],
    Utilidades: [],
  };
}

// Função para inicializar o estado dos inputs (strings)
function getEmptyNewItems(): { [categoria: string]: string } {
  return {
    Bruto: "",
    Padaria: "",
    Carnes: "",
    "Produto de Limpeza": "",
    Hortifrut: "",
    Utilidades: "",
  };
}

export default function Home() {
  // Estado para saber se está no client
  const [isClient, setIsClient] = useState(false);
  const [items, setItems] = useState<ItemsPorCategoria>(getEmptyItems);

  // Inputs separados para cada categoria (corrigido para string)
  const [newItems, setNewItems] = useState<{ [categoria: string]: string }>(getEmptyNewItems());

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
    const confirm = window.confirm("Tem certeza que deseja remover este item?");
    if (!confirm) return;
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
    <div className="container">
      <div style={{ maxWidth: 500, margin: "40px auto", fontFamily: "sans-serif" }}>
        {categorias.map((categoria) => (
          <div key={categoria} style={{ marginBottom: 24 }}>
            <h2 className="categoria-titulo" style={{ marginBottom: 8, marginTop: 16 }}>{categoria}</h2>
            <div className="pb-2" style={{ display: "flex", gap: 8, marginBottom: 0 }}>
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
              <button className="botao-adicionar" onClick={() => addItem(categoria)}><FaPlus /></button>
            </div>
            <ul className="lista-compras-lista">
              {items[categoria].map((item, index) => (
                <li
  key={index}
  className={`lista-compras-item${item.checked ? " checked" : ""}`}
>
  <span
    style={{ flex: 1, cursor: "pointer" }}
    onClick={() => toggleCheck(categoria, index)}
  >
    {item.text}
  </span>
  <button className="botao-editar" onClick={() => startEdit(categoria, index)} style={{ marginLeft: 8 }}>
    <FaEdit />
  </button>
  <button className="botao-remover" onClick={() => removeItem(categoria, index)} style={{ marginLeft: 8 }}>
    <FaTrash />
  </button>
</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}