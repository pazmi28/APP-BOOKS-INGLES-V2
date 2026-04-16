// src/hooks/usePaginas.js
import { useState, useEffect, useCallback } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc,
  increment,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const usePaginas = (libroId) => {
  const [paginas, setPaginas] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Suscripción en tiempo real — solo las páginas del libro activo
  useEffect(() => {
    if (!user || !libroId) {
      setPaginas([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "paginas"),
      where("userId", "==", user.uid),
      where("libroId", "==", libroId),
      orderBy("numero", "asc")
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const data = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          createdAt: d.data().createdAt?.toDate?.() ?? d.data().createdAt,
        }));
        setPaginas(data);
        setLoading(false);
      },
      (err) => {
        console.error(err);
        toast.error("Error al cargar las páginas");
        setLoading(false);
      }
    );

    return () => unsub();
  }, [user, libroId]);

  // CREATE — guarda la página y actualiza totalPaginas en el libro
  const addPagina = useCallback(
    async ({ numero, textoOriginal, traduccion, preguntas }) => {
      try {
        await addDoc(collection(db, "paginas"), {
          libroId,
          userId: user.uid,
          numero,
          textoOriginal,
          traduccion,
          preguntas,
          estado: "pendiente",
          createdAt: serverTimestamp(),
        });

        // Incrementar contador en el libro padre
        await updateDoc(doc(db, "libros", libroId), {
          totalPaginas: increment(1),
          updatedAt: serverTimestamp(),
        });

        toast.success("✅ Página guardada");
        return { success: true };
      } catch (err) {
        console.error(err);
        toast.error("Error al guardar la página");
        return { success: false };
      }
    },
    [user, libroId]
  );

  // DELETE — borra la página y decrementa el contador del libro
  const deletePagina = useCallback(
    async (id) => {
      if (!window.confirm("¿Eliminar esta página y sus preguntas?"))
        return { success: false };
      try {
        await deleteDoc(doc(db, "paginas", id));
        await updateDoc(doc(db, "libros", libroId), {
          totalPaginas: increment(-1),
          updatedAt: serverTimestamp(),
        });
        toast.success("Página eliminada");
        return { success: true };
      } catch (err) {
        console.error(err);
        toast.error("Error al eliminar la página");
        return { success: false };
      }
    },
    [libroId]
  );

  // HELPERS
  const getNextNumero = useCallback(() => {
    if (paginas.length === 0) return 1;
    return Math.max(...paginas.map((p) => p.numero)) + 1;
  }, [paginas]);

  const getPaginaById = useCallback(
    (id) => paginas.find((p) => p.id === id) || null,
    [paginas]
  );

  return {
    paginas,
    loading,
    addPagina,
    deletePagina,
    getNextNumero,
    getPaginaById,
  };
};

export default usePaginas;
