// src/hooks/useLibros.js
import { useState, useEffect, useCallback } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const useLibros = () => {
  const [libros, setLibros] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Suscripción en tiempo real
  useEffect(() => {
    if (!user) {
      setLibros([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "libros"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const data = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          createdAt: d.data().createdAt?.toDate
            ? d.data().createdAt.toDate()
            : d.data().createdAt,
        }));
        setLibros(data);
        setLoading(false);
      },
      (err) => {
        console.error(err);
        toast.error("Error al cargar los libros");
        setLoading(false);
      }
    );

    return () => unsub();
  }, [user]);

  // CREATE
  const addLibro = async ({ nombre, nivel, descripcion, portadaEmoji }) => {
    try {
      const ref = await addDoc(collection(db, "libros"), {
        nombre,
        nivel,
        descripcion: descripcion || "",
        portadaEmoji: portadaEmoji || "📘",
        totalPaginas: 0,
        userId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      toast.success("✅ Libro añadido");
      return { success: true, id: ref.id };
    } catch (err) {
      console.error(err);
      toast.error("Error al añadir el libro");
      return { success: false };
    }
  };

  // UPDATE
  const updateLibro = async (id, updates) => {
    try {
      await updateDoc(doc(db, "libros", id), {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      toast.success("✅ Libro actualizado");
      return { success: true };
    } catch (err) {
      console.error(err);
      toast.error("Error al actualizar el libro");
      return { success: false };
    }
  };

  // DELETE
  const deleteLibro = async (id) => {
    if (!window.confirm("¿Eliminar este libro y todas sus páginas?"))
      return { success: false };
    try {
      await deleteDoc(doc(db, "libros", id));
      toast.success("Libro eliminado");
      return { success: true };
    } catch (err) {
      console.error(err);
      toast.error("Error al eliminar el libro");
      return { success: false };
    }
  };

  // HELPERS
  const getLibroById = useCallback(
    (id) => libros.find((l) => l.id === id) || null,
    [libros]
  );

  const getLibrosByNivel = useCallback(
    (nivel) => libros.filter((l) => l.nivel === nivel),
    [libros]
  );

  return {
    libros,
    loading,
    addLibro,
    updateLibro,
    deleteLibro,
    getLibroById,
    getLibrosByNivel,
  };
};

export default useLibros;
