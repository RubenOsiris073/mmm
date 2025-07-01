const { admin } = require('../config/firebase');

/**
 * Utilidades para Firestore usando Firebase Admin SDK
 */
class FirestoreAdmin {
  constructor() {
    this.db = admin.firestore();
  }

  /**
   * Obtener referencia de colección
   */
  collection(collectionName) {
    return this.db.collection(collectionName);
  }

  /**
   * Obtener referencia de documento
   */
  doc(collectionName, docId) {
    return this.db.collection(collectionName).doc(docId);
  }

  /**
   * Agregar documento a colección
   */
  async addDoc(collectionName, data) {
    const docRef = this.db.collection(collectionName).doc();
    await docRef.set({
      ...data,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    return docRef;
  }

  /**
   * Obtener todos los documentos de una colección
   */
  async getDocs(collectionName) {
    const snapshot = await this.db.collection(collectionName).get();
    const docs = [];
    snapshot.forEach(doc => {
      docs.push({
        id: doc.id,
        ...doc.data()
      });
    });
    return docs;
  }

  /**
   * Obtener documento por ID
   */
  async getDoc(collectionName, docId) {
    const doc = await this.db.collection(collectionName).doc(docId).get();
    if (!doc.exists) {
      return null;
    }
    return {
      id: doc.id,
      ...doc.data()
    };
  }

  /**
   * Actualizar documento
   */
  async updateDoc(collectionName, docId, data) {
    await this.db.collection(collectionName).doc(docId).update({
      ...data,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  }

  /**
   * Eliminar documento
   */
  async deleteDoc(collectionName, docId) {
    await this.db.collection(collectionName).doc(docId).delete();
  }

  /**
   * Consulta con filtros
   */
  async queryDocs(collectionName, filters = [], orderByField = null, orderDirection = 'asc', limitCount = null) {
    let query = this.db.collection(collectionName);

    // Aplicar filtros
    filters.forEach(filter => {
      query = query.where(filter.field, filter.operator, filter.value);
    });

    // Aplicar orden
    if (orderByField) {
      query = query.orderBy(orderByField, orderDirection);
    }

    // Aplicar límite
    if (limitCount) {
      query = query.limit(limitCount);
    }

    const snapshot = await query.get();
    const docs = [];
    snapshot.forEach(doc => {
      docs.push({
        id: doc.id,
        ...doc.data()
      });
    });
    return docs;
  }

  /**
   * Timestamp del servidor
   */
  serverTimestamp() {
    return admin.firestore.FieldValue.serverTimestamp();
  }

  /**
   * Incremento
   */
  increment(value) {
    return admin.firestore.FieldValue.increment(value);
  }

  /**
   * Transacción
   */
  async runTransaction(updateFunction) {
    return this.db.runTransaction(updateFunction);
  }

  /**
   * Batch operations
   */
  batch() {
    return this.db.batch();
  }
}

module.exports = new FirestoreAdmin();
