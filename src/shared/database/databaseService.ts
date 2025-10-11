// Database service with Firestore CRUD operations
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  QueryDocumentSnapshot,
  DocumentData,
  FirestoreError
} from "firebase/firestore";
import { db } from "./firestore";
import {
  BaseDocument,
  UserDocument,
  BudgetDocument,
  TransactionDocument,
  QueryOptions,
  COLLECTIONS,
  DatabaseError
} from "./types";

export class DatabaseService {
  /**
   * Generic method to get a document by ID
   */
  static async getDocument<T extends BaseDocument>(
    collectionName: string,
    id: string
  ): Promise<T | null> {
    try {
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as T;
      }
      return null;
    } catch (error) {
      throw this.handleDatabaseError(error as FirestoreError);
    }
  }

  /**
   * Generic method to get all documents from a collection
   */
  static async getDocuments<T extends BaseDocument>(
    collectionName: string,
    options?: QueryOptions
  ): Promise<{ data: T[]; lastDoc?: QueryDocumentSnapshot<DocumentData> }> {
    try {
      let q = collection(db, collectionName);
      
      if (options?.orderBy) {
        q = query(q, orderBy(options.orderBy, options.orderDirection || 'asc'));
      }
      
      if (options?.limit) {
        q = query(q, limit(options.limit));
      }
      
      if (options?.startAfter) {
        q = query(q, startAfter(options.startAfter));
      }

      const querySnapshot = await getDocs(q);
      const data: T[] = [];
      
      querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
        data.push({ id: doc.id, ...doc.data() } as T);
      });

      const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
      return { data, lastDoc };
    } catch (error) {
      throw this.handleDatabaseError(error as FirestoreError);
    }
  }

  /**
   * Generic method to create a new document
   */
  static async createDocument<T extends Omit<BaseDocument, 'id' | 'createdAt' | 'updatedAt'>>(
    collectionName: string,
    data: T
  ): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      throw this.handleDatabaseError(error as FirestoreError);
    }
  }

  /**
   * Generic method to update a document
   */
  static async updateDocument<T extends Partial<BaseDocument>>(
    collectionName: string,
    id: string,
    data: T
  ): Promise<void> {
    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      throw this.handleDatabaseError(error as FirestoreError);
    }
  }

  /**
   * Generic method to delete a document
   */
  static async deleteDocument(collectionName: string, id: string): Promise<void> {
    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      throw this.handleDatabaseError(error as FirestoreError);
    }
  }

  // User-specific methods
  static async getUser(userId: string): Promise<UserDocument | null> {
    return this.getDocument<UserDocument>(COLLECTIONS.USERS, userId);
  }

  static async createUser(userData: Omit<UserDocument, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    return this.createDocument(COLLECTIONS.USERS, userData);
  }

  static async updateUser(userId: string, userData: Partial<UserDocument>): Promise<void> {
    return this.updateDocument(COLLECTIONS.USERS, userId, userData);
  }

  // Budget-specific methods
  static async getBudgets(userId: string, options?: QueryOptions): Promise<{ data: BudgetDocument[]; lastDoc?: QueryDocumentSnapshot<DocumentData> }> {
    try {
      let q = query(
        collection(db, COLLECTIONS.BUDGETS),
        where('userId', '==', userId)
      );
      
      if (options?.orderBy) {
        q = query(q, orderBy(options.orderBy, options.orderDirection || 'desc'));
      }
      
      if (options?.limit) {
        q = query(q, limit(options.limit));
      }
      
      if (options?.startAfter) {
        q = query(q, startAfter(options.startAfter));
      }

      const querySnapshot = await getDocs(q);
      const data: BudgetDocument[] = [];
      
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as BudgetDocument);
      });

      const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
      return { data, lastDoc };
    } catch (error) {
      throw this.handleDatabaseError(error as FirestoreError);
    }
  }

  static async getBudget(budgetId: string): Promise<BudgetDocument | null> {
    return this.getDocument<BudgetDocument>(COLLECTIONS.BUDGETS, budgetId);
  }

  static async createBudget(budgetData: Omit<BudgetDocument, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    return this.createDocument(COLLECTIONS.BUDGETS, budgetData);
  }

  static async updateBudget(budgetId: string, budgetData: Partial<BudgetDocument>): Promise<void> {
    return this.updateDocument(COLLECTIONS.BUDGETS, budgetId, budgetData);
  }

  static async deleteBudget(budgetId: string): Promise<void> {
    return this.deleteDocument(COLLECTIONS.BUDGETS, budgetId);
  }

  // Transaction-specific methods
  static async getTransactions(userId: string, budgetId?: string, options?: QueryOptions): Promise<{ data: TransactionDocument[]; lastDoc?: QueryDocumentSnapshot<DocumentData> }> {
    try {
      let q = query(
        collection(db, COLLECTIONS.TRANSACTIONS),
        where('userId', '==', userId)
      );
      
      if (budgetId) {
        q = query(q, where('budgetId', '==', budgetId));
      }
      
      if (options?.orderBy) {
        q = query(q, orderBy(options.orderBy, options.orderDirection || 'desc'));
      }
      
      if (options?.limit) {
        q = query(q, limit(options.limit));
      }
      
      if (options?.startAfter) {
        q = query(q, startAfter(options.startAfter));
      }

      const querySnapshot = await getDocs(q);
      const data: TransactionDocument[] = [];
      
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as TransactionDocument);
      });

      const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
      return { data, lastDoc };
    } catch (error) {
      throw this.handleDatabaseError(error as FirestoreError);
    }
  }

  static async getTransaction(transactionId: string): Promise<TransactionDocument | null> {
    return this.getDocument<TransactionDocument>(COLLECTIONS.TRANSACTIONS, transactionId);
  }

  static async createTransaction(transactionData: Omit<TransactionDocument, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    return this.createDocument(COLLECTIONS.TRANSACTIONS, transactionData);
  }

  static async updateTransaction(transactionId: string, transactionData: Partial<TransactionDocument>): Promise<void> {
    return this.updateDocument(COLLECTIONS.TRANSACTIONS, transactionId, transactionData);
  }

  static async deleteTransaction(transactionId: string): Promise<void> {
    return this.deleteDocument(COLLECTIONS.TRANSACTIONS, transactionId);
  }

  /**
   * Handle Firestore errors and convert to user-friendly messages
   */
  private static handleDatabaseError(error: FirestoreError): Error {
    const errorMessages: { [key: string]: string } = {
      'permission-denied': 'You do not have permission to perform this action.',
      'not-found': 'The requested document was not found.',
      'already-exists': 'A document with this ID already exists.',
      'resource-exhausted': 'Too many requests. Please try again later.',
      'unauthenticated': 'You must be signed in to perform this action.',
      'failed-precondition': 'The operation failed due to a precondition.',
      'aborted': 'The operation was aborted. Please try again.',
      'out-of-range': 'The operation is out of range.',
      'unimplemented': 'This operation is not implemented.',
      'internal': 'An internal error occurred. Please try again.',
      'unavailable': 'The service is currently unavailable.',
      'data-loss': 'Data loss occurred. Please contact support.',
      'deadline-exceeded': 'The operation timed out. Please try again.',
    };

    const message = errorMessages[error.code] || error.message;
    return new Error(message);
  }
}
