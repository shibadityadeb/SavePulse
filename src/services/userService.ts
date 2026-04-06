import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  Timestamp,
  FirebaseError,
} from 'firebase/firestore';
import { db } from './firebase';

/**
 * Firestore user document interface
 * Defines the structure of user data in the database
 */
export interface User {
  uid: string;
  phone: string;
  name: string;
  bloodGroup: string;
  city: string;
  available: boolean;
  lastDonation: string | null;
  createdAt: Timestamp;
}

/**
 * User data for creation/updates
 * Excludes server-generated fields like uid and createdAt
 */
export interface UserCreateData {
  phone: string;
  name: string;
  bloodGroup: string;
  city: string;
  available: boolean;
  lastDonation?: string | null;
}

/**
 * User data for updates
 * All fields are optional for partial updates
 */
export type UserUpdateData = Partial<Omit<User, 'uid' | 'createdAt'>>;

/**
 * Custom error class for user service operations
 */
export class UserServiceError extends Error {
  constructor(
    public code: string,
    message: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'UserServiceError';
  }
}

/**
 * Firestore collection reference for users
 */
const USERS_COLLECTION = 'users';

/**
 * Get the users collection reference
 * @returns Firestore collection reference
 */
const getUsersCollection = () => collection(db, USERS_COLLECTION);

/**
 * Create a new user document if it doesn't already exist
 * Prevents duplicate users by checking if UID already exists
 *
 * @param uid - User's unique identifier from Firebase Auth
 * @param data - User data to be stored
 * @returns Promise<User> - Created user document with metadata
 * @throws UserServiceError if operation fails
 *
 * @example
 * const newUser = await createUserIfNotExists('user123', {
 *   phone: '+919876543210',
 *   name: 'John Doe',
 *   bloodGroup: 'O+',
 *   city: 'Mumbai',
 *   available: true,
 * });
 */
export async function createUserIfNotExists(
  uid: string,
  data: UserCreateData
): Promise<User> {
  try {
    // Validate input
    if (!uid || typeof uid !== 'string') {
      throw new UserServiceError(
        'INVALID_UID',
        'UID must be a non-empty string'
      );
    }

    if (!data.phone?.trim()) {
      throw new UserServiceError(
        'INVALID_PHONE',
        'Phone number is required'
      );
    }

    if (!data.name?.trim()) {
      throw new UserServiceError('INVALID_NAME', 'Name is required');
    }

    if (!data.bloodGroup?.trim()) {
      throw new UserServiceError(
        'INVALID_BLOOD_GROUP',
        'Blood group is required'
      );
    }

    if (!data.city?.trim()) {
      throw new UserServiceError('INVALID_CITY', 'City is required');
    }

    // Check if user already exists
    const userDoc = doc(getUsersCollection(), uid);
    const existingUser = await getDoc(userDoc);

    if (existingUser.exists()) {
      // User already exists, return it
      return {
        uid,
        ...existingUser.data(),
      } as User;
    }

    // Create new user document
    const newUser: User = {
      uid,
      phone: data.phone.trim(),
      name: data.name.trim(),
      bloodGroup: data.bloodGroup.trim(),
      city: data.city.trim(),
      available: data.available ?? true,
      lastDonation: data.lastDonation ?? null,
      createdAt: Timestamp.now(),
    };

    await setDoc(userDoc, newUser);

    return newUser;
  } catch (error) {
    if (error instanceof UserServiceError) {
      throw error;
    }

    const firebaseError = error as FirebaseError;
    throw new UserServiceError(
      firebaseError.code || 'UNKNOWN_ERROR',
      `Failed to create user: ${firebaseError.message}`,
      firebaseError
    );
  }
}

/**
 * Retrieve a user document from Firestore
 *
 * @param uid - User's unique identifier
 * @returns Promise<User | null> - User document or null if not found
 * @throws UserServiceError if operation fails
 *
 * @example
 * const user = await getUser('user123');
 * if (user) {
 *   console.log(`User ${user.name} is available: ${user.available}`);
 * }
 */
export async function getUser(uid: string): Promise<User | null> {
  try {
    // Validate input
    if (!uid || typeof uid !== 'string') {
      throw new UserServiceError(
        'INVALID_UID',
        'UID must be a non-empty string'
      );
    }

    const userDoc = doc(getUsersCollection(), uid);
    const snapshot = await getDoc(userDoc);

    if (!snapshot.exists()) {
      return null;
    }

    return {
      uid,
      ...snapshot.data(),
    } as User;
  } catch (error) {
    if (error instanceof UserServiceError) {
      throw error;
    }

    const firebaseError = error as FirebaseError;
    throw new UserServiceError(
      firebaseError.code || 'UNKNOWN_ERROR',
      `Failed to fetch user: ${firebaseError.message}`,
      firebaseError
    );
  }
}

/**
 * Update user document with new data
 * Performs a partial update, only modifying provided fields
 *
 * @param uid - User's unique identifier
 * @param data - Partial user data to update
 * @returns Promise<User> - Updated user document
 * @throws UserServiceError if user not found or operation fails
 *
 * @example
 * const updatedUser = await updateUser('user123', {
 *   available: false,
 *   lastDonation: '2024-04-01',
 * });
 */
export async function updateUser(
  uid: string,
  data: Partial<UserUpdateData>
): Promise<User> {
  try {
    // Validate input
    if (!uid || typeof uid !== 'string') {
      throw new UserServiceError(
        'INVALID_UID',
        'UID must be a non-empty string'
      );
    }

    if (!data || Object.keys(data).length === 0) {
      throw new UserServiceError(
        'EMPTY_UPDATE',
        'Update data cannot be empty'
      );
    }

    const userDoc = doc(getUsersCollection(), uid);

    // Verify user exists
    const existingDoc = await getDoc(userDoc);
    if (!existingDoc.exists()) {
      throw new UserServiceError(
        'USER_NOT_FOUND',
        `User with UID ${uid} does not exist`
      );
    }

    // Prepare update data - filter out undefined values
    const updateData: Record<string, any> = {};
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        updateData[key] = value;
      }
    });

    // Prevent updating uid and createdAt
    if ('uid' in updateData) {
      delete updateData.uid;
    }
    if ('createdAt' in updateData) {
      delete updateData.createdAt;
    }

    // Trim string fields
    if (updateData.phone && typeof updateData.phone === 'string') {
      updateData.phone = updateData.phone.trim();
    }
    if (updateData.name && typeof updateData.name === 'string') {
      updateData.name = updateData.name.trim();
    }
    if (updateData.bloodGroup && typeof updateData.bloodGroup === 'string') {
      updateData.bloodGroup = updateData.bloodGroup.trim();
    }
    if (updateData.city && typeof updateData.city === 'string') {
      updateData.city = updateData.city.trim();
    }

    // Perform update
    await updateDoc(userDoc, updateData);

    // Fetch and return updated user
    const updatedSnapshot = await getDoc(userDoc);
    return {
      uid,
      ...updatedSnapshot.data(),
    } as User;
  } catch (error) {
    if (error instanceof UserServiceError) {
      throw error;
    }

    const firebaseError = error as FirebaseError;
    throw new UserServiceError(
      firebaseError.code || 'UNKNOWN_ERROR',
      `Failed to update user: ${firebaseError.message}`,
      firebaseError
    );
  }
}
