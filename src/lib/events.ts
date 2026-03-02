// Event system for cross-component data updates
// This allows CRUD operations to notify the dashboard to refresh

export type DataChangeEvent = CustomEvent<{
    entity: string;
    operation: 'create' | 'update' | 'delete';
    id?: string;
}>;

const DATA_CHANGE_EVENT = 'dataChange';

// Dispatch a data change event
export function emitDataChange(entity: string, operation: 'create' | 'update' | 'delete', id?: string) {
    const event = new CustomEvent(DATA_CHANGE_EVENT, {
        detail: { entity, operation, id }
    });
    window.dispatchEvent(event);
}

// Listen for data change events
export function onDataChange(callback: (event: DataChangeEvent) => void) {
    window.addEventListener(DATA_CHANGE_EVENT, callback as EventListener);
    return () => window.removeEventListener(DATA_CHANGE_EVENT, callback as EventListener);
}
