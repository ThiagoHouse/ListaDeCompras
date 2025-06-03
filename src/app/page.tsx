'use client';

import { useEffect, useState } from "react";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";

// Inicialização padrão das categorias
const categoriasIniciais = [
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

function getEmptyItems(categorias: string[]): ItemsPorCategoria {
  const obj: ItemsPorCategoria = {};
  categorias.forEach(cat => {
    obj[cat] = [];
  });
  return obj;
}

function getEmptyNewItems(categorias: string[]): { [categoria: string]: string } {
  const obj: { [categoria: string]: string } = {};
  categorias.forEach(cat => {
    obj[cat] = "";
  });
  return obj;
}

export default function Home() {
  // Estado para saber se está no client
  const [isClient, setIsClient] = useState(false);

  // Modo de edição
  const [modoEdicao, setModoEdicao] = useState(false);

  // Categorias editáveis
  const [categorias, setCategorias] = useState<string[]>(categoriasIniciais);

  // Itens e inputs por categoria
  const [items, setItems] = useState<ItemsPorCategoria>(() => getEmptyItems(categoriasIniciais));
  const [newItems, setNewItems] = useState<{ [categoria: string]: string }>(() => getEmptyNewItems(categoriasIniciais));

  // Edição de item
  const [editing, setEditing] = useState<{ categoria: string | null; index: number | null }>({ categoria: null, index: null });
  const [editingText, setEditingText] = useState("");

  // Edição de categoria
  const [categoriaEditando, setCategoriaEditando] = useState<string | null>(null);
  const [novoNomeCategoria, setNovoNomeCategoria] = useState<string>("");

  // Carregar do localStorage só no client
  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem("lista-compras-items");
    if (saved) setItems(JSON.parse(saved));
    const savedCats = localStorage.getItem("lista-compras-categorias");
    if (savedCats) setCategorias(JSON.parse(savedCats));
  }, []);

  // Persistência no localStorage
  useEffect(() => {
    if (isClient) {
      localStorage.setItem("lista-compras-items", JSON.stringify(items));
      localStorage.setItem("lista-compras-categorias", JSON.stringify(categorias));
    }
  }, [items, categorias, isClient]);

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

  // Iniciar edição de item
  const startEdit = (categoria: string, index: number) => {
    setEditing({ categoria, index });
    setEditingText(items[categoria][index].text);
  };

  // Salvar edição de item
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

  // Salvar edição de categoria
  const salvarNomeCategoria = (categoriaAntiga: string) => {
    const novoNome = novoNomeCategoria.trim();
    if (
      novoNome &&
      novoNome !== categoriaAntiga &&
      !categorias.includes(novoNome)
    ) {
      // Atualiza lista de categorias
      const novasCategorias = categorias.map(cat =>
        cat === categoriaAntiga ? novoNome : cat
      );
      // Atualiza os itens e os novos itens
      const novosItems: ItemsPorCategoria = {};
      const novosNewItems: { [categoria: string]: string } = {};
      novasCategorias.forEach(cat => {
        if (cat === novoNome) {
          novosItems[cat] = items[categoriaAntiga] || [];
          novosNewItems[cat] = newItems[categoriaAntiga] || "";
        } else {
          novosItems[cat] = items[cat] || [];
          novosNewItems[cat] = newItems[cat] || "";
        }
      });
      setCategorias(novasCategorias);
      setItems(novosItems);
      setNewItems(novosNewItems);
    }
    setCategoriaEditando(null);
    setNovoNomeCategoria("");
  };

  // Só renderiza após montar no client
  if (!isClient) return null;

  return (
    <div className="container">
      <h1 style={{
        textAlign: "center",
        marginTop: 8,
        marginBottom: 8,
        fontFamily: "inherit",
        fontWeight: 700,
        fontSize: "1.2em",
        letterSpacing: "1px",
      }}>
        Lista de Compras
      </h1>

      <div style={{ textAlign: "right", marginBottom: 2 }}>
        <label style={{ cursor: "pointer", fontWeight: 500, fontSize: "0.8em" }}>
          <input
            type="checkbox"
            checked={modoEdicao}
            onChange={e => setModoEdicao(e.target.checked)}
            style={{ marginRight: 8 }}
          />
          Modo de Edição
        </label>
      </div>

      <div style={{ maxWidth: 500, margin: "2px auto", fontFamily: "sans-serif" }}>
        {categorias.map((categoria) => (
          <div key={categoria} style={{ marginBottom: 4 }}>
            {categoriaEditando === categoria && modoEdicao ? (
              <input
                className="input"
                style={{ fontWeight: "bold", fontSize: "1em", marginBottom: 8, marginTop: 8 }}
                value={novoNomeCategoria}
                autoFocus
                onChange={e => setNovoNomeCategoria(e.target.value)}
                onBlur={() => salvarNomeCategoria(categoria)}
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    salvarNomeCategoria(categoria);
                  }
                }}
              />
            ) : (
              <h2
                className="categoria-titulo"
                style={{ marginBottom: 8, marginTop: 8, display: "flex", alignItems: "center" }}
              >
                {categoria}
                {modoEdicao && (
                  <button
                    style={{ marginLeft: 8, fontSize: 14, padding: "2px 8px" }}
                    onClick={e => {
                      e.stopPropagation();
                      setCategoriaEditando(categoria);
                      setNovoNomeCategoria(categoria);
                    }}
                    title="Editar nome da categoria"
                  >
                    <FaEdit />
                  </button>
                )}
              </h2>
            )}
            {modoEdicao && (
              <div className="pb-2 adicionar-container" style={{ display: "flex", gap: 8, marginBottom: 0 }}>
                <input
                  className="input"
                  style={{ flex: 1 }}
                  type="text"
                  placeholder={`Novo item em ${categoria}`}
                  value={newItems[categoria] || ""}
                  onChange={e =>
                    setNewItems({ ...newItems, [categoria]: e.target.value })
                  }
                  onKeyDown={e => e.key === "Enter" && addItem(categoria)}
                />
                <button
                  className="botao-adicionar"
                  onClick={() => addItem(categoria)}
                >
                  <FaPlus />
                </button>
              </div>
            )}
            <ul className="lista-compras-lista">
              {items[categoria]?.map((item, index) => (
                <li
                  key={index}
                  className={`lista-compras-item${item.checked ? " checked" : ""}`}
                >
                  {editing.categoria === categoria && editing.index === index && modoEdicao ? (
                    <input
                      className="input"
                      style={{ flex: 1 }}
                      value={editingText}
                      autoFocus
                      onChange={e => setEditingText(e.target.value)}
                      onBlur={saveEdit}
                      onKeyDown={e => {
                        if (e.key === "Enter") saveEdit();
                      }}
                    />
                  ) : (
                    <span
                      style={{ flex: 1, cursor: "pointer", margin: 8 }}
                      onClick={() => toggleCheck(categoria, index)}
                    >
                      {item.text}
                    </span>
                  )}
                  {modoEdicao && (
                    <>
                      <button
                        className="botao-editar"
                        onClick={e => {
                          e.stopPropagation();
                          startEdit(categoria, index);
                        }}
                        style={{ marginLeft: 8 }}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="botao-remover"
                        onClick={e => {
                          e.stopPropagation();
                          removeItem(categoria, index);
                        }}
                        style={{ marginLeft: 8 }}
                      >
                        <FaTrash />
                      </button>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}