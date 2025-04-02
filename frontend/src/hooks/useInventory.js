import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import apiService from '../services/apiService';

export const useInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadInventory = useCallback(async () => {
    console.log('Iniciando carga de inventario...'); // Debug
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getInventory();
      console.log('Datos recibidos:', data); // Debug
      setInventory(data);
    } catch (err) {
      console.error('Error al cargar inventario:', err);
      setError(err.message || 'Error al cargar inventario');
      toast.error(`Error al cargar el inventario: ${err.message || 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateInventory = async (productId, adjustment, location, reason) => {
    try {
      await apiService.updateInventory(productId, adjustment, location, reason);
      toast.success('Inventario actualizado correctamente');
      await loadInventory(); // Recargar inventario
      return true;
    } catch (err) {
      console.error('Error al actualizar:', err);
      toast.error(`Error al actualizar: ${err.message || 'Error desconocido'}`);
      return false;
    }
  };

  return {
    inventory,
    loading,
    error,
    loadInventory,
    updateInventory
  };
};