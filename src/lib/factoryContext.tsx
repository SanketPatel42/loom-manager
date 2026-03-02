import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// ── Factory Profile Interface ──────────────────────────────────────────────────
export interface FactoryProfile {
    id: string;
    name: string;
    location: string;
    description?: string;
    color: string; // Accent color for visual identification
    createdAt: string;
    lastAccessedAt: string;
    lastBackupAt?: string; // New field for backup tracking
}

// ── Context Interface ──────────────────────────────────────────────────────────
interface FactoryContextType {
    factories: FactoryProfile[];
    activeFactory: FactoryProfile | null;
    isFactorySelected: boolean;
    selectFactory: (id: string) => void;
    addFactory: (factory: Omit<FactoryProfile, 'id' | 'createdAt' | 'lastAccessedAt'>) => FactoryProfile;
    updateFactory: (id: string, updates: Partial<Omit<FactoryProfile, 'id' | 'createdAt'>>) => void;
    deleteFactory: (id: string) => void;
    markBackupAsComplete: (id: string) => void;
    logout: () => void;
    getStoragePrefix: () => string;
}

const FactoryContext = createContext<FactoryContextType | undefined>(undefined);

// ── Storage Keys (these are global, not per-factory) ───────────────────────────
const FACTORY_PROFILES_KEY = 'erp_factory_profiles';
const ACTIVE_FACTORY_KEY = 'erp_active_factory_id';

// ── Utility: Generate ID ───────────────────────────────────────────────────────
function generateId(): string {
    return `factory_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// ── Provider ───────────────────────────────────────────────────────────────────
export function FactoryProvider({ children }: { children: React.ReactNode }) {
    const [factories, setFactories] = useState<FactoryProfile[]>([]);
    const [activeFactoryId, setActiveFactoryId] = useState<string | null>(null);

    // Load factories from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(FACTORY_PROFILES_KEY);
            if (stored) {
                setFactories(JSON.parse(stored));
            }
            const activeId = localStorage.getItem(ACTIVE_FACTORY_KEY);
            if (activeId) {
                setActiveFactoryId(activeId);
            }
        } catch (error) {
            console.error('[FactoryContext] Failed to load factories:', error);
        }
    }, []);

    // Persist factories whenever they change
    useEffect(() => {
        if (factories.length > 0) {
            localStorage.setItem(FACTORY_PROFILES_KEY, JSON.stringify(factories));
        }
    }, [factories]);

    const activeFactory = factories.find(f => f.id === activeFactoryId) || null;
    const isFactorySelected = !!activeFactory;

    const selectFactory = useCallback((id: string) => {
        const factory = factories.find(f => f.id === id);
        if (factory) {
            setActiveFactoryId(id);
            localStorage.setItem(ACTIVE_FACTORY_KEY, id);
            // Update last accessed
            setFactories(prev => {
                const updated = prev.map(f =>
                    f.id === id ? { ...f, lastAccessedAt: new Date().toISOString() } : f
                );
                localStorage.setItem(FACTORY_PROFILES_KEY, JSON.stringify(updated));
                return updated;
            });
        }
    }, [factories]);

    const addFactory = useCallback((data: Omit<FactoryProfile, 'id' | 'createdAt' | 'lastAccessedAt'>): FactoryProfile => {
        const newFactory: FactoryProfile = {
            ...data,
            id: generateId(),
            createdAt: new Date().toISOString(),
            lastAccessedAt: new Date().toISOString(),
        };
        setFactories(prev => {
            const updated = [...prev, newFactory];
            localStorage.setItem(FACTORY_PROFILES_KEY, JSON.stringify(updated));
            return updated;
        });
        return newFactory;
    }, []);

    const updateFactory = useCallback((id: string, updates: Partial<Omit<FactoryProfile, 'id' | 'createdAt'>>) => {
        setFactories(prev => {
            const updated = prev.map(f => f.id === id ? { ...f, ...updates } : f);
            localStorage.setItem(FACTORY_PROFILES_KEY, JSON.stringify(updated));
            return updated;
        });
    }, []);

    const markBackupAsComplete = useCallback((id: string) => {
        setFactories(prev => {
            const updated = prev.map(f =>
                f.id === id ? { ...f, lastBackupAt: new Date().toISOString() } : f
            );
            localStorage.setItem(FACTORY_PROFILES_KEY, JSON.stringify(updated));
            return updated;
        });
    }, []);

    const deleteFactory = useCallback((id: string) => {
        // Also clean up data for this factory  
        const prefix = `${id}__`;
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(prefix)) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));

        setFactories(prev => {
            const updated = prev.filter(f => f.id !== id);
            localStorage.setItem(FACTORY_PROFILES_KEY, JSON.stringify(updated));
            return updated;
        });

        if (activeFactoryId === id) {
            setActiveFactoryId(null);
            localStorage.removeItem(ACTIVE_FACTORY_KEY);
        }
    }, [activeFactoryId]);

    const logout = useCallback(() => {
        setActiveFactoryId(null);
        localStorage.removeItem(ACTIVE_FACTORY_KEY);
    }, []);

    const getStoragePrefix = useCallback(() => {
        if (!activeFactoryId) return '';
        return `${activeFactoryId}__`;
    }, [activeFactoryId]);

    return (
        <FactoryContext.Provider value={{
            factories,
            activeFactory,
            isFactorySelected,
            selectFactory,
            addFactory,
            updateFactory,
            deleteFactory,
            markBackupAsComplete,
            logout,
            getStoragePrefix,
        }}>
            {children}
        </FactoryContext.Provider>
    );
}

// ── Hook ───────────────────────────────────────────────────────────────────────
export function useFactory() {
    const context = useContext(FactoryContext);
    if (!context) {
        throw new Error('useFactory must be used within a FactoryProvider');
    }
    return context;
}

// ── Standalone getter for storage layer (avoids circular deps) ─────────────────
export function getActiveFactoryPrefix(): string {
    const activeId = localStorage.getItem(ACTIVE_FACTORY_KEY);
    return activeId ? `${activeId}__` : '';
}
