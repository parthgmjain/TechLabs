// src/context/ProgrammesContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { fetchProgrammes } from '../../services/api';

const ProgrammesContext = createContext();

export const ProgrammesProvider = ({ children }) => {
  const [programmes, setProgrammes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProgrammes = async () => {
      try {
        const data = await fetchProgrammes(); // calls your backend /api/programmes
        setProgrammes(data);
      } catch (err) {
        console.error('Failed to load programmes from backend:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadProgrammes();
  }, []);

  // Simplified version (already flat from backend, but keep for compatibility)
  const getSimplifiedProgrammes = () => {
    // Backend already returns flat { id, name, uni, cutoff }
    return programmes.filter(p => p.cutoff !== null);
  };

  // Find programme by id (backend already has id)
  const getProgrammeById = (id) => programmes.find(p => p.id === id) || null;

  // Find by name and uni (optional)
  const findProgrammeId = (degreeName, uniName) => {
    const prog = programmes.find(p => p.name === degreeName && p.uni === uniName);
    return prog?.id || null;
  };

  return (
    <ProgrammesContext.Provider
      value={{
        programmes,
        loading,
        error,
        getSimplifiedProgrammes,
        getProgrammeById,
        findProgrammeId,
      }}
    >
      {children}
    </ProgrammesContext.Provider>
  );
};

export const useProgrammes = () => useContext(ProgrammesContext);